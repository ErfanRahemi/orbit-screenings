import { NextRequest, NextResponse } from 'next/server';
import { handleVarizaWebhookRequest } from '@/lib/variza';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    ok: true,
    status: 'active',
    service: 'ORBIT Variza Webhook Endpoint',
    method: 'POST required for payment.paid events',
  });
}

export async function POST(request: NextRequest) {
  return handleVarizaWebhookRequest(request);
}
