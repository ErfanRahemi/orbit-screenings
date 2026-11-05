'use client';

import React, { useState, useEffect } from 'react';
import { Seat, SeatType, VenueTemplate, SeatMap } from '@/types';
import { formatPrice, toPersianDigits } from '@/lib/utils';
import {
  Grid,
  Save,
  Check,
  Trash2,
  FolderOpen,
  Layers,
  Crown,
  MinusCircle,
} from 'lucide-react';

interface SeatMapBuilderProps {
  initialSeatMap?: SeatMap;
  onSave?: (seatMap: SeatMap) => void;
}

export default function SeatMapBuilder({ initialSeatMap, onSave }: SeatMapBuilderProps) {
  const [rowsCount, setRowsCount] = useState<number>(initialSeatMap?.rows || 8);
  const [colsCount, setColsCount] = useState<number>(initialSeatMap?.cols || 12);
  const [vipPrice, setVipPrice] = useState<number>(initialSeatMap?.vipPrice || 250000);
  const [standardPrice, setStandardPrice] = useState<number>(initialSeatMap?.standardPrice || 190000);
  const [economyPrice, setEconomyPrice] = useState<number>(initialSeatMap?.economyPrice || 140000);

  const [selectedTool, setSelectedTool] = useState<SeatType>('standard');

  const [seats, setSeats] = useState<Seat[]>(() => {
    if (initialSeatMap?.seats) {
      return initialSeatMap.seats;
    }
    return generateInitialGrid(8, 12, 250000, 190000, 140000);
  });

  const [templates, setTemplates] = useState<VenueTemplate[]>([]);
  const [templateName, setTemplateName] = useState('');
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  async function loadTemplates() {
    try {
      const res = await fetch('/api/templates');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setTemplates(data.data);
      }
    } catch (e) {
      console.error(e);
    }
  }

  function generateInitialGrid(
    rCount: number,
    cCount: number,
    vipP: number,
    stdP: number,
    ecoP: number
  ): Seat[] {
    const list: Seat[] = [];
    for (let r = 1; r <= rCount; r++) {
      const rowChar = String.fromCharCode(64 + r);
      let sNum = 1;
      for (let c = 1; c <= cCount; c++) {
        const isAisle = c === 4 || c === cCount - 3;
        let type: SeatType = 'standard';
        let price = stdP;

        if (isAisle) {
          type = 'aisle';
          price = 0;
        } else if (r === 1) {
          type = 'economy';
          price = ecoP;
        } else if (r >= rCount - 1) {
          type = 'vip';
          price = vipP;
        }

        list.push({
          id: `r${r}-c${c}`,
          row: r,
          col: c,
          rowLabel: rowChar,
          seatNumber: isAisle ? 0 : sNum++,
          type,
          price,
          status: 'available',
        });
      }
    }
    return list;
  }

  const handleResizeGrid = (newRows: number, newCols: number) => {
    setRowsCount(newRows);
    setColsCount(newCols);

    const newSeats: Seat[] = [];
    for (let r = 1; r <= newRows; r++) {
      const rowChar = String.fromCharCode(64 + r);
      let sNum = 1;
      for (let c = 1; c <= newCols; c++) {
        const existing = seats.find((s) => s.row === r && s.col === c);
        if (existing) {
          newSeats.push({
            ...existing,
            rowLabel: rowChar,
            seatNumber: existing.type === 'aisle' ? 0 : sNum++,
          });
        } else {
          newSeats.push({
            id: `r${r}-c${c}`,
            row: r,
            col: c,
            rowLabel: rowChar,
            seatNumber: sNum++,
            type: 'standard',
            price: standardPrice,
            status: 'available',
          });
        }
      }
    }
    setSeats(newSeats);
  };

  const handleSeatClick = (seat: Seat) => {
    const updated = seats.map((s) => {
      if (s.id === seat.id) {
        let price = standardPrice;
        if (selectedTool === 'vip') price = vipPrice;
        else if (selectedTool === 'economy') price = economyPrice;
        else if (selectedTool === 'aisle') price = 0;

        return {
          ...s,
          type: selectedTool,
          price,
        };
      }
      return s;
    });

    reindexSeatNumbers(updated);
  };

  const handleApplyRow = (rowNum: number, tool: SeatType) => {
    const updated = seats.map((s) => {
      if (s.row === rowNum) {
        let price = standardPrice;
        if (tool === 'vip') price = vipPrice;
        else if (tool === 'economy') price = economyPrice;
        else if (tool === 'aisle') price = 0;

        return {
          ...s,
          type: tool,
          price,
        };
      }
      return s;
    });

    reindexSeatNumbers(updated);
  };

  function reindexSeatNumbers(rawSeats: Seat[]) {
    const byRow: { [r: number]: Seat[] } = {};
    for (let r = 1; r <= rowsCount; r++) {
      byRow[r] = rawSeats.filter((s) => s.row === r).sort((a, b) => a.col - b.col);
      let num = 1;
      for (const s of byRow[r]) {
        if (s.type === 'aisle') {
          s.seatNumber = 0;
        } else {
          s.seatNumber = num++;
        }
      }
    }
    setSeats([...rawSeats]);
  }

  const handleSaveAsTemplate = async () => {
    if (!templateName.trim()) {
      setStatusMessage('لطفاً یک نام برای الگو وارد کنید');
      return;
    }

    setSavingTemplate(true);
    try {
      const res = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: templateName.trim(),
          rows: rowsCount,
          cols: colsCount,
          vipPrice,
          standardPrice,
          economyPrice,
          seats: seats.map(({ id, row, col, rowLabel, seatNumber, type, price }) => ({
            id,
            row,
            col,
            rowLabel,
            seatNumber,
            type,
            price,
          })),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setStatusMessage(`الگوی «${templateName}» با موفقیت ذخیره شد.`);
        setTemplateName('');
        loadTemplates();
      }
    } catch (e) {
      setStatusMessage('خطا در ذخیره الگو');
    } finally {
      setSavingTemplate(false);
    }
  };

  const handleLoadTemplate = (tpl: VenueTemplate) => {
    setRowsCount(tpl.rows);
    setColsCount(tpl.cols);
    setVipPrice(tpl.vipPrice);
    setStandardPrice(tpl.standardPrice);
    setEconomyPrice(tpl.economyPrice);

    const loadedSeats: Seat[] = tpl.seats.map((s) => ({
      ...s,
      status: 'available',
    }));
    setSeats(loadedSeats);
    setStatusMessage(`الگوی «${tpl.name}» بارگذاری شد.`);
  };

  const handleDeleteTemplate = async (id: string, name: string) => {
    if (!confirm(`آیا از حذف الگوی «${name}» اطمینان دارید؟`)) return;
    try {
      await fetch(`/api/templates?id=${id}`, { method: 'DELETE' });
      loadTemplates();
    } catch (e) {
      console.error(e);
    }
  };

  const handleExport = () => {
    const seatMap: SeatMap = {
      rows: rowsCount,
      cols: colsCount,
      seats,
      vipPrice,
      standardPrice,
      economyPrice,
    };
    if (onSave) {
      onSave(seatMap);
    }
    setStatusMessage('نقشه صندلی‌ها با موفقیت ذخیره و اعمال شد.');
  };

  return (
    <div className="space-y-8">
      <div className="p-6 rounded-3xl bg-[#12131A] border border-white/10 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Grid className="w-5 h-5 text-[#3A86FF]" />
              سازنده بصری نقشه سالن و صندلی‌ها (Visual Venue Builder)
            </h3>
            <p className="text-xs text-slate-400">
              تعداد ردیف‌ها و ستون‌ها را مشخص کرده و با انتخاب ابزار قلم، روی صندلی‌ها کلیک کنید تا نوع آنها تغییر کند.
            </p>
          </div>

          <button
            onClick={handleExport}
            className="btn-cosmic px-6 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-glow"
          >
            <Check className="w-4 h-4" />
            <span>ذخیره و اعمال نقشه سالن</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-xs">
          <div className="space-y-1.5">
            <label className="text-slate-300 font-medium">تعداد ردیف‌ها (افقی):</label>
            <input
              type="number"
              min={3}
              max={20}
              value={rowsCount}
              onChange={(e) => handleResizeGrid(parseInt(e.target.value) || 5, colsCount)}
              className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white font-mono text-center focus:outline-none focus:border-[#3A86FF]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-300 font-medium">تعداد ستون‌ها (عمودی):</label>
            <input
              type="number"
              min={4}
              max={25}
              value={colsCount}
              onChange={(e) => handleResizeGrid(rowsCount, parseInt(e.target.value) || 6)}
              className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white font-mono text-center focus:outline-none focus:border-[#3A86FF]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-purple-300 font-medium">قیمت صندلی VIP (تومان):</label>
            <input
              type="number"
              step={10000}
              value={vipPrice}
              onChange={(e) => setVipPrice(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 rounded-xl bg-purple-950/20 border border-purple-500/30 text-white font-mono text-center focus:outline-none focus:border-purple-400"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[#3A86FF] font-medium">قیمت استاندارد (تومان):</label>
            <input
              type="number"
              step={10000}
              value={standardPrice}
              onChange={(e) => setStandardPrice(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 rounded-xl bg-blue-950/20 border border-blue-500/30 text-white font-mono text-center focus:outline-none focus:border-[#3A86FF]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-emerald-300 font-medium">قیمت اکونومی (تومان):</label>
            <input
              type="number"
              step={10000}
              value={economyPrice}
              onChange={(e) => setEconomyPrice(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-white font-mono text-center focus:outline-none focus:border-emerald-400"
            />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
          <span className="text-xs font-bold text-slate-400 flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#00F0FF]" />
            انتخاب قلم جهت رنگ‌آمیزی و تغییر نوع صندلی:
          </span>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setSelectedTool('standard')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                selectedTool === 'standard'
                  ? 'bg-[#3A86FF] text-white shadow-lg ring-2 ring-[#00F0FF]'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              <div className="w-3.5 h-3.5 rounded bg-[#181A24] border border-white/50" />
              <span>صندلی استاندارد ({formatPrice(standardPrice)})</span>
            </button>

            <button
              onClick={() => setSelectedTool('vip')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                selectedTool === 'vip'
                  ? 'bg-[#7B2CBF] text-white shadow-lg ring-2 ring-purple-300'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              <Crown className="w-3.5 h-3.5 text-yellow-300" />
              <span>صندلی VIP ویژه ({formatPrice(vipPrice)})</span>
            </button>

            <button
              onClick={() => setSelectedTool('economy')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                selectedTool === 'economy'
                  ? 'bg-emerald-600 text-white shadow-lg ring-2 ring-emerald-300'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              <div className="w-3.5 h-3.5 rounded bg-emerald-950 border border-emerald-500" />
              <span>صندلی اکونومی ({formatPrice(economyPrice)})</span>
            </button>

            <button
              onClick={() => setSelectedTool('aisle')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                selectedTool === 'aisle'
                  ? 'bg-slate-700 text-white shadow-lg ring-2 ring-slate-400'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              <MinusCircle className="w-3.5 h-3.5 text-slate-400" />
              <span>راهرو / فضای خالی</span>
            </button>

            <button
              onClick={() => setSelectedTool('blocked')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                selectedTool === 'blocked'
                  ? 'bg-red-700 text-white shadow-lg ring-2 ring-red-400'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              <div className="w-3.5 h-3.5 rounded bg-red-950 border border-red-500" />
              <span>رزرو پرسنل / مسدود</span>
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 sm:p-8 rounded-3xl bg-[#12131A] border border-white/10 overflow-x-auto shadow-2xl space-y-6">
        <div className="w-full max-w-2xl mx-auto text-center">
          <div className="cinema-screen" />
          <span className="text-[11px] font-bold tracking-widest text-[#3A86FF] uppercase">
            موقعیت پرده نمایش
          </span>
        </div>

        <div className="inline-block min-w-full flex flex-col items-center">
          <div className="space-y-3">
            {Array.from({ length: rowsCount }, (_, idx) => idx + 1).map((r) => {
              const rowSeats = seats
                .filter((s) => s.row === r)
                .sort((a, b) => a.col - b.col);
              const rowLabel = rowSeats[0]?.rowLabel || String.fromCharCode(64 + r);

              return (
                <div key={r} className="flex items-center gap-3">
                  <button
                    onClick={() => handleApplyRow(r, selectedTool)}
                    title={`تبدیل تمام صندلی‌های این ردیف به ${selectedTool}`}
                    className="px-2 py-1 rounded bg-white/5 hover:bg-white/15 text-[10px] text-slate-400 hover:text-white transition-colors"
                  >
                    ردیف {rowLabel} (اعمال قلم)
                  </button>

                  <div className="flex items-center gap-2">
                    {rowSeats.map((seat) => {
                      const isAisle = seat.type === 'aisle';
                      const isVip = seat.type === 'vip';
                      const isEconomy = seat.type === 'economy';
                      const isBlocked = seat.type === 'blocked';

                      let cellColor = 'bg-[#181A24] border-white/20 text-slate-300';
                      if (isAisle) {
                        cellColor = 'bg-transparent border-dashed border-white/10 text-transparent hover:border-white/30';
                      } else if (isVip) {
                        cellColor = 'bg-[#7B2CBF]/30 border-[#7B2CBF] text-purple-200';
                      } else if (isEconomy) {
                        cellColor = 'bg-emerald-950/30 border-emerald-500/50 text-emerald-300';
                      } else if (isBlocked) {
                        cellColor = 'bg-red-950/30 border-red-500/50 text-red-300';
                      }

                      return (
                        <button
                          key={seat.id}
                          onClick={() => handleSeatClick(seat)}
                          className={`w-8 h-8 rounded-lg border text-xs font-mono font-bold flex items-center justify-center transition-transform hover:scale-110 ${cellColor}`}
                        >
                          {isAisle ? '·' : toPersianDigits(seat.seatNumber)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl bg-[#12131A] border border-white/10 space-y-4">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Save className="w-4 h-4 text-[#00F0FF]" />
            ذخیره این چیدمان به عنوان الگوی آماده (Venue Template)
          </h4>
          <p className="text-xs text-slate-400">
            می‌توانید نقشه سالن را ذخیره و در چندین اکران استفاده کنید.
          </p>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="نام الگو (مثلاً: سینما فرهنگ — سالن اصلی)"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-[#3A86FF]"
            />
            <button
              onClick={handleSaveAsTemplate}
              disabled={savingTemplate}
              className="btn-cosmic px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-glow"
            >
              <Save className="w-3.5 h-3.5" />
              <span>ذخیره الگو</span>
            </button>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-[#12131A] border border-white/10 space-y-4">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <FolderOpen className="w-4 h-4 text-[#3A86FF]" />
            الگوهای ذخیره شده سالن‌ها ({toPersianDigits(templates.length)})
          </h4>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {templates.length === 0 ? (
              <span className="text-xs text-slate-500">هنوز الگویی ثبت نشده است.</span>
            ) : (
              templates.map((tpl) => (
                <div
                  key={tpl.id}
                  className="p-3 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <span className="font-bold text-white block">{tpl.name}</span>
                    <span className="text-[11px] text-slate-400">
                      {toPersianDigits(tpl.rows)} ردیف × {toPersianDigits(tpl.cols)} ستون
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleLoadTemplate(tpl)}
                      className="px-3 py-1.5 rounded-lg bg-[#3A86FF]/20 hover:bg-[#3A86FF]/40 text-[#00F0FF] border border-[#3A86FF]/30 text-xs font-semibold"
                    >
                      بارگذاری
                    </button>
                    <button
                      onClick={() => handleDeleteTemplate(tpl.id, tpl.name)}
                      className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {statusMessage && (
        <div className="p-4 rounded-2xl bg-[#00F0FF]/10 border border-[#00F0FF]/30 text-[#00F0FF] text-xs flex items-center justify-between">
          <span>{statusMessage}</span>
          <button onClick={() => setStatusMessage(null)}>
            <Check className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
