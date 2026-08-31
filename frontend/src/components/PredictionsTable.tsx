import React from 'react';
import { Target, Clock, CheckCircle, XCircle, User, ArrowRight } from 'lucide-react';
import { Prediction } from '@/services/api';

interface PredictionsTableProps {
  predictions: Prediction[];
}

export const PredictionsTable: React.FC<PredictionsTableProps> = ({
  predictions,
}) => {
  return (
    <div className="rounded-2xl glass-panel border border-slate-800 p-6 space-y-4">
      {/* Table Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800/80 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              ML Feature 3: Live Retention Predictions
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time machine learning predictions on contributor likelihood to submit follow-up PRs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Total Analyzed:</span>
          <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            {predictions.length} Contributors
          </span>
        </div>
      </div>

      {/* Data Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <th className="py-3 px-4">Contributor Author</th>
              <th className="py-3 px-4">PR Merge Time</th>
              <th className="py-3 px-4">Predicted to Return</th>
              <th className="py-3 px-4">Confidence Probability</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-sm">
            {predictions.map((pred, idx) => {
              const probPercent = Math.round(pred.probability * 100);

              // Probability gauge color styling
              let gaugeColor = 'bg-emerald-500';
              let textColor = 'text-emerald-400';
              if (probPercent < 40) {
                gaugeColor = 'bg-rose-500';
                textColor = 'text-rose-400';
              } else if (probPercent < 75) {
                gaugeColor = 'bg-amber-500';
                textColor = 'text-amber-400';
              }

              return (
                <tr
                  key={idx}
                  className="hover:bg-slate-900/60 transition-colors group"
                >
                  {/* Author */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-mono text-xs font-bold group-hover:border-indigo-500/50 transition-colors">
                        <User className="h-4 w-4 text-indigo-400" />
                      </div>
                      <div>
                        <span className="font-semibold text-slate-100 font-mono">
                          {pred.author}
                        </span>
                        <span className="block text-[11px] text-slate-400">
                          GitHub Author
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* PR Merge Time */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center space-x-1.5 text-slate-300 font-mono text-xs">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      <span>{pred.mergeTimeHours.toFixed(1)} hrs</span>
                      <span className="text-[10px] text-slate-400">
                        ({(pred.mergeTimeHours / 24).toFixed(1)} days)
                      </span>
                    </div>
                  </td>

                  {/* Predicted to Return Badge */}
                  <td className="py-3.5 px-4">
                    {pred.willReturn ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        <CheckCircle className="h-3.5 w-3.5" />
                        Will Return (Yes)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                        <XCircle className="h-3.5 w-3.5" />
                        Unlikely (No)
                      </span>
                    )}
                  </td>

                  {/* Confidence Probability Visual Gauge */}
                  <td className="py-3.5 px-4 min-w-[200px]">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className={`font-bold ${textColor}`}>
                          {probPercent}% Confidence
                        </span>
                        <span className="text-[10px] text-slate-400">
                          score: {pred.probability.toFixed(2)}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ease-out ${gaugeColor}`}
                          style={{ width: `${probPercent}%` }}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer hint */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <span>Predictions evaluated using Random Forest Classifier</span>
        <a
          href="#docs"
          className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium transition-colors"
        >
          <span>View Model Metrics</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </a>
      </div>
    </div>
  );
};
