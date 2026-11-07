'use client';

import React, { useState, useEffect } from 'react';
import { Screening, VenueTemplate, SeatMap } from '@/types';
import { toPersianDigits } from '@/lib/utils';
import SeatMapBuilder from './SeatMapBuilder';
import {
  Film,
  Plus,
  Edit2,
  Trash2,
  X,
  Save,
  Layers,
  Ban,
  CheckCircle2,
  Loader2,
  Sparkles,
} from 'lucide-react';

const CITIES = ['تهران', 'شیراز', 'اصفهان', 'مشهد', 'تبریز'];

export default function ScreeningsManager() {
  const [screenings, setScreenings] = useState<Screening[]>([]);
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState<VenueTemplate[]>([]);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [titleFa, setTitleFa] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [tagline, setTagline] = useState('');
  const [genre, setGenre] = useState('');
  const [city, setCity] = useState('تهران');
  const [venueName, setVenueName] = useState('');
  const [venueAddress, setVenueAddress] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('۱۹:۳۰');
  const [duration, setDuration] = useState('۱۲۰ دقیقه');
  const [ageRating, setAgeRating] = useState('+۱۲ سال');
  const [language, setLanguage] = useState('ژاپنی با زیرنویس اختصاصی اوربیت');
  const [posterUrl, setPosterUrl] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [synopsis, setSynopsis] = useState('');
  const [featured, setFeatured] = useState(false);
  const [isSoldOut, setIsSoldOut] = useState(false);

  const [vipPrice, setVipPrice] = useState<number>(250000);
  const [standardPrice, setStandardPrice] = useState<number>(190000);
  const [economyPrice, setEconomyPrice] = useState<number>(140000);
  const [togglingSoldOutId, setTogglingSoldOutId] = useState<string | null>(null);

  const [customSeatMap, setCustomSeatMap] = useState<SeatMap | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [showSeatBuilder, setShowSeatBuilder] = useState(false);

  useEffect(() => {
    loadScreenings();
    loadTemplates();
  }, []);

  async function loadScreenings() {
    setLoading(true);
    try {
      const res = await fetch('/api/screenings');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setScreenings(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function loadTemplates() {
    try {
      const res = await fetch('/api/templates');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setTemplates(data.data);
        if (data.data.length > 0) {
          setSelectedTemplateId(data.data[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }

  const handleOpenCreate = () => {
    setEditingId(null);
    setTitleFa('');
    setTitleEn('');
    setTagline('');
    setGenre('انیمه سینمایی • درام ماجراجویی');
    setCity('تهران');
    setVenueName('پردیس چارسو — سالن ۲');
    setVenueAddress('تهران، تقاطع جمهوری و حافظ');
    setDate('جمعه ۱۰ آذر ۱۴۰۳');
    setTime('۲۰:۰۰');
    setDuration('۱۲۰ دقیقه');
    setAgeRating('+۱۲ سال');
    setLanguage('زبان اصلی با زیرنویس فارسی اختصاصی');
    setPosterUrl('https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1000&auto=format&fit=crop');
    setBannerUrl('https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1600&auto=format&fit=crop');
    setSynopsis('');
    setFeatured(false);
    setIsSoldOut(false);
    setVipPrice(250000);
    setStandardPrice(190000);
    setEconomyPrice(140000);
    setCustomSeatMap(null);
    setShowSeatBuilder(false);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (screening: Screening) => {
    setEditingId(screening.id);
    setTitleFa(screening.titleFa);
    setTitleEn(screening.titleEn);
    setTagline(screening.tagline || '');
    setGenre(screening.genre);
    setCity(screening.city);
    setVenueName(screening.venueName);
    setVenueAddress(screening.venueAddress);
    setDate(screening.date);
    setTime(screening.time);
    setDuration(screening.duration);
    setAgeRating(screening.ageRating);
    setLanguage(screening.language);
    setPosterUrl(screening.posterUrl);
    setBannerUrl(screening.bannerUrl);
    setSynopsis(screening.synopsis);
    setFeatured(screening.featured);
    setIsSoldOut(!!screening.isSoldOut);
    setVipPrice(screening.seatMap?.vipPrice || 250000);
    setStandardPrice(screening.seatMap?.standardPrice || 190000);
    setEconomyPrice(screening.seatMap?.economyPrice || 140000);
    setCustomSeatMap(screening.seatMap);
    setShowSeatBuilder(false);
    setIsFormOpen(true);
  };

  const handleToggleSoldOut = async (screening: Screening) => {
    setTogglingSoldOutId(screening.id);
    try {
      const newStatus = !screening.isSoldOut;
      const res = await fetch(`/api/screenings/${screening.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isSoldOut: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setScreenings((prev) =>
          prev.map((s) => (s.id === screening.id ? { ...s, isSoldOut: newStatus } : s))
        );
      } else {
        alert(data.error || 'خطا در تغییر وضعیت ظرفیت');
      }
    } catch (e) {
      alert('خطای اتصال به سرور');
    } finally {
      setTogglingSoldOutId(null);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`آیا از حذف اکران «${title}» مطمئن هستید؟`)) return;

    try {
      const res = await fetch(`/api/screenings/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        loadScreenings();
      }
    } catch (e) {
      alert('خطا در حذف اکران');
    }
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();

    let seatMapToUse: SeatMap;

    if (customSeatMap) {
      seatMapToUse = {
        ...customSeatMap,
        vipPrice,
        standardPrice,
        economyPrice,
        seats: customSeatMap.seats.map((s) => {
          let p = s.price;
          if (s.type === 'vip') p = vipPrice;
          else if (s.type === 'standard') p = standardPrice;
          else if (s.type === 'economy') p = economyPrice;
          else if (s.type === 'aisle' || s.type === 'blocked') p = 0;
          return { ...s, price: p };
        }),
      };
    } else {
      const chosenTemplate = templates.find((t) => t.id === selectedTemplateId) || templates[0];
      if (chosenTemplate) {
        seatMapToUse = {
          rows: chosenTemplate.rows,
          cols: chosenTemplate.cols,
          vipPrice,
          standardPrice,
          economyPrice,
          seats: chosenTemplate.seats.map((s) => {
            let p = s.price;
            if (s.type === 'vip') p = vipPrice;
            else if (s.type === 'standard') p = standardPrice;
            else if (s.type === 'economy') p = economyPrice;
            else if (s.type === 'aisle' || s.type === 'blocked') p = 0;
            return {
              ...s,
              price: p,
              status: 'available',
            };
          }),
        };
      } else {
        alert('لطفاً نقشه سالن را مشخص فرمایید.');
        return;
      }
    }

    const payload = {
      titleFa: titleFa.trim(),
      titleEn: titleEn.trim(),
      tagline: tagline.trim(),
      genre: genre.trim(),
      city,
      venueName: venueName.trim(),
      venueAddress: venueAddress.trim(),
      date: date.trim(),
      time: time.trim(),
      duration: duration.trim(),
      ageRating: ageRating.trim(),
      language: language.trim(),
      posterUrl: posterUrl.trim(),
      bannerUrl: bannerUrl.trim(),
      synopsis: synopsis.trim(),
      featured,
      isSoldOut,
      seatMap: seatMapToUse,
    };

    try {
      if (editingId) {
        const res = await fetch(`/api/screenings/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success) {
          setIsFormOpen(false);
          loadScreenings();
        } else {
          alert(data.error || 'خطا در ویرایش');
        }
      } else {
        const res = await fetch('/api/screenings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success) {
          setIsFormOpen(false);
          loadScreenings();
        } else {
          alert(data.error || 'خطا در ثبت');
        }
      }
    } catch (e) {
      alert('خطای اتصال به سرور');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#12131A] border border-white/10">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Film className="w-5 h-5 text-[#00F0FF]" />
            مدیریت رویدادها و سانس‌های اکران
          </h3>
          <p className="text-xs text-slate-400">
            ایجاد رویداد جدید، ویرایش اطلاعات اکران و اتصال نقشه سالن و صندلی‌ها
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="btn-cosmic px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-glow"
        >
          <Plus className="w-4 h-4" />
          <span>افزودن رویداد اکران جدید</span>
        </button>
      </div>

      <div className="rounded-3xl bg-[#12131A] border border-white/10 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-white/[0.03] text-slate-400 font-semibold border-b border-white/10">
              <tr>
                <th className="p-4">پوستر و عنوان فیلم</th>
                <th className="p-4">شهر و سینما</th>
                <th className="p-4">زمان برگزاری</th>
                <th className="p-4">ظرفیت / صندلی فروخته شده</th>
                <th className="p-4">وضعیت</th>
                <th className="p-4 text-center">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {screenings.map((s) => {
                const totalSeats = s.seatMap?.seats.filter(
                  (seat) => seat.type !== 'aisle' && seat.type !== 'blocked'
                ).length || 0;
                const soldSeats = s.seatMap?.seats.filter(
                  (seat) => seat.status === 'sold'
                ).length || 0;

                return (
                  <tr key={s.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={s.posterUrl}
                          alt={s.titleFa}
                          className="w-10 h-14 rounded-lg object-cover border border-white/10 flex-shrink-0"
                        />
                        <div>
                          <span className="font-bold text-white block text-sm">{s.titleFa}</span>
                          <span className="text-[11px] text-slate-400 block">{s.titleEn}</span>
                          <span className="text-[10px] text-purple-400">{s.genre}</span>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="space-y-0.5">
                        <span className="font-semibold text-white block">{s.city}</span>
                        <span className="text-slate-400 text-[11px] block">{s.venueName}</span>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="space-y-0.5">
                        <span className="text-white block">{s.date}</span>
                        <span className="text-slate-400 text-[11px] block">ساعت {s.time}</span>
                      </div>
                    </td>

                    <td className="p-4">
                      <div>
                        <span className="font-bold text-[#00F0FF]">
                          {toPersianDigits(soldSeats)}
                        </span>
                        <span className="text-slate-400"> از {toPersianDigits(totalSeats)} صندلی</span>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="flex flex-col gap-1 items-start">
                        {s.isSoldOut ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-bold flex items-center gap-1">
                            <Ban className="w-3 h-3 text-rose-400" />
                            تکمیل ظرفیت (Sold Out)
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            در حال فروش بلیت
                          </span>
                        )}

                        {s.featured && (
                          <span className="px-2 py-0.5 rounded-full bg-[#7B2CBF]/30 text-[#00F0FF] border border-[#7B2CBF]/50 text-[10px] font-bold">
                            برگزیده در صفحه اصلی
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleSoldOut(s)}
                          disabled={togglingSoldOutId === s.id}
                          className={`px-3 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1 transition-all shadow-sm ${
                            s.isSoldOut
                              ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40'
                              : 'bg-white/5 hover:bg-rose-500/15 text-slate-300 hover:text-rose-300 border border-white/10'
                          }`}
                          title={s.isSoldOut ? 'بازگشایی مجدد فروش بلیت' : 'تکمیل ظرفیت و توقف فروش بلیت'}
                        >
                          {togglingSoldOutId === s.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Ban className="w-3.5 h-3.5" />
                          )}
                          <span>{s.isSoldOut ? 'بازگشایی فروش' : 'اعلام Sold Out'}</span>
                        </button>

                        <button
                          onClick={() => handleOpenEdit(s)}
                          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#3A86FF] transition-colors"
                          title="ویرایش اطلاعات اکران و قیمت‌ها"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(s.id, s.titleFa)}
                          className="p-2 rounded-xl bg-white/5 hover:bg-red-500/10 text-red-400 transition-colors"
                          title="حذف اکران"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-4xl w-full my-8 rounded-3xl bg-[#12131A] border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Film className="w-5 h-5 text-[#3A86FF]" />
                {editingId ? 'ویرایش رویداد اکران' : 'ثبت اکران و رویداد جدید'}
              </h3>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="p-6 overflow-y-auto space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300">عنوان فیلم به فارسی *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: سوزومه"
                    value={titleFa}
                    onChange={(e) => setTitleFa(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white focus:outline-none focus:border-[#3A86FF]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300">عنوان به انگلیسی / اصلی *</label>
                  <input
                    type="text"
                    required
                    dir="ltr"
                    placeholder="Suzume no Tojimari"
                    value={titleEn}
                    onChange={(e) => setTitleEn(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white font-mono focus:outline-none focus:border-[#3A86FF]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300">شهر برگزاری *</label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#181A24] border border-white/10 text-white focus:outline-none focus:border-[#3A86FF]"
                  >
                    {CITIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300">نام سینما و سالن *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: پردیس چارسو — سالن ۲"
                    value={venueName}
                    onChange={(e) => setVenueName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white focus:outline-none focus:border-[#3A86FF]"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="font-semibold text-slate-300">آدرس دقیق سالن *</label>
                  <input
                    type="text"
                    required
                    placeholder="تهران، خیابان جمهوری، تقاطع پل حافظ، طبقه ۶"
                    value={venueAddress}
                    onChange={(e) => setVenueAddress(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white focus:outline-none focus:border-[#3A86FF]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300">تاریخ اکران *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: جمعه ۲۵ آبان ۱۴۰۳"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white focus:outline-none focus:border-[#3A86FF]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300">ساعت شروع سانس *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: ۱۹:۳۰"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white focus:outline-none focus:border-[#3A86FF]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300">ژانر فیلم</label>
                  <input
                    type="text"
                    placeholder="انیمه • فانتزی • درام"
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white focus:outline-none focus:border-[#3A86FF]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300">مدت زمان و رده سنی</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="۱۲۰ دقیقه"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-center focus:outline-none focus:border-[#3A86FF]"
                    />
                    <input
                      type="text"
                      placeholder="+۱۲ سال"
                      value={ageRating}
                      onChange={(e) => setAgeRating(e.target.value)}
                      className="px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-center focus:outline-none focus:border-[#3A86FF]"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="font-semibold text-slate-300">آدرس تصویر پوستر (نسبت ۲ به ۳) *</label>
                  <input
                    type="url"
                    required
                    dir="ltr"
                    placeholder="https://..."
                    value={posterUrl}
                    onChange={(e) => setPosterUrl(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white font-mono focus:outline-none focus:border-[#3A86FF]"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="font-semibold text-slate-300">آدرس تصویر بنر عریض (اختیاری)</label>
                  <input
                    type="url"
                    dir="ltr"
                    placeholder="https://..."
                    value={bannerUrl}
                    onChange={(e) => setBannerUrl(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white font-mono focus:outline-none focus:border-[#3A86FF]"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="font-semibold text-slate-300">خلاصه داستان و معرفی اکران</label>
                  <textarea
                    rows={3}
                    placeholder="توضیحاتی درباره داستان فیلم و ویژگی‌های اکران..."
                    value={synopsis}
                    onChange={(e) => setSynopsis(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white focus:outline-none focus:border-[#3A86FF]"
                  />
                </div>

                <div className="sm:col-span-2 flex flex-col gap-2.5 pt-2 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="featured-cb"
                      checked={featured}
                      onChange={(e) => setFeatured(e.target.checked)}
                      className="w-4 h-4 rounded text-[#3A86FF] focus:ring-0 cursor-pointer"
                    />
                    <label htmlFor="featured-cb" className="text-xs font-semibold text-white cursor-pointer">
                      نمایش در بنر اصلی و اکران‌های برگزیده صفحه اول
                    </label>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="soldout-cb"
                      checked={isSoldOut}
                      onChange={(e) => setIsSoldOut(e.target.checked)}
                      className="w-4 h-4 rounded text-rose-500 focus:ring-0 cursor-pointer"
                    />
                    <label htmlFor="soldout-cb" className="text-xs font-bold text-rose-400 cursor-pointer flex items-center gap-1.5">
                      <Ban className="w-3.5 h-3.5" />
                      اعلام تکمیل ظرفیت فیلم (Sold Out) — توقف فروش بلیت و نمایش برچسب Sold Out
                    </label>
                  </div>
                </div>
              </div>

              {/* Direct Seat Pricing Section */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#00F0FF]" />
                    قیمت‌گذاری صندلی‌های این اکران (تومان):
                  </span>
                  <span className="text-[10px] text-slate-400">
                    تغییر این مقادیر مستقیماً روی قیمت صندلی‌های این سانس اعمال می‌شود.
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-purple-300">قیمت بلیت VIP (تومان):</label>
                    <input
                      type="number"
                      step={10000}
                      value={vipPrice}
                      onChange={(e) => setVipPrice(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 rounded-xl bg-purple-950/20 border border-purple-500/30 text-white font-mono text-center text-xs font-bold focus:outline-none focus:border-purple-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-[#3A86FF]">قیمت بلیت استاندارد (تومان):</label>
                    <input
                      type="number"
                      step={10000}
                      value={standardPrice}
                      onChange={(e) => setStandardPrice(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 rounded-xl bg-blue-950/20 border border-blue-500/30 text-white font-mono text-center text-xs font-bold focus:outline-none focus:border-[#3A86FF]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-emerald-300">قیمت بلیت اکونومی (تومان):</label>
                    <input
                      type="number"
                      step={10000}
                      value={economyPrice}
                      onChange={(e) => setEconomyPrice(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-white font-mono text-center text-xs font-bold focus:outline-none focus:border-emerald-400"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#00F0FF]" />
                    انتخاب یا شخصی‌سازی نقشه سالن و صندلی‌ها
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowSeatBuilder(!showSeatBuilder)}
                    className="px-3 py-1.5 rounded-lg bg-[#3A86FF]/20 hover:bg-[#3A86FF]/30 text-[#00F0FF] text-xs font-semibold"
                  >
                    {showSeatBuilder ? 'بستن ویرایشگر سالن' : 'شخصی‌سازی دقیق با سازنده بصری'}
                  </button>
                </div>

                {!showSeatBuilder ? (
                  <div className="space-y-2">
                    <label className="text-xs text-slate-400">
                      انتخاب از بین الگوهای از پیش طراحی شده سالن‌ها:
                    </label>
                    <select
                      value={selectedTemplateId}
                      onChange={(e) => setSelectedTemplateId(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#181A24] border border-white/10 text-white text-xs focus:outline-none focus:border-[#3A86FF]"
                    >
                      {templates.map((tpl) => (
                        <option key={tpl.id} value={tpl.id}>
                          {tpl.name} ({tpl.rows} ردیف × {tpl.cols} ستون)
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="pt-2 border-t border-white/10">
                    <SeatMapBuilder
                      initialSeatMap={customSeatMap || undefined}
                      onSave={(newMap) => {
                        setCustomSeatMap(newMap);
                        setShowSeatBuilder(false);
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="btn-cosmic px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-glow"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingId ? 'ذخیره تغییرات اکران' : 'ایجاد اکران جدید'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
