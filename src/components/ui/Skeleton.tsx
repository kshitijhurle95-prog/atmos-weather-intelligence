'use client';

import React from 'react';

export function SkeletonText({
  className = '',
  width = 'w-full',
  height = 'h-4',
}: {
  className?: string;
  width?: string;
  height?: string;
}) {
  return (
    <div
      className={`animate-pulse bg-white/10 rounded-md ${width} ${height} ${className}`}
    />
  );
}

export function SkeletonCircle({
  size = 'w-10 h-10',
  className = '',
}: {
  size?: string;
  className?: string;
}) {
  return (
    <div
      className={`animate-pulse bg-white/10 rounded-full ${size} ${className}`}
    />
  );
}

export function SkeletonCard({
  className = '',
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-2xl border border-white/5 bg-[#17243A]/60 p-6 backdrop-blur-md animate-pulse ${className}`}
    >
      {children || (
        <div className="space-y-4">
          <SkeletonText width="w-1/3" height="h-5" />
          <SkeletonText width="w-2/3" height="h-8" />
          <SkeletonText width="w-full" height="h-4" />
        </div>
      )}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Hero skeleton */}
      <div className="h-64 sm:h-72 rounded-2xl bg-[#17243A]/60 border border-white/5 p-6 flex flex-col justify-between">
        <div className="space-y-2">
          <SkeletonText width="w-48" height="h-6" />
          <SkeletonText width="w-32" height="h-4" />
        </div>
        <div className="flex items-end justify-between">
          <div className="space-y-2">
            <SkeletonText width="w-28" height="h-16" />
            <SkeletonText width="w-36" height="h-5" />
          </div>
          <SkeletonCircle size="w-20 h-20" />
        </div>
      </div>

      {/* Metrics grid skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div
            key={i}
            className="h-28 rounded-2xl bg-[#17243A]/60 border border-white/5 p-4 flex flex-col justify-between"
          >
            <div className="flex justify-between items-center">
              <SkeletonText width="w-16" height="h-4" />
              <SkeletonCircle size="w-6 h-6" />
            </div>
            <SkeletonText width="w-20" height="h-7" />
          </div>
        ))}
      </div>

      {/* Hourly forecast skeleton */}
      <div className="h-44 rounded-2xl bg-[#17243A]/60 border border-white/5 p-4 flex flex-col gap-4">
        <SkeletonText width="w-32" height="h-5" />
        <div className="flex gap-4 overflow-hidden">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="flex-shrink-0 w-20 h-24 rounded-xl bg-white/5 p-2 flex flex-col items-center justify-between"
            >
              <SkeletonText width="w-10" height="h-3" />
              <SkeletonCircle size="w-8 h-8" />
              <SkeletonText width="w-8" height="h-4" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
