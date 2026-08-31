'use client';

import React from 'react';
import { OverviewMetrics as OverviewMetricsType } from '@/services/api';
import { Users, UserPlus, RotateCcw, TrendingUp } from 'lucide-react';

interface OverviewMetricsProps {
  metrics: OverviewMetricsType;
}

export const OverviewMetrics: React.FC<OverviewMetricsProps> = ({ metrics }) => {
  const cards = [
    {
      title: 'Total Contributors',
      value: metrics.totalContributors.toLocaleString(),
      subtitle: 'All-time active committers',
      icon: Users,
      iconBg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      borderGlow: 'hover:border-indigo-500/40',
    },
    {
      title: 'First-Time Contributors',
      value: metrics.firstTimeContributors.toLocaleString(),
      subtitle: 'New contributors tracked',
      icon: UserPlus,
      iconBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
      borderGlow: 'hover:border-cyan-500/40',
    },
    {
      title: 'Returning Contributors',
      value: metrics.returningContributors.toLocaleString(),
      subtitle: 'Submitted 2+ contributions',
      icon: RotateCcw,
      iconBg: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      borderGlow: 'hover:border-purple-500/40',
    },
    {
      title: 'Retention Rate',
      value: metrics.retentionRate,
      subtitle: 'ML Retention Benchmark',
      icon: TrendingUp,
      iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      borderGlow: 'hover:border-emerald-500/40',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => {
        const IconComponent = card.icon;
        return (
          <div
            key={index}
            className={`glass-panel p-5 rounded-2xl border border-slate-800/80 transition-all duration-200 ${card.borderGlow}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {card.title}
              </span>
              <div
                className={`p-2.5 rounded-xl border ${card.iconBg}`}
              >
                <IconComponent className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-bold text-white tracking-tight">
                {card.value}
              </div>
              <p className="text-xs text-slate-400 mt-1">{card.subtitle}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
