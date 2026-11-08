import { NextRequest, NextResponse } from 'next/server';
import {
  VarizaClient,
  Expiry,
  verify,
  VarizaPaymentEvent,
  ApiError,
  VarizaError,
} from '@the6fallenangel/variza-node-sdk';
import { confirmBookingByVarizaWebhook, getSiteSettings } from '@/lib/db';

function sanitizeEnvUrl(val: string | undefined, fallback: string): string {
  if (!val) return fallback;
  const trimmed = val.trim();
  // Strip accidental markdown link formatting like [https://...](https://...)
  const mdMatch = trimmed.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
  if (mdMatch) {
    return mdMatch[2].trim().replace(/\/+$/, '');
  }
  return trimmed.replace(/\/+$/, '');
}

export function getVarizaConfig(requestOrigin?: string) {
  let dbSettings: any = {};
  try {
    dbSettings = getSiteSettings() || {};
  } catch (e) {
    // fallback if db is not ready
  }

  const apiKey = (
    dbSettings.varizaApiKey ||
    process.env.VARIZA_API_KEY ||
    '897|DiZJEeKglXsNRb9wRpdeNnV6Hw7F04UvkhtrfAZ4a875a32e'
  ).trim();
  const webhookSecret = (
    dbSettings.varizaWebhookSecret ||
    process.env.VARIZA_WEBHOOK_SECRET ||
    'whsec_b3jPgbDnSLYgMT73yHx3RmuCcpLEpLvxOVTaRfD4'
  ).trim();
  const cardLast4 = (
    dbSettings.varizaCardLast4 ||
    process.env.VARIZA_CARD_LAST_4 ||
    '8589'
  ).trim();
  const baseUrl = sanitizeEnvUrl(
    process.env.VARIZA_BASE_URL,
    'https://variza.ir/api/v1'
  );

  const rawDbUrl = sanitizeEnvUrl(dbSettings.appUrl, '');
  const rawEnvUrl = sanitizeEnvUrl(process.env.APP_URL, '');
  const cleanDbUrl =
    rawDbUrl && !rawDbUrl.includes('small-crabs-say.loca.lt') ? rawDbUrl : '';
  const cleanEnvUrl =
    rawEnvUrl && !rawEnvUrl.includes('small-crabs-say.loca.lt') ? rawEnvUrl : '';
  const cleanOrigin = sanitizeEnvUrl(requestOrigin, '');

  const appUrl =
    cleanDbUrl ||
    cleanEnvUrl ||
    cleanOrigin ||
    'http://localhost:3000';

  const seatHoldMinutes = Number(dbSettings.seatHoldMinutes) || 30;
  const paymentExpiresIn = dbSettings.paymentExpiresIn || '30m';

  return {
    apiKey,
    webhookSecret,
    cardLast4,
    baseUrl,
    appUrl,
    seatHoldMinutes,
    paymentExpiresIn,
  };
}

export function createVarizaClient(): VarizaClient {
  const config = getVarizaConfig();
  return new VarizaClient({
    token: config.apiKey,
    baseUrl: config.baseUrl,
  });
}

export interface CreateVarizaPaymentInput {
  bookingId: string;
  amount: number;
  title: string;
  buyerPhone?: string;
  requestOrigin?: string;
}

export interface CreateVarizaPaymentResult {
  slug: string;
  payUrl: string;
  amount: number;
  title: string | null;
  returnUrl: string;
  expiresAt: string;
}

export async function createVarizaPayment(
  input: CreateVarizaPaymentInput
): Promise<CreateVarizaPaymentResult> {
  const config = getVarizaConfig(input.requestOrigin);
  const client = createVarizaClient();

  const returnUrl = `${config.appUrl}/payment/callback?bookingId=${encodeURIComponent(
    input.bookingId
  )}`;

  try {
    const link = await client.pay({
      amount: input.amount,
      returnUrl,
      title: input.title.slice(0, 255),
      cardLast4: config.cardLast4,
      expiresIn: (config.paymentExpiresIn as any) || Expiry.ThirtyMinutes,
    });

    const holdMs = (config.seatHoldMinutes || 30) * 60 * 1000;
    const expiresAtIso =
      link.expiresAt && !isNaN(new Date(link.expiresAt).getTime())
        ? new Date(link.expiresAt).toISOString()
        : new Date(Date.now() + holdMs).toISOString();

    return {
      slug: link.slug,
      payUrl: link.payUrl,
      amount: link.amount,
      title: link.title,
      returnUrl: link.returnUrl || returnUrl,
      expiresAt: expiresAtIso,
    };
  } catch (err: any) {
    if (err instanceof ApiError) {
      console.error('[Variza SDK ApiError]', {
        message: err.message,
        status: err.status,
        errors: err.errors,
        responseBody: err.responseBody,
      });
      throw new Error(
        `خطا در اتصال به درگاه پرداخت واریزا: ${err.message}`
      );
    }
    if (err instanceof VarizaError) {
      console.error('[Variza SDK Error]', err.message);
      throw new Error(
        `خطا در پردازش درگاه واریزا: ${err.message}`
      );
    }
    console.error('[Variza Network Error]', err);
    throw new Error(
      err?.message || 'خطا در برقراری ارتباط با درگاه پرداخت واریزا'
    );
  }
}

export async function handleVarizaWebhookRequest(
  request: NextRequest
): Promise<NextResponse> {
  try {
    const config = getVarizaConfig();
    const rawBody = await request.text();

    if (!rawBody) {
      return NextResponse.json(
        { success: false, error: 'Empty webhook payload' },
        { status: 400 }
      );
    }

    const signatureHeader =
      request.headers.get('x-webhook-signature') ||
      request.headers.get('X-Webhook-Signature') ||
      request.headers.get('x-variza-signature') ||
      '';

    if (!signatureHeader) {
      return NextResponse.json(
        { success: false, error: 'Missing X-Webhook-Signature header' },
        { status: 401 }
      );
    }

    const isValid = verify(rawBody, signatureHeader, config.webhookSecret);
    if (!isValid) {
      console.warn('[Variza Webhook] Invalid HMAC signature rejected.');
      return NextResponse.json(
        { success: false, error: 'Invalid webhook signature' },
        { status: 401 }
      );
    }

    const event = VarizaPaymentEvent.fromJson(rawBody);

    if (!event.slug) {
      return NextResponse.json(
        { success: false, error: 'Missing payment link slug in webhook payload' },
        { status: 400 }
      );
    }

    if (event.isPaymentPaid() && event.isPaid()) {
      const result = confirmBookingByVarizaWebhook({
        slug: event.slug,
        attemptCode: event.attemptCode,
        amount: event.amount,
        sentAt: event.sentAt,
        memberPhone: event.memberPhone,
      });

      if (!result.booking) {
        console.warn(
          `[Variza Webhook] Payment event received for unknown slug: ${event.slug}`
        );
        return NextResponse.json(
          {
            received: true,
            success: true,
            bookingFound: false,
            slug: event.slug,
          },
          { status: 200 }
        );
      }

      return NextResponse.json(
        {
          received: true,
          success: true,
          bookingFound: true,
          alreadyProcessed: result.alreadyProcessed,
          bookingId: result.booking.id,
          status: result.booking.status,
          attemptCode: result.booking.attemptCode,
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        received: true,
        success: true,
        ignored: true,
        event: event.event,
        status: event.status,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[Variza Webhook Handler Error]', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Webhook processing error' },
      { status: 400 }
    );
  }
}
