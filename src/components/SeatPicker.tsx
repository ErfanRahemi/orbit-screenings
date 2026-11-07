'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Screening, Seat } from '@/types';
import { formatPrice, toPersianDigits } from '@/lib/utils';
import {
  Ticket,
  ChevronLeft,
  Info,
  Check,
  X,
  Sparkles,
  AlertCircle,
} from 'lucide-react';

interface SeatPickerProps {
  screening: Screening;
}

export default function SeatPicker({ screening }: SeatPickerProps) {
  const router = useRouter();
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);
  const [hoveredSeat, setHoveredSeat] = useState<Seat | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { rows, cols, seats, vipPrice, standardPrice, economyPrice } = screening.seatMap;

  const selectedSeats = seats.filter((s) => selectedSeatIds.includes(s.id));
  const totalPrice = selectedSeats.reduce((sum, s) => sum + s.price, 0);

  const toggleSeat = (seat: Seat) => {
    setErrorMsg(null);
    if (screening.isSoldOut) {
      setErrorMsg('فروش بلیت برای این اکران متوقف شده است (تکمیل ظرفیت / Sold Out).');
      return;
    }
    if (seat.type === 'aisle' || seat.type === 'blocked' || seat.status === 'sold') {
      return;
    }

    if (selectedSeatIds.includes(seat.id)) {
      setSelectedSeatIds((prev) => prev.filter((id) => id !== seat.id));
    } else {
      if (selectedSeatIds.length >= 8) {
        setErrorMsg('حداکثر ۸ صندلی در هر تراکنش قابل انتخاب است.');
        return;
      }
      setSelectedSeatIds((prev) => [...prev, seat.id]);
    }
  };

  const removeSeat = (seatId: string) => {
    setSelectedSeatIds((prev) => prev.filter((id) => id !== seatId));
  };

  const handleProceedToCheckout = () => {
    if (selectedSeatIds.length === 0) {
      setErrorMsg('لطفاً حداقل یک صندلی انتخاب نمایید.');
      return;
    }

    const queryParams = new URLSearchParams({
      screeningId: screening.id,
      seats: selectedSeatIds.join(','),
    });

    router.push(`/checkout?${queryParams.toString()}`);
  };

  const seatsByRow: { [rowNum: number]: Seat[] } = {};
  for (let r = 1; r <= rows; r++) {
    seatsByRow[r] = seats
      .filter((s) => s.row === r)
      .sort((a, b) => a.col - b.col);
  }

  return (
    <div className="w-full space-y-8 pb-32">
      
      {/* Curved Cinema Screen */}
      <div className="w-full max-w-4xl mx-auto pt-6 text-center">
        <div className="cinema-screen" />
        <div className="flex items-center justify-center gap-2 text-xs font-semibold tracking-widest text-[#3A86FF] uppercase">
          <span>پرده نمایش سینما</span>
        </div>
        <p className="text-[11px] text-slate-500 mt-1">
          زاویه دید صندلی‌ها رو به پرده نقره‌ای است
        </p>
      </div>

      {/* Seat Map Container */}
      <div className="w-full overflow-x-auto pb-6 pt-2">
        <div className="inline-block min-w-full align-middle">
          <div className="max-w-4xl mx-auto p-4 sm:p-8 rounded-3xl bg-[#12131A]/80 border border-white/10 backdrop-blur-xl shadow-2xl flex flex-col items-center">
            
            <div className="space-y-3 sm:space-y-4">
              {Array.from({ length: rows }, (_, idx) => idx + 1).map((r) => {
                const rowSeats = seatsByRow[r] || [];
                const rowLabel = rowSeats[0]?.rowLabel || String.fromCharCode(64 + r);

                return (
                  <div key={r} className="flex items-center gap-2 sm:gap-3">
                    <div className="w-6 sm:w-8 text-center text-xs font-bold text-slate-500 select-none">
                      {rowLabel}
                    </div>

                    <div className="flex items-center gap-1.5 sm:gap-2.5">
                      {rowSeats.map((seat) => {
                        const isSelected = selectedSeatIds.includes(seat.id);
                        const isAisle = seat.type === 'aisle';
                        const isBlocked = seat.type === 'blocked';
                        const isSold = seat.status === 'sold';
                        const isVip = seat.type === 'vip';
                        const isEconomy = seat.type === 'economy';

                        if (isAisle) {
                          return (
                            <div
                              key={seat.id}
                              className="w-7 h-7 sm:w-9 sm:h-9 invisible pointer-events-none"
                            />
                          );
                        }

                        let seatBgClass = 'bg-[#181A24] border-white/20 text-slate-300 hover:border-[#3A86FF] hover:scale-110';

                        if (isSold) {
                          seatBgClass = 'bg-white/5 border-white/5 text-slate-600 cursor-not-allowed opacity-40';
                        } else if (isBlocked) {
                          seatBgClass = 'bg-red-950/20 border-red-900/30 text-red-500/40 cursor-not-allowed opacity-40';
                        } else if (isSelected) {
                          seatBgClass = 'bg-gradient-to-tr from-[#7B2CBF] to-[#3A86FF] border-[#00F0FF] text-white shadow-glow scale-110 font-bold';
                        } else if (isVip) {
                          seatBgClass = 'bg-[#7B2CBF]/15 border-[#7B2CBF]/60 text-purple-200 hover:border-[#7B2CBF] hover:bg-[#7B2CBF]/30';
                        } else if (isEconomy) {
                          seatBgClass = 'bg-emerald-950/15 border-emerald-600/40 text-emerald-300 hover:border-emerald-500';
                        }

                        return (
                          <button
                            key={seat.id}
                            disabled={isSold || isBlocked}
                            onClick={() => toggleSeat(seat)}
                            onMouseEnter={() => setHoveredSeat(seat)}
                            onMouseLeave={() => setHoveredSeat(null)}
                            title={`ردیف ${seat.rowLabel} - صندلی ${seat.seatNumber}`}
                            className={`relative w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl border flex items-center justify-center text-[10px] sm:text-xs font-medium transition-all duration-200 ${seatBgClass}`}
                          >
                            {isSelected ? (
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            ) : isSold ? (
                              <X className="w-3.5 h-3.5 opacity-60" />
                            ) : (
                              <span>{toPersianDigits(seat.seatNumber)}</span>
                            )}

                            {isVip && !isSelected && !isSold && !isBlocked && (
                              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#7B2CBF] flex items-center justify-center text-[8px] text-white">
                                ★
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    <div className="w-6 sm:w-8 text-center text-xs font-bold text-slate-500 select-none">
                      {rowLabel}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Hover Tooltip Preview */}
            <div className="mt-8 h-8 flex items-center justify-center">
              {hoveredSeat && hoveredSeat.type !== 'aisle' ? (
                <div className="flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs animate-fadeIn">
                  <span className="font-bold text-white">
                    ردیف {hoveredSeat.rowLabel} — صندلی {toPersianDigits(hoveredSeat.seatNumber)}
                  </span>
                  <span className="text-slate-400">|</span>
                  <span
                    className={
                      hoveredSeat.type === 'vip'
                        ? 'text-purple-300 font-semibold'
                        : hoveredSeat.type === 'economy'
                        ? 'text-emerald-300'
                        : 'text-[#3A86FF]'
                    }
                  >
                    {hoveredSeat.type === 'vip'
                      ? 'صندلی ویژه VIP'
                      : hoveredSeat.type === 'economy'
                      ? 'صندلی اقتصادی'
                      : 'صندلی استاندارد'}
                  </span>
                  <span className="text-slate-400">|</span>
                  <span className="font-bold text-[#00F0FF]">
                    {formatPrice(hoveredSeat.price)}
                  </span>
                </div>
              ) : (
                <span className="text-[11px] text-slate-500 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5" />
                  برای مشاهده جزئیات، نشانگر را روی صندلی مورد نظر ببرید یا کلیک کنید.
                </span>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="max-w-4xl mx-auto p-4 sm:p-6 rounded-2xl bg-[#12131A]/60 border border-white/5 backdrop-blur-md">
        <h4 className="text-xs font-bold text-slate-400 mb-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#3A86FF]" />
          راهنمای انواع صندلی و قیمت‌گذاری
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
            <div className="w-5 h-5 rounded-lg bg-[#7B2CBF]/20 border border-[#7B2CBF] flex items-center justify-center text-[10px] text-purple-200">
              ★
            </div>
            <div>
              <div className="font-bold text-white text-[11px]">صندلی VIP</div>
              <div className="text-[10px] text-purple-300 font-semibold">{formatPrice(vipPrice)}</div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
            <div className="w-5 h-5 rounded-lg bg-[#181A24] border border-white/30 flex items-center justify-center text-[10px] text-slate-300">
              ۲
            </div>
            <div>
              <div className="font-bold text-white text-[11px]">استاندارد</div>
              <div className="text-[10px] text-slate-400">{formatPrice(standardPrice)}</div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
            <div className="w-5 h-5 rounded-lg bg-emerald-950/20 border border-emerald-500/50 flex items-center justify-center text-[10px] text-emerald-300">
              ۱
            </div>
            <div>
              <div className="font-bold text-white text-[11px]">اکونومی</div>
              <div className="text-[10px] text-emerald-400">{formatPrice(economyPrice)}</div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
            <div className="w-5 h-5 rounded-lg bg-gradient-to-tr from-[#7B2CBF] to-[#3A86FF] border border-[#00F0FF] flex items-center justify-center text-[10px] text-white">
              ✓
            </div>
            <div>
              <div className="font-bold text-[#00F0FF] text-[11px]">انتخاب شما</div>
              <div className="text-[10px] text-slate-400">در حال رزرو</div>
            </div>
          </div>

          <div className="col-span-2 sm:col-span-1 flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.02] border border-white/5 opacity-50">
            <div className="w-5 h-5 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[10px] text-slate-500">
              ✕
            </div>
            <div>
              <div className="font-bold text-slate-400 text-[11px]">رزرو شده / مسدود</div>
              <div className="text-[10px] text-slate-500">غیرقابل انتخاب</div>
            </div>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="max-w-4xl mx-auto p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#0B0C10]/90 backdrop-blur-2xl border-t border-white/10 py-4 px-4 sm:px-6 shadow-[0_-10px_35px_rgba(0,0,0,0.7)]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="w-full md:w-auto flex flex-wrap items-center gap-2">
            <div className="text-xs text-slate-400 flex items-center gap-1.5 ml-2">
              <Ticket className="w-4 h-4 text-[#00F0FF]" />
              <span>صندلی‌های انتخابی ({toPersianDigits(selectedSeatIds.length)}):</span>
            </div>

            {selectedSeats.length === 0 ? (
              <span className="text-xs text-slate-500 italic">
                هنوز صندلی انتخاب نشده است
              </span>
            ) : (
              <div className="flex flex-wrap items-center gap-1.5 max-h-16 overflow-y-auto">
                {selectedSeats.map((seat) => (
                  <span
                    key={seat.id}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gradient-to-r from-[#7B2CBF]/30 to-[#3A86FF]/30 border border-[#3A86FF]/50 text-white text-xs font-semibold"
                  >
                    <span>ردیف {seat.rowLabel} - صندلی {toPersianDigits(seat.seatNumber)}</span>
                    <button
                      onClick={() => removeSeat(seat.id)}
                      className="text-slate-400 hover:text-white transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="w-full md:w-auto flex items-center justify-between md:justify-end gap-6">
            <div className="text-left md:text-right">
              <div className="text-[11px] text-slate-400">مجموع مبلغ قابل پرداخت:</div>
              <div className="text-lg font-black text-white bg-gradient-to-r from-[#00F0FF] to-white bg-clip-text text-transparent">
                {formatPrice(totalPrice)}
              </div>
            </div>

            {screening.isSoldOut ? (
              <button
                disabled
                className="px-8 py-3.5 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 bg-rose-950/60 border border-rose-500/40 text-rose-300 cursor-not-allowed"
              >
                <span>تکمیل ظرفیت (Sold Out)</span>
              </button>
            ) : (
              <button
                disabled={selectedSeatIds.length === 0}
                onClick={handleProceedToCheckout}
                className={`px-8 py-3.5 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all duration-300 ${
                  selectedSeatIds.length > 0
                    ? 'btn-cosmic shadow-glow cursor-pointer'
                    : 'bg-white/10 text-slate-500 cursor-not-allowed border border-white/5'
                }`}
              >
                <span>تایید و ادامه خرید</span>
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
