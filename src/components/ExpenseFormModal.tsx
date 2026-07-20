import { useState } from 'react';
import { EXPENSE_CATEGORIES, type ExpenseEntry } from '../types/entry';
import { toDateKey } from '../lib/dateUtils';

interface ExpenseFormModalProps {
  month: Date;
  initial?: ExpenseEntry;
  onClose: () => void;
  onSubmit: (input: { date: string; category: string; detail: string; amount: number }) => void;
}

function defaultDateForMonth(month: Date): string {
  const today = toDateKey(new Date());
  const monthKey = toDateKey(month).slice(0, 7);
  return today.slice(0, 7) === monthKey ? today : `${monthKey}-01`;
}

export default function ExpenseFormModal({ month, initial, onClose, onSubmit }: ExpenseFormModalProps) {
  const [date, setDate] = useState(initial?.date ?? defaultDateForMonth(month));
  const [category, setCategory] = useState(initial?.category ?? EXPENSE_CATEGORIES[0]);
  const [detail, setDetail] = useState(initial?.detail ?? '');
  const [amount, setAmount] = useState(initial?.amount ?? 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ date, category, detail: detail.trim(), amount: Math.max(0, amount) });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 dark:bg-black/60" onClick={onClose}>
      <div
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
          {initial ? '経費を編集' : '経費を追加'}
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
            <span className="font-medium text-slate-600 dark:text-slate-300">科目</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:focus:ring-emerald-900"
            >
              {EXPENSE_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-slate-600 dark:text-slate-300">詳細</span>
            <input
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              placeholder="例）現地までの電車代"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:ring-emerald-900"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-slate-600 dark:text-slate-300">料金（円）</span>
            <input
              required
              type="number"
              min={0}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:focus:ring-emerald-900"
            />
          </label>

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
