import { NextRequest, NextResponse } from 'next/server';
import { toggleSeatAdminHold, batchSetSeatsAdminHold } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { seatId, seatIds, hold } = body;

    if (seatId) {
      const result = toggleSeatAdminHold(params.id, seatId);
      const msg =
        result.action === 'blocked'
          ? 'صندلی با موفقیت غیرقابل فروش شد (به عنوان پر شده به مشتریان نمایش داده می‌شود).'
          : 'صندلی با موفقیت آزاد و مجدداً قابل خرید شد.';
      return NextResponse.json({
        success: true,
        message: msg,
        action: result.action,
        data: result.screening,
      });
    }

    if (Array.isArray(seatIds) && seatIds.length > 0) {
      const isHold = hold !== false;
      const result = batchSetSeatsAdminHold(params.id, seatIds, isHold);
      const msg = isHold
        ? `${result.updatedCount} صندلی با موفقیت غیرقابل فروش شدند.`
        : `${result.updatedCount} صندلی با موفقیت آزاد شدند.`;
      return NextResponse.json({
        success: true,
        message: msg,
        updatedCount: result.updatedCount,
        data: result.screening,
      });
    }

    return NextResponse.json(
      { success: false, error: 'شناسه صندلی ارسال نشده است.' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Error toggling seat hold:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'خطا در تغییر وضعیت صندلی' },
      { status: 400 }
    );
  }
}
