import { NextRequest, NextResponse } from 'next/server';
import { getBookings, createBooking, validateBookingSeats } from '@/lib/db';
import { validateIranianMobile, normalizeIranianMobile } from '@/lib/utils';
import { createVarizaPayment } from '@/lib/variza';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const screeningId = searchParams.get('screeningId') || undefined;
    const query = searchParams.get('query') || undefined;
    const bookings = getBookings(screeningId, query);
    return NextResponse.json({ success: true, data: bookings });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { success: false, error: 'خطا در دریافت لیست رزروها' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { screeningId, buyerName, buyerPhone, seatIds } = body;

    if (
      !screeningId ||
      !buyerName ||
      !buyerPhone ||
      !seatIds ||
      !Array.isArray(seatIds) ||
      seatIds.length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error: 'لطفاً نام، شماره موبایل و حداقل یک صندلی را وارد نمایید.',
        },
        { status: 400 }
      );
    }

    if (!validateIranianMobile(buyerPhone)) {
      return NextResponse.json(
        {
          success: false,
          error: 'فرمت شماره موبایل صحیح نیست (مثال: ۰۹۱۲۳۴۵۶۷۸۹).',
        },
        { status: 400 }
      );
    }

    const normalizedPhone = normalizeIranianMobile(buyerPhone);

    // 1. Validate seat availability and calculate total amount before calling gateway
    const { screening, totalAmount, seatDetails } = validateBookingSeats(
      screeningId,
      seatIds
    );

    if (screening.isSoldOut) {
      return NextResponse.json(
        {
          success: false,
          error: 'فروش بلیت برای این رویداد به دلیل تکمیل ظرفیت متوقف شده است (Sold Out).',
        },
        { status: 400 }
      );
    }

    const bookingId = `ORB-${Math.floor(100000 + Math.random() * 900000)}`;
    const seatLabels = seatDetails
      .map((s) => `${s.rowLabel}${s.seatNumber}`)
      .join(', ');
    const paymentTitle = `بلیت سینما اوربیت: ${screening.titleFa} (${seatLabels}) - کد ${bookingId}`;

    // 2. Create real payment link via Variza API
    const proto = request.headers.get('x-forwarded-proto') || 'https';
    const host =
      request.headers.get('x-forwarded-host') || request.headers.get('host');
    const requestOrigin =
      request.headers.get('origin') ||
      (host ? `${proto}://${host}` : new URL(request.url).origin);

    const varizaLink = await createVarizaPayment({
      bookingId,
      amount: totalAmount,
      title: paymentTitle,
      buyerPhone: normalizedPhone,
      requestOrigin,
    });

    // 3. Persist pending reservation and lock seats for 30 minutes
    const booking = createBooking({
      id: bookingId,
      screeningId,
      buyerName: buyerName.trim(),
      buyerPhone: normalizedPhone,
      seatIds,
      status: 'pending',
      varizaSlug: varizaLink.slug,
      varizaPayUrl: varizaLink.payUrl,
      expiresAt: varizaLink.expiresAt,
      paymentRef: `VRZ-${varizaLink.slug}`,
    });

    return NextResponse.json({
      success: true,
      data: booking,
      payUrl: varizaLink.payUrl,
      slug: varizaLink.slug,
      expiresAt: varizaLink.expiresAt,
    });
  } catch (error: any) {
    console.error('Error creating booking & Variza payment:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'خطا در ثبت رزرو و اتصال به درگاه پرداخت واریزا',
      },
      { status: 400 }
    );
  }
}
