import React from 'react';
import Link from 'next/link';
import { Film, Shield, Sparkles, Heart, Lock } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-white/10 bg-[#07080B] text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#7B2CBF] to-[#3A86FF] flex items-center justify-center">
                <Film className="w-4 h-4 text-white" />
              </div>
              <span className="text-base font-bold text-white tracking-wide">
                ORBIT — Exclusive Screenings
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-md">
              پلتفرم مدرن رزرو و خرید بلیت اکران‌های ویژه و رویدادهای اختصاصی سینمای جهان و انیمه‌های برگزیده در مدرن‌ترین سالن‌های سراسر کشور، مجهز به صدای دالبی اتموس و تصویر کریستالی.
            </p>
            <div className="flex items-center gap-3 text-[11px] text-slate-500">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[#00F0FF]" /> رزرو بدون نیاز به ثبت‌نام
              </span>
              <span>•</span>
              <span>کد QR آنی و معتبر</span>
              <span>•</span>
              <span>پشتیبانی شبانه‌روزی</span>
            </div>
          </div>

          {/* Quick links */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-xs tracking-wider">دسترسی سریع</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  جدول اکران‌های جاری
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  درباره پلتفرم اوربیت
                </Link>
              </li>
              <li>
                <Link href="/track" className="hover:text-white transition-colors">
                  پیگیری و دانلود مجدد بلیت
                </Link>
              </li>
              <li>
                <Link href="/support" className="hover:text-white transition-colors">
                  ثبت تیکت و پشتیبانی
                </Link>
              </li>
            </ul>
          </div>

          {/* Screening cities */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-xs tracking-wider">شهرهای تحت پوشش</h4>
            <p className="text-slate-400 leading-relaxed">
              تهران (پردیس چارسو، مگامال) • شیراز (هنر یاقوت) • اصفهان (ساحل آیمکس) • مشهد (هویزه) • تبریز
            </p>
            <div className="pt-2 text-[11px] text-slate-500">
              با افتخار برای عاشقان پرده نقره‌ای و انیمه
            </div>
          </div>

        </div>

        <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            © {new Date().getFullYear()} تمامی حقوق محفوظ است — اوربیت (ORBIT Screenings)
          </div>
          <div className="flex items-center gap-3">
            <span>طراحی شده با عشق به هنر هفتم</span>
            <span className="text-slate-700">•</span>
            <Link
              href="/admin"
              className="inline-flex items-center gap-1 text-[11px] text-slate-600 hover:text-slate-300 opacity-30 hover:opacity-100 transition-all cursor-pointer"
              title="ورود همکاران و مدیران سیستم"
            >
              <Lock className="w-3 h-3 text-slate-500" />
              <span className="text-[10px]">ورود همکاران</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
