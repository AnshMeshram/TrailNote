/**
 * OpenStreetMap Nominatim Geocoding Client.
 * https://github.com/osm-search/Nominatim
 * Resolves location queries into geographic coordinates and reverses coordinates to places.
 */

export interface TrailnoteNormalizedLocation {
  latitude: number;
  longitude: number;
  lat: number;
  lng: number;
  displayName: string;
  city?: string;
  state?: string;
  country?: string;
  name?: string;
}

// In-memory cache for search & reverse to prevent redundant external queries
const searchCache = new Map<string, TrailnoteNormalizedLocation>();
const searchListCache = new Map<string, TrailnoteNormalizedLocation[]>();
const reverseCache = new Map<string, TrailnoteNormalizedLocation>();

let lastRequestTimestamp = 0;

/**
 * 1 req/sec throttle to respect OpenStreetMap Nominatim Usage Policy
 */
export async function throttleNominatim(): Promise<void> {
  const now = Date.now();
  const elapsed = now - lastRequestTimestamp;
  if (elapsed < 1000) {
    await new Promise((resolve) => setTimeout(resolve, 1000 - elapsed));
  }
  lastRequestTimestamp = Date.now();
}

// Fallback coordinates for known outdoor regions if API is unreachable or offline
const REGIONAL_FALLBACKS: Record<string, TrailnoteNormalizedLocation> = {
  nagpur: {
    name: 'Seminary Hills',
    displayName: 'Seminary Hills Reserve, Nagpur, Maharashtra, India',
    latitude: 21.1643,
    longitude: 79.0628,
    lat: 21.1643,
    lng: 79.0628,
    city: 'Nagpur',
    state: 'Maharashtra',
    country: 'India',
  },
  ambazari: {
    name: 'Ambazari Lake & Biodiversity Park',
    displayName: 'Ambazari Lake Trailway, Nagpur, Maharashtra, India',
    latitude: 21.1306,
    longitude: 79.0439,
    lat: 21.1306,
    lng: 79.0439,
    city: 'Nagpur',
    state: 'Maharashtra',
    country: 'India',
  },
  portland: {
    name: 'Forest Park',
    displayName: 'Forest Park, Portland, Oregon, United States',
    latitude: 45.5398,
    longitude: -122.7562,
    lat: 45.5398,
    lng: -122.7562,
    city: 'Portland',
    state: 'Oregon',
    country: 'United States',
  },
  seattle: {
    name: 'Discovery Park',
    displayName: 'Discovery Park, Seattle, Washington, United States',
    latitude: 47.6575,
    longitude: -122.4055,
    lat: 47.6575,
    lng: -122.4055,
    city: 'Seattle',
    state: 'Washington',
    country: 'United States',
  },
  default: {
    name: 'Regional Natural Forest Reserve',
    displayName: 'Regional Natural Forest Trailway, Nagpur, India',
    latitude: 21.1458,
    longitude: 79.0882,
    lat: 21.1458,
    lng: 79.0882,
    city: 'Nagpur',
    state: 'Maharashtra',
    country: 'India',
  },
};

const getUserAgent = () =>
  process.env.NOMINATIM_USER_AGENT ||
  'Trailnote/1.0 (Hacktoberfest-TouchGrass; trailnote@local.dev)';

const getBaseUrl = () =>
  process.env.NOMINATIM_BASE_URL || 'https://nominatim.openstreetmap.org';

/**
 * Multi-result search -> Normalized place objects
 */
export async function searchLocations(
  query: string,
  limit: number = 5
): Promise<TrailnoteNormalizedLocation[]> {
  const normalized = (query || '').trim().toLowerCase();
  if (!normalized) {
    return [REGIONAL_FALLBACKS.default];
  }

  const cacheKey = `${normalized}:${limit}`;
  if (searchListCache.has(cacheKey)) {
    return searchListCache.get(cacheKey)!;
  }

  try {
    await throttleNominatim();
    const url = new URL(`${getBaseUrl()}/search`);
    url.searchParams.set('q', query);
    url.searchParams.set('format', 'jsonv2');
    url.searchParams.set('limit', limit.toString());
    url.searchParams.set('addressdetails', '1');

    const res = await fetch(url.toString(), {
      headers: {
        'User-Agent': getUserAgent(),
        Accept: 'application/json',
      },
      signal: AbortSignal.timeout(4000),
    });

    if (res.ok) {
      const data = (await res.json()) as Array<{
        name?: string;
        display_name: string;
        lat: string;
        lon: string;
        address?: {
          city?: string;
          town?: string;
          village?: string;
          state?: string;
          country?: string;
        };
      }>;

      if (Array.isArray(data) && data.length > 0) {
        const results: TrailnoteNormalizedLocation[] = data.map((item) => {
          const parsedLat = parseFloat(item.lat);
          const parsedLng = parseFloat(item.lon);
          const city = item.address?.city || item.address?.town || item.address?.village || item.name;
          return {
            name: item.name || item.display_name.split(',')[0].trim(),
            displayName: item.display_name,
            latitude: parsedLat,
            longitude: parsedLng,
            lat: parsedLat,
            lng: parsedLng,
            city,
            state: item.address?.state,
            country: item.address?.country,
          };
        });

        searchListCache.set(cacheKey, results);
        return results;
      }
    }
  } catch (err) {
    console.warn('Nominatim search query fallback:', err);
  }

  const matches = Object.entries(REGIONAL_FALLBACKS)
    .filter(([key]) => key !== 'default' && normalized.includes(key))
    .map(([, fb]) => fb);

  const fallbackResults = matches.length > 0 ? matches : [
    {
      name: query.split(',')[0].trim(),
      displayName: query,
      latitude: 21.1643,
      longitude: 79.0628,
      lat: 21.1643,
      lng: 79.0628,
      city: 'Nagpur',
      state: 'Maharashtra',
      country: 'India',
    },
  ];

  searchListCache.set(cacheKey, fallbackResults);
  return fallbackResults;
}

/**
 * Text search -> Coordinates (single result)
 */
export async function geocodeLocation(query: string): Promise<TrailnoteNormalizedLocation> {
  const list = await searchLocations(query, 1);
  return list[0] || REGIONAL_FALLBACKS.default;
}

/**
 * Coordinates -> Normalized place object (Reverse Geocoding)
 */
export async function reverseGeocodeLocation(
  lat: number,
  lng: number
): Promise<TrailnoteNormalizedLocation> {
  const cacheKey = `${lat.toFixed(4)},${lng.toFixed(4)}`;
  if (reverseCache.has(cacheKey)) {
    return reverseCache.get(cacheKey)!;
  }

  try {
    await throttleNominatim();
    const url = new URL(`${getBaseUrl()}/reverse`);
    url.searchParams.set('lat', lat.toString());
    url.searchParams.set('lon', lng.toString());
    url.searchParams.set('format', 'jsonv2');
    url.searchParams.set('addressdetails', '1');

    const res = await fetch(url.toString(), {
      headers: {
        'User-Agent': getUserAgent(),
        Accept: 'application/json',
      },
      signal: AbortSignal.timeout(4000),
    });

    if (res.ok) {
      const data = (await res.json()) as {
        name?: string;
        display_name: string;
        address?: {
          leisure?: string;
          suburb?: string;
          city?: string;
          town?: string;
          village?: string;
          county?: string;
          state?: string;
          country?: string;
        };
      };

      if (data && data.display_name) {
        const city = data.address?.city || data.address?.town || data.address?.village || data.address?.county || '';
        const state = data.address?.state || '';
        const country = data.address?.country || '';
        const primary = data.name || data.address?.leisure || data.address?.suburb || city || 'Current Location';

        const result: TrailnoteNormalizedLocation = {
          name: primary,
          displayName: data.display_name,
          latitude: lat,
          longitude: lng,
          lat,
          lng,
          city,
          state,
          country,
        };

        reverseCache.set(cacheKey, result);
        return result;
      }
    }
  } catch {
    // Fall back to clean coordinates description
  }

  const fallback: TrailnoteNormalizedLocation = {
    name: 'Current Outdoor Location',
    displayName: `Coordinates: ${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E`,
    latitude: lat,
    longitude: lng,
    lat,
    lng,
  };
  reverseCache.set(cacheKey, fallback);
  return fallback;
}
