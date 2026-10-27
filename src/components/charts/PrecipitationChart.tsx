'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import type { HourlyForecast } from '@/types/weather';

export interface PrecipitationChartProps {
  hourly: HourlyForecast[];
}

export function PrecipitationChart({ hourly }: PrecipitationChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !hourly || hourly.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-500 text-sm">
        Loading precipitation chart...
      </div>
    );
  }

  // Format 24 hours of data
  const data = hourly.slice(0, 24).map((item) => {
    const d = new Date(item.time);
    const timeStr = d.toLocaleTimeString([], { hour: 'numeric', hour12: true });

    return {
      time: timeStr,
      pop: item.precipProbability,
      precip: item.precipitation,
    };
  });

  return (
    <div className="w-full h-64 sm:h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 15, right: 15, left: -20, bottom: 5 }}
        >
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
            tickFormatter={(val) => `${val}%`}
            domain={[0, 100]}
          />

          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                const dataPoint = payload[0].payload;
                return (
                  <div className="p-3 rounded-xl bg-[#0B1220]/95 border border-white/10 shadow-2xl backdrop-blur-md text-xs space-y-1">
                    <p className="font-semibold text-white">{label}</p>
                    <p className="text-sky-400 font-medium">
                      Chance of Rain: {dataPoint.pop}%
                    </p>
                    {dataPoint.precip > 0 && (
                      <p className="text-slate-300">
                        Precipitation: {dataPoint.precip} mm
                      </p>
                    )}
                  </div>
                );
              }
              return null;
            }}
          />

          <Bar
            dataKey="pop"
            fill="#38BDF8"
            radius={[4, 4, 0, 0]}
            maxBarSize={28}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
