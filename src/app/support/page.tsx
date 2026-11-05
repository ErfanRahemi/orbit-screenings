'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  MessageSquare,
  Send,
  User,
  Phone,
  Ticket,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Clock,
  PhoneCall,
  ArrowRight,
} from 'lucide-react';
import { validateIranianMobile } from '@/lib/utils';

export default function SupportPage() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [ticketId, setTicketId] = useState('');
  const [subject, setSubject] = useState('پیگیری بلیت و سانس اکران');
  const [message, setMessage] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedTicket, setSubmittedTicket] = useState<{ id: string; name: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('لطفاً نام و نام خانوادگی خود را وارد نمایید.');
      return;
    }

    if (!phone.trim()) {
      setError('لطفاً شماره تماس خود را وارد نمایید.');
      return;
    }

    if (!validateIranianMobile(phone.trim())) {
      setError('شماره تماس وارد شده معتبر نیست. لطفاً شماره موبایل ۱۱ رقمی (مانند ۰۹۱۲۳۴۵۶۷۸۹) وارد کنید.');
      return;
    }

    if (!message.trim() || message.trim().length < 5) {
      setError('لطفاً متن درخواست یا سوال خود را با جزئیات کافی بنویسید (حداقل ۵ کاراکتر).');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          ticketId: ticketId.trim(),
          subject: subject.trim(),
          message: message.trim(),
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        setSubmittedTicket({
          id: data.data.id,
          name: data.data.name,
        });
      } else {
        setError(data.error || 'خطایی در ارسال تیکت رخ داد. لطفاً مجدداً تلاش کنید.');
      }
    } catch (err) {
      setError('خطای اتصال به سرور. لطفاً ارتباط اینترنت خود را بررسی نمایید.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setPhone('');
    setTicketId('');
    setMessage('');
    setSubmittedTicket(null);
    setError(null);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#7B2CBF]/20 text-[#00F0FF] border border-[#7B2CBF]/40 text-xs font-semibold">
            <MessageSquare className="w-4 h-4" />
            <span>مرکز پشتیبانی و ارتباط با مدیران اوربیت</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white">
            ثبت تیکت پشتیبانی
          </h1>

          <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
            اگر در مراحل خرید بلیت، انتخاب صندلی، تغییر سانس یا هر مورد دیگری با مشکلی مواجه شده‌اید، پیام خود را ثبت کنید تا مدیران اوربیت از طریق تماس تلفنی با شما ارتباط برقرار کنند.
          </p>
        </div>

        {submittedTicket ? (
          /* Success Card */
          <div className="p-8 rounded-3xl bg-[#12131A] border border-emerald-500/30 text-center space-y-6 shadow-2xl animate-fadeIn">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white shadow-[0_0_25px_rgba(16,185,129,0.5)]">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-black text-white">
                تیکت شما با موفقیت ثبت شد
              </h2>
              <p className="text-xs text-slate-400">
                همکاران ما در اسرع وقت پیام شما را بررسی کرده و با شماره تماسی که وارد کردید تماس خواهند گرفت.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 max-w-sm mx-auto space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span>شماره پیگیری تیکت:</span>
                <span className="font-mono font-bold text-[#00F0FF] text-sm">{submittedTicket.id}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>ثبت‌کننده:</span>
                <span className="font-semibold text-white">{submittedTicket.name}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={resetForm}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-colors"
              >
                ثبت تیکت جدید
              </button>
              <Link
                href="/"
                className="btn-cosmic w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-glow"
              >
                <span>بازگشت به صفحه اصلی</span>
                <ArrowRight className="w-4 h-4 rotate-180" />
              </Link>
            </div>
          </div>
        ) : (
          /* Ticket Form */
          <div className="rounded-3xl bg-[#12131A] border border-white/10 p-6 sm:p-8 shadow-2xl space-y-6">
            
            {error && (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-xs text-rose-300">
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#3A86FF]" />
                    <span>نام و نام خانوادگی <span className="text-rose-400">*</span></span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: علی رضایی"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-[#3A86FF] transition-colors"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#00F0FF]" />
                    <span>شماره تماس (جهت تماس ادمین) <span className="text-rose-400">*</span></span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-[#00F0FF] transition-colors font-mono"
                    dir="ltr"
                  />
                </div>
              </div>

              {/* Optional Ticket ID */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Ticket className="w-3.5 h-3.5 text-purple-400" />
                    <span>کد پیگیری بلیت خریداری شده</span>
                  </label>
                  <span className="text-[11px] text-slate-500">اختیاری (اگر بلیت نخریده‌اید خالی بگذارید)</span>
                </div>
                <input
                  type="text"
                  placeholder="مثال: ORB-918234 (اختیاری)"
                  value={ticketId}
                  onChange={(e) => setTicketId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-purple-400 transition-colors font-mono uppercase"
                  dir="ltr"
                />
              </div>

              {/* Subject */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-yellow-400" />
                  <span>موضوع تیکت / سوال <span className="text-rose-400">*</span></span>
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#181A24] border border-white/10 text-white text-xs focus:outline-none focus:border-[#3A86FF] cursor-pointer"
                >
                  <option value="پیگیری بلیت و سانس اکران">پیگیری بلیت و سانس اکران</option>
                  <option value="درخواست جابجایی صندلی یا تغییر سانس">درخواست جابجایی صندلی یا تغییر سانس</option>
                  <option value="مشکل در درگاه یا کسر مبلغ از حساب">مشکل در درگاه پرداخت یا کسر وجه</option>
                  <option value="سوال درباره کیفیت صوت، سالن و فیلم">سوال درباره کیفیت سالن، تصویر و زیرنویس</option>
                  <option value="پیشنهاد فیلم یا انیمه برای اکران بعدی">پیشنهاد فیلم یا انیمه برای اکران بعدی</option>
                  <option value="سایر موارد و پشتیبانی عمومی">سایر موارد و پشتیبانی عمومی</option>
                </select>
              </div>

              {/* Message */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>شرح کامل درخواست یا مشکل شما <span className="text-rose-400">*</span></span>
                  <span className="text-[11px] text-slate-500">پاسخ از طریق تماس تلفنی ادمین داده می‌شود</span>
                </label>
                <textarea
                  required
                  rows={5}
                  placeholder="لطفاً مشکل یا سوال خود را به طور کامل توضیح دهید تا مدیران ما در سریع‌ترین زمان بررسی کنند..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-[#3A86FF] transition-colors resize-y leading-relaxed"
                />
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="btn-cosmic w-full py-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-glow disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>در حال ثبت تیکت...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>ارسال تیکت به مدیر سایت</span>
                  </>
                )}
              </button>

            </form>

            <div className="pt-4 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                میانگین زمان پاسخگویی: کمتر از ۲ ساعت کاری
              </span>
              <span className="flex items-center gap-1.5">
                <PhoneCall className="w-3.5 h-3.5 text-slate-400" />
                پاسخگویی مستقیم تلفنی
              </span>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
