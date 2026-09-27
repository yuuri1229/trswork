import { useCallback, useEffect, useMemo, useState } from 'react';
import type { User } from 'firebase/auth';
import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, updateDoc } from 'firebase/firestore';
import type { RunningTimer, Settings, TimeEntry } from '../types/entry';
import { db } from '../lib/firebase';
import { loadRunningTimer, saveRunningTimer } from '../lib/storage';
import { syncEntryToSheets } from '../lib/sheetsSync';
import { getPausedMs, getWorkedMs } from '../lib/runningTimer';
import { toDateKey } from '../lib/dateUtils';

export function useTimeEntries(user: User, settings: Settings) {
  const uid = user.uid;
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [entriesLoaded, setEntriesLoaded] = useState(false);
  const [runningTimer, setRunningTimer] = useState<RunningTimer | null>(() => loadRunningTimer(uid));
  const [syncStatus, setSyncStatus] = useState<Record<string, 'pending' | 'ok' | 'error'>>({});

  useEffect(() => {
    if (!db) return;
    const entriesQuery = query(collection(db, 'users', uid, 'entries'), orderBy('startedAt', 'asc'));
    const unsubscribe = onSnapshot(entriesQuery, (snapshot) => {
      setEntries(snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<TimeEntry, 'id'>) })));
      setEntriesLoaded(true);
    });
    return unsubscribe;
  }, [uid]);

  useEffect(() => saveRunningTimer(uid, runningTimer), [uid, runningTimer]);

  const isRunning = runningTimer !== null;
  const isPaused = !!runningTimer?.pausedAt;

  const start = useCallback(() => {
    if (isRunning) return;
    setRunningTimer({ startedAt: new Date().toISOString(), pausedAt: null, pausedMs: 0 });
  }, [isRunning]);

  const pause = useCallback(() => {
    setRunningTimer((prev) => (prev && !prev.pausedAt ? { ...prev, pausedAt: new Date().toISOString() } : prev));
  }, []);

  const resume = useCallback(() => {
    setRunningTimer((prev) =>
      prev?.pausedAt ? { ...prev, pausedAt: null, pausedMs: getPausedMs(prev, Date.now()) } : prev,
    );
  }, []);

  const cancel = useCallback(() => {
    setRunningTimer(null);
  }, []);

  const finish = useCallback(
    async (title: string) => {
      if (!runningTimer || !db) return;
      const start = new Date(runningTimer.startedAt);
      // If finished while paused, the work actually ended when the pause began.
      const end = runningTimer.pausedAt ? new Date(runningTimer.pausedAt) : new Date();
      const minutes = Math.max(1, Math.round(getWorkedMs(runningTimer, end.getTime()) / 60000));
      const pausedMinutes = Math.round(getPausedMs(runningTimer, end.getTime()) / 60000);
      const entryData: Omit<TimeEntry, 'id'> = {
        date: toDateKey(start),
        startedAt: start.toISOString(),
        endedAt: end.toISOString(),
        minutes,
        ...(pausedMinutes > 0 && { pausedMinutes }),
        title: title.trim() || '(無題)',
        synced: false,
      };
      const docRef = await addDoc(collection(db, 'users', uid, 'entries'), entryData);
      setRunningTimer(null);

      if (settings.autoSync && settings.sheetsWebAppUrl) {
        const entry: TimeEntry = { id: docRef.id, ...entryData };
        setSyncStatus((prev) => ({ ...prev, [entry.id]: 'pending' }));
        const result = await syncEntryToSheets(entry, settings);
        setSyncStatus((prev) => ({ ...prev, [entry.id]: result.ok ? 'ok' : 'error' }));
        if (result.ok) {
          await updateDoc(doc(db, 'users', uid, 'entries', entry.id), { synced: true });
        }
      }
    },
    [runningTimer, settings, uid],
  );

  const retrySync = useCallback(
    async (id: string) => {
      if (!db) return;
      const entry = entries.find((e) => e.id === id);
      if (!entry) return;
      setSyncStatus((prev) => ({ ...prev, [id]: 'pending' }));
      const result = await syncEntryToSheets(entry, settings);
      setSyncStatus((prev) => ({ ...prev, [id]: result.ok ? 'ok' : 'error' }));
      if (result.ok) {
        await updateDoc(doc(db, 'users', uid, 'entries', id), { synced: true });
      }
    },
    [entries, settings, uid],
  );

  const deleteEntry = useCallback(
    async (id: string) => {
      if (!db) return;
      await deleteDoc(doc(db, 'users', uid, 'entries', id));
    },
    [uid],
  );

  const updateEntry = useCallback(
    async (id: string, patch: Partial<Pick<TimeEntry, 'title' | 'minutes'>>) => {
      if (!db) return;
      await updateDoc(doc(db, 'users', uid, 'entries', id), patch);
    },
    [uid],
  );

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
    entriesLoaded,
    entriesByDate,
    isRunning,
    isPaused,
    runningTimer,
    start,
    pause,
    resume,
    cancel,
    finish,
    deleteEntry,
    updateEntry,
    retrySync,
    syncStatus,
  };
}
