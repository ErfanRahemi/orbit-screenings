import { NextRequest, NextResponse } from 'next/server';
import { getAdminById, updateAdmin } from '@/lib/db';

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { adminId, currentPassword, newUsername, newPassword, newName } = body;

    if (!adminId) {
      return NextResponse.json({ success: false, error: 'شناسه مدیر ارسال نشده است.' }, { status: 400 });
    }

    const currentAdmin = getAdminById(adminId);
    if (!currentAdmin) {
      return NextResponse.json({ success: false, error: 'حساب کاربری یافت نشد.' }, { status: 404 });
    }

    if (currentPassword && currentAdmin.password !== currentPassword) {
      return NextResponse.json({ success: false, error: 'رمز عبور فعلی نادرست است.' }, { status: 400 });
    }

    const updates: Partial<{ username: string; password: string; name: string }> = {};

    if (newUsername && newUsername.trim() !== currentAdmin.username) {
      if (newUsername.trim().length < 3) {
        return NextResponse.json({ success: false, error: 'نام کاربری باید حداقل ۳ کاراکتر باشد.' }, { status: 400 });
      }
      updates.username = newUsername.trim();
    }

    if (newPassword && newPassword.trim().length > 0) {
      if (newPassword.trim().length < 4) {
        return NextResponse.json({ success: false, error: 'رمز عبور جدید باید حداقل ۴ کاراکتر باشد.' }, { status: 400 });
      }
      updates.password = newPassword.trim();
    }

    if (newName && newName.trim().length > 0) {
      updates.name = newName.trim();
    }

    const updated = updateAdmin(adminId, updates);

    return NextResponse.json({
      success: true,
      data: {
        id: updated.id,
        username: updated.username,
        name: updated.name,
        role: updated.role,
      },
      message: 'مشخصات حساب کاربری با موفقیت به‌روزرسانی شد.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'خطا در به‌روزرسانی اطلاعات حساب' },
      { status: 400 }
    );
  }
}
