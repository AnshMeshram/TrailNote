'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Printer, Download, ArrowLeft, Check, Compass, Eye, ShieldCheck, MapPin, Feather, FileText } from 'lucide-react';
import { LeafDecoration } from '@/components/ui/LeafDecoration';
import { CompassMark } from '@/components/ui/CompassMark';
import { DifficultyBadge } from '@/components/ui/DifficultyBadge';
import { OfflineNotice } from '@/components/ui/OfflineNotice';
import { TrailLine } from '@/components/ui/TrailLine';
import { WeatherStrip } from '@/components/ui/WeatherStrip';
import { OutdoorChecklist } from '@/components/ui/OutdoorChecklist';
import { ObservationPrompt } from '@/components/ui/ObservationPrompt';
import { getActiveTrail } from '@/lib/storage/offline-store';
import { TrailPlan, TrailCardData } from '@/types/trail';

export default function TrailCardPage() {
  const [activePlan, setActivePlan] = useState<TrailPlan | null>(null);
  const [activeCard, setActiveCard] = useState<TrailCardData | null>(null);
  const [isSavedOffline, setIsSavedOffline] = useState(true);

  useEffect(() => {
    const saved = getActiveTrail();
    if (saved && saved.plan && saved.card) {
      setActivePlan(saved.plan);
      setActiveCard(saved.card);
    }
  }, []);

  // Canonical fallback specimen
  const specimen = activePlan || {
    id: 'specimen-01',
    name: 'AUTUMN LOOP',
    location: 'Seminary Hills Reserve · Nagpur, Maharashtra',
    distanceKm: 4.8,
    durationMinutes: 85,
    difficulty: 'moderate' as const,
    elevationGainM: 140,
    weather: {
      tempC: 24,
      condition: 'Clear Autumn Sky',
      windKmh: 11,
      precipitationPercent: 5,
      summary: 'Crisp morning air with gentle northwest breeze.',
    },
    startPoint: 'Eastern Botanical Gate (Stone Marker #1)',
    endPoint: 'Lookout Pavilion & Basalt Ridge',
    preparation: [
      '1.0L fresh drinking water',
      'Comfortable broken-in trail boots',
      'Light windbreaker or autumn layer',
      'Physical notebook & pencil',
      'Small trash bag (Leave No Trace)',
    ],
    observations: [
      {
        id: '1',
        number: '01',
        title: 'Foliage Varieties',
        prompt: 'Look for three distinct leaf shapes on the dirt path (teak, neem, and wild acacia). Compare their vein patterns.',
        category: 'flora' as const,
      },
      {
        id: '2',
        number: '02',
        title: 'Canopy Soundscape',
        prompt: 'Pause for 60 seconds at the creek crossing. Listen for two distinct bird calls filtered through the dry canopy.',
        category: 'soundscape' as const,
      },
      {
        id: '3',
        number: '03',
        title: 'Basalt Transition',
        prompt: 'Notice where soft sandy dirt transitions into ancient volcanic basalt boulders as you ascend the ridge.',
        category: 'geology' as const,
      },
    ],
    briefing:
      'A quiet, contemplative circuit through mature teak canopy and basalt ridges. Take the narrower dirt branch 20 paces after the second stone marker to bypass the asphalt road.',
    safetyNotes: [
      'Loose dry leaves on steep downhills can be slick; watch footing.',
      'Sun dips early behind the ridge by 5:45 PM.',
    ],
    trailBriefing:
      'A quiet, contemplative circuit through mature teak canopy and basalt ridges. Take the narrower dirt branch 20 paces after the second stone marker to bypass the asphalt road.',
    fieldPrompt: 'Look up into the canopy twice as often as you look at your boots.',
    createdAt: new Date().toISOString(),
  };

  const hours = Math.floor(specimen.durationMinutes / 60);
  const mins = specimen.durationMinutes % 60;
  const durationFormatted = hours > 0 ? `${hours}h ${mins > 0 ? `${mins}m` : ''}` : `${mins}m`;

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const handleDownloadText = () => {
    const textContent = `TRAILNOTE // SIGNATURE FIELD CARD
==================================================
TRAIL: ${specimen.name}
LOCATION: ${specimen.location}
DISTANCE: ${specimen.distanceKm} KM · DURATION: ${durationFormatted}
DIFFICULTY: ${specimen.difficulty.toUpperCase()}
CONDITIONS: ${specimen.weather.tempC}°C · ${specimen.weather.condition}

BRING (PACK IT / TAKE IT):
${specimen.preparation.map((p) => `- [ ] ${p}`).join('\n')}

NOTICE (THINGS TO OBSERVE):
${specimen.observations.map((o) => `[${o.number}] ${o.title}: ${o.prompt}`).join('\n\n')}

TRAIL BRIEFING:
"${specimen.trailBriefing}"

SAFETY ADVISORY:
${specimen.safetyNotes.map((s) => `! ${s}`).join('\n')}

PHILOSOPHY:
"Plan the walk. Make the note. Put the phone away."
==================================================`;

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `trail-card-${specimen.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '5rem', maxWidth: '840px' }}>
      {/* Top Toolbar (No-Print) */}
      <div
        className="no-print"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <Link href="/trail" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', color: 'var(--ink-soft)' }}>
          <ArrowLeft size={16} />
          <span>Trail Guide</span>
        </Link>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={handleDownloadText}
            className="btn-secondary"
            style={{ padding: '0.6rem 1.1rem', fontSize: '0.85rem' }}
            title="Download formatted plain-text note"
          >
            <Download size={15} />
            <span>Download Field Note (.txt)</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="btn-secondary"
            style={{ padding: '0.6rem 1.1rem', fontSize: '0.85rem' }}
          >
            <Printer size={15} />
            <span>Print Field Card (A4)</span>
          </button>

          <Link
            href="/walk"
            className="btn-primary"
            style={{ padding: '0.6rem 1.25rem', fontSize: '0.85rem' }}
          >
            <Compass size={15} />
            <span>Start Walk (Quiet Mode)</span>
          </Link>
        </div>
      </div>

      {/* Offline Stored Badge */}
      <div className="no-print" style={{ marginBottom: '1.75rem' }}>
        <OfflineNotice isSaved={isSavedOffline} />
      </div>

      {/* THE PHYSICAL TRAIL CARD */}
      <div
        className="paper-card"
        id="printable-trail-card"
        style={{
          padding: 'clamp(1.5rem, 4vw, 2.75rem)',
          border: '2px solid var(--paper-border-dark)',
          backgroundColor: 'var(--paper-card)',
          boxShadow: 'var(--shadow-lifted)',
          position: 'relative',
        }}
      >
        {/* Botanical Corner Marks */}
        <div style={{ position: 'absolute', top: '1rem', right: '1rem', opacity: 0.25 }} className="no-print">
          <LeafDecoration size={42} color="#709F2D" variant="pressed-leaf" rotation={25} />
        </div>

        {/* Card Header */}
        <div
          style={{
            borderBottom: '2px solid var(--ink-primary)',
            paddingBottom: '1.25rem',
            marginBottom: '1.75rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <div style={{ marginBottom: '0.5rem' }}>
              <span className="field-stamp green">
                <LeafDecoration size={12} color="#3A6704" variant="maple" />
                TRAILNOTE FIELD CARD // SPECIMEN #2026-TN
              </span>
            </div>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2rem, 4vw, 2.8rem)', margin: 0, lineHeight: 1.1 }}>
              {specimen.name}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--ink-soft)', marginTop: '0.35rem' }}>
              <MapPin size={15} color="#3A6704" />
              <span>{specimen.location}</span>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <DifficultyBadge difficulty={specimen.difficulty} size="md" />
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--ink-muted)', marginTop: '0.4rem' }}>
              ISSUED: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
          </div>
        </div>

        {/* Vital Metrics Row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: '1rem',
            padding: '1rem 0',
            borderBottom: '1px dashed var(--paper-border-dark)',
            marginBottom: '1.75rem',
          }}
        >
          <div>
            <div className="field-label">TOTAL DISTANCE</div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', fontWeight: 600 }}>
              {specimen.distanceKm} <span style={{ fontSize: '0.9rem', fontFamily: 'var(--font-mono)' }}>KM</span>
            </div>
          </div>
          <div>
            <div className="field-label">EST. PACE TIME</div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', fontWeight: 600 }}>
              {durationFormatted}
            </div>
          </div>
          <div>
            <div className="field-label">TEMPERATURE</div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', fontWeight: 600 }}>
              {specimen.weather.tempC}°C <span style={{ fontSize: '0.85rem', color: 'var(--ink-muted)' }}>{specimen.weather.condition}</span>
            </div>
          </div>
          <div>
            <div className="field-label">ROUTE PATTERN</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--ink-soft)', paddingTop: '0.2rem' }}>
              Circular Footpath Loop
            </div>
          </div>
        </div>

        {/* Trail Elevation Profile */}
        <div style={{ marginBottom: '2rem' }}>
          <TrailLine distanceKm={specimen.distanceKm} elevationGainM={specimen.elevationGainM || 140} />
        </div>

        {/* Two-Column Grid: What to bring & Briefing */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.75rem',
            marginBottom: '2rem',
          }}
        >
          <div>
            <OutdoorChecklist items={specimen.preparation} title="PACK IT / TAKE IT" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <WeatherStrip weather={specimen.weather} advice="Cool autumn breeze in early afternoon. Perfect for unhurried walking." />

            <div
              style={{
                padding: '1.25rem',
                backgroundColor: 'rgba(58, 103, 4, 0.08)',
                borderLeft: '4px solid var(--green-leaf)',
                borderRadius: '2px',
              }}
            >
              <div className="field-label" style={{ color: 'var(--green-deep)', marginBottom: '0.4rem' }}>
                TRAIL BRIEFING NOTE
              </div>
              <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--green-deep)', lineHeight: 1.6, fontStyle: 'italic' }}>
                "{specimen.trailBriefing}"
              </p>
            </div>
          </div>
        </div>

        {/* Nature Observations (Gemma 2) */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <span className="field-stamp green">SENSORY RECEPTIVITY</span>
            <span className="field-label">THINGS TO NOTICE TODAY</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            {specimen.observations.map((obs, idx) => (
              <ObservationPrompt
                key={obs.id || idx}
                number={obs.number}
                title={obs.title}
                prompt={obs.prompt}
                category={obs.category?.toUpperCase()}
              />
            ))}
          </div>
        </div>

        {/* Safety Note */}
        <div
          style={{
            padding: '0.85rem 1rem',
            backgroundColor: 'var(--paper-warm)',
            border: '1px solid var(--paper-border-dark)',
            borderRadius: '2px',
            marginBottom: '1.75rem',
          }}
        >
          <div className="field-label" style={{ color: 'var(--autumn-rust)', marginBottom: '0.3rem' }}>
            SAFETY ADVISORY
          </div>
          <ul style={{ paddingLeft: '1.2rem', margin: 0, fontSize: '0.85rem', color: 'var(--ink-soft)' }}>
            {specimen.safetyNotes.map((n, i) => (
              <li key={i}>{n}</li>
            ))}
          </ul>
        </div>

        {/* 100% Offline Vector Route Snapshot for Handheld Use and Printing */}
        <div
          style={{
            padding: '1rem',
            backgroundColor: '#FAF7F0',
            border: '1px solid var(--paper-border-dark)',
            borderRadius: '2px',
            marginBottom: '1.75rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="field-stamp green" style={{ fontSize: '0.68rem' }}>
                <LeafDecoration size={11} color="#3A6704" variant="maple" />
                OFFLINE ROUTE SNAPSHOT
              </span>
              <span className="field-label" style={{ fontSize: '0.68rem' }}>VECTOR TRAIL CARTOGRAPHY</span>
            </div>
            <span className="field-mono" style={{ fontSize: '0.68rem', color: 'var(--ink-muted)' }}>
              PRINT & FIELD ORIENTATION · NO DATA REQUIRED
            </span>
          </div>

          <div style={{ width: '100%', height: '140px', backgroundColor: 'var(--paper-warm)', border: '1px solid var(--paper-border)', position: 'relative', overflow: 'hidden', borderRadius: '2px' }}>
            {/* Compass Watermark */}
            <div style={{ position: 'absolute', bottom: '8px', right: '12px', opacity: 0.25, pointerEvents: 'none' }}>
              <CompassMark size={48} bearing={22} />
            </div>

            <svg viewBox="0 0 600 140" style={{ width: '100%', height: '100%' }}>
              {/* Topographic Background Contour Lines */}
              <path d="M 0,30 Q 150,15 300,35 T 600,25" fill="none" stroke="rgba(90, 86, 75, 0.1)" strokeWidth="1" strokeDasharray="4,4" />
              <path d="M 0,70 Q 180,50 350,75 T 600,60" fill="none" stroke="rgba(90, 86, 75, 0.1)" strokeWidth="1" strokeDasharray="4,4" />
              <path d="M 0,110 Q 120,95 280,115 T 600,105" fill="none" stroke="rgba(90, 86, 75, 0.1)" strokeWidth="1" strokeDasharray="4,4" />

              {/* Main Trail Route Polyline Contour */}
              <path
                d="M 60,105 C 100,50 180,25 280,35 C 380,45 480,30 520,75 C 550,110 460,120 360,115 C 240,110 140,125 60,105 Z"
                fill="rgba(112, 159, 45, 0.08)"
                stroke="#243A18"
                strokeWidth="4"
                strokeLinejoin="round"
              />
              <path
                d="M 60,105 C 100,50 180,25 280,35 C 380,45 480,30 520,75 C 550,110 460,120 360,115 C 240,110 140,125 60,105 Z"
                fill="none"
                stroke="#709F2D"
                strokeWidth="2"
                strokeDasharray="6,4"
                strokeLinejoin="round"
              />

              {/* Waypoint Markers */}
              {/* Start Marker (S) */}
              <circle cx="60" cy="105" r="7" fill="#3A6704" stroke="#FAF7F0" strokeWidth="2" />
              <text x="60" y="108" textAnchor="middle" fill="#FAF7F0" fontSize="8" fontFamily="var(--font-mono)" fontWeight="700">S</text>
              <text x="60" y="125" textAnchor="middle" fill="#243A18" fontSize="9" fontFamily="var(--font-mono)" fontWeight="600">START (GATE)</text>

              {/* Waypoint 1 (Ridge) */}
              <circle cx="280" cy="35" r="6" fill="#E9E1CC" stroke="#6F7A0B" strokeWidth="1.5" />
              <text x="280" y="38" textAnchor="middle" fill="#20251A" fontSize="7" fontFamily="var(--font-mono)" fontWeight="700">01</text>
              <text x="280" y="24" textAnchor="middle" fill="#505647" fontSize="8" fontFamily="var(--font-mono)">RIDGE CREST</text>

              {/* Waypoint 2 (Stream) */}
              <circle cx="520" cy="75" r="6" fill="#E9E1CC" stroke="#6F7A0B" strokeWidth="1.5" />
              <text x="520" y="78" textAnchor="middle" fill="#20251A" fontSize="7" fontFamily="var(--font-mono)" fontWeight="700">02</text>
              <text x="520" y="93" textAnchor="middle" fill="#505647" fontSize="8" fontFamily="var(--font-mono)">STREAM BED</text>

              {/* Waypoint 3 (Pavilion / Finish) */}
              <circle cx="360" cy="115" r="6" fill="#A64B2A" stroke="#FAF7F0" strokeWidth="1.5" />
              <text x="360" y="118" textAnchor="middle" fill="#FAF7F0" fontSize="7" fontFamily="var(--font-mono)" fontWeight="700">F</text>
              <text x="360" y="132" textAnchor="middle" fill="#A64B2A" fontSize="8" fontFamily="var(--font-mono)" fontWeight="600">PAVILION / FINISH</text>

              {/* Scale Indicator */}
              <line x1="20" y1="20" x2="70" y2="20" stroke="#243A18" strokeWidth="2" />
              <line x1="20" y1="16" x2="20" y2="24" stroke="#243A18" strokeWidth="1.5" />
              <line x1="70" y1="16" x2="70" y2="24" stroke="#243A18" strokeWidth="1.5" />
              <text x="45" y="14" textAnchor="middle" fill="#505647" fontSize="7" fontFamily="var(--font-mono)">1 KM</text>
            </svg>
          </div>
        </div>

        {/* RULED NOTE SECTION FOR PHYSICAL FIELD PENCIL JOTTINGS */}
        <div
          style={{
            padding: '1.25rem',
            backgroundColor: '#FAF7F0',
            border: '1px solid var(--paper-border-dark)',
            borderRadius: '2px',
            marginBottom: '1.75rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <span className="field-label" style={{ color: 'var(--green-deep)' }}>
              PHYSICAL FIELD JOTTINGS // PENCIL OBSERVATIONS
            </span>
            <span className="field-stamp" style={{ fontSize: '0.65rem' }}>
              PUT THE PHONE AWAY · WRITE BY HAND
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '0.5rem 0' }}>
            <div style={{ borderBottom: '1px solid #D8CFBA', height: '1.2rem' }}></div>
            <div style={{ borderBottom: '1px solid #D8CFBA', height: '1.2rem' }}></div>
            <div style={{ borderBottom: '1px solid #D8CFBA', height: '1.2rem' }}></div>
          </div>
        </div>

        {/* Card Stamps & Verification Banner */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.6rem 0.85rem',
            backgroundColor: 'var(--paper-warm)',
            border: '1px solid var(--paper-border-dark)',
            borderRadius: '2px',
            marginBottom: '1.5rem',
            flexWrap: 'wrap',
            gap: '0.5rem',
            fontSize: '0.72rem',
            fontFamily: 'var(--font-mono)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: 'var(--green-leaf)', fontWeight: 700 }}>● SAVED TO THIS DEVICE</span>
            <span style={{ color: 'var(--ink-muted)' }}>·</span>
            <span>OSRM FOOTPATH ROUTE VERIFIED</span>
          </div>
          <div style={{ color: 'var(--ink-muted)' }}>
            CARTOGRAPHY: OPENSTREETMAP · WEATHER: OPEN-METEO
          </div>
        </div>

        {/* Footer / Take This Outside */}
        <div
          style={{
            borderTop: '2px solid var(--paper-border-dark)',
            paddingTop: '1.25rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--ink-muted)' }}>
            LOCAL MODEL: GEMMA 2 · OPEN-SOURCE INFRASTRUCTURE · LEAVE NO TRACE
          </div>

          <Link
            href="/walk"
            className="btn-primary no-print"
            style={{ padding: '0.75rem 1.6rem' }}
          >
            <span>[ TAKE THIS OUTSIDE ]</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
