import React from 'react';
import { Box, GitBranch, Cpu, Github, RefreshCw } from 'lucide-react';

interface HeaderProps {
  repository: string;
  onRefresh?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ repository, onRefresh }) => {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Brand & Title */}
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 p-0.5 shadow-lg shadow-indigo-500/20">
            <div className="h-full w-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Box className="h-5 w-5 text-indigo-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                CRATE
              </h1>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                v2.4 ML
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Contributor Retention Analytics & Tracking Engine
            </p>
          </div>
        </div>

        {/* Repository info & ML Status */}
        <div className="flex items-center flex-wrap gap-3">
          {/* Active Repository Tag */}
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-sm">
            <Github className="h-4 w-4 text-slate-400" />
            <span className="text-slate-400 text-xs font-medium">Repo:</span>
            <span className="text-slate-200 font-semibold font-mono text-xs flex items-center gap-1">
              <GitBranch className="h-3.5 w-3.5 text-indigo-400" />
              {repository}
            </span>
          </div>

          {/* ML Status Badge */}
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <Cpu className="h-3.5 w-3.5" />
            <span>ML Engine Active</span>
          </div>

          {/* Refresh Action */}
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
              title="Refresh Data"
              aria-label="Refresh Data"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
