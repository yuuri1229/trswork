import type { RunningTimer, TimeEntry } from '../types/entry';

const ENTRIES_KEY = 'trswork.entries.v1';
const TIMER_KEY = 'trswork.runningTimer.v1';
const SETTINGS_KEY = 'trswork.settings.v1';

export interface Settings {
  workerName: string;
  sheetsWebAppUrl: string;
  sheetsSharedSecret: string;
  autoSync: boolean;
}

const defaultSettings: Settings = {
  workerName: '',
  sheetsWebAppUrl: '',
  sheetsSharedSecret: '',
  autoSync: false,
};

export function loadEntries(): TimeEntry[] {
  try {
    const raw = localStorage.getItem(ENTRIES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as TimeEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveEntries(entries: TimeEntry[]): void {
  localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
}

export function loadRunningTimer(): RunningTimer | null {
  try {
    const raw = localStorage.getItem(TIMER_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as RunningTimer;
  } catch {
    return null;
  }
}

export function saveRunningTimer(timer: RunningTimer | null): void {
  if (timer) {
    localStorage.setItem(TIMER_KEY, JSON.stringify(timer));
  } else {
    localStorage.removeItem(TIMER_KEY);
  }
}

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return defaultSettings;
    return { ...defaultSettings, ...(JSON.parse(raw) as Partial<Settings>) };
  } catch {
    return defaultSettings;
  }
}

export function saveSettings(settings: Settings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
