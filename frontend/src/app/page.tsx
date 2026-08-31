'use client';

import React, { useEffect, useState } from 'react';
import { fetchDashboardData, DashboardData } from '@/services/api';
import { Header } from '@/components/Header';
import { OverviewMetrics } from '@/components/OverviewMetrics';
import { OnboardingScoreCard } from '@/components/OnboardingScoreCard';
import { AIRecommendationsCard } from '@/components/AIRecommendationsCard';
import { PredictionsTable } from '@/components/PredictionsTable';
import { SkeletonLoader } from '@/components/SkeletonLoader';
import { AlertCircle, RefreshCw, Sparkles, Terminal } from 'lucide-react';

export default function Home() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchDashboardData();
      if (result) {
        setData(result);
      } else {
        setError('Failed to load dashboard data from /mockData.json');
      }
    } catch (err) {
      setError('An unexpected error occurred while fetching ML data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Header */}
      <Header
        repository={data?.repository || 'expressjs/express'}
        onRefresh={loadData}
      />

      {/* Main Dashboard Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Sub-header Title & Status Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/40 p-4 rounded-2xl border border-slate-800/80">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>Contributor Retention Analytics Dashboard</span>
              <Sparkles className="h-4 w-4 text-indigo-400" />
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Analyzing repository developer engagement, onboarding health metrics, and return probability predictions.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs font-mono px-3 py-1.5 rounded-lg bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 flex items-center gap-1.5">
              <Terminal className="h-3.5 w-3.5 text-indigo-400" />
              API Isolation: Active
            </span>
          </div>
        </div>

        {/* Loading State */}
        {loading && <SkeletonLoader />}

        {/* Error State */}
        {!loading && error && (
          <div className="p-6 rounded-2xl bg-rose-950/30 border border-rose-500/40 text-rose-300 space-y-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-6 w-6 text-rose-400 shrink-0" />
              <div>
                <h3 className="font-bold text-base text-rose-200">
                  Data Fetch Error
                </h3>
                <p className="text-xs text-rose-300/80 mt-0.5">{error}</p>
              </div>
            </div>
            <button
              onClick={loadData}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-200 text-xs font-semibold transition-colors"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Retry Fetching Data
            </button>
          </div>
        )}

        {/* Main ML Content Display */}
        {!loading && data && (
          <div className="space-y-8">
            {/* Top Overview Metrics Row */}
            <section aria-label="Overview Metrics">
              <OverviewMetrics metrics={data.overviewMetrics} />
            </section>

            {/* ML Feature 1: Onboarding Health Score */}
            <section aria-label="Onboarding Score">
              <OnboardingScoreCard scoreData={data.mlFeatures.onboardingScore} />
            </section>

            {/* ML Feature 2: AI Recommendations & Friction */}
            <section aria-label="AI Recommendations">
              <AIRecommendationsCard aiAnalysis={data.mlFeatures.aiAnalysis} />
            </section>

            {/* ML Feature 3: Live Retention Predictions */}
            <section aria-label="Live Predictions">
              <PredictionsTable predictions={data.mlFeatures.recentPredictions} />
            </section>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-6 mt-12 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 CRATE Engine. Contributor Retention Analytics & Tracking Engine.</p>
          <div className="flex items-center gap-4 font-mono text-[11px]">
            <span>Next.js App Router</span>
            <span>•</span>
            <span>API Isolation: mockData.json</span>
            <span>•</span>
            <span>TypeScript</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
