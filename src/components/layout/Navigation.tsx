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

  // Primary desktop navigation links
  const desktopLinks = [
    { href: '/', label: 'Overview' },
    { href: '/trail', label: 'Trail Guide' },
    { href: '/trail-card', label: 'Trail Card' },
    { href: '/walk', label: 'Walk Mode' },
    { href: '/field-notes', label: 'Field Notes' },
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
            {/* Local AI Health Badge */}
            <Link
              href="/settings"
              className={`ai-health-badge ${aiStatus === 'ready' ? 'ready' : 'fallback'}`}
              title="Local AI Inference Status · Ollama Gemma 2"
              id="local-ready-badge"
            >
              <span className="ai-health-dot" />
              <span>{aiStatus === 'ready' ? 'LOCAL AI ● READY' : 'LOCAL AI ● FALLBACK'}</span>
            </Link>

            {/* Tactical Settings Icon Link */}
            <Link
              href="/settings"
              className="nav-settings-btn"
              title="Outdoor Settings & Offline Cache"
              aria-label="Outdoor Settings"
            >
              <Settings size={16} />
            </Link>

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
        </div>
      )}
    </header>
  );
}
