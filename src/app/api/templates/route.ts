import { NextRequest, NextResponse } from 'next/server';
import { getVenueTemplates, saveVenueTemplate, deleteVenueTemplate } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const templates = getVenueTemplates();
    return NextResponse.json({ success: true, data: templates });
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json({ success: false, error: 'خطا در دریافت الگوهای سالن' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.name || !body.rows || !body.cols) {
      return NextResponse.json({ success: false, error: 'مشخصات الگوی سالن کامل نیست.' }, { status: 400 });
    }
    const template = saveVenueTemplate(body);
    return NextResponse.json({ success: true, data: template });
  } catch (error) {
    console.error('Error saving template:', error);
    return NextResponse.json({ success: false, error: 'خطا در ذخیره الگوی سالن' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'شناسه الگو ارسال نشده است.' }, { status: 400 });
    }
    const deleted = deleteVenueTemplate(id);
    return NextResponse.json({ success: deleted });
  } catch (error) {
    console.error('Error deleting template:', error);
    return NextResponse.json({ success: false, error: 'خطا در حذف الگو' }, { status: 500 });
  }
}
