import React from 'react';

export type BotanicalMotif =
  | 'oak'
  | 'maple'
  | 'fern'
  | 'pine'
  | 'grass'
  | 'acorn'
  | 'twig'
  | 'pressed-leaf';

interface BotanicalProps {
  variant?: BotanicalMotif;
  size?: number;
  color?: string;
  opacity?: number;
  rotation?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function LeafDecoration({
  variant = 'oak',
  size = 24,
  color = '#709F2D',
  opacity = 1,
  rotation = 0,
  className = '',
  style,
}: BotanicalProps) {
  const combinedStyle: React.CSSProperties = {
    display: 'inline-block',
    transform: rotation ? `rotate(${rotation}deg)` : undefined,
    opacity,
    transition: 'transform 0.2s ease',
    ...style,
  };

  if (variant === 'maple') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        style={combinedStyle}
        aria-hidden="true"
      >
        <path d="M12 22V17" />
        <path d="M12 17C10 15 7 17 5 15C3 13 4 10 3 7C5 7 8 9 9 7C10 5 12 2 12 2C12 2 14 5 15 7C16 9 19 7 21 7C20 10 21 13 19 15C17 17 14 15 12 17Z" />
        <path d="M12 7V17" opacity="0.6" />
        <path d="M12 11L7 9" opacity="0.4" />
        <path d="M12 11L17 9" opacity="0.4" />
      </svg>
    );
  }

  if (variant === 'fern') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        style={combinedStyle}
        aria-hidden="true"
      >
        <path d="M4 21C9 20 15 15 19 6" />
        <path d="M8 18C6 16 6 13 8 13" />
        <path d="M11 15C9 13 9 10 12 10" />
        <path d="M14 12C13 9 14 7 16 7" />
        <path d="M11 18C13 18 16 17 17 14" />
        <path d="M14 14C16 13 18 12 19 9" />
      </svg>
    );
  }

  if (variant === 'pine') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        style={combinedStyle}
        aria-hidden="true"
      >
        <path d="M12 2L12 22" />
        <path d="M12 6L7 10" />
        <path d="M12 6L17 10" />
        <path d="M12 11L6 15" />
        <path d="M12 11L18 15" />
        <path d="M12 16L5 20" />
        <path d="M12 16L19 20" />
      </svg>
    );
  }

  if (variant === 'grass') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        style={combinedStyle}
        aria-hidden="true"
      >
        <path d="M4 21C6 14 10 7 14 3" />
        <path d="M10 21C11 15 14 10 18 6" />
        <path d="M16 21C16.5 17 18 13 21 9" />
        <line x1="2" y1="21" x2="22" y2="21" strokeWidth="1" opacity="0.5" />
      </svg>
    );
  }

  if (variant === 'acorn') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        style={combinedStyle}
        aria-hidden="true"
      >
        <path d="M12 2V5" />
        <path d="M6 8C6 6.3 8.7 5 12 5C15.3 5 18 6.3 18 8C18 9 16.5 9.8 14 10" />
        <path d="M6 8C6 9.7 8 10 10 10" />
        <path d="M7 9C7 14 10 19 12 21C14 19 17 14 17 9" />
      </svg>
    );
  }

  if (variant === 'twig') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        style={combinedStyle}
        aria-hidden="true"
      >
        <path d="M3 21L21 3" />
        <path d="M8 16L12 14" />
        <path d="M14 10L18 8" />
        <path d="M11 13L9 9" />
        <circle cx="12" cy="14" r="1.5" fill={color} />
        <circle cx="18" cy="8" r="1.5" fill={color} />
      </svg>
    );
  }

  if (variant === 'pressed-leaf') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        style={combinedStyle}
        aria-hidden="true"
      >
        <path d="M12 21C12 21 6 16 6 10C6 5 10 3 12 3C14 3 18 5 18 10C18 16 12 21 12 21Z" />
        <line x1="12" y1="3" x2="12" y2="21" opacity="0.6" />
        <line x1="12" y1="8" x2="9" y2="6.5" opacity="0.5" />
        <line x1="12" y1="8" x2="15" y2="6.5" opacity="0.5" />
        <line x1="12" y1="13" x2="8.5" y2="11" opacity="0.5" />
        <line x1="12" y1="13" x2="15.5" y2="11" opacity="0.5" />
      </svg>
    );
  }

  // Default: Oak leaf
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={combinedStyle}
      aria-hidden="true"
    >
      <path d="M12 22V18" />
      <path d="M12 18C9.5 17 7 18 6 15C5 12 7 11 6 8C9 8 10 10 12 8C14 10 15 8 18 8C17 11 19 12 18 15C17 18 14.5 17 12 18Z" />
      <path d="M12 8V18" opacity="0.5" />
      <path d="M12 12C10 11 8.5 11.5 8 12" opacity="0.4" />
      <path d="M12 12C14 11 15.5 11.5 16 12" opacity="0.4" />
    </svg>
  );
}
