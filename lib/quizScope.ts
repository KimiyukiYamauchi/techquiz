import type { QuizItem } from "@/types/quiz";

// 出題範囲: 特定の章、またはすべての問題
// 「すべての問題」を章名の文字列で表すと、同じ名前の章と区別できなくなるので種類で分ける
// id は URL（/chapter/[id]）に使う値。章は章番号（「第3章 …」なら "3"）、すべての問題は "all"
export type QuizScope =
  | { type: "chapter"; id: string; chapter: string }
  | { type: "all"; id: typeof ALL_QUESTIONS_ID };

export const ALL_QUESTIONS_ID = "all";
export const ALL_QUESTIONS_LABEL = "すべての問題";

export const ALL_QUESTIONS_SCOPE: QuizScope = {
  type: "all",
  id: ALL_QUESTIONS_ID,
};

// 画面に出す名前
export function scopeLabel(scope: QuizScope): string {
  return scope.type === "all" ? ALL_QUESTIONS_LABEL : scope.chapter;
}

// 章名の先頭の「第N章」から章番号を取り出す（無ければ null）
export function chapterIdOf(chapter: string): string | null {
  const match = chapter.trim().match(/^第\s*(\d+)\s*章/);
  return match ? String(Number(match[1])) : null;
}

// 章選択に並べる出題範囲（各章 + すべての問題）
// 章番号が取り出せない章・番号が重複する章は章の一覧に出さず、サーバーログに警告する
// （その章の問題も「すべての問題」には含まれる）
export function listScopes(data: QuizItem[]): QuizScope[] {
  const chapters = Array.from(new Set(data.map((item) => item.chapter)));
  const usedIds = new Map<string, string>();
  const scopes: QuizScope[] = [];

  for (const chapter of chapters) {
    const id = chapterIdOf(chapter);
    if (id === null) {
      console.warn(
        `[章] 「${chapter}」は「第N章」で始まらないため、章の一覧に出しません`,
      );
      continue;
    }
    const other = usedIds.get(id);
    if (other !== undefined) {
      console.warn(
        `[章] 「${chapter}」は「${other}」と章番号 ${id} が重複するため、章の一覧に出しません`,
      );
      continue;
    }
    usedIds.set(id, chapter);
    scopes.push({ type: "chapter", id, chapter });
  }

  return [...scopes, ALL_QUESTIONS_SCOPE];
}

// URL の id から出題範囲を探す（無ければ null）
export function findScope(data: QuizItem[], id: string): QuizScope | null {
  return listScopes(data).find((scope) => scope.id === id) ?? null;
}

// 範囲に含まれる問題を返す
export function filterByScope(data: QuizItem[], scope: QuizScope): QuizItem[] {
  return scope.type === "all"
    ? data
    : data.filter((q) => q.chapter === scope.chapter);
}
