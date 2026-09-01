'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const user = {
        name: fullName || email.split('@')[0].replace('.', ' ').replace(/^./, (str) => str.toUpperCase()),
        email: email,
        avatarInitials: (fullName ? fullName.substring(0, 2) : email.substring(0, 2)).toUpperCase(),
        loginTime: new Date().toISOString(),
      };

      localStorage.setItem('crate_user', JSON.stringify(user));
      setLoading(false);
      showToast('Signed in successfully! Redirecting...');
      setTimeout(() => {
        router.push('/');
      }, 800);
    }, 600);
  };

  const handleGitHubAuth = () => {
    window.location.href = 'http://localhost:3000/api/auth/github';
  };

  const handleDemoSignIn = () => {
    setLoading(true);
    const demoUser = {
      name: 'Alex Rivera',
      email: 'alex.rivera@crate-analytics.io',
      avatarInitials: 'AR',
      loginTime: new Date().toISOString(),
    };
    localStorage.setItem('crate_user', JSON.stringify(demoUser));
    showToast('Signed in as Demo User Alex Rivera!');
    setTimeout(() => {
      setLoading(false);
      router.push('/');
    }, 600);
  };

  return (
    <div className={`login-body ${theme === 'dark' ? 'dark-theme' : ''}`}>
      {/* Toast Notification */}
      <div className={`toast ${toastMsg ? 'show' : ''}`}>
        <span>{toastMsg}</span>
      </div>

      {/* Login Top Navigation */}
      <header className="login-header">
        <Link href="/landing" className="brand-logo">
          <div className="logo-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 8L12 3L3 8V16L12 21L21 16V8Z" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12 3V12M12 12L21 8M12 12L3 8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M17 5.5L7.5 10.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
          </div>
          <span className="brand-name">CRATE</span>
        </Link>

        <nav className="main-nav login-nav">
          <Link href="/landing" className="nav-link">Home</Link>
          <Link href="/landing#features" className="nav-link">Features</Link>
          <Link href="/landing?modal=pricing" className="nav-link">Pricing</Link>
          <Link href="/" className="nav-link">Dashboard</Link>
        </nav>

        <div className="login-header-actions">
          <button onClick={toggleTheme} className="icon-btn" title="Toggle Theme" aria-label="Toggle theme">
            <svg className="sun-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="5" />
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
            <svg className="moon-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          </button>

          <Link href="/" className="btn btn-secondary btn-back-home">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            <span>Back to Dashboard</span>
          </Link>
        </div>
      </header>

      {/* Main Login Page Grid */}
      <main className="login-wrapper">
        {/* Visual Showcase Side */}
        <section className="login-visual-section">
          <div className="glow-orb glow-orb-1"></div>
          <div className="glow-orb glow-orb-2"></div>

          <div className="visual-content">
            <div className="visual-badge">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
              <span>CRATE Open Source Intelligence</span>
            </div>

            <h1 className="visual-title">Understand why<br />contributors return.</h1>
            <p className="visual-subtitle">
              Turn one-time Pull Requests into long-term community maintainers with automated friction analysis and retention cohorts.
            </p>

            {/* Metric Highlight Preview Card */}
            <div className="visual-preview-card">
              <div className="preview-card-header">
                <div className="preview-meta">
                  <span className="preview-dot green"></span>
                  <span className="preview-label">Live Ecosystem Stats</span>
                </div>
                <span className="preview-badge positive">+14.2% retention</span>
              </div>

              <div className="preview-card-body">
                <div className="stat-box">
                  <span className="stat-number">1,248</span>
                  <span className="stat-desc">Active Contributors</span>
                </div>
                <div className="stat-divider"></div>
                <div className="stat-box">
                  <span className="stat-number">68%</span>
                  <span className="stat-desc">PR Merge Rate</span>
                </div>
                <div className="stat-divider"></div>
                <div className="stat-box">
                  <span className="stat-number">14h</span>
                  <span className="stat-desc">First Review</span>
                </div>
              </div>
            </div>

            {/* Testimonial Quote */}
            <div className="visual-testimonial">
              <p className="quote-text">
                &ldquo;CRATE helped us double our returning contributor retention within 60 days by highlighting bottlenecks in our PR review cycle.&rdquo;
              </p>
              <div className="quote-author">
                <div className="author-avatar">AR</div>
                <div className="author-info">
                  <span className="author-name">Alex Rivera</span>
                  <span className="author-title">Head of Developer Relations, OpenEcosystem</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Auth Form Side */}
        <section className="login-form-section">
          <div className="auth-card">
            {/* Tab Switcher */}
            <div className="auth-tabs">
              <button
                className={`auth-tab ${activeTab === 'signin' ? 'active' : ''}`}
                onClick={() => setActiveTab('signin')}
              >
                Sign In
              </button>
              <button
                className={`auth-tab ${activeTab === 'signup' ? 'active' : ''}`}
                onClick={() => setActiveTab('signup')}
              >
                Create Account
              </button>
            </div>

            <div className="auth-header">
              <h2 className="auth-title">
                {activeTab === 'signin' ? 'Welcome back' : 'Get started with CRATE'}
              </h2>
              <p className="auth-subtitle">
                {activeTab === 'signin' ? 'Sign in to access your organization dashboard' : 'Create an account to track contributor metrics'}
              </p>
            </div>

            {/* OAuth Buttons */}
            <div className="oauth-buttons">
              <button onClick={handleGitHubAuth} className="btn-oauth">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                <span>GitHub OAuth</span>
              </button>
              <button onClick={handleDemoSignIn} className="btn-oauth">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                <span>Demo User</span>
              </button>
            </div>

            <div className="auth-divider">
              <span>Or continue with email</span>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit}>
              {activeTab === 'signup' && (
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <div className="input-wrapper">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Alex Rivera"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Work Email</label>
                <div className="input-wrapper">
                  <input
                    type="email"
                    required
                    className="form-control"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <div className="label-row">
                  <label className="form-label">Password</label>
                  {activeTab === 'signin' && (
                    <a href="#" onClick={(e) => { e.preventDefault(); showToast('Password reset link sent.'); }} className="forgot-link">
                      Forgot?
                    </a>
                  )}
                </div>
                <div className="input-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="form-control"
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="btn-toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              <div className="form-options">
                <label className="checkbox-container">
                  <input type="checkbox" defaultChecked />
                  <span className="checkmark"></span>
                  <span className="checkbox-text">Keep me signed in for 30 days</span>
                </label>
              </div>

              <button type="submit" disabled={loading} className="btn btn-primary btn-block btn-lg">
                <span>{loading ? 'Authenticating...' : activeTab === 'signin' ? 'Sign In to Dashboard' : 'Create Free Account'}</span>
              </button>
            </form>

            <div className="auth-footer">
              {activeTab === 'signin' ? (
                <p>Don&apos;t have an account? <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('signup'); }}>Create one free</a></p>
              ) : (
                <p>Already have an account? <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('signin'); }}>Sign in</a></p>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
