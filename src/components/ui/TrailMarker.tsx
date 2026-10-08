import React from 'react';

interface TrailMarkerProps {
  number: string;
  name: string;
  note?: string;
  distanceKm?: number;
  isFirst?: boolean;
  isLast?: boolean;
}

export function TrailMarker({
  number,
  name,
  note,
  distanceKm,
  isFirst = false,
  isLast = false,
}: TrailMarkerProps) {
  return (
    <div 
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '1rem',
        position: 'relative',
        paddingBottom: isLast ? '0' : '1.5rem',
      }}
    >
      {/* Waypoint Marker Blaze */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div
          style={{
            width: '32px',
            height: '32px',
            backgroundColor: isFirst ? 'var(--green-leaf)' : isLast ? 'var(--autumn-rust)' : 'var(--paper-warm)',
            color: isFirst || isLast ? '#FAF7F0' : 'var(--ink-primary)',
            border: `2px solid ${isFirst ? 'var(--green-deep)' : isLast ? 'var(--autumn-rust)' : 'var(--paper-border-dark)'}`,
            borderRadius: '2px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.8rem',
            fontWeight: 700,
            boxShadow: 'var(--shadow-tactile)',
            zIndex: 2,
          }}
        >
          {number}
        </div>
        {!isLast && (
          <div
            style={{
              width: '2px',
              flexGrow: 1,
              minHeight: '28px',
              backgroundColor: 'var(--paper-border-dark)',
              borderStyle: 'dashed',
              margin: '4px 0',
            }}
          />
        )}
      </div>

      {/* Waypoint Content */}
      <div style={{ flex: 1, paddingTop: '2px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
          <h4 style={{ margin: 0, fontSize: '1rem', fontFamily: 'var(--font-sans)', fontWeight: 600 }}>
            {name}
          </h4>
          {distanceKm !== undefined && (
            <span className="field-label" style={{ color: 'var(--ink-muted)' }}>
              +{distanceKm} km
            </span>
          )}
        </div>
        {note && (
          <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.88rem', color: 'var(--ink-soft)' }}>
            {note}
          </p>
        )}
      </div>
    </div>
  );
}
