'use client';

import { useState, useCallback, useRef } from 'react';
import type { GeocodingResult, ApiResponse } from '@/types/weather';

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

const DEBOUNCE_MS = 300;

/**
 * Hook for searching locations via the `/api/geocoding` route.
 *
 * Requests are debounced by 300 ms so that rapid keystrokes do not flood the
 * backend with requests. An empty or whitespace-only query automatically
 * clears results without hitting the network.
 */
export function useGeocoding(): UseGeocodingReturn {
  const [results, setResults] = useState<GeocodingResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Debounce timer ref – persists across renders without causing re-renders.
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Abort controller ref – lets us cancel in-flight requests.
  const abortControllerRef = useRef<AbortController | null>(null);

  const clearResults = useCallback(() => {
    setResults([]);
    setSearchError(null);
  }, []);

  const searchLocations = useCallback(
    async (query: string): Promise<void> => {
      // Cancel any pending debounce timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }

      // Empty query → clear immediately
      const trimmed = query.trim();
      if (!trimmed) {
        clearResults();
        setIsSearching(false);
        return;
      }

      // Set up a new debounced request
      return new Promise<void>((resolve) => {
        debounceTimerRef.current = setTimeout(async () => {
          // Abort any previous in-flight request
          abortControllerRef.current?.abort();
          const controller = new AbortController();
          abortControllerRef.current = controller;

          setIsSearching(true);
          setSearchError(null);

          try {
            const url = `/api/geocoding?q=${encodeURIComponent(trimmed)}`;
            const res = await fetch(url, { signal: controller.signal });

            if (!res.ok) {
              throw new Error(`Search failed (${res.status})`);
            }

            const json = (await res.json()) as ApiResponse<GeocodingResult[]>;

            if (!json.success || !json.data) {
              throw new Error(json.error?.message ?? 'No results found.');
            }

            setResults(json.data);
            setSearchError(null);
          } catch (err: unknown) {
            // Ignore aborted requests
            if (err instanceof DOMException && err.name === 'AbortError') {
              resolve();
              return;
            }
            const message = err instanceof Error ? err.message : 'Search failed. Please try again.';
            setSearchError(message);
            setResults([]);
          } finally {
            setIsSearching(false);
          }

          resolve();
        }, DEBOUNCE_MS);
      });
    },
    [clearResults],
  );

  return { results, isSearching, searchError, searchLocations, clearResults };
}
