import { NextRequest, NextResponse } from 'next/server';
import { deleteAdmin } from '@/lib/db';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const success = deleteAdmin(id);
    if (!success) {
      return NextResponse.json({ success: false, error: 'مدیر برای حذف یافت نشد.' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'خطا در حذف مدیر' },
      { status: 400 }
    );
  }
}
