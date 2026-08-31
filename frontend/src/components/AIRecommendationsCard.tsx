import React from 'react';
import { AlertTriangle, Sparkles, AlertCircle, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { AIAnalysis, Recommendation } from '@/services/api';

interface AIRecommendationsCardProps {
  aiAnalysis: AIAnalysis;
}

export const AIRecommendationsCard: React.FC<AIRecommendationsCardProps> = ({
  aiAnalysis,
}) => {
  const { frictionPoints, recommendations } = aiAnalysis;

  const getPriorityStyle = (priority: string) => {
    switch (priority.toUpperCase()) {
      case 'HIGH':
        return {
          badgeBg: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
          cardBorder: 'border-rose-500/30 hover:border-rose-500/50 bg-rose-950/10',
          dot: 'bg-rose-500',
        };
      case 'MEDIUM':
        return {
          badgeBg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
          cardBorder: 'border-amber-500/30 hover:border-amber-500/50 bg-amber-950/10',
          dot: 'bg-amber-500',
        };
      default:
        return {
          badgeBg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
          cardBorder: 'border-indigo-500/30 hover:border-indigo-500/50 bg-indigo-950/10',
          dot: 'bg-indigo-500',
        };
    }
  };

  return (
    <div className="space-y-4">
      {/* Header banner */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              ML Feature 2: AI Recommendations & Friction Analysis
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Automated bottleneck detection paired with prioritized intervention strategies.
          </p>
        </div>
      </div>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Friction Points */}
        <div className="rounded-2xl glass-panel border border-slate-800 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Detected Friction Points
                  </h3>
                  <span className="text-xs text-slate-400">
                    {frictionPoints.length} active onboarding blockers identified
                  </span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Action Needed
              </span>
            </div>

            <div className="space-y-3">
              {frictionPoints.map((point, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-3 hover:border-amber-500/30 transition-colors"
                >
                  <AlertCircle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-200 leading-snug">
                      {point}
                    </p>
                    <span className="inline-block mt-2 text-[11px] text-slate-400 font-mono">
                      Impact: High churn correlation
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>ML Confidence: 94.2%</span>
            <span className="text-amber-400 flex items-center gap-1 font-medium">
              Requires maintainer action
            </span>
          </div>
        </div>

        {/* Right Column: AI Recommendations */}
        <div className="rounded-2xl glass-panel border border-slate-800 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Prioritized AI Recommendations
                  </h3>
                  <span className="text-xs text-slate-400">
                    Automated steps to improve contributor retention
                  </span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Prescriptive ML
              </span>
            </div>

            <div className="space-y-3">
              {recommendations.map((rec: Recommendation, idx: number) => {
                const priorityStyle = getPriorityStyle(rec.priority);
                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-xl border transition-all ${priorityStyle.cardBorder}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full border ${priorityStyle.badgeBg} flex items-center gap-1.5`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${priorityStyle.dot}`} />
                        {rec.priority} Priority
                      </span>
                      <ArrowUpRight className="h-4 w-4 text-slate-400" />
                    </div>
                    <p className="text-sm font-semibold text-slate-100 leading-snug flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
                      <span>{rec.text}</span>
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Estimated Retention Uplift: +18.4%</span>
            <span className="text-indigo-400 font-medium">Updated live</span>
          </div>
        </div>
      </div>
    </div>
  );
};
