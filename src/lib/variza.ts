import { NextRequest, NextResponse } from 'next/server';
import {
  VarizaClient,
  Expiry,
  verify,
  VarizaPaymentEvent,
  ApiError,
  ValidationError,
  RateLimitError,
  VarizaError,
} from '@the6fallenangel/variza-node-sdk';
import { confirmBookingByVarizaWebhook, getSiteSettings } from '@/lib/db';

const DEFAULT_API_KEY = '897|DiZJEeKglXsNRb9wRpdeNnV6Hw7F04UvkhtrfAZ4a875a32e';
const DEFAULT_WEBHOOK_SECRET = 'whsec_b3jPgbDnSLYgMT73yHx3RmuCcpLEpLvxOVTaRfD4';
const DEFAULT_CARD_LAST_4 = '8589';
const DEFAULT_BASE_URL = 'https://variza.ir/api/v1';

function cleanSecretOrToken(val: string | undefined, fallback: string): string {
  if (!val) return fallback;
  return val
    .trim()
    .replace(/^["']+|["']+$/g, '')
    .trim();
}

function sanitizeEnvUrl(val: string | undefined, fallback: string): string {
  if (!val) return fallback;
  let trimmed = val
    .trim()
    .replace(/^["']+|["']+$/g, '')
    .trim();
  // Strip accidental markdown link formatting like [https://...](https://...)
  const mdMatch = trimmed.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
  if (mdMatch) {
    trimmed = mdMatch[2].trim();
  }
  return trimmed.replace(/\/+$/, '');
}

function normalizeReturnBaseUrl(url: string): string {
  if (!url) return 'https://orbit-screenings.liara.run';
  let cleaned = sanitizeEnvUrl(url, '');
  if (!cleaned) return 'https://orbit-screenings.liara.run';

  // Ensure protocol exists
  if (!/^https?:\/\//i.test(cleaned)) {
    cleaned = `https://${cleaned}`;
  }

  // Variza API requires an HTTPS return_url
  if (cleaned.startsWith('http://') && !cleaned.includes('localhost') && !cleaned.includes('127.0.0.1')) {
    cleaned = cleaned.replace(/^http:\/\//i, 'https://');
  }

  return cleaned.replace(/\/+$/, '');
}

export function getVarizaConfig(requestOrigin?: string) {
  let dbSettings: any = {};
  try {
    dbSettings = getSiteSettings() || {};
  } catch {
    // fallback if db is not ready
  }

  const apiKey = cleanSecretOrToken(
    dbSettings.varizaApiKey || process.env.VARIZA_API_KEY,
    DEFAULT_API_KEY
  );
  const webhookSecret = cleanSecretOrToken(
    dbSettings.varizaWebhookSecret || process.env.VARIZA_WEBHOOK_SECRET,
    DEFAULT_WEBHOOK_SECRET
  );
  const cardLast4 = cleanSecretOrToken(
    dbSettings.varizaCardLast4 ?? process.env.VARIZA_CARD_LAST_4,
    DEFAULT_CARD_LAST_4
  );
  const baseUrl = sanitizeEnvUrl(
    process.env.VARIZA_BASE_URL,
    DEFAULT_BASE_URL
  );

  const rawDbUrl = sanitizeEnvUrl(dbSettings.appUrl, '');
  const rawEnvUrl = sanitizeEnvUrl(process.env.APP_URL, '');
  const cleanDbUrl =
    rawDbUrl &&
    !rawDbUrl.includes('small-crabs-say.loca.lt') &&
    !rawDbUrl.includes('localhost')
      ? rawDbUrl
      : '';
  const cleanEnvUrl =
    rawEnvUrl &&
    !rawEnvUrl.includes('small-crabs-say.loca.lt') &&
    !rawEnvUrl.includes('localhost')
      ? rawEnvUrl
      : '';
  const cleanOrigin = sanitizeEnvUrl(requestOrigin, '');

  const appUrl = normalizeReturnBaseUrl(
    cleanDbUrl || cleanEnvUrl || cleanOrigin || rawDbUrl || rawEnvUrl
  );

  const seatHoldMinutes = Number(dbSettings.seatHoldMinutes) || 30;
  const paymentExpiresIn = dbSettings.paymentExpiresIn || '30m';

  const candidateSecrets = Array.from(
    new Set(
      [
        cleanSecretOrToken(dbSettings.varizaWebhookSecret, ''),
        cleanSecretOrToken(process.env.VARIZA_WEBHOOK_SECRET, ''),
        DEFAULT_WEBHOOK_SECRET,
      ].filter(Boolean)
    )
  );

  return {
    apiKey,
    webhookSecret,
    candidateSecrets,
    cardLast4,
    baseUrl,
    appUrl,
    seatHoldMinutes,
    paymentExpiresIn,
  };
}

export function createVarizaClient(requestOrigin?: string): VarizaClient {
  const config = getVarizaConfig(requestOrigin);
  return new VarizaClient({
    token: config.apiKey,
    baseUrl: config.baseUrl,
    timeoutMs: 15000,
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
  if (!input.amount || input.amount < 1000) {
    throw new Error('مبلغ قابل پرداخت در درگاه واریزا باید حداقل ۱,۰۰۰ تومان باشد.');
  }

  const config = getVarizaConfig(input.requestOrigin);
  const client = createVarizaClient(input.requestOrigin);

  // Variza requires return_url to start with https://
  let returnBase = config.appUrl;
  if (returnBase.startsWith('http://')) {
    returnBase = returnBase.replace(/^http:\/\//i, 'https://');
  }

  const returnUrl = `${returnBase}/payment/callback?bookingId=${encodeURIComponent(
    input.bookingId
  )}`;

  const payPayload: any = {
    amount: Math.round(input.amount),
    returnUrl,
    title: input.title.slice(0, 255),
    expiresIn: (config.paymentExpiresIn as any) || Expiry.ThirtyMinutes,
  };

  if (config.cardLast4) {
    payPayload.cardLast4 = config.cardLast4;
  }

  try {
    let link;
    try {
      link = await client.pay(payPayload);
    } catch (firstErr: any) {
      // If card_last_4 caused a 422 validation error, retry without cardLast4 so Variza uses the default active card
      if (
        firstErr instanceof ValidationError &&
        payPayload.cardLast4 &&
        (firstErr.errors?.card_last_4 ||
          firstErr.responseBody?.includes('card_last_4'))
      ) {
        console.warn(
          `[Variza] cardLast4 "${payPayload.cardLast4}" rejected by Variza, retrying with default active card...`
        );
        const { cardLast4: _removed, ...fallbackPayload } = payPayload;
        link = await client.pay(fallbackPayload);
      } else {
        throw firstErr;
      }
    }

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
    if (err instanceof ValidationError) {
      console.error('[Variza ValidationError 422]', {
        message: err.message,
        errors: err.errors,
        responseBody: err.responseBody,
      });
      const details = Object.values(err.errors || {})
        .flat()
        .join(' | ');
      throw new Error(
        `خطای اعتبارسنجی درگاه واریزا: ${details || err.message}`
      );
    }
    if (err instanceof RateLimitError) {
      throw new Error(
        'تعداد درخواست‌ها به درگاه واریزا بیش از حد مجاز است. لطفاً چند ثانیه دیگر تلاش کنید.'
      );
    }
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
      throw new Error(`خطا در پردازش درگاه واریزا: ${err.message}`);
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

    const signatureHeader = (
      request.headers.get('x-webhook-signature') ||
      request.headers.get('X-Webhook-Signature') ||
      request.headers.get('x-variza-signature') ||
      request.headers.get('x-signature') ||
      ''
    ).trim();

    if (!signatureHeader) {
      return NextResponse.json(
        { success: false, error: 'Missing X-Webhook-Signature header' },
        { status: 401 }
      );
    }

    const isValid = config.candidateSecrets.some((secret) => {
      try {
        return verify(rawBody, signatureHeader, secret);
      } catch {
        return false;
      }
    });

    if (!isValid) {
      console.warn('[Variza Webhook] Invalid HMAC signature rejected.');
      return NextResponse.json(
        { success: false, error: 'Invalid webhook signature' },
        { status: 401 }
      );
    }

    let event: VarizaPaymentEvent;
    try {
      const parsedRaw = JSON.parse(rawBody);
      const normalizedJson =
        parsedRaw && typeof parsedRaw.data === 'object' && !parsedRaw.slug
          ? JSON.stringify({
              event: parsedRaw.event || 'payment.paid',
              ...parsedRaw.data,
            })
          : rawBody;
      event = VarizaPaymentEvent.fromJson(normalizedJson);
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON in webhook body' },
        { status: 400 }
      );
    }

    if (!event.slug) {
      return NextResponse.json(
        { success: false, error: 'Missing payment link slug in webhook payload' },
        { status: 400 }
      );
    }

    if (event.isPaymentPaid() || event.isPaid()) {
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
