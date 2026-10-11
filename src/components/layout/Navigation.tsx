'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LeafDecoration } from '@/components/ui/LeafDecoration';
import { Compass, Settings, Menu, X, ArrowUpRight } from 'lucide-react';

export function Navigation() {
  const pathname = usePathname();
  const [aiStatus, setAiStatus] = useState<'ready' | 'fallback-ready' | 'checking'>('checking');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetch('/api/health')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.isAvailable) {
          setAiStatus('ready');
        } else {
          setAiStatus('fallback-ready');
        }
      })
      .catch(() => setAiStatus('fallback-ready'));
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Primary desktop navigation links (folded Trail Card and Field Notes into flow)
  const desktopLinks = [
    { href: '/', label: 'Overview' },
    { href: '/trail', label: 'Trail Guide' },
    { href: '/walk', label: 'Walk' },
    { href: '/journal', label: 'Journal' },
  ];

  // Complete list for mobile drawer
  const allNavLinks = [
    { href: '/', label: 'Overview' },
    { href: '/plan', label: 'Plan a Walk' },
    { href: '/trail', label: 'Trail Guide' },
    { href: '/trail-card', label: 'Trail Card' },
    { href: '/walk', label: 'Walk Mode' },
    { href: '/field-notes', label: 'Field Notes' },
    { href: '/journal', label: 'Journal' },
    { href: '/settings', label: 'Settings' },
  ];

  const [showNotice, setShowNotice] = useState(false);

  return (
    <header className="site-header">
      <div className="container">
        <div className="header-inner">
          {/* Brand Lockup */}
          <Link href="/" className="brand-link" title="Trailnote Home">
            <div className="brand-badge">
              <LeafDecoration size={20} color="#FAF7F0" variant="maple" />
            </div>
            <div>
              <div className="brand-title-wrap">
                <span className="brand-title">Trailnote</span>
                <span className="neon-dot" title="Active Outdoor Companion" />
              </div>
              <div className="brand-subtitle">
                TOUCH GRASS // LOCAL AI
              </div>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="desktop-nav" aria-label="Main Navigation">
            {desktopLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`nav-link ${isActive ? 'active' : ''}`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Status & Actions */}
          <div className="nav-actions">
            {/* Honest Neutral Field Guide Status Badge */}
            <button
              type="button"
              onClick={() => setShowNotice(true)}
              className={`ai-health-badge ${aiStatus === 'ready' ? 'ready' : 'fallback'}`}
              title="Click to view AI & Field Guide execution status"
              id="local-ready-badge"
              style={{ cursor: 'pointer', background: 'none' }}
            >
              <span className="ai-health-dot" />
              <span>{aiStatus === 'ready' ? 'Guide: Gemma 2 active' : 'Guide: built-in rules'}</span>
            </button>

            {/* Tactical Settings Icon Link */}
            <Link
              href="/settings"
              className="nav-settings-btn"
              title="Outdoor Settings & Offline Cache"
              aria-label="Outdoor Settings"
            >
              <Settings size={16} />
            </Link>

            {/* GitHub Repository Link */}
            <a
              href="https://github.com/AnshMeshram/TrailNote"
              target="_blank"
              rel="noopener noreferrer"
              className="nav-settings-btn"
              title="View Source on GitHub (AnshMeshram/TrailNote)"
              aria-label="GitHub Repository"
            >
              <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
            </a>

            {/* Primary Plan Walk CTA */}
            <Link href="/plan" className="btn-primary nav-cta-btn">
              <Compass size={14} />
              <span>Plan Walk</span>
            </Link>

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
              className="mobile-nav-toggle"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div
          style={{
            backgroundColor: 'var(--paper-card)',
            borderBottom: '2px solid var(--paper-border-dark)',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem',
            boxShadow: '0 8px 24px rgba(32, 37, 26, 0.08)',
          }}
          className="mobile-menu-drawer"
        >
          {/* Mobile AI status banner */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.5rem 0.75rem',
              backgroundColor: 'var(--paper-bg)',
              border: '1px solid var(--paper-border)',
              borderRadius: '4px',
              fontSize: '0.75rem',
              fontFamily: 'var(--font-mono)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  backgroundColor: aiStatus === 'ready' ? 'var(--neon-accent)' : 'var(--autumn-rust)',
                }}
              />
              <span style={{ color: 'var(--ink-soft)' }}>
                {aiStatus === 'ready' ? 'LOCAL AI: GEMMA 2 READY' : 'LOCAL AI: OFFLINE FALLBACK'}
              </span>
            </div>
            <Link
              href="/settings"
              onClick={() => setIsMobileMenuOpen(false)}
              style={{
                color: 'var(--green-leaf)',
                textDecoration: 'none',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.2rem',
              }}
            >
              <span>Config</span>
              <ArrowUpRight size={12} />
            </Link>
          </div>

          {/* Links list */}
          {allNavLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                style={{
                  fontSize: '0.95rem',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? 'var(--green-leaf)' : 'var(--ink-primary)',
                  textDecoration: 'none',
                  padding: '0.45rem 0',
                  borderBottom: '1px dotted var(--paper-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span>{link.label}</span>
                {isActive && <span className="field-stamp green">CURRENT</span>}
              </Link>
            );
          })}

          {/* GitHub Repository External Link */}
          <a
            href="https://github.com/AnshMeshram/TrailNote"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setIsMobileMenuOpen(false)}
            style={{
              fontSize: '0.95rem',
              fontWeight: 600,
              color: 'var(--green-deep)',
              textDecoration: 'none',
              padding: '0.65rem 0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span>GitHub Repository ↗</span>
            <span className="field-stamp">OPEN SOURCE</span>
          </a>
        </div>
      )}

      {/* Hosted Demo Explanation Modal */}
      {showNotice && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Hosted Demo Notice"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(20, 26, 16, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 'var(--z-modal)',
            padding: '1rem',
          }}
          onClick={() => setShowNotice(false)}
        >
          <div
            className="paper-card"
            style={{
              maxWidth: '480px',
              width: '100%',
              padding: '1.75rem',
              backgroundColor: 'var(--paper-card)',
              border: '2px solid var(--paper-border-dark)',
              boxShadow: 'var(--shadow-tactile)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span className="field-stamp green">
                {aiStatus === 'ready' ? 'GUIDE: GEMMA 2 ACTIVE' : 'GUIDE: BUILT-IN RULES'}
              </span>
              <button
                type="button"
                onClick={() => setShowNotice(false)}
                aria-label="Close Notice"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--ink-soft)',
                  padding: '0.25rem',
                }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '0.95rem', lineHeight: 1.6, color: 'var(--ink-primary)', marginBottom: '0.85rem' }}>
              This hosted demo uses built-in field-guide rules. Gemma 2 runs on your own machine. See the demo video or run it locally with <code>ollama pull gemma2:2b</code>.
            </p>

            <p style={{ fontSize: '0.8rem', color: 'var(--ink-muted)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
              The AI runs on your machine. Place search, routes and weather come from open public services (Nominatim, OSRM, Open-Meteo).
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <Link
                href="/settings"
                onClick={() => setShowNotice(false)}
                className="btn-secondary"
                style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem' }}
              >
                Model Settings
              </Link>
              <button
                type="button"
                onClick={() => setShowNotice(false)}
                className="btn-primary"
                style={{ padding: '0.45rem 1rem', fontSize: '0.82rem' }}
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
