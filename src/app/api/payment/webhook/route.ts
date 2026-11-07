import { NextRequest } from 'next/server';
import { handleVarizaWebhookRequest } from '@/lib/variza';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  return handleVarizaWebhookRequest(request);
}
