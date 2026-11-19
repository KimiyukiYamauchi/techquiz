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

- 章選択
- モード選択
- クイズ画面
- 結果画面

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
│   ├── page.tsx        # microCMS から問題を取得して Quiz に渡す
│   └── error.tsx       # microCMS に接続できないときのエラー画面
├── lib/
│   └── microcms.ts     # microCMS から全問題を取得（サーバー専用）
├── scripts/
│   └── json_to_microcms_csv.py  # JSON → microCMS CSV インポート用ファイル
├── components/
│   ├── Quiz.tsx
│   ├── ChapterSelect.tsx
│   ├── ModeSelect.tsx
│   ├── QuizScreen.tsx
│   ├── ResultScreen.tsx
│   └── Quiz.module.css
├── types/
│   └── quiz.ts
└── README.md
```

## 📄 クイズデータ形式

画面では次の形式（`types/quiz.ts` の `QuizItem`）で扱います。microCMS のデータは `lib/microcms.ts` でこの形式に変換されます。

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

問題は「章 → questionNumber」の順に並べて表示します。更新は最大 60 秒で反映されます。

### JSON から問題を一括登録する

上の「クイズデータ形式」の配列で書いた JSON を、microCMS の CSV インポート用ファイルに変換できます。
3 つ目の引数に、管理画面の「CSVインポート」でダウンロードしたテンプレートを渡すと、その列の並びで出力します。

```bash
python3 scripts/json_to_microcms_csv.py <input_json> exports/techquiz-questions.csv exports/input-format.csv
```

できた CSV を管理画面の「CSVインポート」で取り込みます（`exports/` は `.gitignore` 済み）。
