'use client';

import React from 'react';
import { RefreshCw, GitBranch, Sparkles, Layers, Activity } from 'lucide-react';

interface HeaderProps {
  repository: string;
  onRefresh: () => void;
}

export const Header: React.FC<HeaderProps> = ({ repository, onRefresh }) => {
  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & Logo */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/20">
            <div className="h-full w-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Layers className="h-5 w-5 text-indigo-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-lg text-white tracking-tight">
                CRATE
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-semibold font-mono rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                v1.0 ML
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Contributor Retention Analytics & Tracking Engine
            </p>
          </div>
        </div>

        {/* Center: Repository Selector / Indicator */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 text-xs font-mono">
          <GitBranch className="h-3.5 w-3.5 text-indigo-400" />
          <span className="text-slate-400">Target Repo:</span>
          <span className="font-semibold text-white">{repository}</span>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
            <Activity className="h-3.5 w-3.5 animate-pulse" />
            <span className="font-medium">Model Online</span>
          </div>

          <button
            onClick={onRefresh}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 active:scale-95 transition-all duration-150"
            title="Refresh Dashboard Data"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Sync Data</span>
          </button>
        </div>
      </div>
    </header>
  );
};
