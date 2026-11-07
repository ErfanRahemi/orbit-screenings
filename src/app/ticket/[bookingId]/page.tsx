import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import QRCode from 'qrcode';
import {
  getBookingById,
  getBookingBySlug,
  getScreeningById,
  getSiteSettings,
} from '@/lib/db';
import { formatPrice, toPersianDigits } from '@/lib/utils';
import PrintButton from '@/components/PrintButton';
import TicketStatusPoller from '@/components/TicketStatusPoller';
import {
  Film,
  Ticket,
  MapPin,
  Calendar,
  Clock,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  ExternalLink,
  Lock,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ bookingId: string }>;
}

export default async function TicketPage({ params }: PageProps) {
  const { bookingId } = await params;
  const booking =
    getBookingById(bookingId) || getBookingBySlug(bookingId);

  if (!booking) {
    notFound();
  }

  const screening = getScreeningById(booking.screeningId);
  const settings = getSiteSettings();

  const isConfirmed = booking.status === 'confirmed';
  const isPending = booking.status === 'pending';
  const isExpired =
    booking.status === 'expired' || booking.status === 'cancelled';

  let qrDataUrl = '';
  if (isConfirmed) {
    const qrPayload = JSON.stringify({
      code: booking.id,
      screening: booking.movieTitleEn,
      seats: booking.seatDetails
        .map((s) => `${s.rowLabel}${s.seatNumber}`)
        .join(','),
      buyer: booking.buyerName,
      attemptCode: booking.attemptCode || booking.paymentRef,
    });

    try {
      qrDataUrl = await QRCode.toDataURL(qrPayload, {
        width: 220,
        margin: 1,
        color: {
          dark: '#0B0C10',
          light: '#FFFFFF',
        },
      });
    } catch (err) {
      console.error('Error generating QR code:', err);
    }
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="no-print max-w-xl w-full text-center space-y-3 mb-8">
        {isConfirmed ? (
          <>
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white shadow-[0_0_25px_rgba(16,185,129,0.5)]">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              خرید بلیت شما با موفقیت تایید شد!
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              بلیت الکترونیک شما صادر گردید. لطفاً کد پیگیری یا تصویر بلیت را هنگام ورود به سالن همراه داشته باشید.
            </p>
          </>
        ) : isPending ? (
          <>
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400">
              <Clock className="w-8 h-8 animate-pulse" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              رزرو موقت ثبت شد — در انتظار تکمیل پرداخت
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              صندلی‌های شما به مدت ۳۰ دقیقه قفل شده‌اند. به محض تکمیل پرداخت در درگاه واریزا، بارکد رسمی ورود صادر می‌گردد.
            </p>
            <div className="pt-1">
              <TicketStatusPoller
                bookingId={booking.id}
                currentStatus={booking.status}
              />
            </div>
          </>
        ) : (
          <>
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              این رزرو منقضی یا لغو شده است
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              مهلت ۳۰ دقیقه‌ای پرداخت به پایان رسیده و صندلی‌های انتخابی آزاد شده‌اند.
            </p>
          </>
        )}
      </div>

      <div className="ticket-card relative max-w-2xl w-full rounded-3xl overflow-hidden bg-[#12131A] border-2 border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl">
        <div
          className={`relative p-6 sm:p-8 text-white overflow-hidden ${
            isConfirmed
              ? 'bg-gradient-to-r from-[#7B2CBF] via-[#3A86FF] to-[#00F0FF]'
              : isPending
              ? 'bg-gradient-to-r from-amber-700 via-amber-600 to-orange-500'
              : 'bg-gradient-to-r from-rose-900 via-rose-800 to-slate-800'
          }`}
        >
          <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-white/10 blur-xl pointer-events-none" />

          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {settings.logoUrl ? (
                <div className="w-10 h-10 rounded-xl bg-black/40 backdrop-blur p-1 flex items-center justify-center border border-white/20 overflow-hidden">
                  <img
                    src={settings.logoUrl}
                    alt="Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-xl bg-black/40 backdrop-blur flex items-center justify-center text-white border border-white/20">
                  <Film className="w-5 h-5" />
                </div>
              )}
              <div>
                <span className="text-xs uppercase tracking-widest text-white/80 block font-bold">
                  {settings.brandName || 'ORBIT'} CINEMA — EXCLUSIVE PASS
                </span>
                <span className="text-sm sm:text-base font-black">
                  {isConfirmed
                    ? 'بلیت رسمی ورود به سالن'
                    : isPending
                    ? 'پیش‌فاکتور رزرو (در انتظار پرداخت واریزا)'
                    : 'رزرو منقضی شده'}
                </span>
              </div>
            </div>

            <div className="text-left">
              <span className="text-[10px] text-white/70 block uppercase">
                شماره مرجع
              </span>
              <span className="font-mono font-bold text-sm sm:text-base text-white tracking-wider">
                {booking.id}
              </span>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          <div className="space-y-1 border-b border-white/10 pb-5">
            <span className="text-xs text-purple-400 font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              {booking.city} • {screening?.genre || 'اکران اختصاصی سینمایی'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              {booking.movieTitleFa}
            </h2>
            <p className="text-xs text-slate-400 font-light">
              {booking.movieTitleEn}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1">
              <span className="text-slate-400 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#3A86FF]" /> سینما و سالن نمایش:
              </span>
              <span className="font-bold text-white text-sm block">
                {booking.venueName}
              </span>
              <span className="text-[11px] text-slate-400 block">
                {booking.venueAddress}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#00F0FF]" /> زمان و سانس برگزاری:
              </span>
              <span className="font-bold text-white text-sm block">
                {booking.date}
              </span>
              <span className="text-[11px] text-purple-300 block font-semibold flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> ساعت {booking.time}
              </span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-4 w-full">
              <div className="space-y-1">
                <span className="text-xs text-slate-400 flex items-center gap-1.5">
                  <Ticket className="w-4 h-4 text-[#00F0FF]" /> صندلی‌های رزرو شده:
                </span>
                <div className="flex flex-wrap gap-2 pt-1">
                  {booking.seatDetails.map((seat) => (
                    <span
                      key={seat.seatId}
                      className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#7B2CBF]/40 to-[#3A86FF]/40 border border-[#3A86FF]/60 text-white font-bold text-xs"
                    >
                      ردیف {seat.rowLabel} — صندلی {toPersianDigits(seat.seatNumber)}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-white/5 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">خریدار:</span>
                  <span className="font-semibold text-white">
                    {booking.buyerName}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">موبایل:</span>
                  <span className="font-mono text-white" dir="ltr">
                    {booking.buyerPhone}
                  </span>
                </div>
              </div>

              <div className="text-xs pt-1 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-slate-400">مبلغ کل:</span>{' '}
                  <span className="font-bold text-[#00F0FF]">
                    {formatPrice(booking.totalAmount)}
                  </span>
                </div>
                {(booking.attemptCode || booking.paymentRef) && (
                  <div>
                    <span className="text-slate-400">کد رهگیری پرداخت:</span>{' '}
                    <span className="font-mono font-bold text-emerald-400">
                      {booking.attemptCode || booking.paymentRef}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {isConfirmed ? (
              <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white text-black flex-shrink-0 shadow-lg">
                {qrDataUrl && (
                  <img
                    src={qrDataUrl}
                    alt={`QR code for ${booking.id}`}
                    className="w-32 h-32 object-contain"
                  />
                )}
                <span className="text-[10px] font-mono font-bold tracking-widest mt-1 text-slate-800">
                  {booking.id}
                </span>
              </div>
            ) : isPending ? (
              <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center flex-shrink-0 w-full sm:w-44 space-y-2">
                <Lock className="w-8 h-8 text-amber-400" />
                <span className="text-[11px] font-bold text-amber-300">
                  بارکد ورود پس از تایید پرداخت فعال می‌شود
                </span>
                {booking.varizaPayUrl && (
                  <a
                    href={booking.varizaPayUrl}
                    className="w-full py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-[11px] flex items-center justify-center gap-1 transition-all"
                  >
                    <span>پرداخت در واریزا</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            ) : null}
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-white/5">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#06D6A0]" />
              {isConfirmed
                ? 'بلیت معتبر الکترونیک اوربیت (تایید شده توسط واریزا)'
                : isPending
                ? 'در انتظار تایید تراکنش از درگاه واریزا'
                : 'رزرو منقضی شده'}
            </span>
            <span>
              تاریخ ثبت: {new Date(booking.createdAt).toLocaleDateString('fa-IR')}
            </span>
          </div>
        </div>

        <div className="absolute top-1/2 -left-4 w-8 h-8 rounded-full bg-[#0B0C10] border border-white/10 hidden sm:block" />
        <div className="absolute top-1/2 -right-4 w-8 h-8 rounded-full bg-[#0B0C10] border border-white/10 hidden sm:block" />
      </div>

      <div className="no-print mt-8 flex flex-wrap items-center justify-center gap-4">
        {isConfirmed && <PrintButton />}

        {isPending && booking.varizaPayUrl && (
          <a
            href={booking.varizaPayUrl}
            className="btn-cosmic px-6 py-3 rounded-2xl font-bold text-xs flex items-center gap-2 shadow-glow"
          >
            <span>تکمیل پرداخت در درگاه واریزا</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        )}

        <Link
          href="/"
          className="px-6 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-xs flex items-center gap-2 transition-colors"
        >
          <span>مشاهده سایر اکران‌ها</span>
          <ArrowRight className="w-4 h-4 text-[#3A86FF]" />
        </Link>
      </div>
    </div>
  );
}
