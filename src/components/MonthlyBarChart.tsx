import { useMemo, useState } from 'react';
import { format, parseISO, subMonths } from 'date-fns';
import { ja } from 'date-fns/locale';
import type { TimeEntry } from '../types/entry';
import { formatHoursDecimal } from '../lib/dateUtils';

interface MonthlyBarChartProps {
  entries: TimeEntry[];
}

const MONTHS_SHOWN = 12;

export default function MonthlyBarChart({ entries }: MonthlyBarChartProps) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [showTable, setShowTable] = useState(false);

  const data = useMemo(() => {
    const now = new Date();
    const months = Array.from({ length: MONTHS_SHOWN }, (_, i) =>
      format(subMonths(now, MONTHS_SHOWN - 1 - i), 'yyyy-MM'),
    );
    const totals = new Map(months.map((m) => [m, 0]));
    for (const entry of entries) {
      const key = format(parseISO(entry.startedAt), 'yyyy-MM');
      if (totals.has(key)) {
        totals.set(key, (totals.get(key) ?? 0) + entry.minutes);
      }
    }
    return months.map((m) => ({ month: m, minutes: totals.get(m) ?? 0 }));
  }, [entries]);

  const maxMinutes = Math.max(...data.map((d) => d.minutes), 60);
  const chartHeight = 220;
  const barGap = 8;

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:p-6 dark:bg-slate-800 dark:ring-slate-700">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">月別作業時間</h2>
        <button
          onClick={() => setShowTable((v) => !v)}
          className="text-xs font-medium text-slate-400 hover:text-slate-600 underline underline-offset-2 dark:text-slate-500 dark:hover:text-slate-300"
        >
          {showTable ? 'グラフで表示' : '表で表示'}
        </button>
      </div>

      {showTable ? (
        <table className="mt-4 w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-slate-400 dark:border-slate-700 dark:text-slate-500">
              <th className="py-1 font-medium">月</th>
              <th className="py-1 font-medium">合計時間</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.month} className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-1.5 text-slate-700 dark:text-slate-300">
                  {format(parseISO(`${d.month}-01`), 'yyyy年M月', { locale: ja })}
                </td>
                <td className="py-1.5 tabular-nums text-slate-700 dark:text-slate-300">
                  {formatHoursDecimal(d.minutes)} 時間
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="mt-4">
          <div
            className="flex items-end gap-[8px]"
            style={{ height: chartHeight }}
            role="img"
            aria-label="月別合計作業時間の棒グラフ"
          >
            {data.map((d) => {
              const barHeight = Math.max(2, (d.minutes / maxMinutes) * (chartHeight - 24));
              const isHovered = hovered === d.month;
              return (
                <div
                  key={d.month}
                  className="relative flex flex-1 flex-col items-center justify-end"
                  style={{ gap: barGap }}
                  onMouseEnter={() => setHovered(d.month)}
                  onMouseLeave={() => setHovered((h) => (h === d.month ? null : h))}
                >
                  {isHovered && (
                    <div className="absolute -top-8 z-10 whitespace-nowrap rounded-md bg-slate-800 px-2 py-1 text-[11px] font-medium text-white shadow dark:bg-slate-950">
                      {formatHoursDecimal(d.minutes)} 時間
                    </div>
                  )}
                  <div
                    className="w-full rounded-t-[4px] bg-emerald-600 transition-opacity dark:bg-emerald-500"
                    style={{
                      height: barHeight,
                      opacity: isHovered ? 1 : 0.85,
                    }}
                  />
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">
                    {format(parseISO(`${d.month}-01`), 'M月')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
