/**
 * Normalize raw OpenWeather API responses into app-domain types.
 *
 * Every function takes a raw provider response and returns the
 * corresponding normalized type from @/types/weather.
 */

import type {
  CurrentWeather,
  HourlyForecast,
  DailyForecast,
  AirQualityData,
  AirQualityCategory,
  GeocodingResult,
  WeatherLocation,
  WeatherUnits,
  WeatherAlert,
} from '@/types/weather';

import type {
  OpenWeatherCurrentResponse,
  OpenWeatherForecastResponse,
  OpenWeatherGeocodingItem,
  OpenWeatherAirQualityResponse,
  OWMForecastItem,
} from '@/lib/weather/types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Convert Celsius to Fahrenheit, rounded to 1 decimal. */
function cToF(c: number): number {
  return Math.round((c * 9) / 5 + 32);
}

/** Convert m/s to km/h. */
function msToKmh(ms: number): number {
  return Math.round(ms * 3.6 * 10) / 10;
}

/** Format a UNIX timestamp to an ISO date string for a given tz offset (seconds). */
function unixToISODate(unix: number, tzOffset: number): string {
  const d = new Date((unix + tzOffset) * 1000);
  return d.toISOString().slice(0, 10);
}

/** Format a UNIX timestamp to an ISO datetime string. */
function unixToISO(unix: number): string {
  return new Date(unix * 1000).toISOString();
}

/** Pick the "dominant" weather condition from a set of 3-hour blocks. */
function dominantCondition(
  items: OWMForecastItem[],
): { id: number; main: string; description: string; icon: string } {
  // Frequency count by weather.main
  const freq = new Map<string, { count: number; item: OWMForecastItem }>();
  for (const item of items) {
    const w = item.weather[0];
    if (!w) continue;
    const existing = freq.get(w.main);
    if (existing) {
      existing.count++;
    } else {
      freq.set(w.main, { count: 1, item });
    }
  }

  let best: OWMForecastItem = items[0];
  let bestCount = 0;
  for (const [, v] of freq) {
    if (v.count > bestCount) {
      bestCount = v.count;
      best = v.item;
    }
  }

  const w = best.weather[0];
  return {
    id: w.id,
    main: w.main,
    description: w.description,
    icon: w.icon,
  };
}

// ---------------------------------------------------------------------------
// Current Weather
// ---------------------------------------------------------------------------

export interface NormalizedCurrentWeather {
  location: WeatherLocation;
  current: CurrentWeather;
  units: WeatherUnits;
  alerts: WeatherAlert[];
  source: string;
  updatedAt: string;
}

/**
 * Normalize an OpenWeather current weather response + reverse-geocode info.
 */
export function normalizeCurrentWeather(
  raw: OpenWeatherCurrentResponse,
  geoInfo?: OpenWeatherGeocodingItem,
): NormalizedCurrentWeather {
  const w = raw.weather[0];

  // Determine timezone string — OW only gives offset in seconds, not IANA
  const tzOffsetHours = raw.timezone / 3600;
  const tzSign = tzOffsetHours >= 0 ? '+' : '-';
  const tzStr = `UTC${tzSign}${Math.abs(tzOffsetHours)}`;

  return {
    location: {
      name: geoInfo?.name ?? raw.name,
      region: geoInfo?.state ?? '',
      country: geoInfo?.country ?? raw.sys.country ?? '',
      latitude: raw.coord.lat,
      longitude: raw.coord.lon,
      timezone: tzStr,
    },
    current: {
      temperature: Math.round(raw.main.temp),
      feelsLike: Math.round(raw.main.feels_like),
      condition: w?.description ?? '',
      conditionCode: w?.id ?? 0,
      humidity: raw.main.humidity,
      windSpeed: msToKmh(raw.wind.speed),
      windDirection: raw.wind.deg,
      pressure: raw.main.pressure,
      visibility: Math.round(raw.visibility / 1000), // metres → km
      cloudCover: raw.clouds.all,
      uvIndex: 0, // Not available from the free current weather endpoint
      icon: w?.icon ?? '01d',
      precipitation: raw.rain?.['1h'] ?? raw.snow?.['1h'] ?? 0,
    },
    units: {
      temperature: 'celsius',
      windSpeed: 'km/h',
      pressure: 'hPa',
      precipitation: 'mm',
      visibility: 'km',
    },
    alerts: [],
    source: 'OpenWeather',
    updatedAt: unixToISO(raw.dt),
  };
}

// ---------------------------------------------------------------------------
// Forecast
// ---------------------------------------------------------------------------

export interface NormalizedForecast {
  hourly: HourlyForecast[];
  daily: DailyForecast[];
}

/**
 * Normalize the 5-day / 3-hour forecast into hourly + daily arrays.
 */
export function normalizeForecast(
  raw: OpenWeatherForecastResponse,
): NormalizedForecast {
  const tzOffset = raw.city.timezone;

  // Build hourly array from each 3-hour block
  const hourly: HourlyForecast[] = raw.list.map((item) => {
    const w = item.weather[0];
    return {
      time: unixToISO(item.dt),
      temperature: Math.round(item.main.temp),
      feelsLike: Math.round(item.main.feels_like),
      condition: w?.description ?? '',
      conditionCode: w?.id ?? 0,
      icon: w?.icon ?? '01d',
      precipitation: item.rain?.['3h'] ?? item.snow?.['3h'] ?? 0,
      precipProbability: Math.round(item.pop * 100),
      humidity: item.main.humidity,
      windSpeed: msToKmh(item.wind.speed),
      windDirection: item.wind.deg,
    };
  });

  // Group 3-hour blocks by local date to produce daily aggregates
  const dayBuckets = new Map<string, OWMForecastItem[]>();
  for (const item of raw.list) {
    const dateKey = unixToISODate(item.dt, tzOffset);
    const bucket = dayBuckets.get(dateKey);
    if (bucket) {
      bucket.push(item);
    } else {
      dayBuckets.set(dateKey, [item]);
    }
  }

  const daily: DailyForecast[] = [];
  for (const [dateKey, items] of dayBuckets) {
    const temps = items.map((i) => i.main.temp);
    const tempMaxes = items.map((i) => i.main.temp_max);
    const tempMins = items.map((i) => i.main.temp_min);
    const high = Math.max(...tempMaxes, ...temps);
    const low = Math.min(...tempMins, ...temps);
    const avgHumidity = Math.round(
      items.reduce((s, i) => s + i.main.humidity, 0) / items.length,
    );
    const maxPop = Math.max(...items.map((i) => i.pop));
    const avgWind = items.reduce((s, i) => s + i.wind.speed, 0) / items.length;
    const avgWindDir = Math.round(
      items.reduce((s, i) => s + i.wind.deg, 0) / items.length,
    );
    const avgClouds = Math.round(
      items.reduce((s, i) => s + i.clouds.all, 0) / items.length,
    );
    const totalPrecip = items.reduce(
      (s, i) => s + (i.rain?.['3h'] ?? 0) + (i.snow?.['3h'] ?? 0),
      0,
    );

    const dom = dominantCondition(items);

    daily.push({
      date: dateKey,
      sunrise: unixToISO(raw.city.sunrise),
      sunset: unixToISO(raw.city.sunset),
      temperatureHigh: Math.round(high),
      temperatureLow: Math.round(low),
      condition: dom.description,
      conditionCode: dom.id,
      icon: dom.icon,
      precipitation: Math.round(totalPrecip * 10) / 10,
      precipProbability: Math.round(maxPop * 100),
      humidity: avgHumidity,
      windSpeed: msToKmh(avgWind),
      windDirection: avgWindDir,
      uvIndex: 0, // Not available from the free forecast endpoint
      summary: `${dom.main} with a high of ${Math.round(high)}°C and a low of ${Math.round(low)}°C.`,
    });
  }

  return { hourly, daily };
}

// ---------------------------------------------------------------------------
// Geocoding
// ---------------------------------------------------------------------------

/**
 * Normalize OpenWeather geocoding items into our app-domain shape.
 */
export function normalizeGeocodingResults(
  raw: OpenWeatherGeocodingItem[],
): GeocodingResult[] {
  return raw.map((item) => ({
    name: item.name,
    region: item.state ?? '',
    country: item.country,
    lat: item.lat,
    lon: item.lon,
    localNames: item.local_names,
  }));
}

// ---------------------------------------------------------------------------
// Air Quality
// ---------------------------------------------------------------------------

const AQI_CATEGORIES: Record<number, AirQualityCategory> = {
  1: 'Good',
  2: 'Fair',
  3: 'Moderate',
  4: 'Poor',
  5: 'Very Poor',
};

/**
 * Normalize OpenWeather air pollution response into our app-domain shape.
 */
export function normalizeAirQuality(
  raw: OpenWeatherAirQualityResponse,
): AirQualityData {
  const item = raw.list[0];
  const aqi = item.main.aqi;
  const c = item.components;

  return {
    aqi,
    category: AQI_CATEGORIES[aqi] ?? 'Moderate',
    pm25: c.pm2_5,
    pm10: c.pm10,
    o3: c.o3,
    no2: c.no2,
    so2: c.so2,
    co: c.co,
    components: {
      co: c.co,
      no: c.no,
      no2: c.no2,
      o3: c.o3,
      so2: c.so2,
      pm2_5: c.pm2_5,
      pm10: c.pm10,
      nh3: c.nh3,
    },
    updatedAt: unixToISO(item.dt),
  };
}
