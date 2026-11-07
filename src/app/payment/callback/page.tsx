'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Booking } from '@/types';
import { formatPrice, toPersianDigits } from '@/lib/utils';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Loader2,
  ExternalLink,
  Ticket,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';

function PaymentCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingIdParam =
    searchParams.get('bookingId') ||
    searchParams.get('slug') ||
    searchParams.get('id') ||
    '';

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  async function fetchBookingStatus(isManual = false) {
    if (!bookingIdParam) {
      setError('شناسه رزرو یا کد پیگیری پرداخت در آدرس بازگشت یافت نشد.');
      setLoading(false);
      return;
    }

    if (isManual) setChecking(true);
    try {
      const res = await fetch(
        `/api/bookings/${encodeURIComponent(bookingIdParam)}`,
        { cache: 'no-store' }
      );
      const data = await res.json();
      if (data.success && data.data) {
        const b: Booking = data.data;
        setBooking(b);
        setError(null);
        if (b.status === 'confirmed') {
          setTimeout(() => {
            router.push(`/ticket/${b.id}`);
          }, 1200);
        }
      } else {
        setError(data.error || 'اطلاعات رزرو یافت نشد.');
      }
    } catch (err) {
      setError('خطا در استعلام وضعیت پرداخت از سرور.');
    } finally {
      setLoading(false);
      if (isManual) setChecking(false);
    }
  }

  useEffect(() => {
    fetchBookingStatus();

    const interval = setInterval(() => {
      fetchBookingStatus();
    }, 2500);

    return () => clearInterval(interval);
  }, [bookingIdParam]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center py-24 px-4">
        <div className="max-w-md w-full p-8 rounded-3xl bg-[#12131A] border border-white/10 text-center space-y-4 shadow-2xl">
          <Loader2 className="w-10 h-10 text-[#00F0FF] animate-spin mx-auto" />
          <h2 className="text-base font-bold text-white">
            در حال بررسی وضعیت تراکنش درگاه واریزا...
          </h2>
          <p className="text-xs text-slate-400">
            لطفاً چند لحظه صبر کنید تا تاییدیه پرداخت شما از درگاه دریافت شود.
          </p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 rounded-3xl bg-[#12131A] border border-white/10 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto" />
        <h2 className="text-base font-bold text-white">
          عدم دسترسی به اطلاعات رزرو
        </h2>
        <p className="text-xs text-slate-400">{error}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link
            href="/track"
            className="px-5 py-2.5 rounded-xl bg-[#3A86FF] hover:bg-[#3A86FF]/90 text-white text-xs font-bold"
          >
            پیگیری بلیت با شماره موبایل
          </Link>
          <Link
            href="/"
            className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold"
          >
            بازگشت به صفحه اصلی
          </Link>
        </div>
      </div>
    );
  }

  const isConfirmed = booking.status === 'confirmed';
  const isExpired =
    booking.status === 'expired' || booking.status === 'cancelled';

  return (
    <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6">
      <div className="max-w-lg w-full rounded-3xl bg-[#12131A] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden">
        <div
          className={`p-6 text-center space-y-3 border-b border-white/10 ${
            isConfirmed
              ? 'bg-gradient-to-b from-emerald-500/20 to-transparent'
              : isExpired
              ? 'bg-gradient-to-b from-rose-500/20 to-transparent'
              : 'bg-gradient-to-b from-[#3A86FF]/20 to-transparent'
          }`}
        >
          {isConfirmed ? (
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white shadow-[0_0_25px_rgba(16,185,129,0.5)]">
              <CheckCircle2 className="w-9 h-9" />
            </div>
          ) : isExpired ? (
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400">
              <AlertTriangle className="w-9 h-9" />
            </div>
          ) : (
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#3A86FF]/20 border border-[#3A86FF]/40 text-[#00F0FF]">
              <Clock className="w-9 h-9 animate-pulse" />
            </div>
          )}

          <h1 className="text-xl sm:text-2xl font-black text-white">
            {isConfirmed
              ? 'پرداخت شما در واریزا با موفقیت تایید شد!'
              : isExpired
              ? 'مهلت پرداخت این رزرو منقضی شده است'
              : 'در انتظار تایید خودکار پرداخت از درگاه واریزا'}
          </h1>

          <p className="text-xs text-slate-300 leading-relaxed max-w-md mx-auto">
            {isConfirmed
              ? 'بلیت رسمی شما صادر گردید. در حال انتقال خودکار به صفحه بلیت و بارکد ورود...'
              : isExpired
              ? 'متأسفانه زمان ۳۰ دقیقه‌ای تکمیل پرداخت به پایان رسیده و صندلی‌های انتخابی آزاد شده‌اند.'
              : 'چنانچه مبلغ بلیت را در صفحه واریزا کارت به کارت کرده‌اید، به محض تایید تراکنش توسط واریزا، این صفحه به صورت خودکار به‌روزرسانی شده و بلیت شما صادر می‌گردد.'}
          </p>
        </div>

        <div className="p-6 space-y-5">
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">کد پیگیری رزرو:</span>
              <span className="font-mono font-bold text-sm text-[#00F0FF]">
                {booking.id}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400">فیلم و سانس:</span>
              <span className="font-bold text-white">
                {booking.movieTitleFa} ({booking.date})
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400">صندلی‌های انتخابی:</span>
              <span className="text-white font-semibold">
                {booking.seatDetails
                  .map((s) => `ردیف ${s.rowLabel} صندلی ${toPersianDigits(s.seatNumber)}`)
                  .join('، ')}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400">مبلغ تراکنش:</span>
              <span className="font-bold text-[#00F0FF]">
                {formatPrice(booking.totalAmount)}
              </span>
            </div>

            {booking.attemptCode && (
              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <span className="text-slate-400">کد رهگیری واریزا:</span>
                <span className="font-mono font-bold text-emerald-400">
                  {booking.attemptCode}
                </span>
              </div>
            )}
          </div>

          <div className="space-y-3">
            {isConfirmed && (
              <Link
                href={`/ticket/${booking.id}`}
                className="w-full btn-cosmic py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-glow"
              >
                <Ticket className="w-4 h-4" />
                <span>مشاهده و دانلود بلیت الکترونیک</span>
              </Link>
            )}

            {!isConfirmed && !isExpired && (
              <>
                <button
                  type="button"
                  onClick={() => fetchBookingStatus(true)}
                  disabled={checking}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#7B2CBF] to-[#3A86FF] hover:opacity-95 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-glow transition-all disabled:opacity-50"
                >
                  <RefreshCw
                    className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`}
                  />
                  <span>
                    {checking
                      ? 'در حال استعلام مجدد...'
                      : 'به‌روزرسانی وضعیت پرداخت'}
                  </span>
                </button>

                {booking.varizaPayUrl && (
                  <a
                    href={booking.varizaPayUrl}
                    className="w-full py-3 px-4 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 font-bold text-xs flex items-center justify-center gap-2 transition-all"
                  >
                    <span>بازگشت به صفحه پرداخت واریزا جهت تکمیل واریز</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}

                <Link
                  href={`/ticket/${booking.id}`}
                  className="w-full py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-semibold text-xs flex items-center justify-center gap-2 transition-all"
                >
                  <span>مشاهده صفحه بلیت (در انتظار تایید)</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#3A86FF]" />
                </Link>
              </>
            )}

            {isExpired && (
              <Link
                href={`/screening/${booking.screeningId}`}
                className="w-full btn-cosmic py-3.5 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-glow"
              >
                <span>انتخاب مجدد صندلی و خرید بلیت</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>

          <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#06D6A0]" /> تایید خودکار با وب‌هوک رسمی واریزا
            </span>
            <Link href="/support" className="text-[#00F0FF] hover:underline">
              ثبت تیکت پشتیبانی
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 text-[#3A86FF] animate-spin" />
        </div>
      }
    >
      <PaymentCallbackContent />
    </Suspense>
  );
}
