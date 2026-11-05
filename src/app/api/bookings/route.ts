import { NextRequest, NextResponse } from 'next/server';
import { getBookings, createBooking } from '@/lib/db';
import { validateIranianMobile, normalizeIranianMobile } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const screeningId = searchParams.get('screeningId') || undefined;
    const query = searchParams.get('query') || undefined;
    const bookings = getBookings(screeningId, query);
    return NextResponse.json({ success: true, data: bookings });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json({ success: false, error: 'خطا در دریافت لیست رزروها' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { screeningId, buyerName, buyerPhone, seatIds } = body;

    if (!screeningId || !buyerName || !buyerPhone || !seatIds || !Array.isArray(seatIds) || seatIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'لطفاً نام، شماره موبایل و حداقل یک صندلی را وارد نمایید.' },
        { status: 400 }
      );
    }

    if (!validateIranianMobile(buyerPhone)) {
      return NextResponse.json(
        { success: false, error: 'فرمت شماره موبایل صحیح نیست (مثال: ۰۹۱۲۳۴۵۶۷۸۹).' },
        { status: 400 }
      );
    }

    const normalizedPhone = normalizeIranianMobile(buyerPhone);

    const booking = createBooking({
      screeningId,
      buyerName: buyerName.trim(),
      buyerPhone: normalizedPhone,
      seatIds,
    });

    return NextResponse.json({ success: true, data: booking });
  } catch (error: any) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'خطا در ثبت رزرو و خرید بلیت' },
      { status: 400 }
    );
  }
}
