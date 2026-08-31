'use client';

import React from 'react';
import { AIAnalysis } from '@/services/api';
import { Sparkles, AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react';

interface AIRecommendationsCardProps {
  aiAnalysis: AIAnalysis;
}

export const AIRecommendationsCard: React.FC<AIRecommendationsCardProps> = ({
  aiAnalysis,
}) => {
  const { frictionPoints, recommendations } = aiAnalysis;

  const getPriorityBadge = (priority: string) => {
    switch (priority.toUpperCase()) {
      case 'HIGH':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'MEDIUM':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'LOW':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Friction Points Card */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800/80 space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-800/60">
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              Detected Friction Points
            </h3>
            <p className="text-xs text-slate-400">
              Machine learning analysis of contributor drop-off triggers.
            </p>
          </div>
        </div>

        <ul className="space-y-3">
          {frictionPoints.map((point, index) => (
            <li
              key={index}
              className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800/60 text-xs text-slate-300"
            >
              <span className="h-2 w-2 rounded-full bg-amber-400 mt-1.5 shrink-0" />
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* AI Action Recommendations */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800/80 space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-800/60">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              AI Action Recommendations
            </h3>
            <p className="text-xs text-slate-400">
              Automated suggestions to optimize maintainer response & retention.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {recommendations.map((rec, index) => (
            <div
              key={index}
              className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/60 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span
                  className={`px-2.5 py-0.5 text-[10px] font-extrabold uppercase rounded-md border ${getPriorityBadge(
                    rec.priority
                  )}`}
                >
                  {rec.priority} Priority
                </span>
                <CheckCircle2 className="h-4 w-4 text-indigo-400" />
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                {rec.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
