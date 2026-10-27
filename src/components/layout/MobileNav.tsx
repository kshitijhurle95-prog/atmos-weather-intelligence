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
import type { NavTab } from './Sidebar';

export interface MobileNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

export function MobileNav({ activeTab, onTabChange }: MobileNavProps) {
  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'hourly', label: 'Hourly', icon: Clock },
    { id: 'forecast', label: '7-Day', icon: Calendar },
    { id: 'maps', label: 'Maps', icon: Map },
    { id: 'air-quality', label: 'AQI', icon: Wind },
    { id: 'saved', label: 'Saved', icon: Bookmark },
    { id: 'settings', label: 'Settings', icon: Settings },
  ] as const;

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0B1220]/95 backdrop-blur-xl border-t border-white/[0.08] px-2 py-1.5 shadow-2xl">
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-lg text-[10px] font-medium transition-colors ${
                isActive
                  ? 'text-sky-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon
                className={`w-5 h-5 mb-0.5 ${
                  isActive ? 'text-sky-400' : 'text-slate-400'
                }`}
              />
              <span className="truncate max-w-[48px]">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
