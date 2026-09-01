'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function LandingPage() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [showDocsModal, setShowDocsModal] = useState(false);
  const [showGithubModal, setShowGithubModal] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem('crate_theme') as 'light' | 'dark';
    if (savedTheme === 'dark') {
      setTheme('dark');
      document.body.classList.add('dark-theme');
    } else {
      setTheme('light');
      document.body.classList.remove('dark-theme');
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

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
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
          <Link href="/" className="brand-logo">
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
            <a href="#features" className="nav-link">Features</a>
            <button onClick={() => setShowPricingModal(true)} className="nav-link-btn">Pricing</button>
            <button onClick={() => setShowDocsModal(true)} className="nav-link-btn">Docs</button>
            <Link href="/login" className="nav-link nav-link-highlight">Sign In</Link>
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

            <Link href="/login" className="nav-link-btn">Login</Link>

            <button onClick={() => setShowGithubModal(true)} className="btn btn-github">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              <span>Connect GitHub</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main>
        <section className="hero-section">
          <div className="hero-container">
            <h1 className="hero-title">Understand why<br />contributors return.</h1>
            <p className="hero-subtitle">
              Analyze activity, friction, and behavior to build a thriving open-source community. Stop guessing, start measuring.
            </p>

            <div className="hero-cta-group">
              <button onClick={() => setShowGithubModal(true)} className="btn btn-github btn-lg">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                <span>Connect GitHub</span>
              </button>
              <Link href="/" className="btn btn-secondary btn-lg">
                View Interactive Dashboard
              </Link>
            </div>
          </div>
        </section>

        {/* Platform Capabilities Section */}
        <section className="capabilities-section" id="features">
          <div className="capabilities-container">
            <div className="section-header">
              <h2 className="section-title">Platform Capabilities</h2>
              <p className="section-subtitle">Everything you need to analyze contributor lifecycle.</p>
            </div>

            <div className="capabilities-grid">
              <div className="capability-card">
                <div className="card-icon-box">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5850EC" strokeWidth="2">
                    <line x1="18" y1="20" x2="18" y2="10" />
                    <line x1="12" y1="20" x2="12" y2="4" />
                    <line x1="6" y1="20" x2="6" y2="14" />
                  </svg>
                </div>
                <h3 className="card-title">Activity Tracking</h3>
                <p className="card-desc">
                  Monitor commits, PRs, issues, and discussions across all your repositories in real-time.
                </p>
              </div>

              <div className="capability-card">
                <div className="card-icon-box">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5850EC" strokeWidth="2">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                </div>
                <h3 className="card-title">Friction Analysis</h3>
                <p className="card-desc">
                  Identify bottlenecks in your review process and pinpoint where contributors drop off.
                </p>
              </div>

              <Link href="/" className="capability-card interactive-capability">
                <div className="card-icon-box">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5850EC" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 8v8M8 12h8" />
                  </svg>
                </div>
                <div className="card-header-row">
                  <h3 className="card-title">AI Insights</h3>
                  <span className="sparkle-badge">Try Live</span>
                </div>
                <p className="card-desc">
                  Get automated recommendations on how to improve documentation and onboarding flows.
                </p>
              </Link>

              <div className="capability-card">
                <div className="card-icon-box">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5850EC" strokeWidth="2">
                    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                  </svg>
                </div>
                <h3 className="card-title">Retention Funnels</h3>
                <p className="card-desc">
                  Visualize the journey from first issue to core maintainer with customizable conversion funnels.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* GitHub Connect Modal */}
      {showGithubModal && (
        <div className="modal-backdrop show">
          <div className="modal-card">
            <button className="modal-close" onClick={() => setShowGithubModal(false)}>&times;</button>
            <div className="modal-header">
              <div className="modal-icon-badge">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
              </div>
              <h3 className="modal-title">Connect GitHub Repositories</h3>
              <p className="modal-subtitle">Grant CRATE read access to analyze your open-source organization metrics.</p>
            </div>
            <div className="modal-body">
              <div className="repo-list">
                <label className="repo-check-item">
                  <input type="checkbox" defaultChecked disabled />
                  <div className="repo-info">
                    <span className="repo-name">expressjs/express</span>
                    <span className="repo-meta">⭐ 63k • 1,248 contributors</span>
                  </div>
                </label>
                <label className="repo-check-item">
                  <input type="checkbox" defaultChecked />
                  <div className="repo-info">
                    <span className="repo-name">facebook/react</span>
                    <span className="repo-meta">⭐ 220k • 1,650 contributors</span>
                  </div>
                </label>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowGithubModal(false)}>Cancel</button>
              <button className="btn btn-github" onClick={() => { setShowGithubModal(false); showToast('GitHub Connected!'); }}>Confirm Connection</button>
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
              <p className="modal-subtitle">Start for free, upgrade as your open-source community grows.</p>
            </div>
            <div className="modal-body">
              <div className="pricing-grid">
                <div className="pricing-card">
                  <span className="plan-name">Community</span>
                  <div className="plan-price">$0 <span>/ mo</span></div>
                  <p className="plan-desc">For individual open-source maintainers.</p>
                  <ul className="plan-features">
                    <li>✓ Up to 3 Public Repos</li>
                    <li>✓ 30-day analytics history</li>
                    <li>✓ Basic retention metrics</li>
                  </ul>
                  <Link href="/" className="btn btn-secondary full-width">Get Started</Link>
                </div>
                <div className="pricing-card featured">
                  <span className="popular-badge">Most Popular</span>
                  <span className="plan-name">Pro</span>
                  <div className="plan-price">$29 <span>/ mo</span></div>
                  <p className="plan-desc">For growing projects & organizations.</p>
                  <ul className="plan-features">
                    <li>✓ Unlimited Repositories</li>
                    <li>✓ 1-year analytics history</li>
                    <li>✓ ML Retention Predictor</li>
                    <li>✓ AI Friction Alerts</li>
                  </ul>
                  <Link href="/" className="btn btn-github full-width">Start Free Trial</Link>
                </div>
                <div className="pricing-card">
                  <span className="plan-name">Enterprise</span>
                  <div className="plan-price">$99 <span>/ mo</span></div>
                  <p className="plan-desc">For foundation & ecosystem leads.</p>
                  <ul className="plan-features">
                    <li>✓ Custom integrations</li>
                    <li>✓ Unlimited history</li>
                    <li>✓ Dedicated support</li>
                  </ul>
                  <Link href="/" className="btn btn-secondary full-width">Contact Sales</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Docs Modal */}
      {showDocsModal && (
        <div className="modal-backdrop show">
          <div className="modal-card">
            <button className="modal-close" onClick={() => setShowDocsModal(false)}>&times;</button>
            <div className="modal-header">
              <h3 className="modal-title">CRATE Documentation</h3>
              <p className="modal-subtitle">Learn how CRATE calculates retention probabilities using Random Forest ML models.</p>
            </div>
            <div className="modal-body space-y-4 text-xs text-slate-400">
              <p>1. <strong>Data Collection</strong>: Aggregates closed PR timestamps, review cycles, and response speeds via GitHub API.</p>
              <p>2. <strong>ML Inference</strong>: Evaluates contributor features using scikit-learn Random Forest classifier.</p>
              <p>3. <strong>REST API Integration</strong>: Exposes JSON REST endpoints at <code>http://localhost:3000/api/dashboard</code>.</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowDocsModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
