import { NextRequest } from 'next/server';
import { POST as createBookingWithVariza } from '@/app/api/bookings/route';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  return createBookingWithVariza(request);
}
