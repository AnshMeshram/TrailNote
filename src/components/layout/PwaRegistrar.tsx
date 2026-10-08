'use client';

import React, { useEffect, useState } from 'react';
import { WifiOff, Check } from 'lucide-react';

export function PwaRegistrar() {
  const [isOffline, setIsOffline] = useState(false);
  const [swReady, setSwReady] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsOffline(!navigator.onLine);

      const handleOnline = () => setIsOffline(false);
      const handleOffline = () => setIsOffline(true);

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      // Register the handwritten service worker
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker
          .register('/sw.js')
          .then((reg) => {
            setSwReady(true);
            if (process.env.NODE_ENV !== 'production') {
              console.log('[Trailnote PWA] Service Worker registered scope:', reg.scope);
            }
          })
          .catch((err) => {
            console.warn('[Trailnote PWA] Service worker registration notice:', err);
          });
      }

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  if (!isOffline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="no-print"
      style={{
        backgroundColor: '#20251A',
        color: '#E9E1CC',
        padding: '0.45rem 1rem',
        fontSize: '0.78rem',
        fontFamily: 'var(--font-mono)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.6rem',
        borderBottom: '1px solid #3A6704',
        position: 'sticky',
        top: 0,
        zIndex: 999,
      }}
    >
      <span style={{ color: '#709F2D', fontWeight: 700 }}>FIELD LOG · ● READY OFFLINE</span>
      <span style={{ opacity: 0.7 }}>|</span>
      <span>Saved cards, notes &amp; journal available without signal</span>
    </div>
  );
}
