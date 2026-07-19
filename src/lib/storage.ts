import type { RunningTimer } from '../types/entry';

const TIMER_KEY_PREFIX = 'trswork.runningTimer.v1.';

// The in-progress timer is kept device-local (not synced to Firestore) since
// it only makes sense to resume it on the same device/browser it was
// started on. Namespaced by uid so switching accounts on a shared device
// doesn't leak one user's running timer into another's session.

export function loadRunningTimer(uid: string): RunningTimer | null {
  try {
    const raw = localStorage.getItem(TIMER_KEY_PREFIX + uid);
    if (!raw) return null;
    return JSON.parse(raw) as RunningTimer;
  } catch {
    return null;
  }
}

export function saveRunningTimer(uid: string, timer: RunningTimer | null): void {
  if (timer) {
    localStorage.setItem(TIMER_KEY_PREFIX + uid, JSON.stringify(timer));
  } else {
    localStorage.removeItem(TIMER_KEY_PREFIX + uid);
  }
}
