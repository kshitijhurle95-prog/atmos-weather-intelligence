'use client';

import React from 'react';
import {
  Droplets,
  Wind,
  Gauge,
  Eye,
  Cloud,
  Sun,
  CloudRain,
  Compass,
} from 'lucide-react';
import { Card } from '../ui/Card';
import type { CurrentWeather, UnitSystem } from '@/types/weather';
import {
  formatWindSpeed,
  formatPressure,
  formatVisibility,
  formatPrecipitation,
  degToCompass,
} from '@/lib/formatting';

export interface WeatherMetricsProps {
  current: CurrentWeather;
  unitSystem: UnitSystem;
  precipProbability?: number;
}

export function WeatherMetrics({
  current,
  unitSystem,
  precipProbability,
}: WeatherMetricsProps) {
  const isImperial = unitSystem === 'imperial';

  const windFormatted = formatWindSpeed(
    current.windSpeed,
    isImperial ? 'mph' : 'km/h',
  );

  const pressureFormatted = formatPressure(
    current.pressure,
    isImperial ? 'inHg' : 'hPa',
  );

  const visibilityFormatted = formatVisibility(
    current.visibility,
    isImperial ? 'mi' : 'km',
  );

  const precipFormatted = formatPrecipitation(
    current.precipitation,
    isImperial ? 'in' : 'mm',
  );

  const compassDir = degToCompass(current.windDirection);

  const metrics = [
    {
      id: 'humidity',
      label: 'Humidity',
      value: `${current.humidity}%`,
      icon: Droplets,
      iconColor: 'text-sky-400',
      description: current.humidity > 65 ? 'High moisture level' : 'Comfortable humidity',
      indicator: {
        percent: current.humidity,
        color: current.humidity > 70 ? 'bg-sky-400' : 'bg-emerald-400',
      },
    },
    {
      id: 'wind',
      label: 'Wind Telemetry',
      value: windFormatted,
      icon: Wind,
      iconColor: 'text-teal-400',
      description: `${compassDir} (${current.windDirection}°)`,
      indicator: {
        percent: Math.min((current.windSpeed / 60) * 100, 100),
        color: current.windSpeed > 30 ? 'bg-amber-400' : 'bg-teal-400',
      },
    },
    {
      id: 'pressure',
      label: 'Pressure',
      value: pressureFormatted,
      icon: Gauge,
      iconColor: 'text-indigo-400',
      description: current.pressure > 1013 ? 'High pressure system' : 'Low pressure system',
    },
    {
      id: 'visibility',
      label: 'Visibility',
      value: visibilityFormatted,
      icon: Eye,
      iconColor: 'text-cyan-400',
      description: current.visibility >= 10 ? 'Clear line of sight' : 'Reduced visibility',
    },
    {
      id: 'cloudCover',
      label: 'Cloud Cover',
      value: `${current.cloudCover}%`,
      icon: Cloud,
      iconColor: 'text-slate-400',
      description: current.cloudCover > 75 ? 'Overcast skies' : current.cloudCover > 25 ? 'Partly cloudy' : 'Clear skies',
      indicator: {
        percent: current.cloudCover,
        color: 'bg-slate-400',
      },
    },
    {
      id: 'precipitation',
      label: 'Precipitation',
      value: precipFormatted,
      icon: CloudRain,
      iconColor: 'text-blue-400',
      description: precipProbability !== undefined ? `${precipProbability}% chance today` : 'Volume measured',
    },
    {
      id: 'windDirection',
      label: 'Wind Direction',
      value: compassDir,
      icon: Compass,
      iconColor: 'text-emerald-400',
      description: `${current.windDirection}° from North`,
    },
    {
      id: 'uvIndex',
      label: 'UV Index',
      value: current.uvIndex ? `${current.uvIndex}` : 'Low / Mod',
      icon: Sun,
      iconColor: 'text-amber-400',
      description: 'Solar radiation level',
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-base sm:text-lg font-semibold text-white tracking-tight">
          Current Atmospheric Metrics
        </h2>
        <span className="text-xs font-mono text-slate-400">
          Telemetry live
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <Card
              key={m.id}
              padding="sm"
              hover
              className="flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                  <span className="font-medium text-slate-300">{m.label}</span>
                  <div className="p-1.5 rounded-lg bg-white/5">
                    <Icon className={`w-4 h-4 ${m.iconColor}`} />
                  </div>
                </div>

                <div className="text-lg sm:text-xl font-bold font-mono text-white tracking-tight mb-1">
                  {m.value}
                </div>

                <div className="text-[11px] text-slate-400 truncate">
                  {m.description}
                </div>
              </div>

              {m.indicator && (
                <div className="w-full bg-white/10 h-1.5 rounded-full mt-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${m.indicator.color}`}
                    style={{ width: `${Math.max(m.indicator.percent, 5)}%` }}
                  />
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
