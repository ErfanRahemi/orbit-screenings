'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Screening, Booking } from '@/types';
import { formatPrice, toPersianDigits, validateIranianMobile } from '@/lib/utils';
import {
  ShieldCheck,
  CreditCard,
  Ticket,
  MapPin,
  Calendar,
  Clock,
  User,
  Phone,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  Lock,
  Loader2,
  Sparkles,
} from 'lucide-react';

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const screeningId = searchParams.get('screeningId');
  const seatIdsParam = searchParams.get('seats');

  const [screening, setScreening] = useState<Screening | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [createdBooking, setCreatedBooking] = useState<Booking | null>(null);
  const [varizaPayUrl, setVarizaPayUrl] = useState<string | null>(null);

  const seatIds = seatIdsParam ? seatIdsParam.split(',') : [];

  useEffect(() => {
    if (!screeningId || seatIds.length === 0) {
      router.push('/');
      return;
    }

    async function loadScreening() {
      try {
        const res = await fetch(`/api/screenings/${screeningId}`);
        const data = await res.json();
        if (data.success && data.data) {
          setScreening(data.data);
        } else {
          setError(data.error || 'رویداد یافت نشد');
        }
      } catch (err) {
        setError('خطا در بارگذاری اطلاعات');
      } finally {
        setLoading(false);
      }
    }

    loadScreening();
  }, [screeningId, seatIdsParam, router]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-[#3A86FF] animate-spin" />
          <span className="text-xs text-slate-400">
            در حال بررسی صندلی‌ها و آماده‌سازی فاکتور...
          </span>
        </div>
      </div>
    );
  }

  if (error || !screening) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 rounded-3xl bg-[#12131A] border border-white/10 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-yellow-400 mx-auto" />
        <h2 className="text-base font-bold text-white">
          مشکلی در دریافت اطلاعات وجود دارد
        </h2>
        <p className="text-xs text-slate-400">
          {error || 'اطلاعات اکران نامعتبر است.'}
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold"
        >
          بازگشت به صفحه اصلی
        </Link>
      </div>
    );
  }

  if (screening.isSoldOut) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 rounded-3xl bg-[#12131A] border border-rose-500/30 text-center space-y-4 shadow-2xl">
        <AlertTriangle className="w-12 h-12 text-rose-400 mx-auto" />
        <h2 className="text-base font-bold text-white">
          فروش بلیت متوقف شده است (Sold Out)
        </h2>
        <p className="text-xs text-slate-300">
          به دلیل تکمیل ظرفیت سالن، امکان خرید بلیت جدید برای این سانس وجود ندارد.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold"
        >
          مشاهده سایر اکران‌ها
        </Link>
      </div>
    );
  }

  const selectedSeats = screening.seatMap.seats.filter((s) =>
    seatIds.includes(s.id)
  );
  const totalAmount = selectedSeats.reduce((sum, s) => sum + s.price, 0);

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!buyerName.trim()) {
      setFormError('لطفاً نام و نام خانوادگی خود را وارد نمایید.');
      return;
    }

    if (!validateIranianMobile(buyerPhone)) {
      setFormError(
        'شماره موبایل وارد شده معتبر نیست. لطفاً یک شماره ایرانی معتبر مانند ۰۹۱۲۳۴۵۶۷۸۹ وارد کنید.'
      );
      return;
    }

    setPaymentProcessing(true);

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          screeningId: screening.id,
          buyerName: buyerName.trim(),
          buyerPhone: buyerPhone.trim(),
          seatIds,
        }),
      });

      const result = await res.json();

      if (result.success && result.data && result.payUrl) {
        setCreatedBooking(result.data);
        setVarizaPayUrl(result.payUrl);
        // Redirect user to Variza hosted payment page
        window.location.href = result.payUrl;
      } else {
        setFormError(
          result.error || 'خطایی در ساخت لینک پرداخت واریزا رخ داد.'
        );
        setPaymentProcessing(false);
      }
    } catch (err) {
      setFormError('خطای ارتباط با سرور. لطفاً مجدداً تلاش کنید.');
      setPaymentProcessing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <Link
          href={`/screening/${screening.id}`}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowRight className="w-4 h-4 text-[#3A86FF]" />
          <span>ویرایش صندلی‌ها و بازگشت به نقشه سالن</span>
        </Link>
        <span className="text-xs text-[#00F0FF] flex items-center gap-1">
          <ShieldCheck className="w-4 h-4" />
          مرحله نهایی: تایید اطلاعات و پرداخت امن واریزا
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-[#12131A] border border-white/10 backdrop-blur-xl shadow-xl space-y-6">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <User className="w-5 h-5 text-[#3A86FF]" />
                اطلاعات خریدار (بدون نیاز به ثبت‌نام)
              </h2>
              <p className="text-xs text-slate-400">
                صندلی‌های انتخابی شما به مدت ۳۰ دقیقه قفل شده و پس از تکمیل پرداخت در درگاه خودکار واریزا، بلیت الکترونیک بلافاصله صادر می‌شود.
              </p>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#3A86FF]" />
                  <span>نام و نام خانوادگی خریدار</span>
                  <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  disabled={paymentProcessing}
                  placeholder="مثال: پارسا ناصری"
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-[#3A86FF] focus:ring-1 focus:ring-[#3A86FF] transition-all disabled:opacity-50"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#00F0FF]" />
                  <span>شماره موبایل (جهت پیگیری و تایید پرداخت)</span>
                  <span className="text-red-400">*</span>
                </label>
                <input
                  type="tel"
                  required
                  disabled={paymentProcessing}
                  dir="ltr"
                  placeholder="09123456789"
                  value={buyerPhone}
                  onChange={(e) => setBuyerPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-slate-500 text-sm font-mono text-left focus:outline-none focus:border-[#3A86FF] focus:ring-1 focus:ring-[#3A86FF] transition-all disabled:opacity-50"
                />
                <span className="text-[11px] text-slate-500 block">
                  کد رهگیری بلیت و استعلام پرداخت واریزا به این شماره تخصیص می‌یابد.
                </span>
              </div>

              {formError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={paymentProcessing}
                className="w-full btn-cosmic py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-glow disabled:opacity-60"
              >
                {paymentProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>در حال قفل صندلی‌ها و اتصال به درگاه واریزا...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 text-white" />
                    <span>
                      پرداخت آنلاین از طریق درگاه واریزا ({formatPrice(totalAmount)})
                    </span>
                  </>
                )}
              </button>
            </form>

            <div className="pt-4 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-[#06D6A0]" /> درگاه پرداخت خودکار واریزا (Variza.ir)
              </span>
              <span>مهلت تکمیل پرداخت: ۳۰ دقیقه</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl bg-[#12131A] border border-white/10 backdrop-blur-xl shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Ticket className="w-4 h-4 text-[#00F0FF]" />
                خلاصه پیش‌فاکتور بلیت
              </h3>
              <span className="text-xs text-slate-400">
                {toPersianDigits(selectedSeats.length)} صندلی
              </span>
            </div>

            <div className="flex gap-4 items-center">
              <img
                src={screening.posterUrl}
                alt={screening.titleFa}
                className="w-16 h-24 rounded-xl object-cover border border-white/10 flex-shrink-0"
              />
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white">{screening.titleFa}</h4>
                <p className="text-xs text-slate-400 font-light truncate">
                  {screening.titleEn}
                </p>
                <div className="text-[11px] text-[#00F0FF] font-medium flex items-center gap-1 pt-1">
                  <MapPin className="w-3 h-3" />
                  <span>
                    {screening.city} — {screening.venueName}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2 text-xs text-slate-300">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#3A86FF]" /> تاریخ اکران:
                </span>
                <span className="font-semibold text-white">{screening.date}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-purple-400" /> ساعت سانس:
                </span>
                <span className="font-semibold text-white">{screening.time}</span>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-400 block">
                ریز صندلی‌های انتخابی:
              </span>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {selectedSeats.map((seat) => (
                  <div
                    key={seat.id}
                    className="flex items-center justify-between p-2 rounded-xl bg-white/[0.03] border border-white/5 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center font-bold text-white text-[10px]">
                        {seat.rowLabel}
                      </span>
                      <span className="text-white font-medium">
                        ردیف {seat.rowLabel} — صندلی {toPersianDigits(seat.seatNumber)}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-slate-400">
                        {seat.type === 'vip'
                          ? 'VIP'
                          : seat.type === 'economy'
                          ? 'اکونومی'
                          : 'استاندارد'}
                      </span>
                    </div>
                    <span className="font-semibold text-[#00F0FF]">
                      {formatPrice(seat.price)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              <span className="text-sm font-bold text-white">
                مبلغ کل قابل پرداخت:
              </span>
              <span className="text-lg font-black text-[#00F0FF]">
                {formatPrice(totalAmount)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {createdBooking && varizaPayUrl && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl bg-[#12131A] border border-[#3A86FF]/40 shadow-2xl overflow-hidden animate-fadeIn">
            <div className="bg-gradient-to-r from-[#181A24] to-[#202434] p-5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#7B2CBF] to-[#3A86FF] flex items-center justify-center text-white">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    درگاه پرداخت خودکار واریزا (Variza)
                  </h3>
                  <span className="text-[10px] text-emerald-400">
                    صندلی‌های شما به مدت ۳۰ دقیقه رزرو موقت شدند
                  </span>
                </div>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-white/10 text-[#00F0FF] font-bold">
                {formatPrice(totalAmount)}
              </span>
            </div>

            <div className="p-6 space-y-5">
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2.5 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>کد رزرو موقت بلیت:</span>
                  <span className="text-[#00F0FF] font-mono font-bold">
                    {createdBooking.id}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>شناسه پرداخت واریزا:</span>
                  <span className="text-white font-mono">
                    {createdBooking.varizaSlug}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>نام خریدار:</span>
                  <span className="text-white font-semibold">{buyerName}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>شماره همراه:</span>
                  <span className="text-white font-mono" dir="ltr">
                    {buyerPhone}
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-center gap-2 text-center py-2">
                <Loader2 className="w-6 h-6 text-[#00F0FF] animate-spin" />
                <p className="text-xs text-slate-300">
                  در حال انتقال خودکار به صفحه پرداخت امن واریزا...
                </p>
                <p className="text-[11px] text-slate-500">
                  چنانچه به صورت خودکار منتقل نشدید، روی دکمه زیر کلیک کنید.
                </p>
              </div>

              <div className="space-y-3">
                <a
                  href={varizaPayUrl}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all duration-200"
                >
                  <span>ورود به صفحه پرداخت واریزا</span>
                  <ExternalLink className="w-4 h-4" />
                </a>

                <Link
                  href={`/payment/callback?bookingId=${encodeURIComponent(
                    createdBooking.id
                  )}`}
                  className="w-full py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 font-semibold text-xs flex items-center justify-center gap-2 transition-all"
                >
                  <span>مشاهده وضعیت تایید پرداخت و بلیت</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 text-[#3A86FF] animate-spin" />
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
