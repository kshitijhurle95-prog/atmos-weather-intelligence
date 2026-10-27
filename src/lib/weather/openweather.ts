/**
 * OpenWeather API integration for the Atmos platform.
 *
 * This module is **server-side only** — it reads secrets from
 * `process.env` and makes outbound HTTP requests. Never import it in
 * client components.
 */

import type {
  GeocodingResult,
  AirQualityData,
} from '@/types/weather';

import type {
  OpenWeatherCurrentResponse,
  OpenWeatherForecastResponse,
  OpenWeatherGeocodingItem,
  OpenWeatherAirQualityResponse,
} from './types';

import {
  normalizeCurrentWeather,
  normalizeForecast,
  normalizeGeocodingResults,
  normalizeAirQuality,
  type NormalizedCurrentWeather,
  type NormalizedForecast,
} from './normalize';

import {
  getWeatherCache,
  makeCacheKey,
  makeQueryCacheKey,
  DEFAULT_TTLS,
} from './cache';

import type { WeatherProvider } from './provider';

// ---------------------------------------------------------------------------
// Error types
// ---------------------------------------------------------------------------

export class WeatherApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly code: string,
    public readonly retryable: boolean,
  ) {
    super(message);
    this.name = 'WeatherApiError';
  }
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const BASE_URL = 'https://api.openweathermap.org';
const REQUEST_TIMEOUT_MS = 10_000;

// ---------------------------------------------------------------------------
// Provider implementation
// ---------------------------------------------------------------------------

export class OpenWeatherProvider implements WeatherProvider {
  private readonly apiKey: string;
  private readonly cache = getWeatherCache();

  constructor(apiKey?: string) {
    const key = apiKey ?? process.env.OPENWEATHER_API_KEY;
    if (!key) {
      throw new WeatherApiError(
        'OPENWEATHER_API_KEY environment variable is not set.',
        0,
        'MISSING_API_KEY',
        false,
      );
    }
    this.apiKey = key;
  }

  // -----------------------------------------------------------------------
  // Public methods
  // -----------------------------------------------------------------------

  async getCurrentWeather(
    lat: number,
    lon: number,
  ): Promise<NormalizedCurrentWeather> {
    const cacheKey = makeCacheKey('current', lat, lon);
    const cached = this.cache.get<NormalizedCurrentWeather>(cacheKey);
    if (cached) return cached;

    // Fetch current weather and geocoding in parallel for richer location data.
    const [rawCurrent, geoResults] = await Promise.all([
      this.fetch<OpenWeatherCurrentResponse>('/data/2.5/weather', { lat, lon }),
      this.fetchGeo(lat, lon),
    ]);

    const geoData = geoResults[0] as OpenWeatherGeocodingItem | undefined;
    const result = normalizeCurrentWeather(rawCurrent, geoData);

    this.cache.set(cacheKey, result, DEFAULT_TTLS.currentWeather);
    return result;
  }

  async getForecast(
    lat: number,
    lon: number,
  ): Promise<NormalizedForecast> {
    const cacheKey = makeCacheKey('forecast', lat, lon);
    const cached = this.cache.get<NormalizedForecast>(cacheKey);
    if (cached) return cached;

    const raw = await this.fetch<OpenWeatherForecastResponse>('/data/2.5/forecast', { lat, lon });
    const result = normalizeForecast(raw);

    this.cache.set(cacheKey, result, DEFAULT_TTLS.forecast);
    return result;
  }

  async geocodeSearch(query: string, limit = 5): Promise<GeocodingResult[]> {
    const cacheKey = makeQueryCacheKey('geo', query);
    const cached = this.cache.get<GeocodingResult[]>(cacheKey);
    if (cached) return cached;

    const raw = await this.fetch<OpenWeatherGeocodingItem[]>('/geo/1.0/direct', {
      q: query,
      limit,
    });

    const results = normalizeGeocodingResults(raw);
    this.cache.set(cacheKey, results, DEFAULT_TTLS.geocoding);
    return results;
  }

  async reverseGeocode(lat: number, lon: number): Promise<GeocodingResult[]> {
    const cacheKey = makeCacheKey('reverse-geo', lat, lon);
    const cached = this.cache.get<GeocodingResult[]>(cacheKey);
    if (cached) return cached;

    const raw = await this.fetch<OpenWeatherGeocodingItem[]>('/geo/1.0/reverse', {
      lat,
      lon,
      limit: 5,
    });

    const results = normalizeGeocodingResults(raw);
    this.cache.set(cacheKey, results, DEFAULT_TTLS.geocoding);
    return results;
  }

  async getAirQuality(lat: number, lon: number): Promise<AirQualityData> {
    const cacheKey = makeCacheKey('air', lat, lon);
    const cached = this.cache.get<AirQualityData>(cacheKey);
    if (cached) return cached;

    const raw = await this.fetch<OpenWeatherAirQualityResponse>(
      '/data/2.5/air_pollution',
      { lat, lon },
    );

    const result = normalizeAirQuality(raw);
    this.cache.set(cacheKey, result, DEFAULT_TTLS.airQuality);
    return result;
  }

  // -----------------------------------------------------------------------
  // Internal helpers
  // -----------------------------------------------------------------------

  private async fetch<T>(
    path: string,
    params: Record<string, string | number>,
  ): Promise<T> {
    const url = new URL(path, BASE_URL);

    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, String(value));
    }

    if (!url.searchParams.has('units')) {
      url.searchParams.set('units', 'metric');
    }

    url.searchParams.set('appid', this.apiKey);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await globalThis.fetch(url.toString(), {
        signal: controller.signal,
        headers: {
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        const body = await response.text().catch(() => '');
        throw this.createApiError(response.status, body);
      }

      return (await response.json()) as T;
    } catch (error: unknown) {
      if (error instanceof WeatherApiError) throw error;

      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new WeatherApiError(
          'Request timed out after 10 seconds.',
          0,
          'TIMEOUT',
          true,
        );
      }

      const message =
        error instanceof Error ? error.message : 'Unknown network error';
      throw new WeatherApiError(message, 0, 'NETWORK_ERROR', true);
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private async fetchGeo(
    lat: number,
    lon: number,
  ): Promise<OpenWeatherGeocodingItem[]> {
    try {
      return await this.fetch<OpenWeatherGeocodingItem[]>(
        '/geo/1.0/reverse',
        { lat, lon, limit: 1 },
      );
    } catch {
      return [];
    }
  }

  private createApiError(status: number, body: string): WeatherApiError {
    let message = `OpenWeather API returned status ${status}`;
    let code = 'API_ERROR';
    let retryable = false;

    try {
      const parsed = JSON.parse(body) as { message?: string };
      if (parsed.message) {
        message = parsed.message;
      }
    } catch {
      // Ignore
    }

    switch (status) {
      case 401:
        code = 'UNAUTHORIZED';
        message = 'Invalid API key. Please check your OPENWEATHER_API_KEY.';
        break;
      case 404:
        code = 'NOT_FOUND';
        message = 'The requested resource was not found.';
        break;
      case 429:
        code = 'RATE_LIMITED';
        message = 'API rate limit exceeded. Please try again later.';
        retryable = true;
        break;
      default:
        if (status >= 500) {
          code = 'SERVER_ERROR';
          retryable = true;
        }
    }

    return new WeatherApiError(message, status, code, retryable);
  }
}
