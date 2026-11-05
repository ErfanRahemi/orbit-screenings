'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Film, Ticket, Shield, Sparkles, MapPin, Menu, X, MessageSquare, Info } from 'lucide-react';
import { SiteSettings } from '@/types';

const CITIES = ['همه شهرها', 'تهران', 'شیراز', 'اصفهان', 'مشهد', 'تبریز'];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentCity = searchParams.get('city') || 'همه شهرها';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [settings, setSettings] = useState<SiteSettings>({
    logoUrl: '',
    brandName: 'ORBIT',
    brandSubtitle: 'اکران اختصاصی',
    brandTagline: 'اکران‌های سینمایی و انیمه با کیفیت برتر',
  });

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      if (data.success && data.data) {
        setSettings(data.data);
      }
    } catch (e) {
      // Keep defaults
    }
  };

  useEffect(() => {
    fetchSettings();

    const handleUpdate = () => {
      fetchSettings();
    };

    window.addEventListener('orbit-settings-updated', handleUpdate);
    return () => {
      window.removeEventListener('orbit-settings-updated', handleUpdate);
    };
  }, []);

  const handleCityChange = (city: string) => {
    if (city === 'همه شهرها') {
      router.push('/');
    } else {
      router.push(`/?city=${encodeURIComponent(city)}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#0B0C10]/80 border-b border-white/10 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            {settings.logoUrl ? (
              <div className="relative w-12 h-12 rounded-xl bg-gradient-to-tr from-[#7B2CBF] via-[#3A86FF] to-[#00F0FF] p-[2px] transition-transform duration-300 group-hover:scale-105 group-hover:shadow-[0_0_20px_rgba(58,134,255,0.6)]">
                <div className="w-full h-full bg-[#0B0C10] rounded-[10px] flex items-center justify-center p-1 overflow-hidden">
                  <img
                    src={settings.logoUrl}
                    alt={settings.brandName || 'Logo'}
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            ) : (
              <div className="relative w-11 h-11 rounded-xl bg-gradient-to-tr from-[#7B2CBF] via-[#3A86FF] to-[#00F0FF] p-[2px] transition-transform duration-300 group-hover:scale-105 group-hover:shadow-[0_0_20px_rgba(58,134,255,0.6)]">
                <div className="w-full h-full bg-[#0B0C10] rounded-[10px] flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 border border-white/10 rounded-full scale-125 group-hover:rotate-45 transition-transform duration-700" />
                  <Film className="w-5 h-5 text-[#3A86FF] group-hover:text-white transition-colors" />
                  <div className="absolute -bottom-1 w-6 h-1 bg-[#7B2CBF] blur-sm rounded-full" />
                </div>
              </div>
            )}
            
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-wider bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  {settings.brandName || 'ORBIT'}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#7B2CBF]/30 text-[#00F0FF] border border-[#7B2CBF]/50 font-medium">
                  {settings.brandSubtitle || 'اکران اختصاصی'}
                </span>
              </div>
              <span className="text-[11px] text-slate-400 hidden sm:inline-block font-light">
                {settings.brandTagline || 'اکران‌های سینمایی و انیمه با کیفیت برتر'}
              </span>
            </div>
          </Link>

          {/* Desktop City Filter */}
          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-sm">
              <MapPin className="w-4 h-4 text-[#3A86FF]" />
              <span className="text-xs text-slate-400">شهر:</span>
              <select
                value={currentCity}
                onChange={(e) => handleCityChange(e.target.value)}
                className="bg-transparent text-white font-medium text-xs focus:outline-none cursor-pointer border-none"
              >
                {CITIES.map((c) => (
                  <option key={c} value={c} className="bg-[#12131A] text-white py-1">
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-2">
            <Link
              href="/"
              className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                pathname === '/'
                  ? 'bg-white/10 text-white border border-white/15 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              همه اکران‌ها
            </Link>

            <Link
              href="/about"
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                pathname.startsWith('/about')
                  ? 'bg-white/10 text-white border border-white/15 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Info className="w-4 h-4 text-purple-400" />
              <span>درباره ما</span>
            </Link>

            <Link
              href="/track"
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                pathname.startsWith('/track') || pathname.startsWith('/ticket')
                  ? 'bg-white/10 text-white border border-white/15'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Ticket className="w-4 h-4 text-[#00F0FF]" />
              <span>پیگیری بلیت</span>
            </Link>

            <Link
              href="/support"
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                pathname.startsWith('/support')
                  ? 'bg-gradient-to-r from-[#7B2CBF] to-[#3A86FF] text-white shadow-glow'
                  : 'text-slate-300 hover:text-white hover:bg-white/5 border border-white/10'
              }`}
            >
              <MessageSquare className="w-4 h-4 text-[#00F0FF]" />
              <span>ثبت تیکت پشتیبانی</span>
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-[#0B0C10]/95 backdrop-blur-2xl px-5 py-6 space-y-4">
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.04] border border-white/10">
            <span className="text-xs text-slate-400 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#3A86FF]" /> انتخاب شهر:
            </span>
            <select
              value={currentCity}
              onChange={(e) => {
                handleCityChange(e.target.value);
                setMobileMenuOpen(false);
              }}
              className="bg-transparent text-white font-medium text-xs focus:outline-none cursor-pointer"
            >
              {CITIES.map((c) => (
                <option key={c} value={c} className="bg-[#12131A] text-white">
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col space-y-2">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-3 rounded-xl text-sm font-medium text-slate-200 hover:bg-white/5 flex items-center justify-between"
            >
              <span>همه اکران‌ها</span>
              <Film className="w-4 h-4 text-slate-400" />
            </Link>

            <Link
              href="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-3 rounded-xl text-sm font-medium text-slate-200 hover:bg-white/5 flex items-center justify-between"
            >
              <span>درباره ما</span>
              <Info className="w-4 h-4 text-purple-400" />
            </Link>

            <Link
              href="/track"
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-3 rounded-xl text-sm font-medium text-slate-200 hover:bg-white/5 flex items-center justify-between"
            >
              <span>پیگیری بلیت</span>
              <Ticket className="w-4 h-4 text-[#00F0FF]" />
            </Link>

            <Link
              href="/support"
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-3 rounded-xl text-sm font-medium bg-gradient-to-r from-[#7B2CBF] to-[#3A86FF] text-white flex items-center justify-between"
            >
              <span>ثبت تیکت پشتیبانی</span>
              <MessageSquare className="w-4 h-4 text-white" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
