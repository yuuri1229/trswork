import { useEffect, useState } from 'react';
import type { Settings } from '../types/entry';

interface SettingsPanelProps {
  settings: Settings;
  onChange: (settings: Settings) => Promise<void>;
}

export default function SettingsPanel({ settings, onChange }: SettingsPanelProps) {
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
    </div>
  );
}
