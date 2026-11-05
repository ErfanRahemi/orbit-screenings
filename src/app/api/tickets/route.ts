import { NextRequest, NextResponse } from 'next/server';
import { getSupportTickets, createSupportTicket } from '@/lib/db';

export async function GET() {
  try {
    const tickets = getSupportTickets();
    return NextResponse.json({ success: true, data: tickets });
  } catch (error) {
    console.error('Error fetching tickets:', error);
    return NextResponse.json({ success: false, error: 'خطا در بارگذاری تیکت‌ها' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, phone, ticketId, subject, message } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ success: false, error: 'وارد کردن نام و نام خانوادگی الزامی است.' }, { status: 400 });
    }
    if (!phone || !phone.trim()) {
      return NextResponse.json({ success: false, error: 'وارد کردن شماره تماس الزامی است.' }, { status: 400 });
    }
    if (!subject || !subject.trim()) {
      return NextResponse.json({ success: false, error: 'وارد کردن موضوع پیام الزامی است.' }, { status: 400 });
    }
    if (!message || !message.trim()) {
      return NextResponse.json({ success: false, error: 'شرح پیام نمی‌تواند خالی باشد.' }, { status: 400 });
    }

    const newTicket = createSupportTicket({
      name,
      phone,
      ticketId,
      subject,
      message,
    });

    return NextResponse.json({
      success: true,
      message: 'تیکت پشتیبانی شما با موفقیت ثبت شد.',
      data: newTicket,
    });
  } catch (error: any) {
    console.error('Error creating ticket:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'خطا در ثبت تیکت پشتیبانی' },
      { status: 500 }
    );
  }
}
