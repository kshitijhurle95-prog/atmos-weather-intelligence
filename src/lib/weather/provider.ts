/**
 * OpenWeather API provider — handles all external API calls.
 *
 * Every function fetches raw data from the OpenWeather API and returns
 * the typed raw response. Normalization into app-domain types is handled
 * by the normalize module.
 */

import type {
  OpenWeatherCurrentResponse,
  OpenWeatherForecastResponse,
  OpenWeatherGeocodingItem,
  OpenWeatherAirQualityResponse,
} from '@/lib/weather/types';
import type {
  NormalizedCurrentWeather,
  NormalizedForecast,
} from '@/lib/weather/normalize';
import type {
  GeocodingResult,
  AirQualityData,
} from '@/types/weather';

export interface WeatherProvider {
  getCurrentWeather(lat: number, lon: number): Promise<NormalizedCurrentWeather>;
  getForecast(lat: number, lon: number): Promise<NormalizedForecast>;
  geocodeSearch(query: string, limit?: number): Promise<GeocodingResult[]>;
  reverseGeocode(lat: number, lon: number): Promise<GeocodingResult[]>;
  getAirQuality(lat: number, lon: number): Promise<AirQualityData>;
}

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const OW_BASE = 'https://api.openweathermap.org';
const GEO_BASE = 'https://api.openweathermap.org/geo/1.0';

/** Default fetch timeout (ms). */
const FETCH_TIMEOUT_MS = 10_000;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Return the OpenWeather API key from the environment.
 * Throws if not configured.
 */
export function getApiKey(): string {
  const key = process.env.OPENWEATHER_API_KEY;
  if (!key) {
    throw new ApiKeyMissingError();
  }
  return key;
}

/** Sentinel error for missing API key. */
export class ApiKeyMissingError extends Error {
  constructor() {
    super('OPENWEATHER_API_KEY environment variable is not set.');
    this.name = 'ApiKeyMissingError';
  }
}

/** Sentinel error for upstream provider failures. */
export class ProviderError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = 'ProviderError';
    this.statusCode = statusCode;
  }
}

/** Sentinel error for request timeouts. */
export class TimeoutError extends Error {
  constructor() {
    super('Request to weather provider timed out.');
    this.name = 'TimeoutError';
  }
}

/**
 * Fetch wrapper with timeout and error handling.
 * Never leaks the API key in error messages.
 */
async function fetchWithTimeout(
  url: string,
  timeoutMs = FETCH_TIMEOUT_MS,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, { signal: controller.signal });
    return res;
  } catch (err: unknown) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new TimeoutError();
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Generic JSON fetcher that validates the upstream response.
 */
async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetchWithTimeout(url);

  if (!res.ok) {
    // Avoid leaking the full URL (which includes the API key)
    const body = await res.text().catch(() => '');
    throw new ProviderError(
      `OpenWeather API responded with status ${res.status}: ${body.slice(0, 200)}`,
      res.status,
    );
  }

  return (await res.json()) as T;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Fetch current weather for the given coordinates.
 * Uses metric units; conversion is done in the normalize step.
 */
export async function fetchCurrentWeather(
  lat: number,
  lon: number,
): Promise<OpenWeatherCurrentResponse> {
  const apiKey = getApiKey();
  const url = `${OW_BASE}/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
  return fetchJson<OpenWeatherCurrentResponse>(url);
}

/**
 * Fetch the 5-day / 3-hour forecast for the given coordinates.
 */
export async function fetchForecast(
  lat: number,
  lon: number,
): Promise<OpenWeatherForecastResponse> {
  const apiKey = getApiKey();
  const url = `${OW_BASE}/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
  return fetchJson<OpenWeatherForecastResponse>(url);
}

/**
 * Forward-geocode a location query string.
 * Returns up to `limit` results (default 5).
 */
export async function fetchGeocoding(
  query: string,
  limit = 5,
): Promise<OpenWeatherGeocodingItem[]> {
  const apiKey = getApiKey();
  const encoded = encodeURIComponent(query);
  const url = `${GEO_BASE}/direct?q=${encoded}&limit=${limit}&appid=${apiKey}`;
  return fetchJson<OpenWeatherGeocodingItem[]>(url);
}

/**
 * Reverse-geocode coordinates to a location name.
 * Returns up to `limit` results (default 1).
 */
export async function fetchReverseGeocode(
  lat: number,
  lon: number,
  limit = 1,
): Promise<OpenWeatherGeocodingItem[]> {
  const apiKey = getApiKey();
  const url = `${GEO_BASE}/reverse?lat=${lat}&lon=${lon}&limit=${limit}&appid=${apiKey}`;
  return fetchJson<OpenWeatherGeocodingItem[]>(url);
}

/**
 * Fetch air pollution / air quality data for the given coordinates.
 */
export async function fetchAirQuality(
  lat: number,
  lon: number,
): Promise<OpenWeatherAirQualityResponse> {
  const apiKey = getApiKey();
  const url = `${OW_BASE}/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`;
  return fetchJson<OpenWeatherAirQualityResponse>(url);
}
