import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import QRCode from 'qrcode';
import { getBookingById, getScreeningById, getSiteSettings } from '@/lib/db';
import { formatPrice, toPersianDigits } from '@/lib/utils';
import PrintButton from '@/components/PrintButton';
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
} from 'lucide-react';

interface PageProps {
  params: { bookingId: string };
}

export default async function TicketPage({ params }: PageProps) {
  const booking = getBookingById(params.bookingId);

  if (!booking) {
    notFound();
  }

  const screening = getScreeningById(booking.screeningId);
  const settings = getSiteSettings();

  const qrPayload = JSON.stringify({
    code: booking.id,
    screening: booking.movieTitleEn,
    seats: booking.seatDetails.map((s) => `${s.rowLabel}${s.seatNumber}`).join(','),
    buyer: booking.buyerName,
  });

  let qrDataUrl = '';
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

  return (
    <div className="flex-1 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="no-print max-w-xl w-full text-center space-y-3 mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white shadow-[0_0_25px_rgba(16,185,129,0.5)]">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white">
          خرید بلیت شما با موفقیت تایید شد!
        </h1>
        <p className="text-xs sm:text-sm text-slate-300">
          بلیت الکترونیک شما صادر گردید. لطفاً کد پیگیری یا تصویر بلیت را هنگام ورود به سالن همراه داشته باشید.
        </p>
      </div>

      <div className="ticket-card relative max-w-2xl w-full rounded-3xl overflow-hidden bg-[#12131A] border-2 border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl">
        <div className="relative p-6 sm:p-8 bg-gradient-to-r from-[#7B2CBF] via-[#3A86FF] to-[#00F0FF] text-white overflow-hidden">
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
                  بلیت رسمی ورود به سالن
                </span>
              </div>
            </div>

            <div className="text-left">
              <span className="text-[10px] text-white/70 block uppercase">شماره مرجع</span>
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
                  <span className="font-semibold text-white">{booking.buyerName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">موبایل:</span>
                  <span className="font-mono text-white" dir="ltr">{booking.buyerPhone}</span>
                </div>
              </div>

              <div className="text-xs pt-1">
                <span className="text-slate-400">مجموع پرداختی:</span>{' '}
                <span className="font-bold text-[#00F0FF]">{formatPrice(booking.totalAmount)}</span>
              </div>
            </div>

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
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-white/5">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#06D6A0]" /> بلیت معتبر الکترونیک اوربیت
            </span>
            <span>تاریخ ثبت: {new Date(booking.createdAt).toLocaleDateString('fa-IR')}</span>
          </div>
        </div>

        <div className="absolute top-1/2 -left-4 w-8 h-8 rounded-full bg-[#0B0C10] border border-white/10 hidden sm:block" />
        <div className="absolute top-1/2 -right-4 w-8 h-8 rounded-full bg-[#0B0C10] border border-white/10 hidden sm:block" />
      </div>

      <div className="no-print mt-8 flex flex-wrap items-center justify-center gap-4">
        <PrintButton />

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
