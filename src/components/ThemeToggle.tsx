import type { ThemeMode } from '../hooks/useTheme';

interface ThemeToggleProps {
  mode: ThemeMode;
  onChange: (mode: ThemeMode) => void;
}

const OPTIONS: { id: ThemeMode; label: string; icon: string }[] = [
  { id: 'light', label: 'ライト', icon: '☀️' },
  { id: 'dark', label: 'ダーク', icon: '🌙' },
  { id: 'system', label: 'システム', icon: '💻' },
];

export default function ThemeToggle({ mode, onChange }: ThemeToggleProps) {
  return (
    <div className="inline-flex rounded-lg bg-slate-100 p-0.5 dark:bg-slate-800">
      {OPTIONS.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => onChange(opt.id)}
          title={opt.label}
          aria-label={opt.label}
          aria-pressed={mode === opt.id}
          className={`rounded-md px-2 py-1 text-xs transition ${
            mode === opt.id
              ? 'bg-white text-emerald-600 shadow dark:bg-slate-700 dark:text-emerald-400'
              : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300'
          }`}
        >
          {opt.icon}
        </button>
      ))}
    </div>
  );
}
