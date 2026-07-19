import { useMemo, useState } from 'react';
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { ja } from 'date-fns/locale';
import type { TimeEntry } from '../types/entry';
import { formatMinutes, toDateKey } from '../lib/dateUtils';
import DayDetailModal from './DayDetailModal';

interface CalendarViewProps {
  entriesByDate: Map<string, TimeEntry[]>;
  onDeleteEntry: (id: string) => void;
  onUpdateEntry: (id: string, patch: Partial<Pick<TimeEntry, 'title' | 'minutes'>>) => void;
}

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];

export default function CalendarView({ entriesByDate, onDeleteEntry, onUpdateEntry }: CalendarViewProps) {
  const [month, setMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(month));
    const end = endOfWeek(endOfMonth(month));
    return eachDayOfInterval({ start, end });
  }, [month]);

  const monthTotal = useMemo(() => {
    let total = 0;
    for (const [dateKey, entries] of entriesByDate) {
      if (dateKey.startsWith(format(month, 'yyyy-MM'))) {
        total += entries.reduce((sum, e) => sum + e.minutes, 0);
      }
    }
    return total;
  }, [entriesByDate, month]);

  const selectedEntries = selectedDate ? entriesByDate.get(selectedDate) ?? [] : [];

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:p-6 dark:bg-slate-800 dark:ring-slate-700">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setMonth((m) => addMonths(m, -1))}
          className="rounded-lg px-3 py-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
          aria-label="前の月"
        >
          ←
        </button>
        <div className="text-center">
          <div className="text-lg font-semibold text-slate-800 dark:text-slate-100">
            {format(month, 'yyyy年 M月', { locale: ja })}
          </div>
          <div className="text-xs text-slate-400 dark:text-slate-500">月合計 {formatMinutes(monthTotal)}</div>
        </div>
        <button
          onClick={() => setMonth((m) => addMonths(m, 1))}
          className="rounded-lg px-3 py-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
          aria-label="次の月"
        >
          →
        </button>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-1 text-center text-xs font-medium text-slate-400 dark:text-slate-500">
        {WEEKDAYS.map((w) => (
          <div key={w}>{w}</div>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-7 gap-1">
        {days.map((day) => {
          const dateKey = toDateKey(day);
          const dayEntries = entriesByDate.get(dateKey) ?? [];
          const totalMinutes = dayEntries.reduce((sum, e) => sum + e.minutes, 0);
          const inMonth = isSameMonth(day, month);

          return (
            <button
              key={dateKey}
              onClick={() => dayEntries.length > 0 && setSelectedDate(dateKey)}
              disabled={dayEntries.length === 0}
              className={`flex min-h-16 flex-col items-center justify-start gap-1 rounded-lg p-1.5 text-xs transition sm:min-h-20 ${
                inMonth ? 'text-slate-700 dark:text-slate-300' : 'text-slate-300 dark:text-slate-700'
              } ${
                dayEntries.length > 0
                  ? 'cursor-pointer bg-emerald-50 hover:bg-emerald-100 ring-1 ring-emerald-100 dark:bg-emerald-950 dark:hover:bg-emerald-900 dark:ring-emerald-900'
                  : 'cursor-default'
              } ${isToday(day) ? 'outline outline-2 outline-emerald-400 dark:outline-emerald-500' : ''}`}
            >
              <span className="font-medium">{format(day, 'd')}</span>
              {dayEntries.length > 0 && (
                <>
                  <span className="rounded-full bg-emerald-600 px-1.5 py-0.5 text-[10px] font-semibold text-white dark:bg-emerald-500">
                    {formatMinutes(totalMinutes)}
                  </span>
                  {dayEntries.length > 1 && (
                    <span className="text-[10px] text-emerald-700 dark:text-emerald-400">{dayEntries.length}件</span>
                  )}
                </>
              )}
            </button>
          );
        })}
      </div>

      {selectedDate && (
        <DayDetailModal
          dateKey={selectedDate}
          entries={selectedEntries}
          onClose={() => setSelectedDate(null)}
          onDelete={onDeleteEntry}
          onUpdate={onUpdateEntry}
        />
      )}
    </div>
  );
}
