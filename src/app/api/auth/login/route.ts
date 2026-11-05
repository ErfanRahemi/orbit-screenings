import { NextRequest, NextResponse } from 'next/server';
import { getAdminByUsername } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'لطفاً نام کاربری و رمز عبور را وارد نمایید.' },
        { status: 400 }
      );
    }

    const admin = getAdminByUsername(username);

    if (admin && admin.password === password) {
      const response = NextResponse.json({
        success: true,
        user: {
          id: admin.id,
          username: admin.username,
          name: admin.name,
          role: admin.role,
        },
        message: 'ورود موفقیت‌آمیز بود.',
      });

      response.cookies.set({
        name: 'orbit_admin_session',
        value: `token_${admin.id}`,
        path: '/',
        httpOnly: false,
        maxAge: 60 * 60 * 24 * 7,
      });

      return response;
    }

    return NextResponse.json(
      { success: false, error: 'نام کاربری یا رمز عبور اشتباه است.' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ success: false, error: 'خطای سرور' }, { status: 500 });
  }
}
