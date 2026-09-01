'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { fetchDashboardData, predictRetention, DashboardData } from '@/services/api';

export default function Home() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRepo, setSelectedRepo] = useState<string>('expressjs/express');
  const [selectedTime, setSelectedTime] = useState<string>('30d');
  const [activeMetric, setActiveMetric] = useState<'active' | 'merge' | 'review' | 'churn'>('active');

  const [repoDropdownOpen, setRepoDropdownOpen] = useState(false);
  const [timeDropdownOpen, setTimeDropdownOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const [showPricingModal, setShowPricingModal] = useState(false);
  const [showGithubModal, setShowGithubModal] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [showRetentionDrawer, setShowRetentionDrawer] = useState(false);

  const [user, setUser] = useState<{ name: string; email: string; avatarInitials: string } | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Custom ML Predict Tool state
  const [predictMergeHours, setPredictMergeHours] = useState<number>(24);
  const [predictResult, setPredictResult] = useState<any>(null);
  const [predicting, setPredicting] = useState(false);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3200);
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('crate_theme') as 'light' | 'dark';
    if (savedTheme === 'dark') {
      setTheme('dark');
      document.body.classList.add('dark-theme');
    } else {
      setTheme('light');
      document.body.classList.remove('dark-theme');
    }

    const rawUser = localStorage.getItem('crate_user');
    if (rawUser) {
      try {
        setUser(JSON.parse(rawUser));
      } catch (_e) {
        localStorage.removeItem('crate_user');
      }
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('crate_theme', nextTheme);
    if (nextTheme === 'dark') {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  };

  const loadData = useCallback(async (repoName: string = selectedRepo) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchDashboardData(repoName);
      if (result) {
        setData(result);
      } else {
        setError(`Could not load metrics for repository ${repoName}`);
      }
    } catch (_err) {
      setError('An unexpected error occurred while fetching dashboard metrics.');
    } finally {
      setLoading(false);
    }
  }, [selectedRepo]);

  useEffect(() => {
    loadData(selectedRepo);
  }, [selectedRepo, loadData]);

  // Smooth Bezier Curve Chart Calculations
  const dateLabels = useMemo(() => {
    if (selectedTime === '7d') return ['Dec 27', 'Dec 28', 'Dec 29', 'Dec 30', 'Dec 31', 'Jan 1', 'Jan 2'];
    if (selectedTime === '90d') return ['Oct 1', 'Oct 15', 'Nov 1', 'Nov 15', 'Dec 1', 'Dec 15', 'Jan 1'];
    if (selectedTime === '1y') return ['Feb', 'Apr', 'Jun', 'Aug', 'Oct', 'Dec', 'Jan'];
    return ['Dec 24', 'Dec 25', 'Dec 26', 'Dec 27', 'Dec 28', 'Dec 29', 'Dec 30'];
  }, [selectedTime]);

  const chartData = useMemo(() => {
    const baseVal = data?.overviewMetrics.totalContributors || 1248;
    const mult = selectedRepo === 'facebook/react' ? 1.4 : selectedRepo.includes('S70') ? 0.6 : 1.0;

    const currentPoints: number[] = [];
    const precedingPoints: number[] = [];

    dateLabels.forEach((_, idx) => {
      const progress = idx / (dateLabels.length - 1);
      let curVal = baseVal * mult * 0.1;
      let prevVal = curVal * 0.85;

      if (activeMetric === 'active') {
        curVal = Math.round(curVal + Math.sin(progress * Math.PI) * 120 + progress * 150);
        prevVal = Math.round(prevVal + Math.sin(progress * Math.PI) * 90 + progress * 80);
      } else if (activeMetric === 'merge') {
        curVal = Math.min(98, Math.max(40, Math.round(68 + Math.sin(progress * 4) * 12)));
        prevVal = Math.min(95, Math.max(40, Math.round(62 + Math.cos(progress * 4) * 10)));
      } else if (activeMetric === 'review') {
        curVal = Math.max(4, Math.round(24 - progress * 10));
        prevVal = Math.max(6, Math.round(28 - progress * 8));
      } else {
        curVal = Math.max(10, Math.round(42 + Math.sin(progress * 6) * 12));
        prevVal = Math.max(10, Math.round(48 + Math.cos(progress * 6) * 10));
      }

      currentPoints.push(curVal);
      precedingPoints.push(prevVal);
    });

    const maxVal = Math.max(...currentPoints, ...precedingPoints, 100);
    const yMax = Math.ceil(maxVal * 1.2 / 50) * 50;

    const width = 900;
    const height = 320;
    const padding = { top: 40, bottom: 50, left: 50, right: 20 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const computePath = (points: number[]) => {
      const coords = points.map((val, idx) => {
        const x = padding.left + (idx / (points.length - 1)) * chartW;
        const normalizedY = Math.min(1, Math.max(0, val / yMax));
        const y = padding.top + (1 - normalizedY) * chartH;
        return { x, y };
      });

      let lineD = `M ${coords[0].x} ${coords[0].y}`;
      for (let i = 0; i < coords.length - 1; i++) {
        const p0 = coords[i === 0 ? i : i - 1];
        const p1 = coords[i];
        const p2 = coords[i + 1];
        const p3 = coords[i + 2] || p2;

        const cp1x = p1.x + (p2.x - p0.x) * 0.15;
        const cp1y = p1.y + (p2.y - p0.y) * 0.15;
        const cp2x = p2.x - (p3.x - p1.x) * 0.15;
        const cp2y = p2.y - (p3.y - p1.y) * 0.15;

        lineD += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
      }

      const lastX = coords[coords.length - 1].x;
      const firstX = coords[0].x;
      const baselineY = height - padding.bottom;
      const areaD = `${lineD} L ${lastX} ${baselineY} L ${firstX} ${baselineY} Z`;

      return { lineD, areaD, coords };
    };

    const curPath = computePath(currentPoints);
    const prevPath = computePath(precedingPoints);

    return { yMax, currentPoints, precedingPoints, curPath, prevPath };
  }, [data, selectedRepo, selectedTime, activeMetric, dateLabels]);

  const handlePredictSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPredicting(true);
    try {
      const res = await predictRetention(predictMergeHours, user?.name || 'devUser_predict');
      if (res) {
        setPredictResult(res);
        showToast(`ML Prediction Generated: ${res.probability * 100}% Return Probability`);
      }
    } catch (_err) {
      showToast('Error generating prediction.');
    } finally {
      setPredicting(false);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('crate_user');
    setUser(null);
    setUserMenuOpen(false);
    showToast('Signed out of CRATE session.');
  };

  return (
    <div className={theme === 'dark' ? 'dark-theme' : ''}>
      {/* Toast Notification */}
      <div className={`toast ${toastMsg ? 'show' : ''}`}>
        <span>{toastMsg}</span>
      </div>

      {/* Navigation Header */}
      <header className="site-header">
        <div className="header-container">
          <Link href="/landing" className="brand-logo">
            <div className="logo-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 8L12 3L3 8V16L12 21L21 16V8Z" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M12 3V12M12 12L3 8M12 12L3 8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M17 5.5L7.5 10.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
              </svg>
            </div>
            <span className="brand-name">CRATE</span>
          </Link>

          <nav className="main-nav">
            <Link href="/landing" className="nav-link">Home</Link>
            <Link href="/landing#features" className="nav-link">Features</Link>
            <button onClick={() => setShowPricingModal(true)} className="nav-link-btn">Pricing</button>
            <button onClick={() => setShowAiModal(true)} className="nav-link-btn">AI Insights</button>
          </nav>

          <div className="header-actions">
            <button onClick={toggleTheme} className="icon-btn" title="Toggle Theme" aria-label="Toggle theme">
              <svg className="sun-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="5" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
              <svg className="moon-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            </button>

            {user ? (
              <div className="user-profile-wrapper">
                <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="user-profile-btn">
                  <span className="user-avatar-badge">{user.avatarInitials || 'AR'}</span>
                  <span>{user.name}</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6"/></svg>
                </button>

                {userMenuOpen && (
                  <div className="user-dropdown-menu show">
                    <div className="user-dropdown-header">
                      <span className="user-dropdown-name">{user.name}</span>
                      <span className="user-dropdown-email">{user.email}</span>
                    </div>
                    <button onClick={() => { setUserMenuOpen(false); setShowGithubModal(true); }} className="user-dropdown-item">
                      Connected Repositories
                    </button>
                    <button onClick={handleSignOut} className="user-dropdown-item danger">
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login" className="nav-link-btn">Login</Link>
            )}

            <button onClick={() => setShowGithubModal(true)} className="btn btn-github">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              <span>Connect GitHub</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Interactive Dashboard Container */}
      <main className="dashboard-preview-section" style={{ paddingTop: '32px' }}>
        <div className="dashboard-card">
          {/* Card Top Toolbar */}
          <div className="card-toolbar">
            <div className="repo-selector-wrapper">
              <span className="breadcrumb-root">CRATE Analytics</span>
              <span className="breadcrumb-separator">|</span>

              {/* Custom Repo Dropdown */}
              <div className="custom-dropdown">
                <button
                  onClick={() => setRepoDropdownOpen(!repoDropdownOpen)}
                  className="dropdown-trigger"
                >
                  <span>{selectedRepo}</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>

                {repoDropdownOpen && (
                  <div className="dropdown-menu show">
                    <div
                      className={`dropdown-item ${selectedRepo === 'expressjs/express' ? 'selected' : ''}`}
                      onClick={() => { setSelectedRepo('expressjs/express'); setRepoDropdownOpen(false); showToast('Switched focus to expressjs/express'); }}
                    >
                      expressjs/express
                    </div>
                    <div
                      className={`dropdown-item ${selectedRepo === 'facebook/react' ? 'selected' : ''}`}
                      onClick={() => { setSelectedRepo('facebook/react'); setRepoDropdownOpen(false); showToast('Switched focus to facebook/react'); }}
                    >
                      facebook/react
                    </div>
                    <div
                      className={`dropdown-item ${selectedRepo === 'kalviumcommunity/S70_Team02_CRATE' ? 'selected' : ''}`}
                      onClick={() => { setSelectedRepo('kalviumcommunity/S70_Team02_CRATE'); setRepoDropdownOpen(false); showToast('Switched focus to CRATE Core Team'); }}
                    >
                      CRATE Core Team
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Time Range Dropdown */}
            <div className="time-range-wrapper">
              <div className="custom-dropdown">
                <button
                  onClick={() => setTimeDropdownOpen(!timeDropdownOpen)}
                  className="dropdown-trigger time-trigger"
                >
                  <span>{selectedTime === '7d' ? 'Last 7 Days' : selectedTime === '90d' ? 'Last 90 Days' : selectedTime === '1y' ? 'Last 12 Months' : 'Last 30 Days'}</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                </button>

                {timeDropdownOpen && (
                  <div className="dropdown-menu right-aligned show">
                    <div className={`dropdown-item ${selectedTime === '7d' ? 'selected' : ''}`} onClick={() => { setSelectedTime('7d'); setTimeDropdownOpen(false); }}>Last 7 Days</div>
                    <div className={`dropdown-item ${selectedTime === '30d' ? 'selected' : ''}`} onClick={() => { setSelectedTime('30d'); setTimeDropdownOpen(false); }}>Last 30 Days</div>
                    <div className={`dropdown-item ${selectedTime === '90d' ? 'selected' : ''}`} onClick={() => { setSelectedTime('90d'); setTimeDropdownOpen(false); }}>Last 90 Days</div>
                    <div className={`dropdown-item ${selectedTime === '1y' ? 'selected' : ''}`} onClick={() => { setSelectedTime('1y'); setTimeDropdownOpen(false); }}>Last 12 Months</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Metric Tabs Grid */}
          <div className="metrics-grid">
            <div
              className={`metric-tab ${activeMetric === 'active' ? 'active' : ''}`}
              onClick={() => setActiveMetric('active')}
            >
              <div className="metric-header">
                <span className="metric-title">Active Contributors</span>
              </div>
              <div className="metric-value-row">
                <span className="metric-value">{data?.overviewMetrics.totalContributors || 1248}</span>
                <span className="metric-badge positive">+14.2%</span>
              </div>
            </div>

            <div
              className={`metric-tab ${activeMetric === 'merge' ? 'active' : ''}`}
              onClick={() => setActiveMetric('merge')}
            >
              <div className="metric-header">
                <span className="metric-title">PR Merge Rate</span>
              </div>
              <div className="metric-value-row">
                <span className="metric-value">{data?.overviewMetrics.retentionRate || '68%'}</span>
                <span className="metric-badge positive">+5.1%</span>
              </div>
            </div>

            <div
              className={`metric-tab ${activeMetric === 'review' ? 'active' : ''}`}
              onClick={() => setActiveMetric('review')}
            >
              <div className="metric-header">
                <span className="metric-title">Avg. Time to First Review</span>
              </div>
              <div className="metric-value-row">
                <span className="metric-value">14h</span>
                <span className="metric-badge positive">-3.2h</span>
              </div>
            </div>

            <div
              className={`metric-tab ${activeMetric === 'churn' ? 'active' : ''}`}
              onClick={() => setActiveMetric('churn')}
            >
              <div className="metric-header">
                <span className="metric-title">First-Time Contributors</span>
              </div>
              <div className="metric-value-row">
                <span className="metric-value">{data?.overviewMetrics.firstTimeContributors || 320}</span>
                <span className="metric-badge positive">+8.0%</span>
              </div>
            </div>
          </div>

          {/* Smooth Bezier SVG Chart Container */}
          <div className="chart-container">
            <svg class="analytics-chart" viewBox="0 0 900 320" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#5850EC" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#5850EC" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="prevGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#9CA3AF" stopOpacity="0.1" />
                  <stop offset="100%" stopColor="#9CA3AF" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines & Labels */}
              <g className="chart-grid">
                <line x1="40" y1="40" x2="880" y2="40" stroke="var(--grid-color)" strokeDasharray="4 4" />
                <text x="35" y="44" textAnchor="end" className="grid-text">{chartData.yMax}</text>

                <line x1="40" y1="160" x2="880" y2="160" stroke="var(--grid-color)" strokeDasharray="4 4" />
                <text x="35" y="164" textAnchor="end" className="grid-text">{Math.round(chartData.yMax / 2)}</text>

                <line x1="40" y1="270" x2="880" y2="270" stroke="var(--grid-color)" />
                <text x="35" y="274" textAnchor="end" className="grid-text">0</text>
              </g>

              {/* Preceding Period Bezier Curve */}
              <path class="preceding-area" d={chartData.prevPath.areaD} fill="url(#prevGradient)" />
              <path class="preceding-line" d={chartData.prevPath.lineD} fill="none" stroke="#9CA3AF" strokeWidth="1.8" strokeDasharray="4 4" opacity="0.6" />

              {/* Current Period Smooth Bezier Curve */}
              <path class="chart-area" d={chartData.curPath.areaD} fill="url(#chartGradient)" />
              <path class="chart-line" d={chartData.curPath.lineD} fill="none" stroke="#5850EC" strokeWidth="2.5" strokeLinecap="round" />

              {/* Date Labels */}
              <g className="x-axis-labels">
                {dateLabels.map((label, idx) => {
                  const x = 50 + (idx / (dateLabels.length - 1)) * 830;
                  return (
                    <text key={idx} x={x} y={295} textAnchor="middle">
                      {label}
                    </text>
                  );
                })}
              </g>
            </svg>
          </div>

          {/* Card Footer */}
          <div className="card-footer">
            <div className="legend-group">
              <div className="legend-item">
                <span className="legend-dot current"></span>
                <span>Current Period</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot preceding"></span>
                <span>Preceding Period</span>
              </div>
            </div>

            <button onClick={() => setShowRetentionDrawer(true)} className="footer-link-btn">
              View retention report
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </div>
        </div>

        {/* ML Features Section Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginTop: '32px' }}>
          {/* Onboarding Health Card */}
          <div className="capability-card">
            <div className="card-header-row" style={{ marginBottom: '16px' }}>
              <h3 className="card-title" style={{ margin: 0 }}>Onboarding Health Score</h3>
              <span className="sparkle-badge" style={{ backgroundColor: '#10B981' }}>Score: {data?.mlFeatures.onboardingScore.total || 74}/100</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <div style={{ display: 'flex', justify: 'space-between', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                  <span>Documentation Clarity</span>
                  <span>{data?.mlFeatures.onboardingScore.breakdown.documentationClarity || 82}%</span>
                </div>
                <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--bg-card-subtle)', borderRadius: '999px', overflow: 'hidden' }}>
                  <div style={{ width: `${data?.mlFeatures.onboardingScore.breakdown.documentationClarity || 82}%`, height: '100%', backgroundColor: '#5850EC' }}></div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justify: 'space-between', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                  <span>Response Time Score</span>
                  <span>{data?.mlFeatures.onboardingScore.breakdown.responseTime || 57}%</span>
                </div>
                <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--bg-card-subtle)', borderRadius: '999px', overflow: 'hidden' }}>
                  <div style={{ width: `${data?.mlFeatures.onboardingScore.breakdown.responseTime || 57}%`, height: '100%', backgroundColor: '#10B981' }}></div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justify: 'space-between', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                  <span>PR Experience</span>
                  <span>{data?.mlFeatures.onboardingScore.breakdown.prExperience || 71}%</span>
                </div>
                <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--bg-card-subtle)', borderRadius: '999px', overflow: 'hidden' }}>
                  <div style={{ width: `${data?.mlFeatures.onboardingScore.breakdown.prExperience || 71}%`, height: '100%', backgroundColor: '#F59E0B' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* AI Recommendations Card */}
          <div className="capability-card">
            <div className="card-header-row" style={{ marginBottom: '16px' }}>
              <h3 className="card-title" style={{ margin: 0 }}>AI Friction & Recommendations</h3>
              <span className="sparkle-badge">Random Forest Engine</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {(data?.mlFeatures.aiAnalysis.frictionPoints || []).map((point, idx) => (
                <div key={idx} style={{ padding: '10px 12px', borderRadius: '8px', backgroundColor: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', fontSize: '12px', color: '#EF4444', fontWeight: 600 }}>
                  ⚠️ {point}
                </div>
              ))}

              {(data?.mlFeatures.aiAnalysis.recommendations || []).map((rec, idx) => (
                <div key={idx} style={{ padding: '10px 12px', borderRadius: '8px', backgroundColor: 'var(--accent-purple-light)', border: '1px solid var(--accent-purple-glow)', fontSize: '12px', color: 'var(--text-main)' }}>
                  💡 <strong style={{ color: 'var(--accent-purple)' }}>[{rec.priority}]</strong> {rec.text}
                </div>
              ))}
            </div>
          </div>

          {/* Trigger Custom ML Prediction Card */}
          <div className="capability-card">
            <div className="card-header-row" style={{ marginBottom: '16px' }}>
              <h3 className="card-title" style={{ margin: 0 }}>Run Live ML Prediction</h3>
              <span className="sparkle-badge" style={{ backgroundColor: '#6366F1' }}>POST /api/ml/predict</span>
            </div>

            <form onSubmit={handlePredictSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">First PR Merge Time (Hours)</label>
                <input
                  type="number"
                  className="form-control"
                  style={{ paddingLeft: '14px' }}
                  value={predictMergeHours}
                  onChange={(e) => setPredictMergeHours(Number(e.target.value))}
                  min="0.1"
                  step="0.5"
                />
              </div>

              <button type="submit" disabled={predicting} className="btn btn-github btn-block" style={{ borderRadius: '10px' }}>
                {predicting ? 'Executing Python Model...' : 'Calculate Return Probability'}
              </button>
            </form>

            {predictResult && (
              <div style={{ marginTop: '14px', padding: '12px', borderRadius: '8px', backgroundColor: 'var(--bg-card-subtle)', border: '1px solid var(--border-color)', fontSize: '12px' }}>
                <div style={{ display: 'flex', justify: 'space-between', marginBottom: '4px' }}>
                  <span>Probability: <strong>{(predictResult.probability * 100).toFixed(1)}%</strong></span>
                  <span className={`metric-badge ${predictResult.willReturn ? 'positive' : 'negative'}`}>
                    {predictResult.willReturn ? 'LIKELY TO RETURN' : 'RISK OF CHURN'}
                  </span>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '4px' }}>
                  Risk Level: <strong>{predictResult.riskLevel}</strong> • Processed by Python ML Engine.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Live Contributor Predictions Table */}
        <div className="capability-card" style={{ marginTop: '32px' }}>
          <div className="card-header-row" style={{ marginBottom: '16px' }}>
            <h3 className="card-title" style={{ margin: 0 }}>Live Contributor Retention Predictions</h3>
            <span className="sparkle-badge">Recent PR Cohorts</span>
          </div>

          <div className="cohort-table-wrapper">
            <table className="cohort-table">
              <thead>
                <tr>
                  <th style={{ textAlign: 'left' }}>Contributor Author</th>
                  <th>PR Merge Duration</th>
                  <th>Return Status</th>
                  <th>Return Probability</th>
                  <th>ML Risk Assessment</th>
                </tr>
              </thead>
              <tbody>
                {(data?.mlFeatures.recentPredictions || []).map((pred, idx) => (
                  <tr key={idx}>
                    <td style={{ textAlign: 'left', fontWeight: 700 }}>{pred.author}</td>
                    <td>{pred.mergeTimeHours} hours</td>
                    <td>
                      <span className={`metric-badge ${pred.willReturn ? 'positive' : 'negative'}`}>
                        {pred.willReturn ? 'WILL RETURN' : 'CHURN RISK'}
                      </span>
                    </td>
                    <td className={pred.probability >= 0.7 ? 'heat-high' : pred.probability >= 0.4 ? 'heat-med' : 'heat-low'}>
                      {(pred.probability * 100).toFixed(0)}%
                    </td>
                    <td style={{ fontWeight: 600, color: pred.probability >= 0.7 ? '#059669' : pred.probability >= 0.4 ? '#D97706' : '#DC2626' }}>
                      {pred.probability >= 0.7 ? 'LOW RISK' : pred.probability >= 0.4 ? 'MEDIUM RISK' : 'HIGH RISK'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Retention Report Drawer */}
      {showRetentionDrawer && (
        <div className="drawer-backdrop show">
          <div className="drawer-panel">
            <div className="drawer-header">
              <div>
                <h3 className="drawer-title">Contributor Retention Cohort Report</h3>
                <p className="drawer-subtitle">Repository: <span className="highlight-repo">{selectedRepo}</span></p>
              </div>
              <button className="modal-close" onClick={() => setShowRetentionDrawer(false)}>&times;</button>
            </div>

            <div className="retention-summary-cards">
              <div className="summary-card">
                <span className="summary-num">{data?.overviewMetrics.totalContributors || 1248}</span>
                <span className="summary-label">Total Contributors</span>
              </div>
              <div className="summary-card">
                <span className="summary-num">{data?.overviewMetrics.retentionRate || '30.0%'}</span>
                <span className="summary-label">Retention Rate</span>
              </div>
              <div className="summary-card">
                <span className="summary-num">{data?.overviewMetrics.firstTimeContributors || 320}</span>
                <span className="summary-label">First Time PRs</span>
              </div>
            </div>

            <h4 className="sub-heading">Monthly Cohort Heatmap</h4>
            <div className="cohort-table-wrapper">
              <table className="cohort-table">
                <thead>
                  <tr>
                    <th>Cohort</th>
                    <th>Size</th>
                    <th>Mo 1</th>
                    <th>Mo 2</th>
                    <th>Mo 3</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Oct 2025</td>
                    <td>140</td>
                    <td className="heat-high">100%</td>
                    <td className="heat-med">34%</td>
                    <td className="heat-med">28%</td>
                  </tr>
                  <tr>
                    <td>Nov 2025</td>
                    <td>185</td>
                    <td className="heat-high">100%</td>
                    <td className="heat-med">38%</td>
                    <td className="heat-low">19%</td>
                  </tr>
                  <tr>
                    <td>Dec 2025</td>
                    <td>210</td>
                    <td className="heat-high">100%</td>
                    <td className="heat-med">31%</td>
                    <td className="heat-empty">-</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Pricing Modal */}
      {showPricingModal && (
        <div className="modal-backdrop show">
          <div className="modal-card modal-lg">
            <button className="modal-close" onClick={() => setShowPricingModal(false)}>&times;</button>
            <div className="modal-header center">
              <h3 className="modal-title">Simple, transparent pricing</h3>
              <p className="modal-subtitle">Start for free, upgrade as your community grows.</p>
            </div>
            <div className="modal-body">
              <div className="pricing-grid">
                <div className="pricing-card">
                  <span className="plan-name">Community</span>
                  <div className="plan-price">$0 <span>/ mo</span></div>
                  <p className="plan-desc">For open-source maintainers.</p>
                  <ul className="plan-features">
                    <li>✓ 3 Public Repos</li>
                    <li>✓ 30-day history</li>
                  </ul>
                  <button className="btn btn-secondary full-width" onClick={() => setShowPricingModal(false)}>Current Plan</button>
                </div>
                <div className="pricing-card featured">
                  <span className="popular-badge">Popular</span>
                  <span className="plan-name">Pro</span>
                  <div className="plan-price">$29 <span>/ mo</span></div>
                  <p className="plan-desc">For growing dev teams.</p>
                  <ul className="plan-features">
                    <li>✓ Unlimited Repos</li>
                    <li>✓ ML Retention Model</li>
                  </ul>
                  <button className="btn btn-github full-width" onClick={() => { setShowPricingModal(false); showToast('Pro Plan Activated!'); }}>Upgrade Now</button>
                </div>
                <div className="pricing-card">
                  <span className="plan-name">Enterprise</span>
                  <div className="plan-price">$99 <span>/ mo</span></div>
                  <p className="plan-desc">For ecosystem leads.</p>
                  <ul className="plan-features">
                    <li>✓ Dedicated Support</li>
                    <li>✓ Custom Model Fine-Tuning</li>
                  </ul>
                  <button className="btn btn-secondary full-width" onClick={() => setShowPricingModal(false)}>Contact Sales</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Insights Modal */}
      {showAiModal && (
        <div className="modal-backdrop show">
          <div className="modal-card modal-lg">
            <button className="modal-close" onClick={() => setShowAiModal(false)}>&times;</button>
            <div className="modal-header">
              <div className="ai-badge-header">
                <span>🤖 AI Intelligence Report</span>
              </div>
              <h3 className="modal-title">Automated Friction Recommendations</h3>
            </div>
            <div className="modal-body">
              <div className="insight-list">
                {(data?.mlFeatures.aiAnalysis.recommendations || []).map((rec, idx) => (
                  <div key={idx} className="insight-item">
                    <div className="insight-icon">💡</div>
                    <div className="insight-text">
                      <span className="insight-head">Priority: {rec.priority}</span>
                      <p>{rec.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* GitHub Modal */}
      {showGithubModal && (
        <div className="modal-backdrop show">
          <div className="modal-card">
            <button className="modal-close" onClick={() => setShowGithubModal(false)}>&times;</button>
            <div className="modal-header">
              <h3 className="modal-title">Connect GitHub Repositories</h3>
              <p className="modal-subtitle">Select organization repositories for retention analysis.</p>
            </div>
            <div className="modal-body">
              <div className="repo-list">
                <label className="repo-check-item">
                  <input type="checkbox" defaultChecked disabled />
                  <div className="repo-info">
                    <span className="repo-name">expressjs/express</span>
                    <span className="repo-meta">⭐ 63k • Node.js</span>
                  </div>
                </label>
                <label className="repo-check-item">
                  <input type="checkbox" defaultChecked />
                  <div className="repo-info">
                    <span className="repo-name">facebook/react</span>
                    <span className="repo-meta">⭐ 220k • React</span>
                  </div>
                </label>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowGithubModal(false)}>Cancel</button>
              <button className="btn btn-github" onClick={() => { setShowGithubModal(false); showToast('Connected GitHub Repositories!'); }}>Save Connections</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
