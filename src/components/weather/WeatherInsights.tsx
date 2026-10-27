'use client';

import React from 'react';
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  CloudRain,
  Wind,
  Sun,
  Droplets,
  AlertCircle,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import type { WeatherData } from '@/types/weather';

export interface WeatherInsightsProps {
  weather: WeatherData;
}

export function WeatherInsights({ weather }: WeatherInsightsProps) {
  const { current, hourly, daily } = weather;

  // Generate deterministic, verified insights strictly from API data
  const insights: Array<{
    id: string;
    icon: React.ElementType;
    iconColor: string;
    badge: string;
    text: string;
  }> = [];

  // 1. Rain probability timing insight
  if (hourly && hourly.length >= 8) {
    const next12Hours = hourly.slice(0, 8);
    const morningSlots = next12Hours.filter((h) => {
      const hour = new Date(h.time).getHours();
      return hour >= 6 && hour < 12;
    });
    const afternoonSlots = next12Hours.filter((h) => {
      const hour = new Date(h.time).getHours();
      return hour >= 12 && hour < 18;
    });

    const morningAvgPop =
      morningSlots.length > 0
        ? morningSlots.reduce((acc, s) => acc + s.precipProbability, 0) /
          morningSlots.length
        : 0;
    const afternoonAvgPop =
      afternoonSlots.length > 0
        ? afternoonSlots.reduce((acc, s) => acc + s.precipProbability, 0) /
          afternoonSlots.length
        : 0;

    if (afternoonAvgPop > morningAvgPop + 20 && afternoonAvgPop > 30) {
      insights.push({
        id: 'rain-afternoon',
        icon: CloudRain,
        iconColor: 'text-sky-400',
        badge: 'Precipitation',
        text: 'Precipitation is noticeably more likely this afternoon than earlier in the day.',
      });
    } else if (morningAvgPop > afternoonAvgPop + 20 && morningAvgPop > 30) {
      insights.push({
        id: 'rain-morning',
        icon: CloudRain,
        iconColor: 'text-sky-400',
        badge: 'Precipitation',
        text: 'Heaviest rain chances are centered in the morning hours before clearing later.',
      });
    } else if (Math.max(...next12Hours.map((h) => h.precipProbability)) > 60) {
      insights.push({
        id: 'rain-high',
        icon: CloudRain,
        iconColor: 'text-sky-400',
        badge: 'Precipitation',
        text: 'Significant chance of rain in the upcoming hours. Carrying waterproof gear is advised.',
      });
    }
  }

  // 2. Tomorrow vs today temperature comparison
  if (daily && daily.length >= 2) {
    const todayHigh = daily[0].temperatureHigh;
    const tomorrowHigh = daily[1].temperatureHigh;
    const diff = tomorrowHigh - todayHigh;

    if (diff >= 3) {
      insights.push({
        id: 'temp-warmer',
        icon: TrendingUp,
        iconColor: 'text-amber-400',
        badge: 'Temperature',
        text: `Tomorrow is expected to be noticeably warmer than today (high reaching ${tomorrowHigh}°C vs today's ${todayHigh}°C).`,
      });
    } else if (diff <= -3) {
      insights.push({
        id: 'temp-cooler',
        icon: TrendingDown,
        iconColor: 'text-blue-400',
        badge: 'Temperature',
        text: `A cooling trend is anticipated tomorrow, with temperatures dropping approximately ${Math.abs(diff)}°C below today.`,
      });
    }
  }

  // 3. Wind impact insight
  if (current.windSpeed > 28) {
    insights.push({
      id: 'wind-strong',
      icon: Wind,
      iconColor: 'text-teal-400',
      badge: 'Wind',
      text: `Breezy conditions with wind speeds at ${current.windSpeed} km/h. Outdoor sports and high-profile driving may experience drag.`,
    });
  }

  // 4. Humidity & Comfort
  if (current.humidity >= 80) {
    insights.push({
      id: 'humidity-high',
      icon: Droplets,
      iconColor: 'text-cyan-400',
      badge: 'Comfort',
      text: `Elevated humidity (${current.humidity}%) will cause the apparent temperature to feel heavier than the mercury reading.`,
    });
  } else if (current.humidity <= 25) {
    insights.push({
      id: 'humidity-low',
      icon: Sun,
      iconColor: 'text-amber-300',
      badge: 'Air Moisture',
      text: `Low relative humidity (${current.humidity}%) makes the air crisp and dry; consider hydration and skin moisturization.`,
    });
  }

  // Fallback if no specific condition triggered
  if (insights.length === 0) {
    insights.push({
      id: 'steady',
      icon: Sparkles,
      iconColor: 'text-blue-400',
      badge: 'General',
      text: 'Atmospheric conditions are stable across the current forecast window without abrupt deviations.',
    });
  }

  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-white tracking-tight">
              Weather Insights & Analytics
            </h2>
            <p className="text-xs text-slate-400">
              Deterministic patterns calculated from live forecast telemetry
            </p>
          </div>
        </div>
        <span className="text-[11px] font-mono text-slate-400">
          Generated
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {insights.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-start gap-3 hover:bg-white/[0.06] transition"
            >
              <div className="p-2 rounded-lg bg-white/5 flex-shrink-0 mt-0.5">
                <Icon className={`w-4 h-4 ${item.iconColor}`} />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="accent" size="sm">
                    {item.badge}
                  </Badge>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {item.text}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-1">
        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
        <span>
          Derived from numeric forecast telemetry; check official local alerts for emergency guidance.
        </span>
      </div>
    </Card>
  );
}
