'use client';

import React, { useState, useEffect } from 'react';
import { Screening, Booking, Seat } from '@/types';
import { formatPrice, toPersianDigits } from '@/lib/utils';
import {
  Users,
  Search,
  Download,
  Ticket,
  TrendingUp,
  Percent,
  UserCheck,
  Eye,
  X,
  Trash2,
  AlertTriangle,
  Lock,
  Unlock,
  ShieldAlert,
  Sparkles,
  Loader2,
  CheckCircle2,
} from 'lucide-react';

export default function BookingsDashboard() {
  const [screenings, setScreenings] = useState<Screening[]>([]);
  const [selectedScreeningId, setSelectedScreeningId] = useState<string>('');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [holdingSeatId, setHoldingSeatId] = useState<string | null>(null);
  const [quickToggleHoldMode, setQuickToggleHoldMode] = useState(false);

  const [inspectedSeat, setInspectedSeat] = useState<Seat | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const sRes = await fetch('/api/screenings');
      const sData = await sRes.json();
      if (sData.success && Array.isArray(sData.data)) {
        setScreenings(sData.data);
        if (sData.data.length > 0) {
          setSelectedScreeningId(sData.data[0].id);
        }
      }

      const bRes = await fetch('/api/bookings');
      const bData = await bRes.json();
      if (bData.success && Array.isArray(bData.data)) {
        setBookings(bData.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const currentScreening = screenings.find((s) => s.id === selectedScreeningId);
  const screeningBookings = bookings.filter((b) => b.screeningId === selectedScreeningId);

  const filteredBookings = screeningBookings.filter((b) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      b.buyerName.toLowerCase().includes(q) ||
      b.buyerPhone.includes(q) ||
      b.id.toLowerCase().includes(q)
    );
  });

  const validSeats = currentScreening?.seatMap.seats.filter(
    (s) => s.type !== 'aisle' && s.type !== 'blocked'
  ) || [];

  const isAdminHold = (seat: Seat) => {
    return (
      seat.bookedBy?.bookingId === 'ORB-ADMIN-HOLD' ||
      seat.bookedBy?.buyerName === 'رزرو مدیریت (غیرقابل فروش)'
    );
  };

  const totalCapacity = validSeats.length;
  const soldSeatsCount = validSeats.filter((s) => s.status === 'sold').length;
  const adminHoldCount = validSeats.filter((s) => s.status === 'sold' && isAdminHold(s)).length;
  const customerSoldCount = validSeats.filter((s) => s.status === 'sold' && !isAdminHold(s)).length;
  const remainingSeatsCount = totalCapacity - soldSeatsCount;
  const totalRevenue = screeningBookings
    .filter((b) => b.status === 'confirmed')
    .reduce((sum, b) => sum + b.totalAmount, 0);
  const occupancyRate = totalCapacity > 0 ? Math.round((soldSeatsCount / totalCapacity) * 100) : 0;

  const handleToggleSeatHold = async (seat: Seat) => {
    if (!currentScreening) return;
    if (seat.type === 'aisle') return;

    if (seat.status === 'sold' && !isAdminHold(seat)) {
      alert('این صندلی توسط مشتری خریداری شده است. برای لغو ابتدا آن را از جدول پایین حذف نمایید.');
      return;
    }

    setHoldingSeatId(seat.id);
    try {
      const res = await fetch(`/api/screenings/${currentScreening.id}/block-seats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seatId: seat.id }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        setScreenings((prev) =>
          prev.map((s) => (s.id === data.data.id ? data.data : s))
        );
        const updatedSeat = data.data.seatMap.seats.find((s: Seat) => s.id === seat.id);
        if (updatedSeat) {
          setInspectedSeat(updatedSeat);
        }
      } else {
        alert(data.error || 'خطا در تغییر وضعیت صندلی');
      }
    } catch (err) {
      alert('خطای برقراری ارتباط با سرور');
    } finally {
      setHoldingSeatId(null);
    }
  };

  const handleExportCSV = () => {
    if (!currentScreening || screeningBookings.length === 0) {
      alert('رزروی برای خروجی اکسل در این رویداد وجود ندارد.');
      return;
    }

    const headers = [
      'کد پیگیری بلیت',
      'نام خریدار',
      'شماره تماس',
      'صندلی‌های رزرو شده',
      'تعداد بلیت',
      'مبلغ پرداختی (تومان)',
      'تاریخ و ساعت ثبت',
      'کد رهگیری بانکی',
    ];

    const rows = screeningBookings.map((b) => [
      b.id,
      b.buyerName,
      b.buyerPhone,
      b.seatDetails.map((s) => `${s.rowLabel}${s.seatNumber}`).join(' - '),
      b.seatDetails.length,
      b.totalAmount,
      new Date(b.createdAt).toLocaleString('fa-IR'),
      b.paymentRef,
    ]);

    const csvContent =
      '\uFEFF' +
      [headers.join(','), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `orbit-attendees-${currentScreening.titleEn.replace(/\s+/g, '-')}-${Date.now()}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteBooking = async (booking: Booking) => {
    const seatsText = booking.seatDetails.map((s) => `${s.rowLabel}${s.seatNumber}`).join('، ');
    const confirmed = confirm(
      `آیا از حذف کامل رزرو «${booking.buyerName}» به کد بلیت «${booking.id}» اطمینان دارید؟\n\nصندلی‌های (${seatsText}) بلافاصله آزاد شده و مجدداً برای خرید در دسترس کاربران قرار خواهند گرفت.`
    );
    if (!confirmed) return;

    setDeletingId(booking.id);
    try {
      const res = await fetch(`/api/bookings/${booking.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        await loadData();
        setInspectedSeat(null);
      } else {
        alert(data.error || 'خطا در حذف رزرو');
      }
    } catch (err) {
      alert('خطای اتصال به سرور');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="p-6 rounded-3xl bg-[#12131A] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-[#3A86FF]" />
            داشبورد آمار زنده و فهرست تماشاچیان (Check-in List)
          </h3>
          <p className="text-xs text-slate-400">
            رویداد مورد نظر را انتخاب کنید تا آمار فروش، صندلی‌های رزرو شده و مشخصات خریداران را مشاهده نمایید.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedScreeningId}
            onChange={(e) => {
              setSelectedScreeningId(e.target.value);
              setInspectedSeat(null);
            }}
            className="px-4 py-2.5 rounded-xl bg-[#181A24] border border-white/10 text-white text-xs font-semibold focus:outline-none focus:border-[#3A86FF] cursor-pointer"
          >
            {screenings.map((s) => (
              <option key={s.id} value={s.id}>
                {s.titleFa} ({s.city} — {s.date})
              </option>
            ))}
          </select>

          <button
            onClick={handleExportCSV}
            className="btn-cosmic px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-glow flex-shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>خروجی اکسل (CSV)</span>
          </button>
        </div>
      </div>

      {currentScreening && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="p-4 rounded-2xl bg-[#12131A] border border-white/10 space-y-1">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Ticket className="w-3.5 h-3.5 text-slate-400" />
                ظرفیت سالن
              </span>
              <div className="text-xl font-black text-white">
                {toPersianDigits(totalCapacity)} صندلی
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#12131A] border border-white/10 space-y-1">
              <span className="text-[11px] text-purple-300 flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-purple-400" />
                بلیت‌های فروخته شده
              </span>
              <div className="text-xl font-black text-[#00F0FF]">
                {toPersianDigits(customerSoldCount)} بلیت
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#12131A] border border-rose-500/30 bg-rose-500/[0.04] space-y-1">
              <span className="text-[11px] text-rose-300 flex items-center gap-1 font-semibold">
                <Lock className="w-3.5 h-3.5 text-rose-400" />
                غیرقابل فروش (رزرو مدیریت)
              </span>
              <div className="text-xl font-black text-rose-400">
                {toPersianDigits(adminHoldCount)} صندلی
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#12131A] border border-white/10 space-y-1">
              <span className="text-[11px] text-emerald-300 flex items-center gap-1">
                <Ticket className="w-3.5 h-3.5 text-emerald-400" />
                صندلی‌های خالی و آزاد
              </span>
              <div className="text-xl font-black text-emerald-400">
                {toPersianDigits(remainingSeatsCount)} صندلی
              </div>
            </div>

            <div className="col-span-2 lg:col-span-1 p-4 rounded-2xl bg-gradient-to-r from-[#7B2CBF]/20 to-[#3A86FF]/20 border border-[#3A86FF]/40 space-y-1">
              <span className="text-[11px] text-[#00F0FF] flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                مجموع فروش گیشه
              </span>
              <div className="text-base sm:text-lg font-black text-white truncate">
                {formatPrice(totalRevenue)}
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-[#12131A] border border-white/10 space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Eye className="w-4 h-4 text-[#00F0FF]" />
                  <span>نقشه زنده سالن و مدیریت صندلی‌ها</span>
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  برای غیرقابل فروش کردن صندلی‌ها می‌توانید روی آنها کلیک کنید یا حالت «قفل‌گذاری سریع» را فعال فرمایید.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setQuickToggleHoldMode(!quickToggleHoldMode)}
                  className={`px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
                    quickToggleHoldMode
                      ? 'bg-rose-500 text-white border-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.4)] animate-pulse'
                      : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
                  }`}
                >
                  {quickToggleHoldMode ? (
                    <Lock className="w-3.5 h-3.5" />
                  ) : (
                    <Unlock className="w-3.5 h-3.5 text-slate-400" />
                  )}
                  <span>
                    {quickToggleHoldMode
                      ? 'حالت قفل‌گذاری سریع فعال است (کلیک = قفل / باز)'
                      : 'فعال‌سازی حالت قفل‌گذاری مستقیم با یک کلیک'}
                  </span>
                </button>

                <div className="flex items-center gap-3 text-[11px] p-2 rounded-xl bg-white/[0.02] border border-white/5">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-white/10 border border-white/20" />
                    <span className="text-slate-400">خالی</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-[#7B2CBF] border border-purple-400 shadow-sm" />
                    <span className="text-purple-300 font-semibold">فروخته شده</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-rose-950 border border-rose-500 shadow-sm flex items-center justify-center text-[8px] text-rose-300">
                      ✕
                    </div>
                    <span className="text-rose-400 font-semibold">غیرقابل فروش (مدیریت)</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full max-w-xl mx-auto text-center">
              <div className="cinema-screen" />
            </div>

            <div className="overflow-x-auto pb-4">
              <div className="inline-block min-w-full flex flex-col items-center">
                <div className="space-y-2.5">
                  {Array.from({ length: currentScreening.seatMap.rows }, (_, idx) => idx + 1).map((r) => {
                    const rowSeats = currentScreening.seatMap.seats
                      .filter((s) => s.row === r)
                      .sort((a, b) => a.col - b.col);
                    const rowLabel = rowSeats[0]?.rowLabel || String.fromCharCode(64 + r);

                    return (
                      <div key={r} className="flex items-center gap-2">
                        <div className="w-6 text-center text-xs font-bold text-slate-500">
                          {rowLabel}
                        </div>

                        <div className="flex items-center gap-1.5">
                          {rowSeats.map((seat) => {
                            const isAisle = seat.type === 'aisle';
                            const isSold = seat.status === 'sold';
                            const isHeldByAdmin = isAdminHold(seat);
                            const isInspected = inspectedSeat?.id === seat.id;
                            const isProcessing = holdingSeatId === seat.id;

                            if (isAisle) {
                              return <div key={seat.id} className="w-7 h-7 invisible" />;
                            }

                            let btnStyle = 'bg-white/5 border-white/10 text-slate-400 hover:border-white/40';
                            if (isHeldByAdmin) {
                              btnStyle =
                                'bg-rose-950/80 border-rose-500 text-rose-300 font-bold shadow-[0_0_8px_rgba(244,63,94,0.3)] hover:scale-110 hover:border-rose-300';
                            } else if (isSold) {
                              btnStyle =
                                'bg-[#7B2CBF] border-purple-300 text-white font-bold shadow-glow hover:scale-110';
                            }
                            if (isInspected) {
                              btnStyle =
                                'bg-gradient-to-tr from-[#3A86FF] to-[#00F0FF] border-white text-black font-black scale-125 ring-2 ring-white';
                            }

                            return (
                              <button
                                key={seat.id}
                                disabled={isProcessing}
                                onClick={() => {
                                  if (quickToggleHoldMode) {
                                    handleToggleSeatHold(seat);
                                  } else {
                                    setInspectedSeat(seat);
                                  }
                                }}
                                className={`w-7 h-7 rounded-lg border text-[10px] flex items-center justify-center transition-all ${btnStyle}`}
                                title={
                                  isHeldByAdmin
                                    ? `ردیف ${seat.rowLabel} - صندلی ${seat.seatNumber} (غیرقابل فروش توسط مدیریت)`
                                    : isSold
                                    ? `ردیف ${seat.rowLabel} - صندلی ${seat.seatNumber} (فروخته شده به مشتری)`
                                    : `ردیف ${seat.rowLabel} - صندلی ${seat.seatNumber} (خالی)`
                                }
                              >
                                {isProcessing ? (
                                  <Loader2 className="w-3 h-3 animate-spin text-white" />
                                ) : isHeldByAdmin ? (
                                  <Lock className="w-3 h-3 text-rose-400" />
                                ) : (
                                  toPersianDigits(seat.seatNumber)
                                )}
                              </button>
                            );
                          })}
                        </div>

                        <div className="w-6 text-center text-xs font-bold text-slate-500">
                          {rowLabel}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {inspectedSeat && (
              <div className="p-5 rounded-2xl bg-white/[0.04] border border-[#3A86FF]/50 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs animate-fadeIn">
                <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                  <div>
                    <span className="text-slate-400 block text-[11px]">صندلی انتخاب شده:</span>
                    <span className="font-bold text-white text-sm">
                      ردیف {inspectedSeat.rowLabel} — صندلی {toPersianDigits(inspectedSeat.seatNumber)}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">وضعیت جاری:</span>
                    {isAdminHold(inspectedSeat) ? (
                      <span className="font-bold text-rose-400 flex items-center gap-1">
                        <Lock className="w-3.5 h-3.5" />
                        غیرقابل فروش (رزرو مدیریت — پر شده برای مشتریان)
                      </span>
                    ) : inspectedSeat.status === 'sold' ? (
                      <span className="font-bold text-purple-300">
                        فروخته شده به خریدار
                      </span>
                    ) : (
                      <span className="font-bold text-emerald-400">
                        خالی / قابل خرید توسط مشتریان
                      </span>
                    )}
                  </div>

                  {isAdminHold(inspectedSeat) ? (
                    <div>
                      <span className="text-slate-400 block text-[11px]">توضیح وضعیت:</span>
                      <span className="text-slate-300">
                        این صندلی برای تمام کاربران به صورت پر شده نمایش داده می‌شود و امکان خرید آن وجود ندارد.
                      </span>
                    </div>
                  ) : inspectedSeat.bookedBy ? (
                    <>
                      <div>
                        <span className="text-slate-400 block text-[11px]">خریدار:</span>
                        <span className="font-semibold text-white">
                          {inspectedSeat.bookedBy.buyerName}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">شماره تماس:</span>
                        <span className="font-mono text-white" dir="ltr">
                          {inspectedSeat.bookedBy.buyerPhone}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">کد بلیت:</span>
                        <span className="font-mono text-[#00F0FF]">
                          {inspectedSeat.bookedBy.bookingId}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div>
                      <span className="text-slate-400 block text-[11px]">قیمت مصوب:</span>
                      <span className="font-semibold text-white">
                        {formatPrice(inspectedSeat.price)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0">
                  {/* Action 1: If Admin Hold -> Unblock button */}
                  {isAdminHold(inspectedSeat) && (
                    <button
                      onClick={() => handleToggleSeatHold(inspectedSeat)}
                      disabled={holdingSeatId !== null}
                      className="px-4 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-50"
                    >
                      {holdingSeatId === inspectedSeat.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Unlock className="w-3.5 h-3.5" />
                      )}
                      <span>آزادسازی و قابل فروش کردن مجدد این صندلی</span>
                    </button>
                  )}

                  {/* Action 2: If Available -> Make Unsellable button */}
                  {inspectedSeat.status === 'available' && (
                    <button
                      onClick={() => handleToggleSeatHold(inspectedSeat)}
                      disabled={holdingSeatId !== null}
                      className="px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-50"
                    >
                      {holdingSeatId === inspectedSeat.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Lock className="w-3.5 h-3.5" />
                      )}
                      <span>غیرقابل فروش کردن این صندلی (نمایش به عنوان پر شده برای مشتریان)</span>
                    </button>
                  )}

                  {/* Action 3: If Customer Sold -> Delete attendee */}
                  {inspectedSeat.status === 'sold' && !isAdminHold(inspectedSeat) && inspectedSeat.bookedBy?.bookingId && (
                    <button
                      onClick={() => {
                        const b = bookings.find(
                          (item) => item.id.toUpperCase() === inspectedSeat.bookedBy?.bookingId?.toUpperCase()
                        );
                        if (b) {
                          handleDeleteBooking(b);
                        } else {
                          alert('اطلاعات رزرو متناظر یافت نشد.');
                        }
                      }}
                      disabled={deletingId !== null}
                      className="px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>حذف این تماشاچی و آزادسازی صندلی</span>
                    </button>
                  )}

                  <button
                    onClick={() => setInspectedSeat(null)}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-3xl bg-[#12131A] border border-white/10 overflow-hidden shadow-xl space-y-4 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#00F0FF]" />
                  جدول ثبت‌نام‌کنندگان و بررسی پذیرش (Check-in)
                </h4>
                <span className="text-xs text-slate-400">
                  {toPersianDigits(filteredBookings.length)} خریدار ثبت شده
                </span>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="جستجوی نام، تلفن یا کد بلیت..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pr-9 pl-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-[#3A86FF]"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-white/[0.02] text-slate-400 font-semibold border-b border-white/10">
                  <tr>
                    <th className="p-3">کد بلیت</th>
                    <th className="p-3">نام و نام خانوادگی خریدار</th>
                    <th className="p-3">شماره همراه</th>
                    <th className="p-3">صندلی‌ها</th>
                    <th className="p-3">وضعیت و کد رهگیری واریزا</th>
                    <th className="p-3">مبلغ پرداختی</th>
                    <th className="p-3">زمان ثبت خرید</th>
                    <th className="p-3 text-center">عملیات ادمین</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredBookings.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-500">
                        موردی برای نمایش یافت نشد.
                      </td>
                    </tr>
                  ) : (
                    filteredBookings.map((b) => (
                      <tr key={b.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="p-3 font-mono font-bold text-[#00F0FF]">{b.id}</td>
                        <td className="p-3 font-semibold text-white">{b.buyerName}</td>
                        <td className="p-3 font-mono text-slate-300" dir="ltr">{b.buyerPhone}</td>
                        <td className="p-3">
                          <div className="flex flex-wrap gap-1">
                            {b.seatDetails.map((s) => (
                              <span
                                key={s.seatId}
                                className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[11px] text-slate-200"
                              >
                                ردیف {s.rowLabel} - صندلی {toPersianDigits(s.seatNumber)}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex flex-col gap-1">
                            {b.status === 'confirmed' ? (
                              <span className="inline-flex w-fit items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                                <CheckCircle2 className="w-3 h-3" /> تایید شده
                              </span>
                            ) : b.status === 'pending' ? (
                              <span className="inline-flex w-fit items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                                در انتظار پرداخت واریزا
                              </span>
                            ) : (
                              <span className="inline-flex w-fit items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 text-[10px] font-bold">
                                منقضی شده
                              </span>
                            )}
                            {(b.attemptCode || b.paymentRef) && (
                              <span className="font-mono text-[10px] text-slate-400">
                                {b.attemptCode || b.paymentRef}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-3 font-bold text-white">{formatPrice(b.totalAmount)}</td>
                        <td className="p-3 text-slate-400 text-[11px]">
                          {new Date(b.createdAt).toLocaleString('fa-IR')}
                        </td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => handleDeleteBooking(b)}
                            disabled={deletingId === b.id}
                            className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/20 text-[11px] font-semibold inline-flex items-center gap-1.5 transition-all shadow-sm disabled:opacity-50"
                            title="حذف کامل از لیست تماشاچیان و آزادسازی صندلی‌ها"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>{deletingId === b.id ? 'در حال حذف...' : 'حذف تماشاچی'}</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
