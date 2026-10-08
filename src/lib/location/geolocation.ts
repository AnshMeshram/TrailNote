/**
 * Native browser geolocation utility.
 * Strict privacy: Only triggered on explicit user action.
 * Zero external packages, zero continuous tracking.
 */

export interface GeolocationResult {
  success: boolean;
  coords?: {
    latitude: number;
    longitude: number;
    accuracy?: number;
  };
  error?: string;
}

export async function getCurrentLocation(): Promise<GeolocationResult> {
  if (typeof window === 'undefined' || !('geolocation' in navigator)) {
    return {
      success: false,
      error: 'Geolocation is not supported by your current browser. Please enter your location manually.',
    };
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          success: true,
          coords: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          },
        });
      },
      (error) => {
        let message = 'Unable to retrieve location.';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = 'Location permission was denied. You can enter your park or city manually above.';
            break;
          case error.POSITION_UNAVAILABLE:
            message = 'GPS position is currently unavailable. Please check your connection or type manually.';
            break;
          case error.TIMEOUT:
            message = 'Location request timed out. Please try again or enter your location manually.';
            break;
          default:
            message = error.message || 'An unexpected error occurred while locating.';
        }
        resolve({
          success: false,
          error: message,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  });
}
