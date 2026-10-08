import { NextRequest, NextResponse } from 'next/server';
import { checkOllamaStatus } from '@/lib/ai/client';

export async function GET(request: NextRequest) {
  const requestedModel = request.nextUrl.searchParams.get('model') || undefined;
  const startTime = Date.now();
  const status = await checkOllamaStatus(requestedModel);
  const latencyMs = Date.now() - startTime;

  return NextResponse.json({
    status: status.isAvailable ? 'ready' : 'fallback-ready',
    isAvailable: status.isAvailable,
    model: status.model,
    baseUrl: status.baseUrl,
    availableModels: status.availableModels,
    isModelPresent: status.isModelPresent,
    latencyMs,
    checkedAt: new Date().toISOString(),
  });
}
