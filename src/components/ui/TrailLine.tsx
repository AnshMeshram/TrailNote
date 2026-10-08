import React from 'react';

interface TrailLineProps {
  className?: string;
  points?: { x: number; y: number; label?: string }[];
  distanceKm?: number;
  elevationGainM?: number;
}

export function TrailLine({
  className = '',
  distanceKm = 4.8,
  elevationGainM = 145,
}: TrailLineProps) {
  return (
    <div 
      className={`paper-card ${className}`}
      style={{
        padding: '1.25rem',
        border: '1px solid var(--paper-border-dark)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <span className="field-label">ELEVATION & TRAIL PROFILE</span>
        <span className="field-stamp green">+{elevationGainM}m ELV · {distanceKm} KM</span>
      </div>

      <svg
        viewBox="0 0 500 90"
        style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}
        aria-hidden="true"
      >
        {/* Subtle grid lines */}
        <line x1="0" y1="20" x2="500" y2="20" stroke="#E9E1CC" strokeWidth="1" strokeDasharray="3 3" />
        <line x1="0" y1="50" x2="500" y2="50" stroke="#E9E1CC" strokeWidth="1" strokeDasharray="3 3" />
        <line x1="0" y1="80" x2="500" y2="80" stroke="#D8CFBA" strokeWidth="1" />

        {/* Shaded elevation slope */}
        <path
          d="M 10 75 Q 70 65, 120 50 T 230 35 T 330 20 T 420 45 T 490 70 L 490 80 L 10 80 Z"
          fill="rgba(112, 159, 45, 0.09)"
        />

        {/* Trail dashed line */}
        <path
          d="M 10 75 Q 70 65, 120 50 T 230 35 T 330 20 T 420 45 T 490 70"
          fill="none"
          stroke="#3A6704"
          strokeWidth="2.5"
          strokeDasharray="5 3"
        />

        {/* Start Point */}
        <circle cx="10" cy="75" r="4.5" fill="#3A6704" stroke="#FAF7F0" strokeWidth="1.5" />
        <text x="10" y="88" fontSize="8" fontFamily="var(--font-mono)" fill="#505647">START</text>

        {/* Summit / Viewpoint */}
        <circle cx="330" cy="20" r="4" fill="#A64B2A" stroke="#FAF7F0" strokeWidth="1.5" />
        <text x="330" y="12" textAnchor="middle" fontSize="8" fontFamily="var(--font-mono)" fill="#A64B2A" fontWeight="600">RIDGE VIEW</text>

        {/* End Point */}
        <circle cx="490" cy="70" r="4.5" fill="#243A18" stroke="#FAF7F0" strokeWidth="1.5" />
        <text x="490" y="88" textAnchor="end" fontSize="8" fontFamily="var(--font-mono)" fill="#505647">FINISH</text>
      </svg>
    </div>
  );
}
