'use client';

import React, { useState } from 'react';
import { Check } from 'lucide-react';

interface OutdoorChecklistProps {
  items: string[];
  title?: string;
  className?: string;
}

export function OutdoorChecklist({
  items,
  title = 'PACKING CHECKLIST',
  className = '',
}: OutdoorChecklistProps) {
  const [checkedState, setCheckedState] = useState<Record<number, boolean>>({});

  const toggleItem = (idx: number) => {
    setCheckedState((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const packedCount = Object.values(checkedState).filter(Boolean).length;

  return (
    <div
      className={`paper-card ${className}`}
      style={{
        padding: '1.25rem',
        border: '1px solid var(--paper-border-dark)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <span className="field-label">{title}</span>
        <span className="field-stamp green">
          {packedCount} / {items.length} PACKED
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        {items.map((item, idx) => {
          const isChecked = !!checkedState[idx];
          return (
            <button
              key={idx}
              type="button"
              onClick={() => toggleItem(idx)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.5rem 0.75rem',
                background: isChecked ? 'rgba(58, 103, 4, 0.05)' : 'transparent',
                border: '1px solid',
                borderColor: isChecked ? 'var(--green-leaf)' : 'var(--paper-border)',
                borderRadius: '2px',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {/* Tactile Square Checkbox */}
              <div
                style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '2px',
                  border: '1.5px solid',
                  borderColor: isChecked ? 'var(--green-leaf)' : 'var(--paper-border-dark)',
                  backgroundColor: isChecked ? 'var(--green-leaf)' : 'var(--paper-card)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'background-color 0.15s ease',
                }}
              >
                {isChecked && <Check size={13} color="#FAF7F0" strokeWidth={3} />}
              </div>

              <span
                style={{
                  fontSize: '0.92rem',
                  color: isChecked ? 'var(--ink-muted)' : 'var(--ink-primary)',
                  textDecoration: isChecked ? 'line-through' : 'none',
                }}
              >
                {item}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
