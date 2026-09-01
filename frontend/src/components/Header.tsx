'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Box, GitBranch, Cpu, Github, RefreshCw, User, LogOut, ChevronDown } from 'lucide-react';

interface HeaderProps {
  repository: string;
  onRefresh?: () => void;
  onSelectRepo?: (repo: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ repository, onRefresh, onSelectRepo }) => {
  const [user, setUser] = useState<{ name: string; email: string; avatarInitials: string } | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [repoDropdownOpen, setRepoDropdownOpen] = useState(false);

  useEffect(() => {
    const rawUser = localStorage.getItem('crate_user');
    if (rawUser) {
      try {
        setUser(JSON.parse(rawUser));
      } catch (_e) {
        localStorage.removeItem('crate_user');
      }
    }
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem('crate_user');
    setUser(null);
    setUserMenuOpen(false);
  };

  const handleRepoClick = (repoName: string) => {
    if (onSelectRepo) {
      onSelectRepo(repoName);
    }
    setRepoDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Brand & Navigation */}
        <div className="flex items-center space-x-6">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 p-0.5 shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
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
          </Link>

          {/* Quick Page Links */}
          <nav className="hidden sm:flex items-center space-x-3 text-xs font-semibold">
            <Link
              href="/landing"
              className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
            >
              Landing Page
            </Link>
            <Link
              href="/"
              className="px-3 py-1.5 rounded-lg text-indigo-300 bg-indigo-950/50 border border-indigo-500/30 font-bold transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/login"
              className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
            >
              Sign In
            </Link>
          </nav>
        </div>

        {/* Repository info & User Account Menu */}
        <div className="flex items-center flex-wrap gap-3">
          {/* Active Repository Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setRepoDropdownOpen(!repoDropdownOpen)}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 text-sm transition-colors"
            >
              <Github className="h-4 w-4 text-slate-400" />
              <span className="text-slate-400 text-xs font-medium">Repo:</span>
              <span className="text-slate-200 font-semibold font-mono text-xs flex items-center gap-1">
                <GitBranch className="h-3.5 w-3.5 text-indigo-400" />
                {repository}
              </span>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400 ml-1" />
            </button>

            {repoDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl py-1 z-50 text-xs font-mono">
                <div className="px-3 py-2 text-[10px] text-slate-500 uppercase font-semibold border-b border-slate-800">
                  Select Focus Repository
                </div>
                <button
                  onClick={() => handleRepoClick('expressjs/express')}
                  className="w-full text-left px-3 py-2 hover:bg-slate-800 text-slate-200 flex items-center justify-between"
                >
                  <span>expressjs/express</span>
                  <span className="text-[10px] text-emerald-400">Node</span>
                </button>
                <button
                  onClick={() => handleRepoClick('facebook/react')}
                  className="w-full text-left px-3 py-2 hover:bg-slate-800 text-slate-200 flex items-center justify-between"
                >
                  <span>facebook/react</span>
                  <span className="text-[10px] text-indigo-400">React</span>
                </button>
                <button
                  onClick={() => handleRepoClick('kalviumcommunity/S70_Team02_CRATE')}
                  className="w-full text-left px-3 py-2 hover:bg-slate-800 text-slate-200 flex items-center justify-between"
                >
                  <span>CRATE Core Team</span>
                  <span className="text-[10px] text-amber-400">Internal</span>
                </button>
              </div>
            )}
          </div>

          {/* ML Status Badge */}
          <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <Cpu className="h-3.5 w-3.5" />
            <span>ML Active</span>
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

          {/* User Profile / Login Session */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors"
              >
                <div className="h-6 w-6 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                  {user.avatarInitials || 'AR'}
                </div>
                <span className="text-xs font-semibold text-slate-200 hidden sm:inline">{user.name}</span>
                <ChevronDown className="h-3 w-3 text-slate-400" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl py-1 z-50 text-xs">
                  <div className="px-3 py-2 border-b border-slate-800">
                    <p className="font-semibold text-white">{user.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-3 py-2 hover:bg-slate-800 text-rose-400 flex items-center gap-2"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-colors"
            >
              <User className="h-3.5 w-3.5" />
              <span>Sign In</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
