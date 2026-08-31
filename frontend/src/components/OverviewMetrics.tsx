import React from 'react';
import { Users, UserPlus, UserCheck, TrendingUp } from 'lucide-react';
import { OverviewMetrics as MetricsType } from '@/services/api';

interface OverviewMetricsProps {
  metrics: MetricsType;
}

export const OverviewMetrics: React.FC<OverviewMetricsProps> = ({ metrics }) => {
  const cards = [
    {
      title: 'Total Contributors',
      value: metrics.totalContributors.toLocaleString(),
      subtitle: 'All-time codebase contributors',
      icon: Users,
      iconBg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      accentColor: 'from-indigo-500 to-indigo-600',
    },
    {
      title: 'First-Time Contributors',
      value: metrics.firstTimeContributors.toLocaleString(),
      subtitle: 'New authors in recent window',
      icon: UserPlus,
      iconBg: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      accentColor: 'from-blue-500 to-indigo-500',
    },
    {
      title: 'Returning Contributors',
      value: metrics.returningContributors.toLocaleString(),
      subtitle: 'Retained past first 2 PRs',
      icon: UserCheck,
      iconBg: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      accentColor: 'from-purple-500 to-pink-500',
    },
    {
      title: 'Retention Rate',
      value: metrics.retentionRate,
      subtitle: 'ML calculated return ratio',
      icon: TrendingUp,
      iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      accentColor: 'from-emerald-400 to-teal-500',
      highlight: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`relative overflow-hidden rounded-2xl p-5 glass-panel glass-panel-hover border ${
              card.highlight
                ? 'border-emerald-500/30 shadow-lg shadow-emerald-500/5'
                : 'border-slate-800'
            }`}
          >
            {/* Top accent line */}
            <div
              className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${card.accentColor}`}
            />

            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                {card.title}
              </span>
              <div
                className={`p-2.5 rounded-xl border ${card.iconBg} flex items-center justify-center`}
              >
                <Icon className="h-5 w-5" />
              </div>
            </div>

            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-bold tracking-tight text-white font-mono">
                {card.value}
              </span>
            </div>

            <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
              {card.subtitle}
            </p>
          </div>
        );
      })}
    </div>
  );
};
