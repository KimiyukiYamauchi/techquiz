// クイズの進み具合を sessionStorage に保存し、リロードしても続きから再開できるようにする
// （タブを閉じると消える。プライベートブラウズなどで使えないときは保存しないだけで動作は続ける）
import { shuffle } from "@/lib/shuffle";
import type { QuizItem, QuizMode } from "@/types/quiz";

export type QuizSessionState = {
  questionIds: string[]; // 出題順の問題 ID
  index: number; // 今の問題の位置（0 始まり）
  correctCount: number;
  wrongIds: string[]; // 間違えた問題の ID（重複なし）
  answer: string[] | null; // 今の問題への回答（選択肢 ID）。未回答なら null
  finished: boolean; // 結果画面を表示中か
};

const STORAGE_PREFIX = "techquiz:session";

export function sessionKey(scopeId: string, mode: QuizMode): string {
  return `${STORAGE_PREFIX}:${scopeId}:${mode}`;
}

// 新しく始めるときの状態
export function newSession(
  questions: QuizItem[],
  mode: QuizMode,
): QuizSessionState {
  const ordered = mode === "random" ? shuffle(questions) : questions;
  return startWith(ordered.map((q) => q.id));
}

// 指定した問題 ID の順で始める（間違えた問題の復習にも使う）
export function startWith(questionIds: string[]): QuizSessionState {
  return {
    questionIds,
    index: 0,
    correctCount: 0,
    wrongIds: [],
    answer: null,
    finished: false,
  };
}

// 保存した状態を読み込む。壊れている・問題が更新されて合わないときは null
export function loadSession(
  key: string,
  questions: QuizItem[],
): QuizSessionState | null {
  let raw: string | null;
  try {
    raw = window.sessionStorage.getItem(key);
  } catch {
    return null;
  }
  if (!raw) return null;

  try {
    const s = JSON.parse(raw) as Partial<QuizSessionState>;
    const known = new Set(questions.map((q) => q.id));
    const isIdList = (v: unknown): v is string[] =>
      Array.isArray(v) && v.every((id) => typeof id === "string");

    if (
      !isIdList(s.questionIds) ||
      s.questionIds.length === 0 ||
      !s.questionIds.every((id) => known.has(id)) ||
      !isIdList(s.wrongIds) ||
      !s.wrongIds.every((id) => known.has(id)) ||
      typeof s.index !== "number" ||
      !Number.isInteger(s.index) ||
      s.index < 0 ||
      s.index >= s.questionIds.length ||
      typeof s.correctCount !== "number" ||
      !(s.answer === null || isIdList(s.answer)) ||
      typeof s.finished !== "boolean"
    ) {
      return null;
    }
    return {
      questionIds: s.questionIds,
      index: s.index,
      correctCount: s.correctCount,
      wrongIds: s.wrongIds,
      answer: s.answer,
      finished: s.finished,
    };
  } catch {
    return null;
  }
}

export function saveSession(key: string, state: QuizSessionState): void {
  try {
    window.sessionStorage.setItem(key, JSON.stringify(state));
  } catch {
    // 保存できなくてもクイズは続けられる
  }
}

export function clearSession(key: string): void {
  try {
    window.sessionStorage.removeItem(key);
  } catch {
    // 何もしない
  }
}
