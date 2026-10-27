'use client';

import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Droplets,
  Wind,
  Sunrise,
  Sunset,
} from 'lucide-react';
import { Card } from '../ui/Card';
import type { DailyForecast as DailyType, UnitSystem } from '@/types/weather';
import { formatTemperature, formatWindSpeed } from '@/lib/formatting';

export interface DailyForecastProps {
  daily: DailyType[];
  unitSystem: UnitSystem;
}

export function DailyForecast({ daily, unitSystem }: DailyForecastProps) {
  const [expandedDate, setExpandedDate] = useState<string | null>(null);

  if (!daily || daily.length === 0) {
    return (
      <Card className="text-center py-8 text-slate-400 text-sm">
        No daily forecast data available.
      </Card>
    );
  }

  // Find min and max temperature across all days for the visual range bar
  const allTemps = daily.flatMap((d) => [d.temperatureLow, d.temperatureHigh]);
  const minWeekTemp = Math.min(...allTemps);
  const maxWeekTemp = Math.max(...allTemps);
  const totalTempRange = Math.max(maxWeekTemp - minWeekTemp, 1);

  const toggleExpand = (date: string) => {
    setExpandedDate((prev) => (prev === date ? null : date));
  };

  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base sm:text-lg font-semibold text-white tracking-tight">
            Daily Forecast ({daily.length}-Day Outlook)
          </h2>
          <p className="text-xs text-slate-400">
            Derived directly from verified provider forecast intervals
          </p>
        </div>
        <span className="text-xs font-mono text-slate-400">
          Daily telemetry
        </span>
      </div>

      <div className="divide-y divide-white/[0.06]">
        {daily.map((day, idx) => {
          const dateObj = new Date(`${day.date}T00:00:00`);
          const isToday = idx === 0;
          const dayName = isToday
            ? 'Today'
            : dateObj.toLocaleDateString([], { weekday: 'short' });
          const dateFormatted = dateObj.toLocaleDateString([], {
            month: 'short',
            day: 'numeric',
          });

          const isExpanded = expandedDate === day.date;

          const highFormatted = formatTemperature(
            day.temperatureHigh,
            unitSystem === 'imperial' ? 'fahrenheit' : 'celsius',
          );
          const lowFormatted = formatTemperature(
            day.temperatureLow,
            unitSystem === 'imperial' ? 'fahrenheit' : 'celsius',
          );

          // Calculate offset percentages for temperature bar
          const leftPercent =
            ((day.temperatureLow - minWeekTemp) / totalTempRange) * 100;
          const widthPercent =
            ((day.temperatureHigh - day.temperatureLow) / totalTempRange) * 100;

          return (
            <div key={day.date} className="py-3 first:pt-0 last:pb-0">
              {/* Row header / clickable */}
              <div
                onClick={() => toggleExpand(day.date)}
                className="flex items-center justify-between gap-2 cursor-pointer hover:bg-white/[0.03] p-2 rounded-xl transition"
              >
                {/* Day name and date */}
                <div className="w-24 sm:w-32 flex-shrink-0">
                  <div className="font-semibold text-sm text-white flex items-center gap-1.5">
                    <span>{dayName}</span>
                    {isToday && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 font-normal">
                        Today
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {dateFormatted}
                  </div>
                </div>

                {/* Weather icon & condition */}
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <img
                    src={`https://openweathermap.org/img/wn/${day.icon}.png`}
                    alt={day.condition}
                    className="w-8 h-8 object-contain flex-shrink-0"
                  />
                  <span className="text-xs text-slate-300 capitalize truncate hidden sm:inline">
                    {day.condition}
                  </span>
                </div>

                {/* Rain probability */}
                <div className="w-16 flex items-center justify-center gap-1 text-xs text-sky-400 flex-shrink-0">
                  {day.precipProbability > 0 ? (
                    <>
                      <Droplets className="w-3 h-3" />
                      <span>{day.precipProbability}%</span>
                    </>
                  ) : (
                    <span className="text-slate-600">—</span>
                  )}
                </div>

                {/* Temperature Range Bar & Values */}
                <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                  <span className="text-xs font-mono text-slate-400 w-8 text-right">
                    {lowFormatted}
                  </span>

                  {/* Visual Temperature Range Bar */}
                  <div className="hidden md:block w-24 h-1.5 bg-white/10 rounded-full relative overflow-hidden">
                    <div
                      className="absolute h-full rounded-full bg-gradient-to-r from-sky-400 via-amber-400 to-rose-400"
                      style={{
                        left: `${Math.max(leftPercent, 0)}%`,
                        width: `${Math.max(widthPercent, 8)}%`,
                      }}
                    />
                  </div>

                  <span className="text-xs font-mono font-bold text-white w-8 text-left">
                    {highFormatted}
                  </span>

                  {/* Expand / Collapse Icon */}
                  <div className="text-slate-400 p-1">
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </div>
              </div>

              {/* Expandable Details Drawer */}
              {isExpanded && (
                <div className="mt-2 p-3.5 rounded-xl bg-white/[0.03] border border-white/5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-300 animate-fade-in">
                  <div className="flex items-center gap-2">
                    <Droplets className="w-4 h-4 text-sky-400" />
                    <div>
                      <span className="text-slate-400 block text-[10px]">Avg Humidity</span>
                      <span className="font-semibold text-white">{day.humidity}%</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Wind className="w-4 h-4 text-teal-400" />
                    <div>
                      <span className="text-slate-400 block text-[10px]">Wind Velocity</span>
                      <span className="font-semibold text-white">
                        {formatWindSpeed(
                          day.windSpeed,
                          unitSystem === 'imperial' ? 'mph' : 'km/h',
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Sunrise className="w-4 h-4 text-amber-400" />
                    <div>
                      <span className="text-slate-400 block text-[10px]">Sunrise</span>
                      <span className="font-semibold text-white">
                        {new Date(day.sunrise).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Sunset className="w-4 h-4 text-orange-400" />
                    <div>
                      <span className="text-slate-400 block text-[10px]">Sunset</span>
                      <span className="font-semibold text-white">
                        {new Date(day.sunset).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
