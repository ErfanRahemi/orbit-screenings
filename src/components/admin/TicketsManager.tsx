'use client';

import React, { useState, useEffect } from 'react';
import { SupportTicket } from '@/types';
import {
  MessageSquare,
  Search,
  Phone,
  Ticket,
  Calendar,
  CheckCircle,
  Clock,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  PhoneCall,
  User,
  Filter,
  RefreshCw,
  Loader2,
} from 'lucide-react';

export default function TicketsManager() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'resolved'>('all');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  useEffect(() => {
    loadTickets();
  }, []);

  async function loadTickets() {
    setLoading(true);
    try {
      const res = await fetch('/api/tickets');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setTickets(data.data);
      }
    } catch (e) {
      console.error('Error fetching tickets:', e);
    } finally {
      setLoading(false);
    }
  }

  const handleToggleStatus = async (ticket: SupportTicket) => {
    const nextStatus = ticket.status === 'pending' ? 'resolved' : 'pending';
    setActionLoadingId(ticket.id);

    try {
      const res = await fetch(`/api/tickets/${ticket.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setTickets((prev) =>
          prev.map((t) => (t.id === ticket.id ? { ...t, status: nextStatus } : t))
        );
      } else {
        alert(data.error || 'خطا در تغییر وضعیت تیکت');
      }
    } catch (e) {
      alert('خطای اتصال به سرور');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteTicket = async (ticket: SupportTicket) => {
    if (!confirm(`آیا از حذف تیکت «${ticket.subject}» ثبت شده توسط «${ticket.name}» اطمینان دارید؟`)) {
      return;
    }

    setActionLoadingId(ticket.id);
    try {
      const res = await fetch(`/api/tickets/${ticket.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setTickets((prev) => prev.filter((t) => t.id !== ticket.id));
      } else {
        alert(data.error || 'خطا در حذف تیکت');
      }
    } catch (e) {
      alert('خطای اتصال به سرور');
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredTickets = tickets.filter((t) => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      t.name.toLowerCase().includes(q) ||
      t.phone.includes(q) ||
      t.id.toLowerCase().includes(q) ||
      (t.ticketId && t.ticketId.toLowerCase().includes(q)) ||
      t.subject.toLowerCase().includes(q) ||
      t.message.toLowerCase().includes(q)
    );
  });

  const pendingCount = tickets.filter((t) => t.status === 'pending').length;
  const resolvedCount = tickets.filter((t) => t.status === 'resolved').length;

  return (
    <div className="space-y-6">
      
      {/* Header and Stats */}
      <div className="p-6 rounded-3xl bg-[#12131A] border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#00F0FF]" />
            <span>ماژول تیکت‌های پشتیبانی کاربران</span>
            {pendingCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold animate-pulse">
                {pendingCount} تیکت جدید در انتظار تماس
              </span>
            )}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            تمام پیام‌ها، سوالات و مشکلات ارسالی کاربران در این بخش به تمام مدیران نمایش داده می‌شود. جهت پاسخگویی می‌توانید مستقیماً با شماره تماس کاربر تماس حاصل فرمایید.
          </p>
        </div>

        <button
          onClick={loadTickets}
          disabled={loading}
          className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold flex items-center gap-2 self-start md:self-auto transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>بروزرسانی تیکت‌ها</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-4 flex items-center gap-2 bg-[#12131A] p-1.5 rounded-2xl border border-white/10 text-xs">
          <button
            onClick={() => setStatusFilter('all')}
            className={`flex-1 py-2 rounded-xl font-semibold transition-all ${
              statusFilter === 'all'
                ? 'bg-white/15 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            همه تیکت‌ها ({tickets.length})
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`flex-1 py-2 rounded-xl font-semibold transition-all ${
              statusFilter === 'pending'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            در انتظار ({pendingCount})
          </button>
          <button
            onClick={() => setStatusFilter('resolved')}
            className={`flex-1 py-2 rounded-xl font-semibold transition-all ${
              statusFilter === 'resolved'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            بررسی شده ({resolvedCount})
          </button>
        </div>

        <div className="md:col-span-8 relative">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="جستجوی نام کاربر، شماره تلفن، کد تیکت، کد بلیت یا متن پیام..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-10 pl-4 py-3 rounded-2xl bg-[#12131A] border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-[#3A86FF] transition-colors"
          />
        </div>
      </div>

      {/* Tickets List */}
      {loading ? (
        <div className="p-16 rounded-3xl bg-[#12131A] border border-white/10 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-7 h-7 text-[#3A86FF] animate-spin" />
          <span className="text-xs text-slate-400">در حال بارگذاری پیام‌ها...</span>
        </div>
      ) : filteredTickets.length === 0 ? (
        <div className="p-16 rounded-3xl bg-[#12131A] border border-white/10 text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-slate-500">
            <MessageSquare className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-semibold text-white">تیکتی یافت نشد</h4>
          <p className="text-xs text-slate-500">
            {searchQuery ? 'هیچ تیکتی با عبارت جستجوی شما مطابقت ندارد.' : 'هنوز تیکتی در این بخش ثبت نشده است.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTickets.map((t) => {
            const isPending = t.status === 'pending';
            const isWorking = actionLoadingId === t.id;

            return (
              <div
                key={t.id}
                className={`p-6 rounded-3xl border transition-all ${
                  isPending
                    ? 'bg-[#141622] border-[#3A86FF]/30 shadow-[0_4px_25px_-5px_rgba(58,134,255,0.1)]'
                    : 'bg-[#101117] border-white/5 opacity-85'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  
                  {/* Left / Top Info */}
                  <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[#00F0FF]">
                        {t.id}
                      </span>

                      {isPending ? (
                        <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[11px] font-semibold">
                          <Clock className="w-3 h-3" />
                          در انتظار تماس و بررسی
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold">
                          <CheckCircle2 className="w-3 h-3" />
                          بررسی شد / تماس گرفته شد
                        </span>
                      )}

                      <span className="text-[11px] text-slate-500 flex items-center gap-1 mr-auto">
                        <Calendar className="w-3 h-3" />
                        {new Date(t.createdAt).toLocaleString('fa-IR')}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-white">
                      {t.subject}
                    </h4>

                    {/* Sender Details Box */}
                    <div className="flex flex-wrap items-center gap-4 p-3 rounded-2xl bg-white/[0.03] border border-white/5 text-xs">
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <User className="w-3.5 h-3.5 text-[#3A86FF]" />
                        <span className="text-slate-400">نام کاربر:</span>
                        <span className="font-semibold text-white">{t.name}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-[#00F0FF]" />
                        <span className="text-slate-400">شماره تماس:</span>
                        <a
                          href={`tel:${t.phone}`}
                          className="font-mono text-[#00F0FF] hover:underline font-bold flex items-center gap-1"
                          dir="ltr"
                        >
                          <PhoneCall className="w-3 h-3 inline" />
                          {t.phone}
                        </a>
                      </div>

                      {t.ticketId ? (
                        <div className="flex items-center gap-1.5">
                          <Ticket className="w-3.5 h-3.5 text-purple-400" />
                          <span className="text-slate-400">کد بلیت خریده شده:</span>
                          <span className="font-mono font-bold text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                            {t.ticketId}
                          </span>
                        </div>
                      ) : (
                        <div className="text-[11px] text-slate-500">
                          (بدون کد بلیت — کاربر عمومی)
                        </div>
                      )}
                    </div>

                    {/* Message Body */}
                    <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
                      {t.message}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex lg:flex-col items-center gap-2 flex-shrink-0 pt-2 lg:pt-0">
                    <a
                      href={`tel:${t.phone}`}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#7B2CBF] to-[#3A86FF] hover:from-[#6A24A6] hover:to-[#2B73EB] text-white text-xs font-bold flex items-center gap-2 shadow-glow transition-all"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>تماس با کاربر</span>
                    </a>

                    <button
                      onClick={() => handleToggleStatus(t)}
                      disabled={isWorking}
                      className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                        isPending
                          ? 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30'
                          : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
                      }`}
                    >
                      {isPending ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>علامت‌گذاری به عنوان تماس گرفته شد</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-3.5 h-3.5" />
                          <span>تغییر به در انتظار</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleDeleteTicket(t)}
                      disabled={isWorking}
                      className="p-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs transition-colors"
                      title="حذف تیکت"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
