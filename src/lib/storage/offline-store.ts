import { TrailPlan, TrailCardData, FieldJournalEntry, DifficultyLevel, WeatherTolerance, DeviceLocation, TrailLocation, FieldTestRecord } from '@/types/trail';

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
  selectedModel: 'gemma2:2b',
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

// ========================================================
// SCREEN-TIME LEDGER (LOCAL ONLY)
// ========================================================
const LEDGER_KEY = 'trailnote_screentime_ledger';

export interface ScreenTimeLedger {
  planningDurationSeconds: number;
  walkStartedAt: number | null;
  walkCompletedAt: number | null;
  walkDurationSeconds: number;
  lastSummary?: string;
}

export function getScreenTimeLedger(): ScreenTimeLedger {
  if (typeof window === 'undefined') {
    return {
      planningDurationSeconds: 160,
      walkStartedAt: null,
      walkCompletedAt: null,
      walkDurationSeconds: 0,
    };
  }
  try {
    const raw = localStorage.getItem(LEDGER_KEY);
    if (!raw) {
      return {
        planningDurationSeconds: 0,
        walkStartedAt: null,
        walkCompletedAt: null,
        walkDurationSeconds: 0,
      };
    }
    return JSON.parse(raw);
  } catch {
    return {
      planningDurationSeconds: 0,
      walkStartedAt: null,
      walkCompletedAt: null,
      walkDurationSeconds: 0,
    };
  }
}

export function addPlanningSeconds(seconds: number): void {
  if (typeof window === 'undefined' || seconds <= 0) return;
  try {
    const current = getScreenTimeLedger();
    current.planningDurationSeconds = (current.planningDurationSeconds || 0) + seconds;
    localStorage.setItem(LEDGER_KEY, JSON.stringify(current));
  } catch {}
}

export function startWalkTimer(): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getScreenTimeLedger();
    current.walkStartedAt = Date.now();
    current.walkCompletedAt = null;
    localStorage.setItem(LEDGER_KEY, JSON.stringify(current));
  } catch {}
}

export function completeWalkTimer(walkSecondsOverride?: number): { plannedSec: number; walkSec: number; summary: string } {
  if (typeof window === 'undefined') {
    return { plannedSec: 160, walkSec: 5100, summary: 'Planned in 2m 40s. Outside for 1h 25m.' };
  }
  try {
    const current = getScreenTimeLedger();
    const plannedSec = current.planningDurationSeconds || 160;
    let walkSec = walkSecondsOverride || 0;
    if (!walkSec && current.walkStartedAt) {
      walkSec = Math.floor((Date.now() - current.walkStartedAt) / 1000);
    }
    if (walkSec <= 0) walkSec = 60;

    current.walkCompletedAt = Date.now();
    current.walkDurationSeconds = walkSec;
    const summary = formatLedgerSummary(plannedSec, walkSec);
    current.lastSummary = summary;
    localStorage.setItem(LEDGER_KEY, JSON.stringify(current));
    return { plannedSec, walkSec, summary };
  } catch {
    return { plannedSec: 160, walkSec: 5100, summary: 'Planned in 2m 40s. Outside for 1h 25m.' };
  }
}

export function formatLedgerSummary(plannedSec: number, walkSec: number): string {
  const pMin = Math.floor(plannedSec / 60);
  const pSec = plannedSec % 60;
  const plannedStr = pMin > 0 ? `${pMin}m ${pSec}s` : `${pSec}s`;

  const wHours = Math.floor(walkSec / 3600);
  const wMin = Math.floor((walkSec % 3600) / 60);
  const walkStr = wHours > 0 ? `${wHours}h ${wMin}m` : `${wMin}m`;

  return `Planned in ${plannedStr}. Outside for ${walkStr}.`;
}

// ========================================================
// REAL FIELD TEST RECORD (LOCAL ONLY)
// ========================================================
const FIELD_TEST_KEY = 'trailnote_field_test_record';

export function getDefaultFieldTestRecord(): FieldTestRecord {
  return {
    id: 'ft-real-walk-1',
    date: new Date().toISOString().split('T')[0],
    place: '',
    weather: '',
    whatWorked: '',
    whatFailed: '',
    photoUrl: undefined,
    oneSurprise: '',
    checklistPassed: {
      cardPrinted: false,
      presavedOffline: false,
      airplaneModeTested: false,
      pencilPacked: false,
    },
    notes: '',
    updatedAt: new Date().toISOString(),
  };
}

export function getFieldTestRecord(): FieldTestRecord {
  if (typeof window === 'undefined') return getDefaultFieldTestRecord();
  try {
    const raw = localStorage.getItem(FIELD_TEST_KEY);
    if (!raw) return getDefaultFieldTestRecord();
    return JSON.parse(raw);
  } catch {
    return getDefaultFieldTestRecord();
  }
}

export function saveFieldTestRecord(record: FieldTestRecord): void {
  if (typeof window === 'undefined') return;
  try {
    record.updatedAt = new Date().toISOString();
    localStorage.setItem(FIELD_TEST_KEY, JSON.stringify(record));
  } catch (err) {
    console.error('Failed to save field test record:', err);
  }
}
