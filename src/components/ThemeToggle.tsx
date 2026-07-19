import type { IconType } from 'react-icons';
import { MdLightMode, MdDarkMode, MdSettingsBrightness } from 'react-icons/md';
import type { ThemeMode } from '../hooks/useTheme';

interface ThemeToggleProps {
  mode: ThemeMode;
  onChange: (mode: ThemeMode) => void;
}

const OPTIONS: { id: ThemeMode; label: string; Icon: IconType }[] = [
  { id: 'light', label: 'ライト', Icon: MdLightMode },
  { id: 'dark', label: 'ダーク', Icon: MdDarkMode },
  { id: 'system', label: 'システム', Icon: MdSettingsBrightness },
];

export default function ThemeToggle({ mode, onChange }: ThemeToggleProps) {
  return (
    <div className="inline-flex rounded-lg bg-slate-100 p-0.5 dark:bg-slate-800">
      {OPTIONS.map(({ id, label, Icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          title={label}
          aria-label={label}
          aria-pressed={mode === id}
          className={`rounded-md p-1.5 transition ${
            mode === id
              ? 'bg-white text-emerald-600 shadow dark:bg-slate-700 dark:text-emerald-400'
              : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300'
          }`}
        >
          <Icon size={16} />
        </button>
      ))}
    </div>
  );
}
