'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Settings, Shield, Cpu, RefreshCw, Check, ArrowLeft, Wifi, HardDrive } from 'lucide-react';
import { LeafDecoration } from '@/components/ui/LeafDecoration';
import { loadSettings, saveSettings, UserSettings } from '@/lib/storage/offline-store';
import { DifficultyLevel } from '@/types/trail';

export default function SettingsPage() {
  const [settings, setSettings] = useState<UserSettings>(loadSettings());
  const [isSaved, setIsSaved] = useState(false);
  const [ollamaStatus, setOllamaStatus] = useState<{
    status: string;
    isAvailable: boolean;
    model: string;
    baseUrl: string;
    availableModels: string[];
    checkedAt: string;
  } | null>(null);
  const [isCheckingOllama, setIsCheckingOllama] = useState(false);

  const [customModelText, setCustomModelText] = useState(settings.selectedModel || 'gemma2:2b');

  const fetchOllamaHealth = useCallback(async (modelOverride?: string) => {
    setIsCheckingOllama(true);
    const modelToTest = modelOverride || settings.selectedModel || 'gemma2:2b';
    try {
      const res = await fetch(`/api/health?model=${encodeURIComponent(modelToTest)}`);
      if (res.ok) {
        const data = await res.json();
        setOllamaStatus(data);
      } else {
        throw new Error('Health check error');
      }
    } catch {
      setOllamaStatus({
        status: 'fallback-ready',
        isAvailable: false,
        model: modelToTest,
        baseUrl: 'http://localhost:11434',
        availableModels: [],
        checkedAt: new Date().toISOString(),
      });
    } finally {
      setIsCheckingOllama(false);
    }
  }, [settings.selectedModel]);

  useEffect(() => {
    const s = loadSettings();
    setSettings(s);
    setCustomModelText(s.selectedModel || 'gemma2:2b');
    fetchOllamaHealth(s.selectedModel);
  }, [fetchOllamaHealth]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveSettings(settings);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '5rem', maxWidth: '780px' }}>
      {/* Header */}
      <div
        style={{
          borderBottom: '2px solid var(--paper-border-dark)',
          paddingBottom: '1.5rem',
          marginBottom: '2rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
          <span className="field-stamp green">
            <LeafDecoration size={13} color="#3A6704" variant="pine" />
            FIELD PREFERENCES
          </span>
          <span className="field-stamp">DEVICE & AI CONFIG</span>
        </div>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.6rem', margin: '0 0 0.5rem 0' }}>
          Settings
        </h1>
        <p style={{ margin: 0, color: 'var(--ink-soft)' }}>
          Configure your personal walking pace, measurement units, and local Ollama inference model.
        </p>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* LOCAL AI STATUS & OLLAMA CONFIGURATION */}
        <div className="paper-card" style={{ padding: '1.75rem', border: '1px solid var(--paper-border-dark)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span className="field-stamp green">SEC 01</span>
              <span className="field-label">LOCAL AI INFERENCE STATUS</span>
            </div>

            <button
              type="button"
              onClick={() => fetchOllamaHealth(settings.selectedModel)}
              disabled={isCheckingOllama}
              className="btn-secondary"
              style={{ padding: '0.4rem 0.85rem', fontSize: '0.82rem', fontWeight: 600 }}
              title="Test connection to local Ollama server"
            >
              <RefreshCw size={13} className={isCheckingOllama ? 'spin' : ''} />
              <span>{isCheckingOllama ? 'Testing Ollama...' : 'Test Ollama'}</span>
            </button>
          </div>

          {/* Connection Status Badge */}
          <div
            style={{
              padding: '1.15rem',
              backgroundColor: ollamaStatus?.isAvailable ? 'rgba(58, 103, 4, 0.08)' : 'var(--paper-warm)',
              border: '1px solid',
              borderColor: ollamaStatus?.isAvailable ? 'var(--green-leaf)' : 'var(--paper-border-dark)',
              borderRadius: '2px',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.75rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <span
                style={{
                  width: '11px',
                  height: '11px',
                  borderRadius: '50%',
                  backgroundColor: ollamaStatus?.isAvailable ? 'var(--neon-accent)' : 'var(--autumn-rust)',
                  border: `1.5px solid ${ollamaStatus?.isAvailable ? 'var(--green-leaf)' : '#795548'}`,
                  flexShrink: 0,
                }}
              />
              <div>
                <strong style={{ fontSize: '0.95rem', display: 'block', marginBottom: '0.2rem' }}>
                  {ollamaStatus?.isAvailable
                    ? `Guide: ${settings.selectedModel === 'fallback' ? 'built-in field rules (manual override)' : (ollamaStatus.model || settings.selectedModel) + ' active'}`
                    : 'Guide: built-in field rules'}
                </strong>
                <div style={{ fontSize: '0.82rem', color: 'var(--ink-muted)', lineHeight: 1.45 }}>
                  {ollamaStatus?.isAvailable ? (
                    <span>
                      Connected to <code>{ollamaStatus.baseUrl}</code> · Round-trip response: <strong>{(ollamaStatus as any).latencyMs ?? 0} ms</strong>
                    </span>
                  ) : (
                    <span>
                      This hosted demo or disconnected session uses built-in field-guide rules. Gemma 2 runs on your own machine.
                      Run locally with: <code style={{ backgroundColor: 'var(--paper-bg)', padding: '0.1rem 0.35rem', borderRadius: '2px' }}>ollama pull gemma2:2b</code>
                    </span>
                  )}
                </div>
              </div>
            </div>

            <span className="field-stamp" style={{ fontSize: '0.7rem' }}>
              {ollamaStatus?.isAvailable ? '0 CLOUD TELEMETRY' : 'DETERMINISTIC FALLBACK'}
            </span>
          </div>

          {/* Model selection & Custom Typing */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label className="field-label" style={{ display: 'block', marginBottom: '0.4rem' }}>
                SELECT LOCAL MODEL
              </label>
              <select
                className="field-select"
                value={
                  ['gemma2:2b', 'gemma2:9b', 'fallback'].includes(settings.selectedModel)
                    ? settings.selectedModel
                    : (ollamaStatus?.availableModels || []).includes(settings.selectedModel)
                    ? settings.selectedModel
                    : 'custom'
                }
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === 'custom') {
                    // keep custom text
                  } else {
                    setSettings({ ...settings, selectedModel: val });
                    setCustomModelText(val);
                  }
                }}
              >
                <option value="gemma2:2b">gemma2:2b (Default · 2B Lightweight · Fast on CPU/Laptop)</option>
                <option value="gemma2:9b">gemma2:9b (Higher Precision 9B · High RAM/GPU)</option>
                <option value="fallback">Deterministic Rules (Offline fallback · No AI process)</option>
                {ollamaStatus?.availableModels
                  ?.filter((m) => !['gemma2:2b', 'gemma2:9b'].includes(m))
                  .map((m) => (
                    <option key={m} value={m}>
                      {m} (Installed in Ollama)
                    </option>
                  ))}
                <option value="custom">✎ Custom Model (Type model name below...)</option>
              </select>
            </div>

            <div>
              <label className="field-label" style={{ display: 'block', marginBottom: '0.35rem' }}>
                OR TYPE CUSTOM OLLAMA MODEL TAG (E.G. <code>gemma2:9b</code>, <code>mistral</code>, <code>llama3.2:1b</code>)
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  className="field-input"
                  style={{ flex: 1, fontFamily: 'monospace', fontSize: '0.88rem' }}
                  value={customModelText}
                  placeholder="e.g. gemma2:9b, mistral, llama3.2:1b"
                  onChange={(e) => {
                    const text = e.target.value;
                    setCustomModelText(text);
                    setSettings({ ...settings, selectedModel: text });
                  }}
                />
                <button
                  type="button"
                  onClick={() => fetchOllamaHealth(customModelText)}
                  className="btn-secondary"
                  style={{ whiteSpace: 'nowrap', padding: '0 0.85rem', fontSize: '0.8rem' }}
                >
                  Verify Model
                </button>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--ink-muted)', marginTop: '0.35rem', display: 'block' }}>
                Active model target: <strong>{settings.selectedModel || 'gemma2:2b'}</strong>. When running locally with Ollama, Trailnote will send prompts to this tag.
              </span>
            </div>
          </div>
        </div>

        {/* PACING & PHYSICAL UNITS */}
        <div className="paper-card" style={{ padding: '1.75rem', border: '1px solid var(--paper-border-dark)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
            <span className="field-stamp green">SEC 02</span>
            <span className="field-label">OUTDOOR PACING & MEASUREMENT</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
            {/* Pace */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <label style={{ fontWeight: 600, fontSize: '0.92rem' }}>Walking Pace</label>
                <span className="field-stamp">{settings.walkingPaceKmh} KM/H</span>
              </div>
              <input
                type="range"
                min="2.5"
                max="5.5"
                step="0.1"
                value={settings.walkingPaceKmh}
                onChange={(e) => setSettings({ ...settings, walkingPaceKmh: parseFloat(e.target.value) })}
                style={{ width: '100%', accentColor: 'var(--green-leaf)', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--ink-muted)', marginTop: '0.2rem' }}>
                <span>2.5 km/h (Unhurried stroll)</span>
                <span>3.8 km/h (Standard trail)</span>
                <span>5.5 km/h (Fast hike)</span>
              </div>
            </div>

            {/* Units */}
            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.92rem', marginBottom: '0.4rem' }}>
                Measurement Units
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setSettings({ ...settings, unit: 'km' })}
                  className={`field-checkbox-pill ${settings.unit === 'km' ? 'active' : ''}`}
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  Metric (Kilometers / Meters)
                </button>
                <button
                  type="button"
                  onClick={() => setSettings({ ...settings, unit: 'mi' })}
                  className={`field-checkbox-pill ${settings.unit === 'mi' ? 'active' : ''}`}
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  Imperial (Miles / Feet)
                </button>
              </div>
            </div>
          </div>

          {/* Default Difficulty */}
          <div>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.92rem', marginBottom: '0.4rem' }}>
              Default Trail Difficulty
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {(['easy', 'moderate', 'challenging', 'rugged'] as DifficultyLevel[]).map((diff) => (
                <button
                  key={diff}
                  type="button"
                  onClick={() => setSettings({ ...settings, preferredDifficulty: diff })}
                  className={`field-checkbox-pill ${settings.preferredDifficulty === diff ? 'active' : ''}`}
                >
                  {diff.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* NATURE INTERESTS, TERRAIN & WEATHER TOLERANCE */}
        <div className="paper-card" style={{ padding: '1.75rem', border: '1px solid var(--paper-border-dark)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
            <span className="field-stamp green">SEC 03</span>
            <span className="field-label">OUTDOOR CURIOSITIES & WEATHER TOLERANCE</span>
          </div>

          {/* Nature Interests */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.92rem', marginBottom: '0.4rem' }}>
              Default Nature Interests
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {[
                'Autumn Foliage & Leaf Shapes',
                'Bird Songs & Calls',
                'Fungi & Lichen Varieties',
                'Basalt Rock Outcrops',
                'Stream & Water Soundscapes',
                'Ancient Trees & Canopy',
                'Quiet Contemplation',
              ].map((interest) => {
                const active = (settings.natureInterests || []).includes(interest);
                return (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => {
                      const cur = settings.natureInterests || [];
                      const updated = active ? cur.filter((i) => i !== interest) : [...cur, interest];
                      setSettings({ ...settings, natureInterests: updated });
                    }}
                    className={`field-checkbox-pill ${active ? 'active' : ''}`}
                  >
                    {interest}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Preferred Terrain */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.92rem', marginBottom: '0.4rem' }}>
              Preferred Footing / Terrain
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {[
                'Dirt Trail',
                'Forested Canopy',
                'Gentle Ridge',
                'Packed Gravel',
                'Rocky Footpath',
                'Stream Crossings',
              ].map((terrain) => {
                const active = (settings.preferredTerrain || []).includes(terrain);
                return (
                  <button
                    key={terrain}
                    type="button"
                    onClick={() => {
                      const cur = settings.preferredTerrain || [];
                      const updated = active ? cur.filter((t) => t !== terrain) : [...cur, terrain];
                      setSettings({ ...settings, preferredTerrain: updated });
                    }}
                    className={`field-checkbox-pill ${active ? 'active' : ''}`}
                  >
                    {terrain}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Weather Tolerance */}
          <div>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.92rem', marginBottom: '0.4rem' }}>
              Weather Tolerance
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {[
                { id: 'fair-weather' as const, label: 'Fair Weather Only' },
                { id: 'light-rain' as const, label: 'Light Drizzle / Autumn Mist OK' },
                { id: 'all-weather' as const, label: 'All-Weather / Rugged Spirit' },
              ].map((w) => (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => setSettings({ ...settings, weatherTolerance: w.id })}
                  className={`field-checkbox-pill ${settings.weatherTolerance === w.id ? 'active' : ''}`}
                >
                  {w.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* OFFLINE STORAGE STATUS */}
        <div className="paper-card" style={{ padding: '1.75rem', border: '1px solid var(--paper-border-dark)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
            <span className="field-stamp green">SEC 04</span>
            <span className="field-label">OFFLINE STORAGE & LOCAL CACHE</span>
          </div>

          <div
            style={{
              padding: '1.25rem',
              backgroundColor: 'var(--paper-warm)',
              border: '1px solid var(--paper-border-dark)',
              borderRadius: '2px',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <HardDrive size={16} color="#3A6704" />
                <strong style={{ fontSize: '0.92rem' }}>Local Browser Storage (Indexed Cache)</strong>
              </div>
              <span className="field-stamp green" style={{ fontSize: '0.7rem' }}>
                AVAILABLE IN AIRPLANE MODE
              </span>
            </div>

            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--ink-soft)', lineHeight: 1.5 }}>
              All generated trail plans, printable Trail Cards, field notes, and reflections are preserved purely in your device's browser localStorage. No data is ever transmitted to commercial cloud databases.
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.5rem', paddingTop: '0.75rem', borderTop: '1px dashed var(--paper-border)' }}>
              <button
                type="button"
                onClick={() => {
                  if (confirm('Clear local trail cache? Your settings will be preserved.')) {
                    if (typeof window !== 'undefined') {
                      localStorage.removeItem('trailnote_active_trail');
                      alert('Active trail cache cleared.');
                    }
                  }
                }}
                className="btn-secondary"
                style={{ padding: '0.4rem 0.85rem', fontSize: '0.78rem' }}
              >
                Clear Active Trail Cache
              </button>
            </div>
          </div>
        </div>

        {/* SAVE BUTTON */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <Link href="/" style={{ fontSize: '0.88rem', color: 'var(--ink-soft)' }}>
            ← Return to Home
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {isSaved && (
              <span style={{ fontSize: '0.85rem', color: 'var(--green-leaf)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Check size={14} />
                Preferences Saved
              </span>
            )}

            <button type="submit" className="btn-primary" style={{ padding: '0.75rem 1.85rem' }}>
              <span>Save Preferences</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
