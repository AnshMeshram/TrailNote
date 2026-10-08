import React from 'react';
import Link from 'next/link';
import { LeafDecoration } from '@/components/ui/LeafDecoration';
import { CompassMark } from '@/components/ui/CompassMark';

export function Footer() {
  return (
    <footer
      style={{
        backgroundColor: 'var(--paper-warm)',
        borderTop: '2px solid var(--paper-border-dark)',
        paddingTop: '3.5rem',
        paddingBottom: '3rem',
        marginTop: 'auto',
      }}
    >
      <div className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '2.5rem',
            paddingBottom: '2.5rem',
            borderBottom: '1px dashed var(--paper-border-dark)',
          }}
        >
          {/* Col 1: Philosophy */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.85rem' }}>
              <LeafDecoration size={20} color="#3A6704" variant="maple" />
              <span
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  color: 'var(--ink-primary)',
                }}
              >
                Trailnote
              </span>
              <span className="field-stamp">HACKTOBERFEST 2026</span>
            </div>
            <p style={{ fontSize: '0.92rem', color: 'var(--ink-soft)', lineHeight: 1.6, marginBottom: '1rem' }}>
              "Plan the walk. Make the note. Put the phone away."
            </p>
            <p style={{ fontSize: '0.82rem', color: 'var(--ink-muted)' }}>
              Built for Week 1 of the Open-Source AI Challenge. Theme: <strong>Touch Grass</strong>. Designed to intentionally reduce screen time through local AI trail guides.
            </p>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <div className="field-label" style={{ marginBottom: '1rem' }}>NAVIGATION</div>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li>
                <Link href="/plan" style={{ fontSize: '0.9rem', color: 'var(--ink-soft)' }} className="hover-underline">
                  → Plan an Outdoor Walk
                </Link>
              </li>
              <li>
                <Link href="/trail-card" style={{ fontSize: '0.9rem', color: 'var(--ink-soft)' }} className="hover-underline">
                  → Signature Trail Card
                </Link>
              </li>
              <li>
                <Link href="/field-notes" style={{ fontSize: '0.9rem', color: 'var(--ink-soft)' }} className="hover-underline">
                  → Field Observations Note
                </Link>
              </li>
              <li>
                <Link href="/journal" style={{ fontSize: '0.9rem', color: 'var(--ink-soft)' }} className="hover-underline">
                  → Personal Outdoor Journal
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Open-Source Ecology */}
          <div>
            <div className="field-label" style={{ marginBottom: '1rem' }}>OPEN-SOURCE ECOLOGY</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', fontSize: '0.82rem', color: 'var(--ink-soft)' }}>
              <div>
                <strong>Gemma 2:</strong> Local private inference via Ollama
              </div>
              <div>
                <strong>OpenStreetMap:</strong> Global community cartography (&copy; contributors)
              </div>
              <div>
                <strong>Nominatim:</strong> Reverse geocoding & locality resolution
              </div>
              <div>
                <strong>OSRM:</strong> Open source routing machine footpath geometry
              </div>
              <div>
                <strong>Open-Meteo:</strong> Open meteorological forecasts (no API key)
              </div>
            </div>
          </div>

          {/* Col 4: Cartographer Stamp */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', backgroundColor: 'var(--paper-card)', border: '1px solid var(--paper-border-dark)', borderRadius: '2px' }}>
              <CompassMark size={44} bearing={32} />
              <div>
                <div className="field-stamp green">FIELD LOG // READY</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--ink-muted)', marginTop: '0.2rem' }}>
                  NO TRACKING · NO CLOUD LOCK-IN · 100% OFFLINE CAPABLE
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '1.5rem',
            flexWrap: 'wrap',
            gap: '1rem',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
            color: 'var(--ink-muted)',
          }}
        >
          <div>TRAILNOTE · LOCAL-FIRST OUTDOOR FIELD NOTEBOOK</div>
          <div>REMEMBER: THE SCREEN IS THE SHORTEST PART OF THE WALK.</div>
        </div>
      </div>
    </footer>
  );
}
