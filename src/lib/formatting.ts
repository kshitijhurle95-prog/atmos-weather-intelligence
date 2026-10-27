/**
 * Unit conversion and formatting utilities for the Atmos platform.
 *
 * All base values stored in the application use **metric** units
 * (Celsius, km/h, hPa, mm, km). These helpers convert to / from
 * imperial when needed and format values for display.
 */

import type {
  WeatherData,
  WeatherUnits,
  UnitSystem,
} from '@/types/weather';

// ---------------------------------------------------------------------------
// Temperature
// ---------------------------------------------------------------------------

export function celsiusToFahrenheit(c: number): number {
  return (c * 9) / 5 + 32;
}

export function fahrenheitToCelsius(f: number): number {
  return ((f - 32) * 5) / 9;
}

// ---------------------------------------------------------------------------
// Wind speed
// ---------------------------------------------------------------------------

export function kmhToMph(kmh: number): number {
  return kmh / 1.60934;
}

export function mphToKmh(mph: number): number {
  return mph * 1.60934;
}

export function msToKmh(ms: number): number {
  return ms * 3.6;
}

export function kmhToMs(kmh: number): number {
  return kmh / 3.6;
}

// ---------------------------------------------------------------------------
// Precipitation
// ---------------------------------------------------------------------------

export function mmToInches(mm: number): number {
  return mm / 25.4;
}

export function inchesToMm(inches: number): number {
  return inches * 25.4;
}

// ---------------------------------------------------------------------------
// Pressure
// ---------------------------------------------------------------------------

export function hPaToInHg(hPa: number): number {
  return hPa * 0.02953;
}

export function inHgToHPa(inHg: number): number {
  return inHg / 0.02953;
}

// ---------------------------------------------------------------------------
// Visibility / distance
// ---------------------------------------------------------------------------

export function kmToMiles(km: number): number {
  return km / 1.60934;
}

export function milesToKm(mi: number): number {
  return mi * 1.60934;
}

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------

/**
 * Format a temperature value with the degree symbol and unit.
 */
export function formatTemperature(
  temp: number,
  unit: WeatherUnits['temperature'] = 'celsius',
): string {
  const value = unit === 'fahrenheit' ? celsiusToFahrenheit(temp) : temp;
  const symbol = unit === 'fahrenheit' ? 'F' : 'C';
  return `${Math.round(value)}°${symbol}`;
}

/**
 * Format a wind-speed value with the appropriate unit label.
 */
export function formatWindSpeed(
  speed: number,
  unit: WeatherUnits['windSpeed'] = 'km/h',
): string {
  let value: number;
  switch (unit) {
    case 'mph':
      value = kmhToMph(speed);
      break;
    case 'm/s':
      value = kmhToMs(speed);
      break;
    default:
      value = speed;
  }
  return `${Math.round(value * 10) / 10} ${unit}`;
}

/**
 * Format an atmospheric pressure value.
 */
export function formatPressure(
  pressure: number,
  unit: WeatherUnits['pressure'] = 'hPa',
): string {
  if (unit === 'inHg') {
    return `${(hPaToInHg(pressure)).toFixed(2)} inHg`;
  }
  return `${Math.round(pressure)} hPa`;
}

/**
 * Format a visibility distance.
 */
export function formatVisibility(
  vis: number,
  unit: WeatherUnits['visibility'] = 'km',
): string {
  if (unit === 'mi') {
    return `${(kmToMiles(vis)).toFixed(1)} mi`;
  }
  return `${vis.toFixed(1)} km`;
}

/**
 * Format a precipitation amount.
 */
export function formatPrecipitation(
  precip: number,
  unit: WeatherUnits['precipitation'] = 'mm',
): string {
  if (unit === 'in') {
    return `${(mmToInches(precip)).toFixed(2)} in`;
  }
  return `${precip.toFixed(1)} mm`;
}

// ---------------------------------------------------------------------------
// Date / time formatting
// ---------------------------------------------------------------------------

/**
 * Format a Date (or ISO string) as a short time string (e.g. "3:45 PM").
 */
export function formatTime(
  date: Date | string,
  timezone?: string,
  locale = 'en-US',
): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const options: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    ...(timezone ? { timeZone: timezone } : {}),
  };
  return d.toLocaleTimeString(locale, options);
}

/**
 * Format a Date (or ISO string) as a short date string (e.g. "Oct 25").
 */
export function formatDate(
  date: Date | string,
  timezone?: string,
  locale = 'en-US',
): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    ...(timezone ? { timeZone: timezone } : {}),
  };
  return d.toLocaleDateString(locale, options);
}

/**
 * Format a Date (or ISO string) as a full date-time string.
 */
export function formatFullDateTime(
  date: Date | string,
  timezone?: string,
  locale = 'en-US',
): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    ...(timezone ? { timeZone: timezone } : {}),
  };
  return d.toLocaleString(locale, options);
}

// ---------------------------------------------------------------------------
// Wind direction helpers
// ---------------------------------------------------------------------------

const COMPASS_POINTS = [
  'N', 'NNE', 'NE', 'ENE',
  'E', 'ESE', 'SE', 'SSE',
  'S', 'SSW', 'SW', 'WSW',
  'W', 'WNW', 'NW', 'NNW',
] as const;

const COMPASS_FULL_NAMES: Record<string, string> = {
  N: 'North',
  NNE: 'North-Northeast',
  NE: 'Northeast',
  ENE: 'East-Northeast',
  E: 'East',
  ESE: 'East-Southeast',
  SE: 'Southeast',
  SSE: 'South-Southeast',
  S: 'South',
  SSW: 'South-Southwest',
  SW: 'Southwest',
  WSW: 'West-Southwest',
  W: 'West',
  WNW: 'West-Northwest',
  NW: 'Northwest',
  NNW: 'North-Northwest',
};

/**
 * Convert a degree value (0–360) to a short compass direction (e.g. "NE").
 */
export function getWindDirection(degrees: number): string {
  const index = Math.round(((degrees % 360) + 360) % 360 / 22.5) % 16;
  return COMPASS_POINTS[index];
}

/**
 * Convert a degree value (0–360) to a full compass name (e.g. "Northeast").
 */
export function degToCompass(deg: number): string {
  const short = getWindDirection(deg);
  return COMPASS_FULL_NAMES[short] ?? short;
}

// ---------------------------------------------------------------------------
// Unit-system helpers
// ---------------------------------------------------------------------------

/**
 * Build a `WeatherUnits` config from a high-level `UnitSystem` selector.
 */
export function unitsForSystem(system: UnitSystem): WeatherUnits {
  if (system === 'imperial') {
    return {
      temperature: 'fahrenheit',
      windSpeed: 'mph',
      pressure: 'inHg',
      precipitation: 'in',
      visibility: 'mi',
    };
  }
  return {
    temperature: 'celsius',
    windSpeed: 'km/h',
    pressure: 'hPa',
    precipitation: 'mm',
    visibility: 'km',
  };
}

// ---------------------------------------------------------------------------
// Bulk conversion
// ---------------------------------------------------------------------------

/**
 * Return a deep-ish copy of `WeatherData` with all numeric values
 * converted to the target unit system.
 *
 * Note: temperatures are stored internally as Celsius; wind speeds as
 * km/h; pressure as hPa; precipitation as mm; visibility as km.
 */
export function convertWeatherData(
  data: WeatherData,
  targetUnit: UnitSystem,
): WeatherData {
  if (targetUnit === 'metric') {
    // Already metric — just update the units descriptor.
    return { ...data, units: unitsForSystem('metric') };
  }

  const convertTemp = (c: number) => Math.round(celsiusToFahrenheit(c) * 10) / 10;
  const convertWind = (kmh: number) => Math.round(kmhToMph(kmh) * 10) / 10;
  const convertPres = (hPa: number) => Math.round(hPaToInHg(hPa) * 100) / 100;
  const convertPrec = (mm: number) => Math.round(mmToInches(mm) * 100) / 100;
  const convertVis = (km: number) => Math.round(kmToMiles(km) * 10) / 10;

  return {
    ...data,
    units: unitsForSystem('imperial'),
    current: {
      ...data.current,
      temperature: convertTemp(data.current.temperature),
      feelsLike: convertTemp(data.current.feelsLike),
      windSpeed: convertWind(data.current.windSpeed),
      pressure: convertPres(data.current.pressure),
      precipitation: convertPrec(data.current.precipitation),
      visibility: convertVis(data.current.visibility),
    },
    hourly: data.hourly.map((h) => ({
      ...h,
      temperature: convertTemp(h.temperature),
      feelsLike: convertTemp(h.feelsLike),
      windSpeed: convertWind(h.windSpeed),
      precipitation: convertPrec(h.precipitation),
    })),
    daily: data.daily.map((d) => ({
      ...d,
      temperatureHigh: convertTemp(d.temperatureHigh),
      temperatureLow: convertTemp(d.temperatureLow),
      windSpeed: convertWind(d.windSpeed),
      precipitation: convertPrec(d.precipitation),
    })),
  };
}
