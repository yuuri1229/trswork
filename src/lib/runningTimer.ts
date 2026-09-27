import type { RunningTimer } from '../types/entry';

/** Milliseconds paused so far, including an ongoing pause up to `now`. */
export function getPausedMs(timer: RunningTimer, now: number): number {
  const ongoing = timer.pausedAt ? now - new Date(timer.pausedAt).getTime() : 0;
  return (timer.pausedMs ?? 0) + Math.max(0, ongoing);
}

/** Milliseconds actually worked (wall-clock time since start minus pauses). */
export function getWorkedMs(timer: RunningTimer, now: number): number {
  return Math.max(0, now - new Date(timer.startedAt).getTime() - getPausedMs(timer, now));
}
