'use client';

import React, { useState } from 'react';
import {
  AlertTriangle,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Clock,
  Radio,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import type { WeatherAlert } from '@/types/weather';

export interface WeatherAlertsProps {
  alerts?: WeatherAlert[];
}

export function WeatherAlerts({ alerts = [] }: WeatherAlertsProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  if (!alerts || alerts.length === 0) {
    return (
      <Card className="flex items-center justify-between p-4 bg-emerald-500/5 border-emerald-500/20">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">
              No Severe Weather Warnings Active
            </h3>
            <p className="text-xs text-slate-400">
              No meteorological alerts or hazardous conditions reported for this territory.
            </p>
          </div>
        </div>
        <Badge variant="success" size="sm">
          Normal
        </Badge>
      </Card>
    );
  }

  const severityStyles: Record<string, { bg: string; border: string; text: string }> = {
    extreme: { bg: 'bg-rose-500/15', border: 'border-rose-500/40', text: 'text-rose-300' },
    severe: { bg: 'bg-orange-500/15', border: 'border-orange-500/40', text: 'text-orange-300' },
    moderate: { bg: 'bg-amber-500/15', border: 'border-amber-500/40', text: 'text-amber-300' },
    minor: { bg: 'bg-blue-500/15', border: 'border-blue-500/40', text: 'text-blue-300' },
  };

  return (
    <div className="space-y-3">
      {alerts.map((alert) => {
        const style = severityStyles[alert.severity] ?? severityStyles.moderate;
        const isExpanded = expandedId === alert.id;

        return (
          <div
            key={alert.id}
            className={`rounded-2xl border ${style.border} ${style.bg} p-4 sm:p-5 backdrop-blur-md transition-all shadow-lg`}
          >
            <div
              onClick={() => toggleExpand(alert.id)}
              className="flex items-start justify-between gap-4 cursor-pointer"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-white/10 text-rose-400 mt-0.5">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded uppercase tracking-wider bg-rose-500/30 text-rose-200 border border-rose-500/40">
                      {alert.severity} Alert
                    </span>
                    <span className="text-xs text-slate-300 font-medium">
                      {alert.sender}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white">
                    {alert.headline || alert.event}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-1.5 font-mono">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      From: {new Date(alert.start).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </span>
                    <span>
                      Until: {new Date(alert.end).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </span>
                  </div>
                </div>
              </div>

              <button className="text-slate-400 hover:text-white p-1">
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </button>
            </div>

            {isExpanded && (
              <div className="mt-4 pt-4 border-t border-white/10 text-xs sm:text-sm text-slate-200 space-y-3 animate-fade-in leading-relaxed">
                <p className="whitespace-pre-line">{alert.description}</p>
                {alert.areas && alert.areas.length > 0 && (
                  <div className="text-xs text-slate-400">
                    <strong className="text-slate-300">Affected Zones:</strong>{' '}
                    {alert.areas.join(', ')}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
