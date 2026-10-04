import { useEffect, useState } from 'react';
import { MdPause, MdPlayArrow } from 'react-icons/md';
import type { RunningTimer } from '../types/entry';
import { formatElapsed } from '../lib/dateUtils';
import { getPausedMs, getWorkedMs } from '../lib/runningTimer';
import StopEntryModal from './StopEntryModal';

interface TimerProps {
  runningTimer: RunningTimer | null;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onFinish: (title: string) => void | Promise<void>;
  onCancel: () => void;
}

export default function Timer({ runningTimer, onStart, onPause, onResume, onFinish, onCancel }: TimerProps) {
  const [now, setNow] = useState(() => Date.now());
  const [showStopModal, setShowStopModal] = useState(false);

  const isRunning = runningTimer !== null;
  const isPaused = !!runningTimer?.pausedAt;

  useEffect(() => {
    if (!isRunning) return;
    const tick = () => setNow(Date.now());
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [isRunning]);

  const elapsedSeconds = runningTimer ? Math.floor(getWorkedMs(runningTimer, now) / 1000) : 0;
  const pausedSeconds = runningTimer ? Math.floor(getPausedMs(runningTimer, now) / 1000) : 0;

  const handleConfirmStop = async (title: string) => {
    setShowStopModal(false);
    await onFinish(title);
  };

  return (
    <div className="flex flex-col items-center gap-6 rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200 dark:bg-neutral-900 dark:ring-neutral-800">
      <div className="text-sm font-medium tracking-wide text-slate-500 dark:text-neutral-400">
        {!isRunning ? '作業を開始してください' : isPaused ? '一時停止中' : '作業中…'}
      </div>
      <div className="flex flex-col items-center gap-1">
        <div
          className={`font-mono text-6xl font-semibold tabular-nums ${
            !isRunning
              ? 'text-slate-300 dark:text-neutral-700'
              : isPaused
                ? 'text-amber-500 dark:text-amber-400'
                : 'text-emerald-600 dark:text-emerald-400'
          }`}
        >
          {formatElapsed(elapsedSeconds)}
        </div>
        {isRunning && pausedSeconds > 0 && (
          <div className="text-xs text-slate-400 dark:text-neutral-500">
            一時停止 合計 <span className="font-mono tabular-nums">{formatElapsed(pausedSeconds)}</span>
          </div>
        )}
      </div>
      {!isRunning ? (
        <button
          onClick={onStart}
          className="rounded-full bg-emerald-600 px-10 py-4 text-lg font-semibold text-white shadow hover:bg-emerald-700 active:scale-95 transition dark:bg-emerald-600 dark:hover:bg-emerald-500"
        >
          作業開始
        </button>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <div className="flex gap-3">
            {isPaused ? (
              <button
                onClick={onResume}
                className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-6 py-4 text-lg font-semibold text-white shadow hover:bg-emerald-700 active:scale-95 transition dark:bg-emerald-600 dark:hover:bg-emerald-500"
              >
                <MdPlayArrow className="h-6 w-6" aria-hidden />
                再開
              </button>
            ) : (
              <button
                onClick={onPause}
                className="inline-flex items-center gap-1 rounded-full bg-amber-500 px-6 py-4 text-lg font-semibold text-white shadow hover:bg-amber-600 active:scale-95 transition dark:bg-amber-500 dark:hover:bg-amber-400"
              >
                <MdPause className="h-6 w-6" aria-hidden />
                一時停止
              </button>
            )}
            <button
              onClick={() => setShowStopModal(true)}
              className="rounded-full bg-rose-600 px-6 py-4 text-lg font-semibold text-white shadow hover:bg-rose-700 active:scale-95 transition dark:bg-rose-600 dark:hover:bg-rose-500"
            >
              作業終了
            </button>
          </div>
          <button
            onClick={onCancel}
            className="rounded-full bg-slate-100 px-6 py-2 text-sm font-medium text-slate-500 hover:bg-slate-200 transition dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
          >
            キャンセル
          </button>
        </div>
      )}

      {showStopModal && (
        <StopEntryModal
          elapsedSeconds={elapsedSeconds}
          onCancel={() => setShowStopModal(false)}
          onConfirm={handleConfirmStop}
        />
      )}
    </div>
  );
}
