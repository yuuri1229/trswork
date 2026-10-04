import { useState } from 'react';
import { FirebaseError } from 'firebase/app';

interface LoginScreenProps {
  onSignIn: (email: string, password: string) => Promise<void>;
  translateAuthError: (code: string) => string;
}

export default function LoginScreen({ onSignIn, translateAuthError }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await onSignIn(email.trim(), password);
    } catch (err) {
      const code = err instanceof FirebaseError ? err.code : 'unknown';
      setError(translateAuthError(code));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-svh max-w-md flex-col justify-center bg-slate-50 px-4 py-10 dark:bg-black">
      <h1 className="text-center text-xl font-bold text-slate-800 dark:text-neutral-100">作業時間トラッカー</h1>

      <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 dark:bg-neutral-900 dark:ring-neutral-800">
        <h2 className="text-center text-base font-semibold text-slate-700 dark:text-neutral-200">ログイン</h2>

        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-slate-600 dark:text-neutral-300">メールアドレス</span>
            <input
              required
              type="email"
              autoComplete="username"
              autoCapitalize="none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100 dark:border-neutral-700 dark:bg-black dark:text-neutral-100 dark:placeholder-neutral-500 dark:focus:ring-emerald-900"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-slate-600 dark:text-neutral-300">パスワード</span>
            <input
              required
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100 dark:border-neutral-700 dark:bg-black dark:text-neutral-100 dark:placeholder-neutral-500 dark:focus:ring-emerald-900"
            />
          </label>

          {error && <p className="text-xs text-rose-600 dark:text-rose-400">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60 dark:bg-emerald-600 dark:hover:bg-emerald-500"
          >
            {submitting ? '処理中…' : 'ログイン'}
          </button>
        </form>
      </div>
    </div>
  );
}
