import {
  normalizeCurrentWeather,
  normalizeForecast,
  normalizeGeocodingResults,
  normalizeAirQuality,
} from '@/lib/weather/normalize';
import type {
  OpenWeatherCurrentResponse,
  OpenWeatherForecastResponse,
  OpenWeatherGeocodingItem,
  OpenWeatherAirQualityResponse,
} from '@/lib/weather/types';

describe('Weather Normalization Layer', () => {
  it('normalizes raw OpenWeather current weather response correctly', () => {
    const rawMock: OpenWeatherCurrentResponse = {
      coord: { lon: 73.8567, lat: 18.5204 },
      weather: [
        { id: 801, main: 'Clouds', description: 'few clouds', icon: '02d' },
      ],
      base: 'stations',
      main: {
        temp: 28.4,
        feels_like: 30.2,
        temp_min: 27.5,
        temp_max: 29.1,
        pressure: 1012,
        humidity: 62,
      },
      visibility: 10000,
      wind: { speed: 3.5, deg: 240 },
      clouds: { all: 20 },
      dt: 1700000000,
      sys: { country: 'IN', sunrise: 1699960000, sunset: 1700005000 },
      timezone: 19800,
      id: 1259229,
      name: 'Pune',
      cod: 200,
    };

    const geoMock: OpenWeatherGeocodingItem = {
      name: 'Pune',
      lat: 18.5204,
      lon: 73.8567,
      country: 'IN',
      state: 'Maharashtra',
    };

    const normalized = normalizeCurrentWeather(rawMock, geoMock);

    expect(normalized.location.name).toBe('Pune');
    expect(normalized.location.region).toBe('Maharashtra');
    expect(normalized.location.country).toBe('IN');
    expect(normalized.location.latitude).toBe(18.5204);
    expect(normalized.location.longitude).toBe(73.8567);

    expect(normalized.current.temperature).toBe(28);
    expect(normalized.current.feelsLike).toBe(30);
    expect(normalized.current.condition).toBe('few clouds');
    expect(normalized.current.humidity).toBe(62);
    expect(normalized.current.windSpeed).toBe(12.6); // 3.5 m/s * 3.6
    expect(normalized.current.windDirection).toBe(240);
    expect(normalized.current.visibility).toBe(10); // 10000m -> 10km
    expect(normalized.current.cloudCover).toBe(20);
    expect(normalized.units.temperature).toBe('celsius');
    expect(normalized.units.windSpeed).toBe('km/h');
    expect(normalized.source).toBe('OpenWeather');
  });

  it('normalizes 5-day / 3-hour forecast into hourly and daily aggregates', () => {
    const rawForecastMock: OpenWeatherForecastResponse = {
      cod: '200',
      message: 0,
      cnt: 2,
      list: [
        {
          dt: 1700000000,
          main: {
            temp: 25.0,
            feels_like: 26.0,
            temp_min: 24.0,
            temp_max: 26.0,
            pressure: 1013,
            humidity: 70,
          },
          weather: [
            { id: 800, main: 'Clear', description: 'clear sky', icon: '01d' },
          ],
          clouds: { all: 0 },
          wind: { speed: 2.0, deg: 180 },
          visibility: 10000,
          pop: 0.1,
          sys: { pod: 'd' },
          dt_txt: '2023-11-14 18:00:00',
        },
        {
          dt: 1700010800,
          main: {
            temp: 22.0,
            feels_like: 23.0,
            temp_min: 21.0,
            temp_max: 23.0,
            pressure: 1014,
            humidity: 80,
          },
          weather: [
            { id: 500, main: 'Rain', description: 'light rain', icon: '10d' },
          ],
          clouds: { all: 60 },
          wind: { speed: 3.0, deg: 190 },
          visibility: 8000,
          pop: 0.6,
          rain: { '3h': 1.5 },
          sys: { pod: 'n' },
          dt_txt: '2023-11-14 21:00:00',
        },
      ],
      city: {
        id: 1259229,
        name: 'Pune',
        coord: { lat: 18.5204, lon: 73.8567 },
        country: 'IN',
        population: 3124458,
        timezone: 19800,
        sunrise: 1699960000,
        sunset: 1700005000,
      },
    };

    const normalized = normalizeForecast(rawForecastMock);

    expect(normalized.hourly).toHaveLength(2);
    expect(normalized.hourly[0].temperature).toBe(25);
    expect(normalized.hourly[0].precipProbability).toBe(10); // 0.1 * 100
    expect(normalized.hourly[1].precipProbability).toBe(60); // 0.6 * 100

    expect(normalized.daily.length).toBeGreaterThanOrEqual(1);
    const day = normalized.daily[0];
    expect(day.temperatureHigh).toBe(26);
    expect(day.temperatureLow).toBe(21);
    expect(day.precipProbability).toBe(60);
    expect(day.precipitation).toBe(1.5);
  });

  it('normalizes air pollution response and category mapping', () => {
    const rawAirMock: OpenWeatherAirQualityResponse = {
      coord: { lon: 73.8567, lat: 18.5204 },
      list: [
        {
          dt: 1700000000,
          main: { aqi: 2 },
          components: {
            co: 260.35,
            no: 0.1,
            no2: 12.5,
            o3: 65.8,
            so2: 3.2,
            pm2_5: 18.4,
            pm10: 34.2,
            nh3: 4.1,
          },
        },
      ],
    };

    const normalized = normalizeAirQuality(rawAirMock);

    expect(normalized.aqi).toBe(2);
    expect(normalized.category).toBe('Fair');
    expect(normalized.pm25).toBe(18.4);
    expect(normalized.pm10).toBe(34.2);
    expect(normalized.o3).toBe(65.8);
  });

  it('normalizes geocoding search results', () => {
    const rawGeoMock: OpenWeatherGeocodingItem[] = [
      {
        name: 'Mumbai',
        lat: 19.076,
        lon: 72.8777,
        country: 'IN',
        state: 'Maharashtra',
      },
    ];

    const results = normalizeGeocodingResults(rawGeoMock);
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe('Mumbai');
    expect(results[0].region).toBe('Maharashtra');
    expect(results[0].country).toBe('IN');
  });
});
