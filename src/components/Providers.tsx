'use client';

import React from 'react';
import { ThemeProvider } from '@/context/ThemeContext';
import { WeatherProvider } from '@/context/WeatherContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <WeatherProvider>{children}</WeatherProvider>
    </ThemeProvider>
  );
}
