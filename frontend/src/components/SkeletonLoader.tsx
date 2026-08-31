'use client';

import React from 'react';

export const SkeletonLoader: React.FC = () => {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Overview Metrics Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="glass-panel p-5 rounded-2xl border border-slate-800/80 space-y-3"
          >
            <div className="h-4 w-24 bg-slate-800/60 rounded animate-shimmer" />
            <div className="h-8 w-16 bg-slate-800 rounded animate-shimmer" />
            <div className="h-3 w-32 bg-slate-800/40 rounded animate-shimmer" />
          </div>
        ))}
      </div>

      {/* Onboarding Score Card Skeleton */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800/80 space-y-6">
        <div className="h-6 w-48 bg-slate-800 rounded animate-shimmer" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-32 bg-slate-800/60 rounded animate-shimmer" />
              <div className="h-2.5 w-full bg-slate-900 rounded-full" />
            </div>
          ))}
        </div>
      </div>

      {/* AI Recommendations Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-2xl border border-slate-800/80 space-y-4">
          <div className="h-5 w-40 bg-slate-800 rounded animate-shimmer" />
          <div className="h-12 w-full bg-slate-900/60 rounded-xl" />
          <div className="h-12 w-full bg-slate-900/60 rounded-xl" />
        </div>
        <div className="glass-panel p-6 rounded-2xl border border-slate-800/80 space-y-4">
          <div className="h-5 w-40 bg-slate-800 rounded animate-shimmer" />
          <div className="h-16 w-full bg-slate-900/60 rounded-xl" />
        </div>
      </div>
    </div>
  );
};
