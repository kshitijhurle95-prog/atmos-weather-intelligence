'use client';

import { useState, useCallback, useRef } from 'react';
import type { GeocodingResult } from '@/types/weather';
import { searchCities } from '@/lib/weather/client-service';

/**
 * Return type for the geocoding search hook.
 */
export interface UseGeocodingReturn {
  /** Search results from the last successful query. */
  results: GeocodingResult[];
  /** `true` while a search request is in-flight. */
  isSearching: boolean;
  /** Error message from the last failed search, or `null`. */
  searchError: string | null;
  /** Trigger a debounced location search. */
  searchLocations: (query: string) => Promise<void>;
  /** Clear the current results list. */
  clearResults: () => void;
}

const DEBOUNCE_MS = 250;

/**
 * Hook for searching locations with OpenWeather, OpenStreetMap, and curated Indian/global city indices.
 * Fully functional in static deployments (GitHub Pages).
 */
export function useGeocoding(): UseGeocodingReturn {
  const [results, setResults] = useState<GeocodingResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearResults = useCallback(() => {
    setResults([]);
    setSearchError(null);
  }, []);

  const searchLocations = useCallback(
    async (query: string): Promise<void> => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }

      const trimmed = query.trim();
      if (!trimmed) {
        clearResults();
        setIsSearching(false);
        return;
      }

      return new Promise<void>((resolve) => {
        debounceTimerRef.current = setTimeout(async () => {
          setIsSearching(true);
          setSearchError(null);

          try {
            const matches = await searchCities(trimmed);
            setResults(matches);
            setSearchError(matches.length === 0 ? 'No matching locations found.' : null);
          } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Search encountered a temporary issue.';
            setSearchError(message);
            setResults([]);
          } finally {
            setIsSearching(false);
            resolve();
          }
        }, DEBOUNCE_MS);
      });
    },
    [clearResults]
  );

  return { results, isSearching, searchError, searchLocations, clearResults };
}
