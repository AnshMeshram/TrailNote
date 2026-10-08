'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Compass, Clock, MapPin, Feather, Check, ArrowRight, Sparkles, AlertCircle, Search, Navigation } from 'lucide-react';
import { LeafDecoration } from '@/components/ui/LeafDecoration';
import { DifficultyBadge } from '@/components/ui/DifficultyBadge';
import { DifficultyLevel, FitnessLevel, WeatherTolerance, TrailPreferences, DeviceLocation, TrailLocation } from '@/types/trail';
import { saveActiveTrail, saveDeviceLocation, getDeviceLocation, addPlanningSeconds, loadSettings } from '@/lib/storage/offline-store';
import { getCurrentLocation } from '@/lib/location/geolocation';
import { TrailnoteNormalizedLocation } from '@/lib/maps/nominatim';

export default function PlanPage() {
  const router = useRouter();

  // Location States (strict separation: deviceLocation vs trailLocation)
  const [location, setLocation] = useState('Nagpur Botanical Reserve & Seminary Hills');
  const [trailLocation, setTrailLocation] = useState<TrailLocation | null>(null);
  const [deviceLocation, setDeviceLocation] = useState<DeviceLocation | null>(null);
  const [devicePlaceName, setDevicePlaceName] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationStatusMessage, setLocationStatusMessage] = useState<string | null>(null);

  // Autocomplete Search States
  const [searchResults, setSearchResults] = useState<TrailnoteNormalizedLocation[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Form State
  const [availableTime, setAvailableTime] = useState<number>(75); // minutes
  const [distanceKm, setDistanceKm] = useState<number>(4.5);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('moderate');
  const [fitnessLevel, setFitnessLevel] = useState<FitnessLevel>('moderate');
  const [weatherTolerance, setWeatherTolerance] = useState<WeatherTolerance>('light-rain');
  const [loadingMessage, setLoadingMessage] = useState('Reading the trail...');

  // Selected Nature Curiosities
  const [natureInterests, setNatureInterests] = useState<string[]>([
    'Autumn Foliage & Leaf Shapes',
    'Bird Songs & Calls',
    'Basalt Rock Outcrops',
  ]);

  // Selected Terrain Preferences
  const [terrainPreferences, setTerrainPreferences] = useState<string[]>([
    'Dirt Trail',
    'Forested Canopy',
    'Gentle Ridge',
  ]);

  // Accessibility / Special Notes
  const [accessibility, setAccessibility] = useState<string[]>(['Natural uneven footpath']);
  const [personalNotes, setPersonalNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Track active visible planning time via Page Visibility API
  useEffect(() => {
    let lastActive = Date.now();
    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        const deltaSec = Math.floor((Date.now() - lastActive) / 1000);
        if (deltaSec > 0 && deltaSec < 30) {
          addPlanningSeconds(deltaSec);
        }
        lastActive = Date.now();
      }
    }, 3000);

    const onVisChange = () => {
      if (document.visibilityState === 'visible') {
        lastActive = Date.now();
      }
    };
    document.addEventListener('visibilitychange', onVisChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisChange);
    };
  }, []);

  // Load existing device location if cached
  useEffect(() => {
    const savedDev = getDeviceLocation();
    if (savedDev) {
      setDeviceLocation(savedDev);
    }
  }, []);

  // Explicit location input handler (no per-keystroke API requests)
  const handleLocationInputChange = (val: string) => {
    setLocation(val);
    setTrailLocation(null);
    if (val.trim().length === 0) {
      setSearchResults([]);
      setShowDropdown(false);
    }
  };

  const handleSearchLocationExplicit = async () => {
    if (location.trim().length < 2) return;
    setIsSearching(true);
    setShowDropdown(false);
    try {
      const res = await fetch(`/api/search-location?q=${encodeURIComponent(location.trim())}&limit=5`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.results)) {
          setSearchResults(data.results);
          setShowDropdown(data.results.length > 0);
          if (data.results.length === 0) {
            setLocationStatusMessage('No matching places found. Try a broader city or landmark.');
          } else {
            setLocationStatusMessage(null);
          }
        }
      }
    } catch {
      setLocationStatusMessage('Location search temporarily unavailable. Using manual place name.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSearchResult = (item: TrailnoteNormalizedLocation) => {
    setLocation(item.displayName);
    setTrailLocation({
      query: item.name,
      displayName: item.displayName,
      lat: item.lat,
      lng: item.lng,
      city: item.city,
      state: item.state,
      country: item.country,
    });
    setShowDropdown(false);
  };

  // Toggle helpers
  const toggleNature = (item: string) => {
    setNatureInterests((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const toggleTerrain = (item: string) => {
    setTerrainPreferences((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const applyPreset = (preset: {
    loc: string;
    time: number;
    dist: number;
    diff: DifficultyLevel;
    nature: string[];
  }) => {
    setLocation(preset.loc);
    setTrailLocation(null);
    setAvailableTime(preset.time);
    setDistanceKm(preset.dist);
    setDifficulty(preset.diff);
    setNatureInterests(preset.nature);
    setShowDropdown(false);
  };

  const handleUseCurrentLocation = async () => {
    setIsLocating(true);
    setLocationStatusMessage('Acquiring high-accuracy GPS fix from browser...');

    const res = await getCurrentLocation();
    if (!res.success || !res.coords) {
      setIsLocating(false);
      setLocationStatusMessage(res.error || 'Could not determine position.');
      return;
    }

    const { latitude, longitude, accuracy } = res.coords;
    const accM = Math.round(accuracy || 0);
    const devLoc: DeviceLocation = {
      lat: latitude,
      lng: longitude,
      accuracyM: accM,
      timestamp: Date.now(),
    };

    setDeviceLocation(devLoc);
    saveDeviceLocation(devLoc);
    if (typeof window !== 'undefined') {
      localStorage.setItem('trailnote_user_coords', JSON.stringify({ lat: latitude, lng: longitude }));
    }

    setLocationStatusMessage('Reverse geocoding with OpenStreetMap Nominatim...');

    try {
      const geoRes = await fetch(`/api/reverse-geocode?lat=${latitude}&lng=${longitude}`);
      if (geoRes.ok) {
        const data = await geoRes.json();
        if (data.success && data.location) {
          const loc = data.location;
          const label = loc.displayName || `${latitude.toFixed(4)}° N, ${longitude.toFixed(4)}° E`;
          setDevicePlaceName(label);
          setLocationStatusMessage(null);
          setIsLocating(false);
          return;
        }
      }
    } catch {
      // Fallback
    }

    setDevicePlaceName(`${latitude.toFixed(4)}° N, ${longitude.toFixed(4)}° E`);
    setLocationStatusMessage(null);
    setIsLocating(false);
  };

  const applyDeviceAsTrailhead = () => {
    if (!deviceLocation) return;
    const label = devicePlaceName || `${deviceLocation.lat.toFixed(4)}° N, ${deviceLocation.lng.toFixed(4)}° E`;
    setLocation(label);
    setTrailLocation({
      displayName: label,
      lat: deviceLocation.lat,
      lng: deviceLocation.lng,
      isCustomGps: true,
    });
    setShowDropdown(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setLoadingMessage('Resolving trail geography (Nominatim)...');

    const preferences: TrailPreferences = {
      location,
      trailLocation: trailLocation || undefined,
      deviceLocation: deviceLocation || null,
      availableTimeMinutes: availableTime,
      difficulty,
      fitnessLevel,
      distancePreferenceKm: distanceKm,
      interests: ['quiet-walk', 'nature-observation'],
      natureInterests,
      preferredTerrain: terrainPreferences,
      weatherTolerance,
      accessibilityRequirements: accessibility,
      notes: personalNotes,
    };

    // Cycle through outdoor loading messages
    const msgTimer1 = setTimeout(() => setLoadingMessage('Querying Open-Meteo atmospheric data...'), 800);
    const msgTimer2 = setTimeout(() => setLoadingMessage('Calculating trail geometry & slope (OSRM)...'), 1700);
    const msgTimer3 = setTimeout(() => setLoadingMessage('Synthesizing sensory observation prompts (Gemma 2)...'), 2600);

    try {
      const activeSettings = loadSettings();
      const res = await fetch('/api/generate-trail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...preferences,
          selectedModel: activeSettings.selectedModel,
        }),
      });

      clearTimeout(msgTimer1);
      clearTimeout(msgTimer2);
      clearTimeout(msgTimer3);

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.plan && data.card) {
          saveActiveTrail(data.plan, data.card);
          router.push('/trail');
          return;
        }
      }
    } catch (err) {
      console.warn('API error, proceeding with local fallback:', err);
    }

    clearTimeout(msgTimer1);
    clearTimeout(msgTimer2);
    clearTimeout(msgTimer3);

    // If API encountered error, redirect to /trail which has resilient fallback
    router.push('/trail');
  };

  const natureOptions = [
    'Autumn Foliage & Leaf Shapes',
    'Bird Songs & Calls',
    'Fungi & Lichen Varieties',
    'Basalt Rock Outcrops',
    'Stream & Water Soundscapes',
    'Ancient Trees & Canopy',
    'Quiet Contemplation',
  ];

  const terrainOptions = [
    'Dirt Trail',
    'Forested Canopy',
    'Gentle Ridge',
    'Packed Gravel',
    'Rocky Footpath',
    'Stream Crossings',
  ];

  return (
    <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '5rem', maxWidth: '840px' }}>
      {/* Field Permit Header */}
      <div
        style={{
          borderBottom: '2px solid var(--paper-border-dark)',
          paddingBottom: '1.5rem',
          marginBottom: '2rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
          <div>
            <span className="field-stamp green">
              <LeafDecoration size={13} color="#3A6704" variant="fern" />
              TN-PERMIT // FORM 26-A
            </span>
          </div>
          <span className="field-label" style={{ color: 'var(--ink-muted)' }}>
            DISPATCH PROTOCOL · GEMMA 2 LOCAL
          </span>
        </div>

        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2.2rem, 4vw, 3rem)', margin: '0 0 0.5rem 0' }}>
          Outdoor Trail Permit
        </h1>
        <p style={{ margin: 0, fontSize: '1.05rem', color: 'var(--ink-soft)' }}>
          State your outdoor intentions. We will prepare your route briefing and printable field card so you can unplug.
        </p>
      </div>

      {/* Quick Field Presets */}
      <div style={{ marginBottom: '2rem' }}>
        <div className="field-label" style={{ marginBottom: '0.5rem' }}>QUICK EXPEDITION TEMPLATES</div>
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          {[
            {
              label: 'Autumn Canopy Loop (75m)',
              loc: 'Seminary Hills Reserve, Nagpur',
              time: 75,
              dist: 4.8,
              diff: 'moderate' as DifficultyLevel,
              nature: ['Autumn Foliage & Leaf Shapes', 'Bird Songs & Calls', 'Quiet Contemplation'],
            },
            {
              label: 'Morning Stroll (30m)',
              loc: 'Ambazari Lake Trailway',
              time: 30,
              dist: 2.2,
              diff: 'easy' as DifficultyLevel,
              nature: ['Stream & Water Soundscapes', 'Bird Songs & Calls'],
            },
            {
              label: 'Rugged Ridge Hike (2h)',
              loc: 'Mansar Archaeological Hillside',
              time: 120,
              dist: 8.5,
              diff: 'challenging' as DifficultyLevel,
              nature: ['Basalt Rock Outcrops', 'Ancient Trees & Canopy', 'Quiet Contemplation'],
            },
          ].map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => applyPreset(preset)}
              className="field-stamp"
              style={{
                cursor: 'pointer',
                backgroundColor: 'var(--paper-card)',
                borderColor: 'var(--paper-border-dark)',
                color: 'var(--ink-primary)',
                padding: '0.35rem 0.65rem',
                fontSize: '0.75rem',
              }}
            >
              + {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--stack-md)' }}>
        {/* SECTION 1: LOCATION */}
        <div
          className="paper-card"
          style={{
            padding: '1.75rem',
            border: '1px solid var(--paper-border-dark)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <span className="field-stamp green">SEC 01</span>
            <span className="field-label">LOCATION & LOCALITY SEARCH</span>
          </div>

          <div>
            <label htmlFor="location-input" style={{ display: 'block', fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.4rem' }}>
              Where do you want to explore?
            </label>
            <p style={{ fontSize: '0.85rem', color: 'var(--ink-muted)', marginBottom: '0.75rem' }}>
              Search any park, reserve, city, district, trailhead, or natural landmark worldwide.
            </p>

            <div style={{ position: 'relative' }}>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'stretch' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <input
                    id="location-input"
                    type="text"
                    required
                    className="field-input"
                    value={location}
                    onChange={(e) => handleLocationInputChange(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSearchLocationExplicit();
                      }
                    }}
                    placeholder="e.g. Seminary Hills, Nagpur or Forest Park, Portland"
                    style={{ paddingLeft: '2.5rem', minHeight: '48px', width: '100%' }}
                    autoComplete="off"
                  />
                  <MapPin
                    size={18}
                    color="#3A6704"
                    style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }}
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSearchLocationExplicit}
                  disabled={isSearching || location.trim().length < 2}
                  className="btn-primary"
                  style={{
                    padding: '0 1.25rem',
                    fontSize: '0.85rem',
                    whiteSpace: 'nowrap',
                    minHeight: '48px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    opacity: isSearching || location.trim().length < 2 ? 0.6 : 1,
                  }}
                >
                  <Search size={15} />
                  <span>{isSearching ? 'Searching...' : 'Search Place'}</span>
                </button>
              </div>

              {/* Autocomplete Suggestions Dropdown */}
              {showDropdown && searchResults.length > 0 && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 4px)',
                    left: 0,
                    right: 0,
                    backgroundColor: 'var(--paper-card)',
                    border: '1px solid var(--paper-border-dark)',
                    borderRadius: '3px',
                    boxShadow: 'var(--shadow-lifted)',
                    zIndex: 200,
                    maxHeight: '260px',
                    overflowY: 'auto',
                  }}
                >
                  <div
                    style={{
                      padding: '0.4rem 0.75rem',
                      backgroundColor: 'var(--paper-warm)',
                      borderBottom: '1px solid var(--paper-border)',
                      fontSize: '0.7rem',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--ink-muted)',
                      display: 'flex',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span>OPENSTREETMAP NOMINATIM RESULTS</span>
                    <button
                      type="button"
                      onClick={() => setShowDropdown(false)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-muted)', fontSize: '0.7rem' }}
                    >
                      [CLOSE]
                    </button>
                  </div>
                  {searchResults.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleSelectSearchResult(item)}
                      style={{
                        padding: '0.75rem 1rem',
                        borderBottom: idx === searchResults.length - 1 ? 'none' : '1px solid var(--paper-border)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.65rem',
                        transition: 'background-color 0.1s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--paper-warm)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <MapPin size={15} color="#3A6704" style={{ marginTop: '3px', flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--ink-primary)' }}>
                          {item.name}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--ink-soft)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.displayName}
                        </div>
                        <div className="field-mono" style={{ fontSize: '0.68rem', color: 'var(--ink-muted)', marginTop: '2px' }}>
                          {item.lat.toFixed(4)}° N, {item.lng.toFixed(4)}° E
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Geo Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={isLocating}
                className="btn-secondary"
                style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Compass size={14} color="#3A6704" />
                <span>{isLocating ? 'Determining Position...' : 'Use My Current Location'}</span>
              </button>

              <span className="field-label" style={{ fontSize: '0.68rem', color: 'var(--ink-muted)' }}>
                NATIVE BROWSER GEOLOCATION · NO CONTINUOUS TRACKING
              </span>
            </div>

            {locationStatusMessage && (
              <div style={{ marginTop: '0.75rem', padding: '0.5rem 0.75rem', backgroundColor: 'var(--paper-warm)', border: '1px solid var(--paper-border-dark)', borderRadius: '2px', fontSize: '0.82rem', color: 'var(--ink-soft)' }}>
                {locationStatusMessage}
              </div>
            )}

            {/* Dedicated Device Location Pinpoint Box */}
            {deviceLocation && (
              <div
                style={{
                  marginTop: '1rem',
                  padding: '1rem',
                  backgroundColor: 'rgba(58, 103, 4, 0.06)',
                  border: '1px solid var(--green-leaf)',
                  borderRadius: '3px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem', flexWrap: 'wrap', gap: '0.4rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="field-stamp green" style={{ fontSize: '0.68rem' }}>
                      <Navigation size={11} color="#3A6704" />
                      DEVICE LOCATION PINPOINT
                    </span>
                    {deviceLocation.accuracyM !== undefined && (
                      <span className="field-stamp" style={{ fontSize: '0.68rem', color: 'var(--green-deep)' }}>
                        Accurate to ~{deviceLocation.accuracyM} m
                      </span>
                    )}
                  </div>
                  <div className="field-mono" style={{ fontSize: '0.75rem', color: 'var(--green-leaf)', fontWeight: 600 }}>
                    {deviceLocation.lat.toFixed(4)}° N, {deviceLocation.lng.toFixed(4)}° E
                  </div>
                </div>

                <div style={{ fontSize: '0.88rem', color: 'var(--ink-primary)', fontWeight: 600, marginBottom: '0.65rem' }}>
                  {devicePlaceName || 'Current Physical Coordinate'}
                </div>

                <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <button
                    type="button"
                    onClick={applyDeviceAsTrailhead}
                    className="btn-primary"
                    style={{ padding: '0.4rem 0.85rem', fontSize: '0.78rem' }}
                  >
                    [ SET AS TRAILHEAD ]
                  </button>

                  <span style={{ fontSize: '0.78rem', color: 'var(--ink-soft)' }}>
                    or keep as "YOU ARE HERE" pin on map while exploring another trail.
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* SECTION 2: DURATION & DISTANCE */}
        <div
          className="paper-card"
          style={{
            padding: '1.75rem',
            border: '1px solid var(--paper-border-dark)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <span className="field-stamp green">SEC 02</span>
            <span className="field-label">DURATION & CAPACITY</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
            {/* Time */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <label style={{ fontWeight: 600, fontSize: '0.95rem' }}>Available Time</label>
                <span className="field-stamp" style={{ fontFamily: 'var(--font-mono)' }}>
                  {availableTime} MINUTES ({Math.floor(availableTime / 60)}h {availableTime % 60}m)
                </span>
              </div>
              <input
                type="range"
                min="15"
                max="240"
                step="15"
                value={availableTime}
                onChange={(e) => {
                  const t = Number(e.target.value);
                  setAvailableTime(t);
                  // Reasonable pace assumption: ~3.8 km/h on trail
                  setDistanceKm(parseFloat(((t / 60) * 3.8).toFixed(1)));
                }}
                style={{ width: '100%', accentColor: 'var(--green-leaf)', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--ink-muted)', marginTop: '0.25rem' }}>
                <span>15 min quick stroll</span>
                <span>60 min standard</span>
                <span>4 hours half-day</span>
              </div>
            </div>

            {/* Target Distance */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <label style={{ fontWeight: 600, fontSize: '0.95rem' }}>Desired Distance</label>
                <span className="field-stamp" style={{ fontFamily: 'var(--font-mono)' }}>
                  {distanceKm} KM ({Math.round(distanceKm * 0.621371)} MILES)
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="25"
                step="0.5"
                value={distanceKm}
                onChange={(e) => setDistanceKm(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--green-leaf)', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--ink-muted)', marginTop: '0.25rem' }}>
                <span>1 km easy</span>
                <span>5 km moderate</span>
                <span>25 km endurance</span>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: EFFORT GRADE & FITNESS */}
        <div
          className="paper-card"
          style={{
            padding: '1.75rem',
            border: '1px solid var(--paper-border-dark)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <span className="field-stamp green">SEC 03</span>
            <span className="field-label">EFFORT GRADE & FITNESS PROFILE</span>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.5rem' }}>
              Trail Difficulty
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem' }}>
              {(
                [
                  { id: 'easy', title: 'Easy', desc: 'Gentle flat slope, wide pathway' },
                  { id: 'moderate', title: 'Moderate', desc: 'Rolling hills, some roots & rocks' },
                  { id: 'challenging', title: 'Challenging', desc: 'Steep inclines, uneven footing' },
                  { id: 'rugged', title: 'Rugged', desc: 'Backcountry scramble, primitive trail' },
                ] as const
              ).map((lvl) => {
                const isSelected = difficulty === lvl.id;
                return (
                  <button
                    key={lvl.id}
                    type="button"
                    onClick={() => setDifficulty(lvl.id)}
                    style={{
                      padding: '0.85rem',
                      borderRadius: '2px',
                      border: '1px solid',
                      borderColor: isSelected ? 'var(--green-leaf)' : 'var(--paper-border-dark)',
                      backgroundColor: isSelected ? 'rgba(58, 103, 4, 0.08)' : 'var(--paper-card)',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                      <strong style={{ fontSize: '0.92rem', color: isSelected ? 'var(--green-deep)' : 'var(--ink-primary)' }}>
                        {lvl.title}
                      </strong>
                      {isSelected && <Check size={14} color="#3A6704" strokeWidth={3} />}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--ink-soft)', lineHeight: 1.35 }}>
                      {lvl.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.5rem' }}>
              Current Fitness Level
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {(['beginner', 'moderate', 'active', 'experienced'] as FitnessLevel[]).map((fit) => (
                <button
                  key={fit}
                  type="button"
                  onClick={() => setFitnessLevel(fit)}
                  className={`field-checkbox-pill ${fitnessLevel === fit ? 'active' : ''}`}
                >
                  {fit.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* SECTION 4: NATURE CURIOSITIES & OBSERVATIONS */}
        <div
          className="paper-card"
          style={{
            padding: '1.75rem',
            border: '1px solid var(--paper-border-dark)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <span className="field-stamp green">SEC 04</span>
            <span className="field-label">NATURE CURIOSITIES & OBSERVATIONS</span>
          </div>

          <p style={{ fontSize: '0.88rem', color: 'var(--ink-soft)', marginBottom: '1rem' }}>
            What do your senses crave today? Gemma 2 will customize your 3 "Things to Notice" field prompts around these curiosities.
          </p>

          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
            {natureOptions.map((opt) => {
              const active = natureInterests.includes(opt);
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => toggleNature(opt)}
                  className={`field-checkbox-pill ${active ? 'active' : ''}`}
                >
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: active ? 'var(--neon-accent)' : 'var(--paper-border-dark)',
                    }}
                  />
                  <span>{opt}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* SECTION 5: TERRAIN & WEATHER TOLERANCE */}
        <div
          className="paper-card"
          style={{
            padding: '1.75rem',
            border: '1px solid var(--paper-border-dark)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <span className="field-stamp green">SEC 05</span>
            <span className="field-label">TERRAIN & WEATHER TOLERANCE</span>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.5rem' }}>
              Preferred Footing / Path Type
            </label>
            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
              {terrainOptions.map((t) => {
                const active = terrainPreferences.includes(t);
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => toggleTerrain(t)}
                    className={`field-checkbox-pill ${active ? 'active' : ''}`}
                  >
                    <span>{t}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.5rem' }}>
              Weather Tolerance
            </label>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              {[
                { id: 'fair-weather' as WeatherTolerance, label: 'Fair Weather Only' },
                { id: 'light-rain' as WeatherTolerance, label: 'Light Drizzle / Autumn Mist OK' },
                { id: 'all-weather' as WeatherTolerance, label: 'All-Weather / Rugged Spirit' },
              ].map((w) => (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => setWeatherTolerance(w.id)}
                  className={`field-checkbox-pill ${weatherTolerance === w.id ? 'active' : ''}`}
                >
                  {w.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <div
          style={{
            backgroundColor: 'var(--paper-warm)',
            border: '2px dashed var(--paper-border-dark)',
            borderRadius: '4px',
            padding: '1.75rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Compass size={18} color="#3A6704" />
            <span className="field-stamp green">READY FOR DISPATCH</span>
          </div>

          <div>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.45rem', margin: '0 0 0.35rem 0' }}>
              Generate Field Guide & Trail Card
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--ink-soft)', margin: 0, maxWidth: '520px' }}>
              Trailnote will structure your route, synthesize local weather conditions, and prepare your printable Trail Card.
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary"
            style={{
              padding: '1rem 2.5rem',
              fontSize: '1.05rem',
              marginTop: '0.5rem',
            }}
          >
            {isSubmitting ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <LeafDecoration size={16} color="#FAF7F0" variant="fern" />
                <span>{loadingMessage}</span>
              </span>
            ) : (
              <>
                <span>Issue Trail Permit & Generate Card</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
