# 📘 Tech+ Quiz

Tech+の問題を学習できるクイズアプリです。
章ごと・全問題・ランダム出題に対応し、解説付きで効率よく学習できます。

## デプロイメント

👉 [https://techquiz-kappa.vercel.app/](https://techquiz-kappa.vercel.app/)

## ✨ 主な機能

### 出題

- 📚 章ごとの出題と「すべての問題」
- 🔢 順番に出題 / 🔀 ランダムに出題（偏りのない Fisher–Yates シャッフル）
- ✅ 択一問題：選択肢を選んだ瞬間に採点
- ☑️ 複数選択問題：選んでから「回答する」で採点（順不同で判定）
- 🎯 正解・不正解の色分けと、正解・解説の表示
- ⏸️ クイズの途中で「中断して章選択に戻る」

### 結果と復習

- 📊 正解数・正答率・不正解数
- 📝 間違えた問題の一覧（章・番号、問題文の冒頭、正解）
- 🔁 間違えた問題だけを復習
- 🔄 同じ条件でもう一度 / 章選択に戻る

### 使いやすさ

- 🔗 画面ごとの URL（ブラウザの戻る・進むで移動できる）
- 💾 リロードしてもクイズの続きから再開（結果画面も残る）
- 📝 Markdown 対応（問題文・選択肢・解説）
  - コードブロック・表・改行
  - 長いコードや表は、スマホでは横スクロールで表示
- ⌨️ キーボード操作（Tab で選択肢に移動し、Space / Enter で選択）
- 🔊 正解・不正解をスクリーンリーダーで読み上げ
- 🌙 ダークモード（OS / ブラウザの設定に合わせて切り替え）
- 📱 スマホ表示に対応

## 🖥️ 画面構成

| URL                                          | 画面                 |
| -------------------------------------------- | -------------------- |
| `/`                                          | 章選択               |
| `/chapter/[id]`                              | モード選択           |
| `/chapter/[id]/quiz?mode=sequential\|random` | クイズ画面・結果画面 |

- `[id]` は章名の先頭の「第N章」の番号です（例: `第3章 …` → `/chapter/3`）。すべての問題は `/chapter/all` です
  - 「第N章」で始まらない章や、番号が重複する章は章の一覧に出さず、サーバーログに警告を出します（その章の問題も「すべての問題」には含まれます）
  - 存在しない章は 404 です。`mode` の指定がない・不正なときは、その章のモード選択に移ります
- クイズの進み具合（出題順・何問目か・回答・正解数・間違えた問題）はブラウザの sessionStorage に保存します。リロードしても続きから再開し、結果画面もそのまま残ります
  - モード選択から始めたとき・中断したとき・結果画面で「章選択に戻る」を押したときは、保存した進み具合を消します
  - 結果画面の「同じ条件でもう一度」は、同じ章・同じモードの全問題で 1 問目から始め直します（復習の後でも全問題。ランダムなら並び順も新しくなります）
  - タブを閉じると消えます

## 🛠️ 使用技術

- Next.js 16 (App Router)
- React 19
- TypeScript
- CSS Modules（配色は `app/globals.css` の CSS 変数で管理）
- microCMS（問題データの管理）
- Vercel

### Markdown関連

- react-markdown
- remark-gfm
- remark-breaks

## 📁 ディレクトリ構成

```
techquiz/
├── .github/workflows/
│   └── ci.yml          # PR ごとに lint・型チェック・テスト・ビルドを実行
├── app/
│   ├── page.tsx                    # 章選択（/）
│   ├── chapter/[id]/page.tsx       # モード選択（/chapter/[id]）
│   ├── chapter/[id]/quiz/page.tsx  # クイズ・結果（/chapter/[id]/quiz?mode=…）
│   ├── layout.tsx                  # 全ページ共通のレイアウト（タイトル・lang="ja"）
│   ├── globals.css                 # 配色の CSS 変数（ライト / ダーク）
│   └── error.tsx                   # microCMS に接続できないときのエラー画面
├── components/
│   ├── ChapterSelect.tsx      # 章選択
│   ├── ModeSelect.tsx         # モード選択
│   ├── QuizSessionLoader.tsx  # QuizSession をブラウザでだけ読み込む
│   ├── QuizSession.tsx        # 出題 → 結果 → 復習の進行と保存
│   ├── QuizScreen.tsx         # 問題・選択肢・正解と解説
│   ├── ResultScreen.tsx       # 結果・間違えた問題の一覧
│   ├── Markdown.tsx           # 問題文・選択肢・解説の Markdown 描画
│   └── Quiz.module.css
├── lib/
│   ├── microcms.ts     # microCMS から全問題を取得（サーバー専用）
│   ├── cmsQuestion.ts  # microCMS の問題 → QuizItem の変換と並べ替え
│   ├── quizScope.ts    # 出題範囲（章 / すべての問題）と URL の章 ID
│   ├── quizSession.ts  # クイズの進み具合を sessionStorage に保存・復元
│   ├── grading.ts      # 正解判定・正解の本文
│   ├── excerpt.ts      # Markdown から一覧用の短い文章を作る
│   └── shuffle.ts      # Fisher–Yates シャッフル
├── types/
│   └── quiz.ts         # 問題（QuizItem）・出題モード（QuizMode）の型
├── scripts/
│   └── json_to_microcms_csv.py  # JSON → microCMS CSV インポート用ファイル
├── IMPROVEMENTS.md     # 改善点のチェックリスト
└── README.md
```

## 📄 クイズデータ形式

JSON で問題を書くときは次の形式を使います（`scripts/json_to_microcms_csv.py` の入力形式）。`answer` には正解の選択肢の本文を書きます。

````JSON
{
  "chapter": "第1章",
  "questionNumber": "1",
  "question": "次のコードの出力は？\n\n```javascript\nconsole.log(1 + 2);\n```",
  "choices": ["1", "2", "3", "4"],
  "answer": ["3"],
  "explanation": "```javascript\nconsole.log(1 + 2); // 3\n```"
}
````

画面側（`types/quiz.ts` の `QuizItem`）では、問題を microCMS のコンテンツ ID で、選択肢と正解を選択肢 ID（microCMS の `selectId`）で扱います。本文が同じ選択肢があっても正しく判定するためです。変換は `lib/microcms.ts` で行います。

```JSON
{
  "id": "<microCMS のコンテンツ ID>",
  "choices": [{ "id": "a", "text": "1" }, { "id": "b", "text": "2" }, { "id": "c", "text": "3" }, { "id": "d", "text": "4" }],
  "answer": ["c"]
}
```

次のような入力ミスがある問題は出題から除外し、サーバーログに `[microCMS] 問題 <コンテンツID> ...` の警告を出します（Vercel では Logs で確認できます）。

- 選択肢がない、`selectId` が空、または重複している
- 正解（`answerId`）が登録されていない、または選択肢にない ID を指している

## ▶️ 開発環境のセットアップ

```bash
git clone https://github.com/KimiyukiYamauchi/techquiz.git
cd techquiz
npm install
npm run dev
```

起動前に、プロジェクト直下に `.env.local` を作成してください。

```bash
MICROCMS_SERVICE_DOMAIN=xxxxxxxx           # https://xxxxxxxx.microcms.io の xxxxxxxx
MICROCMS_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxx  # GET 権限のある API キー
# MICROCMS_ENDPOINT=techquiz-questions     # 省略時は techquiz-questions
```

- API キーは、問題を読み取る GET 権限だけで十分です。POST・PUT・DELETE などの書き込み権限は付けないでください
- `.env.local` は `.gitignore` 済みです。API キーをコミットしないでください
- Vercel では Project Settings → Environment Variables に同じ値を登録します。未設定だとビルドが失敗します（`npm run build` でも同じです）

#### 👉 [http://localhost:3000](http://localhost:3000)

### 開発コマンド

| コマンド             | 内容                                                        |
| -------------------- | ----------------------------------------------------------- |
| `npm run dev`        | 開発サーバーを起動（http://localhost:3000）                 |
| `npm run build`      | 本番用にビルド（microCMS から問題を取得して各ページを生成） |
| `npm run start`      | ビルドしたアプリを起動                                      |
| `npm run lint`       | ESLint でコードをチェック                                   |
| `npx tsc --noEmit`   | TypeScript の型チェック                                     |
| `npm test`           | 単体テストを実行（Vitest）                                  |
| `npm run test:watch` | ファイルの変更を監視して単体テストを実行し直す              |

単体テストは `lib/*.test.ts` にあります（microCMS の変換・並べ替え、採点）。microCMS や `.env.local` が無くても実行できます。

`npm run dev` を起動したまま、同じフォルダで `npm run build` を実行しないでください。どちらも `.next/` を使うため、開発サーバーが変更を反映しなくなることがあります。そうなったら開発サーバーを再起動してください。

### CI（GitHub Actions）

PR を作ったとき・更新したときと、`main` に push したときに、`.github/workflows/ci.yml` が次の 2 つのジョブを実行します。

| ジョブ                     | 内容                                                              |
| -------------------------- | ----------------------------------------------------------------- |
| lint / 型チェック / テスト | `npm run lint`・`npx tsc --noEmit`・`npm test`                    |
| build                      | `npm run build`（microCMS から問題を取得するため API キーが必要） |

build ジョブを動かすには、GitHub の Settings → Secrets and variables → Actions → Secrets に、次の 2 つを登録してください（値は `.env.local` と同じです）。

- `MICROCMS_SERVICE_DOMAIN`
- `MICROCMS_API_KEY`（GET 権限だけのキー）

エンドポイント名を変えている場合は、同じ画面の Variables に `MICROCMS_ENDPOINT` を登録します。Secrets が無いとき（未登録の場合や、フォークからの PR の場合）は、build ジョブはビルドを省略して警告を出します。

## 🗂 microCMS の API 構成

リスト形式の API（エンドポイント `techquiz-questions`）を 1 つ使います。

| フィールドID     | 種類                   | 内容                                          |
| ---------------- | ---------------------- | --------------------------------------------- |
| `chapter`        | テキストフィールド     | 章の名前（例: `第1章 ITの概要と専門用語`）    |
| `questionNumber` | 数字                   | 章内の問題番号（並び順に使う）                |
| `text`           | テキストエリア         | 問題文（Markdown 可）                         |
| `choices`        | 繰り返し（`choice`）   | 選択肢。`selectId`（a, b, c…）と `text`       |
| `answerId`       | 繰り返し（`answerId`） | 正解の `answerId`（a, b, c…）。複数で複数正解 |
| `explanation`    | テキストエリア         | 解説（Markdown 可）                           |

カスタムフィールド:

- `choice` … `selectId`（テキストフィールド）, `text`（テキストエリア。Markdown 可）
- `answerId` … `answerId`（テキストフィールド）

- 章名は「第N章 …」の形にしてください。N が URL の章 ID（`/chapter/N`）になります
- 問題は「章 → questionNumber」の順に並べて表示します。`questionNumber` が空の問題は、その章の最後に登録順で並び、章内の最大番号の続き（1, 2, 5 が登録済みなら 6, 7, …）が振られます
- 更新は最大 60 秒で反映されます

### JSON から問題を一括登録する

上の「クイズデータ形式」の配列で書いた JSON を、microCMS の CSV インポート用ファイルに変換できます。
3 つ目の引数に、管理画面の「CSVインポート」でダウンロードしたテンプレートを渡すと、その列の並びで出力します。

```bash
python3 scripts/json_to_microcms_csv.py <input_json> exports/techquiz-questions.csv exports/input-format.csv
```

できた CSV を管理画面の「CSVインポート」で取り込みます（`exports/` は `.gitignore` 済み）。

## 📋 改善点

今後の改善点は [IMPROVEMENTS.md](IMPROVEMENTS.md) にチェックリストでまとめています。
