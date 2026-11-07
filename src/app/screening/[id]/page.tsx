import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getScreeningById } from '@/lib/db';
import SeatPicker from '@/components/SeatPicker';
import {
  ChevronRight,
  MapPin,
  Calendar,
  Clock,
  Volume2,
  ShieldCheck,
} from 'lucide-react';

interface PageProps {
  params: { id: string };
}

export default function ScreeningPage({ params }: PageProps) {
  const screening = getScreeningById(params.id);

  if (!screening) {
    notFound();
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="relative w-full border-b border-white/10 bg-[#0E1017]">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-15 blur-md"
          style={{ backgroundImage: `url(${screening.bannerUrl || screening.posterUrl})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0E1017] via-[#0E1017]/90 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors mb-6 group"
          >
            <ChevronRight className="w-4 h-4 text-[#3A86FF] group-hover:-translate-x-0.5 transition-transform" />
            <span>بازگشت به جدول تمام اکران‌ها</span>
          </Link>

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-[#7B2CBF]/30 text-[#00F0FF] border border-[#7B2CBF]/50 text-xs font-semibold">
                  {screening.city}
                </span>
                <span className="px-3 py-1 rounded-full bg-white/5 text-slate-300 border border-white/10 text-xs">
                  {screening.genre}
                </span>
                <span className="px-2.5 py-1 rounded-full bg-white/5 text-slate-400 border border-white/10 text-xs">
                  {screening.ageRating}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white">
                {screening.titleFa}
              </h1>

              <div className="text-sm text-slate-400 font-light">
                {screening.titleEn}
              </div>

              <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-slate-300 pt-2">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#3A86FF]" />
                  <span className="font-semibold text-white">{screening.venueName}</span>
                  <span className="text-slate-500 hidden sm:inline">({screening.venueAddress})</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-[#00F0FF]" />
                  <span>{screening.date}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-purple-400" />
                  <span>ساعت {screening.time}</span>
                  <span className="text-slate-500">({screening.duration})</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Volume2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-slate-400">{screening.language}</span>
                </div>
              </div>
            </div>

            <div className="hidden lg:flex flex-col items-end text-left space-y-1.5 text-[11px] text-slate-400 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
              <span className="flex items-center gap-1.5 text-slate-300">
                <ShieldCheck className="w-4 h-4 text-[#00F0FF]" />
                رزرو قطعی و صدور آنی بلیت الکترونیک
              </span>
              <span className="text-slate-500">بدون کارمزد مازاد و مالیات پنهان</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 space-y-6">
        {screening.isSoldOut && (
          <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs sm:text-sm flex items-center gap-3 font-bold animate-fadeIn">
            <span className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center flex-shrink-0 text-base">
              ✕
            </span>
            <div>
              <span className="block font-black text-rose-300">
                فروش بلیت این اکران به دلیل تکمیل ظرفیت متوقف شده است (SOLD OUT)
              </span>
              <span className="text-[11px] text-slate-300 font-normal">
                تمامی صندلی‌های این سانس تکمیل شده یا فروش آن توسط مدیریت متوقف گردیده است. امکان ثبت رزرو جدید وجود ندارد.
              </span>
            </div>
          </div>
        )}
        <SeatPicker screening={screening} />
      </div>
    </div>
  );
}
