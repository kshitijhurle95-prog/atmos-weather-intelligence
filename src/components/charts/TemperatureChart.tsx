'use client';

import React, { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import type { HourlyForecast, UnitSystem } from '@/types/weather';
import { celsiusToFahrenheit } from '@/lib/formatting';

export interface TemperatureChartProps {
  hourly: HourlyForecast[];
  unitSystem: UnitSystem;
}

export function TemperatureChart({ hourly, unitSystem }: TemperatureChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !hourly || hourly.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-500 text-sm">
        Loading chart visualization...
      </div>
    );
  }

  // Format 24 hours of data
  const data = hourly.slice(0, 24).map((item) => {
    const d = new Date(item.time);
    const timeStr = d.toLocaleTimeString([], { hour: 'numeric', hour12: true });
    const tempVal =
      unitSystem === 'imperial'
        ? Math.round(celsiusToFahrenheit(item.temperature))
        : Math.round(item.temperature);
    const feelsLikeVal =
      unitSystem === 'imperial'
        ? Math.round(celsiusToFahrenheit(item.feelsLike))
        : Math.round(item.feelsLike);

    return {
      time: timeStr,
      temp: tempVal,
      feelsLike: feelsLikeVal,
      condition: item.condition,
    };
  });

  const unitLabel = unitSystem === 'imperial' ? '°F' : '°C';

  return (
    <div className="w-full h-64 sm:h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 15, right: 15, left: -20, bottom: 5 }}
        >
          <defs>
            <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#38BDF8" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="feelsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.0} />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.06)"
            vertical={false}
          />

          <XAxis
            dataKey="time"
            stroke="#94A3B8"
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
          />

          <YAxis
            stroke="#94A3B8"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(val) => `${val}°`}
            domain={['dataMin - 2', 'dataMax + 2']}
          />

          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                const dataPoint = payload[0].payload;
                return (
                  <div className="p-3 rounded-xl bg-[#0B1220]/95 border border-white/10 shadow-2xl backdrop-blur-md text-xs space-y-1">
                    <p className="font-semibold text-white">{label}</p>
                    <p className="text-sky-300 font-medium">
                      Temp: {dataPoint.temp}
                      {unitLabel}
                    </p>
                    <p className="text-amber-300">
                      Feels like: {dataPoint.feelsLike}
                      {unitLabel}
                    </p>
                    <p className="text-slate-400 capitalize">
                      {dataPoint.condition}
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />

          <Area
            type="monotone"
            dataKey="temp"
            stroke="#38BDF8"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#tempGradient)"
            name="Temperature"
          />

          <Area
            type="monotone"
            dataKey="feelsLike"
            stroke="#F59E0B"
            strokeWidth={1.5}
            strokeDasharray="4 4"
            fillOpacity={1}
            fill="url(#feelsGradient)"
            name="Feels Like"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
