'use client';

import React, { useState, useEffect } from 'react';
import { SiteSettings } from '@/types';
import {
  Upload,
  Link as LinkIcon,
  RotateCcw,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Film,
  Eye,
  Image as ImageIcon,
} from 'lucide-react';

export default function SiteSettingsManager() {
  const [settings, setSettings] = useState<SiteSettings>({
    logoUrl: '',
    brandName: 'ORBIT',
    brandSubtitle: 'اکران‌های اختصاصی',
    brandTagline: 'اکران‌های سینمایی و انیمه با کیفیت برتر',
    aboutTitle: 'درباره پلتفرم اکران‌های اختصاصی اوربیت',
    aboutText: '',
    aboutVision: '',
    contactPhone: '',
    contactEmail: '',
    contactAddress: '',
    contactInstagram: '',
    contactTelegram: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      if (data.success && data.data) {
        setSettings(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('حجم تصویر لوگو نباید بیشتر از ۲ مگابایت باشد.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setSettings((prev) => ({ ...prev, logoUrl: result }));
    };
    reader.readAsDataURL(file);
  };

  const handleResetToDefaultLogo = () => {
    setSettings((prev) => ({
      ...prev,
      logoUrl: '',
      brandName: 'ORBIT',
      brandSubtitle: 'اکران‌های اختصاصی',
      brandTagline: 'اکران‌های سینمایی و انیمه با کیفیت برتر',
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMsg('تنظیمات لوگو و برند با موفقیت ذخیره شد. لوگوی جدید در تمامی صفحات سایت اعمال شد.');
        window.dispatchEvent(new Event('orbit-settings-updated'));
      } else {
        setErrorMsg(data.error || 'خطا در ذخیره تنظیمات');
      }
    } catch (e) {
      setErrorMsg('خطای برقراری ارتباط با سرور.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="p-6 rounded-3xl bg-[#12131A] border border-white/10 flex items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-[#00F0FF]" />
            تنظیمات و شخصی‌سازی لوگو و هویت بصری سایت
          </h3>
          <p className="text-xs text-slate-400">
            تغییر لوگوی سایت از طریق بارگذاری مستقیم فایل یا آدرس تصویر و تغییر نام و شعار برند
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-[#12131A] border border-white/10 shadow-xl space-y-6">
            <form onSubmit={handleSave} className="space-y-5 text-xs">
              <div className="space-y-3 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                <span className="font-bold text-white flex items-center gap-2">
                  <Upload className="w-4 h-4 text-[#3A86FF]" />
                  تصویر لوگوی سایت (آدرس یا بارگذاری مستقیم)
                </span>

                <div className="space-y-1.5">
                  <label className="text-slate-300 font-medium block">
                    روش ۱: بارگذاری فایل تصویر از کامپیوتر (PNG, SVG, JPG):
                  </label>
                  <label className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-dashed border-white/20 hover:border-[#3A86FF] bg-white/[0.02] hover:bg-white/[0.05] cursor-pointer text-slate-300 transition-all">
                    <Upload className="w-4 h-4 text-[#00F0FF]" />
                    <span>انتخاب فایل لوگو از سیستم...</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="space-y-1.5 pt-2">
                  <label className="text-slate-300 font-medium flex items-center gap-1.5">
                    <LinkIcon className="w-3.5 h-3.5 text-purple-400" />
                    <span>روش ۲: یا وارد کردن لینک اینترنتی تصویر لوگو (URL):</span>
                  </label>
                  <input
                    type="url"
                    dir="ltr"
                    placeholder="https://example.com/logo.png"
                    value={settings.logoUrl || ''}
                    onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white font-mono focus:outline-none focus:border-[#3A86FF]"
                  />
                </div>

                {settings.logoUrl && (
                  <button
                    type="button"
                    onClick={handleResetToDefaultLogo}
                    className="text-[11px] text-red-400 hover:text-red-300 flex items-center gap-1 pt-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>حذف لوگوی اختصاصی و بازگشت به لوگوی پیش‌فرض ORBIT</span>
                  </button>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">نام برند (عنوان اصلی)</label>
                <input
                  type="text"
                  required
                  placeholder="ORBIT"
                  value={settings.brandName}
                  onChange={(e) => setSettings({ ...settings, brandName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white focus:outline-none focus:border-[#3A86FF]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">عنوان فرعی (نشان بالای سایت)</label>
                <input
                  type="text"
                  required
                  placeholder="اکران‌های اختصاصی"
                  value={settings.brandSubtitle}
                  onChange={(e) => setSettings({ ...settings, brandSubtitle: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white focus:outline-none focus:border-[#3A86FF]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">شعار برند (زیر لوگو در هدر و فوتر)</label>
                <input
                  type="text"
                  placeholder="اکران‌های سینمایی و انیمه با کیفیت برتر"
                  value={settings.brandTagline}
                  onChange={(e) => setSettings({ ...settings, brandTagline: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white focus:outline-none focus:border-[#3A86FF]"
                />
              </div>

              {/* About Us Settings Section */}
              <div className="pt-4 border-t border-white/10 space-y-4">
                <div className="flex items-center gap-2">
                  <Film className="w-4 h-4 text-[#00F0FF]" />
                  <h4 className="text-sm font-bold text-white">
                    ویرایش محتوای صفحه «درباره ما» و اطلاعات تماس
                  </h4>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300">عنوان اصلی صفحه درباره ما</label>
                  <input
                    type="text"
                    placeholder="درباره پلتفرم اکران‌های اختصاصی اوربیت"
                    value={settings.aboutTitle || ''}
                    onChange={(e) => setSettings({ ...settings, aboutTitle: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white focus:outline-none focus:border-[#3A86FF]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300">متن اصلی درباره ما (داستان و معرفی)</label>
                  <textarea
                    rows={6}
                    placeholder="توضیحات کامل درباره اوربیت، اهداف و رویدادها..."
                    value={settings.aboutText || ''}
                    onChange={(e) => setSettings({ ...settings, aboutText: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white focus:outline-none focus:border-[#3A86FF] resize-y leading-relaxed"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300">چشم‌انداز و هدف (در کادر ویژه)</label>
                  <input
                    type="text"
                    placeholder="هدف ما ایجاد بستری مدرن و بدون دغدغه برای گردهمایی علاقه‌مندان به سینماست..."
                    value={settings.aboutVision || ''}
                    onChange={(e) => setSettings({ ...settings, aboutVision: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white focus:outline-none focus:border-[#3A86FF]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-300">تلفن تماس پشتیبانی</label>
                    <input
                      type="text"
                      dir="ltr"
                      placeholder="۰۲۱-۸۸۹۹۰۰۱۱"
                      value={settings.contactPhone || ''}
                      onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white focus:outline-none focus:border-[#3A86FF] font-mono text-left"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-300">آیدی پیج اینستاگرام (بدون @)</label>
                    <input
                      type="text"
                      dir="ltr"
                      placeholder="orbit_screenings"
                      value={settings.contactInstagram || ''}
                      onChange={(e) => setSettings({ ...settings, contactInstagram: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white focus:outline-none focus:border-[#3A86FF] font-mono text-left"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-300">آیدی کانال تلگرام (بدون @)</label>
                    <input
                      type="text"
                      dir="ltr"
                      placeholder="orbit_screenings"
                      value={settings.contactTelegram || ''}
                      onChange={(e) => setSettings({ ...settings, contactTelegram: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white focus:outline-none focus:border-[#3A86FF] font-mono text-left"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-300">آیدی پشتیبانی تلگرام (بدون @)</label>
                    <input
                      type="text"
                      dir="ltr"
                      placeholder="orbit_support"
                      value={settings.contactTelegramSupport || ''}
                      onChange={(e) => setSettings({ ...settings, contactTelegramSupport: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white focus:outline-none focus:border-[#3A86FF] font-mono text-left"
                    />
                  </div>
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={saving}
                className="w-full btn-cosmic py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-glow disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>ذخیره تغییرات لوگو و برند سایت</span>
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl bg-[#12131A] border border-white/10 shadow-xl space-y-5">
            <div className="space-y-1 border-b border-white/10 pb-4">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#00F0FF]" />
                پیش‌نمایش زنده لوگو در هدر سامانه
              </h4>
              <p className="text-xs text-slate-400">
                مشاهده آنی نحوه نمایش لوگو و نشان تجاری پس از ذخیره
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#0B0C10] border border-white/15 space-y-3">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest block font-bold">
                نمای نوار ناوبری بالای سایت (Navbar)
              </span>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/10">
                {settings.logoUrl ? (
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-white/5 border border-white/20 p-1 flex items-center justify-center flex-shrink-0">
                    <img
                      src={settings.logoUrl}
                      alt={settings.brandName}
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#7B2CBF] via-[#3A86FF] to-[#00F0FF] p-[2px] flex items-center justify-center flex-shrink-0">
                    <div className="w-full h-full bg-[#0B0C10] rounded-[10px] flex items-center justify-center">
                      <Film className="w-5 h-5 text-[#3A86FF]" />
                    </div>
                  </div>
                )}

                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-black tracking-wider bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                      {settings.brandName || 'ORBIT'}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#7B2CBF]/30 text-[#00F0FF] border border-[#7B2CBF]/50 font-medium">
                      {settings.brandSubtitle || 'اکران اختصاصی'}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-light truncate max-w-[200px]">
                    {settings.brandTagline || 'اکران‌های سینمایی و انیمه با کیفیت برتر'}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-r from-[#7B2CBF] via-[#3A86FF] to-[#00F0FF] text-white shadow-lg space-y-3">
              <span className="text-[10px] text-white/80 uppercase tracking-widest block font-bold">
                نمای سربرگ بلیت دیجیتال مشتری
              </span>

              <div className="flex items-center justify-between">
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
                    <span className="text-[10px] uppercase tracking-wider text-white/80 block font-bold">
                      {settings.brandName} CINEMA — EXCLUSIVE PASS
                    </span>
                    <span className="text-sm font-black">
                      بلیت رسمی ورود به سالن
                    </span>
                  </div>
                </div>

                <span className="font-mono text-xs font-bold bg-black/30 px-2 py-1 rounded">
                  ORB-123456
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
