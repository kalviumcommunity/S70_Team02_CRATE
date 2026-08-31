'use client';

import React from 'react';
import { OnboardingScore } from '@/services/api';
import { Award, BookOpen, Clock, Tag, GitPullRequest } from 'lucide-react';

interface OnboardingScoreCardProps {
  scoreData: OnboardingScore;
}

export const OnboardingScoreCard: React.FC<OnboardingScoreCardProps> = ({
  scoreData,
}) => {
  const { total, breakdown } = scoreData;

  const metrics = [
    {
      label: 'Documentation Clarity',
      score: breakdown.documentationClarity,
      icon: BookOpen,
      color: 'from-indigo-500 to-indigo-400',
    },
    {
      label: 'Response Time Speed',
      score: breakdown.responseTime,
      icon: Clock,
      color: 'from-amber-500 to-amber-400',
    },
    {
      label: 'Issue Accessibility',
      score: breakdown.issueAccessibility,
      icon: Tag,
      color: 'from-emerald-500 to-emerald-400',
    },
    {
      label: 'PR Review Experience',
      score: breakdown.prExperience,
      icon: GitPullRequest,
      color: 'from-purple-500 to-purple-400',
    },
  ];

  const getHealthBadge = (score: number) => {
    if (score >= 80) return { label: 'Optimal', bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' };
    if (score >= 60) return { label: 'Moderate Health', bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400' };
    return { label: 'Needs Improvement', bg: 'bg-rose-500/10 border-rose-500/30 text-rose-400' };
  };

  const healthStatus = getHealthBadge(total);

  return (
    <div className="glass-panel p-6 rounded-2xl border border-slate-800/80 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/60">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              Onboarding Health Score
            </h3>
            <p className="text-xs text-slate-400">
              Evaluated based on contributor entry points, documentation, and maintainer responsiveness.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${healthStatus.bg}`}>
            {healthStatus.label}
          </span>
          <div className="text-right">
            <span className="text-3xl font-extrabold text-white tracking-tight">
              {total}
            </span>
            <span className="text-xs text-slate-400">/100</span>
          </div>
        </div>
      </div>

      {/* Metric breakdown progress bars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {metrics.map((item, index) => {
          const Icon = item.icon;
          return (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-300 font-medium">
                  <Icon className="h-4 w-4 text-slate-400" />
                  <span>{item.label}</span>
                </div>
                <span className="font-mono font-bold text-white">{item.score}%</span>
              </div>
              <div className="h-2.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div
                  className={`h-full bg-gradient-to-r ${item.color} rounded-full transition-all duration-500 ease-out`}
                  style={{ width: `${item.score}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
