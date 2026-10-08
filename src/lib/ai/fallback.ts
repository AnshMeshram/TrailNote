import { GemmaTrailResponse } from '@/schemas/trail';
import { TrailPreferences, WeatherCondition } from '@/types/trail';

/**
 * Deterministic fallback generator.
 * Produces authentic, rich naturalist field guide data when local Ollama is offline or Gemma is not loaded.
 * Ensures Trailnote never fails or shows broken screens to the user.
 */
export function generateDeterministicTrail(
  preferences: TrailPreferences,
  locationName: string,
  weather: WeatherCondition,
  distanceKm: number
): GemmaTrailResponse {
  const isWet = weather.precipitationPercent > 35 || weather.condition.toLowerCase().includes('rain');
  const isCold = weather.tempC < 14;
  const isWarm = weather.tempC > 26;

  // Curate realistic trail name
  const locPrefix = locationName.split(',')[0].trim() || 'Forest Ridge';
  const nameVariants: Record<string, string> = {
    easy: `${locPrefix} Nature Pathway`,
    moderate: `${locPrefix} Autumn Canopy Circuit`,
    challenging: `${locPrefix} Ridge & Outcrop Traverse`,
    rugged: `${locPrefix} Primitive Valley Loop`,
  };
  const trailName = nameVariants[preferences.difficulty] || `${locPrefix} Explorer Loop`;

  // Briefing tailored to difficulty & terrain
  let trailBriefing = `A quiet, contemplative route winding through ${preferences.preferredTerrain.join(' and ') || 'wooded footpaths'}. `;
  if (preferences.difficulty === 'easy') {
    trailBriefing += 'Gentle grade with wide, packed footways ideal for relaxed sensory observation and gentle strides.';
  } else if (preferences.difficulty === 'moderate') {
    trailBriefing += 'Rolling grade through shaded groves with gentle climbs that reward unhurried exploration.';
  } else {
    trailBriefing += 'Sustained elevation with uneven rocky tread requiring deliberate foot placement and steady breath.';
  }

  // Preparation items tailored to weather and effort
  const prep: string[] = [
    `${(Math.max(1, Math.round(distanceKm * 0.25 * 10)) / 10).toFixed(1)}L drinking water`,
    'Sturdy, comfortable trail footwear with gripping soles',
  ];

  if (isWet) {
    prep.push('Lightweight waterproof rain shell or pack poncho');
    prep.push('Waterproof sleeve or bag for notebook and essentials');
  } else if (isCold) {
    prep.push('Warm insulating wool or fleece mid-layer');
    prep.push('Light knit beanie or neck gaiter for ridge winds');
  } else if (isWarm) {
    prep.push('Wide-brimmed sun hat and breathable light layers');
    prep.push('Electrolyte pack or natural dried fruit snack');
  } else {
    prep.push('Light breathable autumn windbreaker');
  }

  prep.push('Physical notebook and graphite pencil (Leave No Trace)');

  // 3 Observation prompts tailored to user curiosities
  const observations = [
    {
      category: 'flora' as const,
      title: 'Leaf Margins & Vein Structure',
      prompt: `Find three fallen leaves of distinct species on the trail edge. Rub them gently between your fingertips to compare their texture and study how their primary veins branch.`,
    },
    {
      category: 'soundscape' as const,
      title: 'Canopy Sound Filter',
      prompt: `Stop near a thicket or stream for sixty unbroken seconds. Close your eyes and identify the quietest natural sound reaching your ears above the wind.`,
    },
    {
      category: 'geology' as const,
      title: 'Soil & Bedrock Transition',
      prompt: `Notice the point where loose leaf humus transitions into firmer mineral soil or exposed stone. Pay attention to how your footsteps sound on different ground.`,
    },
  ];

  // Micro-challenges
  const outdoorChallenges = [
    'Walk the first 15 minutes without touching any digital device.',
    'Collect zero souvenirs except mental impressions and handwritten pencil notes.',
  ];

  // Safety advisories
  const safetyNotes = [
    isWet
      ? 'Exposed tree roots and damp leaves can be slick; shorten your stride on descents.'
      : 'Maintain steady footing on loose gravel and dry switchbacks.',
    'Inform someone of your intended trail window before setting out.',
  ];

  return {
    trailName,
    trailBriefing,
    routeDescription: `Footpath composed of ${preferences.preferredTerrain[0] || 'natural packed dirt'} with natural drainage and tree canopy cover.`,
    preparation: prep,
    observations,
    outdoorChallenges,
    safetyNotes,
    fieldPrompt: 'Look up into the canopy twice as often as you look at your boots.',
    suggestedPaceAdvice: 'Steady, conversational pace (~3.8 km/h). Allow your senses to dictate your speed.',
  };
}
