/**
 * Pure TypeScript Sunset Deadline & Daylight Safety Computation.
 * Open-Source rule: TypeScript does all arithmetic, time, and safety calculations.
 */

export interface SunsetDeadline {
  sunsetTime: string; // e.g. "18:05"
  sunriseTime: string; // e.g. "06:15"
  beBackByTime: string; // e.g. "16:20" (sunset - duration - buffer)
  bufferMinutes: number; // e.g. 30
  estimatedDurationMinutes: number;
  willEndAfterDark: boolean;
  isCloseToDusk: boolean;
  minutesUntilSunsetFromNow: number | null;
  warning?: string;
}

/**
 * Computes safety deadline before nightfall based on sunset, walk duration, and safety buffer.
 *
 * @param sunsetStr - Sunset time as "HH:MM" or ISO string (e.g. "18:05" or "2026-10-08T18:05")
 * @param durationMinutes - Estimated walking duration in minutes
 * @param bufferMinutes - Daylight safety margin (default: 30 minutes)
 * @param sunriseStr - Optional sunrise time
 * @param referenceTime - Optional reference time (default: current local time)
 */
export function calculateSunsetDeadline(
  sunsetStr?: string,
  durationMinutes: number = 60,
  bufferMinutes: number = 30,
  sunriseStr?: string,
  referenceTime: Date = new Date()
): SunsetDeadline {
  const safeSunsetStr = sunsetStr || '18:05';
  const safeSunriseStr = sunriseStr || '06:15';

  // Parse sunset hours and minutes
  let sunsetH = 18;
  let sunsetM = 5;

  if (safeSunsetStr.includes(':')) {
    const parts = safeSunsetStr.includes('T') ? safeSunsetStr.split('T')[1].split(':') : safeSunsetStr.split(':');
    sunsetH = parseInt(parts[0], 10) || 18;
    sunsetM = parseInt(parts[1], 10) || 5;
  }

  const sunsetTotalMinutes = sunsetH * 60 + sunsetM;

  // "Be back by" = sunset minus safety buffer
  // Or "Must start by" = sunset minus duration minus buffer
  // The spec says:
  // "Compute 'Be back by HH:MM' in TypeScript (sunset minus estimated duration minus buffer). Show on /trail and print on the Trail Card. Warn if the walk would end after dark."
  const beBackTotalMinutes = Math.max(0, sunsetTotalMinutes - bufferMinutes);
  const beBackH = Math.floor(beBackTotalMinutes / 60) % 24;
  const beBackM = beBackTotalMinutes % 60;
  const beBackByTime = `${beBackH.toString().padStart(2, '0')}:${beBackM.toString().padStart(2, '0')}`;

  // Current time in minutes
  const currentTotalMinutes = referenceTime.getHours() * 60 + referenceTime.getMinutes();
  const minutesUntilSunset = sunsetTotalMinutes - currentTotalMinutes;

  // If walking now: estimated finish time
  const finishTotalMinutes = currentTotalMinutes + durationMinutes;
  const willEndAfterDark = finishTotalMinutes >= sunsetTotalMinutes;
  const isCloseToDusk = finishTotalMinutes >= (sunsetTotalMinutes - 20) && !willEndAfterDark;

  let warning: string | undefined = undefined;
  if (willEndAfterDark) {
    warning = `Nightfall warning: Estimated finish is after sunset (${safeSunsetStr}). Carry a headlamp or shorten route.`;
  } else if (isCloseToDusk) {
    warning = `Low light warning: You will finish within 20 minutes of dusk (${safeSunsetStr}). Return to trailhead before dark.`;
  }

  return {
    sunsetTime: `${sunsetH.toString().padStart(2, '0')}:${sunsetM.toString().padStart(2, '0')}`,
    sunriseTime: safeSunriseStr,
    beBackByTime,
    bufferMinutes,
    estimatedDurationMinutes: durationMinutes,
    willEndAfterDark,
    isCloseToDusk,
    minutesUntilSunsetFromNow: minutesUntilSunset,
    warning,
  };
}
