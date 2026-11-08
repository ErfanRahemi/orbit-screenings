import { NextRequest, NextResponse } from 'next/server';
import { getScreenings, createScreening } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city') || undefined;
    const screenings = getScreenings(city);
    return NextResponse.json({ success: true, data: screenings });
  } catch (error) {
    console.error('Error fetching screenings:', error);
    return NextResponse.json({ success: false, error: 'خطا در دریافت لیست اکران‌ها' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.titleFa || !body.city || !body.venueName) {
      return NextResponse.json({ success: false, error: 'اطلاعات ضروری اکران ناقص است.' }, { status: 400 });
    }

    const created = createScreening(body);
    return NextResponse.json({ success: true, data: created });
  } catch (error) {
    console.error('Error creating screening:', error);
    return NextResponse.json({ success: false, error: 'خطا در ثبت اکران جدید' }, { status: 500 });
  }
}
