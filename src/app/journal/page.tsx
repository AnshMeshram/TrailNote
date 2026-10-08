'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  MapPin,
  Feather,
  Compass,
  Trash2,
  Download,
  FileJson,
  FileText,
  Check,
  X,
  Sparkles,
} from 'lucide-react';
import { LeafDecoration } from '@/components/ui/LeafDecoration';
import { listJournalEntries, saveJournalEntry } from '@/lib/storage/offline-store';
import { FieldJournalEntry } from '@/types/trail';
import { getPhotoDataUrl } from '@/lib/storage/photo-db';

function JournalPhoto({
  photoId,
  fallbackUrl,
  altText,
}: {
  photoId?: string;
  fallbackUrl?: string;
  altText?: string;
}) {
  const [dataUrl, setDataUrl] = useState<string | null>(fallbackUrl || null);

  useEffect(() => {
    let isMounted = true;
    if (photoId) {
      getPhotoDataUrl(photoId)
        .then((url) => {
          if (isMounted && url) {
            setDataUrl(url);
          }
        })
        .catch(() => {});
    }
    return () => {
      isMounted = false;
    };
  }, [photoId]);

  if (!dataUrl) return null;

  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <div
        style={{
          maxWidth: '320px',
          padding: '6px 6px 12px 6px',
          backgroundColor: '#FAF7F0',
          border: '1px solid var(--paper-border-dark)',
          borderRadius: '2px',
          boxShadow: 'var(--shadow-tactile)',
        }}
      >
        <img
          src={dataUrl}
          alt={altText || 'Local trail field specimen photograph'}
          style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '1px' }}
        />
        <div
          className="field-label"
          style={{
            fontSize: '0.62rem',
            textAlign: 'center',
            marginTop: '6px',
            color: 'var(--ink-muted)',
          }}
        >
          {altText || 'FIELD SPECIMEN // LOCAL ATTACHMENT'}
        </div>
      </div>
    </div>
  );
}

export default function JournalPage() {
  const [entries, setEntries] = useState<FieldJournalEntry[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [shapingId, setShapingId] = useState<string | null>(null);
  const [pendingProposal, setPendingProposal] = useState<{
    entryId: string;
    shapedNote: string;
    source: 'gemma2' | 'naturalist-fallback';
  } | null>(null);

  useEffect(() => {
    const saved = listJournalEntries();
    if (saved && saved.length > 0) {
      setEntries(saved);
    } else {
      // Seed default canonical walk if user hasn't recorded yet
      const seedWalks: FieldJournalEntry[] = [
        {
          id: 'log-01',
          trailId: 'trail-01',
          date: 'October 5, 2026',
          trailName: 'Autumn Loop · Seminary Hills',
          location: 'Nagpur, Maharashtra',
          distanceCoveredKm: 4.8,
          timeSpentMinutes: 85,
          observationsRecorded: [
            'Found three distinct leaf shapes on northern slope.',
            'Teak leaves were dry and crackling underfoot.',
            'Sunbird call echoing near the stone boundary.',
          ],
          personalReflection:
            'A quiet autumn walk through the teak groves. The air was crisp and dry. Put phone on airplane mode at marker one—felt much more observant of wind and branch rustle.',
          weatherExperienced: '24°C Clear Autumn Sky',
          notableFloraFauna: ['Mature teak canopy', 'Purple sunbird', 'Basalt outcrop'],
          sight: 'Fallen teak leaves blanketing the trail; sun filtering through branches',
          sound: 'Crackle of dry leaves underfoot; distant sunbird call',
          texture: 'Rough basalt outcrops and dry soil',
          shapedNote:
            'Under the quiet canopy of Seminary Hills, the morning unfolded in slow cadence. Teak leaves blanketed the earth in brittle rust, releasing a dry autumn fragrance at every step. In the silence between breaths, a purple sunbird called from the basalt ridge, anchoring the ascent in the tactile terrain of rock and tree. With devices left in airplane mode, the living landscape stepped forward into focus.',
          shapedSource: 'naturalist-fallback',
        },
      ];
      setEntries(seedWalks);
    }
    setIsLoaded(true);
  }, []);

  // Gentle outdoor-days count (5.4: no streaks, no gamification badges, no notifications)
  const currentMonthName = new Date().toLocaleDateString('en-US', { month: 'long' });
  const walksThisMonth = entries.filter((e) =>
    e.date.toLowerCase().includes(currentMonthName.toLowerCase())
  ).length;

  const handleShapeNote = async (entry: FieldJournalEntry) => {
    setShapingId(entry.id);
    try {
      const res = await fetch('/api/shape-note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawNote: entry.personalReflection,
          location: entry.location,
          trailName: entry.trailName,
          sight: entry.sight,
          sound: entry.sound,
          texture: entry.texture,
          favoriteMoment: entry.favoriteMoment,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.shapedNote) {
          // Present proposal to user: original stays visible, user accepts or rejects
          setPendingProposal({
            entryId: entry.id,
            shapedNote: data.shapedNote,
            source: (data.source === 'gemma2' ? 'gemma2' : 'naturalist-fallback'),
          });
        }
      }
    } catch (err) {
      console.error('Error shaping note:', err);
    } finally {
      setShapingId(null);
    }
  };

  const handleAcceptProposal = (entryId: string) => {
    if (!pendingProposal || pendingProposal.entryId !== entryId) return;
    const updated = entries.map((e) =>
      e.id === entryId
        ? {
            ...e,
            shapedNote: pendingProposal.shapedNote,
            shapedSource: pendingProposal.source,
          }
        : e
    );
    setEntries(updated);
    const target = updated.find((e) => e.id === entryId);
    if (target) {
      saveJournalEntry(target);
    }
    setPendingProposal(null);
  };

  const handleRejectProposal = () => {
    setPendingProposal(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Remove this field note from your offline journal?')) {
      const updated = entries.filter((e) => e.id !== id);
      setEntries(updated);
      if (typeof window !== 'undefined') {
        localStorage.setItem('trailnote_journal_entries', JSON.stringify(updated));
      }
    }
  };

  const handleClearAll = () => {
    if (
      confirm('Clear all offline journal entries from this device? This action cannot be undone.') &&
      confirm('Are you completely sure? All local walk notes will be cleared.')
    ) {
      setEntries([]);
      if (typeof window !== 'undefined') {
        localStorage.setItem('trailnote_journal_entries', JSON.stringify([]));
      }
    }
  };

  const handleExportMarkdown = () => {
    const md = `# Trailnote Field Journal
Exported: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
Total Expeditions: ${entries.length}

${entries
  .map(
    (e) => `## ${e.trailName}
- **Date:** ${e.date}
- **Location:** ${e.location}
- **Distance:** ${e.distanceCoveredKm} km
- **Duration:** ${e.timeSpentMinutes} min
- **Weather:** ${e.weatherExperienced}

### Original Observation Note
> ${e.personalReflection}

${
  e.shapedNote
    ? `### Field Note // Naturalist Prose (${e.shapedSource === 'gemma2' ? 'Gemma 2' : 'Built-in Rules'})
> ${e.shapedNote}
`
    : ''
}
${
  e.sight || e.sound || e.texture
    ? `### Sensory Observations
${e.sight ? `- **Sight:** ${e.sight}\n` : ''}${e.sound ? `- **Sound:** ${e.sound}\n` : ''}${
        e.texture ? `- **Texture:** ${e.texture}\n` : ''
      }`
    : ''
}
${
  e.observationsRecorded && e.observationsRecorded.length > 0
    ? `### Observations Recorded\n${e.observationsRecorded.map((obs) => `- ${obs}`).join('\n')}\n`
    : ''
}
---
`
  )
  .join('\n')}`;

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trailnote-journal-${new Date().toISOString().split('T')[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportJson = () => {
    const jsonStr = JSON.stringify(entries, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trailnote-journal-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '5rem', maxWidth: '860px' }}>
      {/* Top Header */}
      <div
        style={{
          borderBottom: '2px solid var(--paper-border-dark)',
          paddingBottom: '1.5rem',
          marginBottom: '2rem',
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
              <LeafDecoration size={13} color="#3A6704" variant="oak" />
              FIELD JOURNAL // PERSONAL EXPEDITIONS
            </span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.6rem', margin: '0 0 0.35rem 0' }}>
            Outdoor Journal
          </h1>
          <p style={{ margin: 0, color: 'var(--ink-soft)' }}>
            A quiet record of the dirt you've walked, the air you've breathed, and what you noticed along the way.
          </p>

          {/* Gentle Outdoor-Days Count (5.4: no streaks, no gamification badges, no notifications) */}
          <div style={{ marginTop: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            <span
              className="field-stamp green"
              style={{ fontSize: '0.82rem', padding: '0.35rem 0.65rem' }}
            >
              🍃 {walksThisMonth} {walksThisMonth === 1 ? 'walk' : 'walks'} this month
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--ink-muted)', fontFamily: 'var(--font-mono)' }}>
              {entries.length} total walks outside · stored on this device
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            type="button"
            onClick={handleExportMarkdown}
            className="btn-secondary"
            style={{ padding: '0.55rem 0.9rem', fontSize: '0.82rem', minHeight: '48px' }}
            title="Export all journal entries to Markdown file"
          >
            <FileText size={14} />
            <span>Export (.md)</span>
          </button>

          <button
            type="button"
            onClick={handleExportJson}
            className="btn-secondary"
            style={{ padding: '0.55rem 0.9rem', fontSize: '0.82rem', minHeight: '48px' }}
            title="Export raw data to JSON file"
          >
            <FileJson size={14} />
            <span>Export (.json)</span>
          </button>

          <Link
            href="/field-test"
            className="btn-secondary"
            style={{ padding: '0.55rem 0.9rem', fontSize: '0.82rem', minHeight: '48px' }}
          >
            <span>Field Test Log</span>
          </Link>

          <Link
            href="/plan"
            className="btn-primary"
            style={{ padding: '0.55rem 1.15rem', fontSize: '0.85rem', minHeight: '48px' }}
          >
            <Compass size={15} />
            <span>Plan Walk</span>
          </Link>
        </div>
      </div>

      {/* Empty State Check */}
      {isLoaded && entries.length === 0 ? (
        <div
          className="paper-card"
          style={{
            padding: '4rem 2rem',
            textAlign: 'center',
            border: '1px dashed var(--paper-border-dark)',
            backgroundColor: 'var(--paper-card)',
          }}
        >
          <div style={{ marginBottom: '1.25rem' }}>
            <LeafDecoration size={48} color="#709F2D" variant="grass" opacity={0.6} />
          </div>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', marginBottom: '0.5rem' }}>
            No walks recorded yet.
          </h3>
          <p style={{ color: 'var(--ink-soft)', marginBottom: '1.75rem', maxWidth: '420px', margin: '0 auto 1.75rem auto' }}>
            Your first field note is waiting outside. Step through the front door, let your senses awaken, and return to jot down what you observed.
          </p>
          <Link href="/plan" className="btn-primary" style={{ minHeight: '48px' }}>
            <Compass size={16} />
            <span>Plan Your First Walk</span>
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {entries.map((walk) => {
            const hours = Math.floor(walk.timeSpentMinutes / 60);
            const mins = walk.timeSpentMinutes % 60;
            const durationStr = hours > 0 ? `${hours}h ${mins > 0 ? `${mins}m` : ''}` : `${mins}m`;
            const isShapingThis = shapingId === walk.id;
            const hasPendingProposal = pendingProposal?.entryId === walk.id;

            return (
              <article
                key={walk.id}
                className="paper-card"
                style={{
                  padding: '1.75rem',
                  border: '1px solid var(--paper-border-dark)',
                  backgroundColor: 'var(--paper-card)',
                  boxShadow: 'var(--shadow-tactile)',
                }}
              >
                {/* Header */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    borderBottom: '1px solid var(--paper-border)',
                    paddingBottom: '0.85rem',
                    marginBottom: '1.25rem',
                    flexWrap: 'wrap',
                    gap: '0.75rem',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
                      <span className="field-stamp">{walk.date}</span>
                      <span className="field-stamp green">LOGGED</span>
                    </div>
                    <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.45rem', margin: 0 }}>
                      {walk.trailName}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--ink-soft)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
                      <MapPin size={13} color="#3A6704" />
                      <span>{walk.location}</span>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span className="field-label">TOTAL DISTANCE</span>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.15rem', fontWeight: 700 }}>
                      {walk.distanceCoveredKm} KM · {durationStr}
                    </div>
                  </div>
                </div>

                {/* Local Photo Attachment (IndexedDB or URL) */}
                <JournalPhoto
                  photoId={walk.photoId}
                  fallbackUrl={walk.photoUrls?.[0]}
                  altText={walk.photoAlt}
                />

                {/* ORIGINAL NOTE (ALWAYS REMAINS VISIBLE) */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <div className="field-label" style={{ marginBottom: '0.35rem', color: 'var(--ink-muted)' }}>
                    ORIGINAL FIELD JOTTING
                  </div>
                  <p style={{ fontSize: '0.96rem', color: 'var(--ink-primary)', lineHeight: 1.6, fontStyle: 'italic', margin: 0 }}>
                    "{walk.personalReflection}"
                  </p>
                </div>

                {/* PENDING SHAPED PROPOSAL (Phase 9: User accepts or rejects; original always visible) */}
                {hasPendingProposal && (
                  <div
                    style={{
                      padding: '1.25rem',
                      backgroundColor: 'rgba(58, 103, 4, 0.08)',
                      border: '2px solid var(--green-leaf)',
                      borderRadius: '3px',
                      marginBottom: '1.25rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <span className="field-label" style={{ color: 'var(--green-deep)', fontWeight: 700 }}>
                        PROPOSED PROSE // {pendingProposal.source === 'gemma2' ? 'GEMMA 2 ACTIVE' : 'BUILT-IN FIELD RULES'}
                      </span>
                      <span className="field-stamp green" style={{ fontSize: '0.65rem' }}>
                        AWAITING YOUR APPROVAL
                      </span>
                    </div>

                    <p style={{ margin: '0 0 1rem 0', fontSize: '0.98rem', color: 'var(--green-deep)', lineHeight: 1.65, fontStyle: 'italic', fontFamily: 'var(--font-serif)' }}>
                      "{pendingProposal.shapedNote}"
                    </p>

                    <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center' }}>
                      <button
                        type="button"
                        onClick={() => handleAcceptProposal(walk.id)}
                        className="btn-primary"
                        style={{ padding: '0.45rem 0.95rem', fontSize: '0.8rem', minHeight: '44px' }}
                      >
                        <Check size={14} />
                        <span>Accept Shaped Prose</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleRejectProposal}
                        className="btn-secondary"
                        style={{ padding: '0.45rem 0.95rem', fontSize: '0.8rem', minHeight: '44px' }}
                      >
                        <X size={14} />
                        <span>Keep Original Only</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* SAVED AI FIELD NOTE SECTION (If previously accepted) */}
                {!hasPendingProposal && walk.shapedNote && (
                  <div
                    style={{
                      padding: '1.25rem',
                      backgroundColor: 'rgba(58, 103, 4, 0.06)',
                      borderLeft: '3px solid var(--green-leaf)',
                      borderRadius: '2px',
                      marginBottom: '1.25rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <span className="field-label" style={{ color: 'var(--green-deep)' }}>
                        ACCEPTED FIELD PROSE // {walk.shapedSource === 'gemma2' ? 'GEMMA 2' : 'BUILT-IN RULES'}
                      </span>
                      <span className="field-stamp green" style={{ fontSize: '0.65rem' }}>
                        PRESERVED
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.96rem', color: 'var(--green-deep)', lineHeight: 1.65, fontStyle: 'italic', fontFamily: 'var(--font-serif)' }}>
                      "{walk.shapedNote}"
                    </p>
                  </div>
                )}

                {/* Sensory Sights / Sounds / Textures */}
                {(walk.sight || walk.sound || walk.texture) && (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: '0.75rem',
                      padding: '0.75rem',
                      backgroundColor: 'var(--paper-warm)',
                      border: '1px solid var(--paper-border-dark)',
                      borderRadius: '2px',
                      marginBottom: '1rem',
                      fontSize: '0.82rem',
                    }}
                  >
                    {walk.sight && (
                      <div>
                        <strong style={{ color: 'var(--green-deep)', display: 'block', fontSize: '0.72rem' }}>SIGHT:</strong>
                        <span>{walk.sight}</span>
                      </div>
                    )}
                    {walk.sound && (
                      <div>
                        <strong style={{ color: 'var(--moss-brass)', display: 'block', fontSize: '0.72rem' }}>SOUND:</strong>
                        <span>{walk.sound}</span>
                      </div>
                    )}
                    {walk.texture && (
                      <div>
                        <strong style={{ color: 'var(--autumn-rust)', display: 'block', fontSize: '0.72rem' }}>TEXTURE:</strong>
                        <span>{walk.texture}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Noted Observations List */}
                {walk.observationsRecorded && walk.observationsRecorded.length > 0 && (
                  <div style={{ marginBottom: '1rem' }}>
                    <div className="field-label" style={{ fontSize: '0.65rem', marginBottom: '0.35rem' }}>
                      NOTED OBSERVATIONS:
                    </div>
                    <ul style={{ paddingLeft: '1.2rem', margin: 0, fontSize: '0.86rem', color: 'var(--ink-soft)' }}>
                      {walk.observationsRecorded.map((obs, i) => (
                        <li key={i}>{obs}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Footer Action Bar */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: '0.75rem',
                    borderTop: '1px dashed var(--paper-border)',
                    flexWrap: 'wrap',
                    gap: '0.5rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => handleShapeNote(walk)}
                      disabled={isShapingThis}
                      className="btn-secondary"
                      style={{ padding: '0.45rem 0.85rem', fontSize: '0.78rem', minHeight: '44px' }}
                    >
                      <Feather size={13} color="#3A6704" />
                      <span>{isShapingThis ? 'Shaping with Gemma...' : walk.shapedNote ? 'Propose New Prose' : 'Shape This Note'}</span>
                    </button>

                    {walk.notableFloraFauna && walk.notableFloraFauna.length > 0 && (
                      walk.notableFloraFauna.map((s, i) => (
                        <span key={i} className="field-stamp green" style={{ fontSize: '0.72rem' }}>
                          {s}
                        </span>
                      ))
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDelete(walk.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--ink-muted)',
                      cursor: 'pointer',
                      padding: '0.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      minHeight: '44px',
                      minWidth: '44px',
                      justifyContent: 'center',
                    }}
                    title="Remove entry"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </article>
            );
          })}

          {/* Clear Journal Action */}
          <div style={{ textAlign: 'right', paddingTop: '1rem' }}>
            <button
              type="button"
              onClick={handleClearAll}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--terracotta)',
                fontSize: '0.78rem',
                fontFamily: 'var(--font-mono)',
                cursor: 'pointer',
                textDecoration: 'underline',
                minHeight: '44px',
              }}
            >
              [ Clear All Journal Entries ]
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
