'use client';

import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
}

export function Card({
  children,
  className = '',
  padding = 'md',
  hover = false,
  ...props
}: CardProps) {
  const paddingClasses = {
    none: 'p-0',
    sm: 'p-3 sm:p-4',
    md: 'p-4 sm:p-6',
    lg: 'p-6 sm:p-8',
  }[padding];

  return (
    <div
      className={`rounded-2xl border transition-all duration-200
        bg-[#17243A]/90 dark:bg-[#17243A]/90 
        border-white/[0.08] dark:border-white/[0.08] 
        shadow-lg shadow-black/20 
        backdrop-blur-md 
        text-[#F8FAFC]
        ${hover ? 'hover:border-blue-500/30 hover:bg-[#1E2D47]/90 hover:shadow-xl' : ''}
        ${paddingClasses} 
        ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
