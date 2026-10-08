import React from 'react';

interface CompassMarkProps {
  size?: number;
  className?: string;
  bearing?: number; // degrees 0-360
  label?: string;
}

export function CompassMark({ size = 48, className = '', bearing = 0, label }: CompassMarkProps) {
  return (
    <div 
      className={`inline-flex flex-col items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      title={label || `Bearing ${bearing}°`}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Outer Ring */}
        <circle cx="24" cy="24" r="21" stroke="#C5BBA4" strokeWidth="1" strokeDasharray="2 2" />
        <circle cx="24" cy="24" r="18" stroke="#D8CFBA" strokeWidth="0.75" />
        
        {/* Cardinal tick marks */}
        <line x1="24" y1="3" x2="24" y2="7" stroke="#243A18" strokeWidth="1.5" />
        <line x1="24" y1="41" x2="24" y2="45" stroke="#767E6D" strokeWidth="1" />
        <line x1="3" y1="24" x2="7" y2="24" stroke="#767E6D" strokeWidth="1" />
        <line x1="41" y1="24" x2="45" y2="24" stroke="#767E6D" strokeWidth="1" />

        {/* Needle */}
        <g transform={`rotate(${bearing} 24 24)`}>
          {/* North Point (Deep Forest Green / Autumn Rust Tip) */}
          <polygon points="24,9 27,24 24,22" fill="#A64B2A" />
          <polygon points="24,9 21,24 24,22" fill="#795548" />
          
          {/* South Point (Muted Olive / Brass) */}
          <polygon points="24,39 27,24 24,26" fill="#878118" />
          <polygon points="24,39 21,24 24,26" fill="#6F7A0B" />
        </g>

        {/* Center Pivot */}
        <circle cx="24" cy="24" r="2.5" fill="#FAF7F0" stroke="#20251A" strokeWidth="1.2" />
        
        {/* Small "N" */}
        <text x="24" y="14" textAnchor="middle" fontSize="6" fontFamily="var(--font-mono)" fill="#A64B2A" fontWeight="bold">
          N
        </text>
      </svg>
    </div>
  );
}
