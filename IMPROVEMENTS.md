# 改善点チェックリスト

調査日: 2026-11-19（ブランチ `feature/microcms` / コミット `2b8ad0d` 時点）

確認した状態:

- `npx eslint .` / `npx tsc --noEmit` … エラーなし
- `npm audit --omit=dev` … 本番依存に 6 件（critical 1 / high 4 / moderate 1）。`next 16.1.6` が該当
- テスト・CI … なし

優先度: 🔴 高（不具合・セキュリティ） / 🟡 中（品質・UX） / 🟢 低（整理・あると良い）

---

## 1. セキュリティ・依存関係

- [x] 🔴 `next` を 16.4.1 以降へ更新する（16.4.0 以下に既知の脆弱性。`eslint-config-next` も合わせて更新）→ 16.4.6 に更新
- [x] 🔴 `npm audit fix` で `sharp` などの間接依存の脆弱性を解消する → `npm audit` で 0 件
- [ ] 🟢 `react` / `react-dom` / `@types/*` / `@tailwindcss/postcss` をマイナー更新する
- [ ] 🟢 Dependabot（または Renovate）を設定して依存更新を自動化する
- [ ] 🟢 `next.config.ts` でセキュリティヘッダー（`X-Content-Type-Options`、`Referrer-Policy` など）を設定する

## 2. 不具合・潜在バグ

- [x] 🔴 正解判定と React の `key` が「選択肢の本文」に依存している（[QuizScreen.tsx:96-114](components/QuizScreen.tsx#L96-L114)、[microcms.ts:42-54](lib/microcms.ts#L42-L54)）
  - 同じ本文の選択肢が 2 つあると、key が重複し、判定も壊れる
  - `QuizItem` に `selectId`（a, b, c…）を持たせ、ID で判定するようにする
- [x] 🔴 microCMS の `answerId` が選択肢と一致しないと `answer` が空配列になる（[microcms.ts:43-49](lib/microcms.ts#L43-L49)）
  - 空のときは `isSingleAnswer` が false になり、複数選択の問題として扱われて、絶対に正解できなくなる
  - 変換時に警告ログを出すかその問題を除外する。管理画面での入力ミスにも気づけるようにする
- [x] 🟡 `questionNumber` が無いときの補完値 `index + 1` が全問題の通し番号になる（[microcms.ts:52](lib/microcms.ts#L52)）
  - 章内の番号と重複しうるため、`${chapter}-${questionNumber}` の key や、間違えた問題の重複判定（[Quiz.tsx:82-86](components/Quiz.tsx#L82-L86)）が衝突する → microCMS の `id` を `QuizItem` に持たせて識別子にする
- [ ] 🟡 ランダム出題の `sort(() => Math.random() - 0.5)` は偏りが出る（[Quiz.tsx:47](components/Quiz.tsx#L47)）→ Fisher–Yates シャッフルにする
- [ ] 🟡 `totalQuestions` が 0 のとき正答率が `NaN%` になる（[ResultScreen.tsx:21](components/ResultScreen.tsx#L21)）
- [ ] 🟡 章名が「すべての問題」と同じだと区別できない（[Quiz.tsx:34](components/Quiz.tsx#L34)）→ 定数化し、内部値は専用の ID にする
- [ ] 🟢 `error.tsx` のコンポーネント名 `Error` が組み込みの `Error` を覆い隠している → `ErrorPage` などに改名し、`error` を `console.error` で記録する（[error.tsx:6](app/error.tsx#L6)）

## 3. UX・機能

- [ ] 🟡 クイズの途中でやめる・章選択に戻る手段がない（クイズ画面に「中断」ボタンを置く）
- [ ] 🟡 画面遷移が state だけで管理されていて、ブラウザの戻るボタンでサイトから離れてしまう。リロードでも最初に戻る
  - `/chapter/[id]` のようなルーティングや、クエリパラメータで状態を持つことを検討する
- [ ] 🟡 結果画面の「最初からやり直す」は実際には章選択に戻る → 「同じ条件でもう一度」と「章選択に戻る」に分ける
- [ ] 🟡 間違えた問題一覧が「章 - 番号」だけで内容が分からない → 問題文の冒頭や正解を表示する
- [ ] 🟡 章・モード選択のボタンが `nowrap` + 省略表示のため、長い章名が切れる（`title` 属性はスマホでは見えない）（[Quiz.module.css:45-56](components/Quiz.module.css#L45-L56)）
- [ ] 🟡 選択肢が Markdown として描画されない（コードや強調を含む選択肢が素のテキストになる）
- [ ] 🟢 選択肢に a / b / c のラベルを表示する（「正解：」の行も本文の列挙ではなくラベルで示せる）
- [ ] 🟢 学習履歴（章ごとの正答率・苦手問題）を `localStorage` に保存して表示する
- [ ] 🟢 クイズ画面に章名と、現在の正解数を表示する
- [ ] 🟢 ランダム出題で選択肢の順番もシャッフルできるようにする
- [ ] 🟢 出題数を指定するモード（例: ランダム 10 問）を追加する

## 4. アクセシビリティ

- [ ] 🟡 選択肢が `<li onClick>` のため、キーボードで操作できない → `<button>` か、`role="checkbox"` / `role="radio"` に置き換える
- [ ] 🟡 正解・不正解の結果を `aria-live` で読み上げる
- [ ] 🟡 `<html lang="en">` を `lang="ja"` にする（[layout.tsx:27](app/layout.tsx#L27)）
- [ ] 🟢 数字キー（1〜4）で回答し、Enter で次へ進めるショートカットを追加する
- [ ] 🟢 色のコントラストを確認する（`opacity: 0.8` の補足テキストなど）

## 5. スタイル・デザイン

- [ ] 🟡 `globals.css` の import がコメントアウトされている（[layout.tsx:3](app/layout.tsx#L3)）
  - 現状 Tailwind は使われていない → 使うなら有効化し、使わないなら `tailwindcss` / `@tailwindcss/postcss` / `postcss.config.mjs` を削除する
- [ ] 🟡 ダークモードに対応していない（CSS Modules で `white` や `#f7f7f7` を直書きしている）→ CSS 変数にまとめる
- [ ] 🟡 Markdown のコードブロック（`pre`）にスタイルがなく、長いコードがスマホではみ出す → `overflow-x: auto` などを付ける
- [ ] 🟡 解説（`.explanation`）内の表にスタイルが当たっていない（`.question table` のみ定義）
- [ ] 🟢 `Geist` フォントは `latin` のみで日本語に効かない → `Noto Sans JP` などに変更するか削除する
- [ ] 🟢 シンタックスハイライト（`rehype-highlight` など）を導入する

## 6. データ取得・パフォーマンス

- [ ] 🟡 全問題（解説を含む）を 1 ページの HTML / RSC ペイロードに埋め込んでいる。問題数が増えると初回表示が重くなる
  - 章ごとのページに分けるか、解説を回答後に取得する
- [ ] 🟢 キャッシュ秒数 60 が `app/page.tsx` と `lib/microcms.ts` に二重に定義されている → 一か所にまとめる
- [ ] 🟢 microCMS の Webhook と `revalidateTag` / `revalidatePath` でオンデマンド再検証し、更新をすぐ反映させる
- [ ] 🟢 環境変数の未設定チェックがモジュール読み込み時の `throw` で行われている（[microcms.ts:13-17](lib/microcms.ts#L13-L17)）。メッセージは分かりやすいが、ビルド時に env が無い環境（PR プレビューなど）ではビルド自体が失敗する点を README に明記する

## 7. コード品質・構成

- [ ] 🟡 `"sequential" | "random"` 型が `Quiz.tsx` と `ModeSelect.tsx` で重複している → `types/quiz.ts` に `QuizMode` として定義する
- [ ] 🟢 コメントアウトされた `mode` state を削除する（[Quiz.tsx:21](components/Quiz.tsx#L21)、[Quiz.tsx:50](components/Quiz.tsx#L50)）
- [ ] 🟢 クイズ進行の state（questions / index / correctCount / wrongQuestions）を `useReducer` かカスタムフックにまとめる
- [ ] 🟢 採点ロジック（`isCorrect`）を純粋関数として切り出す（テストしやすくなる）
- [ ] 🟢 使っていない `public/*.svg`（create-next-app のテンプレート）を削除する
- [ ] 🟢 Prettier を導入し、`format` / `typecheck` スクリプトを `package.json` に追加する

## 8. テスト・CI

- [ ] 🟡 単体テストを追加する（Vitest など）
  - `toQuizItem`（microCMS → QuizItem の変換、正解 ID の対応付け、欠損値）
  - 採点ロジック（択一 / 複数選択 / 順不同）
  - 章の並び順（「第2章」が「第10章」より前）
- [ ] 🟡 GitHub Actions で `lint` / `tsc --noEmit` / テスト / `build` を PR ごとに実行する
- [ ] 🟢 Playwright で「章選択 → 回答 → 結果 → 復習」の E2E テストを追加する
- [ ] 🟢 `scripts/json_to_microcms_csv.py` のテストを追加する（正解が選択肢に無い場合のエラーなど）

## 9. データ移行スクリプト（`scripts/json_to_microcms_csv.py`）

- [ ] 🟢 `questionNumber` が数値でない・同じ章で重複している場合に警告する
- [ ] 🟢 入力 JSON が配列でない場合に分かりやすいエラーを出す
- [ ] 🟢 エラーが 1 件見つかった時点で止めず、全件の問題点をまとめて表示する

## 10. ドキュメント

- [ ] 🟢 README のディレクトリ構成に `app/layout.tsx`・`types/` の説明・`IMPROVEMENTS.md` を追記する
- [ ] 🟢 README に `npm run lint` などの開発コマンドと、microCMS の API キー権限（GET のみで十分）の注意を追記する
- [ ] 🟢 `.env.example` を追加する（現在は README に記載しているだけ。`.gitignore` の `.env*` から `!.env.example` で除外する）
