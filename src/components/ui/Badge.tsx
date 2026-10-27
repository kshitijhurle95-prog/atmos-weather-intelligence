'use client';

import React from 'react';

export type BadgeVariant =
  | 'default'
  | 'accent'
  | 'sunny'
  | 'rain'
  | 'warning'
  | 'danger'
  | 'success'
  | 'outline';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
  size?: 'sm' | 'md';
}

export function Badge({
  children,
  variant = 'default',
  className = '',
  size = 'md',
}: BadgeProps) {
  const variantStyles: Record<BadgeVariant, string> = {
    default: 'bg-white/10 text-slate-200 border-white/10',
    accent: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    sunny: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    rain: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
    warning: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    danger: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    success: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    outline: 'bg-transparent text-slate-300 border-white/20',
  };

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs sm:text-sm px-2.5 py-1',
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border backdrop-blur-sm ${variantStyles[variant]} ${sizeStyles} ${className}`}
    >
      {children}
    </span>
  );
}
