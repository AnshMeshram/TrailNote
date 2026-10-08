import { TrailPreferences, WeatherCondition } from '@/types/trail';

export function buildTrailPrompt(
  preferences: TrailPreferences,
  locationName: string,
  weather: WeatherCondition,
  distanceKm: number,
  durationMinutes: number
): { prompt: string; systemPrompt: string } {
  const systemPrompt = `You are a quiet, observant outdoor naturalist and field guide author for Trailnote.
Your philosophy: "Plan the walk. Make the note. Put the phone away."
Help the walker prepare to leave the screen and experience the outdoors through all five senses.
Speak in thoughtful, practical, evocative field-guide language.
DO NOT use generic AI clichés like "delve", "testament", "tapestry", "embark", or "game-changer".
DO NOT perform mathematical calculations. The route distance (${distanceKm.toFixed(1)} km) and duration (${durationMinutes} minutes) are already calculated by code.
Return ONLY a valid JSON object matching the requested schema. No intro, no conversational remarks.`;

  const prompt = `Generate a naturalist outdoor guide for this walk:

LOCATION: ${locationName}
DISTANCE: ${distanceKm.toFixed(1)} km
PLANNED DURATION: ${durationMinutes} minutes
DIFFICULTY: ${preferences.difficulty}
FITNESS LEVEL: ${preferences.fitnessLevel}
NATURE CURIOSITIES: ${preferences.natureInterests.join(', ') || 'Autumn leaves, bird calls, tree bark'}
TERRAIN PREFERENCES: ${preferences.preferredTerrain.join(', ') || 'Dirt path, forest floor'}
WEATHER: ${weather.tempC}°C, ${weather.condition}, ${weather.windKmh} km/h wind, ${weather.precipitationPercent}% rain probability (${weather.summary})
USER NOTES: ${preferences.notes || 'None'}

Return ONLY a JSON object with this exact shape:
{
  "trailName": "A grounded, evocative outdoor trail name (e.g. 'Old Teak Ridge Circuit' or 'Copper Leaf Trailway')",
  "trailBriefing": "A concise 2-3 sentence field briefing providing directional and scenic orientation.",
  "routeDescription": "A practical 2-sentence description of the terrain grade, soil, and canopy cover.",
  "preparation": [
    "3-4 practical packing or preparation items tailored to the terrain and weather"
  ],
  "observations": [
    {
      "category": "flora",
      "title": "Specific botanical observation prompt",
      "prompt": "Clear, grounded sensory prompt (e.g. Look for three distinct leaf shapes on the dirt path and examine their vein patterns)"
    },
    {
      "category": "soundscape",
      "title": "Auditory listening prompt",
      "prompt": "Specific listening prompt (e.g. Pause for 60 seconds at the creek to listen for two bird calls)"
    },
    {
      "category": "geology",
      "title": "Tactile or rock/soil observation",
      "prompt": "Sensory observation of rock, mud, lichen, or terrain change"
    }
  ],
  "outdoorChallenges": [
    "1-2 gentle, screen-free outdoor challenges (e.g. 'Walk the next 500 meters in complete silence' or 'Find one fallen pinecone or acorn and sketch its symmetry')"
  ],
  "safetyNotes": [
    "1-2 practical safety advisories based on the terrain and weather"
  ],
  "fieldPrompt": "A single contemplative sentence to ponder while walking without looking at a phone.",
  "suggestedPaceAdvice": "Unhurried, rhythmic pace with breathing aligned to stride"
}`;

  return { prompt, systemPrompt };
}

export function buildJournalSynthesisPrompt(
  rawNotes: string,
  trailName: string,
  location: string
): { prompt: string; systemPrompt: string } {
  const systemPrompt = `You are an editorial outdoor field scribe. Preserve the walker's authentic voice while turning raw field notes into a beautiful, brief naturalist field journal entry.`;

  const prompt = `Synthesize these raw field notes into a polished 3-4 sentence field notebook entry:

TRAIL: ${trailName} (${location})
RAW NOTES:
"""
${rawNotes}
"""

Return ONLY a JSON object:
{
  "journalEntry": "The synthesized paragraph in naturalist journal style",
  "keyObservations": ["Observation 1", "Observation 2"],
  "notableSpecies": ["Any flora or fauna mentioned"]
}`;

  return { prompt, systemPrompt };
}
