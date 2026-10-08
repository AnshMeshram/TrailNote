import { z } from 'zod';

export const ObservationItemSchema = z.object({
  title: z.string().min(1, 'Observation title is required'),
  prompt: z.string().min(1, 'Observation prompt is required'),
  category: z.enum(['flora', 'fauna', 'geology', 'soundscape', 'quiet-mind']).optional(),
});

export const GemmaTrailResponseSchema = z.object({
  trailName: z.string().min(1, 'Trail name is required'),
  trailBriefing: z.string().min(1, 'Trail briefing is required'),
  routeDescription: z.string().min(1, 'Route description is required'),
  preparation: z.array(z.string()).min(1, 'At least one preparation item is required'),
  observations: z.array(ObservationItemSchema).min(2, 'At least two nature observations required'),
  outdoorChallenges: z.array(z.string()).min(1, 'At least one outdoor challenge is required'),
  safetyNotes: z.array(z.string()).min(1, 'Safety notes are required'),
  fieldPrompt: z.string().min(1, 'Field prompt note is required'),
  suggestedPaceAdvice: z.string().optional(),
});

export type GemmaTrailResponse = z.infer<typeof GemmaTrailResponseSchema>;

export const DeviceLocationSchema = z.object({
  lat: z.number(),
  lng: z.number(),
  accuracyM: z.number().optional(),
  timestamp: z.number().optional(),
});

export const TrailLocationSchema = z.object({
  query: z.string().optional(),
  displayName: z.string(),
  lat: z.number(),
  lng: z.number(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  isCustomGps: z.boolean().optional(),
});

export const TrailPreferencesSchema = z.object({
  location: z.string().min(2, 'Location must be at least 2 characters'),
  trailLocation: TrailLocationSchema.optional(),
  deviceLocation: DeviceLocationSchema.nullable().optional(),
  availableTimeMinutes: z.number().int().min(15).max(480),
  difficulty: z.enum(['easy', 'moderate', 'challenging', 'rugged']),
  fitnessLevel: z.enum(['beginner', 'moderate', 'active', 'experienced']),
  distancePreferenceKm: z.number().min(0.5).max(50),
  interests: z.array(z.string()),
  natureInterests: z.array(z.string()),
  preferredTerrain: z.array(z.string()),
  weatherTolerance: z.enum(['fair-weather', 'light-rain', 'all-weather']),
  accessibilityRequirements: z.array(z.string()).optional(),
  notes: z.string().optional(),
});
