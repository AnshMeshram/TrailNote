'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Feather, Check, ArrowRight, Sparkles, MapPin, Camera, X, Image as ImageIcon } from 'lucide-react';
import { LeafDecoration } from '@/components/ui/LeafDecoration';
import { getActiveTrail, saveJournalEntry } from '@/lib/storage/offline-store';
import { FieldJournalEntry } from '@/types/trail';

export default function FieldNotesPage() {
  const [trailName, setTrailName] = useState('Autumn Loop · Seminary Hills');
  const [location, setLocation] = useState('Nagpur, Maharashtra');
  const [distanceKm, setDistanceKm] = useState(4.8);
  const [sight, setSight] = useState('');
  const [sound, setSound] = useState('');
  const [texture, setTexture] = useState('');
  const [favoritePart, setFavoritePart] = useState('');
  const [observations, setObservations] = useState('');
  const [difficultyFeedback, setDifficultyFeedback] = useState('Just right / Accurate');
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const active = getActiveTrail();
    if (active && active.plan) {
      setTrailName(active.plan.name);
      setLocation(active.plan.location);
      setDistanceKm(active.plan.distanceKm);
    }
  }, []);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit: max 4MB for local storage safety
    if (file.size > 4 * 1024 * 1024) {
      alert('Please select an image smaller than 4MB for local offline notebook storage.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setPhotoDataUrl(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setPhotoDataUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const recordedList = [
      sight ? `Sight: ${sight}` : '',
      sound ? `Sound: ${sound}` : '',
      texture ? `Texture: ${texture}` : '',
      favoritePart ? `Marker: ${favoritePart}` : '',
    ].filter(Boolean);

    const entry: FieldJournalEntry = {
      id: `entry-${Date.now()}`,
      trailId: `trail-${Date.now()}`,
      trailName,
      location,
      date: new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }),
      distanceCoveredKm: distanceKm,
      timeSpentMinutes: Math.round(distanceKm * 16),
      observationsRecorded: recordedList,
      personalReflection: observations || sight || 'Quiet walk through the autumn terrain.',
      weatherExperienced: 'Crisp autumn weather',
      notableFloraFauna: favoritePart ? [favoritePart] : undefined,
      photoUrls: photoDataUrl ? [photoDataUrl] : undefined,
      sight,
      sound,
      texture,
      favoriteMoment: favoritePart,
    };

    saveJournalEntry(entry);
    setIsSaved(true);
  };

  return (
    <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '5rem', maxWidth: '800px' }}>
      <div
        style={{
          borderBottom: '2px solid var(--paper-border-dark)',
          paddingBottom: '1.5rem',
          marginBottom: '2rem',
        }}
      >
        <div style={{ marginBottom: '0.5rem' }}>
          <span className="field-stamp green">
            <LeafDecoration size={13} color="#3A6704" variant="fern" />
            POST-WALK FIELD NOTES // SPECIMEN LOG
          </span>
        </div>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.6rem', margin: '0 0 0.5rem 0' }}>
          Record Field Notes
        </h1>
        <p style={{ margin: 0, color: 'var(--ink-soft)' }}>
          You've returned from your walk. Jot down what you saw, heard, and felt while the memory is fresh.
        </p>
      </div>

      {isSaved ? (
        <div
          className="paper-card"
          style={{
            padding: '2.5rem',
            textAlign: 'center',
            backgroundColor: 'var(--paper-card)',
            border: '1px solid var(--green-leaf)',
          }}
        >
          <div style={{ display: 'inline-flex', padding: '0.75rem', backgroundColor: 'rgba(58, 103, 4, 0.1)', borderRadius: '50%', marginBottom: '1rem' }}>
            <Check size={28} color="#3A6704" />
          </div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', marginBottom: '0.5rem' }}>
            Field Note Preserved
          </h2>
          <p style={{ color: 'var(--ink-soft)', marginBottom: '1.5rem' }}>
            Your outdoor reflection has been filed to your personal offline journal.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link href="/journal" className="btn-primary">
              <span>View Outdoor Journal</span>
              <ArrowRight size={16} />
            </Link>
            <Link href="/plan" className="btn-secondary">
              <span>Plan Next Walk</span>
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSave} className="paper-card" style={{ padding: '2rem', border: '1px solid var(--paper-border-dark)' }}>
          {/* Header metadata inputs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem', marginBottom: '1.75rem' }}>
            <div>
              <label className="field-label" style={{ display: 'block', marginBottom: '0.4rem' }}>
                TRAIL EXPEDITION
              </label>
              <input
                type="text"
                className="field-input"
                value={trailName}
                onChange={(e) => setTrailName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="field-label" style={{ display: 'block', marginBottom: '0.4rem' }}>
                LOCATION / REGION
              </label>
              <input
                type="text"
                className="field-input"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </div>

          {/* Section: SENSORY OBSERVATIONS */}
          <div
            style={{
              padding: '1.25rem',
              backgroundColor: 'var(--paper-warm)',
              border: '1px solid var(--paper-border-dark)',
              borderRadius: '2px',
              marginBottom: '1.75rem',
            }}
          >
            <div className="field-label" style={{ color: 'var(--green-deep)', marginBottom: '1rem' }}>
              NATURALIST SENSORY RECEPTORS // SIGHT · SOUND · TEXTURE
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div>
                <label className="field-label" style={{ display: 'block', marginBottom: '0.35rem', color: 'var(--ink-primary)' }}>
                  1. SIGHT — WHAT CAUGHT YOUR EYE?
                </label>
                <input
                  type="text"
                  className="field-input"
                  placeholder="e.g. Pale veins on deep rust teak leaves; afternoon sunbeams cutting through canopy"
                  value={sight}
                  onChange={(e) => setSight(e.target.value)}
                />
              </div>

              <div>
                <label className="field-label" style={{ display: 'block', marginBottom: '0.35rem', color: 'var(--ink-primary)' }}>
                  2. SOUND — WHAT DID YOU HEAR?
                </label>
                <input
                  type="text"
                  className="field-input"
                  placeholder="e.g. Dry leaves crunching underfoot, three-note sunbird whistle near the ridge"
                  value={sound}
                  onChange={(e) => setSound(e.target.value)}
                />
              </div>

              <div>
                <label className="field-label" style={{ display: 'block', marginBottom: '0.35rem', color: 'var(--ink-primary)' }}>
                  3. TEXTURE — WHAT DID YOU TOUCH?
                </label>
                <input
                  type="text"
                  className="field-input"
                  placeholder="e.g. Rough basalt boulder face, cool creek water, dusty dirt path"
                  value={texture}
                  onChange={(e) => setTexture(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Section: RAW REFLECTION */}
          <div style={{ marginBottom: '1.75rem' }}>
            <label className="field-label" style={{ display: 'block', marginBottom: '0.4rem' }}>
              PERSONAL REFLECTION & OUTDOOR THOUGHTS
            </label>
            <textarea
              rows={4}
              className="field-textarea"
              placeholder="Jot down whatever comes to mind from the walk. How did your breathing feel? What surprised you about the trail?"
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              required
            />
          </div>

          {/* Section: FAVORITE MOMENT */}
          <div style={{ marginBottom: '1.75rem' }}>
            <label className="field-label" style={{ display: 'block', marginBottom: '0.4rem' }}>
              FAVORITE QUIET MOMENT
            </label>
            <input
              type="text"
              className="field-input"
              placeholder="e.g. Leaning against the stone marker watching the hawk soar overhead."
              value={favoritePart}
              onChange={(e) => setFavoritePart(e.target.value)}
            />
          </div>

          {/* Section: LOCAL PHOTO ATTACHMENT */}
          <div
            style={{
              marginBottom: '1.75rem',
              padding: '1.25rem',
              border: '1px dashed var(--paper-border-dark)',
              backgroundColor: 'var(--paper-card)',
              borderRadius: '2px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Camera size={16} color="#3A6704" />
                <span className="field-label" style={{ color: 'var(--green-deep)' }}>
                  LOCAL PHOTO ATTACHMENT (OPTIONAL)
                </span>
              </div>
              <span className="field-label" style={{ fontSize: '0.68rem', color: 'var(--ink-muted)' }}>
                PRESERVED LOCALLY ON DEVICE · NO CLOUD UPLOAD
              </span>
            </div>

            {photoDataUrl ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <div
                  style={{
                    position: 'relative',
                    width: '120px',
                    height: '90px',
                    borderRadius: '3px',
                    overflow: 'hidden',
                    border: '2px solid var(--paper-border-dark)',
                    boxShadow: 'var(--shadow-tactile)',
                  }}
                >
                  <img
                    src={photoDataUrl}
                    alt="Trail attachment preview"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    style={{
                      position: 'absolute',
                      top: '4px',
                      right: '4px',
                      backgroundColor: 'rgba(0,0,0,0.65)',
                      color: '#FFF',
                      border: 'none',
                      borderRadius: '50%',
                      width: '20px',
                      height: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                    }}
                    title="Remove attached photo"
                  >
                    <X size={12} />
                  </button>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--ink-soft)' }}>
                  <strong>Field photo attached.</strong>
                  <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.78rem', color: 'var(--ink-muted)' }}>
                    Saved into your local offline field notebook.
                  </p>
                </div>
              </div>
            ) : (
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoSelect}
                  style={{ display: 'none' }}
                  id="field-photo-input"
                />
                <label
                  htmlFor="field-photo-input"
                  className="btn-secondary"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.55rem 1rem',
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                  }}
                >
                  <ImageIcon size={15} color="#3A6704" />
                  <span>Select Local Trail Photo</span>
                </label>
              </div>
            )}
          </div>

          {/* Trail Difficulty Feedback */}
          <div style={{ marginBottom: '2rem' }}>
            <label className="field-label" style={{ display: 'block', marginBottom: '0.4rem' }}>
              TRAIL DIFFICULTY FEEDBACK
            </label>
            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
              {['Easier than expected', 'Just right / Accurate', 'Steeper than anticipated'].map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setDifficultyFeedback(opt)}
                  className={`field-checkbox-pill ${difficultyFeedback === opt ? 'active' : ''}`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', borderTop: '1px dashed var(--paper-border)', paddingTop: '1.5rem' }}>
            <button type="submit" className="btn-primary" style={{ padding: '0.75rem 1.75rem' }}>
              <Feather size={16} />
              <span>Save to Field Journal</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
