import React from 'react';
import Link from 'next/link';
import { getScreenings } from '@/lib/db';
import { formatPrice, toPersianDigits } from '@/lib/utils';
import { Film, MapPin, Calendar, Clock, Sparkles, ChevronLeft, Ticket, Flame, CheckCircle2, Ban } from 'lucide-react';

const CITIES = ['همه شهرها', 'تهران', 'شیراز', 'اصفهان', 'مشهد', 'تبریز'];

interface PageProps {
  searchParams: Promise<{ city?: string }>;
}

export default async function HomePage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const currentCity = resolvedSearchParams?.city || 'همه شهرها';
  const screenings = getScreenings(currentCity);
  
  // Find featured screening
  const featured = screenings.find((s) => s.featured) || screenings[0];

  return (
    <div className="flex-1 flex flex-col space-y-16 pb-20">
      
      {/* Hero Section */}
      {featured && (
        <section className="relative w-full overflow-hidden pt-4 pb-12 lg:pt-8 lg:pb-16 border-b border-white/5">
          <div className="absolute top-0 right-1/4 -z-10 w-96 h-96 bg-[#7B2CBF]/20 rounded-full blur-[130px] pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 -z-10 w-96 h-96 bg-[#3A86FF]/20 rounded-full blur-[130px] pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-b from-white/[0.07] to-white/[0.02] backdrop-blur-xl shadow-2xl">
              
              <div 
                className="absolute inset-0 bg-cover bg-center opacity-15 scale-105 blur-lg"
                style={{ backgroundImage: `url(${featured.bannerUrl || featured.posterUrl})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-[#0B0C10] via-[#0B0C10]/85 to-transparent" />

              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 sm:p-10 lg:p-14 items-center">
                
                {/* Hero Info */}
                <div className="lg:col-span-7 space-y-6">
                  
                  <div className="flex flex-wrap items-center gap-2">
                    {featured.isSoldOut ? (
                      <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-600 text-white text-xs font-black shadow-lg uppercase tracking-wider">
                        <Ban className="w-3.5 h-3.5" />
                        تکمیل ظرفیت (SOLD OUT)
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-[#7B2CBF] to-[#3A86FF] text-white text-xs font-semibold shadow-glow">
                        <Flame className="w-3.5 h-3.5 text-yellow-300" />
                        اکران ویژه و انحصاری
                      </span>
                    )}
                    <span className="px-3 py-1 rounded-full bg-white/10 text-[#00F0FF] border border-[#00F0FF]/30 text-xs font-medium">
                      {featured.city}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-white/5 text-slate-300 border border-white/10 text-xs">
                      {featured.genre}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
                      {featured.titleFa}
                    </h1>
                    <p className="text-sm sm:text-base text-slate-400 font-light tracking-wide">
                      {featured.titleEn}
                    </p>
                  </div>

                  <p className="text-slate-300 text-sm sm:text-base leading-relaxed line-clamp-3 max-w-2xl">
                    {featured.synopsis || featured.tagline}
                  </p>

                  {/* Event Meta Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
                    <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <MapPin className="w-3.5 h-3.5 text-[#3A86FF]" />
                        <span>مکان اکران:</span>
                      </div>
                      <div className="text-xs font-semibold text-white truncate">
                        {featured.venueName}
                      </div>
                    </div>

                    <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <Calendar className="w-3.5 h-3.5 text-[#00F0FF]" />
                        <span>تاریخ رویداد:</span>
                      </div>
                      <div className="text-xs font-semibold text-white">
                        {featured.date}
                      </div>
                    </div>

                    <div className="col-span-2 sm:col-span-1 p-3 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <Clock className="w-3.5 h-3.5 text-purple-400" />
                        <span>ساعت شروع:</span>
                      </div>
                      <div className="text-xs font-semibold text-white">
                        {featured.time} ({featured.duration})
                      </div>
                    </div>
                  </div>

                  {/* CTA Buttons */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4">
                    {featured.isSoldOut ? (
                      <button
                        disabled
                        className="px-8 py-4 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-rose-300 font-bold text-sm sm:text-base flex items-center justify-center gap-3 cursor-not-allowed shadow-none"
                      >
                        <Ban className="w-5 h-5 text-rose-400" />
                        <span>تکمیل ظرفیت (Sold Out)</span>
                      </button>
                    ) : (
                      <Link
                        href={`/screening/${featured.id}`}
                        className="btn-cosmic px-8 py-4 rounded-2xl font-bold text-sm sm:text-base text-center flex items-center justify-center gap-3 shadow-glow"
                      >
                        <Ticket className="w-5 h-5 text-white" />
                        <span>انتخاب صندلی و خرید بلیت</span>
                        <ChevronLeft className="w-4 h-4" />
                      </Link>
                    )}

                    <div className="text-xs text-slate-400 flex items-center justify-center sm:justify-start gap-1">
                      {featured.isSoldOut ? (
                        <span className="text-rose-400 font-semibold">فروش بلیت برای این اکران متوقف شده است</span>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-[#06D6A0]" />
                          <span>قیمت بلیت: از {formatPrice(featured.seatMap?.economyPrice || 140000)}</span>
                        </>
                      )}
                    </div>
                  </div>

                </div>

                {/* Hero Poster */}
                <div className="lg:col-span-5 flex justify-center lg:justify-end">
                  <div className="relative group w-64 sm:w-72 aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border-2 border-white/10 transition-transform duration-500 hover:scale-[1.02]">
                    <img
                      src={featured.posterUrl}
                      alt={featured.titleFa}
                      className="w-full h-full object-cover"
                    />
                    {featured.isSoldOut && (
                      <div className="absolute inset-0 z-20 bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
                        <span className="px-5 py-2.5 rounded-2xl bg-rose-600 text-white font-black text-sm tracking-widest uppercase shadow-[0_0_30px_rgba(244,63,94,0.7)] border-2 border-rose-400 rotate-[-8deg]">
                          SOLD OUT
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                      <span className="text-xs font-medium text-white bg-black/60 backdrop-blur px-3 py-1.5 rounded-lg">
                        {featured.language}
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </section>
      )}

      {/* Screenings Catalog Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-8">
        
        {/* Section Header & City Filters */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#00F0FF] uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>جدول اکران‌های ویژه و انحصاری</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              انتخاب فیلم و رزرو صندلی
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              ظرفیت هر سالن محدود بوده و صندلی‌ها بر اساس اولویت رزرو قفل می‌شوند.
            </p>
          </div>

          {/* City Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {CITIES.map((city) => {
              const active = currentCity === city;
              const href = city === 'همه شهرها' ? '/' : `/?city=${encodeURIComponent(city)}`;
              return (
                <Link
                  key={city}
                  href={href}
                  className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                    active
                      ? 'bg-gradient-to-r from-[#7B2CBF] to-[#3A86FF] text-white shadow-glow'
                      : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-white/5'
                  }`}
                >
                  {city}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Screenings Grid */}
        {screenings.length === 0 ? (
          <div className="p-16 text-center rounded-3xl bg-white/[0.02] border border-white/10 space-y-4">
            <Film className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-lg font-bold text-white">اکرانی در شهر {currentCity} یافت نشد</h3>
            <p className="text-xs text-slate-400">
              لطفاً شهر دیگری را انتخاب کنید یا همه شهرها را مشاهده فرمایید.
            </p>
            <Link
              href="/"
              className="inline-block mt-4 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors"
            >
              مشاهده همه شهرها
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {screenings.map((screening) => {
              const economy = screening.seatMap?.economyPrice || 140000;
              const availableCount = screening.seatMap?.seats.filter(
                (s) => s.type !== 'aisle' && s.type !== 'blocked' && s.status === 'available'
              ).length || 0;

              return (
                <div
                  key={screening.id}
                  className="group flex flex-col rounded-2xl overflow-hidden bg-[#12131A] border border-white/10 hover:border-[#3A86FF]/40 transition-all duration-300 hover:shadow-[0_10px_30px_rgba(58,134,255,0.15)] hover:-translate-y-1"
                >
                  <div className="relative w-full aspect-[2/3] overflow-hidden bg-slate-900">
                    <img
                      src={screening.posterUrl}
                      alt={screening.titleFa}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />

                    {screening.isSoldOut && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] z-10 flex items-center justify-center">
                        <span className="px-4 py-2 rounded-xl bg-rose-600 text-white font-black text-xs sm:text-sm tracking-widest uppercase shadow-2xl border border-rose-400 rotate-[-6deg]">
                          SOLD OUT
                        </span>
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-[#12131A] via-transparent to-transparent opacity-90" />

                    <div className="absolute top-3 right-3 left-3 flex items-center justify-between gap-2 z-10">
                      <span className="px-2.5 py-1 rounded-lg bg-[#0B0C10]/80 backdrop-blur text-[#00F0FF] border border-[#00F0FF]/30 text-[11px] font-semibold">
                        {screening.city}
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur text-slate-300 text-[11px]">
                        {screening.ageRating}
                      </span>
                    </div>

                    <div className="absolute bottom-3 right-3 left-3 flex items-center justify-between text-[11px] z-10">
                      <span className="text-slate-300 truncate max-w-[65%] font-medium">
                        {screening.venueName}
                      </span>
                      {screening.isSoldOut ? (
                        <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-bold">
                          تکمیل ظرفیت (Sold Out)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                          {toPersianDigits(availableCount)} صندلی خالی
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="text-[11px] font-medium text-purple-400 line-clamp-1">
                        {screening.genre}
                      </div>

                      <h3 className="text-base font-bold text-white group-hover:text-[#00F0FF] transition-colors line-clamp-1">
                        {screening.titleFa}
                      </h3>

                      <p className="text-xs text-slate-400 font-light truncate">
                        {screening.titleEn}
                      </p>
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-white/5 text-xs text-slate-300">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                          <Calendar className="w-3.5 h-3.5 text-[#3A86FF]" /> تاریخ:
                        </span>
                        <span className="font-medium text-slate-200 text-[11px]">
                          {screening.date}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                          <Clock className="w-3.5 h-3.5 text-purple-400" /> زمان:
                        </span>
                        <span className="font-medium text-slate-200 text-[11px]">
                          ساعت {screening.time}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between text-xs">
                      <span className="text-[11px] text-slate-400">بلیت از:</span>
                      <span className="font-bold text-[#00F0FF]">
                        {formatPrice(economy)}
                      </span>
                    </div>

                    {screening.isSoldOut ? (
                      <button
                        disabled
                        className="w-full py-2.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs font-bold text-center flex items-center justify-center gap-2 cursor-not-allowed opacity-80"
                      >
                        <Ban className="w-4 h-4 text-rose-400" />
                        <span>تکمیل ظرفیت (Sold Out)</span>
                      </button>
                    ) : (
                      <Link
                        href={`/screening/${screening.id}`}
                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#7B2CBF]/90 to-[#3A86FF]/90 hover:from-[#7B2CBF] hover:to-[#3A86FF] text-white text-xs font-bold text-center flex items-center justify-center gap-2 transition-all shadow-sm group-hover:shadow-glow"
                      >
                        <Ticket className="w-4 h-4" />
                        <span>انتخاب صندلی و رزرو</span>
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </section>

      {/* Feature Highlights Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 flex items-start gap-4">
            <div className="p-3 rounded-xl bg-[#7B2CBF]/20 text-purple-400 border border-[#7B2CBF]/30">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white">کیفیت اختصاصی و بلوری</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                اکران با بالاترین بیت‌ریت ممکن بر روی پرده‌های عریض سینمایی همراه با صدای فراگیر دالبی.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 flex items-start gap-4">
            <div className="p-3 rounded-xl bg-[#3A86FF]/20 text-[#3A86FF] border border-[#3A86FF]/30">
              <Ticket className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white">خرید مهمان بدون ثبت‌نام</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                بدون اتلاف وقت برای ساخت حساب یا دریافت کد پیامکی، با نام و شماره تماس بلیت خود را صادر کنید.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 flex items-start gap-4">
            <div className="p-3 rounded-xl bg-[#00F0FF]/20 text-[#00F0FF] border border-[#00F0FF]/30">
              <Film className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white">چیدمان صندلی اختصاصی</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                مشاهده نقشه دقیق هر سالن، راهروها و صندلی‌های ویژه VIP با قیمت‌گذاری شفاف چندسطحی.
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
