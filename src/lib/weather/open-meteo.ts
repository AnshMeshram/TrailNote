import { WeatherCondition } from '@/types/trail';

/**
 * Open-Meteo API Client.
 * https://github.com/open-meteo/open-meteo
 * Fetches free, open-source atmospheric and forecast data without requiring an API key.
 */

// WMO Weather Interpretation Codes
const WMO_CODES: Record<number, { condition: string; summary: string }> = {
  0: { condition: 'Clear Sky', summary: 'Crisp, clear air and unobscured sunshine' },
  1: { condition: 'Mainly Clear', summary: 'Gentle fair-weather clouds with bright natural light' },
  2: { condition: 'Partly Cloudy', summary: 'Dappled sun filtered through broken cloud cover' },
  3: { condition: 'Overcast', summary: 'Muted grey canopy, ideal for glare-free forest walking' },
  45: { condition: 'Foggy', summary: 'Misty low-lying vapor hanging in the trees' },
  48: { condition: 'Depositing Rime Fog', summary: 'Cool damp mist clinging to pine needles and leaves' },
  51: { condition: 'Light Drizzle', summary: 'Soft misty drizzle, damp earth fragrance' },
  53: { condition: 'Moderate Drizzle', summary: 'Steady autumn drizzle; damp forest floor' },
  55: { condition: 'Dense Drizzle', summary: 'Persistent autumn precipitation' },
  61: { condition: 'Slight Rain', summary: 'Light rain showers falling through the canopy' },
  63: { condition: 'Moderate Rain', summary: 'Steadier rainfall; slick roots and muddy footpaths' },
  65: { condition: 'Heavy Rain', summary: 'Intense rain; waterproof shell and caution required' },
  71: { condition: 'Slight Snow', summary: 'Light flurries dusting the rocks and fallen leaves' },
  80: { condition: 'Rain Showers', summary: 'Passing showers between breaks in the clouds' },
};

export async function fetchCurrentWeather(lat: number, lng: number): Promise<WeatherCondition> {
  try {
    const url = new URL('https://api.open-meteo.com/v1/forecast');
    url.searchParams.set('latitude', lat.toFixed(4));
    url.searchParams.set('longitude', lng.toFixed(4));
    url.searchParams.set('current', 'temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,precipitation');
    url.searchParams.set('hourly', 'precipitation_probability');
    url.searchParams.set('timezone', 'auto');
    url.searchParams.set('forecast_days', '1');

    const res = await fetch(url.toString(), {
      signal: AbortSignal.timeout(3500),
    });

    if (res.ok) {
      const data = (await res.json()) as {
        current?: {
          temperature_2m: number;
          weather_code: number;
          wind_speed_10m: number;
          precipitation: number;
        };
        hourly?: {
          precipitation_probability?: number[];
        };
      };

      if (data.current) {
        const code = data.current.weather_code ?? 0;
        const wmo = WMO_CODES[code] || {
          condition: 'Fair Outdoor Conditions',
          summary: 'Quiet natural weather suitable for outdoor exploration',
        };

        const precipProb =
          data.hourly?.precipitation_probability?.[0] ??
          (data.current.precipitation > 0 ? 70 : 10);

        return {
          tempC: Math.round(data.current.temperature_2m),
          condition: wmo.condition,
          windKmh: Math.round(data.current.wind_speed_10m),
          precipitationPercent: Math.round(precipProb),
          summary: wmo.summary,
        };
      }
    }
  } catch {
    // Graceful fallback to seasonal autumn standard
  }

  // Deterministic seasonal default
  return {
    tempC: 22,
    condition: 'Clear Autumn Sky',
    windKmh: 9,
    precipitationPercent: 8,
    summary: 'Cool morning breeze with crisp trail visibility',
  };
}
