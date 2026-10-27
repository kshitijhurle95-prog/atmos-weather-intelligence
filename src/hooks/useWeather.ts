'use client';

import { useState, useCallback, useRef } from 'react';
import type {
  WeatherData,
  AirQualityData,
  ApiResponse,
} from '@/types/weather';

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
  fetchWeather: (lat: number, lon: number) => Promise<void>;
  /** Fetch air-quality data for a given latitude / longitude. */
  fetchAirQuality: (lat: number, lon: number) => Promise<void>;
  /** Re-fetch weather for the last-used coordinates. No-op if never fetched. */
  refreshWeather: () => Promise<void>;
  /** The last set of coordinates passed to `fetchWeather`. */
  lastLocation: { lat: number; lon: number } | null;
}

/**
 * Primary hook for fetching and caching weather data.
 *
 * Calls our own Next.js API routes (`/api/weather`, `/api/forecast`,
 * `/api/air-quality`) – **never** the OpenWeather API directly.
 *
 * Unit conversion is intentionally **not** performed here; that
 * responsibility belongs to display / formatting utilities.
 */
export function useWeather(): UseWeatherReturn {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [airQuality, setAirQuality] = useState<AirQualityData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lastLocationRef = useRef<{ lat: number; lon: number } | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // ---------------------------------------------------------------------------
  // fetchWeather – current + forecast in parallel
  // ---------------------------------------------------------------------------
  const fetchWeather = useCallback(async (lat: number, lon: number): Promise<void> => {
    // Cancel any previous in-flight request
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);
    setError(null);

    try {
      const params = `lat=${lat}&lon=${lon}`;
      const signal = controller.signal;

      const [weatherRes, forecastRes] = await Promise.all([
        fetch(`/api/weather?${params}`, { signal }),
        fetch(`/api/forecast?${params}`, { signal }),
      ]);

      if (!weatherRes.ok) {
        throw new Error(`Weather request failed (${weatherRes.status})`);
      }
      if (!forecastRes.ok) {
        throw new Error(`Forecast request failed (${forecastRes.status})`);
      }

      const weatherJson = (await weatherRes.json()) as ApiResponse<WeatherData>;
      const forecastJson = (await forecastRes.json()) as ApiResponse<{
        hourly: WeatherData['hourly'];
        daily: WeatherData['daily'];
      }>;

      if (!weatherJson.success || !weatherJson.data) {
        throw new Error(weatherJson.error?.message ?? 'Failed to fetch weather data.');
      }

      // Merge forecast into weather payload
      const merged: WeatherData = {
        ...weatherJson.data,
        hourly: forecastJson.data?.hourly ?? weatherJson.data.hourly ?? [],
        daily: forecastJson.data?.daily ?? weatherJson.data.daily ?? [],
      };

      setWeatherData(merged);
      lastLocationRef.current = { lat, lon };
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ---------------------------------------------------------------------------
  // fetchAirQuality
  // ---------------------------------------------------------------------------
  const fetchAirQuality = useCallback(async (lat: number, lon: number): Promise<void> => {
    try {
      const res = await fetch(`/api/air-quality?lat=${lat}&lon=${lon}`);

      if (!res.ok) {
        throw new Error(`Air quality request failed (${res.status})`);
      }

      const json = (await res.json()) as ApiResponse<AirQualityData>;

      if (json.success && json.data) {
        setAirQuality(json.data);
      }
    } catch {
      // Air quality is supplementary – don't surface errors to the user
      console.warn('[useWeather] Air quality fetch failed – ignoring.');
    }
  }, []);

  // ---------------------------------------------------------------------------
  // refreshWeather – re-fetch at last known coordinates
  // ---------------------------------------------------------------------------
  const refreshWeather = useCallback(async (): Promise<void> => {
    const loc = lastLocationRef.current;
    if (!loc) return;
    await fetchWeather(loc.lat, loc.lon);
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
