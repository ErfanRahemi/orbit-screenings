import { NextRequest, NextResponse } from 'next/server';
import { updateSupportTicketStatus, deleteSupportTicket } from '@/lib/db';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (status !== 'pending' && status !== 'resolved') {
      return NextResponse.json({ success: false, error: 'وضعیت نامعتبر است.' }, { status: 400 });
    }

    const updated = updateSupportTicketStatus(id, status);
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error('Error updating ticket status:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'خطا در ویرایش وضعیت تیکت' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const success = deleteSupportTicket(id);
    if (!success) {
      return NextResponse.json({ success: false, error: 'تیکت مورد نظر یافت نشد.' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'تیکت با موفقیت حذف شد.' });
  } catch (error: any) {
    console.error('Error deleting ticket:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'خطا در حذف تیکت' },
      { status: 500 }
    );
  }
}
