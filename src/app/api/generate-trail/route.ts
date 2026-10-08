import { NextRequest, NextResponse } from 'next/server';
import { TrailPreferencesSchema } from '@/schemas/trail';
import { geocodeLocation } from '@/lib/maps/nominatim';
import { fetchCurrentWeather } from '@/lib/weather/open-meteo';
import { calculateFootRoute } from '@/lib/maps/osrm';
import { generateTrailGuide } from '@/lib/ai/service';
import { TrailPlan, TrailCardData } from '@/types/trail';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parseResult = TrailPreferencesSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid trail preferences',
          details: parseResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const preferences = parseResult.data;

    // 1. Resolve geography (use pre-selected trailLocation coords if available, otherwise geocode)
    const geocoded = preferences.trailLocation
      ? {
          name: preferences.trailLocation.displayName.split(',')[0].trim(),
          displayName: preferences.trailLocation.displayName,
          lat: preferences.trailLocation.lat,
          lng: preferences.trailLocation.lng,
          latitude: preferences.trailLocation.lat,
          longitude: preferences.trailLocation.lng,
          city: preferences.trailLocation.city,
          state: preferences.trailLocation.state,
          country: preferences.trailLocation.country,
        }
      : await geocodeLocation(preferences.location);

    // 2. Fetch atmospheric conditions via Open-Meteo
    const weather = await fetchCurrentWeather(geocoded.lat, geocoded.lng);

    // 3. Compute trail route via OSRM
    const routeData = await calculateFootRoute(
      geocoded.lat,
      geocoded.lng,
      preferences.distancePreferenceKm,
      geocoded.name || geocoded.displayName || preferences.location
    );

    // 4. Generate naturalist briefing & observation prompts via Gemma 2 (with deterministic fallback)
    const aiResult = await generateTrailGuide(
      preferences,
      geocoded.displayName,
      weather,
      routeData.distanceKm,
      routeData.durationMinutes
    );

    const planId = `tn-${Date.now().toString(36)}`;
    const nowIso = new Date().toISOString();

    // Assemble complete TrailPlan
    const plan: TrailPlan = {
      id: planId,
      name: aiResult.data.trailName,
      location: geocoded.displayName,
      region: geocoded.name,
      coordinatesSummary: `${geocoded.lat.toFixed(4)}°N, ${geocoded.lng.toFixed(4)}°E`,
      distanceKm: routeData.distanceKm,
      durationMinutes: routeData.durationMinutes,
      difficulty: preferences.difficulty,
      elevationGainM: routeData.elevationGainM,
      terrain: preferences.preferredTerrain,
      startPoint: routeData.waypoints[0]?.name || `${geocoded.name} Trailhead`,
      endPoint: routeData.waypoints[routeData.waypoints.length - 1]?.name || 'Loop Finish',
      routeSummary: routeData.summary,
      waypoints: routeData.waypoints,
      weather,
      preparation: aiResult.data.preparation,
      safetyNotes: aiResult.data.safetyNotes,
      observations: aiResult.data.observations.map((obs, idx) => ({
        id: `obs-${idx + 1}`,
        number: `0${idx + 1}`,
        title: obs.title,
        prompt: obs.prompt,
        category: obs.category,
      })),
      outdoorChallenges: aiResult.data.outdoorChallenges,
      trailBriefing: aiResult.data.trailBriefing,
      fieldPrompt: aiResult.data.fieldPrompt,
      createdAt: nowIso,
      deviceLocation: preferences.deviceLocation || null,
      trailLocation: preferences.trailLocation || {
        displayName: geocoded.displayName,
        lat: geocoded.lat,
        lng: geocoded.lng,
        city: geocoded.city,
        state: geocoded.state,
        country: geocoded.country,
      },
      aiMetadata: {
        source: aiResult.source,
        modelUsed: aiResult.modelUsed,
      },
    };

    // Assemble condensed TrailCardData
    const hours = Math.floor(routeData.durationMinutes / 60);
    const mins = routeData.durationMinutes % 60;
    const durationFormatted =
      hours > 0 ? `${hours}h ${mins > 0 ? `${mins}m` : ''}` : `${mins}m`;

    const card: TrailCardData = {
      id: planId,
      trailName: aiResult.data.trailName,
      location: geocoded.displayName,
      distanceKm: routeData.distanceKm,
      durationFormatted,
      difficulty: preferences.difficulty,
      weatherSummary: `${weather.tempC}°C · ${weather.condition}`,
      tempC: weather.tempC,
      startPoint: plan.startPoint,
      endPoint: plan.endPoint,
      essentialsToBring: aiResult.data.preparation,
      observations: plan.observations.map((o) => ({
        number: o.number,
        text: o.prompt,
      })),
      briefing: aiResult.data.trailBriefing,
      terrainNotes: aiResult.data.routeDescription,
      safetyNote: aiResult.data.safetyNotes[0] || 'Take care on uneven ground.',
      generatedDate: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      aiMetadata: {
        source: aiResult.source,
        modelUsed: aiResult.modelUsed,
      },
    };

    return NextResponse.json({
      success: true,
      plan,
      card,
      source: aiResult.source,
      modelUsed: aiResult.modelUsed,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown server error';
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate trail guide',
        details: message,
      },
      { status: 500 }
    );
  }
}
