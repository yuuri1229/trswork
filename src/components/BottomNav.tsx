import type { IconType } from 'react-icons';
import { MdBarChart, MdCalendarMonth, MdReceiptLong, MdSettings, MdTimer } from 'react-icons/md';

export type Tab = 'timer' | 'calendar' | 'chart' | 'expenses' | 'settings';

const TABS: { id: Tab; label: string; Icon: IconType }[] = [
  { id: 'timer', label: 'タイマー', Icon: MdTimer },
  { id: 'calendar', label: 'カレンダー', Icon: MdCalendarMonth },
  { id: 'chart', label: 'グラフ', Icon: MdBarChart },
  { id: 'expenses', label: '経費', Icon: MdReceiptLong },
  { id: 'settings', label: '設定', Icon: MdSettings },
];

interface BottomNavProps {
  tab: Tab;
  onChange: (tab: Tab) => void;
}

export default function BottomNav({ tab, onChange }: BottomNavProps) {
  return (
    // The bottom padding keeps the buttons clear of the iPhone home indicator when the
    // app is added to the home screen (needs viewport-fit=cover in index.html); the
    // 0.5rem floor leaves some breathing room on devices without one.
    <nav
      aria-label="メインメニュー"
      className="sticky bottom-0 select-none border-t border-slate-200 bg-white/95 pb-[max(env(safe-area-inset-bottom),0.5rem)] backdrop-blur dark:border-slate-700 dark:bg-slate-900/95"
    >
      <div className="mx-auto flex max-w-md">
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            aria-current={tab === id ? 'page' : undefined}
            className={`flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 px-1 pt-1 transition active:bg-slate-100 dark:active:bg-slate-800 ${
              tab === id
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300'
            }`}
          >
            <Icon size={24} aria-hidden />
            <span className="text-[11px] font-medium leading-tight">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
