'use client';

import React, { useState, useEffect } from 'react';
import ScreeningsManager from '@/components/admin/ScreeningsManager';
import SeatMapBuilder from '@/components/admin/SeatMapBuilder';
import BookingsDashboard from '@/components/admin/BookingsDashboard';
import AdminAccountsManager from '@/components/admin/AdminAccountsManager';
import SiteSettingsManager from '@/components/admin/SiteSettingsManager';
import TicketsManager from '@/components/admin/TicketsManager';
import {
  Shield,
  Film,
  Grid,
  Users,
  Lock,
  User,
  KeyRound,
  LogOut,
  Sparkles,
  AlertCircle,
  Loader2,
  Image as ImageIcon,
  UserCheck,
  MessageSquare,
} from 'lucide-react';

interface CurrentUser {
  id: string;
  username: string;
  name: string;
  role: string;
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('orbit1234');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  const [activeTab, setActiveTab] = useState<
    'screenings' | 'mapBuilder' | 'bookings' | 'tickets' | 'admins' | 'branding'
  >('screenings');

  useEffect(() => {
    const isLogged =
      document.cookie.includes('orbit_admin_session=') ||
      localStorage.getItem('orbit_admin_logged') === 'true';

    if (isLogged) {
      setIsAuthenticated(true);
      const savedUser = localStorage.getItem('orbit_current_user');
      if (savedUser) {
        try {
          setCurrentUser(JSON.parse(savedUser));
        } catch (e) {
          setCurrentUser({
            id: 'admin-1',
            username: 'admin',
            name: 'مدیر کل اوربیت',
            role: 'superadmin',
          });
        }
      } else {
        setCurrentUser({
          id: 'admin-1',
          username: 'admin',
          name: 'مدیر کل اوربیت',
          role: 'superadmin',
        });
      }
    }
    setAuthLoading(false);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();

      if (data.success && data.user) {
        setIsAuthenticated(true);
        setCurrentUser(data.user);
        localStorage.setItem('orbit_admin_logged', 'true');
        localStorage.setItem('orbit_current_user', JSON.stringify(data.user));
      } else {
        setLoginError(data.error || 'نام کاربری یا رمز عبور نامعتبر است.');
      }
    } catch (e) {
      setLoginError('خطای برقراری ارتباط با سرور.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    document.cookie = 'orbit_admin_session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    localStorage.removeItem('orbit_admin_logged');
    localStorage.removeItem('orbit_current_user');
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  const handleUpdateCurrentUser = (updated: CurrentUser) => {
    setCurrentUser(updated);
    localStorage.setItem('orbit_current_user', JSON.stringify(updated));
  };

  if (authLoading) {
    return (
      <div className="flex-1 flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 text-[#3A86FF] animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex-1 flex items-center justify-center py-16 px-4">
        <div className="max-w-md w-full p-8 rounded-3xl bg-[#12131A] border border-white/10 shadow-2xl backdrop-blur-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#7B2CBF] to-[#3A86FF] flex items-center justify-center text-white mx-auto shadow-glow">
              <Shield className="w-7 h-7" />
            </div>
            <h1 className="text-xl font-bold text-white">ورود به پنل مدیریت اوربیت</h1>
            <p className="text-xs text-slate-400">
              دسترسی به تنظیمات اکران، سازنده بصری سالن، مدیریت ادمین‌ها و برند
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#3A86FF]" />
                <span>نام کاربری مدیر</span>
              </label>
              <input
                type="text"
                required
                dir="ltr"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm font-mono focus:outline-none focus:border-[#3A86FF]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-purple-400" />
                <span>رمز عبور</span>
              </label>
              <input
                type="password"
                required
                dir="ltr"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm font-mono focus:outline-none focus:border-[#3A86FF]"
              />
            </div>

            {loginError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full btn-cosmic py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-glow disabled:opacity-50"
            >
              {isLoggingIn ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Lock className="w-4 h-4" />
              )}
              <span>ورود به سامانه</span>
            </button>
          </form>

          <div className="p-3 rounded-xl bg-[#00F0FF]/10 border border-[#00F0FF]/20 text-[11px] text-[#00F0FF] space-y-1">
            <span className="font-bold block flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> راهنمای دسترسی اولیه برای تست:
            </span>
            <div className="font-mono text-slate-300 space-y-0.5 text-[10px]" dir="ltr">
              <div>Username: <strong className="text-white">admin</strong></div>
              <div>Password: <strong className="text-white">orbit1234</strong></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-[#12131A] border border-white/10 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#7B2CBF] to-[#3A86FF] flex items-center justify-center text-white shadow-glow">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white">پنل مدیریت و راهبری اوربیت</h1>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                {currentUser?.name || 'مدیر فعال'} ({currentUser?.username})
              </span>
            </div>
            <p className="text-xs text-slate-400">
              مدیریت اکران‌ها، سازنده بصری سالن، تعریف ادمین‌های جدید، تغییر کلمه عبور و شخصی‌سازی لوگو
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="self-start md:self-auto px-4 py-2 rounded-xl bg-white/5 hover:bg-red-500/10 text-slate-400 hover:text-red-300 border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>خروج از حساب</span>
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-4">
        <button
          onClick={() => setActiveTab('screenings')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'screenings'
              ? 'bg-gradient-to-r from-[#7B2CBF] to-[#3A86FF] text-white shadow-glow'
              : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
          }`}
        >
          <Film className="w-4 h-4" />
          <span>ماژول ۱: مدیریت اکران‌ها</span>
        </button>

        <button
          onClick={() => setActiveTab('mapBuilder')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'mapBuilder'
              ? 'bg-gradient-to-r from-[#7B2CBF] to-[#3A86FF] text-white shadow-glow'
              : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
          }`}
        >
          <Grid className="w-4 h-4" />
          <span>ماژول ۲: سازنده بصری سالن</span>
        </button>

        <button
          onClick={() => setActiveTab('bookings')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'bookings'
              ? 'bg-gradient-to-r from-[#7B2CBF] to-[#3A86FF] text-white shadow-glow'
              : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>ماژول ۳: داشبورد تماشاچیان</span>
        </button>

        <button
          onClick={() => setActiveTab('tickets')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'tickets'
              ? 'bg-gradient-to-r from-[#7B2CBF] to-[#3A86FF] text-white shadow-glow'
              : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
          }`}
        >
          <MessageSquare className="w-4 h-4 text-[#00F0FF]" />
          <span>ماژول ۴: تیکت‌های پشتیبانی کاربران</span>
        </button>

        <button
          onClick={() => setActiveTab('admins')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'admins'
              ? 'bg-gradient-to-r from-[#7B2CBF] to-[#3A86FF] text-white shadow-glow'
              : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>ماژول ۵: ادمین‌ها و حساب من</span>
        </button>

        <button
          onClick={() => setActiveTab('branding')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'branding'
              ? 'bg-gradient-to-r from-[#7B2CBF] to-[#3A86FF] text-white shadow-glow'
              : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>ماژول ۶: لوگو، برند و درباره ما</span>
        </button>
      </div>

      <div className="pt-2">
        {activeTab === 'screenings' && <ScreeningsManager />}
        {activeTab === 'mapBuilder' && <SeatMapBuilder />}
        {activeTab === 'bookings' && <BookingsDashboard />}
        {activeTab === 'tickets' && <TicketsManager />}
        {activeTab === 'admins' && (
          <AdminAccountsManager
            currentAdminUser={currentUser}
            onUpdateCurrentUser={handleUpdateCurrentUser}
          />
        )}
        {activeTab === 'branding' && <SiteSettingsManager />}
      </div>
    </div>
  );
}
