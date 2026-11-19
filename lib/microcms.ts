// lib/microcms.ts
// microCMS から問題データを取得する（サーバー専用）
// API キーを扱うので、クライアントコンポーネントから import するとビルドエラーにする
import "server-only";
import { createClient } from "microcms-js-sdk";
import type { QuizItem } from "@/types/quiz";

const SERVICE_DOMAIN = process.env.MICROCMS_SERVICE_DOMAIN;
const API_KEY = process.env.MICROCMS_API_KEY;
// 問題を登録している API のエンドポイント（未設定なら "techquiz-questions"）
const ENDPOINT = process.env.MICROCMS_ENDPOINT || "techquiz-questions";

if (!SERVICE_DOMAIN || !API_KEY) {
  throw new Error(
    "MICROCMS_SERVICE_DOMAIN / MICROCMS_API_KEY が未設定です（.env.local を確認）",
  );
}

const client = createClient({ serviceDomain: SERVICE_DOMAIN, apiKey: API_KEY });

// microCMS の取得結果をキャッシュする秒数（問題を更新してから最大この秒数で反映される）
const REVALIDATE_SECONDS = 60;

// microCMS 上の問題データ（quizsite と同じフィールド構成 + questionNumber）
type CmsChoice = { fieldId?: string; selectId: string; text: string };
type CmsAnswer = { fieldId?: string; answerId: string };
type CmsQuestion = {
  id: string;
  chapter?: string;
  questionNumber?: number;
  text: string;
  choices?: CmsChoice[];
  answerId?: CmsAnswer[]; // 正解（複数指定で複数正解）
  explanation?: string;
};

const toLetter = (s: string) => (s || "").trim().toLowerCase();

// microCMS の形式 → 画面で使う QuizItem の形式（選択肢・正解は選択肢 ID で持つ）
// 入力ミスで正しく出題できない問題は null を返し、サーバーログに理由を出す
function toQuizItem(q: CmsQuestion, index: number): QuizItem | null {
  const label = `[microCMS] 問題 ${q.id}（${q.chapter ?? "章なし"} - ${q.questionNumber ?? "番号なし"}）`;

  const choices = (q.choices ?? []).map((c) => ({
    id: toLetter(c.selectId),
    text: c.text ?? "",
  }));
  const choiceIds = choices.map((c) => c.id);
  if (choices.length === 0) {
    console.warn(`${label}: 選択肢がないため除外しました`);
    return null;
  }
  if (choiceIds.some((id) => id === "")) {
    console.warn(`${label}: selectId が空の選択肢があるため除外しました`);
    return null;
  }
  if (new Set(choiceIds).size !== choiceIds.length) {
    console.warn(`${label}: selectId が重複しているため除外しました`);
    return null;
  }

  const answerIds = Array.from(
    new Set((q.answerId ?? []).map((a) => toLetter(a.answerId))),
  );
  const unknown = answerIds.filter((id) => !choiceIds.includes(id));
  if (unknown.length > 0) {
    console.warn(
      `${label}: 正解 ${unknown.join(", ")} が選択肢にないため除外しました`,
    );
    return null;
  }
  if (answerIds.length === 0) {
    console.warn(`${label}: 正解が登録されていないため除外しました`);
    return null;
  }

  return {
    chapter: q.chapter ?? "",
    questionNumber: String(q.questionNumber ?? index + 1),
    question: q.text ?? "",
    choices,
    answer: answerIds,
    explanation: q.explanation ?? "",
  };
}

// 全問題を取得し、章（「第2章」が「第10章」より前）→ 問題番号の順に並べる
export async function getAllQuizItems(): Promise<QuizItem[]> {
  const contents = await client.getAllContents<CmsQuestion>({
    endpoint: ENDPOINT,
    queries: {
      fields: "id,chapter,questionNumber,text,choices,answerId,explanation",
      // questionNumber が無いときは登録順（CSV の行順）で並べる
      orders: "createdAt",
    },
    customRequestInit: { next: { revalidate: REVALIDATE_SECONDS } },
  });

  return contents
    .map(toQuizItem)
    .filter((item): item is QuizItem => item !== null)
    .sort(
      (a, b) =>
        a.chapter.localeCompare(b.chapter, "ja", { numeric: true }) ||
        Number(a.questionNumber) - Number(b.questionNumber),
    );
}
