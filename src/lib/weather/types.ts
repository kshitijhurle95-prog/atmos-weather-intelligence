/**
 * Provider-specific types for OpenWeather API raw JSON responses.
 *
 * These types mirror the exact shape returned by the OpenWeather API.
 * They are consumed only by the provider layer and normalizer — UI code
 * should never import from this file.
 *
 * @see https://openweathermap.org/api
 */

// ---------------------------------------------------------------------------
// Shared sub-types used across endpoints
// ---------------------------------------------------------------------------

export interface OWMCoord {
  lon: number;
  lat: number;
}

export interface OWMWeatherCondition {
  id: number;
  main: string;
  description: string;
  icon: string;
}

export interface OWMMainData {
  temp: number;
  feels_like: number;
  temp_min: number;
  temp_max: number;
  pressure: number;
  humidity: number;
  sea_level?: number;
  grnd_level?: number;
}

export interface OWMWind {
  speed: number;
  deg: number;
  gust?: number;
}

export interface OWMClouds {
  all: number;
}

export interface OWMRain {
  '1h'?: number;
  '3h'?: number;
}

export interface OWMSnow {
  '1h'?: number;
  '3h'?: number;
}

export interface OWMSys {
  type?: number;
  id?: number;
  country?: string;
  sunrise?: number;
  sunset?: number;
}

// ---------------------------------------------------------------------------
// /data/2.5/weather — Current weather
// ---------------------------------------------------------------------------

export interface OpenWeatherCurrentResponse {
  coord: OWMCoord;
  weather: OWMWeatherCondition[];
  base: string;
  main: OWMMainData;
  visibility: number;
  wind: OWMWind;
  clouds: OWMClouds;
  rain?: OWMRain;
  snow?: OWMSnow;
  dt: number;
  sys: OWMSys;
  timezone: number;
  id: number;
  name: string;
  cod: number;
}

// ---------------------------------------------------------------------------
// /data/2.5/forecast — 5-day / 3-hour forecast
// ---------------------------------------------------------------------------

export interface OWMForecastItem {
  dt: number;
  main: OWMMainData;
  weather: OWMWeatherCondition[];
  clouds: OWMClouds;
  wind: OWMWind;
  visibility: number;
  pop: number;
  rain?: OWMRain;
  snow?: OWMSnow;
  sys: {
    pod: string; // 'd' = day, 'n' = night
  };
  dt_txt: string;
}

export interface OWMForecastCity {
  id: number;
  name: string;
  coord: OWMCoord;
  country: string;
  population: number;
  timezone: number;
  sunrise: number;
  sunset: number;
}

export interface OpenWeatherForecastResponse {
  cod: string;
  message: number;
  cnt: number;
  list: OWMForecastItem[];
  city: OWMForecastCity;
}

// ---------------------------------------------------------------------------
// /geo/1.0/direct — Geocoding
// ---------------------------------------------------------------------------

export interface OpenWeatherGeocodingItem {
  name: string;
  local_names?: Record<string, string>;
  lat: number;
  lon: number;
  country: string;
  state?: string;
}

export type OpenWeatherGeocodingResponse = OpenWeatherGeocodingItem[];

// ---------------------------------------------------------------------------
// /data/2.5/air_pollution — Air quality
// ---------------------------------------------------------------------------

export interface OWMAirQualityComponents {
  co: number;
  no: number;
  no2: number;
  o3: number;
  so2: number;
  pm2_5: number;
  pm10: number;
  nh3: number;
}

export interface OWMAirQualityItem {
  main: {
    aqi: number; // 1–5
  };
  components: OWMAirQualityComponents;
  dt: number;
}

export interface OpenWeatherAirQualityResponse {
  coord: OWMCoord;
  list: OWMAirQualityItem[];
}

// ---------------------------------------------------------------------------
// /data/3.0/onecall — One Call API (paid tier, kept for reference)
// ---------------------------------------------------------------------------

export interface OWMOneCallAlert {
  sender_name: string;
  event: string;
  start: number;
  end: number;
  description: string;
  tags: string[];
}

export interface OWMOneCallHourly {
  dt: number;
  temp: number;
  feels_like: number;
  pressure: number;
  humidity: number;
  dew_point: number;
  uvi: number;
  clouds: number;
  visibility: number;
  wind_speed: number;
  wind_deg: number;
  wind_gust?: number;
  weather: OWMWeatherCondition[];
  pop: number;
  rain?: OWMRain;
  snow?: OWMSnow;
}

export interface OWMOneCallDaily {
  dt: number;
  sunrise: number;
  sunset: number;
  moonrise: number;
  moonset: number;
  moon_phase: number;
  summary?: string;
  temp: {
    day: number;
    min: number;
    max: number;
    night: number;
    eve: number;
    morn: number;
  };
  feels_like: {
    day: number;
    night: number;
    eve: number;
    morn: number;
  };
  pressure: number;
  humidity: number;
  dew_point: number;
  wind_speed: number;
  wind_deg: number;
  wind_gust?: number;
  weather: OWMWeatherCondition[];
  clouds: number;
  pop: number;
  rain?: number;
  snow?: number;
  uvi: number;
}

export interface OpenWeatherOneCallResponse {
  lat: number;
  lon: number;
  timezone: string;
  timezone_offset: number;
  current: OWMOneCallHourly & { sunrise: number; sunset: number; uvi: number };
  minutely?: Array<{ dt: number; precipitation: number }>;
  hourly: OWMOneCallHourly[];
  daily: OWMOneCallDaily[];
  alerts?: OWMOneCallAlert[];
}
