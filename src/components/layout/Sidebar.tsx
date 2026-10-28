'use client';

import React from 'react';
import {
  LayoutDashboard,
  Clock,
  Calendar,
  Map,
  Wind,
  Bookmark,
  Settings,
} from 'lucide-react';
import { useWeatherContext } from '@/context/WeatherContext';

export type NavTab =
  | 'overview'
  | 'hourly'
  | 'forecast'
  | 'maps'
  | 'air-quality'
  | 'saved'
  | 'settings';

export interface SidebarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const { weatherData } = useWeatherContext();
  const isLive = weatherData?.source?.includes('Live');

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'hourly', label: 'Hourly Forecast', icon: Clock },
    { id: 'forecast', label: '7-Day Forecast', icon: Calendar },
    { id: 'maps', label: 'Weather Maps', icon: Map },
    { id: 'air-quality', label: 'Air Quality', icon: Wind },
    { id: 'saved', label: 'Saved Locations', icon: Bookmark },
    { id: 'settings', label: 'Settings', icon: Settings },
  ] as const;

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-[#0B1220]/95 border-r border-white/[0.08] p-4 flex-shrink-0 min-h-[calc(100vh-5rem)]">
      <div className="space-y-1.5 flex-1">
        <div className="px-3 py-2 text-[11px] font-semibold text-slate-400 tracking-wider uppercase">
          Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30 shadow-md shadow-blue-500/5'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
              }`}
            >
              <Icon
                className={`w-4 h-4 flex-shrink-0 transition-colors ${
                  isActive ? 'text-sky-400' : 'text-slate-500'
                }`}
              />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* System Status info at bottom */}
      <div className="pt-4 border-t border-white/[0.08] px-3">
        <div className="flex items-center gap-2 mb-1.5">
          <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400 animate-ping'}`} />
          <span className="text-xs font-medium text-slate-300">
            {isLive ? 'OpenWeather Live' : 'Telemetry Fallback'}
          </span>
        </div>
        <p className="text-[11px] text-slate-400 leading-tight">
          {isLive ? 'Direct OpenWeather stream active.' : 'Key propagating • Telemetry mode active.'}
        </p>
      </div>
    </aside>
  );
}
