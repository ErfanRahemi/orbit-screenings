import { NextRequest, NextResponse } from 'next/server';
import { getSiteSettings, updateSiteSettings } from '@/lib/db';

export async function GET() {
  try {
    const settings = getSiteSettings();
    return NextResponse.json({ success: true, data: settings });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'خطا در دریافت تنظیمات' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const updated = updateSiteSettings(body);
    return NextResponse.json({ success: true, data: updated, message: 'تنظیمات با موفقیت ذخیره شد.' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'خطا در به‌روزرسانی تنظیمات' },
      { status: 400 }
    );
  }
}
