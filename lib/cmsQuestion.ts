// microCMS の問題データを、画面で使う QuizItem の形式に変換する
// （API キーを扱わない純粋な処理なので、lib/microcms.ts から切り出して単体テストできるようにしている）
import type { QuizItem } from "@/types/quiz";

// microCMS 上の問題データ（quizsite と同じフィールド構成 + questionNumber）
export type CmsChoice = { fieldId?: string; selectId: string; text: string };
export type CmsAnswer = { fieldId?: string; answerId: string };
export type CmsQuestion = {
  id: string;
  chapter?: string;
  questionNumber?: number;
  text: string;
  choices?: CmsChoice[];
  answerId?: CmsAnswer[]; // 正解（複数指定で複数正解）
  explanation?: string;
};

// questionNumber は toQuizItem では決めず、章ごとに並べた後で numberWithinChapters が振る
export type ConvertedItem = {
  item: Omit<QuizItem, "questionNumber">;
  number?: number; // microCMS に登録された問題番号（無ければ undefined）
};

const toLetter = (s: string) => (s || "").trim().toLowerCase();

// microCMS の形式 → 画面で使う QuizItem の形式（選択肢・正解は選択肢 ID で持つ）
// 入力ミスで正しく出題できない問題は null を返し、サーバーログに理由を出す
export function toQuizItem(q: CmsQuestion): ConvertedItem | null {
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
    item: {
      id: q.id,
      chapter: q.chapter ?? "",
      question: q.text ?? "",
      choices,
      answer: answerIds,
      explanation: q.explanation ?? "",
    },
    number:
      typeof q.questionNumber === "number" && Number.isFinite(q.questionNumber)
        ? q.questionNumber
        : undefined,
  };
}

// 章 → 問題番号の順に並べ、番号が無い問題には章内の続き番号を振る
// （例: 1, 2, 5 が登録済みの章なら、番号の無い問題は登録順に 6, 7, …）
export function numberWithinChapters(converted: ConvertedItem[]): QuizItem[] {
  // 番号ありを先に番号順、番号なしは後ろに登録順のまま（sort は安定ソート）
  const compareNumber = (a?: number, b?: number) => {
    if (a === undefined) return b === undefined ? 0 : 1;
    if (b === undefined) return -1;
    return a - b;
  };
  const sorted = [...converted].sort(
    (a, b) =>
      a.item.chapter.localeCompare(b.item.chapter, "ja", { numeric: true }) ||
      compareNumber(a.number, b.number),
  );

  const maxByChapter = new Map<string, number>();
  for (const { item, number } of sorted) {
    if (number !== undefined) {
      maxByChapter.set(
        item.chapter,
        Math.max(maxByChapter.get(item.chapter) ?? 0, number),
      );
    }
  }

  return sorted.map(({ item, number }) => {
    if (number !== undefined) {
      return { ...item, questionNumber: String(number) };
    }
    const next = (maxByChapter.get(item.chapter) ?? 0) + 1;
    maxByChapter.set(item.chapter, next);
    return { ...item, questionNumber: String(next) };
  });
}

// microCMS から取得した問題（登録順）を変換し、章（「第2章」が「第10章」より前）→ 問題番号の順に並べる
export function convertCmsQuestions(contents: CmsQuestion[]): QuizItem[] {
  return numberWithinChapters(
    contents.map(toQuizItem).filter((c): c is ConvertedItem => c !== null),
  );
}
