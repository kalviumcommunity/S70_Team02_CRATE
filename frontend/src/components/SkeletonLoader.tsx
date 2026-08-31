import React from 'react';

export const SkeletonLoader: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Metrics Row Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-32 rounded-2xl bg-slate-900/70 border border-slate-800 p-5 space-y-3"
          >
            <div className="h-4 w-1/2 bg-slate-800 rounded animate-shimmer" />
            <div className="h-8 w-3/4 bg-slate-800 rounded animate-shimmer" />
            <div className="h-3 w-2/3 bg-slate-800/60 rounded animate-shimmer" />
          </div>
        ))}
      </div>

      {/* Feature 1 Skeleton */}
      <div className="h-72 rounded-2xl bg-slate-900/70 border border-slate-800 p-6 space-y-4">
        <div className="h-6 w-1/3 bg-slate-800 rounded animate-shimmer" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-4 h-48 bg-slate-800/60 rounded-xl animate-shimmer" />
          <div className="lg:col-span-8 space-y-3">
            {[1, 2, 3, 4].map((j) => (
              <div key={j} className="h-10 bg-slate-800/60 rounded-lg animate-shimmer" />
            ))}
          </div>
        </div>
      </div>

      {/* Feature 2 Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-64 rounded-2xl bg-slate-900/70 border border-slate-800 p-6 space-y-3">
          <div className="h-6 w-1/2 bg-slate-800 rounded animate-shimmer" />
          <div className="h-16 bg-slate-800/60 rounded-xl animate-shimmer" />
          <div className="h-16 bg-slate-800/60 rounded-xl animate-shimmer" />
        </div>
        <div className="h-64 rounded-2xl bg-slate-900/70 border border-slate-800 p-6 space-y-3">
          <div className="h-6 w-1/2 bg-slate-800 rounded animate-shimmer" />
          <div className="h-16 bg-slate-800/60 rounded-xl animate-shimmer" />
          <div className="h-16 bg-slate-800/60 rounded-xl animate-shimmer" />
        </div>
      </div>

      {/* Feature 3 Skeleton */}
      <div className="h-64 rounded-2xl bg-slate-900/70 border border-slate-800 p-6 space-y-4">
        <div className="h-6 w-1/3 bg-slate-800 rounded animate-shimmer" />
        <div className="h-40 bg-slate-800/60 rounded-xl animate-shimmer" />
      </div>
    </div>
  );
};
