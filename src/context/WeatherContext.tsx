'use client';

import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import type {
  WeatherData,
  AirQualityData,
  GeocodingResult,
  UnitSystem,
} from '@/types/weather';
import { useWeather } from '@/hooks/useWeather';
import { useGeocoding } from '@/hooks/useGeocoding';
import { useFavorites, type SavedLocation } from '@/hooks/useFavorites';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useTheme, type Theme } from './ThemeContext';

// ---------------------------------------------------------------------------
// Default fallback location – Delhi, India
// ---------------------------------------------------------------------------

const DELHI_LOCATION = {
  name: 'New Delhi',
  lat: 28.6139,
  lon: 77.209,
  country: 'IN',
};

// ---------------------------------------------------------------------------
// Context value type
// ---------------------------------------------------------------------------

export interface WeatherContextValue {
  // Data -----------------------------------------------------------------
  weatherData: WeatherData | null;
  airQuality: AirQualityData | null;
  currentLocation: { name: string; lat: number; lon: number; country: string } | null;

  // Loading / error -------------------------------------------------------
  isLoading: boolean;
  error: string | null;

  // Search ----------------------------------------------------------------
  searchResults: GeocodingResult[];
  isSearching: boolean;
  searchError: string | null;
  searchLocations: (query: string) => Promise<void>;
  clearSearchResults: () => void;

  // Actions ---------------------------------------------------------------
  fetchWeatherForLocation: (lat: number, lon: number, name?: string, country?: string) => Promise<void>;
  searchAndSelect: (result: GeocodingResult) => Promise<void>;
  refreshWeather: () => Promise<void>;

  // Settings --------------------------------------------------------------
  unitSystem: UnitSystem;
  toggleUnits: () => void;
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;

  // Favorites -------------------------------------------------------------
  favorites: SavedLocation[];
  addFavorite: (location: Omit<SavedLocation, 'id' | 'addedAt'>) => void;
  removeFavorite: (id: string) => void;
  setDefaultLocation: (id: string) => void;
  isFavorite: (lat: number, lon: number) => boolean;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const WeatherContext = createContext<WeatherContextValue | undefined>(undefined);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function WeatherProvider({ children }: { children: ReactNode }) {
  // Compose lower-level hooks
  const weather = useWeather();
  const geocoding = useGeocoding();
  const favs = useFavorites();
  const themeCtx = useTheme();

  const [unitSystem, setUnitSystem] = useLocalStorage<UnitSystem>('atmos-units', 'metric');
  const [currentLocation, setCurrentLocation] = useState<{
    name: string;
    lat: number;
    lon: number;
    country: string;
  } | null>(null);

  // Track whether the initial load has been triggered
  const [initialised, setInitialised] = useState(false);

  // -----------------------------------------------------------------------
  // fetchWeatherForLocation
  // -----------------------------------------------------------------------
  const fetchWeatherForLocation = useCallback(
    async (lat: number, lon: number, name?: string, country?: string) => {
      setCurrentLocation({
        name: name ?? 'Unknown',
        lat,
        lon,
        country: country ?? '',
      });
      await Promise.all([
        weather.fetchWeather(lat, lon),
        weather.fetchAirQuality(lat, lon),
      ]);
    },
    [weather],
  );

  // -----------------------------------------------------------------------
  // searchAndSelect – pick a geocoding result and fetch its weather
  // -----------------------------------------------------------------------
  const searchAndSelect = useCallback(
    async (result: GeocodingResult) => {
      geocoding.clearResults();
      await fetchWeatherForLocation(
        result.lat,
        result.lon,
        result.name,
        result.country,
      );
    },
    [geocoding, fetchWeatherForLocation],
  );

  // -----------------------------------------------------------------------
  // toggleUnits
  // -----------------------------------------------------------------------
  const toggleUnits = useCallback(() => {
    setUnitSystem((prev) => (prev === 'metric' ? 'imperial' : 'metric'));
  }, [setUnitSystem]);

  // -----------------------------------------------------------------------
  // On mount: load default favourite or fallback to Delhi
  // -----------------------------------------------------------------------
  useEffect(() => {
    if (initialised) return;
    setInitialised(true);

    const defaultFav = favs.getDefaultLocation();
    if (defaultFav) {
      fetchWeatherForLocation(
        defaultFav.lat,
        defaultFav.lon,
        defaultFav.name,
        defaultFav.country,
      );
    } else {
      fetchWeatherForLocation(
        DELHI_LOCATION.lat,
        DELHI_LOCATION.lon,
        DELHI_LOCATION.name,
        DELHI_LOCATION.country,
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // -----------------------------------------------------------------------
  // Assemble context value
  // -----------------------------------------------------------------------
  const value: WeatherContextValue = {
    // Data
    weatherData: weather.weatherData,
    airQuality: weather.airQuality,
    currentLocation,

    // Loading / error
    isLoading: weather.isLoading,
    error: weather.error,

    // Search
    searchResults: geocoding.results,
    isSearching: geocoding.isSearching,
    searchError: geocoding.searchError,
    searchLocations: geocoding.searchLocations,
    clearSearchResults: geocoding.clearResults,

    // Actions
    fetchWeatherForLocation,
    searchAndSelect,
    refreshWeather: weather.refreshWeather,

    // Settings
    unitSystem,
    toggleUnits,
    theme: themeCtx.theme,
    setTheme: themeCtx.setTheme,
    toggleTheme: themeCtx.toggleTheme,

    // Favorites
    favorites: favs.favorites,
    addFavorite: favs.addFavorite,
    removeFavorite: favs.removeFavorite,
    setDefaultLocation: favs.setDefaultLocation,
    isFavorite: favs.isFavorite,
  };

  return (
    <WeatherContext.Provider value={value}>
      {children}
    </WeatherContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Consumer hook
// ---------------------------------------------------------------------------

/**
 * Access the global weather state and actions.
 *
 * Must be used inside `<WeatherProvider>` (which itself must be inside
 * `<ThemeProvider>`).
 */
export function useWeatherContext(): WeatherContextValue {
  const ctx = useContext(WeatherContext);
  if (!ctx) {
    throw new Error('useWeatherContext must be used within a <WeatherProvider>.');
  }
  return ctx;
}
