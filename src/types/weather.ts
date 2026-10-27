/**
 * Core weather data types for the Atmos Weather Intelligence Platform.
 *
 * These are the normalized, provider-agnostic types used throughout the
 * application. Raw API responses are transformed into these shapes by
 * the normalizer layer before consumption by UI components.
 */

// ---------------------------------------------------------------------------
// Unit system
// ---------------------------------------------------------------------------

/** High-level unit system selector. */
export type UnitSystem = 'metric' | 'imperial';

/** Granular unit configuration derived from a UnitSystem. */
export interface WeatherUnits {
  temperature: 'celsius' | 'fahrenheit';
  windSpeed: 'km/h' | 'mph' | 'm/s';
  pressure: 'hPa' | 'inHg';
  precipitation: 'mm' | 'in';
  visibility: 'km' | 'mi';
}

// ---------------------------------------------------------------------------
// Location
// ---------------------------------------------------------------------------

export interface WeatherLocation {
  name: string;
  region: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

// ---------------------------------------------------------------------------
// Current conditions
// ---------------------------------------------------------------------------

export interface CurrentWeather {
  temperature: number;
  feelsLike: number;
  condition: string;
  conditionCode: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  pressure: number;
  visibility: number;
  cloudCover: number;
  uvIndex: number;
  icon: string;
  precipitation: number;
}

// ---------------------------------------------------------------------------
// Forecasts
// ---------------------------------------------------------------------------

export interface HourlyForecast {
  time: string;
  temperature: number;
  feelsLike: number;
  condition: string;
  conditionCode: number;
  icon: string;
  precipitation: number;
  precipProbability: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
}

export interface DailyForecast {
  date: string;
  sunrise: string;
  sunset: string;
  temperatureHigh: number;
  temperatureLow: number;
  condition: string;
  conditionCode: number;
  icon: string;
  precipitation: number;
  precipProbability: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  uvIndex: number;
  summary: string;
}

// ---------------------------------------------------------------------------
// Alerts
// ---------------------------------------------------------------------------

export type AlertSeverity = 'minor' | 'moderate' | 'severe' | 'extreme';
export type AlertUrgency = 'past' | 'future' | 'expected' | 'immediate' | 'unknown';

export interface WeatherAlert {
  id: string;
  event: string;
  headline: string;
  description: string;
  severity: AlertSeverity;
  urgency: AlertUrgency;
  sender: string;
  start: string;
  end: string;
  areas: string[];
}

// ---------------------------------------------------------------------------
// Air quality
// ---------------------------------------------------------------------------

export interface AirQualityComponents {
  co: number;
  no: number;
  no2: number;
  o3: number;
  so2: number;
  pm2_5: number;
  pm10: number;
  nh3: number;
}

export type AirQualityCategory = 'Good' | 'Fair' | 'Moderate' | 'Poor' | 'Very Poor';

export interface AirQualityData {
  aqi: number;
  category: AirQualityCategory;
  pm25: number;
  pm10: number;
  o3: number;
  no2: number;
  so2: number;
  co: number;
  components?: AirQualityComponents;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Composite weather payload
// ---------------------------------------------------------------------------

export interface WeatherData {
  location: WeatherLocation;
  current: CurrentWeather;
  hourly: HourlyForecast[];
  daily: DailyForecast[];
  alerts: WeatherAlert[];
  airQuality?: AirQualityData;
  units: WeatherUnits;
  updatedAt: string;
  source: string;
}

// ---------------------------------------------------------------------------
// Geocoding
// ---------------------------------------------------------------------------

export interface GeocodingResult {
  name: string;
  region: string;
  country: string;
  lat: number;
  lon: number;
  localNames?: Record<string, string>;
}

// ---------------------------------------------------------------------------
// API response wrapper
// ---------------------------------------------------------------------------

export interface ApiError {
  code: string;
  message: string;
  retryable: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}
