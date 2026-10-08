'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Compass, Check, ArrowRight, Printer, MapPin, Feather, Sparkles, RefreshCw, Share2 } from 'lucide-react';
import { LeafDecoration } from '@/components/ui/LeafDecoration';
import { TrailHeader } from '@/components/ui/TrailHeader';
import { DistanceBlock } from '@/components/ui/DistanceBlock';
import { WeatherStrip } from '@/components/ui/WeatherStrip';
import { OutdoorChecklist } from '@/components/ui/OutdoorChecklist';
import { ObservationPrompt } from '@/components/ui/ObservationPrompt';
import { TrailLine } from '@/components/ui/TrailLine';
import { TrailMarker } from '@/components/ui/TrailMarker';
import { OfflineNotice } from '@/components/ui/OfflineNotice';
import { PaperTrailMap } from '@/components/map/PaperTrailMap';
import { getActiveTrail, saveActiveTrail } from '@/lib/storage/offline-store';
import { TrailPlan, TrailCardData } from '@/types/trail';
import { getSeason } from '@/lib/season';

export default function TrailResultPage() {
  const router = useRouter();
  const [trailPlan, setTrailPlan] = useState<TrailPlan | null>(null);
  const [trailCard, setTrailCard] = useState<TrailCardData | null>(null);
  const [isSavedOffline, setIsSavedOffline] = useState(false);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    const active = getActiveTrail();
    if (active && active.plan) {
      setTrailPlan(active.plan);
      setTrailCard(active.card);
      setIsSavedOffline(true);
    }
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem('trailnote_user_coords');
      if (raw) {
        try {
          setUserCoords(JSON.parse(raw));
        } catch {}
      }
    }
  }, []);

  const seasonInfo = getSeason(new Date(), trailPlan?.waypoints?.[0]?.coordinate?.lat || 21.16);

  const plan = trailPlan || {
    id: 'specimen-01',
    name: `${seasonInfo.label} · Seminary Hills`,
    location: 'Seminary Hills Reserve, Nagpur, Maharashtra, India',
    region: 'Nagpur',
    coordinatesSummary: "21°09'N 79°03'E",
    distanceKm: 4.8,
    durationMinutes: 85,
    difficulty: 'moderate' as const,
    elevationGainM: 140,
    terrain: ['Dirt Trail', 'Forested Canopy', 'Gentle Ridge'],
    startPoint: 'Eastern Botanical Gate (Marker #1)',
    endPoint: 'Lookout Pavilion & Ridge Crest',
    routeSummary: 'Contoured natural loop circuit',
    waypoints: [
      { id: '1', order: 1, name: 'Eastern Botanical Gate', note: 'Start of trail. Place device in backpack.', isMilestone: true, coordinate: { lat: 21.1643, lng: 79.0628 } },
      { id: '2', order: 2, name: 'Boundary Stone & Ridge View', note: 'Take the eastern dirt branch after the stone.', coordinate: { lat: 21.1685, lng: 79.069 } },
      { id: '3', order: 3, name: 'Valley Creek Crossing', note: 'Pause for 60 seconds to listen for bird calls.', coordinate: { lat: 21.163, lng: 79.074 } },
      { id: '4', order: 4, name: 'Lookout Pavilion & Finish', note: 'Loop conclusion. Take out field notes.', isMilestone: true, coordinate: { lat: 21.1643, lng: 79.0628 } },
    ],
    weather: {
      tempC: 24,
      condition: 'Clear Autumn Sky',
      windKmh: 11,
      precipitationPercent: 5,
      summary: 'Crisp morning air with gentle northwest breeze',
    },
    preparation: [
      '1.0L fresh drinking water',
      'Comfortable broken-in trail boots',
      'Light windbreaker or autumn layer',
      'Physical notebook & pencil',
      'Small bag for Leave No Trace',
    ],
    safetyNotes: [
      'Loose dry leaves on steep downhills can be slick; watch footing.',
      'Sun dips behind the ridge by late afternoon.',
    ],
    observations: [
      {
        id: '1',
        number: '01',
        title: 'Foliage Varieties & Vein Structure',
        prompt: 'Look for three distinct leaf shapes on the dirt path. Examine how their primary veins branch.',
        category: 'flora' as const,
      },
      {
        id: '2',
        number: '02',
        title: 'Canopy Soundscape',
        prompt: 'Pause for 60 seconds at the creek crossing. Listen for two distinct bird calls through the canopy.',
        category: 'soundscape' as const,
      },
      {
        id: '3',
        number: '03',
        title: 'Basalt Transition',
        prompt: 'Notice where sandy soil transitions into ancient volcanic basalt boulders on the ascent.',
        category: 'geology' as const,
      },
    ],
    outdoorChallenges: [
      'Walk the first 15 minutes in unbroken silence.',
      'Record no photos—only written pencil observations in your journal.',
    ],
    trailBriefing:
      'A quiet, contemplative circuit through mature canopy and basalt ridges. Take the narrower dirt branch 20 paces after the second stone marker to bypass the road.',
    fieldPrompt: 'Look up into the canopy twice as often as you look at your boots.',
    createdAt: new Date().toISOString(),
  };

  const handleSaveOffline = () => {
    if (trailPlan && trailCard) {
      saveActiveTrail(trailPlan, trailCard);
    }
    setIsSavedOffline(true);
  };

  return (
    <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '5rem', maxWidth: '920px' }}>
      {/* Top Breadcrumb & Action Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <Link href="/plan" style={{ fontSize: '0.88rem', color: 'var(--ink-soft)' }}>
          ← Back to Trail Permit
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={handleSaveOffline}
            className="btn-secondary"
            style={{ padding: '0.55rem 1rem', fontSize: '0.85rem' }}
          >
            <Check size={14} color="#3A6704" />
            <span>{isSavedOffline ? '● Saved to Device' : 'Save Offline'}</span>
          </button>

          <Link
            href="/trail-card"
            className="btn-secondary"
            style={{ padding: '0.55rem 1.1rem', fontSize: '0.85rem' }}
          >
            <Printer size={15} />
            <span>Make Trail Card</span>
          </Link>

          <Link
            href="/walk"
            className="btn-primary"
            style={{ padding: '0.55rem 1.25rem', fontSize: '0.85rem' }}
          >
            <Compass size={15} />
            <span>Start Walk</span>
          </Link>
        </div>
      </div>

      {/* Offline Stored Banner */}
      <div style={{ marginBottom: '1.75rem' }}>
        <OfflineNotice isSaved={isSavedOffline} />
      </div>

      {/* 1. TRAILNOTE FIELD PLAN: HEADER & LOCATION */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ marginBottom: '0.75rem' }}>
          <span className="field-stamp green">
            <LeafDecoration size={13} color="#3A6704" variant="pine" />
            TRAILNOTE FIELD PLAN // {plan.id.toUpperCase()}
          </span>
        </div>
        <TrailHeader
          name={plan.name}
          location={plan.location}
          difficulty={plan.difficulty}
          coordinates={plan.coordinatesSummary}
        >
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Link href="/walk" className="btn-primary" style={{ padding: '0.65rem 1.4rem' }}>
              <Compass size={16} />
              <span>Start Walk</span>
            </Link>
          </div>
        </TrailHeader>
      </div>

      {/* 2. DISTANCE, TIME, DIFFICULTY, ELEVATION */}
      <div style={{ marginBottom: '2rem' }}>
        <DistanceBlock
          distanceKm={plan.distanceKm}
          durationMinutes={plan.durationMinutes}
          elevationM={plan.elevationGainM}
          difficultyLabel={plan.difficulty.toUpperCase()}
        />
      </div>

      {/* 3. MAP */}
      <div style={{ marginBottom: '2rem' }}>
        <PaperTrailMap
          coordinates={plan.waypoints.map((w) => [w.coordinate?.lat || 21.1643, w.coordinate?.lng || 79.0628])}
          waypoints={plan.waypoints}
          currentLocation={plan.deviceLocation || userCoords || undefined}
          distanceKm={plan.distanceKm}
          elevationGainM={plan.elevationGainM}
          height="380px"
        />
      </div>

      {/* 4. CURRENT CONDITIONS */}
      <div style={{ marginBottom: '2rem' }}>
        <WeatherStrip
          weather={plan.weather}
          advice="Atmospheric readings verified via Open-Meteo. Layer appropriately for ridge breezes."
        />
      </div>

      {/* 5. TRAIL BRIEFING */}
      <div
        style={{
          padding: '1.75rem',
          backgroundColor: 'rgba(58, 103, 4, 0.08)',
          borderLeft: '4px solid var(--green-leaf)',
          borderRadius: '3px',
          marginBottom: '2rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div className="field-label" style={{ color: 'var(--green-deep)' }}>
            NATURALIST TRAIL BRIEFING · GEMMA 2
          </div>
          <span className="field-stamp green" style={{ fontSize: '0.65rem' }}>
            LOCAL INFERENCE
          </span>
        </div>
        <p style={{ margin: 0, fontSize: '1.05rem', color: 'var(--green-deep)', lineHeight: 1.65, fontStyle: 'italic', fontFamily: 'var(--font-serif)' }}>
          "{plan.trailBriefing}"
        </p>
        {plan.fieldPrompt && (
          <div style={{ marginTop: '0.85rem', paddingTop: '0.65rem', borderTop: '1px dashed rgba(58, 103, 4, 0.3)', fontSize: '0.88rem', color: 'var(--ink-soft)' }}>
            <strong>Naturalist Field Directive:</strong> {plan.fieldPrompt}
          </div>
        )}
      </div>

      {/* 6. WHAT TO BRING */}
      <div style={{ marginBottom: '2rem' }}>
        <OutdoorChecklist items={plan.preparation} title="WHAT TO BRING // FIELD GEAR & PREPARATION" />
      </div>

      {/* 7. THINGS TO NOTICE */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="field-stamp accent">SENSORY PROMPTS</span>
            <span className="field-label">THINGS TO NOTICE OUTDOORS</span>
          </div>
          <span className="field-label" style={{ color: 'var(--ink-muted)' }}>
            SCREEN-FREE ENGAGEMENT
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
          {plan.observations.map((obs, idx) => (
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

      {/* 8. SAFETY & OUTDOOR CHALLENGE */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.5rem',
          marginBottom: '3rem',
        }}
      >
        <div className="paper-card" style={{ padding: '1.5rem', border: '1px solid var(--paper-border-dark)' }}>
          <div className="field-label" style={{ color: 'var(--autumn-rust)', marginBottom: '0.5rem' }}>
            SAFETY & TERRAIN ADVISORY
          </div>
          <ul style={{ paddingLeft: '1.2rem', margin: 0, fontSize: '0.9rem', color: 'var(--ink-soft)', lineHeight: 1.6 }}>
            {plan.safetyNotes.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>

        <div className="paper-card" style={{ padding: '1.5rem', border: '1px solid var(--paper-border-dark)' }}>
          <div className="field-label" style={{ color: 'var(--green-leaf)', marginBottom: '0.5rem' }}>
            OUTDOOR CHALLENGE
          </div>
          <ul style={{ paddingLeft: '1.2rem', margin: 0, fontSize: '0.9rem', color: 'var(--ink-soft)', lineHeight: 1.6 }}>
            {plan.outdoorChallenges.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* 9. ACTIONS */}
      <div
        style={{
          borderTop: '2px solid var(--paper-border-dark)',
          paddingTop: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.25rem',
          backgroundColor: 'var(--paper-warm)',
          padding: '1.75rem',
          borderRadius: '3px',
          border: '1px solid var(--paper-border-dark)',
        }}
      >
        <div>
          <div className="field-stamp green" style={{ marginBottom: '0.35rem' }}>
            DISPATCH READY
          </div>
          <div style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'var(--ink-soft)', fontSize: '1.05rem' }}>
            "Plan the walk. Make the note. Put the phone away."
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link href="/trail-card" className="btn-secondary" style={{ padding: '0.75rem 1.4rem' }}>
            <Printer size={16} />
            <span>Make Trail Card</span>
          </Link>

          <button
            type="button"
            onClick={handleSaveOffline}
            className="btn-secondary"
            style={{ padding: '0.75rem 1.4rem' }}
          >
            <Check size={16} color="#3A6704" />
            <span>{isSavedOffline ? 'Saved Offline' : 'Save Offline'}</span>
          </button>

          <Link href="/walk" className="btn-primary" style={{ padding: '0.75rem 1.75rem' }}>
            <Compass size={16} />
            <span>Start Walk</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
