import React from 'react';
import { Eye, Compass, Feather } from 'lucide-react';

interface ObservationPromptProps {
  number: string;
  title: string;
  prompt: string;
  category?: string;
  className?: string;
}

export function ObservationPrompt({
  number,
  title,
  prompt,
  category,
  className = '',
}: ObservationPromptProps) {
  return (
    <div
      className={`paper-card ${className}`}
      style={{
        padding: '1.25rem',
        border: '1px solid var(--paper-border-dark)',
        backgroundColor: 'var(--paper-card)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span 
            style={{ 
              fontFamily: 'var(--font-mono)', 
              fontWeight: 700, 
              fontSize: '0.85rem',
              color: 'var(--autumn-rust)',
              backgroundColor: 'rgba(166, 75, 42, 0.08)',
              padding: '0.15rem 0.45rem',
              borderRadius: '2px',
              border: '1px solid rgba(166, 75, 42, 0.2)',
            }}
          >
            NOTICE // {number}
          </span>
          {category && (
            <span className="field-label" style={{ fontSize: '0.65rem' }}>
              {category}
            </span>
          )}
        </div>
        <Eye size={15} color="#6F7A0B" />
      </div>

      <h4 style={{ margin: '0.2rem 0 0 0', fontFamily: 'var(--font-serif)', fontSize: '1.15rem', color: 'var(--ink-primary)' }}>
        {title}
      </h4>

      <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--ink-soft)', lineHeight: 1.55 }}>
        {prompt}
      </p>
    </div>
  );
}
