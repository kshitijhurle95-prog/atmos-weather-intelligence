'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Cloud,
  Search,
  MapPin,
  RefreshCw,
  Sun,
  Moon,
  Clock,
  Loader2,
  X,
  Compass,
} from 'lucide-react';
import { useWeatherContext } from '@/context/WeatherContext';
import { useGeolocation } from '@/hooks/useGeolocation';
import type { GeocodingResult } from '@/types/weather';

export function Header() {
  const {
    currentLocation,
    weatherData,
    isLoading,
    refreshWeather,
    unitSystem,
    toggleUnits,
    theme,
    toggleTheme,
    searchResults,
    isSearching,
    searchLocations,
    searchAndSelect,
    clearSearchResults,
    fetchWeatherForLocation,
  } = useWeatherContext();

  const { getCurrentPosition, isLocating, locationError } = useGeolocation();

  const [query, setQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Close search dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    setSelectedIndex(-1);
    if (val.trim().length >= 2) {
      searchLocations(val);
      setIsDropdownOpen(true);
    } else {
      clearSearchResults();
      setIsDropdownOpen(false);
    }
  };

  const handleSelectResult = async (result: GeocodingResult) => {
    setIsDropdownOpen(false);
    setQuery('');
    await searchAndSelect(result);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isDropdownOpen || searchResults.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < searchResults.length - 1 ? prev + 1 : prev,
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < searchResults.length) {
        handleSelectResult(searchResults[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsDropdownOpen(false);
    }
  };

  const handleUseMyLocation = async () => {
    try {
      const coords = await getCurrentPosition();
      await fetchWeatherForLocation(coords.lat, coords.lon, 'Current Location');
    } catch {
      // Error handled by useGeolocation
    }
  };

  // Format updated timestamp
  const updatedTime = weatherData?.updatedAt
    ? new Date(weatherData.updatedAt).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#0B1220]/85 dark:bg-[#0B1220]/85 border-b border-white/[0.08] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-sky-500 to-indigo-500 p-0.5 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <div className="w-full h-full bg-[#0B1220] rounded-[10px] flex items-center justify-center">
              <Cloud className="w-5 h-5 text-sky-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg sm:text-xl tracking-tight text-white font-sans">
                ATMOS
              </span>
              <span className="hidden sm:inline-block text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
              Weather Intelligence Platform
            </p>
          </div>
        </div>

        {/* Global Search with Live Autocomplete */}
        <div
          ref={searchContainerRef}
          className="relative flex-1 max-w-md mx-2 sm:mx-4"
        >
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                if (searchResults.length > 0) setIsDropdownOpen(true);
              }}
              placeholder="Search city, state or country..."
              className="w-full pl-10 pr-9 py-2 sm:py-2.5 rounded-xl bg-[#17243A]/90 border border-white/10 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-inner"
            />
            {isSearching ? (
              <Loader2 className="absolute right-3 w-4 h-4 text-blue-400 animate-spin" />
            ) : query ? (
              <button
                onClick={() => {
                  setQuery('');
                  clearSearchResults();
                  setIsDropdownOpen(false);
                }}
                className="absolute right-3 p-0.5 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : null}
          </div>

          {/* Autocomplete Dropdown */}
          {isDropdownOpen && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[#17243A] border border-white/10 rounded-xl shadow-2xl shadow-black/50 overflow-hidden z-50 max-h-72 overflow-y-auto">
              <div className="p-1.5 space-y-0.5">
                {searchResults.map((result, idx) => (
                  <button
                    key={`${result.lat}-${result.lon}-${idx}`}
                    onClick={() => handleSelectResult(result)}
                    className={`w-full text-left px-3.5 py-2.5 rounded-lg text-sm flex items-center justify-between transition-colors ${
                      idx === selectedIndex
                        ? 'bg-blue-600/30 text-white border border-blue-500/30'
                        : 'text-slate-200 hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Compass className="w-4 h-4 text-sky-400 flex-shrink-0" />
                      <div className="truncate">
                        <span className="font-semibold text-white">
                          {result.name}
                        </span>
                        {result.region && (
                          <span className="text-slate-400 text-xs ml-1.5">
                            {result.region},
                          </span>
                        )}
                        <span className="text-slate-400 text-xs ml-1.5">
                          {result.country}
                        </span>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400 flex-shrink-0 ml-2">
                      {result.lat.toFixed(2)}°, {result.lon.toFixed(2)}°
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Use My Location button */}
          <button
            onClick={handleUseMyLocation}
            disabled={isLocating}
            title={locationError || 'Use Current Location'}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/5 text-xs font-medium transition active:scale-95 disabled:opacity-50"
          >
            {isLocating ? (
              <Loader2 className="w-3.5 h-3.5 text-blue-400 animate-spin" />
            ) : (
              <MapPin className="w-3.5 h-3.5 text-sky-400" />
            )}
            <span className="hidden md:inline">My Location</span>
          </button>

          {/* Unit Toggle (°C / °F) */}
          <button
            onClick={toggleUnits}
            title={`Switch to ${unitSystem === 'metric' ? 'Imperial (°F)' : 'Metric (°C)'}`}
            className="px-2.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/5 text-xs font-semibold font-mono transition active:scale-95"
          >
            {unitSystem === 'metric' ? '°C' : '°F'}
          </button>

          {/* Refresh button */}
          <button
            onClick={refreshWeather}
            disabled={isLoading}
            title="Refresh weather data"
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/5 transition active:scale-95 disabled:opacity-50"
          >
            <RefreshCw
              className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-400' : ''}`}
            />
          </button>

          {/* Theme Toggle (Dark / Light) */}
          <button
            onClick={toggleTheme}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/5 transition active:scale-95"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-300" />
            )}
          </button>

          {/* Last updated tag */}
          {updatedTime && (
            <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-slate-400 pl-2 border-l border-white/10">
              <Clock className="w-3 h-3 text-slate-500" />
              <span>{updatedTime}</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
