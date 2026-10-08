import { TrailPlan, TrailCardData, FieldJournalEntry, DifficultyLevel, WeatherTolerance, DeviceLocation, TrailLocation } from '@/types/trail';

export interface UserSettings {
  walkingPaceKmh: number;
  unit: 'km' | 'mi';
  preferredDifficulty: DifficultyLevel;
  defaultDistanceKm: number;
  selectedModel: string;
  offlineOnlyMode: boolean;
  natureInterests: string[];
  preferredTerrain: string[];
  weatherTolerance: WeatherTolerance;
}

const DEFAULT_SETTINGS: UserSettings = {
  walkingPaceKmh: 3.8,
  unit: 'km',
  preferredDifficulty: 'moderate',
  defaultDistanceKm: 4.8,
  selectedModel: 'gemma2',
  offlineOnlyMode: false,
  natureInterests: ['Autumn Foliage & Leaf Shapes', 'Bird Songs & Calls', 'Quiet Contemplation'],
  preferredTerrain: ['Dirt Trail', 'Forested Canopy', 'Gentle Ridge'],
  weatherTolerance: 'fair-weather',
};

const ACTIVE_TRAIL_KEY = 'trailnote_active_trail';
const SAVED_CARDS_KEY = 'trailnote_saved_cards';
const JOURNAL_KEY = 'trailnote_journal_entries';
const SETTINGS_KEY = 'trailnote_settings';
const DEVICE_LOCATION_KEY = 'trailnote_device_location';
const TRAIL_LOCATION_KEY = 'trailnote_trail_location';

export function saveActiveTrail(plan: TrailPlan, card: TrailCardData): void {
  if (typeof window === 'undefined') return;
  try {
    const payload = JSON.stringify({ plan, card, savedAt: new Date().toISOString() });
    localStorage.setItem(ACTIVE_TRAIL_KEY, payload);

    // Also add to saved cards list
    const existingCards = listSavedCards();
    const updated = [card, ...existingCards.filter((c) => c.id !== card.id)].slice(0, 20);
    localStorage.setItem(SAVED_CARDS_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save trail to local disk:', err);
  }
}

export function getActiveTrail(): { plan: TrailPlan; card: TrailCardData } | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(ACTIVE_TRAIL_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function listSavedCards(): TrailCardData[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(SAVED_CARDS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveJournalEntry(entry: FieldJournalEntry): void {
  if (typeof window === 'undefined') return;
  try {
    const entries = listJournalEntries();
    const updated = [entry, ...entries.filter((e) => e.id !== entry.id)];
    localStorage.setItem(JOURNAL_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save journal entry to local storage:', err);
  }
}

export function listJournalEntries(): FieldJournalEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(JOURNAL_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function loadSettings(): UserSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: Partial<UserSettings>): UserSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const current = loadSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function getOfflineStorageMetrics(): { cardsCount: number; journalCount: number; hasActiveTrail: boolean } {
  if (typeof window === 'undefined') return { cardsCount: 0, journalCount: 0, hasActiveTrail: false };
  try {
    const cards = listSavedCards();
    const journal = listJournalEntries();
    const active = getActiveTrail();
    return {
      cardsCount: cards.length,
      journalCount: journal.length,
      hasActiveTrail: !!active,
    };
  } catch {
    return { cardsCount: 0, journalCount: 0, hasActiveTrail: false };
  }
}

export function saveDeviceLocation(location: DeviceLocation): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(DEVICE_LOCATION_KEY, JSON.stringify(location));
  } catch (err) {
    console.error('Failed to store device location:', err);
  }
}

export function getDeviceLocation(): DeviceLocation | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(DEVICE_LOCATION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveTrailLocation(location: TrailLocation): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(TRAIL_LOCATION_KEY, JSON.stringify(location));
  } catch (err) {
    console.error('Failed to store trail location:', err);
  }
}

export function getTrailLocation(): TrailLocation | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(TRAIL_LOCATION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearDeviceLocation(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(DEVICE_LOCATION_KEY);
  } catch {}
}
