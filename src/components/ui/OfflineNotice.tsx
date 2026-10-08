'use client';

import React, { useState, useEffect } from 'react';
import { WifiOff, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface OfflineNoticeProps {
  className?: string;
  isSaved?: boolean;
}

export function OfflineNotice({ className = '', isSaved = true }: OfflineNoticeProps) {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);
      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  return (
    <div
      className={`paper-card ${className}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.75rem 1.25rem',
        backgroundColor: !isOnline ? 'rgba(166, 75, 42, 0.08)' : 'var(--paper-warm)',
        border: '1px solid',
        borderColor: !isOnline ? 'var(--autumn-rust)' : 'var(--paper-border-dark)',
        borderRadius: '2px',
        gap: '1rem',
        flexWrap: 'wrap',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div 
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '2px',
            backgroundColor: !isOnline ? 'rgba(166, 75, 42, 0.15)' : 'rgba(58, 103, 4, 0.1)',
            border: '1px solid',
            borderColor: !isOnline ? 'var(--autumn-rust)' : 'var(--green-leaf)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <WifiOff size={15} color={!isOnline ? '#A64B2A' : '#3A6704'} />
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', fontWeight: 600, color: 'var(--ink-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            {!isOnline ? (
              <span style={{ color: 'var(--autumn-rust)' }}>OFFLINE FIELD MODE</span>
            ) : isSaved ? (
              <span style={{ color: 'var(--green-leaf)' }}>● SAVED TO THIS DEVICE</span>
            ) : (
              <span>FIELD READY // READY TO SAVE</span>
            )}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--ink-muted)' }}>
            {!isOnline
              ? 'Your saved Trail Cards and field notes are still available.'
              : isSaved
              ? 'Available without internet. Stored locally in device storage.'
              : 'Save this Trail Card to retain route notes and sensory prompts in airplane mode.'}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        {isSaved ? (
          <>
            <CheckCircle2 size={14} color="#3A6704" />
            <span className="field-label" style={{ color: 'var(--green-leaf)' }}>LOCAL DISK PRESERVED</span>
          </>
        ) : (
          <>
            <ShieldCheck size={14} color="#795548" />
            <span className="field-label" style={{ color: 'var(--ink-muted)' }}>NOT SAVED YET</span>
          </>
        )}
      </div>
    </div>
  );
}
