import React from 'react';

interface DistanceBlockProps {
  distanceKm: number;
  durationMinutes: number;
  elevationM?: number;
  difficultyLabel?: string;
  className?: string;
}

export function DistanceBlock({
  distanceKm,
  durationMinutes,
  elevationM,
  difficultyLabel,
  className = '',
}: DistanceBlockProps) {
  const hours = Math.floor(durationMinutes / 60);
  const mins = durationMinutes % 60;
  const durationText = hours > 0 ? `${hours}h ${mins > 0 ? `${mins}m` : ''}` : `${mins}m`;

  return (
    <div
      className={`paper-card ${className}`}
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
        gap: '1rem',
        padding: '1.25rem',
        border: '1px solid var(--paper-border-dark)',
      }}
    >
      <div>
        <div className="field-label" style={{ marginBottom: '0.2rem' }}>DISTANCE</div>
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', fontWeight: 600, color: 'var(--ink-primary)' }}>
          {distanceKm.toFixed(1)} <span style={{ fontSize: '1rem', fontFamily: 'var(--font-mono)', fontWeight: 400 }}>KM</span>
        </div>
      </div>

      <div>
        <div className="field-label" style={{ marginBottom: '0.2rem' }}>EST. DURATION</div>
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', fontWeight: 600, color: 'var(--ink-primary)' }}>
          {durationText}
        </div>
      </div>

      {elevationM !== undefined && (
        <div>
          <div className="field-label" style={{ marginBottom: '0.2rem' }}>ELEVATION GAIN</div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', fontWeight: 600, color: 'var(--ink-primary)' }}>
            +{elevationM} <span style={{ fontSize: '1rem', fontFamily: 'var(--font-mono)', fontWeight: 400 }}>M</span>
          </div>
        </div>
      )}

      {difficultyLabel && (
        <div>
          <div className="field-label" style={{ marginBottom: '0.2rem' }}>EFFORT RATING</div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.45rem', fontWeight: 600, color: 'var(--green-leaf)', paddingTop: '0.2rem' }}>
            {difficultyLabel}
          </div>
        </div>
      )}
    </div>
  );
}
