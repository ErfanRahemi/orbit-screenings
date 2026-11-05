'use client';

import React, { useState, useEffect } from 'react';
import { AdminUser } from '@/types';
import { toPersianDigits } from '@/lib/utils';
import {
  UserCheck,
  UserPlus,
  KeyRound,
  Shield,
  Trash2,
  Lock,
  User,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Save,
  Crown,
} from 'lucide-react';

interface AdminAccountsManagerProps {
  currentAdminUser: { id: string; username: string; name: string; role: string } | null;
  onUpdateCurrentUser: (updated: { id: string; username: string; name: string; role: string }) => void;
}

export default function AdminAccountsManager({
  currentAdminUser,
  onUpdateCurrentUser,
}: AdminAccountsManagerProps) {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  const [profileName, setProfileName] = useState(currentAdminUser?.name || '');
  const [profileUsername, setProfileUsername] = useState(currentAdminUser?.username || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminUsername, setNewAdminUsername] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [newAdminRole, setNewAdminRole] = useState<'admin' | 'superadmin'>('admin');
  const [createLoading, setCreateLoading] = useState(false);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);

  useEffect(() => {
    loadAdmins();
    if (currentAdminUser) {
      setProfileName(currentAdminUser.name);
      setProfileUsername(currentAdminUser.username);
    }
  }, [currentAdminUser]);

  async function loadAdmins() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/admins');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setAdmins(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    setProfileSuccess(null);
    setProfileLoading(true);

    try {
      const res = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminId: currentAdminUser?.id,
          currentPassword: currentPassword.trim(),
          newUsername: profileUsername.trim(),
          newPassword: newPassword.trim() || undefined,
          newName: profileName.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setProfileSuccess(data.message || 'مشخصات شما با موفقیت تغییر یافت.');
        setCurrentPassword('');
        setNewPassword('');
        if (data.data) {
          onUpdateCurrentUser(data.data);
        }
        loadAdmins();
      } else {
        setProfileError(data.error || 'خطا در به‌روزرسانی مشخصات');
      }
    } catch (e) {
      setProfileError('خطای برقراری ارتباط با سرور.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    setCreateSuccess(null);
    setCreateLoading(true);

    try {
      const res = await fetch('/api/admin/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: newAdminUsername.trim(),
          password: newAdminPassword.trim(),
          name: newAdminName.trim(),
          role: newAdminRole,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setCreateSuccess(`مدیر جدید با نام کاربری «${newAdminUsername}» ایجاد شد.`);
        setNewAdminName('');
        setNewAdminUsername('');
        setNewAdminPassword('');
        loadAdmins();
      } else {
        setCreateError(data.error || 'خطا در ایجاد مدیر');
      }
    } catch (e) {
      setCreateError('خطای برقراری ارتباط با سرور.');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDeleteAdmin = async (id: string, name: string) => {
    if (id === currentAdminUser?.id) {
      alert('شما نمی‌توانید حساب کاربری خودتان را حذف کنید.');
      return;
    }

    if (!confirm(`آیا از حذف دسترسی مدیر «${name}» اطمینان کامل دارید؟`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/admins/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        loadAdmins();
      } else {
        alert(data.error || 'خطا در حذف مدیر');
      }
    } catch (e) {
      alert('خطای اتصال به سرور');
    }
  };

  return (
    <div className="space-y-8">
      <div className="p-6 rounded-3xl bg-[#12131A] border border-white/10 flex items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#3A86FF]" />
            مدیریت مدیران سامانه و تنظیمات حساب کاربری
          </h3>
          <p className="text-xs text-slate-400">
            تغییر نام کاربری و کلمه عبور خود، افزودن ادمین‌های جدید و مدیریت دسترسی‌های پنل
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-6 space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-[#12131A] border border-white/10 shadow-xl space-y-6">
            <div className="space-y-1 border-b border-white/10 pb-4">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-[#00F0FF]" />
                تغییر نام کاربری و رمز عبور من
              </h4>
              <p className="text-xs text-slate-400">
                هر ادمین می‌تواند نام نمایشی، نام کاربری و کلمه عبور اختصاصی خود را در این بخش تغییر دهد.
              </p>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#3A86FF]" />
                  <span>نام و نام خانوادگی نمایشی</span>
                </label>
                <input
                  type="text"
                  required
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white focus:outline-none focus:border-[#3A86FF]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-[#00F0FF]" />
                  <span>نام کاربری جدید من (جهت لاگین)</span>
                </label>
                <input
                  type="text"
                  required
                  dir="ltr"
                  value={profileUsername}
                  onChange={(e) => setProfileUsername(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white font-mono focus:outline-none focus:border-[#3A86FF]"
                />
              </div>

              <div className="space-y-1.5 pt-2">
                <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-yellow-400" />
                  <span>رمز عبور فعلی (جهت تایید هویت)</span>
                  <span className="text-red-400">*</span>
                </label>
                <input
                  type="password"
                  required
                  dir="ltr"
                  placeholder="رمز فعلی خود را وارد کنید"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white font-mono focus:outline-none focus:border-[#3A86FF]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
                  <span>رمز عبور جدید (در صورت تمایل به تغییر)</span>
                </label>
                <input
                  type="password"
                  dir="ltr"
                  placeholder="حداقل ۴ کاراکتر (در صورت خالی بودن تغییر نمی‌کند)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white font-mono focus:outline-none focus:border-[#3A86FF]"
                />
              </div>

              {profileError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <span>{profileError}</span>
                </div>
              )}

              {profileSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>{profileSuccess}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={profileLoading}
                className="w-full btn-cosmic py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-glow disabled:opacity-50"
              >
                {profileLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>ذخیره تغییرات حساب من</span>
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-6 space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-[#12131A] border border-white/10 shadow-xl space-y-6">
            <div className="space-y-1 border-b border-white/10 pb-4">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-purple-400" />
                تعریف و افزودن ادمین جدید
              </h4>
              <p className="text-xs text-slate-400">
                ایجاد دسترسی مدیریتی جدید برای همکاران جهت مدیریت اکران‌ها و مشاهده لیست تماشاچیان.
              </p>
            </div>

            <form onSubmit={handleCreateAdmin} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">نام و نام خانوادگی ادمین جدید *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: مریم احمدی"
                  value={newAdminName}
                  onChange={(e) => setNewAdminName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white focus:outline-none focus:border-[#3A86FF]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">نام کاربری اختصاصی لاگین *</label>
                <input
                  type="text"
                  required
                  dir="ltr"
                  placeholder="مثال: maryam_admin"
                  value={newAdminUsername}
                  onChange={(e) => setNewAdminUsername(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white font-mono focus:outline-none focus:border-[#3A86FF]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">رمز عبور ورود *</label>
                <input
                  type="password"
                  required
                  dir="ltr"
                  placeholder="حداقل ۴ کاراکتر"
                  value={newAdminPassword}
                  onChange={(e) => setNewAdminPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white font-mono focus:outline-none focus:border-[#3A86FF]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">سطح دسترسی</label>
                <select
                  value={newAdminRole}
                  onChange={(e) => setNewAdminRole(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#181A24] border border-white/10 text-white focus:outline-none focus:border-[#3A86FF]"
                >
                  <option value="admin">مدیر اکران‌ها و رزروها (Admin)</option>
                  <option value="superadmin">مدیر ارشد سامانه (Superadmin)</option>
                </select>
              </div>

              {createError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <span>{createError}</span>
                </div>
              )}

              {createSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>{createSuccess}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={createLoading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#7B2CBF] to-[#3A86FF] hover:from-[#7B2CBF]/90 hover:to-[#3A86FF]/90 text-white font-bold flex items-center justify-center gap-2 shadow-glow disabled:opacity-50"
              >
                {createLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                <span>ثبت و فعال‌سازی ادمین جدید</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="p-6 sm:p-8 rounded-3xl bg-[#12131A] border border-white/10 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#00F0FF]" />
              لیست مدیران فعال در پنل ({toPersianDigits(admins.length)})
            </h4>
            <p className="text-xs text-slate-400">
              مشاهده تمامی حساب‌های مدیریتی فعال با قابلیت مدیریت و حذف دسترسی‌ها
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-white/[0.02] text-slate-400 font-semibold border-b border-white/10">
              <tr>
                <th className="p-3">نام و مشخصات مدیر</th>
                <th className="p-3">نام کاربری (لاگین)</th>
                <th className="p-3">سطح دسترسی</th>
                <th className="p-3">تاریخ ثبت</th>
                <th className="p-3 text-center">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {admins.map((admin) => {
                const isCurrent = admin.id === currentAdminUser?.id;
                return (
                  <tr key={admin.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#7B2CBF] to-[#3A86FF] flex items-center justify-center text-white text-xs font-bold">
                          {admin.name.slice(0, 1)}
                        </div>
                        <span className="font-semibold text-white">{admin.name}</span>
                        {isCurrent && (
                          <span className="px-2 py-0.5 rounded-full bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/30 text-[10px] font-bold">
                            حساب شما
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="p-3 font-mono text-[#00F0FF] font-semibold">{admin.username}</td>

                    <td className="p-3">
                      {admin.role === 'superadmin' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold">
                          <Crown className="w-3 h-3 text-yellow-400" />
                          مدیر ارشد
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-[#3A86FF] border border-blue-500/30 text-[10px] font-bold">
                          مدیر اکران‌ها
                        </span>
                      )}
                    </td>

                    <td className="p-3 text-slate-400">
                      {new Date(admin.createdAt).toLocaleDateString('fa-IR')}
                    </td>

                    <td className="p-3 text-center">
                      {!isCurrent ? (
                        <button
                          onClick={() => handleDeleteAdmin(admin.id, admin.name)}
                          className="p-2 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors"
                          title="حذف دسترسی مدیر"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-500 italic">غیرقابل حذف</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
