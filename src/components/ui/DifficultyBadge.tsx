import React from 'react';
import { DifficultyLevel } from '@/types/trail';

interface DifficultyBadgeProps {
  difficulty: DifficultyLevel;
  size?: 'sm' | 'md' | 'lg';
  showDots?: boolean;
}

const config: Record<DifficultyLevel, { label: string; bg: string; color: string; border: string; dots: number }> = {
  easy: {
    label: 'Easy · Gentle Grade',
    bg: 'rgba(58, 103, 4, 0.09)',
    color: '#3A6704',
    border: '#3A6704',
    dots: 1,
  },
  moderate: {
    label: 'Moderate · Rolling',
    bg: 'rgba(135, 129, 24, 0.12)',
    color: '#6F7A0B',
    border: '#878118',
    dots: 2,
  },
  challenging: {
    label: 'Challenging · Steep',
    bg: 'rgba(166, 75, 42, 0.12)',
    color: '#A64B2A',
    border: '#A64B2A',
    dots: 3,
  },
  rugged: {
    label: 'Rugged · Backcountry',
    bg: 'rgba(36, 58, 24, 0.15)',
    color: '#243A18',
    border: '#243A18',
    dots: 4,
  },
};

export function DifficultyBadge({ difficulty, size = 'md', showDots = true }: DifficultyBadgeProps) {
  const item = config[difficulty] || config.moderate;

  const padding = size === 'sm' ? '0.2rem 0.5rem' : size === 'lg' ? '0.4rem 0.85rem' : '0.28rem 0.65rem';
  const fontSize = size === 'sm' ? '0.7rem' : size === 'lg' ? '0.85rem' : '0.75rem';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.45rem',
        padding,
        backgroundColor: item.bg,
        color: item.color,
        border: `1px solid ${item.border}`,
        borderRadius: '2px',
        fontFamily: 'var(--font-mono)',
        fontSize,
        fontWeight: 600,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
      }}
    >
      {showDots && (
        <span style={{ display: 'inline-flex', gap: '3px' }} aria-hidden="true">
          {[1, 2, 3, 4].map((i) => (
            <span
              key={i}
              style={{
                width: '5px',
                height: '5px',
                borderRadius: '50%',
                backgroundColor: i <= item.dots ? item.color : 'rgba(0,0,0,0.15)',
              }}
            />
          ))}
        </span>
      )}
      <span>{item.label}</span>
    </span>
  );
}
