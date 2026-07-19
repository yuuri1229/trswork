import ThemeToggle from './ThemeToggle';
import type { ThemeMode } from '../hooks/useTheme';

interface FirebaseSetupNoticeProps {
  themeMode: ThemeMode;
  onThemeChange: (mode: ThemeMode) => void;
}

export default function FirebaseSetupNotice({ themeMode, onThemeChange }: FirebaseSetupNoticeProps) {
  return (
    <div className="mx-auto flex min-h-svh max-w-md flex-col justify-center bg-slate-50 px-4 py-10 text-center dark:bg-slate-900">
      <div className="mb-4 flex justify-center">
        <ThemeToggle mode={themeMode} onChange={onThemeChange} />
      </div>
      <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">作業時間トラッカー</h1>
      <div className="mt-6 rounded-2xl bg-white p-6 text-sm text-slate-600 shadow-sm ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700">
        <p className="font-semibold text-rose-600 dark:text-rose-400">Firebase が設定されていません</p>
        <p className="mt-2">
          ログイン機能を使うには Firebase プロジェクトを作成し、環境変数(<code>VITE_FIREBASE_*</code>)を設定する必要があります。README の「ログイン機能のセットアップ(Firebase)」を参照してください。
        </p>
      </div>
    </div>
  );
}
