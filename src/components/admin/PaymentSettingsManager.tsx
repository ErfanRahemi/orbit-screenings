'use client';

import React, { useState, useEffect } from 'react';
import { SiteSettings } from '@/types';
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
  Check,
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

export default function PaymentSettingsManager() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [seatHoldMinutes, setSeatHoldMinutes] = useState<number>(30);
  const [paymentExpiresIn, setPaymentExpiresIn] = useState<string>('30m');
  const [varizaCardLast4, setVarizaCardLast4] = useState<string>('8589');
  const [appUrl, setAppUrl] = useState<string>('https://small-crabs-say.loca.lt');
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
        setAppUrl(s.appUrl || 'https://small-crabs-say.loca.lt');
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
          appUrl: appUrl.trim().replace(/\/+$/, ''),
          varizaApiKey: varizaApiKey.trim() || undefined,
          varizaWebhookSecret: varizaWebhookSecret.trim() || undefined,
          paymentInstructions: paymentInstructions.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMsg(
          'تنظیمات و پارامترهای پرداخت واریزا با موفقیت ذخیره و در سامانه اعمال شدند.'
        );
        setTimeout(() => setSuccessMsg(null), 5000);
      } else {
        setErrorMsg(data.error || 'خطا در ذخیره تنظیمات');
      }
    } catch (e) {
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
            مدیریت پارامترهای درگاه پرداخت خودکار واریزا (Variza.ir)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            کنترل زمان قفل موقت صندلی‌ها، مهلت پرداخت مشتری در درگاه و مشخصات حساب تسویه کارت به کارت
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
          <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
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

        {/* Section 1: Seat Hold & Payment Window */}
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

        {/* Section 2: Gateway Credentials & Cards */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#12131A] border border-white/10 space-y-6 shadow-xl">
          <div className="flex items-center gap-2.5 border-b border-white/10 pb-4">
            <div className="w-9 h-9 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-300">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">
                مشخصات حساب و اتصالات درگاه واریزا
              </h4>
              <p className="text-xs text-slate-400">
                شماره کارت دریافت وجوه و آدرس‌های برگشت و وب‌هوک خودکار
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-[#00F0FF]" />
                <span>۴ رقم آخر کارت مقصد واریزا (Destination Card Last 4)</span>
                <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                maxLength={4}
                dir="ltr"
                value={varizaCardLast4}
                onChange={(e) => setVarizaCardLast4(e.target.value)}
                placeholder="8589"
                className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white font-mono text-center tracking-widest text-sm font-bold focus:outline-none focus:border-[#3A86FF]"
              />
              <span className="text-[10px] text-slate-500">
                باید با کارت تعریف‌شده در پنل کاربری variza.ir شما مطابقت داشته باشد.
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-[#3A86FF]" />
                <span>آدرس اصلی سایت (APP_URL / Return URL)</span>
                <span className="text-red-400">*</span>
              </label>
              <input
                type="url"
                required
                dir="ltr"
                value={appUrl}
                onChange={(e) => setAppUrl(e.target.value)}
                placeholder="https://small-crabs-say.loca.lt"
                className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-[#3A86FF]"
              />
              <span className="text-[10px] text-slate-500">
                واریزا خریدار را پس از پرداخت به این دامنه و مسیر <code className="text-[#00F0FF]">/payment/callback</code> هدایت می‌کند.
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
              <span>{appUrl}/api/webhooks/variza</span>
              <span className="text-[10px] text-slate-400 font-sans">روش: POST با هدر X-Webhook-Signature</span>
            </div>
          </div>
        </div>

        {/* Section 3: Buyer Notice */}
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
            className="btn-cosmic px-8 py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 shadow-glow disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>ذخیره کلیه پارامترهای پرداخت و رزرو</span>
          </button>
        </div>
      </form>
    </div>
  );
}
