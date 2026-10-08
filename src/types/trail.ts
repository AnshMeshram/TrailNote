export type DifficultyLevel = 'easy' | 'moderate' | 'challenging' | 'rugged';
export type FitnessLevel = 'beginner' | 'moderate' | 'active' | 'experienced';
export type WeatherTolerance = 'fair-weather' | 'light-rain' | 'all-weather';

export interface Waypoint {
  id: string;
  order: number;
  name: string;
  coordinate?: {
    lat: number;
    lng: number;
  };
  note?: string;
  isMilestone?: boolean;
}

export interface WeatherCondition {
  tempC: number;
  condition: string;
  windKmh: number;
  precipitationPercent: number;
  uvIndex?: number;
  summary: string;
  sunrise?: string;
  sunset?: string;
}

export interface ObservationPromptItem {
  id: string;
  number: string; // e.g. "01", "02", "03"
  title: string;
  prompt: string;
  category?: 'flora' | 'fauna' | 'geology' | 'soundscape' | 'quiet-mind';
}

export interface DeviceLocation {
  lat: number;
  lng: number;
  accuracyM?: number;
  timestamp?: number;
}

export interface TrailLocation {
  query?: string;
  displayName: string;
  lat: number;
  lng: number;
  city?: string;
  state?: string;
  country?: string;
  isCustomGps?: boolean;
}

export interface TrailPlan {
  id: string;
  name: string;
  location: string;
  region?: string;
  coordinatesSummary?: string;
  distanceKm: number;
  durationMinutes: number;
  difficulty: DifficultyLevel;
  elevationGainM?: number;
  terrain: string[];
  startPoint: string;
  endPoint: string;
  routeSummary: string;
  waypoints: Waypoint[];
  weather: WeatherCondition;
  preparation: string[];
  safetyNotes: string[];
  observations: ObservationPromptItem[];
  outdoorChallenges: string[];
  trailBriefing: string;
  fieldPrompt?: string;
  createdAt: string;
  deviceLocation?: DeviceLocation | null;
  trailLocation?: TrailLocation;
  aiMetadata?: {
    source?: 'ai' | 'fallback' | 'gemma2' | 'naturalist-fallback';
    modelUsed?: string;
  };
}

export interface TrailPreferences {
  location: string;
  trailLocation?: TrailLocation;
  deviceLocation?: DeviceLocation | null;
  availableTimeMinutes: number;
  difficulty: DifficultyLevel;
  fitnessLevel: FitnessLevel;
  distancePreferenceKm: number;
  interests: string[];
  natureInterests: string[];
  preferredTerrain: string[];
  weatherTolerance: WeatherTolerance;
  accessibilityRequirements?: string[];
  notes?: string;
}

export interface TrailCardData {
  id: string;
  trailName: string;
  location: string;
  distanceKm: number;
  durationFormatted: string;
  difficulty: DifficultyLevel;
  weatherSummary: string;
  tempC: number;
  startPoint: string;
  endPoint: string;
  essentialsToBring: string[];
  observations: {
    number: string;
    text: string;
  }[];
  briefing: string;
  terrainNotes: string;
  safetyNote: string;
  generatedDate: string;
  aiMetadata?: {
    source?: 'ai' | 'fallback' | 'gemma2' | 'naturalist-fallback';
    modelUsed?: string;
  };
}

export interface FieldJournalEntry {
  id: string;
  trailId: string;
  trailName: string;
  location: string;
  date: string;
  distanceCoveredKm: number;
  timeSpentMinutes: number;
  observationsRecorded: string[];
  personalReflection: string;
  weatherExperienced: string;
  notableFloraFauna?: string[];
  photoUrls?: string[];
  sight?: string;
  sound?: string;
  texture?: string;
  favoriteMoment?: string;
  shapedNote?: string;
  shapedSource?: 'gemma2' | 'naturalist-fallback';
}

export interface FieldTestRecord {
  id: string;
  date: string;
  place: string;
  weather: string;
  whatWorked: string;
  whatFailed: string;
  photoUrl?: string;
  oneSurprise: string;
  checklistPassed: {
    cardPrinted: boolean;
    presavedOffline: boolean;
    airplaneModeTested: boolean;
    pencilPacked: boolean;
  };
  notes?: string;
  updatedAt: string;
}
