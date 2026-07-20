import { useState } from 'react';
import { RACE_WORK_DAILY_RATE, type RaceWorkEntry } from '../types/entry';
import { toDateKey } from '../lib/dateUtils';

interface RaceWorkFormModalProps {
  month: Date;
  initial?: RaceWorkEntry;
  onClose: () => void;
  onSubmit: (input: { date: string; eventName: string; days: number }) => void;
}

function defaultDateForMonth(month: Date): string {
  const today = toDateKey(new Date());
  const monthKey = toDateKey(month).slice(0, 7);
  return today.slice(0, 7) === monthKey ? today : `${monthKey}-01`;
}

export default function RaceWorkFormModal({ month, initial, onClose, onSubmit }: RaceWorkFormModalProps) {
  const [date, setDate] = useState(initial?.date ?? defaultDateForMonth(month));
  const [eventName, setEventName] = useState(initial?.eventName ?? '');
  const [days, setDays] = useState(initial?.days ?? 1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ date, eventName: eventName.trim(), days: Math.max(0, days) });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 dark:bg-black/60" onClick={onClose}>
      <div
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
          {initial ? 'レース作業を編集' : 'レース作業を追加'}
        </h2>
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-slate-600 dark:text-slate-300">日付</span>
            <input
              required
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:focus:ring-emerald-900"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-slate-600 dark:text-slate-300">大会名</span>
            <input
              required
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              placeholder="例）〇〇マラソン大会"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:ring-emerald-900"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-slate-600 dark:text-slate-300">日数</span>
            <input
              required
              type="number"
              min={0}
              step={1}
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:focus:ring-emerald-900"
            />
          </label>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            金額: {(Math.max(0, days) * RACE_WORK_DAILY_RATE).toLocaleString()} 円（{RACE_WORK_DAILY_RATE.toLocaleString()} 円 ×{' '}
            {Math.max(0, days)} 日）
          </p>

          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500"
            >
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
