'use client';

import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Theme = 'dark' | 'light';

interface ThemeContextValue {
  /** Current theme. */
  theme: Theme;
  /** Toggle between dark and light. */
  toggleTheme: () => void;
  /** Set a specific theme. */
  setTheme: (theme: Theme) => void;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeValue] = useLocalStorage<Theme>('atmos-theme', 'dark');

  // Sync the `dark` class on <html> whenever the theme changes.
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setThemeValue((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, [setThemeValue]);

  const setTheme = useCallback(
    (next: Theme) => {
      setThemeValue(next);
    },
    [setThemeValue],
  );

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Consumer hook
// ---------------------------------------------------------------------------

/**
 * Access the current theme and toggle / set helpers.
 *
 * Must be used inside a `<ThemeProvider>`.
 */
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within a <ThemeProvider>.');
  }
  return ctx;
}
