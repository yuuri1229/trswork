import { useEffect, useState } from 'react';
import type { Settings } from '../types/entry';
import type { TimeEntry } from '../types/entry';

interface SettingsPanelProps {
  settings: Settings;
  onChange: (settings: Settings) => Promise<void>;
  unsyncedEntries: TimeEntry[];
  syncStatus: Record<string, 'pending' | 'ok' | 'error'>;
  onRetrySync: (id: string) => void;
}

export default function SettingsPanel({
  settings,
  onChange,
  unsyncedEntries,
  syncStatus,
  onRetrySync,
}: SettingsPanelProps) {
  const [draft, setDraft] = useState(settings);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => setDraft(settings), [settings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await onChange(draft);
    setSaving(false);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:p-6 dark:bg-slate-800 dark:ring-slate-700">
      <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">設定</h2>
      <form onSubmit={handleSave} className="mt-4 flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-slate-600 dark:text-slate-300">氏名</span>
          <input
            value={draft.workerName}
            onChange={(e) => setDraft({ ...draft, workerName: e.target.value })}
            placeholder="山田 太郎"
            className="rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:ring-emerald-900"
          />
        </label>

        <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-900">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Google スプレッドシート連携</p>
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
            Google Apps Script（google-apps-script/Code.gs）をウェブアプリとしてデプロイし、発行された URL を貼り付けてください。詳しくは README を参照してください。
          </p>

          <label className="mt-3 flex flex-col gap-1 text-sm">
            <span className="font-medium text-slate-600 dark:text-slate-300">Web アプリ URL</span>
            <input
              value={draft.sheetsWebAppUrl}
              onChange={(e) => setDraft({ ...draft, sheetsWebAppUrl: e.target.value })}
              placeholder="https://script.google.com/macros/s/xxxx/exec"
              className="rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:ring-emerald-900"
            />
          </label>

          <label className="mt-3 flex flex-col gap-1 text-sm">
            <span className="font-medium text-slate-600 dark:text-slate-300">共有シークレット（任意）</span>
            <input
              value={draft.sheetsSharedSecret}
              onChange={(e) => setDraft({ ...draft, sheetsSharedSecret: e.target.value })}
              placeholder="Code.gs の SHARED_SECRET と同じ値"
              className="rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:ring-emerald-900"
            />
          </label>

          <label className="mt-3 flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={draft.autoSync}
              onChange={(e) => setDraft({ ...draft, autoSync: e.target.checked })}
              className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-400 dark:border-slate-600 dark:bg-slate-800"
            />
            <span className="text-slate-600 dark:text-slate-300">作業終了時に自動でスプレッドシートへ反映する</span>
          </label>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60 dark:bg-emerald-600 dark:hover:bg-emerald-500"
          >
            {saving ? '保存中…' : '保存'}
          </button>
          {saved && <span className="text-xs text-emerald-600 dark:text-emerald-400">保存しました</span>}
        </div>
      </form>

      {unsyncedEntries.length > 0 && (
        <div className="mt-6 border-t border-slate-100 pt-4 dark:border-slate-700">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
            未同期の記録 ({unsyncedEntries.length}件)
          </p>
          <ul className="mt-2 flex flex-col gap-1.5">
            {unsyncedEntries.map((entry) => (
              <li key={entry.id} className="flex items-center justify-between gap-2 text-xs">
                <span className="truncate text-slate-500 dark:text-slate-400">
                  {entry.date} ・ {entry.title}
                </span>
                <button
                  onClick={() => onRetrySync(entry.id)}
                  disabled={syncStatus[entry.id] === 'pending'}
                  className="shrink-0 rounded-md bg-slate-100 px-2 py-1 font-medium text-slate-600 hover:bg-slate-200 disabled:opacity-50 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                >
                  {syncStatus[entry.id] === 'pending'
                    ? '同期中…'
                    : syncStatus[entry.id] === 'error'
                      ? '再試行'
                      : '同期する'}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
