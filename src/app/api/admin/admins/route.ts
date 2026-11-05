import { NextRequest, NextResponse } from 'next/server';
import { getAdmins, createAdmin } from '@/lib/db';

export async function GET() {
  try {
    const admins = getAdmins().map(({ id, username, name, role, createdAt }) => ({
      id,
      username,
      name,
      role,
      createdAt,
    }));
    return NextResponse.json({ success: true, data: admins });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'خطا در دریافت لیست مدیران' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password, name, role } = body;

    if (!username || !password || !name) {
      return NextResponse.json(
        { success: false, error: 'تمامی فیلدهای نام کاربری، رمز عبور و نام الزامی هستند.' },
        { status: 400 }
      );
    }

    if (username.length < 3) {
      return NextResponse.json(
        { success: false, error: 'نام کاربری باید حداقل ۳ کاراکتر باشد.' },
        { status: 400 }
      );
    }

    if (password.length < 4) {
      return NextResponse.json(
        { success: false, error: 'رمز عبور باید حداقل ۴ کاراکتر باشد.' },
        { status: 400 }
      );
    }

    const created = createAdmin({
      username,
      password,
      name,
      role: role === 'superadmin' ? 'superadmin' : 'admin',
    });

    return NextResponse.json({
      success: true,
      data: {
        id: created.id,
        username: created.username,
        name: created.name,
        role: created.role,
        createdAt: created.createdAt,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'خطا در ایجاد مدیر جدید' },
      { status: 400 }
    );
  }
}
