import { useCallback, useEffect, useMemo, useState } from 'react';
import type { User } from 'firebase/auth';
import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, updateDoc } from 'firebase/firestore';
import type { ExpenseEntry, Settings } from '../types/entry';
import { db } from '../lib/firebase';
import { syncExpenseToSheets } from '../lib/sheetsSync';

export function useExpenseEntries(user: User, settings: Settings) {
  const uid = user.uid;
  const [entries, setEntries] = useState<ExpenseEntry[]>([]);
  const [syncStatus, setSyncStatus] = useState<Record<string, 'pending' | 'ok' | 'error'>>({});

  useEffect(() => {
    if (!db) return;
    const entriesQuery = query(collection(db, 'users', uid, 'expenses'), orderBy('date', 'asc'));
    const unsubscribe = onSnapshot(entriesQuery, (snapshot) => {
      setEntries(snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ExpenseEntry, 'id'>) })));
    });
    return unsubscribe;
  }, [uid]);

  const addExpense = useCallback(
    async (input: { date: string; category: string; detail: string; amount: number }) => {
      if (!db) return;
      const entryData: Omit<ExpenseEntry, 'id'> = { ...input, synced: false };
      const docRef = await addDoc(collection(db, 'users', uid, 'expenses'), entryData);

      if (settings.autoSync && settings.sheetsWebAppUrl) {
        const entry: ExpenseEntry = { id: docRef.id, ...entryData };
        setSyncStatus((prev) => ({ ...prev, [entry.id]: 'pending' }));
        const result = await syncExpenseToSheets(entry, settings);
        setSyncStatus((prev) => ({ ...prev, [entry.id]: result.ok ? 'ok' : 'error' }));
        if (result.ok) {
          await updateDoc(doc(db, 'users', uid, 'expenses', entry.id), { synced: true });
        }
      }
    },
    [settings, uid],
  );

  const retrySync = useCallback(
    async (id: string) => {
      if (!db) return;
      const entry = entries.find((e) => e.id === id);
      if (!entry) return;
      setSyncStatus((prev) => ({ ...prev, [id]: 'pending' }));
      const result = await syncExpenseToSheets(entry, settings);
      setSyncStatus((prev) => ({ ...prev, [id]: result.ok ? 'ok' : 'error' }));
      if (result.ok) {
        await updateDoc(doc(db, 'users', uid, 'expenses', id), { synced: true });
      }
    },
    [entries, settings, uid],
  );

  const deleteExpense = useCallback(
    async (id: string) => {
      if (!db) return;
      await deleteDoc(doc(db, 'users', uid, 'expenses', id));
    },
    [uid],
  );

  const updateExpense = useCallback(
    async (id: string, patch: Partial<Pick<ExpenseEntry, 'category' | 'detail' | 'amount'>>) => {
      if (!db) return;
      await updateDoc(doc(db, 'users', uid, 'expenses', id), patch);
    },
    [uid],
  );

  const entriesByMonth = useMemo(() => {
    const map = new Map<string, ExpenseEntry[]>();
    for (const entry of entries) {
      const key = entry.date.slice(0, 7); // "YYYY-MM"
      const list = map.get(key) ?? [];
      list.push(entry);
      map.set(key, list);
    }
    return map;
  }, [entries]);

  return { entries, entriesByMonth, addExpense, updateExpense, deleteExpense, retrySync, syncStatus };
}
