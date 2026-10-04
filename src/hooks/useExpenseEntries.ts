import { useCallback, useEffect, useMemo, useState } from 'react';
import type { User } from 'firebase/auth';
import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, updateDoc } from 'firebase/firestore';
import type { ExpenseEntry } from '../types/entry';
import { db } from '../lib/firebase';

export function useExpenseEntries(user: User) {
  const uid = user.uid;
  const [entries, setEntries] = useState<ExpenseEntry[]>([]);

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
      await addDoc(collection(db, 'users', uid, 'expenses'), input);
    },
    [uid],
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

  return { entries, entriesByMonth, addExpense, updateExpense, deleteExpense };
}
