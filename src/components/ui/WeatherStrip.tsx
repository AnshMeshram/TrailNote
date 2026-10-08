import React from 'react';
import { WeatherCondition } from '@/types/trail';
import { CloudRain, Sun, Wind, Thermometer, ShieldAlert } from 'lucide-react';

interface WeatherStripProps {
  weather: WeatherCondition;
  className?: string;
  advice?: string;
}

export function WeatherStrip({ weather, className = '', advice }: WeatherStripProps) {
  return (
    <div
      className={`paper-card ${className}`}
      style={{
        padding: '1.25rem',
        border: '1px solid var(--paper-border-dark)',
        backgroundColor: 'var(--paper-card)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="field-label">CURRENT CONDITIONS</span>
          <span className="field-stamp">{weather.condition.toUpperCase()}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--ink-soft)' }}>
          <Thermometer size={14} color="#795548" />
          <span>{weather.tempC}°C</span>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
          gap: '0.75rem',
          paddingTop: '0.5rem',
          borderTop: '1px dashed var(--paper-border)',
          marginBottom: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CloudRain size={16} color="#6F7A0B" />
          <div>
            <div className="field-label" style={{ fontSize: '0.65rem' }}>RAIN CHANCE</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', fontWeight: 600 }}>
              {weather.precipitationPercent}%
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Wind size={16} color="#767E6D" />
          <div>
            <div className="field-label" style={{ fontSize: '0.65rem' }}>WIND SPEED</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', fontWeight: 600 }}>
              {weather.windKmh} km/h
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sun size={16} color="#B08A3C" />
          <div>
            <div className="field-label" style={{ fontSize: '0.65rem' }}>OUTLOOK</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--ink-primary)', fontWeight: 500 }}>
              {weather.summary}
            </div>
          </div>
        </div>
      </div>

      {advice && (
        <div
          style={{
            padding: '0.5rem 0.75rem',
            backgroundColor: 'var(--paper-warm)',
            borderLeft: '3px solid var(--moss-brass)',
            fontSize: '0.85rem',
            color: 'var(--ink-soft)',
            marginTop: '0.5rem',
          }}
        >
          <strong>Trail Advisory:</strong> {advice}
        </div>
      )}

      <div
        style={{
          marginTop: '0.65rem',
          paddingTop: '0.4rem',
          borderTop: '1px dotted var(--paper-border)',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.65rem',
          color: 'var(--ink-muted)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span>VERIFIED ATMOSPHERIC SNAPSHOT</span>
        <span>Weather data by Open-Meteo.com</span>
      </div>
    </div>
  );
}
