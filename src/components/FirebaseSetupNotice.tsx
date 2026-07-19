export default function FirebaseSetupNotice() {
  return (
    <div className="mx-auto flex min-h-svh max-w-md flex-col justify-center px-4 py-10 text-center">
      <h1 className="text-xl font-bold text-slate-800">作業時間トラッカー</h1>
      <div className="mt-6 rounded-2xl bg-white p-6 text-sm text-slate-600 shadow-sm ring-1 ring-slate-200">
        <p className="font-semibold text-rose-600">Firebase が設定されていません</p>
        <p className="mt-2">
          ログイン機能を使うには Firebase プロジェクトを作成し、環境変数(<code>VITE_FIREBASE_*</code>)を設定する必要があります。README の「ログイン機能のセットアップ(Firebase)」を参照してください。
        </p>
      </div>
    </div>
  );
}
