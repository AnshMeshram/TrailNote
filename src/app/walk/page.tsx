'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Compass, Check, ArrowRight, Play, Pause, ArrowLeft, Volume2, VolumeX, Eye, Moon, Sun, CheckCircle } from 'lucide-react';
import { getActiveTrail, startWalkTimer, completeWalkTimer, formatLedgerSummary, getScreenTimeLedger } from '@/lib/storage/offline-store';
import { TrailPlan } from '@/types/trail';

export default function WalkModePage() {
  const router = useRouter();
  const [trail, setTrail] = useState<TrailPlan | null>(null);
  const [currentWaypointIdx, setCurrentWaypointIdx] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [observedItems, setObservedItems] = useState<Record<number, boolean>>({});

  // Pocket Mode & Hardware API states
  const [isPocketMode, setIsPocketMode] = useState(false);
  const [isRevealedInPocket, setIsRevealedInPocket] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [hasSpeechSupport, setHasSpeechSupport] = useState(false);
  const [hasWakeLockSupport, setHasWakeLockSupport] = useState(false);
  const wakeLockRef = useRef<any>(null);

  // Walk completion & ledger
  const [isWalkComplete, setIsWalkComplete] = useState(false);
  const [ledgerSummary, setLedgerSummary] = useState<string>('');

  useEffect(() => {
    const active = getActiveTrail();
    if (active && active.plan) {
      setTrail(active.plan);
    }
    // Start ledger walk timer
    startWalkTimer();

    // Feature detect SpeechSynthesis
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setHasSpeechSupport(true);
    }
    // Feature detect Screen Wake Lock
    if (typeof navigator !== 'undefined' && 'wakeLock' in navigator) {
      setHasWakeLockSupport(true);
    }

    return () => {
      // Cleanup speech and wake lock on exit
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {});
        wakeLockRef.current = null;
      }
    };
  }, []);

  // Timer tick
  useEffect(() => {
    if (!isTimerRunning || isWalkComplete) return;
    const interval = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimerRunning, isWalkComplete]);

  // Manage Wake Lock based on active waypoint inspection
  useEffect(() => {
    if (!hasWakeLockSupport) return;

    if (isRevealedInPocket || (!isPocketMode && !isWalkComplete)) {
      // Acquire wake lock while user is actively reading
      if (!wakeLockRef.current) {
        (navigator as any).wakeLock
          ?.request('screen')
          .then((wl: any) => {
            wakeLockRef.current = wl;
          })
          .catch(() => {});
      }
    } else {
      // Release wake lock in dark pocket mode to conserve battery
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {});
        wakeLockRef.current = null;
      }
    }
  }, [isPocketMode, isRevealedInPocket, isWalkComplete, hasWakeLockSupport]);

  const plan = trail || {
    id: 'specimen-01',
    name: 'Seminary Hills Trail Loop',
    location: 'Seminary Hills Reserve · Nagpur',
    distanceKm: 4.8,
    durationMinutes: 85,
    waypoints: [
      { id: '1', order: 1, name: 'Eastern Botanical Gate', note: 'Start of trail. Pocket your device here.' },
      { id: '2', order: 2, name: 'Ridge View & Boundary Stone', note: 'Take eastern footpath after the stone.' },
      { id: '3', order: 3, name: 'Valley Stream Crossing', note: 'Listen for two distinct bird calls.' },
      { id: '4', order: 4, name: 'Lookout Pavilion & Ridge Finish', note: 'Loop conclusion.' },
    ],
    observations: [
      { id: '1', number: '01', title: 'Foliage Veins', prompt: 'Look for three distinct leaf shapes on the dirt path. Compare their vein structure.' },
      { id: '2', number: '02', title: 'Canopy Soundscape', prompt: 'Pause along the footpath for 60 seconds. Listen for bird calls through the canopy.' },
      { id: '3', number: '03', title: 'Basalt Transition', prompt: 'Notice where sandy soil gives way to volcanic basalt rock.' },
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

  const toggleObservation = (idx: number) => {
    setObservedItems((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const currentObservation = plan.observations[currentWaypointIdx % plan.observations.length];

  // Speech synthesis toggle
  const toggleAudioPrompt = () => {
    if (!hasSpeechSupport || !currentObservation) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(currentObservation.prompt);
      utterance.rate = 0.9; // Calm unhurried pace
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Complete walk action
  const handleFinishWalk = () => {
    if (isSpeaking && typeof window !== 'undefined') {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
    const result = completeWalkTimer(elapsedSeconds);
    setLedgerSummary(result.summary);
    setIsWalkComplete(true);
    setIsPocketMode(false);
  };

  // ========================================================
  // RENDER: FINISH SCREEN WITH SCREEN-TIME LEDGER
  // ========================================================
  if (isWalkComplete) {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: 'var(--paper-bg)',
          color: 'var(--ink-primary)',
          padding: '2rem 1.5rem',
          maxWidth: '560px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: '2rem',
        }}
      >
        <div
          className="paper-card"
          style={{
            padding: '2.5rem 1.75rem',
            textAlign: 'center',
            border: '2px solid var(--paper-border-dark)',
            backgroundColor: 'var(--paper-card)',
            boxShadow: 'var(--shadow-tactile)',
          }}
        >
          <div style={{ display: 'inline-flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: 'rgba(58, 103, 4, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid var(--green-leaf)',
              }}
            >
              <CheckCircle size={28} color="var(--green-leaf)" />
            </div>
          </div>

          <h1
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '2.2rem',
              fontWeight: 700,
              lineHeight: 1.15,
              marginBottom: '0.5rem',
            }}
          >
            Walk complete.
          </h1>

          <p style={{ fontSize: '1rem', color: 'var(--ink-soft)', marginBottom: '1.75rem' }}>
            {plan.name} · {plan.distanceKm} km
          </p>

          {/* Screen-Time Ledger Display */}
          <div
            style={{
              padding: '1.25rem',
              backgroundColor: 'var(--paper-warm)',
              border: '1px solid var(--paper-border-dark)',
              borderRadius: '4px',
              marginBottom: '2rem',
            }}
          >
            <div className="field-label" style={{ fontSize: '0.7rem', color: 'var(--ink-muted)', marginBottom: '0.4rem' }}>
              SCREEN-TIME LEDGER
            </div>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '1.15rem',
                fontWeight: 700,
                color: 'var(--green-deep)',
                letterSpacing: '-0.01em',
              }}
            >
              {ledgerSummary || formatLedgerSummary(getScreenTimeLedger().planningDurationSeconds, elapsedSeconds)}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--ink-soft)', marginTop: '0.35rem' }}>
              Measured via Page Visibility API · 100% on-device ledger
            </div>
          </div>

          {/* Action to Field Notes */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <Link
              href="/field-notes"
              className="btn-primary"
              style={{
                padding: '0.95rem 1.5rem',
                fontSize: '1rem',
                minHeight: '48px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
              }}
            >
              <span>Record Field Notes</span>
              <ArrowRight size={18} />
            </Link>

            <Link
              href="/trail-card"
              className="btn-secondary"
              style={{
                padding: '0.8rem 1.25rem',
                fontSize: '0.9rem',
                minHeight: '48px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span>View Saved Trail Card</span>
            </Link>
          </div>
        </div>

        {/* Deliberate Manifesto Sign-off */}
        <div style={{ textAlign: 'center', paddingTop: '1rem', borderTop: '1px dashed var(--paper-border-dark)' }}>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.85rem',
              fontWeight: 700,
              letterSpacing: '0.1em',
              color: 'var(--autumn-rust)',
              marginBottom: '0.35rem',
            }}
          >
            [ PUT THE PHONE AWAY ]
          </div>
          <p style={{ margin: 0, fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '1rem', color: 'var(--ink-soft)' }}>
            "The screen was the shortest part of the walk."
          </p>
        </div>
      </div>
    );
  }

  // ========================================================
  // RENDER: POCKET MODE (LOW-POWER, NEAR-BLACK OLED SCREEN)
  // ========================================================
  if (isPocketMode) {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: '#090D07',
          color: '#FAF7F0',
          padding: '2rem 1.5rem',
          maxWidth: '560px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '2rem',
        }}
      >
        {/* Low-power top status */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#A4D652' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', letterSpacing: '0.08em', color: '#88987E' }}>
              POCKET MODE · SCREEN DARKENED
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              setIsPocketMode(false);
              setIsRevealedInPocket(false);
            }}
            style={{
              background: 'none',
              border: '1px solid #2B3A22',
              color: '#FAF7F0',
              padding: '0.45rem 0.85rem',
              borderRadius: '4px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              cursor: 'pointer',
              minHeight: '48px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <Sun size={15} />
            <span>Normal Mode</span>
          </button>
        </div>

        {/* Center: Waypoint name or reveal */}
        <div style={{ textAlign: 'center', margin: 'auto 0' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#7E9173', marginBottom: '0.6rem' }}>
            WAYPOINT {currentWaypointIdx + 1} OF {waypoints.length}
          </div>

          <h2
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(1.8rem, 6vw, 2.5rem)',
              color: '#FAF7F0',
              lineHeight: 1.2,
              marginBottom: '1.25rem',
            }}
          >
            {currentWp.name}
          </h2>

          {isRevealedInPocket ? (
            <div
              style={{
                backgroundColor: '#121A0F',
                border: '1px solid #2E4024',
                padding: '1.5rem',
                borderRadius: '6px',
                marginBottom: '1.5rem',
                textAlign: 'left',
              }}
            >
              {currentWp.note && (
                <p style={{ margin: '0 0 1rem 0', fontSize: '0.95rem', color: '#D5DFC8', lineHeight: 1.5 }}>
                  "{currentWp.note}"
                </p>
              )}

              {currentObservation && (
                <div style={{ borderTop: '1px dashed #2E4024', paddingTop: '1rem' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#A4D652', marginBottom: '0.35rem' }}>
                    NOTICE // {currentObservation.title}
                  </div>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: '#C0CEB5', lineHeight: 1.5 }}>
                    {currentObservation.prompt}
                  </p>
                </div>
              )}

              <button
                type="button"
                onClick={() => setIsRevealedInPocket(false)}
                style={{
                  width: '100%',
                  marginTop: '1.25rem',
                  padding: '0.75rem',
                  backgroundColor: '#1B2917',
                  border: '1px solid #3A542A',
                  color: '#FAF7F0',
                  borderRadius: '4px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  minHeight: '48px',
                }}
              >
                Hide Details & Return to Pocket
              </button>
            </div>
          ) : (
            <div>
              <p style={{ fontSize: '0.9rem', color: '#7E9173', marginBottom: '2rem' }}>
                Screen dimmed to save battery and keep your eyes on the trail.
              </p>

              <button
                type="button"
                onClick={() => setIsRevealedInPocket(true)}
                style={{
                  width: '100%',
                  padding: '1.15rem 1.5rem',
                  backgroundColor: '#1E2C1A',
                  border: '2px solid #3E5A2E',
                  borderRadius: '6px',
                  color: '#FAF7F0',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '1.05rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  minHeight: '60px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.6rem',
                }}
              >
                <Eye size={20} color="#A4D652" />
                <span>Tap to Reveal Details</span>
              </button>
            </div>
          )}

          {/* Next Waypoint or Complete */}
          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            {!isLastWaypoint ? (
              <button
                type="button"
                onClick={() => {
                  setCurrentWaypointIdx((i) => Math.min(waypoints.length - 1, i + 1));
                  setIsRevealedInPocket(false);
                }}
                style={{
                  flex: 1,
                  padding: '0.85rem',
                  backgroundColor: '#273B20',
                  border: '1px solid #456535',
                  color: '#FAF7F0',
                  borderRadius: '4px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  minHeight: '48px',
                }}
              >
                Next Waypoint →
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinishWalk}
                style={{
                  flex: 1,
                  padding: '0.85rem',
                  backgroundColor: '#3A6704',
                  border: '1px solid #579906',
                  color: '#FAF7F0',
                  borderRadius: '4px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  minHeight: '48px',
                }}
              >
                Finish Walk
              </button>
            )}
          </div>
        </div>

        {/* Bottom finish button */}
        <div style={{ textAlign: 'center' }}>
          <button
            type="button"
            onClick={handleFinishWalk}
            style={{
              background: 'none',
              border: 'none',
              color: '#88987E',
              fontSize: '0.85rem',
              textDecoration: 'underline',
              cursor: 'pointer',
              padding: '0.5rem',
              minHeight: '48px',
            }}
          >
            End Walk Early &amp; View Ledger
          </button>
        </div>
      </div>
    );
  }

  // ========================================================
  // RENDER: STANDARD SUNLIGHT WALK MODE
  // ========================================================
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
      {/* Top Status Bar */}
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
              minHeight: '48px',
              padding: '0 0.25rem',
            }}
          >
            <ArrowLeft size={16} />
            <span>Trail Guide</span>
          </Link>

          {/* Pocket Mode Quick Toggle (48px+ touch target) */}
          <button
            type="button"
            onClick={() => setIsPocketMode(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.5rem 0.9rem',
              backgroundColor: '#20251A',
              color: '#FAF7F0',
              border: 'none',
              borderRadius: '4px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              minHeight: '48px',
            }}
            title="Switch to low-power dark pocket mode"
          >
            <Moon size={15} color="#A4D652" />
            <span>POCKET MODE</span>
          </button>

          {/* Timer pill */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              backgroundColor: '#E9E1CC',
              padding: '0.35rem 0.75rem',
              borderRadius: '3px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.9rem',
              fontWeight: 700,
              minHeight: '48px',
            }}
          >
            <span>{timeFormatted}</span>
            <button
              type="button"
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                padding: '0.25rem',
              }}
              title={isTimerRunning ? 'Pause timer' : 'Resume timer'}
            >
              {isTimerRunning ? <Pause size={14} color="#20251A" /> : <Play size={14} color="#3A6704" />}
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
            {plan.location} · {plan.distanceKm} km
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
            marginBottom: '1.75rem',
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
            <p style={{ margin: '0 auto 1.5rem auto', fontSize: '0.95rem', color: '#505647', maxWidth: '400px', lineHeight: 1.5 }}>
              "{currentWp.note}"
            </p>
          )}

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            {!isLastWaypoint ? (
              <button
                type="button"
                onClick={() => setCurrentWaypointIdx((i) => Math.min(waypoints.length - 1, i + 1))}
                className="btn-primary"
                style={{ padding: '0.85rem 1.6rem', fontSize: '0.95rem', minHeight: '48px' }}
              >
                <span>Reached Waypoint</span>
                <ArrowRight size={16} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinishWalk}
                className="btn-primary"
                style={{ padding: '0.85rem 1.75rem', fontSize: '0.95rem', backgroundColor: '#3A6704', minHeight: '48px' }}
              >
                <Check size={16} />
                <span>Finish Walk &amp; View Ledger</span>
              </button>
            )}
          </div>
        </div>

        {/* SENSORY PROMPT FOR THIS SEGMENT WITH OPTIONAL AUDIO */}
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Eye size={15} color="#A64B2A" />
                <span className="field-label" style={{ color: '#A64B2A' }}>
                  THINGS TO NOTICE // {currentObservation.number}
                </span>
              </div>

              {/* Optional SpeechSynthesis Audio Button */}
              {hasSpeechSupport && (
                <button
                  type="button"
                  onClick={toggleAudioPrompt}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.35rem 0.65rem',
                    backgroundColor: isSpeaking ? 'rgba(58, 103, 4, 0.12)' : 'var(--paper-warm)',
                    border: '1px solid',
                    borderColor: isSpeaking ? 'var(--green-leaf)' : 'var(--paper-border-dark)',
                    borderRadius: '3px',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    fontFamily: 'var(--font-mono)',
                    color: isSpeaking ? 'var(--green-leaf)' : 'var(--ink-soft)',
                    minHeight: '48px',
                  }}
                  title={isSpeaking ? 'Stop audio' : 'Listen to observation prompt via browser audio'}
                >
                  {isSpeaking ? <VolumeX size={15} /> : <Volume2 size={15} />}
                  <span>{isSpeaking ? 'Stop Audio' : 'Listen Prompt'}</span>
                </button>
              )}
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
                padding: '0.55rem 0.95rem',
                backgroundColor: observedItems[currentWaypointIdx] ? 'rgba(58, 103, 4, 0.1)' : '#E9E1CC',
                border: '1px solid',
                borderColor: observedItems[currentWaypointIdx] ? '#3A6704' : '#C5BBA4',
                borderRadius: '3px',
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: observedItems[currentWaypointIdx] ? '#3A6704' : '#20251A',
                minHeight: '48px',
              }}
            >
              <Check size={14} strokeWidth={3} />
              <span>{observedItems[currentWaypointIdx] ? 'Observed with your senses' : 'Mark Observed'}</span>
            </button>
          </div>
        )}
      </div>

      {/* DELIBERATE "PUT YOUR PHONE AWAY" INSTRUCTION */}
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
          <button
            type="button"
            onClick={handleFinishWalk}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '0.88rem',
              color: '#3A6704',
              textDecoration: 'underline',
              textUnderlineOffset: '3px',
              cursor: 'pointer',
              minHeight: '48px',
            }}
          >
            Finished walk? Record field notes &amp; view screen-time ledger →
          </button>
        </div>
      </div>
    </div>
  );
}
