import { NextRequest, NextResponse } from 'next/server';
import { getScreeningById, updateScreening, deleteScreening } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const screening = getScreeningById(id);
    if (!screening) {
      return NextResponse.json({ success: false, error: 'اکران مورد نظر یافت نشد' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: screening });
  } catch (error) {
    console.error('Error fetching screening by id:', error);
    return NextResponse.json({ success: false, error: 'خطا در دریافت اطلاعات اکران' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const updated = updateScreening(id, body);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'اکران برای ویرایش یافت نشد' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating screening:', error);
    return NextResponse.json({ success: false, error: 'خطا در به‌روزرسانی اکران' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const success = deleteScreening(id);
    if (!success) {
      return NextResponse.json({ success: false, error: 'اکران برای حذف یافت نشد' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting screening:', error);
    return NextResponse.json({ success: false, error: 'خطا در حذف اکران' }, { status: 500 });
  }
}
