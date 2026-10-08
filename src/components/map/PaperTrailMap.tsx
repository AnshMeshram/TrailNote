'use client';

import React, { useEffect, useRef } from 'react';
import { Waypoint } from '@/types/trail';
import { CompassMark } from '@/components/ui/CompassMark';

interface PaperTrailMapProps {
  coordinates?: [number, number][];
  waypoints?: Waypoint[];
  currentLocation?: { lat: number; lng: number } | [number, number];
  distanceKm?: number;
  elevationGainM?: number;
  className?: string;
  height?: string;
}

export function PaperTrailMap({
  coordinates = [
    [21.1643, 79.0628],
    [21.1685, 79.069],
    [21.163, 79.074],
    [21.159, 79.067],
    [21.1643, 79.0628],
  ],
  waypoints = [],
  currentLocation,
  distanceKm = 4.8,
  elevationGainM,
  className = '',
  height = '340px',
}: PaperTrailMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const trailBoundsRef = useRef<any>(null);

  const effectiveGain = elevationGainM ?? Math.round(distanceKm * 28);

  const handleRecenter = () => {
    if (mapInstanceRef.current && trailBoundsRef.current) {
      try {
        mapInstanceRef.current.fitBounds(trailBoundsRef.current, { padding: [40, 40], animate: true });
      } catch {}
    }
  };

  useEffect(() => {
    const container = mapContainerRef.current;
    if (typeof window === 'undefined' || !container) return;

    let isMounted = true;

    // Dynamically import Leaflet
    import('leaflet').then((L) => {
      if (!isMounted || !container) return;

      // Clean up previous map if exists
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.off();
          mapInstanceRef.current.remove();
        } catch {}
        mapInstanceRef.current = null;
      }
      if (mapContainerRef.current && (mapContainerRef.current as any)._leaflet_id) {
        delete (mapContainerRef.current as any)._leaflet_id;
      }

      // Center around current location or first coordinate
      let center: [number, number] = coordinates[0] || [21.1643, 79.0628];
      if (currentLocation) {
        if (Array.isArray(currentLocation)) {
          center = currentLocation;
        } else if (currentLocation.lat && currentLocation.lng) {
          center = [currentLocation.lat, currentLocation.lng];
        }
      }

      if (!container) return;

      const map = L.map(container, {
        center,
        zoom: 14,
        zoomControl: false,
        attributionControl: false,
        fadeAnimation: false,
        markerZoomAnimation: false,
      });
      mapInstanceRef.current = map;

      // Add gentle zoom control in top-right
      L.control.zoom({ position: 'topright' }).addTo(map);

      // Add physical scale bar in bottom-right
      L.control.scale({ imperial: true, metric: true, position: 'bottomright' }).addTo(map);

      // OpenStreetMap TileLayer with warm paper tint
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      // Trail Polyline (Deep Green with subtle shadow/border)
      if (coordinates.length > 1) {
        // Casing / subtle border line
        L.polyline(coordinates, {
          color: '#243A18',
          weight: 5,
          opacity: 0.85,
          lineCap: 'round',
          lineJoin: 'round',
        }).addTo(map);

        // Core trail dashed line with subtle flow animation class
        L.polyline(coordinates, {
          color: '#709F2D',
          weight: 3.5,
          dashArray: '6, 6',
          opacity: 0.95,
          lineCap: 'round',
          lineJoin: 'round',
          className: 'trail-flow-dash',
        }).addTo(map);

        // Fit map bounds to encompass the trail and current location if present
        const allPoints: [number, number][] = [...coordinates];
        if (currentLocation) {
          if (Array.isArray(currentLocation)) {
            allPoints.push(currentLocation);
          } else if (currentLocation.lat && currentLocation.lng) {
            allPoints.push([currentLocation.lat, currentLocation.lng]);
          }
        }
        const bounds = L.latLngBounds(allPoints);
        trailBoundsRef.current = bounds;
        if (bounds.isValid()) {
          try {
            map.fitBounds(bounds, { padding: [35, 35], animate: false });
          } catch {}
        }
      }

      // Current Location marker pin: ● YOU ARE HERE
      if (currentLocation) {
        const curLat = Array.isArray(currentLocation) ? currentLocation[0] : currentLocation.lat;
        const curLng = Array.isArray(currentLocation) ? currentLocation[1] : currentLocation.lng;

        if (curLat && curLng) {
          const hereIcon = L.divIcon({
            className: 'custom-here-marker',
            html: `<div style="
              display: inline-flex;
              align-items: center;
              gap: 5px;
              background: #FAF7F0;
              border: 1.5px solid #A64B2A;
              padding: 2px 7px;
              border-radius: 12px;
              box-shadow: 0 2px 6px rgba(0,0,0,0.3);
              white-space: nowrap;
            ">
              <span style="
                width: 7px;
                height: 7px;
                border-radius: 50%;
                background: #A64B2A;
                display: inline-block;
                box-shadow: 0 0 0 2px rgba(166, 75, 42, 0.25);
              "></span>
              <span style="
                font-family: var(--font-mono, monospace);
                font-size: 10px;
                font-weight: 700;
                color: #243A18;
                letter-spacing: 0.04em;
              ">YOU ARE HERE</span>
            </div>`,
            iconSize: [110, 24],
            iconAnchor: [55, 12],
          });

          const hereMarker = L.marker([curLat, curLng], { icon: hereIcon }).addTo(map);
          hereMarker.bindPopup(`
            <div style="font-family: var(--font-sans); font-size: 12px; padding: 2px;">
              <strong style="color: #243A18;">● YOU ARE HERE</strong>
              <p style="margin: 4px 0 0 0; color: #505647;">One-time device position · Zero continuous tracking</p>
            </div>
          `);
        }
      }

      // Add waypoint marker pins
      waypoints.forEach((wp, idx) => {
        if (!wp.coordinate) return;
        const isStart = idx === 0;
        const isEnd = idx === waypoints.length - 1;
        const shortNum = isStart ? 'S' : isEnd ? 'F' : (idx < 10 ? `0${idx}` : `${idx}`);
        const label = isStart ? 'START' : isEnd ? 'FINISH' : `WAYPOINT ${idx < 10 ? '0' + idx : idx}`;

        const customIcon = L.divIcon({
          className: 'custom-trail-marker',
          html: `<div style="
            min-width: 24px;
            height: 24px;
            padding: 0 3px;
            background: ${isStart ? '#3A6704' : isEnd ? '#A64B2A' : '#E9E1CC'};
            color: ${isStart || isEnd ? '#FAF7F0' : '#20251A'};
            border: 2px solid ${isStart ? '#243A18' : isEnd ? '#795548' : '#6F7A0B'};
            border-radius: 2px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: var(--font-mono, monospace);
            font-size: 10px;
            font-weight: 700;
            box-shadow: 0 1px 3px rgba(0,0,0,0.3);
          ">${shortNum}</div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        const marker = L.marker([wp.coordinate.lat, wp.coordinate.lng], {
          icon: customIcon,
        }).addTo(map);

        marker.bindPopup(`
          <div style="font-family: var(--font-sans); font-size: 13px; line-height: 1.4; padding: 2px;">
            <div style="font-family: var(--font-mono); font-size: 10px; font-weight: 700; color: ${isStart ? '#3A6704' : isEnd ? '#A64B2A' : '#6F7A0B'}; text-transform: uppercase; margin-bottom: 2px;">
              ${label}
            </div>
            <strong style="color: #20251A;">${wp.name}</strong>
            ${wp.note ? `<p style="margin: 4px 0 0 0; color: #505647; font-size: 12px;">${wp.note}</p>` : ''}
          </div>
        `);
      });
    });

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.off();
          mapInstanceRef.current.remove();
        } catch {}
        mapInstanceRef.current = null;
      }
      if (container && (container as any)._leaflet_id) {
        delete (container as any)._leaflet_id;
      }
    };
  }, [coordinates, waypoints, currentLocation]);

  return (
    <div
      className={`paper-card ${className}`}
      style={{
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid var(--paper-border-dark)',
        borderRadius: '3px',
      }}
    >
      {/* Map Header Stamp */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0.65rem 1rem',
          backgroundColor: 'var(--paper-card)',
          borderBottom: '1px solid var(--paper-border)',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span className="field-stamp green">OSM // TOPOGRAPHIC FOOTPATH</span>
          <span className="field-label" style={{ fontSize: '0.68rem' }}>CONTOUR LOOP</span>
          {distanceKm && (
            <span className="field-stamp" style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)' }}>
              {distanceKm} KM
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <button
            type="button"
            onClick={handleRecenter}
            className="field-stamp"
            title="Recenter and fit full trail geometry"
            style={{
              cursor: 'pointer',
              backgroundColor: 'var(--paper-warm)',
              borderColor: 'var(--paper-border-dark)',
              fontSize: '0.68rem',
              color: 'var(--ink-primary)',
            }}
          >
            ⌖ RECENTER TRAIL
          </button>
          <span className="field-label" style={{ color: 'var(--ink-muted)', display: 'none' }} id="carto-proj-label">
            LEAFLET · CARTOGRAPHIC PROJECTION
          </span>
        </div>
      </div>

      {/* Map Div with paper-like sepia CSS filter */}
      <div
        ref={mapContainerRef}
        style={{
          width: '100%',
          height,
          filter: 'sepia(0.18) saturate(0.88) contrast(0.96) brightness(1.02)',
        }}
      />

      {/* Compass rose in bottom-left */}
      <div
        style={{
          position: 'absolute',
          bottom: '5.2rem',
          left: '0.75rem',
          backgroundColor: 'rgba(244, 240, 228, 0.92)',
          border: '1px solid var(--paper-border-dark)',
          padding: '0.35rem',
          borderRadius: '2px',
          boxShadow: 'var(--shadow-tactile)',
          pointerEvents: 'none',
          zIndex: 400,
        }}
      >
        <CompassMark size={34} bearing={18} />
      </div>

      {/* Compact Field Map Legend in top-left */}
      <div
        style={{
          position: 'absolute',
          top: '3rem',
          left: '0.75rem',
          backgroundColor: 'rgba(244, 240, 228, 0.94)',
          border: '1px solid var(--paper-border-dark)',
          padding: '0.4rem 0.65rem',
          borderRadius: '2px',
          boxShadow: 'var(--shadow-tactile)',
          fontSize: '0.65rem',
          fontFamily: 'var(--font-mono)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.25rem',
          pointerEvents: 'none',
          zIndex: 400,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ width: 8, height: 8, backgroundColor: '#3A6704', borderRadius: 1, display: 'inline-block' }} />
          <span>START (S)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ width: 8, height: 8, backgroundColor: '#E9E1CC', border: '1px solid #6F7A0B', borderRadius: 1, display: 'inline-block' }} />
          <span>WAYPOINT (01-04)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ width: 8, height: 8, backgroundColor: '#A64B2A', borderRadius: 1, display: 'inline-block' }} />
          <span>FINISH (F)</span>
        </div>
        {currentLocation && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ width: 6, height: 6, backgroundColor: '#A64B2A', borderRadius: '50%', display: 'inline-block' }} />
            <span style={{ fontWeight: 700, color: '#A64B2A' }}>YOU ARE HERE</span>
          </div>
        )}
      </div>

      {/* Topographic Elevation Profile Strip */}
      <div
        style={{
          padding: '0.65rem 1rem',
          backgroundColor: 'var(--paper-card)',
          borderTop: '1px solid var(--paper-border)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="field-label" style={{ fontSize: '0.68rem', color: 'var(--green-deep)' }}>
              TOPOGRAPHIC ELEVATION PROFILE
            </span>
            <span className="field-stamp green" style={{ fontSize: '0.65rem' }}>
              +{effectiveGain}M CLIMB
            </span>
          </div>
          <span className="field-mono" style={{ fontSize: '0.68rem', color: 'var(--ink-muted)' }}>
            CONTOUR GRADE: ~{Math.round((effectiveGain / (distanceKm * 1000)) * 100)}%
          </span>
        </div>

        {/* Ruled Elevation Profile SVG */}
        <div style={{ width: '100%', height: '54px', position: 'relative' }}>
          <svg viewBox="0 0 500 54" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
            <defs>
              <linearGradient id="elevationGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#709F2D" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#FAF7F0" stopOpacity="0.05" />
              </linearGradient>
            </defs>

            {/* Ruled Grid Lines */}
            <line x1="0" y1="12" x2="500" y2="12" stroke="rgba(90, 86, 75, 0.12)" strokeDasharray="3,3" />
            <line x1="0" y1="32" x2="500" y2="32" stroke="rgba(90, 86, 75, 0.12)" strokeDasharray="3,3" />
            <line x1="0" y1="48" x2="500" y2="48" stroke="var(--paper-border-dark)" strokeWidth="1" />

            {/* Mountain Profile Path */}
            <path
              d="M 0,48 Q 60,46 110,34 T 220,12 T 340,24 T 430,42 L 500,48 L 500,52 L 0,52 Z"
              fill="url(#elevationGrad)"
            />
            <path
              d="M 0,48 Q 60,46 110,34 T 220,12 T 340,24 T 430,42 L 500,48"
              fill="none"
              stroke="#243A18"
              strokeWidth="2"
              strokeLinecap="round"
            />

            {/* Crest Marker Dot */}
            <circle cx="220" cy="12" r="3.5" fill="#A64B2A" stroke="#FAF7F0" strokeWidth="1.5" />
            <text x="220" y="8" textAnchor="middle" fill="#A64B2A" fontSize="8" fontFamily="var(--font-mono)" fontWeight="700">
              +{effectiveGain}m CREST
            </text>

            {/* Start and End labels */}
            <text x="5" y="44" fill="#505647" fontSize="8" fontFamily="var(--font-mono)">
              START (0m)
            </text>
            <text x="495" y="44" textAnchor="end" fill="#505647" fontSize="8" fontFamily="var(--font-mono)">
              FINISH (LOOP)
            </text>
          </svg>
        </div>
      </div>

      {/* Map attribution notice */}
      <div
        style={{
          padding: '0.35rem 0.75rem',
          backgroundColor: 'var(--paper-warm)',
          borderTop: '1px solid var(--paper-border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.65rem',
          color: 'var(--ink-muted)',
          flexWrap: 'wrap',
          gap: '0.25rem',
        }}
      >
        <span>&copy; OpenStreetMap contributors · OSRM ROUTE GEOMETRY</span>
        <span>NO CELLULAR CONNECTION REQUIRED ONCE LOADED</span>
      </div>
    </div>
  );
}
