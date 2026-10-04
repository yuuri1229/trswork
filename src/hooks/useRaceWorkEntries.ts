import { useCallback, useEffect, useMemo, useState } from 'react';
import type { User } from 'firebase/auth';
import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, updateDoc } from 'firebase/firestore';
import type { RaceWorkEntry } from '../types/entry';
import { RACE_WORK_DAILY_RATE } from '../types/entry';
import { db } from '../lib/firebase';

export function useRaceWorkEntries(user: User) {
  const uid = user.uid;
  const [entries, setEntries] = useState<RaceWorkEntry[]>([]);

  useEffect(() => {
    if (!db) return;
    const entriesQuery = query(collection(db, 'users', uid, 'raceWork'), orderBy('date', 'asc'));
    const unsubscribe = onSnapshot(entriesQuery, (snapshot) => {
      setEntries(snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<RaceWorkEntry, 'id'>) })));
    });
    return unsubscribe;
  }, [uid]);

  const addRaceWork = useCallback(
    async (input: { date: string; eventName: string; days: number }) => {
      if (!db) return;
      const entryData: Omit<RaceWorkEntry, 'id'> = {
        ...input,
        amount: input.days * RACE_WORK_DAILY_RATE,
      };
      await addDoc(collection(db, 'users', uid, 'raceWork'), entryData);
    },
    [uid],
  );

  const deleteRaceWork = useCallback(
    async (id: string) => {
      if (!db) return;
      await deleteDoc(doc(db, 'users', uid, 'raceWork', id));
    },
    [uid],
  );

  const updateRaceWork = useCallback(
    async (id: string, patch: Partial<Pick<RaceWorkEntry, 'eventName' | 'days'>>) => {
      if (!db) return;
      const fullPatch: Partial<RaceWorkEntry> = { ...patch };
      if (patch.days !== undefined) {
        fullPatch.amount = patch.days * RACE_WORK_DAILY_RATE;
      }
      await updateDoc(doc(db, 'users', uid, 'raceWork', id), fullPatch);
    },
    [uid],
  );

  const entriesByMonth = useMemo(() => {
    const map = new Map<string, RaceWorkEntry[]>();
    for (const entry of entries) {
      const key = entry.date.slice(0, 7); // "YYYY-MM"
      const list = map.get(key) ?? [];
      list.push(entry);
      map.set(key, list);
    }
    return map;
  }, [entries]);

  return { entries, entriesByMonth, addRaceWork, updateRaceWork, deleteRaceWork };
}
