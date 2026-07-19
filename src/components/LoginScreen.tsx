import { useState } from 'react';
import { FirebaseError } from 'firebase/app';

interface LoginScreenProps {
  onSignIn: (email: string, password: string) => Promise<void>;
  onSignUp: (name: string, email: string, password: string) => Promise<void>;
  translateAuthError: (code: string) => string;
}

export default function LoginScreen({ onSignIn, onSignUp, translateAuthError }: LoginScreenProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (mode === 'signup') {
        await onSignUp(name.trim(), email.trim(), password);
      } else {
        await onSignIn(email.trim(), password);
      }
    } catch (err) {
      const code = err instanceof FirebaseError ? err.code : 'unknown';
      setError(translateAuthError(code));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-svh max-w-md flex-col justify-center px-4 py-10">
      <h1 className="text-center text-xl font-bold text-slate-800">作業時間トラッカー</h1>

      <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="flex rounded-lg bg-slate-100 p-1 text-sm font-medium">
          <button
            type="button"
            onClick={() => setMode('signin')}
            className={`flex-1 rounded-md py-1.5 transition ${
              mode === 'signin' ? 'bg-white text-emerald-600 shadow' : 'text-slate-500'
            }`}
          >
            ログイン
          </button>
          <button
            type="button"
            onClick={() => setMode('signup')}
            className={`flex-1 rounded-md py-1.5 transition ${
              mode === 'signup' ? 'bg-white text-emerald-600 shadow' : 'text-slate-500'
            }`}
          >
            新規登録
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-3">
          {mode === 'signup' && (
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-slate-600">氏名</span>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="山田 太郎"
                className="rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              />
            </label>
          )}
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-slate-600">メールアドレス</span>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-slate-600">パスワード</span>
            <input
              required
              type="password"
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="6文字以上"
              className="rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            />
          </label>

          {error && <p className="text-xs text-rose-600">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {submitting ? '処理中…' : mode === 'signup' ? '登録する' : 'ログイン'}
          </button>
        </form>
      </div>
    </div>
  );
}
