import { useCallback, useEffect, useState } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { defaultSettings, type Settings } from '../types/entry';
import { db } from '../lib/firebase';

export function useSettings(uid: string) {
  const [settings, setSettingsState] = useState<Settings>(defaultSettings);

  useEffect(() => {
    if (!db) return;
    const settingsRef = doc(db, 'users', uid, 'settings', 'main');
    const unsubscribe = onSnapshot(settingsRef, (snap) => {
      setSettingsState(snap.exists() ? { ...defaultSettings, ...(snap.data() as Partial<Settings>) } : defaultSettings);
    });
    return unsubscribe;
  }, [uid]);

  const setSettings = useCallback(
    async (next: Settings) => {
      if (!db) return;
      await setDoc(doc(db, 'users', uid, 'settings', 'main'), next);
    },
    [uid],
  );

  return { settings, setSettings };
}
