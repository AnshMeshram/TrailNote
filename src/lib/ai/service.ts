import { callOllama } from './client';
import { parseAIJson } from './parser';
import { buildTrailPrompt } from './prompts';
import { generateDeterministicTrail } from './fallback';
import { GemmaTrailResponse, GemmaTrailResponseSchema } from '@/schemas/trail';
import { TrailPreferences, WeatherCondition } from '@/types/trail';

export interface TrailGenerationResult {
  data: GemmaTrailResponse;
  source: 'ai' | 'fallback';
  modelUsed?: string;
}

/**
 * Orchestrates AI trail guide generation with Zod validation and transparent fallback.
 */
export async function generateTrailGuide(
  preferences: TrailPreferences,
  locationName: string,
  weather: WeatherCondition,
  distanceKm: number,
  durationMinutes: number,
  modelOverride?: string
): Promise<TrailGenerationResult> {
  const { prompt, systemPrompt } = buildTrailPrompt(
    preferences,
    locationName,
    weather,
    distanceKm,
    durationMinutes
  );

  const { response, ok, modelUsed } = await callOllama(prompt, systemPrompt, modelOverride);

  if (ok && response) {
    const parsed = parseAIJson<unknown>(response);
    if (parsed) {
      const validation = GemmaTrailResponseSchema.safeParse(parsed);
      if (validation.success) {
        return {
          data: validation.data,
          source: 'ai',
          modelUsed,
        };
      }
    }
  }

  // Graceful deterministic fallback
  const fallbackData = generateDeterministicTrail(
    preferences,
    locationName,
    weather,
    distanceKm
  );

  return {
    data: fallbackData,
    source: 'fallback',
  };
}
