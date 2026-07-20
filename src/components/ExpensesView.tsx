import { useMemo, useState } from 'react';
import { addMonths, format, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';
import type { ExpenseEntry, RaceWorkEntry } from '../types/entry';
import { formatYen } from '../lib/dateUtils';
import ExpenseFormModal from './ExpenseFormModal';
import RaceWorkFormModal from './RaceWorkFormModal';

interface ExpensesViewProps {
  expensesByMonth: Map<string, ExpenseEntry[]>;
  onAddExpense: (input: { date: string; category: string; detail: string; amount: number }) => void;
  onUpdateExpense: (id: string, patch: Partial<Pick<ExpenseEntry, 'category' | 'detail' | 'amount'>>) => void;
  onDeleteExpense: (id: string) => void;
  raceWorkByMonth: Map<string, RaceWorkEntry[]>;
  onAddRaceWork: (input: { date: string; eventName: string; days: number }) => void;
  onUpdateRaceWork: (id: string, patch: Partial<Pick<RaceWorkEntry, 'eventName' | 'days'>>) => void;
  onDeleteRaceWork: (id: string) => void;
}

export default function ExpensesView({
  expensesByMonth,
  onAddExpense,
  onUpdateExpense,
  onDeleteExpense,
  raceWorkByMonth,
  onAddRaceWork,
  onUpdateRaceWork,
  onDeleteRaceWork,
}: ExpensesViewProps) {
  const [month, setMonth] = useState(() => new Date());
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showRaceForm, setShowRaceForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseEntry | null>(null);
  const [editingRaceWork, setEditingRaceWork] = useState<RaceWorkEntry | null>(null);

  const monthKey = format(month, 'yyyy-MM');
  const expenses = useMemo(
    () => (expensesByMonth.get(monthKey) ?? []).slice().sort((a, b) => a.date.localeCompare(b.date)),
    [expensesByMonth, monthKey],
  );
  const raceWork = useMemo(
    () => (raceWorkByMonth.get(monthKey) ?? []).slice().sort((a, b) => a.date.localeCompare(b.date)),
    [raceWorkByMonth, monthKey],
  );

  const expenseTotal = expenses.reduce((sum, e) => sum + e.amount, 0);
  const raceWorkTotal = raceWork.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700">
        <button
          onClick={() => setMonth((m) => addMonths(m, -1))}
          className="rounded-lg px-3 py-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
          aria-label="前の月"
        >
          ←
        </button>
        <div className="text-lg font-semibold text-slate-800 dark:text-slate-100">
          {format(month, 'yyyy年 M月', { locale: ja })}
        </div>
        <button
          onClick={() => setMonth((m) => addMonths(m, 1))}
          className="rounded-lg px-3 py-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
          aria-label="次の月"
        >
          →
        </button>
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:p-6 dark:bg-slate-800 dark:ring-slate-700">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">経費</h2>
          <button
            onClick={() => setShowExpenseForm(true)}
            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500"
          >
            + 経費を追加
          </button>
        </div>

        {expenses.length === 0 ? (
          <p className="mt-4 text-sm text-slate-400 dark:text-slate-500">この月の経費はまだありません。</p>
        ) : (
          <ul className="mt-4 flex flex-col gap-2">
            {expenses.map((entry) => (
              <li
                key={entry.id}
                className="flex items-start justify-between gap-2 rounded-lg border border-slate-200 p-3 dark:border-slate-700"
              >
                <div>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                    <span className="mr-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                      {entry.category}
                    </span>
                    {formatYen(entry.amount)}
                  </p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {format(parseISO(entry.date), 'M月d日', { locale: ja })}
                    {entry.detail && ` ・ ${entry.detail}`}
                    {entry.synced && <span className="ml-1 text-emerald-500 dark:text-emerald-400">・同期済</span>}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2 text-xs">
                  <button
                    onClick={() => setEditingExpense(entry)}
                    className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                  >
                    編集
                  </button>
                  <button
                    onClick={() => onDeleteExpense(entry.id)}
                    className="text-rose-400 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300"
                  >
                    削除
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <p className="mt-4 text-right text-sm font-semibold text-slate-700 dark:text-slate-200">
          経費合計: {formatYen(expenseTotal)}
        </p>
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:p-6 dark:bg-slate-800 dark:ring-slate-700">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">レース作業</h2>
          <button
            onClick={() => setShowRaceForm(true)}
            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500"
          >
            + レース作業を追加
          </button>
        </div>

        {raceWork.length === 0 ? (
          <p className="mt-4 text-sm text-slate-400 dark:text-slate-500">この月のレース作業はまだありません。</p>
        ) : (
          <ul className="mt-4 flex flex-col gap-2">
            {raceWork.map((entry) => (
              <li
                key={entry.id}
                className="flex items-start justify-between gap-2 rounded-lg border border-slate-200 p-3 dark:border-slate-700"
              >
                <div>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{entry.eventName}</p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {format(parseISO(entry.date), 'M月d日', { locale: ja })} ・ {entry.days}日 ・ {formatYen(entry.amount)}
                    {entry.synced && <span className="ml-1 text-emerald-500 dark:text-emerald-400">・同期済</span>}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2 text-xs">
                  <button
                    onClick={() => setEditingRaceWork(entry)}
                    className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                  >
                    編集
                  </button>
                  <button
                    onClick={() => onDeleteRaceWork(entry.id)}
                    className="text-rose-400 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300"
                  >
                    削除
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <p className="mt-4 text-right text-sm font-semibold text-slate-700 dark:text-slate-200">
          レース作業合計: {formatYen(raceWorkTotal)}
        </p>
      </div>

      {showExpenseForm && (
        <ExpenseFormModal
          month={month}
          onClose={() => setShowExpenseForm(false)}
          onSubmit={(input) => {
            onAddExpense(input);
            setShowExpenseForm(false);
          }}
        />
      )}
      {editingExpense && (
        <ExpenseFormModal
          month={month}
          initial={editingExpense}
          onClose={() => setEditingExpense(null)}
          onSubmit={(input) => {
            onUpdateExpense(editingExpense.id, input);
            setEditingExpense(null);
          }}
        />
      )}
      {showRaceForm && (
        <RaceWorkFormModal
          month={month}
          onClose={() => setShowRaceForm(false)}
          onSubmit={(input) => {
            onAddRaceWork(input);
            setShowRaceForm(false);
          }}
        />
      )}
      {editingRaceWork && (
        <RaceWorkFormModal
          month={month}
          initial={editingRaceWork}
          onClose={() => setEditingRaceWork(null)}
          onSubmit={(input) => {
            onUpdateRaceWork(editingRaceWork.id, input);
            setEditingRaceWork(null);
          }}
        />
      )}
    </div>
  );
}
