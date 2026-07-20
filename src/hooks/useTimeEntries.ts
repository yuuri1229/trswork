import { useCallback, useEffect, useMemo, useState } from 'react';
import type { User } from 'firebase/auth';
import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, updateDoc } from 'firebase/firestore';
import type { Settings, TimeEntry } from '../types/entry';
import { db } from '../lib/firebase';
import { loadRunningTimer, saveRunningTimer } from '../lib/storage';
import { syncEntryToSheets } from '../lib/sheetsSync';
import { toDateKey } from '../lib/dateUtils';

export function useTimeEntries(user: User, settings: Settings) {
  const uid = user.uid;
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [entriesLoaded, setEntriesLoaded] = useState(false);
  const [runningStartedAt, setRunningStartedAt] = useState<string | null>(
    () => loadRunningTimer(uid)?.startedAt ?? null,
  );
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

  useEffect(
    () => saveRunningTimer(uid, runningStartedAt ? { startedAt: runningStartedAt } : null),
    [uid, runningStartedAt],
  );

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
      if (!runningStartedAt || !db) return;
      const start = new Date(runningStartedAt);
      const end = new Date();
      const minutes = Math.max(1, Math.round((end.getTime() - start.getTime()) / 60000));
      const entryData: Omit<TimeEntry, 'id'> = {
        date: toDateKey(start),
        startedAt: start.toISOString(),
        endedAt: end.toISOString(),
        minutes,
        title: title.trim() || '(無題)',
        synced: false,
      };
      const docRef = await addDoc(collection(db, 'users', uid, 'entries'), entryData);
      setRunningStartedAt(null);

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
    [runningStartedAt, settings, uid],
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
    runningStartedAt,
    start,
    cancel,
    finish,
    deleteEntry,
    updateEntry,
    retrySync,
    syncStatus,
  };
}
