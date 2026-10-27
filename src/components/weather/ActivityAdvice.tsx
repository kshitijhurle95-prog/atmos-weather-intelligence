'use client';

import React from 'react';
import {
  Trees,
  Footprints,
  Dumbbell,
  Car,
  Umbrella,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import type { WeatherData } from '@/types/weather';

export interface ActivityAdviceProps {
  weather: WeatherData;
}

export function ActivityAdvice({ weather }: ActivityAdviceProps) {
  const { current, daily } = weather;

  // Compute conditions for activities
  const maxRainPop = daily && daily.length > 0 ? daily[0].precipProbability : 0;
  const isRainLikely = maxRainPop > 40 || current.precipitation > 0;
  const isHighWind = current.windSpeed > 30;
  const isHot = current.temperature > 32;
  const isCold = current.temperature < 8;

  const activities = [
    {
      id: 'outdoor',
      category: 'Outdoor Activities',
      icon: Trees,
      score: isRainLikely || isHighWind || isHot ? ('Fair' as const) : ('Ideal' as const),
      advice: isRainLikely
        ? 'Rain likelihood is elevated. Keep outdoor events flexible with indoor alternatives.'
        : isHighWind
        ? 'Windy conditions; secure lightweight items and expect moderate gusts.'
        : 'Pleasant atmospheric parameters suitable for parks, patio dining, and leisure.',
    },
    {
      id: 'running',
      category: 'Running & Exercise',
      icon: Dumbbell,
      score:
        isHot || current.humidity > 80
          ? ('Caution' as const)
          : isRainLikely
          ? ('Fair' as const)
          : ('Optimal' as const),
      advice: isHot
        ? 'High thermal index. Hydrate frequently and consider early morning or dusk workouts.'
        : isRainLikely
        ? 'Traction on pavements may be compromised by dampness. Wear suitable footwear.'
        : 'Excellent conditions for cardiovascular conditioning and distance training.',
    },
    {
      id: 'commuting',
      category: 'Walking & Commuting',
      icon: Footprints,
      score: isRainLikely ? ('Fair' as const) : ('Good' as const),
      advice: isRainLikely
        ? 'Expect wet surfaces. Commuter footwear and wet-weather outerwear are suggested.'
        : 'Smooth walking conditions with uninhibited foot transit.',
    },
    {
      id: 'rain-prep',
      category: 'Rain Preparedness',
      icon: Umbrella,
      score: isRainLikely ? ('Required' as const) : ('Not Needed' as const),
      advice: isRainLikely
        ? `Carry a compact umbrella or rain shell (${maxRainPop}% precipitation chance).`
        : 'Low probability of precipitation today; no rain gear required.',
    },
    {
      id: 'travel',
      category: 'Road Travel & Transit',
      icon: Car,
      score: isHighWind || current.visibility < 5 ? ('Moderate' as const) : ('Smooth' as const),
      advice:
        current.visibility < 5
          ? 'Reduced line-of-sight due to mist or haze. Maintain headlight usage.'
          : isHighWind
          ? 'High-profile vehicles may experience side-gust resistance on open highways.'
          : 'Normal driving and transit conditions across roadways.',
    },
  ];

  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-white tracking-tight">
              Plan Your Day (Activity Index)
            </h2>
            <p className="text-xs text-slate-400">
              Pragmatic recommendations generated deterministically from current and daily forecast metrics
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {activities.map((act) => {
          const Icon = act.icon;
          const isGood =
            act.score === 'Ideal' || act.score === 'Optimal' || act.score === 'Good' || act.score === 'Smooth';
          const isCaution = act.score === 'Caution' || act.score === 'Required';

          return (
            <div
              key={act.id}
              className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] flex flex-col justify-between hover:bg-white/[0.06] transition"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-white/5 text-slate-300">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="font-semibold text-xs sm:text-sm text-white">
                      {act.category}
                    </span>
                  </div>

                  <Badge
                    variant={isGood ? 'success' : isCaution ? 'warning' : 'default'}
                    size="sm"
                  >
                    {isGood ? (
                      <CheckCircle2 className="w-3 h-3 mr-0.5" />
                    ) : isCaution ? (
                      <AlertTriangle className="w-3 h-3 mr-0.5" />
                    ) : null}
                    {act.score}
                  </Badge>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mt-2">
                  {act.advice}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-1 border-t border-white/5">
        <Info className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
        <span>
          Planning indicators are automated situational aids and do not constitute emergency or official meteorological orders.
        </span>
      </div>
    </Card>
  );
}
