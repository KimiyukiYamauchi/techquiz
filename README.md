# 📘 Tech+ Quiz

Tech+の問題を学習できるクイズアプリです。
章ごと・全問題・ランダム出題に対応し、解説付きで効率よく学習できます。

## デプロイメント

👉 [https://techquiz-kappa.vercel.app/](https://techquiz-kappa.vercel.app/)

## ✨ 主な機能

- 📚 章ごとの問題選択
- 📖 「すべての問題」モード
- 🔀 ランダム出題
- ✅ 択一問題：クリックで即採点
- ☑️ 複数選択問題：選択後に採点
- 🎯 正解・不正解の色分け表示
- 📝 Markdown対応（問題文・解説）
- コードブロック
    - 表（テーブル）
    - 改行対応
- 📊 結果表示（正解数・正答率）
- 🔁 間違えた問題のみ復習

## 🖥️ 画面構成

| URL                                       | 画面                   |
| ----------------------------------------- | ---------------------- |
| `/`                                       | 章選択                 |
| `/chapter/[id]`                           | モード選択             |
| `/chapter/[id]/quiz?mode=sequential\|random` | クイズ画面・結果画面   |

- `[id]` は章名の先頭の「第N章」の番号です（例: `第3章 …` → `/chapter/3`）。すべての問題は `/chapter/all` です
  - 「第N章」で始まらない章や、番号が重複する章は章の一覧に出さず、サーバーログに警告を出します（その章の問題も「すべての問題」には含まれます）
- ブラウザの戻る・進むで、章選択・モード選択・クイズの間を移動できます
- クイズの進み具合（出題順・何問目か・回答・正解数・間違えた問題）はブラウザの sessionStorage に保存します。リロードしても続きから再開し、結果画面もそのまま残ります
  - モード選択から始めたとき・中断したとき・「最初からやり直す」を押したときは、保存した進み具合を消します
  - タブを閉じると消えます

## 🛠️ 使用技術

- Next.js (App Router)
- microCMS（問題データの管理）
- TypeScript
- React
- CSS Modules
- Vercel

### Markdown関連

- react-markdown
- remark-gfm
- remark-breaks

## 📁 ディレクトリ構成

```
techquiz/
├── app/
│   ├── page.tsx                    # 章選択（/）
│   ├── chapter/[id]/page.tsx       # モード選択（/chapter/[id]）
│   ├── chapter/[id]/quiz/page.tsx  # クイズ・結果（/chapter/[id]/quiz?mode=…）
│   ├── layout.tsx
│   └── error.tsx                   # microCMS に接続できないときのエラー画面
├── lib/
│   ├── microcms.ts     # microCMS から全問題を取得（サーバー専用）
│   ├── quizScope.ts    # 出題範囲（章 / すべての問題）と URL の章 ID
│   ├── quizSession.ts  # クイズの進み具合を sessionStorage に保存・復元
│   ├── grading.ts      # 正解判定
│   └── shuffle.ts      # Fisher–Yates シャッフル
├── scripts/
│   └── json_to_microcms_csv.py  # JSON → microCMS CSV インポート用ファイル
├── components/
│   ├── ChapterSelect.tsx
│   ├── ModeSelect.tsx
│   ├── QuizSessionLoader.tsx  # QuizSession をブラウザでだけ読み込む
│   ├── QuizSession.tsx        # 出題 → 結果 → 復習の進行と保存
│   ├── QuizScreen.tsx
│   ├── ResultScreen.tsx
│   └── Quiz.module.css
├── types/
│   └── quiz.ts
└── README.md
```

## 📄 クイズデータ形式

JSON で問題を書くときは次の形式を使います（`scripts/json_to_microcms_csv.py` の入力形式）。`answer` には正解の選択肢の本文を書きます。

```JSON
{
  "chapter": "第1章",
  "questionNumber": "1",
  "question": "次のコードの出力は？\n\n```javascript\nconsole.log(1 + 2);\n```",
  "choices": ["1", "2", "3", "4"],
  "answer": ["3"],
  "explanation": "```javascript\nconsole.log(1 + 2); // 3\n```"
}
```

画面側（`types/quiz.ts` の `QuizItem`）では、選択肢と正解を選択肢 ID（microCMS の `selectId`）で扱います。本文が同じ選択肢があっても正しく判定するためです。変換は `lib/microcms.ts` で行います。

```JSON
{
  "choices": [{ "id": "a", "text": "1" }, { "id": "b", "text": "2" }, { "id": "c", "text": "3" }, { "id": "d", "text": "4" }],
  "answer": ["c"]
}
```

次のような入力ミスがある問題は出題から除外し、サーバーログに `[microCMS] 問題 <コンテンツID> ...` の警告を出します（Vercel では Logs で確認できます）。

- 選択肢がない、`selectId` が空、または重複している
- 正解（`answerId`）が登録されていない、または選択肢にない ID を指している

## ▶️ 開発環境のセットアップ

```
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

Vercel では Project Settings → Environment Variables に同じ値を登録します。

#### 👉 [http://localhost:3000](http://localhost:3000)

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

- `choice` … `selectId`（テキストフィールド）, `text`（テキストエリア）
- `answerId` … `answerId`（テキストフィールド）

問題は「章 → questionNumber」の順に並べて表示します。`questionNumber` が空の問題は、その章の最後に登録順で並び、章内の最大番号の続き（1, 2, 5 が登録済みなら 6, 7, …）が振られます。更新は最大 60 秒で反映されます。

### JSON から問題を一括登録する

上の「クイズデータ形式」の配列で書いた JSON を、microCMS の CSV インポート用ファイルに変換できます。
3 つ目の引数に、管理画面の「CSVインポート」でダウンロードしたテンプレートを渡すと、その列の並びで出力します。

```bash
python3 scripts/json_to_microcms_csv.py <input_json> exports/techquiz-questions.csv exports/input-format.csv
```

できた CSV を管理画面の「CSVインポート」で取り込みます（`exports/` は `.gitignore` 済み）。
