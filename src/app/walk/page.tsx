'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Compass, Check, ArrowRight, Play, Pause, RotateCcw, AlertTriangle, Eye, ArrowLeft } from 'lucide-react';
import { LeafDecoration } from '@/components/ui/LeafDecoration';
import { getActiveTrail } from '@/lib/storage/offline-store';
import { TrailPlan } from '@/types/trail';

export default function WalkModePage() {
  const router = useRouter();
  const [trail, setTrail] = useState<TrailPlan | null>(null);
  const [currentWaypointIdx, setCurrentWaypointIdx] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [observedItems, setObservedItems] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const active = getActiveTrail();
    if (active && active.plan) {
      setTrail(active.plan);
    }
  }, []);

  // Timer tick
  useEffect(() => {
    if (!isTimerRunning) return;
    const interval = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const plan = trail || {
    id: 'specimen-01',
    name: 'Autumn Loop',
    location: 'Seminary Hills Reserve · Nagpur',
    distanceKm: 4.8,
    durationMinutes: 85,
    waypoints: [
      { id: '1', order: 1, name: 'Eastern Botanical Gate', note: 'Start of trail. Pocket your device here.' },
      { id: '2', order: 2, name: 'Ridge View & Boundary Stone', note: 'Take eastern footpath after the stone.' },
      { id: '3', order: 3, name: 'Valley Creek Crossing', note: 'Listen for two distinct bird calls.' },
      { id: '4', order: 4, name: 'Lookout Pavilion & Finish', note: 'Loop conclusion.' },
    ],
    observations: [
      { id: '1', number: '01', title: 'Foliage Veins', prompt: 'Look for three distinct leaf shapes on the dirt path. Compare their vein structure.' },
      { id: '2', number: '02', title: 'Canopy Soundscape', prompt: 'Pause at the stream crossing for 60 seconds. Listen for bird calls through the trees.' },
      { id: '3', number: '03', title: 'Basalt Transition', prompt: 'Notice where sandy soil gives way to volcanic basalt boulders.' },
    ],
    safetyNotes: ['Watch footing on loose leaf-covered downhills.'],
  };

  const waypoints = plan.waypoints || [];
  const currentWp = waypoints[currentWaypointIdx] || waypoints[0];
  const isLastWaypoint = currentWaypointIdx >= waypoints.length - 1;

  // Formatting timer
  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;
  const timeFormatted = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  // Distance estimate for current segment
  const segmentDistance = (plan.distanceKm / Math.max(1, waypoints.length - 1)).toFixed(1);

  const toggleObservation = (idx: number) => {
    setObservedItems((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const currentObservation = plan.observations[currentWaypointIdx % plan.observations.length];

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#FAF7F0',
        color: '#20251A',
        padding: '1.5rem',
        maxWidth: '560px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '2rem',
      }}
    >
      {/* Top Minimal Status Bar */}
      <div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingBottom: '1rem',
            borderBottom: '1px solid #D8CFBA',
            marginBottom: '1.5rem',
          }}
        >
          <Link
            href="/trail"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.85rem',
              color: '#505647',
            }}
          >
            <ArrowLeft size={15} />
            <span>Trail Guide</span>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#A4D652', border: '1px solid #3A6704' }} />
            <span className="field-mono" style={{ fontSize: '0.75rem', fontWeight: 700, color: '#3A6704' }}>
              OUTDOOR WALK MODE
            </span>
          </div>

          {/* Timer pill */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              backgroundColor: '#E9E1CC',
              padding: '0.25rem 0.6rem',
              borderRadius: '2px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.85rem',
              fontWeight: 700,
            }}
          >
            <span>{timeFormatted}</span>
            <button
              type="button"
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 0 }}
              title={isTimerRunning ? 'Pause timer' : 'Resume timer'}
            >
              {isTimerRunning ? <Pause size={13} color="#20251A" /> : <Play size={13} color="#3A6704" />}
            </button>
          </div>
        </div>

        {/* Trail Title */}
        <div style={{ marginBottom: '1.75rem' }}>
          <h1
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '1.9rem',
              lineHeight: 1.15,
              margin: '0 0 0.25rem 0',
            }}
          >
            {plan.name}
          </h1>
          <div style={{ fontSize: '0.85rem', color: '#505647' }}>
            {plan.location} · {plan.distanceKm} km total
          </div>
        </div>

        {/* HIGH CONTRAST WAYPOINT BLOCK */}
        <div
          style={{
            backgroundColor: '#E9E1CC',
            border: '2px solid #C5BBA4',
            borderRadius: '4px',
            padding: '2rem 1.5rem',
            textAlign: 'center',
            marginBottom: '2rem',
            boxShadow: '0 2px 6px rgba(32, 37, 26, 0.05)',
          }}
        >
          <div className="field-label" style={{ fontSize: '0.75rem', color: '#767E6D', marginBottom: '0.4rem' }}>
            TARGET WAYPOINT // {currentWaypointIdx + 1} OF {waypoints.length}
          </div>

          <div
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(1.75rem, 5vw, 2.25rem)',
              fontWeight: 600,
              lineHeight: 1.15,
              color: '#20251A',
              marginBottom: '0.65rem',
            }}
          >
            {currentWp.name}
          </div>

          {currentWp.note && (
            <p style={{ margin: '0 auto 1.25rem auto', fontSize: '0.95rem', color: '#505647', maxWidth: '380px', lineHeight: 1.5 }}>
              "{currentWp.note}"
            </p>
          )}

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            {!isLastWaypoint ? (
              <button
                type="button"
                onClick={() => setCurrentWaypointIdx((i) => Math.min(waypoints.length - 1, i + 1))}
                className="btn-primary"
                style={{ padding: '0.75rem 1.5rem', fontSize: '0.92rem' }}
              >
                <span>Reached Waypoint</span>
                <ArrowRight size={16} />
              </button>
            ) : (
              <Link
                href="/field-notes"
                className="btn-primary"
                style={{ padding: '0.85rem 1.75rem', fontSize: '0.95rem', backgroundColor: '#3A6704' }}
              >
                <Check size={16} />
                <span>Finish Walk & Record Notes</span>
              </Link>
            )}
          </div>
        </div>

        {/* SENSORY PROMPT FOR THIS SEGMENT */}
        {currentObservation && (
          <div
            style={{
              backgroundColor: '#FAF7F0',
              border: '1px solid #D8CFBA',
              borderRadius: '3px',
              padding: '1.25rem',
              marginBottom: '1.75rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Eye size={15} color="#A64B2A" />
                <span className="field-label" style={{ color: '#A64B2A' }}>
                  NOTICE // {currentObservation.number}
                </span>
              </div>
              <span className="field-label" style={{ fontSize: '0.65rem' }}>
                TOUCH GRASS
              </span>
            </div>

            <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.15rem', margin: '0 0 0.35rem 0' }}>
              {currentObservation.title}
            </h4>

            <p style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: '#505647', lineHeight: 1.55 }}>
              {currentObservation.prompt}
            </p>

            <button
              type="button"
              onClick={() => toggleObservation(currentWaypointIdx)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.45rem 0.85rem',
                backgroundColor: observedItems[currentWaypointIdx] ? 'rgba(58, 103, 4, 0.1)' : '#E9E1CC',
                border: '1px solid',
                borderColor: observedItems[currentWaypointIdx] ? '#3A6704' : '#C5BBA4',
                borderRadius: '2px',
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.78rem',
                fontWeight: 600,
                color: observedItems[currentWaypointIdx] ? '#3A6704' : '#20251A',
              }}
            >
              <Check size={13} strokeWidth={3} />
              <span>{observedItems[currentWaypointIdx] ? 'Observed with your senses' : 'Mark Observed'}</span>
            </button>
          </div>
        )}
      </div>

      {/* PROMINENT "PUT YOUR PHONE AWAY" INSTRUCTION */}
      <div
        style={{
          borderTop: '2px dashed #D8CFBA',
          paddingTop: '1.5rem',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.82rem',
            fontWeight: 700,
            letterSpacing: '0.08em',
            color: '#795548',
            marginBottom: '0.35rem',
          }}
        >
          [ PUT YOUR PHONE AWAY ]
        </div>
        <p style={{ margin: 0, fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '1rem', color: '#505647' }}>
          "Look up at the branches. Listen to the wind. Keep walking."
        </p>

        <div style={{ marginTop: '1.25rem' }}>
          <Link
            href="/field-notes"
            style={{
              fontSize: '0.85rem',
              color: '#3A6704',
              textDecoration: 'underline',
              textUnderlineOffset: '3px',
            }}
          >
            Finished your walk? Record your field notes →
          </Link>
        </div>
      </div>
    </div>
  );
}
