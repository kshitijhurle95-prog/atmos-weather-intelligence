'use client';

import { useState, useCallback, useRef } from 'react';
import type {
  WeatherData,
  AirQualityData,
} from '@/types/weather';
import {
  fetchLiveWeather,
  fetchLiveAirQuality,
} from '@/lib/weather/client-service';

/**
 * Return type for the main weather-data hook.
 */
export interface UseWeatherReturn {
  /** Combined current + forecast weather payload, or `null` before first fetch. */
  weatherData: WeatherData | null;
  /** Air quality information, fetched separately. */
  airQuality: AirQualityData | null;
  /** `true` while any weather request is in-flight. */
  isLoading: boolean;
  /** Error message from the last failed request, or `null`. */
  error: string | null;
  /** Fetch weather data for a given latitude / longitude. */
  fetchWeather: (lat: number, lon: number, name?: string, country?: string) => Promise<void>;
  /** Fetch air-quality data for a given latitude / longitude. */
  fetchAirQuality: (lat: number, lon: number) => Promise<void>;
  /** Re-fetch weather for the last-used coordinates. No-op if never fetched. */
  refreshWeather: () => Promise<void>;
  /** The last set of coordinates passed to `fetchWeather`. */
  lastLocation: { lat: number; lon: number; name?: string; country?: string } | null;
}

/**
 * Primary hook for fetching and caching weather data.
 * Directly integrates with OpenWeather API while ensuring graceful fallback
 * during API key propagation or static hosting on GitHub Pages.
 */
export function useWeather(): UseWeatherReturn {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [airQuality, setAirQuality] = useState<AirQualityData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lastLocationRef = useRef<{ lat: number; lon: number; name?: string; country?: string } | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // ---------------------------------------------------------------------------
  // fetchWeather – current + forecast in parallel
  // ---------------------------------------------------------------------------
  const fetchWeather = useCallback(
    async (lat: number, lon: number, name?: string, country?: string): Promise<void> => {
      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      setIsLoading(true);
      setError(null);

      try {
        const data = await fetchLiveWeather(lat, lon, name, country);
        setWeatherData(data);
        lastLocationRef.current = { lat, lon, name, country };
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // ---------------------------------------------------------------------------
  // fetchAirQuality
  // ---------------------------------------------------------------------------
  const fetchAirQuality = useCallback(async (lat: number, lon: number): Promise<void> => {
    try {
      const data = await fetchLiveAirQuality(lat, lon);
      setAirQuality(data);
    } catch {
      console.warn('[useWeather] Air quality fetch fallback active.');
    }
  }, []);

  // ---------------------------------------------------------------------------
  // refreshWeather – re-fetch at last known coordinates
  // ---------------------------------------------------------------------------
  const refreshWeather = useCallback(async (): Promise<void> => {
    const loc = lastLocationRef.current;
    if (!loc) return;
    await fetchWeather(loc.lat, loc.lon, loc.name, loc.country);
    await fetchAirQuality(loc.lat, loc.lon);
  }, [fetchWeather, fetchAirQuality]);

  return {
    weatherData,
    airQuality,
    isLoading,
    error,
    fetchWeather,
    fetchAirQuality,
    refreshWeather,
    lastLocation: lastLocationRef.current,
  };
}
