import type { QuizItem } from "@/types/quiz";

// 出題範囲: 特定の章、またはすべての問題
// 「すべての問題」を章名の文字列で表すと、同じ名前の章と区別できなくなるので種類で分ける
export type QuizScope = { type: "chapter"; chapter: string } | { type: "all" };

export const ALL_QUESTIONS_LABEL = "すべての問題";

export const ALL_QUESTIONS_SCOPE: QuizScope = { type: "all" };

// 画面に出す名前
export function scopeLabel(scope: QuizScope): string {
  return scope.type === "all" ? ALL_QUESTIONS_LABEL : scope.chapter;
}

// React の key などに使う、範囲ごとに一意な文字列
export function scopeKey(scope: QuizScope): string {
  return scope.type === "all" ? "all" : `chapter:${scope.chapter}`;
}

// 範囲に含まれる問題を返す
export function filterByScope(data: QuizItem[], scope: QuizScope): QuizItem[] {
  return scope.type === "all"
    ? data
    : data.filter((q) => q.chapter === scope.chapter);
}
