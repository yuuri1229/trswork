import { useCallback, useEffect, useMemo, useState } from 'react';
import type { TimeEntry } from '../types/entry';
import {
  loadEntries,
  loadRunningTimer,
  loadSettings,
  saveEntries,
  saveRunningTimer,
  saveSettings,
  type Settings,
} from '../lib/storage';
import { syncEntryToSheets } from '../lib/sheetsSync';
import { toDateKey } from '../lib/dateUtils';

function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function useTimeEntries() {
  const [entries, setEntries] = useState<TimeEntry[]>(() => loadEntries());
  const [runningStartedAt, setRunningStartedAt] = useState<string | null>(
    () => loadRunningTimer()?.startedAt ?? null,
  );
  const [settings, setSettings] = useState<Settings>(() => loadSettings());
  const [syncStatus, setSyncStatus] = useState<Record<string, 'pending' | 'ok' | 'error'>>({});

  useEffect(() => saveEntries(entries), [entries]);
  useEffect(
    () => saveRunningTimer(runningStartedAt ? { startedAt: runningStartedAt } : null),
    [runningStartedAt],
  );
  useEffect(() => saveSettings(settings), [settings]);

  const isRunning = runningStartedAt !== null;

  const start = useCallback(() => {
    if (isRunning) return;
    setRunningStartedAt(new Date().toISOString());
  }, [isRunning]);

  const cancel = useCallback(() => {
    setRunningStartedAt(null);
  }, []);

  const finish = useCallback(
    async (title: string) => {
      if (!runningStartedAt) return;
      const start = new Date(runningStartedAt);
      const end = new Date();
      const minutes = Math.max(1, Math.round((end.getTime() - start.getTime()) / 60000));
      const entry: TimeEntry = {
        id: makeId(),
        date: toDateKey(start),
        startedAt: start.toISOString(),
        endedAt: end.toISOString(),
        minutes,
        title: title.trim() || '(無題)',
        synced: false,
      };
      setEntries((prev) => [...prev, entry]);
      setRunningStartedAt(null);

      if (settings.autoSync && settings.sheetsWebAppUrl) {
        setSyncStatus((prev) => ({ ...prev, [entry.id]: 'pending' }));
        const result = await syncEntryToSheets(entry, settings);
        setSyncStatus((prev) => ({ ...prev, [entry.id]: result.ok ? 'ok' : 'error' }));
        if (result.ok) {
          setEntries((prev) =>
            prev.map((e) => (e.id === entry.id ? { ...e, synced: true } : e)),
          );
        }
      }
    },
    [runningStartedAt, settings],
  );

  const retrySync = useCallback(
    async (id: string) => {
      const entry = entries.find((e) => e.id === id);
      if (!entry) return;
      setSyncStatus((prev) => ({ ...prev, [id]: 'pending' }));
      const result = await syncEntryToSheets(entry, settings);
      setSyncStatus((prev) => ({ ...prev, [id]: result.ok ? 'ok' : 'error' }));
      if (result.ok) {
        setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, synced: true } : e)));
      }
    },
    [entries, settings],
  );

  const deleteEntry = useCallback((id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const updateEntry = useCallback((id: string, patch: Partial<Pick<TimeEntry, 'title' | 'minutes'>>) => {
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  }, []);

  const entriesByDate = useMemo(() => {
    const map = new Map<string, TimeEntry[]>();
    for (const entry of entries) {
      const list = map.get(entry.date) ?? [];
      list.push(entry);
      map.set(entry.date, list);
    }
    return map;
  }, [entries]);

  return {
    entries,
    entriesByDate,
    isRunning,
    runningStartedAt,
    start,
    cancel,
    finish,
    deleteEntry,
    updateEntry,
    retrySync,
    syncStatus,
    settings,
    setSettings,
  };
}
