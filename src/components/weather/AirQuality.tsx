'use client';

import React from 'react';
import { Wind, ShieldAlert, CheckCircle, AlertTriangle } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import type { AirQualityData } from '@/types/weather';

export interface AirQualityProps {
  airQuality: AirQualityData | null;
  isLoading?: boolean;
}

export function AirQuality({ airQuality, isLoading }: AirQualityProps) {
  if (isLoading) {
    return (
      <Card className="text-center py-8 text-slate-400 text-sm">
        Fetching atmospheric pollutant telemetry...
      </Card>
    );
  }

  if (!airQuality) {
    return (
      <Card className="text-center py-8 text-slate-400 text-sm">
        <Wind className="w-8 h-8 text-slate-500 mx-auto mb-2 opacity-50" />
        <p className="font-medium text-slate-300">Air Quality Telemetry Unavailable</p>
        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
          Pollutant metrics are not available for this coordinate pair or upstream key access is limited.
        </p>
      </Card>
    );
  }

  // OpenWeather AQI scale:
  // 1: Good (0-20), 2: Fair (20-40), 3: Moderate (40-60), 4: Poor (60-80), 5: Very Poor (80-100)
  const aqiColors: Record<number, { bg: string; text: string; bar: string }> = {
    1: { bg: 'bg-emerald-500/20', text: 'text-emerald-300', bar: 'bg-emerald-400' },
    2: { bg: 'bg-amber-500/20', text: 'text-amber-300', bar: 'bg-amber-400' },
    3: { bg: 'bg-orange-500/20', text: 'text-orange-300', bar: 'bg-orange-400' },
    4: { bg: 'bg-rose-500/20', text: 'text-rose-300', bar: 'bg-rose-400' },
    5: { bg: 'bg-purple-500/20', text: 'text-purple-300', bar: 'bg-purple-400' },
  };

  const aqiDescriptions: Record<number, string> = {
    1: 'Air quality is considered satisfactory, and air pollution poses little or no risk.',
    2: 'Air quality is acceptable; however, very sensitive individuals may experience minor irritation.',
    3: 'Members of sensitive groups may experience health effects. The general public is less likely to be affected.',
    4: 'Everyone may begin to experience health effects; members of sensitive groups may experience more serious health effects.',
    5: 'Health alert: risk of serious health effects for any individual outdoors. Minimizing exposure is recommended.',
  };

  const colorConfig = aqiColors[airQuality.aqi] ?? aqiColors[3];
  const description = aqiDescriptions[airQuality.aqi] ?? 'Standard atmospheric observation.';

  // Pollutants (μg/m3)
  const pollutants = [
    { label: 'PM2.5', value: airQuality.pm25, unit: 'μg/m³', desc: 'Fine inhalable particles' },
    { label: 'PM10', value: airQuality.pm10, unit: 'μg/m³', desc: 'Respirable particulate matter' },
    { label: 'O₃ (Ozone)', value: airQuality.o3, unit: 'μg/m³', desc: 'Ground-level ozone' },
    { label: 'NO₂', value: airQuality.no2, unit: 'μg/m³', desc: 'Nitrogen dioxide' },
    { label: 'SO₂', value: airQuality.so2, unit: 'μg/m³', desc: 'Sulfur dioxide' },
    { label: 'CO', value: airQuality.co, unit: 'μg/m³', desc: 'Carbon monoxide' },
  ];

  return (
    <Card className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-400">
            <Wind className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-white tracking-tight">
              Air Quality Index (AQI)
            </h2>
            <p className="text-xs text-slate-400">
              European / OpenWeather 5-level scale index & concentration readings
            </p>
          </div>
        </div>
        <span className="text-xs font-mono text-slate-400">
          Updated: {new Date(airQuality.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      {/* Main AQI Gauge Card */}
      <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div
            className={`w-20 h-20 rounded-2xl flex flex-col items-center justify-center font-mono border ${colorConfig.bg} border-white/10`}
          >
            <span className="text-3xl font-extrabold text-white">
              {airQuality.aqi}
            </span>
            <span className="text-[10px] text-slate-300 uppercase tracking-wider">
              Level / 5
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`text-xl font-bold ${colorConfig.text}`}>
                {airQuality.category}
              </span>
              <Badge variant="outline" size="sm">
                Scale 1–5
              </Badge>
            </div>
            <p className="text-xs text-slate-300 max-w-md leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        {/* 5-segment Visual Meter */}
        <div className="w-full sm:w-48 space-y-1.5">
          <div className="flex justify-between text-[10px] font-mono text-slate-400">
            <span>Good (1)</span>
            <span>V. Poor (5)</span>
          </div>
          <div className="grid grid-cols-5 gap-1 h-2 rounded-full overflow-hidden bg-white/10">
            {[1, 2, 3, 4, 5].map((lvl) => (
              <div
                key={lvl}
                className={`h-full transition-colors ${
                  lvl <= airQuality.aqi
                    ? lvl === 1
                      ? 'bg-emerald-400'
                      : lvl === 2
                      ? 'bg-amber-400'
                      : lvl === 3
                      ? 'bg-orange-400'
                      : lvl === 4
                      ? 'bg-rose-400'
                      : 'bg-purple-400'
                    : 'bg-transparent'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Pollutant Breakdown Grid */}
      <div>
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Detailed Pollutant Concentrations
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {pollutants.map((p) => (
            <div
              key={p.label}
              className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] flex flex-col justify-between"
            >
              <div>
                <span className="text-[11px] font-semibold text-slate-300 block mb-0.5">
                  {p.label}
                </span>
                <span className="text-base font-bold font-mono text-white">
                  {Math.round(p.value * 10) / 10}
                </span>
                <span className="text-[10px] text-slate-500 ml-1">{p.unit}</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-2 block truncate">
                {p.desc}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
