import { useState } from 'react';
import { formatElapsed } from '../lib/dateUtils';

interface StopEntryModalProps {
  elapsedSeconds: number;
  onCancel: () => void;
  onConfirm: (title: string) => void;
}

export default function StopEntryModal({ elapsedSeconds, onCancel, onConfirm }: StopEntryModalProps) {
  const [title, setTitle] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(title);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 dark:bg-black/60">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-800">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">作業内容を入力</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          作業時間: <span className="font-mono font-semibold">{formatElapsed(elapsedSeconds)}</span>
        </p>
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
          <input
            autoFocus
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="例）櫛形 ボランティアサイト作成"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:ring-emerald-900"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500"
            >
              記録する
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
