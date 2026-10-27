'use client';

import React from 'react';
import {
  Settings,
  Thermometer,
  Moon,
  Sun,
  Trash2,
  Info,
  Shield,
  Star,
  Check,
  RefreshCw,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { useWeatherContext } from '@/context/WeatherContext';

export function SettingsPanel() {
  const {
    unitSystem,
    toggleUnits,
    theme,
    toggleTheme,
    favorites,
    setDefaultLocation,
  } = useWeatherContext();

  const handleClearData = () => {
    if (
      window.confirm(
        'Are you sure you want to clear your saved locations and reset preferences to defaults?',
      )
    ) {
      localStorage.removeItem('atmos-favorites');
      localStorage.removeItem('atmos-units');
      localStorage.removeItem('atmos-theme');
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Card className="space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-white/[0.08]">
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Platform Configuration & Preferences
            </h2>
            <p className="text-xs text-slate-400">
              Customize measurement scales, atmospheric presentation, and regional telemetry
            </p>
          </div>
        </div>

        {/* Measurement Units */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Thermometer className="w-4 h-4 text-sky-400" />
            <h3 className="text-sm font-semibold text-white">Measurement Standard</h3>
          </div>
          <p className="text-xs text-slate-400">
            Select unit standard for temperatures, wind velocity, barometric pressure, and precipitation.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <button
              onClick={() => {
                if (unitSystem !== 'metric') toggleUnits();
              }}
              className={`p-4 rounded-xl border text-left flex items-start justify-between transition ${
                unitSystem === 'metric'
                  ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg shadow-blue-500/10'
                  : 'bg-white/[0.03] border-white/10 text-slate-300 hover:bg-white/[0.06]'
              }`}
            >
              <div>
                <span className="font-bold text-sm block mb-1">
                  Metric (International Standard)
                </span>
                <span className="text-xs text-slate-400 block">
                  Celsius (°C) • km/h • Millimetres (mm) • hPa
                </span>
              </div>
              {unitSystem === 'metric' && (
                <Check className="w-5 h-5 text-sky-400 flex-shrink-0" />
              )}
            </button>

            <button
              onClick={() => {
                if (unitSystem !== 'imperial') toggleUnits();
              }}
              className={`p-4 rounded-xl border text-left flex items-start justify-between transition ${
                unitSystem === 'imperial'
                  ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg shadow-blue-500/10'
                  : 'bg-white/[0.03] border-white/10 text-slate-300 hover:bg-white/[0.06]'
              }`}
            >
              <div>
                <span className="font-bold text-sm block mb-1">
                  Imperial (US Standard)
                </span>
                <span className="text-xs text-slate-400 block">
                  Fahrenheit (°F) • mph • Inches (in) • inHg
                </span>
              </div>
              {unitSystem === 'imperial' && (
                <Check className="w-5 h-5 text-sky-400 flex-shrink-0" />
              )}
            </button>
          </div>
        </div>

        {/* Visual Appearance */}
        <div className="space-y-3 pt-4 border-t border-white/[0.08]">
          <div className="flex items-center gap-2">
            {theme === 'dark' ? (
              <Moon className="w-4 h-4 text-indigo-400" />
            ) : (
              <Sun className="w-4 h-4 text-amber-400" />
            )}
            <h3 className="text-sm font-semibold text-white">Visual Appearance Theme</h3>
          </div>
          <p className="text-xs text-slate-400">
            Atmos is crafted with deep obsidian hues for high contrast readability and visual elegance.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <button
              onClick={() => {
                if (theme !== 'dark') toggleTheme();
              }}
              className={`p-4 rounded-xl border text-left flex items-center justify-between transition ${
                theme === 'dark'
                  ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg shadow-blue-500/10'
                  : 'bg-white/[0.03] border-white/10 text-slate-300 hover:bg-white/[0.06]'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-black/40 text-indigo-400">
                  <Moon className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-sm block">Dark Obsidian (Default)</span>
                  <span className="text-xs text-slate-400">Optimal for low-light environments</span>
                </div>
              </div>
              {theme === 'dark' && <Check className="w-5 h-5 text-sky-400" />}
            </button>

            <button
              onClick={() => {
                if (theme !== 'light') toggleTheme();
              }}
              className={`p-4 rounded-xl border text-left flex items-center justify-between transition ${
                theme === 'light'
                  ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg shadow-blue-500/10'
                  : 'bg-white/[0.03] border-white/10 text-slate-300 hover:bg-white/[0.06]'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white/10 text-amber-400">
                  <Sun className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-sm block">Daylight Radiance</span>
                  <span className="text-xs text-slate-400">High ambient luminosity contrast</span>
                </div>
              </div>
              {theme === 'light' && <Check className="w-5 h-5 text-sky-400" />}
            </button>
          </div>
        </div>

        {/* Default Location Picker */}
        {favorites.length > 0 && (
          <div className="space-y-3 pt-4 border-t border-white/[0.08]">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-semibold text-white">Default Launch City</h3>
            </div>
            <p className="text-xs text-slate-400">
              Select which pinned location automatically loads when Atmos opens.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {favorites.map((fav) => (
                <button
                  key={fav.id}
                  onClick={() => setDefaultLocation(fav.id)}
                  className={`px-3 py-2.5 rounded-xl border text-left flex items-center justify-between transition text-xs ${
                    fav.isDefault
                      ? 'bg-amber-500/15 border-amber-500/40 text-amber-200'
                      : 'bg-white/[0.02] border-white/10 text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <span className="font-semibold">{fav.name}, {fav.country}</span>
                  {fav.isDefault ? (
                    <span className="font-bold text-amber-400">Active Default</span>
                  ) : (
                    <span className="text-slate-500">Set Default</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Data Reset */}
        <div className="space-y-3 pt-4 border-t border-white/[0.08]">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">Reset Local Data</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Clears all pinned favorites, cached unit choices, and telemetry caches stored in browser local storage.
              </p>
            </div>
            <button
              onClick={handleClearData}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-semibold transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Reset All
            </button>
          </div>
        </div>
      </Card>

      {/* About Atmos & Disclosures */}
      <Card className="space-y-4 bg-white/[0.02]">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-blue-400" />
          <h3 className="text-sm font-semibold text-white">About Atmos Platform</h3>
        </div>

        <div className="text-xs text-slate-400 space-y-2 leading-relaxed">
          <p>
            <strong>Atmos Weather Intelligence Platform (v1.0.0)</strong> delivers precision meteorological telemetry, multi-day forecasting, air pollution indices, and automated situational analytics.
          </p>
          <p>
            <strong>Provider Telemetry:</strong> Live observation grids sourced via OpenWeather API (Current 2.5, Forecast 2.5, Geocoding 1.0, Air Pollution 2.5). Maps rendered via CartoDB & OpenStreetMap tile servers.
          </p>
          <p>
            <strong>Security & Privacy:</strong> Geolocation coordinates are processed client-side upon explicit consent only. No personal location history is transmitted to unverified third parties. All provider tokens remain strictly encrypted on the server environment.
          </p>
        </div>
      </Card>
    </div>
  );
}
