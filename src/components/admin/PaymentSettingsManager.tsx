'use client';

import React, { useState, useEffect } from 'react';
import { SiteSettings, SavedPaymentCard } from '@/types';
import {
  CreditCard,
  Clock,
  Shield,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Lock,
  Globe,
  Sliders,
  Sparkles,
  HelpCircle,
  Plus,
  Trash2,
  Check,
  Zap,
} from 'lucide-react';

const VARIZA_EXPIRY_OPTIONS = [
  { value: '30m', label: '۳۰ دقیقه (پیش‌نهادی برای رزرو سینما)' },
  { value: '1h', label: '۱ ساعت' },
  { value: '2h', label: '۲ ساعت' },
  { value: '6h', label: '۶ ساعت' },
  { value: '1d', label: '۱ روز (۲۴ ساعت)' },
  { value: '3d', label: '۳ روز' },
  { value: '1w', label: '۱ هفته' },
];

const PRESET_HOLD_MINUTES = [10, 15, 20, 30, 45, 60];

const INITIAL_DEFAULT_CARDS: SavedPaymentCard[] = [
  { id: 'card-1', label: 'کارت حساب پیش‌فرض', last4: '8589' },
];

export default function PaymentSettingsManager() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [seatHoldMinutes, setSeatHoldMinutes] = useState<number>(30);
  const [paymentExpiresIn, setPaymentExpiresIn] = useState<string>('30m');
  const [varizaCardLast4, setVarizaCardLast4] = useState<string>('8589');
  const [savedCards, setSavedCards] = useState<SavedPaymentCard[]>(INITIAL_DEFAULT_CARDS);
  const [newCardLabel, setNewCardLabel] = useState<string>('');
  const [newCardLast4, setNewCardLast4] = useState<string>('');
  const [isAddingCard, setIsAddingCard] = useState<boolean>(false);

  const [appUrl, setAppUrl] = useState<string>('');
  const [varizaApiKey, setVarizaApiKey] = useState<string>('');
  const [varizaWebhookSecret, setVarizaWebhookSecret] = useState<string>('');
  const [paymentInstructions, setPaymentInstructions] = useState<string>('');

  const [showApiKey, setShowApiKey] = useState(false);
  const [showSecret, setShowSecret] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      if (data.success && data.data) {
        const s: SiteSettings = data.data;
        setSeatHoldMinutes(s.seatHoldMinutes || 30);
        setPaymentExpiresIn(s.paymentExpiresIn || '30m');
        setVarizaCardLast4(s.varizaCardLast4 || '8589');

        if (Array.isArray(s.savedCards) && s.savedCards.length > 0) {
          setSavedCards(s.savedCards);
        } else if (s.varizaCardLast4) {
          setSavedCards([
            { id: 'card-default', label: 'کارت فعال فعلی', last4: s.varizaCardLast4 },
          ]);
        }

        const currentOrigin =
          typeof window !== 'undefined' ? window.location.origin : '';
        setAppUrl(
          s.appUrl && !s.appUrl.includes('small-crabs-say.loca.lt')
            ? s.appUrl
            : currentOrigin
        );
        setVarizaApiKey(s.varizaApiKey || '');
        setVarizaWebhookSecret(s.varizaWebhookSecret || '');
        setPaymentInstructions(s.paymentInstructions || '');
      }
    } catch (e) {
      console.error(e);
      setErrorMsg('خطا در بارگذاری تنظیمات درگاه پرداخت.');
    } finally {
      setLoading(false);
    }
  }

  const handleSelectCard = (last4: string) => {
    setVarizaCardLast4(last4);
    setSuccessMsg(`کارت مقصد با موفقیت به شماره ۴ رقم آخر (${last4}) تغییر یافت.`);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const handleAddNewCard = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanLast4 = newCardLast4.trim();
    const cleanLabel = newCardLabel.trim() || `کارت •••• ${cleanLast4}`;

    if (!cleanLast4) {
      alert('لطفاً ۴ رقم آخر کارت را وارد کنید.');
      return;
    }

    if (cleanLast4.length !== 4 && cleanLast4.toLowerCase() !== 'random') {
      alert('شماره کارت باید دقیقاً ۴ رقم باشد (یا عبارت random).');
      return;
    }

    const newCard: SavedPaymentCard = {
      id: `card-${Date.now()}`,
      label: cleanLabel,
      last4: cleanLast4,
    };

    const updated = [...savedCards, newCard];
    setSavedCards(updated);
    setVarizaCardLast4(cleanLast4);
    setNewCardLabel('');
    setNewCardLast4('');
    setIsAddingCard(false);
    setSuccessMsg(`کارت جدید «${cleanLabel}» اضافه و به عنوان کارت مقصد فعال انتخاب شد.`);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const handleDeleteCard = (id: string) => {
    if (savedCards.length <= 1) {
      alert('حداقل یک کارت باید در لیست ذخیره بماند.');
      return;
    }
    const filtered = savedCards.filter((c) => c.id !== id);
    setSavedCards(filtered);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    if (seatHoldMinutes < 3 || seatHoldMinutes > 300) {
      setErrorMsg('زمان قفل صندلی‌ها باید بین ۳ تا ۳۰۰ دقیقه باشد.');
      setSaving(false);
      return;
    }

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seatHoldMinutes: Number(seatHoldMinutes),
          paymentExpiresIn,
          varizaCardLast4: varizaCardLast4.trim(),
          savedCards,
          appUrl: appUrl.trim().replace(/\/+$/, ''),
          varizaApiKey: varizaApiKey.trim() || undefined,
          varizaWebhookSecret: varizaWebhookSecret.trim() || undefined,
          paymentInstructions: paymentInstructions.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMsg(
          'تنظیمات و کارت مقصد پرداخت واریزا با موفقیت ذخیره و اعمال شد.'
        );
        setTimeout(() => setSuccessMsg(null), 5000);
      } else {
        setErrorMsg(data.error || 'خطا در ذخیره تنظیمات');
      }
    } catch {
      setErrorMsg('خطای برقراری ارتباط با سرور.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-[#00F0FF] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="p-6 rounded-3xl bg-[#12131A] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Sliders className="w-5 h-5 text-[#00F0FF]" />
            مدیریت پارامترها و کارت‌های مقصد درگاه واریزا (Variza.ir)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            تغییر کارت مقصد دریافت وجوه کارت‌به‌کارت، کنترل مهلت پرداخت و زمان قفل صندلی‌ها
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            درگاه فعال و متصل
          </span>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {successMsg && (
          <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* SECTION 1: Destination Card Management (Requested Feature) */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#12131A] border border-white/10 space-y-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#7B2CBF]/30 to-[#00F0FF]/30 border border-[#00F0FF]/40 flex items-center justify-center text-[#00F0FF]">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>مدیریت کارت مقصد واریز وجه</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-[#00F0FF] border border-cyan-500/30">
                    واریزا
                  </span>
                </h4>
                <p className="text-xs text-slate-400">
                  شماره کارت حسابی را که مایلید مبالغ خرید بلیت به آن واریز شود انتخاب یا ویرایش کنید
                </p>
              </div>
            </div>

            {/* Currently Active Card Indicator */}
            <div className="p-2.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-teal-500/15 to-transparent border border-emerald-500/30 flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block">کارت مقصد فعال جاری:</span>
                <span className="font-mono text-emerald-300 font-black text-sm tracking-widest" dir="ltr">
                  •••• {varizaCardLast4 || 'پیش‌فرض'}
                </span>
              </div>
            </div>
          </div>

          {/* Direct Input for 4 digits */}
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
            <label className="font-bold text-white text-xs flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#00F0FF]" />
                تنظیم سریع ۴ رقم آخر کارت مقصد جدید:
              </span>
              <span className="text-[11px] text-slate-400 font-normal">
                (باید با کارت‌های ثبت‌شده شما در پنل variza.ir مطابقت داشته باشد)
              </span>
            </label>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  maxLength={10}
                  dir="ltr"
                  value={varizaCardLast4}
                  onChange={(e) => setVarizaCardLast4(e.target.value.trim())}
                  placeholder="مثال: 8589"
                  className="w-full px-4 py-3 rounded-xl bg-[#181A24] border border-white/20 text-white font-mono text-center tracking-widest text-base font-black focus:outline-none focus:border-[#00F0FF]"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleSelectCard('random')}
                  className={`px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                    varizaCardLast4 === 'random'
                      ? 'bg-[#3A86FF] border-[#3A86FF] text-white shadow-glow'
                      : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                  }`}
                  title="توزیع خودکار بین کارت‌های فعال دارای کمترین تراکنش امروز"
                >
                  🔀 انتخاب خودکار کارت کم‌ترافیک (random)
                </button>

                <button
                  type="button"
                  onClick={() => setIsAddingCard(!isAddingCard)}
                  className="px-3.5 py-2.5 rounded-xl bg-[#7B2CBF]/30 hover:bg-[#7B2CBF]/50 border border-[#7B2CBF]/60 text-purple-200 text-xs font-semibold flex items-center gap-1.5 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>ثبت در لیست کارت‌های من</span>
                </button>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
              هنگامی که مشتری روی دکمه پرداخت کلیک می‌کند، لینک پرداخت واریزا اختصاصاً برای این کارت ساخته می‌شود و خریدار در صفحه واریزا شماره کارت کامل همین حساب را جهت کارت‌به‌کارت مشاهده خواهد کرد.
            </p>
          </div>

          {/* Add New Card Form (Collapsible) */}
          {isAddingCard && (
            <div className="p-4 sm:p-5 rounded-2xl bg-[#181A24] border border-[#7B2CBF]/40 space-y-3 animate-fadeIn">
              <span className="text-xs font-bold text-purple-300 flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#00F0FF]" />
                افزودن کارت جدید به فهرست حساب‌ها جهت سوئیچ سریع:
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
                <div className="sm:col-span-6 space-y-1">
                  <label className="text-[11px] text-slate-400">نام یا عنوان حساب / بانک:</label>
                  <input
                    type="text"
                    placeholder="مثال: حساب بانک سامان عرفان"
                    value={newCardLabel}
                    onChange={(e) => setNewCardLabel(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/15 text-white focus:outline-none focus:border-[#3A86FF]"
                  />
                </div>

                <div className="sm:col-span-4 space-y-1">
                  <label className="text-[11px] text-slate-400">۴ رقم آخر شماره کارت:</label>
                  <input
                    type="text"
                    maxLength={4}
                    dir="ltr"
                    placeholder="مثلاً 1234"
                    value={newCardLast4}
                    onChange={(e) => setNewCardLast4(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/15 text-white font-mono text-center font-bold focus:outline-none focus:border-[#3A86FF]"
                  />
                </div>

                <div className="sm:col-span-2 flex items-end">
                  <button
                    type="button"
                    onClick={handleAddNewCard}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#7B2CBF] to-[#3A86FF] text-white font-bold text-xs flex items-center justify-center gap-1 shadow-md hover:opacity-90 transition-all"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>افزودن</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Saved Cards Grid */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#3A86FF]" />
              لیست کارت‌های ذخیره‌شده شما (سوئیچ با یک کلیک):
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {savedCards.map((card) => {
                const isActive = varizaCardLast4 === card.last4;
                return (
                  <div
                    key={card.id}
                    onClick={() => handleSelectCard(card.last4)}
                    className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer relative flex flex-col justify-between gap-3 ${
                      isActive
                        ? 'bg-gradient-to-br from-emerald-500/15 via-[#181A24] to-[#12131A] border-emerald-500/60 shadow-[0_0_20px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/50'
                        : 'bg-white/[0.02] hover:bg-white/[0.05] border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs ${
                            isActive
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-white/5 text-slate-400'
                          }`}
                        >
                          <CreditCard className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-bold text-white text-xs block truncate max-w-[150px]">
                            {card.label}
                          </span>
                          <span className="font-mono text-xs text-slate-400 block tracking-wider" dir="ltr">
                            •••• {card.last4}
                          </span>
                        </div>
                      </div>

                      {isActive ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          فعال
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCard(card.id);
                          }}
                          className="p-1 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          title="حذف از لیست کارت‌ها"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px]">
                      {isActive ? (
                        <span className="text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          مقصد تمام پرداخت‌های جدید
                        </span>
                      ) : (
                        <span className="text-slate-400 hover:text-white transition-colors">
                          کلیک برای فعال‌سازی ←
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* SECTION 2: Seat Hold & Payment Window */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#12131A] border border-white/10 space-y-6 shadow-xl">
          <div className="flex items-center gap-2.5 border-b border-white/10 pb-4">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">
                کنترل زمان‌بندی رزرو و اعتبار پرداخت
              </h4>
              <p className="text-xs text-slate-400">
                مدیریت دقیق زمان قفل صندلی‌ها و بازه زمانی مجاز خریدار برای واریز وجه
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Seat Hold Duration */}
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
              <div className="space-y-1">
                <label className="font-bold text-white flex items-center gap-2">
                  <span>۱. زمان قفل موقت صندلی‌ها در رزرو (دقیقه):</span>
                  <span className="text-[#00F0FF] font-mono text-sm font-black">
                    {seatHoldMinutes} دقیقه
                  </span>
                </label>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  هنگامی که مشتری روی دکمه پرداخت کلیک می‌کند، صندلی‌های انتخابی او به این مدت قفل می‌شوند تا دیگران نتوانند آن را بخرند. اگر کاربر تا این زمان پرداخت را تکمیل نکند، صندلی‌ها به صورت خودکار آزاد می‌گردند.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={3}
                  max={180}
                  step={1}
                  value={seatHoldMinutes}
                  onChange={(e) =>
                    setSeatHoldMinutes(parseInt(e.target.value) || 15)
                  }
                  className="w-28 px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/15 text-white font-mono text-center text-sm font-bold focus:outline-none focus:border-[#3A86FF]"
                />
                <span className="text-slate-400">دقیقه</span>
              </div>

              <div className="space-y-1.5 pt-2">
                <span className="text-[10px] text-slate-500 block">
                  انتخاب سریع زمان‌های پیشنهادی:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_HOLD_MINUTES.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setSeatHoldMinutes(m)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                        seatHoldMinutes === m
                          ? 'bg-[#3A86FF] text-white shadow-sm ring-1 ring-white'
                          : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5'
                      }`}
                    >
                      {m} دقیقه
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Variza Payment Link Expiry */}
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
              <div className="space-y-1">
                <label className="font-bold text-white flex items-center gap-2">
                  <span>۲. مهلت پرداخت درگاه واریزا (Gateway Expiry):</span>
                  <span className="text-purple-300 font-mono text-sm font-black">
                    {paymentExpiresIn}
                  </span>
                </label>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  مدت زمانی که لینک پرداخت واریزا معتبر می‌ماند و کاربر در صفحه پرداخت واریزا فرصت دارد تا عملیات کارت به کارت را انجام دهد.
                </p>
              </div>

              <select
                value={paymentExpiresIn}
                onChange={(e) => setPaymentExpiresIn(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#181A24] border border-white/15 text-white text-xs font-semibold focus:outline-none focus:border-[#3A86FF] cursor-pointer"
              >
                {VARIZA_EXPIRY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>

              <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-[11px] text-purple-200">
                پیشنهاد می‌شود مهلت پرداخت درگاه با زمان قفل صندلی‌ها هماهنگ باشد (مثلاً ۳۰ دقیقه).
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: Gateway Credentials & Liara Domain */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#12131A] border border-white/10 space-y-6 shadow-xl">
          <div className="flex items-center gap-2.5 border-b border-white/10 pb-4">
            <div className="w-9 h-9 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-300">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">
                مشخصات فنی و اتصالات سرور واریزا
              </h4>
              <p className="text-xs text-slate-400">
                کلید API، سکرت وب‌هوک و دامنه اصلی سایت روی لیارا
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="space-y-1.5 md:col-span-2">
              <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-[#3A86FF]" />
                <span>آدرس اصلی سایت روی لیارا (APP_URL / Return URL)</span>
                <span className="text-red-400">*</span>
              </label>
              <input
                type="url"
                required
                dir="ltr"
                value={appUrl}
                onChange={(e) => setAppUrl(e.target.value)}
                placeholder="https://your-app.liara.run"
                className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-[#3A86FF]"
              />
              <span className="text-[10px] text-slate-500">
                واریزا خریدار را پس از واریز به این دامنه و مسیر <code className="text-[#00F0FF]">/payment/callback</code> هدایت می‌کند.
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-yellow-400" />
                  <span>کلید اختصاصی API واریزا (VARIZA_API_KEY)</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="text-[10px] text-[#00F0FF] hover:underline"
                >
                  {showApiKey ? 'مخفی‌سازی' : 'نمایش کلید'}
                </button>
              </div>
              <input
                type={showApiKey ? 'text' : 'password'}
                dir="ltr"
                value={varizaApiKey}
                onChange={(e) => setVarizaApiKey(e.target.value)}
                placeholder="پیش‌فرض از فایل .env خوانده می‌شود"
                className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-[#3A86FF]"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-emerald-400" />
                  <span>سکرت وب‌هوک واریزا (VARIZA_WEBHOOK_SECRET)</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowSecret(!showSecret)}
                  className="text-[10px] text-[#00F0FF] hover:underline"
                >
                  {showSecret ? 'مخفی‌سازی' : 'نمایش سکرت'}
                </button>
              </div>
              <input
                type={showSecret ? 'text' : 'password'}
                dir="ltr"
                value={varizaWebhookSecret}
                onChange={(e) => setVarizaWebhookSecret(e.target.value)}
                placeholder="پیش‌فرض از فایل .env خوانده می‌شود"
                className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-[#3A86FF]"
              />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2 text-xs">
            <span className="font-bold text-white flex items-center gap-1.5 text-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#00F0FF]" />
              آدرس وب‌هوک جهت ثبت در پنل واریزا (Webhook Endpoint):
            </span>
            <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 font-mono text-[#00F0FF] text-[11px] select-all flex items-center justify-between" dir="ltr">
              <span>{appUrl ? `${appUrl}/api/webhooks/variza` : 'https://your-domain.liara.run/api/webhooks/variza'}</span>
              <span className="text-[10px] text-slate-400 font-sans">روش: POST با هدر X-Webhook-Signature</span>
            </div>
          </div>
        </div>

        {/* SECTION 4: Buyer Notice */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#12131A] border border-white/10 space-y-4 shadow-xl">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-[#3A86FF]" />
              پیام راهنمای پرداخت به خریداران در صفحه پیش‌فاکتور
            </h4>
            <p className="text-xs text-slate-400">
              متنی اختیاری که جهت راهنمایی خریداران در صفحه پرداخت و تسویه‌حساب نمایش داده می‌شود.
            </p>
          </div>

          <textarea
            rows={2}
            value={paymentInstructions}
            onChange={(e) => setPaymentInstructions(e.target.value)}
            placeholder="مثال: پس از فشردن دکمه پرداخت، وارد صفحه امن واریزا شده و شماره کارت نمایش‌داده‌شده را کارت به کارت فرمایید. بلیت بلافاصله تایید می‌شود."
            className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:outline-none focus:border-[#3A86FF]"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="btn-cosmic px-8 py-3.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 shadow-glow disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>ذخیره کارت مقصد و کلیه پارامترهای پرداخت</span>
          </button>
        </div>
      </form>
    </div>
  );
}
