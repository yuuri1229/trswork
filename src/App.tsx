import { useState } from 'react';
import type { User } from 'firebase/auth';
import Timer from './components/Timer';
import CalendarView from './components/CalendarView';
import MonthlyBarChart from './components/MonthlyBarChart';
import BottomNav, { type Tab } from './components/BottomNav';
import ExpensesView from './components/ExpensesView';
import SettingsPanel from './components/SettingsPanel';
import LoginScreen from './components/LoginScreen';
import FirebaseSetupNotice from './components/FirebaseSetupNotice';
import { useAuth } from './hooks/useAuth';
import { useSettings } from './hooks/useSettings';
import { useTimeEntries } from './hooks/useTimeEntries';
import { useExpenseEntries } from './hooks/useExpenseEntries';
import { useRaceWorkEntries } from './hooks/useRaceWorkEntries';

interface AuthedAppProps {
  user: User;
  onSignOut: () => void;
}

function AuthedApp({ user, onSignOut }: AuthedAppProps) {
  const [tab, setTab] = useState<Tab>('timer');
  const { settings, setSettings } = useSettings(user.uid);
  const {
    entries,
    entriesByDate,
    isRunning,
    isPaused,
    runningTimer,
    start,
    pause,
    resume,
    cancel,
    finish,
    deleteEntry,
    updateEntry,
  } = useTimeEntries(user);
  const {
    entriesByMonth: expensesByMonth,
    addExpense,
    updateExpense,
    deleteExpense,
  } = useExpenseEntries(user);
  const {
    entriesByMonth: raceWorkByMonth,
    addRaceWork,
    updateRaceWork,
    deleteRaceWork,
  } = useRaceWorkEntries(user);

  return (
    <div className="mx-auto flex min-h-svh max-w-2xl flex-col bg-slate-50 dark:bg-black">
      <header className="flex items-start justify-between px-4 pt-6 pb-2 sm:pt-10">
        <div className="w-20" />
        <div className="text-center">
          <h1 className="text-xl font-bold text-slate-800 sm:text-2xl dark:text-neutral-100">作業時間トラッカー</h1>
          {isRunning &&
            (isPaused ? (
              <p className="mt-1 text-xs font-medium text-amber-600 dark:text-amber-400">❚❚ 一時停止中です</p>
            ) : (
              <p className="mt-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">● 作業を記録中です</p>
            ))}
        </div>
        <div className="flex w-20 justify-end">
          <button
            onClick={onSignOut}
            className="-mr-1 px-1 py-2 text-xs font-medium text-slate-400 hover:text-slate-600 dark:text-neutral-500 dark:hover:text-neutral-300"
            title={user.email ?? ''}
          >
            ログアウト
          </button>
        </div>
      </header>
      <p className="-mt-1 text-center text-xs text-slate-400 dark:text-neutral-500">{user.displayName ?? user.email}</p>

      <main className="flex-1 px-4 pb-24">
        <div className="mx-auto mt-4 flex max-w-md flex-col gap-4">
          {tab === 'timer' && (
            <Timer
              runningTimer={runningTimer}
              onStart={start}
              onPause={pause}
              onResume={resume}
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
            <SettingsPanel settings={settings} onChange={setSettings} />
          )}
        </div>
      </main>

      <BottomNav tab={tab} onChange={setTab} />
    </div>
  );
}

function App() {
  const { user, loading, signIn, signOut, firebaseConfigured, translateAuthError } = useAuth();

  if (!firebaseConfigured) return <FirebaseSetupNotice />;
  if (loading) return null;
  if (!user) return <LoginScreen onSignIn={signIn} translateAuthError={translateAuthError} />;

  return <AuthedApp user={user} onSignOut={signOut} />;
}

export default App;
