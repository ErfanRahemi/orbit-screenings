import { NextRequest, NextResponse } from 'next/server';
import { updateSupportTicketStatus, deleteSupportTicket } from '@/lib/db';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { status } = body;

    if (status !== 'pending' && status !== 'resolved') {
      return NextResponse.json({ success: false, error: 'وضعیت نامعتبر است.' }, { status: 400 });
    }

    const updated = updateSupportTicketStatus(params.id, status);
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
  { params }: { params: { id: string } }
) {
  try {
    const success = deleteSupportTicket(params.id);
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
