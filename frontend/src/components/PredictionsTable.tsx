'use client';

import React from 'react';
import { Prediction } from '@/services/api';
import { UserCheck, UserX, Clock, BrainCircuit, CheckCircle2, XCircle } from 'lucide-react';

interface PredictionsTableProps {
  predictions: Prediction[];
}

export const PredictionsTable: React.FC<PredictionsTableProps> = ({
  predictions,
}) => {
  return (
    <div className="glass-panel p-6 rounded-2xl border border-slate-800/80 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/60">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <BrainCircuit className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              Live Contributor Retention Predictions
            </h3>
            <p className="text-xs text-slate-400">
              Predictive ML models estimating return likelihood based on PR merge times and engagement.
            </p>
          </div>
        </div>
        <span className="px-3 py-1 text-xs font-mono rounded-full bg-slate-900 border border-slate-800 text-slate-400 self-start sm:self-auto">
          Model Confidence: High
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <th className="pb-3 px-3">Contributor</th>
              <th className="pb-3 px-3">Merge Time</th>
              <th className="pb-3 px-3">Predicted Return</th>
              <th className="pb-3 px-3">Retention Probability</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-xs">
            {predictions.map((item, index) => {
              const probPercent = Math.round(item.probability * 100);
              const isHigh = item.probability >= 0.7;
              const isLow = item.probability < 0.4;

              return (
                <tr
                  key={index}
                  className="hover:bg-slate-900/40 transition-colors"
                >
                  {/* Author / Contributor */}
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-mono font-bold text-indigo-400">
                        {item.author.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span className="font-semibold text-white font-mono">
                          {item.author}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Merge Time */}
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-1.5 text-slate-300 font-mono">
                      <Clock className="h-3.5 w-3.5 text-slate-500" />
                      <span>{item.mergeTimeHours} hrs</span>
                    </div>
                  </td>

                  {/* Will Return Badge */}
                  <td className="py-3.5 px-3">
                    {item.willReturn ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-medium">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Will Return</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[11px] font-medium">
                        <XCircle className="h-3.5 w-3.5" />
                        <span>Unlikely</span>
                      </span>
                    )}
                  </td>

                  {/* Probability Bar */}
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-3 max-w-xs">
                      <div className="flex-1 h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isHigh
                              ? 'bg-emerald-500'
                              : isLow
                              ? 'bg-rose-500'
                              : 'bg-amber-500'
                          }`}
                          style={{ width: `${probPercent}%` }}
                        />
                      </div>
                      <span
                        className={`font-mono font-bold text-xs ${
                          isHigh
                            ? 'text-emerald-400'
                            : isLow
                            ? 'text-rose-400'
                            : 'text-amber-400'
                        }`}
                      >
                        {probPercent}%
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
