import React from 'react';
import { Activity, ShieldCheck, FileText, Clock, Compass, GitPullRequest } from 'lucide-react';
import { OnboardingScore } from '@/services/api';

interface OnboardingScoreCardProps {
  scoreData: OnboardingScore;
}

export const OnboardingScoreCard: React.FC<OnboardingScoreCardProps> = ({
  scoreData,
}) => {
  const { total, breakdown } = scoreData;

  const subMetrics = [
    {
      key: 'documentationClarity',
      label: 'Documentation Clarity',
      value: breakdown.documentationClarity,
      icon: FileText,
      description: 'README readability, contributing guides, and setup instructions.',
    },
    {
      key: 'responseTime',
      label: 'First Response Time',
      value: breakdown.responseTime,
      icon: Clock,
      description: 'Speed of maintainer reply to new issues and PRs.',
      warning: breakdown.responseTime < 60,
    },
    {
      key: 'issueAccessibility',
      label: 'Issue Accessibility',
      value: breakdown.issueAccessibility,
      icon: Compass,
      description: 'Clarity of task tagging, labels, and beginner friendliness.',
    },
    {
      key: 'prExperience',
      label: 'PR Experience',
      value: breakdown.prExperience,
      icon: GitPullRequest,
      description: 'Review cycle speed, CI automation, and feedback clarity.',
    },
  ];

  // Rating badge text & color based on total score
  const getRatingStatus = (score: number) => {
    if (score >= 80) return { text: 'Optimal Onboarding', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
    if (score >= 65) return { text: 'Good Health (Optimization Needed)', color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30' };
    return { text: 'High Friction', color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' };
  };

  const rating = getRatingStatus(total);

  return (
    <div className="rounded-2xl glass-panel border border-slate-800 p-6 relative overflow-hidden">
      {/* Decorative gradient corner */}
      <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-800/80 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Activity className="h-5 w-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              ML Feature 1: Onboarding Health Score
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Algorithmic score evaluating developer onboarding experience based on past engagement signals.
          </p>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-3">
          <span
            className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${rating.color} flex items-center gap-1.5`}
          >
            <ShieldCheck className="h-4 w-4" />
            {rating.text}
          </span>
        </div>
      </div>

      {/* Main Content Layout: Total Score Callout (Left) & Progress Bars (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6 items-center">
        {/* Total Score Badge Box */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-900/80 border border-slate-800 relative">
          <div className="relative flex items-center justify-center">
            {/* SVG Circle Progress indicator */}
            <svg className="w-36 h-36 transform -rotate-90">
              <circle
                cx="72"
                cy="72"
                r="60"
                stroke="currentColor"
                strokeWidth="10"
                className="text-slate-800"
                fill="transparent"
              />
              <circle
                cx="72"
                cy="72"
                r="60"
                stroke="url(#score-gradient)"
                strokeWidth="10"
                className="transition-all duration-1000 ease-out"
                strokeDasharray={377}
                strokeDashoffset={377 - (377 * total) / 100}
                strokeLinecap="round"
                fill="transparent"
              />
              <defs>
                <linearGradient id="score-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>
            </svg>

            {/* Score Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-4xl font-extrabold text-white font-mono tracking-tight">
                {total}
              </span>
              <span className="text-xs font-medium text-slate-400 uppercase tracking-widest mt-0.5">
                / 100
              </span>
            </div>
          </div>

          <span className="text-xs font-semibold text-slate-300 mt-4 tracking-wide">
            Overall Onboarding Score
          </span>
          <p className="text-[11px] text-slate-400 text-center mt-1">
            Weighted composite of 4 primary ML signals
          </p>
        </div>

        {/* Breakdown Progress Bars */}
        <div className="lg:col-span-8 space-y-4">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Sub-Metric Breakdown
          </h3>

          {subMetrics.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.key}
                className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <Icon className={`h-4 w-4 ${item.warning ? 'text-amber-400' : 'text-indigo-400'}`} />
                    <span className="text-sm font-semibold text-slate-200">
                      {item.label}
                    </span>
                    {item.warning && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        Needs Attention
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-bold text-white font-mono">
                    {item.value}%
                  </span>
                </div>

                {/* Progress bar background & fill */}
                <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ease-out ${
                      item.warning
                        ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                        : 'bg-gradient-to-r from-indigo-500 to-emerald-400'
                    }`}
                    style={{ width: `${item.value}%` }}
                  />
                </div>

                <p className="text-[11px] text-slate-400 mt-1">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
