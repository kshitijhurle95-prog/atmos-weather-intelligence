'use client';

import { useState, useCallback, useEffect } from 'react';

/**
 * Type-safe localStorage hook with SSR safety.
 *
 * Persists state to `localStorage` under the given key, falling back to
 * `initialValue` when running on the server or when the stored data is
 * corrupt / missing.
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: T | ((prev: T) => T)) => void] {
  // ---------------------------------------------------------------------------
  // Lazy initialiser – reads from storage only once
  // ---------------------------------------------------------------------------
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;

    try {
      const item = window.localStorage.getItem(key);
      return item !== null ? (JSON.parse(item) as T) : initialValue;
    } catch {
      // Corrupt JSON or quota error – fall back silently
      console.warn(`[useLocalStorage] Failed to parse key "${key}", using initial value.`);
      return initialValue;
    }
  });

  // ---------------------------------------------------------------------------
  // Setter – accepts a value or an updater function, mirrors React setState API
  // ---------------------------------------------------------------------------
  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue((prev) => {
        const nextValue = value instanceof Function ? value(prev) : value;

        if (typeof window !== 'undefined') {
          try {
            window.localStorage.setItem(key, JSON.stringify(nextValue));
          } catch (err) {
            console.error(`[useLocalStorage] Failed to set key "${key}":`, err);
          }
        }

        return nextValue;
      });
    },
    [key],
  );

  // ---------------------------------------------------------------------------
  // Sync across tabs – listen to storage events from other windows
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key !== key) return;

      try {
        const newValue = e.newValue !== null ? (JSON.parse(e.newValue) as T) : initialValue;
        setStoredValue(newValue);
      } catch {
        setStoredValue(initialValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, initialValue]);

  return [storedValue, setValue];
}
