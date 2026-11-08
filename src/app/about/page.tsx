import React from 'react';
import Link from 'next/link';
import { getSiteSettings } from '@/lib/db';
import {
  Film,
  Sparkles,
  ShieldCheck,
  Volume2,
  Tv,
  Phone,
  Send,
  MessageSquare,
  ChevronLeft,
  ExternalLink,
  Headphones,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function AboutPage() {
  const settings = getSiteSettings();

  const cleanInstagram = (settings.contactInstagram || 'orbit_screenings')
    .replace(/^@+/, '')
    .trim();
  const cleanTelegramChannel = (settings.contactTelegram || 'orbit_screenings')
    .replace(/^@+/, '')
    .trim();
  const cleanTelegramSupport = (
    settings.contactTelegramSupport ||
    'orbit_support'
  )
    .replace(/^@+/, '')
    .trim();

  return (
    <div className="flex-1 flex flex-col space-y-16 pb-20">
      
      {/* Hero Banner */}
      <section className="relative w-full overflow-hidden pt-8 pb-16 border-b border-white/5">
        <div className="absolute top-0 right-1/4 -z-10 w-96 h-96 bg-[#7B2CBF]/20 rounded-full blur-[130px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 -z-10 w-96 h-96 bg-[#3A86FF]/20 rounded-full blur-[130px] pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#7B2CBF]/30 to-[#3A86FF]/30 text-[#00F0FF] border border-[#00F0FF]/30 text-xs font-semibold">
            <Sparkles className="w-4 h-4" />
            <span>تجربه فراتر از یک تماشای معمولی</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
            {settings.aboutTitle || 'درباره پلتفرم اکران‌های اختصاصی اوربیت'}
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-3xl mx-auto">
            {settings.brandSubtitle || 'اکران اختصاصی'} — {settings.brandTagline || 'اکران‌های سینمایی و انیمه با کیفیت برتر'}
          </p>
        </div>
      </section>

      {/* Main Content & Story */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="p-8 sm:p-12 rounded-3xl bg-[#12131A] border border-white/10 shadow-2xl space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#7B2CBF] to-[#3A86FF] flex items-center justify-center text-white">
              <Film className="w-5 h-5" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              داستان ما و اشتیاق برای پرده نقره‌ای
            </h2>
          </div>

          <div className="text-slate-300 text-sm sm:text-base leading-loose whitespace-pre-wrap">
            {settings.aboutText ||
              'اوربیت (ORBIT Screenings) جامعه و پلتفرمی مستقل برای اکران‌های اختصاصی و رویدادمحور برترین آثار سینمای جهان و انیمه‌های برجسته است.'}
          </div>

          {settings.aboutVision && (
            <div className="p-6 rounded-2xl bg-gradient-to-r from-[#7B2CBF]/10 via-[#3A86FF]/10 to-transparent border border-[#3A86FF]/30 space-y-2">
              <span className="text-xs font-bold text-[#00F0FF] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                چشم‌انداز و هدف اوربیت
              </span>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                {settings.aboutVision}
              </p>
            </div>
          )}
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-[#12131A] border border-white/10 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#7B2CBF]/20 text-[#7B2CBF] flex items-center justify-center border border-[#7B2CBF]/30">
              <Volume2 className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-base font-bold text-white">صدای دالبی اتموس چندکاناله</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              تمامی اکران‌ها در سالن‌های مجهز به پیشرفته‌ترین سیستم‌های پخش صوتی و تفکیک دقیق فرکانسی برگزار می‌شوند.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-[#12131A] border border-white/10 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#3A86FF]/20 text-[#3A86FF] flex items-center justify-center border border-[#3A86FF]/30">
              <Tv className="w-6 h-6 text-[#3A86FF]" />
            </div>
            <h3 className="text-base font-bold text-white">تصویر 4K و آیمکس</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              انتخاب بالاترین مسترهای سینمایی با تصحیح رنگ اختصاصی، زیرنویس دقیق و کیفیت تصویر شایسته شاهکارهای سینما.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-[#12131A] border border-white/10 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#00F0FF]/20 text-[#00F0FF] flex items-center justify-center border border-[#00F0FF]/30">
              <ShieldCheck className="w-6 h-6 text-[#00F0FF]" />
            </div>
            <h3 className="text-base font-bold text-white">رزرو آنی با صندلی قطعی</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              امکان انتخاب دقیق شماره صندلی روی نقشه تعاملی سالن و صدور آنی بلیت الکترونیک با بارکد QR معتبر.
            </p>
          </div>
        </div>

        {/* Contact Information & Channels */}
        <div className="p-8 sm:p-10 rounded-3xl bg-[#12131A] border border-white/10 space-y-6">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">راه‌های ارتباطی و شبکه‌های اجتماعی</h3>
            <p className="text-xs text-slate-400">
              برای پیگیری اخبار اکران‌ها، اطلاع از سانس‌های جدید و ارتباط با پشتیبانی از راه‌های زیر با ما همراه باشید:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            {/* Box 1: Instagram Page */}
            <a
              href={`https://instagram.com/${cleanInstagram}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-5 rounded-2xl bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-transparent border border-pink-500/20 hover:border-pink-500/50 transition-all duration-300 space-y-2 group block"
            >
              <div className="flex items-center justify-between">
                <span className="text-slate-300 flex items-center gap-2 text-xs font-bold group-hover:text-pink-300 transition-colors">
                  <span className="w-7 h-7 rounded-lg bg-pink-500/20 flex items-center justify-center text-pink-400 group-hover:scale-110 transition-transform">
                    📸
                  </span>
                  آیدی پیج اینستاگرام:
                </span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-pink-400 transition-colors" />
              </div>
              <div className="pt-1">
                <span className="font-mono text-white text-sm font-bold block" dir="ltr">
                  @{cleanInstagram}
                </span>
                <span className="text-[11px] text-pink-400/80 mt-0.5 block">
                  مشاهده استوری‌ها و جدول هفتگی اکران‌ها ←
                </span>
              </div>
            </a>

            {/* Box 2: Telegram Channel */}
            <a
              href={`https://t.me/${cleanTelegramChannel}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-5 rounded-2xl bg-gradient-to-br from-sky-500/10 via-blue-500/10 to-transparent border border-sky-500/20 hover:border-sky-500/50 transition-all duration-300 space-y-2 group block"
            >
              <div className="flex items-center justify-between">
                <span className="text-slate-300 flex items-center gap-2 text-xs font-bold group-hover:text-sky-300 transition-colors">
                  <span className="w-7 h-7 rounded-lg bg-sky-500/20 flex items-center justify-center text-sky-400 group-hover:scale-110 transition-transform">
                    <Send className="w-3.5 h-3.5" />
                  </span>
                  کانال تلگرام:
                </span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-sky-400 transition-colors" />
              </div>
              <div className="pt-1">
                <span className="font-mono text-white text-sm font-bold block" dir="ltr">
                  @{cleanTelegramChannel}
                </span>
                <span className="text-[11px] text-sky-400/80 mt-0.5 block">
                  عضویت در کانال اطلاع‌رسانی و تخفیف‌ها ←
                </span>
              </div>
            </a>

            {/* Box 3: Telegram Support */}
            <a
              href={`https://t.me/${cleanTelegramSupport}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-transparent border border-emerald-500/20 hover:border-emerald-500/50 transition-all duration-300 space-y-2 group block sm:col-span-2 lg:col-span-1"
            >
              <div className="flex items-center justify-between">
                <span className="text-slate-300 flex items-center gap-2 text-xs font-bold group-hover:text-emerald-300 transition-colors">
                  <span className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                    <Headphones className="w-3.5 h-3.5" />
                  </span>
                  پشتیبانی تلگرام:
                </span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 transition-colors" />
              </div>
              <div className="pt-1">
                <span className="font-mono text-white text-sm font-bold block" dir="ltr">
                  @{cleanTelegramSupport}
                </span>
                <span className="text-[11px] text-emerald-400/80 mt-0.5 block">
                  ارتباط مستقیم و گفتگوی آنلاین با ادمین ←
                </span>
              </div>
            </a>
          </div>

          {settings.contactPhone && (
            <div className="pt-2 flex items-center gap-2 text-xs text-slate-400 border-t border-white/5">
              <Phone className="w-3.5 h-3.5 text-[#00F0FF]" />
              <span>تلفن تماس پشتیبانی:</span>
              <a
                href={`tel:${settings.contactPhone}`}
                className="font-mono text-white font-bold hover:text-[#00F0FF] transition-colors"
                dir="ltr"
              >
                {settings.contactPhone}
              </a>
            </div>
          )}

          {/* Action buttons */}
          <div className="pt-4 flex flex-wrap items-center gap-4">
            <Link
              href="/support"
              className="btn-cosmic px-6 py-3 rounded-xl font-bold text-xs flex items-center gap-2 shadow-glow"
            >
              <MessageSquare className="w-4 h-4" />
              <span>ارسال تیکت پشتیبانی</span>
            </Link>

            <Link
              href="/"
              className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold flex items-center gap-2 transition-colors"
            >
              <span>مشاهده جدول اکران‌ها</span>
              <ChevronLeft className="w-4 h-4" />
            </Link>
          </div>
        </div>

      </section>

    </div>
  );
}
