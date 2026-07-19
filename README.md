# 作業時間トラッカー

時給制のリモートワーク向けに、作業時間をストップウォッチ感覚で記録する Web アプリです。

- ワンタップで作業開始・終了を記録（終了時に作業内容を入力）
- カレンダー表示で日ごとの作業時間・複数件の作業を確認
- 月別の作業時間を棒グラフで表示
- Google Apps Script 経由で Google スプレッドシートへ自動反映（任意）
- メールアドレス・パスワードでのログイン機能。一人ひとりが自分のアカウントで、どの端末からでも自分の記録を確認できます（Firebase Authentication / Firestore を使用）

## 開発

```bash
npm install
cp .env.example .env.local  # Firebase の設定値を入力（下記参照）
npm run dev
```

`npm run build` で `dist/` に静的ファイルを出力します。

## ログイン機能のセットアップ（Firebase）

このアプリはログイン機能に [Firebase](https://firebase.google.com/) の Authentication（メール/パスワード認証）と Firestore（データベース）を使っています。GitHub Pages は静的ファイルしかホストできないため、サーバー機能は Firebase 側にお願いする構成です。

1. [Firebase コンソール](https://console.firebase.google.com/) で新しいプロジェクトを作成する。
2. 左メニュー「Authentication」→「Sign-in method」で **メール / パスワード** を有効化する。
3. 左メニュー「Firestore Database」で **データベースを作成**する（本番モードでOK。後述のセキュリティルールを設定するため）。
4. 「プロジェクトの設定」(⚙️アイコン) →「全般」→「マイアプリ」で **ウェブアプリを追加**し、表示される `firebaseConfig` の値(`apiKey` など)を控える。
5. Firestore の「ルール」タブを開き、このリポジトリの [`firestore.rules`](./firestore.rules) の内容に置き換えて公開する。これにより、ログインした本人以外は自分以外のデータを読み書きできなくなります。

### ローカル開発

`.env.example` を `.env.local` にコピーし、控えた `firebaseConfig` の値を貼り付けてください（`.env.local` は git 管理対象外です）。

### GitHub Pages への反映

ビルド時に環境変数として埋め込む必要があるため、リポジトリの Settings → Secrets and variables → Actions → **New repository secret** で、以下の6つを追加してください（値は Firebase の `firebaseConfig` と同じ）。

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

`.github/workflows/deploy.yml` が自動的にこれらを読み込んでビルドします。Firebase の `apiKey` はブラウザに公開される値なので機密情報ではありませんが、リポジトリを綺麗に保つため Secrets 経由にしています。実際のアクセス制御は Firestore のセキュリティルールが担っています。

設定が済むまでは、アプリを開くと「Firebase が設定されていません」という案内が表示されます。

### 使い方

- 初回は「新規登録」タブで氏名・メールアドレス・パスワードを入力してアカウントを作成します。
- 以降は「ログイン」タブでメールアドレスとパスワードを入力すればOKです。同じアカウントでログインすれば、どの端末からでも自分の記録・設定を確認できます。
- 他の人にも使ってもらう場合は、それぞれが自分のメールアドレスで新規登録してください。データはユーザーごとに分離され、他人の記録は見えません。

## GitHub Pages へのホスティング

`main` ブランチに push すると `.github/workflows/deploy.yml` が Vite でビルドし、GitHub Pages に自動デプロイします。

初回のみ、リポジトリの Settings → Pages で「Source: GitHub Actions」を選択してください。

公開 URL は `https://<GitHubユーザー名>.github.io/trswork/` になります（`vite.config.ts` の `base` を変更した場合は URL も変わります）。

## Google スプレッドシート連携（任意）

作業終了時に、記録した日付・作業内容・作業時間（分）を自動でスプレッドシートへ追記できます。連携先は Google Apps Script を使って構築します。

1. 連携したい Google スプレッドシートを開く。
2. メニューの「拡張機能」→「Apps Script」を開く。
3. デフォルトの `Code.gs` の中身を、このリポジトリの [`google-apps-script/Code.gs`](./google-apps-script/Code.gs) の内容で置き換える。
4. 必要に応じてスクリプト冒頭の設定を編集する。
   - `SHARED_SECRET`: 任意の文字列を設定すると、アプリ側の「共有シークレット」と一致しない書き込みリクエストを拒否できます（推奨）。
   - `DATE_COL` / `TITLE_COL` / `MINUTES_COL`: 日付・作業詳細・分を書き込む列。既定値はサンプルのシート構成（B列=日付、C列=作業詳細、D列=分）に合わせています。
   - `FIXED_SHEET_NAME`: 特定のシート（タブ）に固定したい場合に指定します。空欄のままだと、作業日の月に応じて `〇月` を含むタブ名を自動的に探し、見つからない場合はアクティブなシートに書き込みます。
5. 「デプロイ」→「新しいデプロイ」→種類は「ウェブアプリ」を選択。
   - 「次のユーザーとして実行」: 自分
   - 「アクセスできるユーザー」: 全員
6. デプロイ後に発行される URL（`https://script.google.com/macros/s/xxxx/exec`）をコピーする。
7. アプリの「設定」タブを開き、「Web アプリ URL」に貼り付ける。`SHARED_SECRET` を設定した場合は「共有シークレット」にも同じ値を入力する。
8. 「作業終了時に自動でスプレッドシートへ反映する」にチェックを入れると、作業終了のたびに自動で書き込まれます。チェックを入れない場合も、「設定」タブから未同期の記録を選んで手動で同期できます。

新しい行は、シート内の「合計」と書かれた行（既存のテンプレートにある集計行）のすぐ上に挿入されるため、既存の SUM 数式などはそのまま機能します。「合計」行が見つからない場合は、シートの最終行の下に追記されます。

### 注意事項

- Web アプリ URL を知っていれば誰でも書き込みリクエストを送れてしまうため、`SHARED_SECRET` の設定を推奨します。
- 記録データは Firestore に保存されるため、ブラウザのデータを消してもログインし直せば復元されます。

## 今後について

まずは Web アプリとして動作確認したのち、将来的には社内限定配布の iOS / Android アプリ化（例: Capacitor などでこの Web アプリをラップする、またはネイティブで作り直す）を想定しています。
