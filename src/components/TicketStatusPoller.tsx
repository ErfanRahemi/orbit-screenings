'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BookingStatus } from '@/types';
import { Loader2 } from 'lucide-react';

interface TicketStatusPollerProps {
  bookingId: string;
  currentStatus: BookingStatus;
}

export default function TicketStatusPoller({
  bookingId,
  currentStatus,
}: TicketStatusPollerProps) {
  const router = useRouter();

  useEffect(() => {
    if (currentStatus !== 'pending') return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(
          `/api/bookings/${encodeURIComponent(bookingId)}`,
          { cache: 'no-store' }
        );
        const data = await res.json();
        if (data.success && data.data && data.data.status !== 'pending') {
          router.refresh();
        }
      } catch (e) {
        // ignore transient network errors during polling
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [bookingId, currentStatus, router]);

  if (currentStatus !== 'pending') return null;

  return (
    <div className="no-print inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold">
      <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
      <span>در انتظار دریافت تاییدیه خودکار پرداخت از درگاه واریزا...</span>
    </div>
  );
}
