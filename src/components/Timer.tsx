import { useEffect, useState } from 'react';
import { formatElapsed } from '../lib/dateUtils';
import StopEntryModal from './StopEntryModal';

interface TimerProps {
  isRunning: boolean;
  runningStartedAt: string | null;
  onStart: () => void;
  onFinish: (title: string) => void | Promise<void>;
  onCancel: () => void;
}

export default function Timer({ isRunning, runningStartedAt, onStart, onFinish, onCancel }: TimerProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showStopModal, setShowStopModal] = useState(false);

  useEffect(() => {
    if (!isRunning || !runningStartedAt) {
      setElapsedSeconds(0);
      return;
    }
    const start = new Date(runningStartedAt).getTime();
    const tick = () => setElapsedSeconds(Math.floor((Date.now() - start) / 1000));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [isRunning, runningStartedAt]);

  const handleConfirmStop = async (title: string) => {
    setShowStopModal(false);
    await onFinish(title);
  };

  return (
    <div className="flex flex-col items-center gap-6 rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
      <div className="text-sm font-medium tracking-wide text-slate-500">
        {isRunning ? '作業中…' : '作業を開始してください'}
      </div>
      <div
        className={`font-mono text-6xl font-semibold tabular-nums ${
          isRunning ? 'text-emerald-600' : 'text-slate-300'
        }`}
      >
        {formatElapsed(elapsedSeconds)}
      </div>
      <div className="flex gap-4">
        {!isRunning ? (
          <button
            onClick={onStart}
            className="rounded-full bg-emerald-600 px-10 py-4 text-lg font-semibold text-white shadow hover:bg-emerald-700 active:scale-95 transition"
          >
            作業開始
          </button>
        ) : (
          <>
            <button
              onClick={() => setShowStopModal(true)}
              className="rounded-full bg-rose-600 px-10 py-4 text-lg font-semibold text-white shadow hover:bg-rose-700 active:scale-95 transition"
            >
              作業終了
            </button>
            <button
              onClick={onCancel}
              className="rounded-full bg-slate-100 px-6 py-4 text-sm font-medium text-slate-500 hover:bg-slate-200 transition"
            >
              キャンセル
            </button>
          </>
        )}
      </div>

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
