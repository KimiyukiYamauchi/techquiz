import type { QuizItem } from "@/types/quiz";

// 選んだ選択肢 ID が正解と一致するか（並び順の違いは無視する）
export function isCorrectAnswer(q: QuizItem, selected: string[]): boolean {
  const normalize = (ids: string[]) =>
    Array.from(new Set(ids)).sort().join("|");
  return selected.length > 0 && normalize(selected) === normalize(q.answer);
}

// 正解の選択肢の本文（複数正解は「 / 」でつなぐ）
export function correctAnswerText(q: QuizItem): string {
  return q.choices
    .filter((c) => q.answer.includes(c.id))
    .map((c) => c.text)
    .join(" / ");
}
