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
│   └── page.tsx
├── components/
│   ├── Quiz.tsx
│   ├── ChapterSelect.tsx
│   ├── ModeSelect.tsx
│   ├── QuizScreen.tsx
│   ├── ResultScreen.tsx
│   └── Quiz.module.css
├── types/
│   └── quiz.ts
├── public/
│   └── quiz2.json
└── README.md
```

## 📄 クイズデータ形式

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

#### 👉 [http://localhost:3000](http://localhost:3000)
