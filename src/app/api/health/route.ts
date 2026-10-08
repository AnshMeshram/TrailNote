import { NextResponse } from 'next/server';
import { checkOllamaStatus } from '@/lib/ai/client';

export async function GET() {
  const status = await checkOllamaStatus();

  return NextResponse.json({
    status: status.isAvailable ? 'ready' : 'fallback-ready',
    isAvailable: status.isAvailable,
    model: status.model,
    baseUrl: status.baseUrl,
    availableModels: status.availableModels,
    checkedAt: new Date().toISOString(),
  });
}
