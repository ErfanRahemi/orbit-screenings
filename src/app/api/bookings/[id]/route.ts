import { NextRequest, NextResponse } from 'next/server';
import { getBookingById, getBookingBySlug, deleteBooking } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const booking = getBookingById(params.id) || getBookingBySlug(params.id);
    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'بلیت با این کد پیگیری یافت نشد.' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: booking });
  } catch (error) {
    console.error('Error fetching booking by id:', error);
    return NextResponse.json(
      { success: false, error: 'خطا در استعلام بلیت' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const success = deleteBooking(params.id);
    if (!success) {
      return NextResponse.json(
        { success: false, error: 'رزرو یا بلیت یافت نشد.' },
        { status: 404 }
      );
    }
    return NextResponse.json({
      success: true,
      message: 'رزرو با موفقیت حذف و صندلی‌ها آزاد شدند.',
    });
  } catch (error: any) {
    console.error('Error deleting booking:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'خطا در حذف رزرو و تماشاچی' },
      { status: 400 }
    );
  }
}
