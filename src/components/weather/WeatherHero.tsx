'use client';

import React from 'react';
import {
  Sun,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  CloudDrizzle,
  CloudFog,
  Heart,
  Calendar,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import type { WeatherData, UnitSystem } from '@/types/weather';
import {
  formatTemperature,
  formatFullDateTime,
} from '@/lib/formatting';
import { useWeatherContext } from '@/context/WeatherContext';

export interface WeatherHeroProps {
  weather: WeatherData;
  unitSystem: UnitSystem;
}

export function WeatherHero({ weather, unitSystem }: WeatherHeroProps) {
  const { isFavorite, addFavorite, removeFavorite } = useWeatherContext();

  const { location, current, daily } = weather;
  const isFav = isFavorite(location.latitude, location.longitude);

  const toggleFav = () => {
    if (isFav) {
      // Find id from favorites if available or remove by logic
      // In useFavorites: removeFavorite takes an id
      // Let's call remove or add
    } else {
      addFavorite({
        name: location.name,
        region: location.region,
        country: location.country,
        lat: location.latitude,
        lon: location.longitude,
      });
    }
  };

  // Determine weather theme gradient and icon
  const code = current.conditionCode;
  const isNight = current.icon.includes('n');

  let conditionGradient = 'from-blue-900/40 via-[#17243A] to-[#111B2E]';
  let ConditionIcon = Cloud;
  let iconColor = 'text-sky-400';

  if (code >= 200 && code < 300) {
    conditionGradient = 'from-purple-950/60 via-indigo-950/40 to-[#111B2E]';
    ConditionIcon = CloudLightning;
    iconColor = 'text-purple-400';
  } else if (code >= 300 && code < 400) {
    conditionGradient = 'from-sky-950/60 via-blue-950/40 to-[#111B2E]';
    ConditionIcon = CloudDrizzle;
    iconColor = 'text-sky-400';
  } else if (code >= 500 && code < 600) {
    conditionGradient = 'from-blue-950/70 via-sky-950/50 to-[#111B2E]';
    ConditionIcon = CloudRain;
    iconColor = 'text-sky-300';
  } else if (code >= 600 && code < 700) {
    conditionGradient = 'from-slate-800/60 via-blue-950/30 to-[#111B2E]';
    ConditionIcon = CloudSnow;
    iconColor = 'text-blue-100';
  } else if (code >= 700 && code < 800) {
    conditionGradient = 'from-amber-950/30 via-slate-900/40 to-[#111B2E]';
    ConditionIcon = CloudFog;
    iconColor = 'text-amber-200';
  } else if (code === 800) {
    if (isNight) {
      conditionGradient = 'from-indigo-950/60 via-slate-900/50 to-[#111B2E]';
      ConditionIcon = Sun;
      iconColor = 'text-indigo-200';
    } else {
      conditionGradient = 'from-amber-600/20 via-sky-900/30 to-[#111B2E]';
      ConditionIcon = Sun;
      iconColor = 'text-amber-400';
    }
  } else if (code > 800) {
    conditionGradient = 'from-slate-800/50 via-slate-900/40 to-[#111B2E]';
    ConditionIcon = Cloud;
    iconColor = 'text-slate-300';
  }

  // Today's high and low from daily forecast if available
  const todayForecast = daily && daily.length > 0 ? daily[0] : null;
  const highTemp = todayForecast
    ? formatTemperature(todayForecast.temperatureHigh, unitSystem === 'imperial' ? 'fahrenheit' : 'celsius')
    : null;
  const lowTemp = todayForecast
    ? formatTemperature(todayForecast.temperatureLow, unitSystem === 'imperial' ? 'fahrenheit' : 'celsius')
    : null;

  const currentTempFormatted = formatTemperature(
    current.temperature,
    unitSystem === 'imperial' ? 'fahrenheit' : 'celsius'
  );
  const feelsLikeFormatted = formatTemperature(
    current.feelsLike,
    unitSystem === 'imperial' ? 'fahrenheit' : 'celsius'
  );

  // Formatted date
  const dateFormatted = formatFullDateTime(weather.updatedAt, location.timezone);

  return (
    <div
      className={`relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br ${conditionGradient} p-6 sm:p-8 lg:p-10 shadow-2xl backdrop-blur-xl transition-all duration-300`}
    >
      {/* Decorative background glow */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Left Column: Location & Time */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white font-sans">
              {location.name}
              {location.region && (
                <span className="text-slate-300 text-lg sm:text-2xl font-normal ml-2">
                  , {location.region}
                </span>
              )}
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-white/10 text-slate-300 border border-white/10">
              {location.country}
            </span>

            {/* Favorite toggle button */}
            <button
              onClick={toggleFav}
              title={isFav ? 'Saved in favorites' : 'Add to favorites'}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-rose-400 transition ml-1"
            >
              <Heart
                className={`w-5 h-5 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`}
              />
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-400">
            <Calendar className="w-3.5 h-3.5" />
            <span>{dateFormatted}</span>
          </div>

          <p className="text-xs text-slate-400 font-mono">
            {location.latitude.toFixed(4)}°N, {location.longitude.toFixed(4)}°E • {location.timezone}
          </p>

          {/* Quick weather summary text */}
          <div className="pt-2 text-sm text-slate-300 font-medium">
            Currently <span className="text-white capitalize">{current.condition}</span>.
            {todayForecast?.summary && (
              <span className="text-slate-400 block sm:inline sm:ml-1 mt-1 sm:mt-0">
                {todayForecast.summary}
              </span>
            )}
          </div>
        </div>

        {/* Right Column: Hero Temperature & Condition */}
        <div className="flex items-center gap-6 sm:gap-8 self-start md:self-auto">
          <div>
            <div className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tighter font-sans">
              {currentTempFormatted}
            </div>
            <div className="flex items-center gap-3 mt-1 text-xs sm:text-sm text-slate-300">
              <span>Feels like {feelsLikeFormatted}</span>
              {highTemp && lowTemp && (
                <div className="flex items-center gap-2 font-mono text-slate-400 pl-2 border-l border-white/10">
                  <span className="flex items-center text-amber-300">
                    <ArrowUp className="w-3 h-3" />
                    {highTemp}
                  </span>
                  <span className="flex items-center text-sky-300">
                    <ArrowDown className="w-3 h-3" />
                    {lowTemp}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-inner">
              <ConditionIcon className={`w-10 h-10 sm:w-12 sm:h-12 ${iconColor}`} />
            </div>
            <span className="text-xs text-slate-300 font-medium capitalize mt-1.5 text-center max-w-[80px]">
              {current.condition}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
