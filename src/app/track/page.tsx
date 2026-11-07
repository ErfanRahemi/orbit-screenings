'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Booking } from '@/types';
import { formatPrice, toPersianDigits } from '@/lib/utils';
import {
  Search,
  Ticket,
  MapPin,
  Calendar,
  AlertCircle,
  Loader2,
  ExternalLink,
} from 'lucide-react';

export default function TrackTicketPage() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const res = await fetch(`/api/bookings?query=${encodeURIComponent(query.trim())}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setBookings(data.data);
      } else {
        setError(data.error || 'خطا در جستجوی بلیت');
      }
    } catch (err) {
      setError('خطای اتصال به سرور');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full space-y-10">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#7B2CBF]/20 text-[#00F0FF] border border-[#7B2CBF]/40 text-xs font-semibold">
          <Ticket className="w-4 h-4" />
          <span>سامانه پیگیری و استعلام بلیت</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white">
          پیگیری بلیت و دریافت مجدد
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
          برای مشاهده یا چاپ مجدد بلیت‌های صادر شده، شماره موبایلی که هنگام خرید وارد کرده‌اید یا کد رهگیری بلیت (مانند ORB-918234) را وارد نمایید.
        </p>
      </div>

      <div className="p-6 sm:p-8 rounded-3xl bg-[#12131A] border border-white/10 backdrop-blur-xl shadow-xl">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="شماره موبایل (مثلاً 0912...) یا کد بلیت (مثلاً ORB-918234)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pr-12 pl-4 py-3.5 rounded-2xl bg-white/[0.04] border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-[#3A86FF] focus:ring-1 focus:ring-[#3A86FF] transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="btn-cosmic px-8 py-3.5 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-glow disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            <span>جستجوی بلیت</span>
          </button>
        </form>

        <div className="mt-4 pt-3 border-t border-white/5 flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
          <span>کدهای نمونه جهت تست:</span>
          <button
            type="button"
            onClick={() => setQuery('ORB-918234')}
            className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-[#00F0FF] font-mono"
          >
            ORB-918234
          </button>
          <button
            type="button"
            onClick={() => setQuery('09121111111')}
            className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-[#3A86FF] font-mono"
          >
            09121111111
          </button>
          <button
            type="button"
            onClick={() => setQuery('ORB-625143')}
            className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-purple-300 font-mono"
          >
            ORB-625143
          </button>
        </div>
      </div>

      {hasSearched && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>نتیجه جستجو برای: <strong className="text-white">{query}</strong></span>
            <span>{toPersianDigits(bookings.length)} بلیت یافت شد</span>
          </div>

          {error && (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {bookings.length === 0 && !error && (
            <div className="p-12 text-center rounded-3xl bg-[#12131A] border border-white/10 space-y-3">
              <Ticket className="w-10 h-10 text-slate-600 mx-auto" />
              <h3 className="text-sm font-bold text-white">هیچ بلیتی با این مشخصات یافت نشد</h3>
              <p className="text-xs text-slate-400">
                لطفاً از صحت شماره موبایل یا کد بلیت اطمینان حاصل نمایید.
              </p>
            </div>
          )}

          {bookings.map((b) => (
            <div
              key={b.id}
              className="p-6 rounded-3xl bg-[#12131A] border border-white/10 hover:border-[#3A86FF]/40 transition-all shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-[#3A86FF]/20 text-[#00F0FF] border border-[#3A86FF]/40">
                    {b.id}
                  </span>
                  {b.status === 'confirmed' ? (
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      پرداخت تایید شده
                    </span>
                  ) : b.status === 'pending' ? (
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                      در انتظار پرداخت واریزا
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30">
                      منقضی شده
                    </span>
                  )}
                  <span className="text-xs text-slate-400">
                    خریدار: <strong className="text-white">{b.buyerName}</strong>
                  </span>
                </div>

                <div>
                  <h4 className="text-lg font-black text-white">{b.movieTitleFa}</h4>
                  <p className="text-xs text-slate-400">{b.movieTitleEn}</p>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#3A86FF]" />
                    {b.city} — {b.venueName}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[#00F0FF]" />
                    {b.date} ساعت {b.time}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {b.seatDetails.map((s) => (
                    <span
                      key={s.seatId}
                      className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-xs text-slate-200"
                    >
                      ردیف {s.rowLabel} - صندلی {toPersianDigits(s.seatNumber)}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-col md:items-end justify-between gap-3 border-t md:border-t-0 border-white/10 pt-4 md:pt-0">
                <div className="text-left md:text-right">
                  <span className="text-[11px] text-slate-400 block">مبلغ پرداخت شده:</span>
                  <span className="text-sm font-bold text-[#00F0FF]">{formatPrice(b.totalAmount)}</span>
                </div>

                <Link
                  href={`/ticket/${b.id}`}
                  className="btn-cosmic px-5 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-glow"
                >
                  <span>مشاهده و دانلود بلیت</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
