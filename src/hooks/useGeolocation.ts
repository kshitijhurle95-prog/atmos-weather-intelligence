'use client';

import { useState, useCallback, useMemo } from 'react';

/**
 * Return type for the browser geolocation hook.
 */
export interface UseGeolocationReturn {
  /** Prompt the browser for the current position. Resolves with lat/lon. */
  getCurrentPosition: () => Promise<{ lat: number; lon: number }>;
  /** `true` while the browser is actively resolving the position. */
  isLocating: boolean;
  /** Human-readable error string, or `null` when there is no error. */
  locationError: string | null;
  /** `false` when the browser does not support the Geolocation API. */
  isSupported: boolean;
}

// ---------------------------------------------------------------------------
// Friendly error messages
// ---------------------------------------------------------------------------
function friendlyGeoError(error: GeolocationPositionError): string {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return 'Location permission was denied. Please enable location access in your browser settings.';
    case error.POSITION_UNAVAILABLE:
      return 'Your location is currently unavailable. Please try again later.';
    case error.TIMEOUT:
      return 'Location request timed out. Please check your connection and try again.';
    default:
      return 'An unknown error occurred while retrieving your location.';
  }
}

/**
 * Hook that wraps the browser Geolocation API with loading / error state.
 */
export function useGeolocation(): UseGeolocationReturn {
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const isSupported = useMemo(
    () => typeof window !== 'undefined' && 'geolocation' in navigator,
    [],
  );

  const getCurrentPosition = useCallback((): Promise<{ lat: number; lon: number }> => {
    return new Promise((resolve, reject) => {
      if (!isSupported) {
        const msg = 'Geolocation is not supported by your browser.';
        setLocationError(msg);
        reject(new Error(msg));
        return;
      }

      setIsLocating(true);
      setLocationError(null);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setIsLocating(false);
          const coords = {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          };
          resolve(coords);
        },
        (error) => {
          setIsLocating(false);
          const msg = friendlyGeoError(error);
          setLocationError(msg);
          reject(new Error(msg));
        },
        {
          enableHighAccuracy: false,
          timeout: 10_000,
          maximumAge: 300_000, // 5 minutes
        },
      );
    });
  }, [isSupported]);

  return { getCurrentPosition, isLocating, locationError, isSupported };
}
