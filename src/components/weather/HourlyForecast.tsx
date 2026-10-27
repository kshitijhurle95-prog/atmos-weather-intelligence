'use client';

import React, { useRef, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Droplets,
  Wind,
  Compass,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { TemperatureChart } from '../charts/TemperatureChart';
import { PrecipitationChart } from '../charts/PrecipitationChart';
import type { HourlyForecast as HourlyType, UnitSystem } from '@/types/weather';
import { formatTemperature, formatWindSpeed } from '@/lib/formatting';

export interface HourlyForecastProps {
  hourly: HourlyType[];
  unitSystem: UnitSystem;
}

export function HourlyForecast({ hourly, unitSystem }: HourlyForecastProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [selectedHour, setSelectedHour] = useState<HourlyType | null>(
    hourly && hourly.length > 0 ? hourly[0] : null,
  );
  const [chartView, setChartView] = useState<'temp' | 'precip'>('temp');

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const offset = direction === 'left' ? -280 : 280;
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  if (!hourly || hourly.length === 0) {
    return (
      <Card className="text-center py-8 text-slate-400 text-sm">
        No hourly forecast data available.
      </Card>
    );
  }

  // Display next 24 hours
  const hours = hourly.slice(0, 24);

  return (
    <Card className="space-y-5">
      {/* Header with Title and Scroll Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base sm:text-lg font-semibold text-white tracking-tight">
            Hourly Forecast (24-Hour Timeline)
          </h2>
          <p className="text-xs text-slate-400">
            Select an interval to inspect atmospheric conditions
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => scroll('left')}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition"
            title="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition"
            title="Scroll right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontally Scrollable Timeline */}
      <div
        ref={scrollRef}
        className="flex gap-2.5 overflow-x-auto pb-2 scroll-container scrollbar-thin scrollbar-thumb-white/10"
      >
        {hours.map((item, idx) => {
          const d = new Date(item.time);
          const timeLabel =
            idx === 0
              ? 'Now'
              : d.toLocaleTimeString([], { hour: 'numeric', hour12: true });
          const isSelected = selectedHour?.time === item.time;
          const tempFormatted = formatTemperature(
            item.temperature,
            unitSystem === 'imperial' ? 'fahrenheit' : 'celsius',
          );

          return (
            <button
              key={item.time}
              onClick={() => setSelectedHour(item)}
              className={`flex-shrink-0 w-20 sm:w-22 p-3 rounded-2xl flex flex-col items-center justify-between gap-1.5 transition-all text-center ${
                isSelected
                  ? 'bg-blue-600/30 border-2 border-blue-500 shadow-lg shadow-blue-500/20 text-white'
                  : 'bg-white/[0.04] hover:bg-white/[0.08] border border-white/5 text-slate-300'
              }`}
            >
              <span className="text-[11px] font-medium text-slate-400">
                {timeLabel}
              </span>

              {/* Weather icon from OpenWeather */}
              <img
                src={`https://openweathermap.org/img/wn/${item.icon}.png`}
                alt={item.condition}
                className="w-10 h-10 object-contain drop-shadow"
              />

              <span className="text-base font-bold font-mono text-white">
                {tempFormatted}
              </span>

              {/* Precip probability */}
              <div className="flex items-center gap-1 text-[10px] text-sky-400">
                <Droplets className="w-2.5 h-2.5" />
                <span>{item.precipProbability}%</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Hour Details Inspector */}
      {selectedHour && (
        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-white text-sm">
              {new Date(selectedHour.time).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
              })}
            </span>
            <span className="text-slate-400 capitalize">
              {selectedHour.condition}
            </span>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1.5 text-slate-300">
              <Droplets className="w-3.5 h-3.5 text-sky-400" />
              <span>Humidity: {selectedHour.humidity}%</span>
            </div>

            <div className="flex items-center gap-1.5 text-slate-300">
              <Wind className="w-3.5 h-3.5 text-teal-400" />
              <span>
                Wind:{' '}
                {formatWindSpeed(
                  selectedHour.windSpeed,
                  unitSystem === 'imperial' ? 'mph' : 'km/h',
                )}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-slate-300">
              <Compass className="w-3.5 h-3.5 text-emerald-400" />
              <span>Dir: {selectedHour.windDirection}°</span>
            </div>
          </div>
        </div>
      )}

      {/* Chart Section with Toggle */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-slate-400 tracking-wider uppercase">
            Hourly Trend Visualization
          </h3>

          <div className="flex rounded-lg bg-white/5 p-0.5 border border-white/10">
            <button
              onClick={() => setChartView('temp')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${
                chartView === 'temp'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Temperature
            </button>
            <button
              onClick={() => setChartView('precip')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${
                chartView === 'precip'
                  ? 'bg-sky-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Precipitation %
            </button>
          </div>
        </div>

        {chartView === 'temp' ? (
          <TemperatureChart hourly={hours} unitSystem={unitSystem} />
        ) : (
          <PrecipitationChart hourly={hours} />
        )}
      </div>
    </Card>
  );
}
