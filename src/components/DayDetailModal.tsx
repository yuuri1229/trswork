import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';
import type { TimeEntry } from '../types/entry';
import { formatMinutes } from '../lib/dateUtils';

interface DayDetailModalProps {
  dateKey: string;
  entries: TimeEntry[];
  onClose: () => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, patch: Partial<Pick<TimeEntry, 'title' | 'minutes'>>) => void;
}

export default function DayDetailModal({ dateKey, entries, onClose, onDelete, onUpdate }: DayDetailModalProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState('');
  const [draftMinutes, setDraftMinutes] = useState(0);

  const total = entries.reduce((sum, e) => sum + e.minutes, 0);

  const startEdit = (entry: TimeEntry) => {
    setEditingId(entry.id);
    setDraftTitle(entry.title);
    setDraftMinutes(entry.minutes);
  };

  const saveEdit = () => {
    if (!editingId) return;
    onUpdate(editingId, { title: draftTitle.trim() || '(無題)', minutes: Math.max(1, draftMinutes) });
    setEditingId(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 dark:bg-black/60"
      onClick={onClose}
    >
      <div
        className="max-h-[80vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
              {format(parseISO(dateKey), 'yyyy年M月d日 (E)', { locale: ja })}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">合計 {formatMinutes(total)}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300">
            ✕
          </button>
        </div>

        <ul className="mt-4 flex flex-col gap-2">
          {entries.map((entry) => (
            <li key={entry.id} className="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
              {editingId === entry.id ? (
                <div className="flex flex-col gap-2">
                  <input
                    value={draftTitle}
                    onChange={(e) => setDraftTitle(e.target.value)}
                    className="rounded border border-slate-300 px-2 py-1 text-sm dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      value={draftMinutes}
                      onChange={(e) => setDraftMinutes(Number(e.target.value))}
                      className="w-20 rounded border border-slate-300 px-2 py-1 text-sm dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                    />
                    <span className="text-xs text-slate-500 dark:text-slate-400">分</span>
                    <div className="ml-auto flex gap-2">
                      <button onClick={() => setEditingId(null)} className="text-xs text-slate-400 dark:text-slate-500">
                        キャンセル
                      </button>
                      <button onClick={saveEdit} className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        保存
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{entry.title}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {format(parseISO(entry.startedAt), 'HH:mm')}〜{format(parseISO(entry.endedAt), 'HH:mm')} ・{' '}
                      {formatMinutes(entry.minutes)}
                      {entry.synced && <span className="ml-1 text-emerald-500 dark:text-emerald-400">・同期済</span>}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2 text-xs">
                    <button onClick={() => startEdit(entry)} className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300">
                      編集
                    </button>
                    <button onClick={() => onDelete(entry.id)} className="text-rose-400 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300">
                      削除
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
