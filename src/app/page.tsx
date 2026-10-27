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

export default function AtmosDashboard() {
  const [activeTab, setActiveTab] = useState<NavTab>('overview');

  const {
    weatherData,
    airQuality,
    isLoading,
    error,
    refreshWeather,
    unitSystem,
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
              {/* If an error occurred during refresh, show banner */}
              {error && (
                <ErrorDisplay
                  variant="banner"
                  message={`Telemetry sync notice: ${error}`}
                  onRetry={refreshWeather}
                />
              )}

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
                  <SavedLocations
                    onSelectLocation={() => setActiveTab('overview')}
                  />
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
