import { useState } from 'react';
import type { User } from 'firebase/auth';
import Timer from './components/Timer';
import CalendarView from './components/CalendarView';
import MonthlyBarChart from './components/MonthlyBarChart';
import SettingsPanel from './components/SettingsPanel';
import LoginScreen from './components/LoginScreen';
import FirebaseSetupNotice from './components/FirebaseSetupNotice';
import { useAuth } from './hooks/useAuth';
import { useTimeEntries } from './hooks/useTimeEntries';

type Tab = 'timer' | 'calendar' | 'chart' | 'settings';

const TABS: { id: Tab; label: string }[] = [
  { id: 'timer', label: 'タイマー' },
  { id: 'calendar', label: 'カレンダー' },
  { id: 'chart', label: 'グラフ' },
  { id: 'settings', label: '設定' },
];

function AuthedApp({ user, onSignOut }: { user: User; onSignOut: () => void }) {
  const [tab, setTab] = useState<Tab>('timer');
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
    settings,
    setSettings,
  } = useTimeEntries(user);

  const unsyncedEntries = entries.filter((e) => !e.synced);

  return (
    <div className="mx-auto flex min-h-svh max-w-2xl flex-col">
      <header className="flex items-start justify-between px-4 pt-6 pb-2 sm:pt-10">
        <div className="w-16" />
        <div className="text-center">
          <h1 className="text-xl font-bold text-slate-800 sm:text-2xl">作業時間トラッカー</h1>
          {isRunning && <p className="mt-1 text-xs font-medium text-emerald-600">● 作業を記録中です</p>}
        </div>
        <div className="flex w-16 justify-end">
          <button
            onClick={onSignOut}
            className="text-xs font-medium text-slate-400 hover:text-slate-600"
            title={user.email ?? ''}
          >
            ログアウト
          </button>
        </div>
      </header>
      <p className="-mt-1 text-center text-xs text-slate-400">{user.displayName ?? user.email}</p>

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

      <nav className="sticky bottom-0 border-t border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-md">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 py-3 text-sm font-medium transition ${
                tab === t.id ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'
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

  if (!firebaseConfigured) return <FirebaseSetupNotice />;
  if (loading) return null;
  if (!user) return <LoginScreen onSignIn={signIn} onSignUp={signUp} translateAuthError={translateAuthError} />;

  return <AuthedApp user={user} onSignOut={signOut} />;
}

export default App;
