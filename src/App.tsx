import { useState } from 'react';
import type { User } from 'firebase/auth';
import Timer from './components/Timer';
import CalendarView from './components/CalendarView';
import MonthlyBarChart from './components/MonthlyBarChart';
import ExpensesView from './components/ExpensesView';
import SettingsPanel from './components/SettingsPanel';
import LoginScreen from './components/LoginScreen';
import FirebaseSetupNotice from './components/FirebaseSetupNotice';
import ThemeToggle from './components/ThemeToggle';
import { useAuth } from './hooks/useAuth';
import { useSettings } from './hooks/useSettings';
import { useTimeEntries } from './hooks/useTimeEntries';
import { useExpenseEntries } from './hooks/useExpenseEntries';
import { useRaceWorkEntries } from './hooks/useRaceWorkEntries';
import { useTheme, type ThemeMode } from './hooks/useTheme';

type Tab = 'timer' | 'calendar' | 'chart' | 'expenses' | 'settings';

const TABS: { id: Tab; label: string }[] = [
  { id: 'timer', label: 'タイマー' },
  { id: 'calendar', label: 'カレンダー' },
  { id: 'chart', label: 'グラフ' },
  { id: 'expenses', label: '経費' },
  { id: 'settings', label: '設定' },
];

interface AuthedAppProps {
  user: User;
  onSignOut: () => void;
  themeMode: ThemeMode;
  onThemeChange: (mode: ThemeMode) => void;
}

function AuthedApp({ user, onSignOut, themeMode, onThemeChange }: AuthedAppProps) {
  const [tab, setTab] = useState<Tab>('timer');
  const { settings, setSettings } = useSettings(user.uid);
  const {
    entries,
    entriesByDate,
    isRunning,
    runningStartedAt,
    start,
    cancel,
    finish,
    deleteEntry,
    updateEntry,
    retrySync,
    syncStatus,
  } = useTimeEntries(user, settings);
  const {
    entriesByMonth: expensesByMonth,
    addExpense,
    updateExpense,
    deleteExpense,
  } = useExpenseEntries(user, settings);
  const {
    entriesByMonth: raceWorkByMonth,
    addRaceWork,
    updateRaceWork,
    deleteRaceWork,
  } = useRaceWorkEntries(user, settings);

  const unsyncedEntries = entries.filter((e) => !e.synced);

  return (
    <div className="mx-auto flex min-h-svh max-w-2xl flex-col bg-slate-50 dark:bg-slate-900">
      <header className="flex items-start justify-between px-4 pt-6 pb-2 sm:pt-10">
        <div className="flex w-20 justify-start">
          <ThemeToggle mode={themeMode} onChange={onThemeChange} />
        </div>
        <div className="text-center">
          <h1 className="text-xl font-bold text-slate-800 sm:text-2xl dark:text-slate-100">作業時間トラッカー</h1>
          {isRunning && (
            <p className="mt-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">● 作業を記録中です</p>
          )}
        </div>
        <div className="flex w-20 justify-end">
          <button
            onClick={onSignOut}
            className="text-xs font-medium text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
            title={user.email ?? ''}
          >
            ログアウト
          </button>
        </div>
      </header>
      <p className="-mt-1 text-center text-xs text-slate-400 dark:text-slate-500">{user.displayName ?? user.email}</p>

      <main className="flex-1 px-4 pb-24">
        <div className="mx-auto mt-4 flex max-w-md flex-col gap-4">
          {tab === 'timer' && (
            <Timer
              isRunning={isRunning}
              runningStartedAt={runningStartedAt}
              onStart={start}
              onFinish={finish}
              onCancel={cancel}
            />
          )}
          {tab === 'calendar' && (
            <CalendarView
              entriesByDate={entriesByDate}
              onDeleteEntry={deleteEntry}
              onUpdateEntry={updateEntry}
            />
          )}
          {tab === 'chart' && <MonthlyBarChart entries={entries} />}
          {tab === 'expenses' && (
            <ExpensesView
              expensesByMonth={expensesByMonth}
              onAddExpense={addExpense}
              onUpdateExpense={updateExpense}
              onDeleteExpense={deleteExpense}
              raceWorkByMonth={raceWorkByMonth}
              onAddRaceWork={addRaceWork}
              onUpdateRaceWork={updateRaceWork}
              onDeleteRaceWork={deleteRaceWork}
            />
          )}
          {tab === 'settings' && (
            <SettingsPanel
              settings={settings}
              onChange={setSettings}
              unsyncedEntries={unsyncedEntries}
              syncStatus={syncStatus}
              onRetrySync={retrySync}
            />
          )}
        </div>
      </main>

      <nav className="sticky bottom-0 border-t border-slate-200 bg-white/95 backdrop-blur dark:border-slate-700 dark:bg-slate-900/95">
        <div className="mx-auto flex max-w-md">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 py-3 text-sm font-medium transition ${
                tab === t.id
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

function App() {
  const { user, loading, signIn, signUp, signOut, firebaseConfigured, translateAuthError } = useAuth();
  const { mode, setMode } = useTheme();

  if (!firebaseConfigured) return <FirebaseSetupNotice themeMode={mode} onThemeChange={setMode} />;
  if (loading) return null;
  if (!user) {
    return (
      <LoginScreen
        onSignIn={signIn}
        onSignUp={signUp}
        translateAuthError={translateAuthError}
        themeMode={mode}
        onThemeChange={setMode}
      />
    );
  }

  return <AuthedApp user={user} onSignOut={signOut} themeMode={mode} onThemeChange={setMode} />;
}

export default App;
