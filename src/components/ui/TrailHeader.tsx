import React from 'react';
import { MapPin, Calendar, Compass } from 'lucide-react';
import { DifficultyBadge } from './DifficultyBadge';
import { DifficultyLevel } from '@/types/trail';

interface TrailHeaderProps {
  name: string;
  location: string;
  difficulty: DifficultyLevel;
  dateStr?: string;
  coordinates?: string;
  children?: React.ReactNode;
}

export function TrailHeader({
  name,
  location,
  difficulty,
  dateStr,
  coordinates = '21°08\'N 79°05\'E',
  children,
}: TrailHeaderProps) {
  return (
    <div 
      style={{
        borderBottom: '2px solid var(--paper-border-dark)',
        paddingBottom: '1.5rem',
        marginBottom: '2rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span className="field-stamp green">TRAIL PERMIT // 2026</span>
          <span className="field-stamp">
            <Compass size={11} style={{ marginRight: '2px' }} />
            {coordinates}
          </span>
        </div>
        <DifficultyBadge difficulty={difficulty} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div>
          <h1 style={{ margin: '0 0 0.5rem 0', fontFamily: 'var(--font-serif)', color: 'var(--ink-primary)' }}>
            {name}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', color: 'var(--ink-soft)', flexWrap: 'wrap' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <MapPin size={15} color="#3A6704" />
              <strong style={{ color: 'var(--ink-primary)' }}>{location}</strong>
            </span>
            {dateStr && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.9rem' }}>
                <Calendar size={14} color="#767E6D" />
                {dateStr}
              </span>
            )}
          </div>
        </div>

        {children && <div>{children}</div>}
      </div>
    </div>
  );
}
