'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ClipboardCheck,
  Camera,
  Check,
  Save,
  Share2,
  Printer,
  Compass,
  ArrowLeft,
  AlertTriangle,
  Upload,
  Trash2,
} from 'lucide-react';
import { LeafDecoration } from '@/components/ui/LeafDecoration';
import {
  getFieldTestRecord,
  saveFieldTestRecord,
  getDefaultFieldTestRecord,
} from '@/lib/storage/offline-store';
import { FieldTestRecord } from '@/types/trail';

export default function FieldTestPage() {
  const [record, setRecord] = useState<FieldTestRecord>(getDefaultFieldTestRecord());
  const [isSaved, setIsSaved] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);

  useEffect(() => {
    const saved = getFieldTestRecord();
    if (saved) {
      setRecord(saved);
    }
  }, []);

  const handleCheckboxToggle = (key: keyof FieldTestRecord['checklistPassed']) => {
    setRecord((prev) => ({
      ...prev,
      checklistPassed: {
        ...prev.checklistPassed,
        [key]: !prev.checklistPassed[key],
      },
    }));
    setIsSaved(false);
  };

  const handleFieldChange = (field: keyof FieldTestRecord, value: string) => {
    setRecord((prev) => ({
      ...prev,
      [field]: value,
    }));
    setIsSaved(false);
  };

  const handleSave = () => {
    saveFieldTestRecord(record);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setRecord((prev) => ({ ...prev, photoUrl: dataUrl }));
      setIsSaved(false);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setRecord((prev) => ({ ...prev, photoUrl: undefined }));
    setIsSaved(false);
  };

  const handleCopyMarkdown = () => {
    const md = `### Field Test Verification Log (Real Walk)

- **Date:** ${record.date || '[DATE]'}
- **Location:** ${record.place || '[LOCATION]'}
- **Weather Experienced:** ${record.weather || '[WEATHER]'}
- **Checklist Passed:**
  - [x] Printed Trail Card carried: ${record.checklistPassed.cardPrinted ? 'Yes' : 'Pending'}
  - [x] Pre-saved offline: ${record.checklistPassed.presavedOffline ? 'Yes' : 'Pending'}
  - [x] Airplane-mode verified: ${record.checklistPassed.airplaneModeTested ? 'Yes' : 'Pending'}
  - [x] Physical pencil carried: ${record.checklistPassed.pencilPacked ? 'Yes' : 'Pending'}

#### What Worked
${record.whatWorked || '[Describe what worked cleanly outside]'}

#### What Failed or Needed Improvement
${record.whatFailed || '[Describe real friction points encountered]'}

#### One Surprise
${record.oneSurprise || '[One unexpected finding from the walk]'}

${record.notes ? `#### Field Notes\n${record.notes}` : ''}
`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(md).then(() => {
        setCopyFeedback(true);
        setTimeout(() => setCopyFeedback(false), 2500);
      });
    }
  };

  return (
    <div className="content-container py-8" style={{ maxWidth: '860px', margin: '0 auto', padding: '1.5rem 1rem 4rem' }}>
      {/* Breadcrumb / Top Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <Link
          href="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: 'var(--ink-soft)',
            textDecoration: 'none',
            fontSize: '0.85rem',
            fontFamily: 'var(--font-mono)',
            minHeight: '48px',
          }}
        >
          <ArrowLeft size={16} />
          <span>BACK TO OVERVIEW</span>
        </Link>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="button"
            onClick={() => window.print()}
            className="btn-secondary"
            style={{ padding: '0.5rem 0.9rem', fontSize: '0.8rem', minHeight: '48px' }}
          >
            <Printer size={15} />
            <span>Print Checklist</span>
          </button>

          <button
            type="button"
            onClick={handleCopyMarkdown}
            className="btn-secondary"
            style={{ padding: '0.5rem 0.9rem', fontSize: '0.8rem', minHeight: '48px' }}
          >
            <Share2 size={15} />
            <span>{copyFeedback ? 'Copied Markdown!' : 'Copy Markdown'}</span>
          </button>
        </div>
      </div>

      {/* Page Title & Purpose */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
          <span className="field-stamp green">
            <LeafDecoration size={12} color="#3A6704" variant="oak" />
            FIELD TEST PROTOCOL // REAL OUTDOOR VALIDATION
          </span>
        </div>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.9rem, 4vw, 2.6rem)', margin: '0.2rem 0 0.5rem', lineHeight: 1.15 }}>
          Take It Outside: Real Field Test
        </h1>
        <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--ink-soft)', maxWidth: '680px', lineHeight: 1.55 }}>
          The core rule of Trailnote: <strong>the screen is the shortest part of the walk</strong>. Record what actually happened on a real outdoor test.
          Leave placeholders until the real test is conducted.
        </p>
      </div>

      {/* SECTION 1: ONE-PAGE CHECKLIST TO CARRY */}
      <div
        className="paper-card"
        style={{
          padding: '1.5rem',
          border: '2px solid var(--paper-border-dark)',
          marginBottom: '2rem',
          backgroundColor: 'var(--paper-card)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--paper-border-dark)', paddingBottom: '0.75rem' }}>
          <div>
            <span className="field-label" style={{ color: 'var(--green-deep)', fontSize: '0.75rem' }}>
              SECTION 01 // CARRY CHECKLIST
            </span>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.35rem', margin: '0.2rem 0 0' }}>
              Outdoor Departure Checklist
            </h2>
          </div>
          <ClipboardCheck size={24} color="#3A6704" />
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--ink-soft)', marginBottom: '1.25rem' }}>
          Complete these checks before walking out the door. All items can be carried physically.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {[
            {
              key: 'cardPrinted' as const,
              title: 'Print the Trail Card (A4 or Pocket Fold)',
              desc: 'Use /trail-card -> Print. Ensure vector route SVG and field jottings lines are visible.',
            },
            {
              key: 'presavedOffline' as const,
              title: 'Pre-Save Offline in Browser Store',
              desc: 'Open /trail-card to ensure the route is stored locally in device localStorage.',
            },
            {
              key: 'airplaneModeTested' as const,
              title: 'Airplane-Mode Test at Trailhead',
              desc: 'Toggle phone to Airplane Mode. Verify /trail-card, /walk, and /journal open without signal.',
            },
            {
              key: 'pencilPacked' as const,
              title: 'Pack Physical Pencil & Paper',
              desc: 'Carry a pencil to write notes directly on the printed Trail Card margins outside.',
            },
          ].map((item) => (
            <label
              key={item.key}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.85rem',
                padding: '0.75rem 1rem',
                backgroundColor: record.checklistPassed[item.key] ? 'rgba(58, 103, 4, 0.08)' : 'var(--paper-warm)',
                border: '1px solid',
                borderColor: record.checklistPassed[item.key] ? 'var(--green-leaf)' : 'var(--paper-border)',
                borderRadius: '3px',
                cursor: 'pointer',
                minHeight: '48px',
              }}
            >
              <input
                type="checkbox"
                checked={record.checklistPassed[item.key]}
                onChange={() => handleCheckboxToggle(item.key)}
                style={{ marginTop: '0.25rem', width: '18px', height: '18px', accentColor: 'var(--green-leaf)', cursor: 'pointer' }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '0.92rem', color: 'var(--ink-primary)' }}>
                  {item.title}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--ink-soft)', marginTop: '0.15rem' }}>
                  {item.desc}
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* SECTION 2: EDITABLE FIELD TEST RECORD (UNDER 2 MIN) */}
      <div
        className="paper-card"
        style={{
          padding: '1.5rem',
          border: '2px solid var(--paper-border-dark)',
          marginBottom: '2rem',
          backgroundColor: 'var(--paper-card)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--paper-border-dark)', paddingBottom: '0.75rem' }}>
          <div>
            <span className="field-label" style={{ color: 'var(--terracotta)', fontSize: '0.75rem' }}>
              SECTION 02 // REAL FIELD LOG
            </span>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.35rem', margin: '0.2rem 0 0' }}>
              Outdoor Walk Report (Editable Template)
            </h2>
          </div>
          <Compass size={24} color="#A64B2A" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <label className="field-label" style={{ display: 'block', marginBottom: '0.35rem' }}>
              TEST DATE
            </label>
            <input
              type="date"
              value={record.date}
              onChange={(e) => handleFieldChange('date', e.target.value)}
              className="field-input"
              style={{ width: '100%', minHeight: '48px', padding: '0.6rem 0.8rem' }}
            />
          </div>

          <div>
            <label className="field-label" style={{ display: 'block', marginBottom: '0.35rem' }}>
              PLACE / TRAILHEAD LOCATION
            </label>
            <input
              type="text"
              value={record.place}
              onChange={(e) => handleFieldChange('place', e.target.value)}
              placeholder="e.g. Seminary Hills Reserve, Nagpur (West Gate)"
              className="field-input"
              style={{ width: '100%', minHeight: '48px', padding: '0.6rem 0.8rem' }}
            />
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <label className="field-label" style={{ display: 'block', marginBottom: '0.35rem' }}>
              WEATHER EXPERIENCED
            </label>
            <input
              type="text"
              value={record.weather}
              onChange={(e) => handleFieldChange('weather', e.target.value)}
              placeholder="e.g. 24°C, dry autumn breeze, afternoon sun, no cloud cover"
              className="field-input"
              style={{ width: '100%', minHeight: '48px', padding: '0.6rem 0.8rem' }}
            />
          </div>
        </div>

        {/* What Worked */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label className="field-label" style={{ display: 'block', marginBottom: '0.35rem', color: 'var(--green-deep)' }}>
            WHAT WORKED IN THE FIELD
          </label>
          <textarea
            value={record.whatWorked}
            onChange={(e) => handleFieldChange('whatWorked', e.target.value)}
            placeholder="e.g. Vector route snapshot was clear in direct sunlight; Pocket mode speech prompt reminded me to inspect basalt formations without looking at the screen; printed card survived in pocket."
            className="field-input"
            rows={3}
            style={{ width: '100%', padding: '0.65rem 0.85rem', resize: 'vertical' }}
          />
        </div>

        {/* What Failed */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label className="field-label" style={{ display: 'block', marginBottom: '0.35rem', color: 'var(--terracotta)' }}>
            WHAT FAILED OR NEEDED WORK
          </label>
          <textarea
            value={record.whatFailed}
            onChange={(e) => handleFieldChange('whatFailed', e.target.value)}
            placeholder="e.g. GPS waypoint proximity trigger jumped under dense canopy; paper card got folded corner; needed brighter contrast on waypoint milestone indicator."
            className="field-input"
            rows={3}
            style={{ width: '100%', padding: '0.65rem 0.85rem', resize: 'vertical' }}
          />
        </div>

        {/* One Surprise */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label className="field-label" style={{ display: 'block', marginBottom: '0.35rem', color: 'var(--ink-primary)' }}>
            ONE SURPRISE ENCOUNTERED OUTSIDE
          </label>
          <textarea
            value={record.oneSurprise}
            onChange={(e) => handleFieldChange('oneSurprise', e.target.value)}
            placeholder="e.g. Spotted a flock of migratory bee-eaters perched on the old telegraph wire along waypoint 02; found an unrecorded foot trail branching south."
            className="field-input"
            rows={2}
            style={{ width: '100%', padding: '0.65rem 0.85rem', resize: 'vertical' }}
          />
        </div>

        {/* Photo of Printed Card */}
        <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: 'var(--paper-warm)', border: '1px dashed var(--paper-border-dark)', borderRadius: '3px' }}>
          <div className="field-label" style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Camera size={14} color="#3A6704" />
            <span>PHOTO OF PRINTED CARD IN THE FIELD</span>
          </div>

          {record.photoUrl ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'flex-start' }}>
              <img
                src={record.photoUrl}
                alt="Printed Trail Card in the field"
                style={{ maxHeight: '240px', maxWidth: '100%', objectFit: 'contain', borderRadius: '3px', border: '1px solid var(--paper-border-dark)' }}
              />
              <button
                type="button"
                onClick={handleRemovePhoto}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.4rem 0.75rem',
                  backgroundColor: 'rgba(166, 75, 42, 0.1)',
                  border: '1px solid var(--terracotta)',
                  color: 'var(--terracotta)',
                  borderRadius: '2px',
                  cursor: 'pointer',
                  fontSize: '0.78rem',
                  fontFamily: 'var(--font-mono)',
                  minHeight: '44px',
                }}
              >
                <Trash2 size={13} />
                <span>Remove Photo</span>
              </button>
            </div>
          ) : (
            <div>
              <label
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.65rem 1.1rem',
                  backgroundColor: 'var(--paper-card)',
                  border: '1px solid var(--paper-border-dark)',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 600,
                  minHeight: '48px',
                }}
              >
                <Upload size={15} />
                <span>Attach Photo (Printed Card on Trail)</span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handlePhotoUpload}
                  style={{ display: 'none' }}
                />
              </label>
              <div style={{ fontSize: '0.75rem', color: 'var(--ink-muted)', marginTop: '0.4rem' }}>
                Photos remain entirely local on this device. Never uploaded to any server.
              </div>
            </div>
          )}
        </div>

        {/* Additional Raw Field Notes */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label className="field-label" style={{ display: 'block', marginBottom: '0.35rem' }}>
            ADDITIONAL FIELD NOTES &amp; SENSORY LOG
          </label>
          <textarea
            value={record.notes || ''}
            onChange={(e) => handleFieldChange('notes', e.target.value)}
            placeholder="Raw field jottings, pace notes, bird sightings, or pencil reflections."
            className="field-input"
            rows={3}
            style={{ width: '100%', padding: '0.65rem 0.85rem', resize: 'vertical' }}
          />
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center', borderTop: '1px solid var(--paper-border-dark)', paddingTop: '1.25rem' }}>
          <button
            type="button"
            onClick={handleSave}
            className="btn-primary"
            style={{ padding: '0.65rem 1.4rem', minHeight: '48px' }}
          >
            <Save size={16} />
            <span>{isSaved ? 'Field Record Saved Locally!' : 'Save Local Field Record'}</span>
          </button>

          <button
            type="button"
            onClick={handleCopyMarkdown}
            className="btn-secondary"
            style={{ padding: '0.65rem 1.1rem', minHeight: '48px' }}
          >
            <Share2 size={15} />
            <span>{copyFeedback ? 'Copied to Clipboard!' : 'Copy Formatted Markdown'}</span>
          </button>

          <Link
            href="/journal"
            style={{
              fontSize: '0.85rem',
              color: 'var(--green-leaf)',
              textDecoration: 'underline',
              textUnderlineOffset: '3px',
              marginLeft: 'auto',
              minHeight: '48px',
              display: 'inline-flex',
              alignItems: 'center',
            }}
          >
            View Field Journal Entries →
          </Link>
        </div>
      </div>
    </div>
  );
}
