'use client';

import React, { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Sidebar, type NavTab } from '@/components/layout/Sidebar';
import { MobileNav } from '@/components/layout/MobileNav';
import { WeatherHero } from '@/components/weather/WeatherHero';
import { WeatherMetrics } from '@/components/weather/WeatherMetrics';
import { HourlyForecast } from '@/components/weather/HourlyForecast';
import { DailyForecast } from '@/components/weather/DailyForecast';
import { WeatherInsights } from '@/components/weather/WeatherInsights';
import { ActivityAdvice } from '@/components/weather/ActivityAdvice';
import { AirQuality } from '@/components/weather/AirQuality';
import { WeatherMap } from '@/components/weather/WeatherMap';
import { WeatherAlerts } from '@/components/weather/WeatherAlerts';
import { SavedLocations } from '@/components/weather/SavedLocations';
import { SettingsPanel } from '@/components/settings/SettingsPanel';
import { DashboardSkeleton } from '@/components/ui/Skeleton';
import { ErrorDisplay } from '@/components/ui/ErrorDisplay';
import { useWeatherContext } from '@/context/WeatherContext';
import { Sparkles, Radio } from 'lucide-react';

const QUICK_CITIES = [
  { name: 'New Delhi', country: 'IN', lat: 28.6139, lon: 77.209 },
  { name: 'Mumbai', country: 'IN', lat: 19.076, lon: 72.8777 },
  { name: 'Bengaluru', country: 'IN', lat: 12.9716, lon: 77.5946 },
  { name: 'Pune', country: 'IN', lat: 18.5204, lon: 73.8567 },
  { name: 'Kolkata', country: 'IN', lat: 22.5726, lon: 88.3639 },
  { name: 'London', country: 'GB', lat: 51.5074, lon: -0.1278 },
  { name: 'New York', country: 'US', lat: 40.7128, lon: -74.006 },
  { name: 'Tokyo', country: 'JP', lat: 35.6762, lon: 139.6503 },
];

export default function AtmosDashboard() {
  const [activeTab, setActiveTab] = useState<NavTab>('overview');

  const {
    weatherData,
    airQuality,
    isLoading,
    error,
    refreshWeather,
    unitSystem,
    fetchWeatherForLocation,
  } = useWeatherContext();

  return (
    <div className="min-h-screen flex flex-col bg-[#0B1220] text-[#F8FAFC]">
      {/* Top Header */}
      <Header />

      <div className="flex-1 flex max-w-[1600px] w-full mx-auto">
        {/* Desktop Sidebar Navigation */}
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 lg:pb-12 overflow-y-auto">
          {/* Loading Skeleton */}
          {isLoading && !weatherData ? (
            <DashboardSkeleton />
          ) : error && !weatherData ? (
            <ErrorDisplay
              message={error}
              code={error.includes('not configured') || error.includes('API key') ? 'API_KEY_MISSING' : undefined}
              onRetry={refreshWeather}
            />
          ) : weatherData ? (
            <div className="space-y-6 sm:space-y-8 animate-fade-in">
              {/* Telemetry Stream Status & Quick Station Bar */}
              <div className="space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${weatherData.source.includes('Live') ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                      <span className={`relative inline-flex rounded-full h-2 w-2 ${weatherData.source.includes('Live') ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                    </span>
                    <span className="font-mono text-slate-300 font-medium flex items-center gap-1.5">
                      <Radio className="w-3.5 h-3.5 text-sky-400" />
                      {weatherData.source.includes('Live') ? 'OpenWeather Live v2.5' : 'Key Propagating • Telemetry Fallback Stream'}
                    </span>
                    <span className="text-slate-600 hidden sm:inline">•</span>
                    <span className="text-slate-400 font-mono text-[11px] hidden sm:inline">
                      Key: 4b6061...945a
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    Station: {weatherData.location.name} ({weatherData.location.latitude.toFixed(2)}°, {weatherData.location.longitude.toFixed(2)}°)
                  </div>
                </div>

                {/* Quick Station Exploration Pills */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
                  <span className="text-slate-400 font-medium whitespace-nowrap flex items-center gap-1.5 mr-1">
                    <Sparkles className="w-3.5 h-3.5 text-sky-400" /> Stations:
                  </span>
                  {QUICK_CITIES.map((c) => {
                    const isSelected = weatherData?.location.name.toLowerCase().includes(c.name.toLowerCase());
                    return (
                      <button
                        key={c.name}
                        onClick={() => fetchWeatherForLocation(c.lat, c.lon, c.name, c.country)}
                        className={`px-3 py-1.5 rounded-xl border transition whitespace-nowrap active:scale-95 ${
                          isSelected
                            ? 'bg-blue-600/30 text-sky-200 border-blue-500/50 shadow-md shadow-blue-500/10 font-semibold'
                            : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        {c.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* OVERVIEW TAB */}
              {activeTab === 'overview' && (
                <>
                  {/* Weather Alerts if any */}
                  {weatherData.alerts && weatherData.alerts.length > 0 && (
                    <WeatherAlerts alerts={weatherData.alerts} />
                  )}

                  {/* Hero Summary Card */}
                  <WeatherHero
                    weather={weatherData}
                    unitSystem={unitSystem}
                  />

                  {/* Atmospheric Key Metrics Grid */}
                  <WeatherMetrics
                    current={weatherData.current}
                    unitSystem={unitSystem}
                    precipProbability={
                      weatherData.daily && weatherData.daily.length > 0
                        ? weatherData.daily[0].precipProbability
                        : undefined
                    }
                  />

                  {/* 24-Hour Timeline + Trend Chart */}
                  <HourlyForecast
                    hourly={weatherData.hourly}
                    unitSystem={unitSystem}
                  />

                  {/* 7-Day / Multi-Day Forecast */}
                  <DailyForecast
                    daily={weatherData.daily}
                    unitSystem={unitSystem}
                  />

                  {/* Weather Insights (Deterministic AI-like intelligence) */}
                  <WeatherInsights weather={weatherData} />

                  {/* Activity-Based Recommendations (Plan Your Day) */}
                  <ActivityAdvice weather={weatherData} />

                  {/* Air Quality Index Section */}
                  <AirQuality airQuality={airQuality} />

                  {/* Regional Weather Radar & Map */}
                  <WeatherMap
                    lat={weatherData.location.latitude}
                    lon={weatherData.location.longitude}
                    cityName={weatherData.location.name}
                  />
                </>
              )}

              {/* HOURLY TAB */}
              {activeTab === 'hourly' && (
                <div className="space-y-6">
                  <HourlyForecast
                    hourly={weatherData.hourly}
                    unitSystem={unitSystem}
                  />
                </div>
              )}

              {/* 7-DAY FORECAST TAB */}
              {activeTab === 'forecast' && (
                <div className="space-y-6">
                  <DailyForecast
                    daily={weatherData.daily}
                    unitSystem={unitSystem}
                  />
                </div>
              )}

              {/* WEATHER MAPS TAB */}
              {activeTab === 'maps' && (
                <div className="space-y-6">
                  <WeatherMap
                    lat={weatherData.location.latitude}
                    lon={weatherData.location.longitude}
                    cityName={weatherData.location.name}
                  />
                </div>
              )}

              {/* AIR QUALITY TAB */}
              {activeTab === 'air-quality' && (
                <div className="space-y-6">
                  <AirQuality airQuality={airQuality} />
                </div>
              )}

              {/* SAVED LOCATIONS TAB */}
              {activeTab === 'saved' && (
                <div className="space-y-6">
                  <SavedLocations />
                </div>
              )}

              {/* SETTINGS TAB */}
              {activeTab === 'settings' && (
                <div className="space-y-6">
                  <SettingsPanel />
                </div>
              )}
            </div>
          ) : null}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <MobileNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
