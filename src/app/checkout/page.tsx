'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Screening } from '@/types';
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
  CheckCircle2,
  XCircle,
  Lock,
  Loader2,
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

  const [showGateway, setShowGateway] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [gatewayError, setGatewayError] = useState<string | null>(null);

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
          <span className="text-xs text-slate-400">در حال بررسی صندلی‌ها و آماده‌سازی فاکتور...</span>
        </div>
      </div>
    );
  }

  if (error || !screening) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 rounded-3xl bg-[#12131A] border border-white/10 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-yellow-400 mx-auto" />
        <h2 className="text-base font-bold text-white">مشکلی در دریافت اطلاعات وجود دارد</h2>
        <p className="text-xs text-slate-400">{error || 'اطلاعات اکران نامعتبر است.'}</p>
        <Link
          href="/"
          className="inline-block px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold"
        >
          بازگشت به صفحه اصلی
        </Link>
      </div>
    );
  }

  const selectedSeats = screening.seatMap.seats.filter((s) => seatIds.includes(s.id));
  const totalAmount = selectedSeats.reduce((sum, s) => sum + s.price, 0);

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!buyerName.trim()) {
      setFormError('لطفاً نام و نام خانوادگی خود را وارد نمایید.');
      return;
    }

    if (!validateIranianMobile(buyerPhone)) {
      setFormError('شماره موبایل وارد شده معتبر نیست. لطفاً یک شماره ایرانی معتبر مانند ۰۹۱۲۳۴۵۶۷۸۹ وارد کنید.');
      return;
    }

    setShowGateway(true);
  };

  const handleSimulatePaymentSuccess = async () => {
    setPaymentProcessing(true);
    setGatewayError(null);

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

      if (result.success && result.data) {
        router.push(`/ticket/${result.data.id}`);
      } else {
        setGatewayError(result.error || 'خطایی در ثبت بلیت رخ داد.');
        setPaymentProcessing(false);
      }
    } catch (err) {
      setGatewayError('خطای ارتباط با سرور. لطفاً مجدداً تلاش کنید.');
      setPaymentProcessing(false);
    }
  };

  const handleSimulatePaymentFailure = () => {
    setGatewayError('پرداخت توسط کاربر لغو گردید یا تراکنش از سوی بانک ناموفق اعلام شد.');
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
          مرحله نهایی: تایید اطلاعات و پرداخت
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
                بلیت الکترونیک شما پس از پرداخت مستقیماً صادر شده و مشخصات برای احراز هویت در ورودی سالن استفاده می‌شود.
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
                  placeholder="مثال: پارسا ناصری"
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-[#3A86FF] focus:ring-1 focus:ring-[#3A86FF] transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#00F0FF]" />
                  <span>شماره موبایل (جهت پیگیری بلیت)</span>
                  <span className="text-red-400">*</span>
                </label>
                <input
                  type="tel"
                  required
                  dir="ltr"
                  placeholder="09123456789"
                  value={buyerPhone}
                  onChange={(e) => setBuyerPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-slate-500 text-sm font-mono text-left focus:outline-none focus:border-[#3A86FF] focus:ring-1 focus:ring-[#3A86FF] transition-all"
                />
                <span className="text-[11px] text-slate-500 block">
                  کد رهگیری بلیت به این شماره تخصیص می‌یابد.
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
                className="w-full btn-cosmic py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-glow"
              >
                <CreditCard className="w-4 h-4 text-white" />
                <span>اتصال به درگاه و پرداخت آنلاین ({formatPrice(totalAmount)})</span>
              </button>
            </form>

            <div className="pt-4 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-[#06D6A0]" /> تراکنش امن و رمزنگاری‌شده
              </span>
              <span>امکان لغو یا پیگیری با کد بلیت</span>
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
                <p className="text-xs text-slate-400 font-light truncate">{screening.titleEn}</p>
                <div className="text-[11px] text-[#00F0FF] font-medium flex items-center gap-1 pt-1">
                  <MapPin className="w-3 h-3" />
                  <span>{screening.city} — {screening.venueName}</span>
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
                        {seat.type === 'vip' ? 'VIP' : seat.type === 'economy' ? 'اکونومی' : 'استاندارد'}
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
              <span className="text-sm font-bold text-white">مبلغ کل قابل پرداخت:</span>
              <span className="text-lg font-black text-[#00F0FF]">
                {formatPrice(totalAmount)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {showGateway && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl bg-[#12131A] border border-[#3A86FF]/40 shadow-2xl overflow-hidden animate-fadeIn">
            <div className="bg-gradient-to-r from-[#181A24] to-[#202434] p-5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#7B2CBF] to-[#3A86FF] flex items-center justify-center text-white">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">درگاه پرداخت الکترونیک شاپرک</h3>
                  <span className="text-[10px] text-emerald-400">محیط شبیه‌ساز پرداخت آزمایشی اوربیت</span>
                </div>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-white/10 text-slate-300 font-mono">
                {formatPrice(totalAmount)}
              </span>
            </div>

            <div className="p-6 space-y-6">
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>پذیرنده:</span>
                  <span className="text-white font-semibold">اوربیت سینما (ORBIT Exclusive)</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>نام خریدار:</span>
                  <span className="text-white">{buyerName}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>شماره تماس:</span>
                  <span className="text-white font-mono" dir="ltr">{buyerPhone}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>تعداد صندلی‌ها:</span>
                  <span className="text-white">{toPersianDigits(selectedSeats.length)} بلیت</span>
                </div>
              </div>

              {gatewayError && (
                <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <span>{gatewayError}</span>
                </div>
              )}

              <div className="space-y-3 pt-2">
                <button
                  disabled={paymentProcessing}
                  onClick={handleSimulatePaymentSuccess}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all duration-200 disabled:opacity-50"
                >
                  {paymentProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>در حال ثبت رزرو و صدور بلیت...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>پرداخت موفق آزمایشی (Simulate Success)</span>
                    </>
                  )}
                </button>

                <button
                  disabled={paymentProcessing}
                  onClick={handleSimulatePaymentFailure}
                  className="w-full py-3 px-4 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 font-semibold text-xs flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4" />
                  <span>انصراف / خطای پرداخت (Simulate Failure)</span>
                </button>
              </div>

              <div className="text-center pt-2">
                <button
                  onClick={() => setShowGateway(false)}
                  disabled={paymentProcessing}
                  className="text-xs text-slate-400 hover:text-white transition-colors"
                >
                  بازگشت و تغییر مشخصات
                </button>
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
