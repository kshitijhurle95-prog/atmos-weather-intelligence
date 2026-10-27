'use client';

import { useCallback, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** A user-saved location entry. */
export interface SavedLocation {
  id: string;
  name: string;
  region?: string;
  country: string;
  lat: number;
  lon: number;
  isDefault?: boolean;
  addedAt: string;
}

export interface UseFavoritesReturn {
  /** The current list of saved locations. */
  favorites: SavedLocation[];
  /** Add a location to favorites. Silently no-ops if limit is reached. */
  addFavorite: (location: Omit<SavedLocation, 'id' | 'addedAt'>) => void;
  /** Remove a saved location by its ID. */
  removeFavorite: (id: string) => void;
  /** Mark a specific location as the default (un-defaults all others). */
  setDefaultLocation: (id: string) => void;
  /** Get the current default location, or `null` if none is set. */
  getDefaultLocation: () => SavedLocation | null;
  /** Check whether a lat/lon pair is already in the favourites list. */
  isFavorite: (lat: number, lon: number) => boolean;
  /** Maximum number of saved locations allowed. */
  maxFavorites: number;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'atmos-favorites';
const MAX_FAVORITES = 10;
/** Tolerance for floating-point coordinate comparison (≈ 11 m). */
const COORD_EPSILON = 0.0001;

// ---------------------------------------------------------------------------
// Helper – generate a short unique ID
// ---------------------------------------------------------------------------
function generateId(): string {
  return `fav_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Manage a list of favourite / saved locations persisted in localStorage.
 */
export function useFavorites(): UseFavoritesReturn {
  const [favorites, setFavorites] = useLocalStorage<SavedLocation[]>(STORAGE_KEY, []);

  // -------------------------------------------------------------------------
  // Add
  // -------------------------------------------------------------------------
  const addFavorite = useCallback(
    (location: Omit<SavedLocation, 'id' | 'addedAt'>) => {
      setFavorites((prev) => {
        if (prev.length >= MAX_FAVORITES) {
          console.warn(`[useFavorites] Maximum of ${MAX_FAVORITES} favourites reached.`);
          return prev;
        }

        // Deduplicate by coordinates
        const exists = prev.some(
          (f) =>
            Math.abs(f.lat - location.lat) < COORD_EPSILON &&
            Math.abs(f.lon - location.lon) < COORD_EPSILON,
        );
        if (exists) return prev;

        const entry: SavedLocation = {
          ...location,
          id: generateId(),
          addedAt: new Date().toISOString(),
        };

        return [...prev, entry];
      });
    },
    [setFavorites],
  );

  // -------------------------------------------------------------------------
  // Remove
  // -------------------------------------------------------------------------
  const removeFavorite = useCallback(
    (id: string) => {
      setFavorites((prev) => prev.filter((f) => f.id !== id));
    },
    [setFavorites],
  );

  // -------------------------------------------------------------------------
  // Default location
  // -------------------------------------------------------------------------
  const setDefaultLocation = useCallback(
    (id: string) => {
      setFavorites((prev) =>
        prev.map((f) => ({
          ...f,
          isDefault: f.id === id,
        })),
      );
    },
    [setFavorites],
  );

  const getDefaultLocation = useCallback((): SavedLocation | null => {
    return favorites.find((f) => f.isDefault) ?? null;
  }, [favorites]);

  // -------------------------------------------------------------------------
  // Lookup
  // -------------------------------------------------------------------------
  const isFavorite = useCallback(
    (lat: number, lon: number): boolean => {
      return favorites.some(
        (f) =>
          Math.abs(f.lat - lat) < COORD_EPSILON &&
          Math.abs(f.lon - lon) < COORD_EPSILON,
      );
    },
    [favorites],
  );

  const maxFavorites = useMemo(() => MAX_FAVORITES, []);

  return {
    favorites,
    addFavorite,
    removeFavorite,
    setDefaultLocation,
    getDefaultLocation,
    isFavorite,
    maxFavorites,
  };
}
