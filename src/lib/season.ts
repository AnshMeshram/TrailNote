export type Season = 'autumn' | 'winter' | 'spring' | 'summer' | 'monsoon';

export interface SeasonalContext {
  season: Season;
  label: string;
  motif: 'maple' | 'oak' | 'fern' | 'pine' | 'grass' | 'birch';
  color: string;
  foliageDescription: string;
  weatherPrompt: string;
}

/**
 * Calculates current season and appropriate natural motif based on month
 * and optional latitude to respect hemispheres and tropical vs temperate climates.
 */
export function getSeason(date: Date = new Date(), latitude?: number): SeasonalContext {
  const month = date.getMonth(); // 0 = Jan, 9 = Oct
  const isSouthernHemisphere = typeof latitude === 'number' && latitude < 0;
  const isTropical = typeof latitude === 'number' && Math.abs(latitude) <= 23.5;

  // Tropical climate (e.g. Nagpur/India, SE Asia, parts of South America)
  if (isTropical) {
    // June-September: Monsoon
    if (month >= 5 && month <= 8) {
      return {
        season: 'monsoon',
        label: 'Monsoon Green',
        motif: 'fern',
        color: '#3A6704',
        foliageDescription: 'Lush rain-fed undergrowth, damp moss, vibrant canopy',
        weatherPrompt: 'Watch for wet mud, slippery stones, and swollen streams.',
      };
    }
    // October-November: Post-monsoon / Autumn dry-down
    if (month >= 9 && month <= 10) {
      return {
        season: 'autumn',
        label: 'Autumn Foliage',
        motif: 'maple',
        color: '#A64B2A',
        foliageDescription: 'Crisp fallen teak & deciduous leaf litter, drying grasses',
        weatherPrompt: 'Pleasant morning air, dry dirt trails, clear skies.',
      };
    }
    // December-February: Cool winter season
    if (month === 11 || month === 0 || month === 1) {
      return {
        season: 'winter',
        label: 'Cool Winter Trail',
        motif: 'pine',
        color: '#243A18',
        foliageDescription: 'Clear understory, evergreen needles, calm stillness',
        weatherPrompt: 'Cool morning breeze. Pack a light windbreaker layer.',
      };
    }
    // March-May: Warm spring / pre-monsoon
    return {
      season: 'spring',
      label: 'Spring Canopy',
      motif: 'grass',
      color: '#709F2D',
      foliageDescription: 'New tender shoots, dry forest floor, flowering palash',
      weatherPrompt: 'Carry ample water. Walk early before midday heat.',
    };
  }

  // Temperate Northern Hemisphere seasons
  let temperateSeason: Season;
  if (month >= 2 && month <= 4) temperateSeason = 'spring';
  else if (month >= 5 && month <= 7) temperateSeason = 'summer';
  else if (month >= 8 && month <= 10) temperateSeason = 'autumn';
  else temperateSeason = 'winter';

  // Invert for Southern Hemisphere
  const finalSeason = isSouthernHemisphere
    ? (temperateSeason === 'spring' ? 'autumn' : temperateSeason === 'summer' ? 'winter' : temperateSeason === 'autumn' ? 'spring' : 'summer')
    : temperateSeason;

  switch (finalSeason) {
    case 'autumn':
      return {
        season: 'autumn',
        label: 'Autumn Foliage',
        motif: 'maple',
        color: '#A64B2A',
        foliageDescription: 'Amber canopies, crisp leaf litter, drying bracken',
        weatherPrompt: 'Days are getting shorter. Check sunset time before leaving.',
      };
    case 'winter':
      return {
        season: 'winter',
        label: 'Winter Stillness',
        motif: 'pine',
        color: '#243A18',
        foliageDescription: 'Bare branches, evergreen needles, frozen earth, low light',
        weatherPrompt: 'Colder air and early dusk. Pack warm layers and check daylight.',
      };
    case 'spring':
      return {
        season: 'spring',
        label: 'Spring Bloom',
        motif: 'birch',
        color: '#709F2D',
        foliageDescription: 'Unfurling fiddleheads, tender leaf buds, damp earth',
        weatherPrompt: 'Variable spring showers. Wear water-resistant trail shoes.',
      };
    case 'summer':
    default:
      return {
        season: 'summer',
        label: 'Summer Canopy',
        motif: 'oak',
        color: '#3A6704',
        foliageDescription: 'Dense green shade, humming insects, dusty dry footpaths',
        weatherPrompt: 'Stay hydrated and seek shaded woodland ridges.',
      };
  }
}
