export type QuizChoice = {
  id: string; // 選択肢の ID（microCMS の selectId。a, b, c…）
  text: string;
};

// 出題モード: 順番に出題 / ランダムに出題
export type QuizMode = "sequential" | "random";

export const QUIZ_MODES: readonly QuizMode[] = ["sequential", "random"];

export function isQuizMode(value: unknown): value is QuizMode {
  return QUIZ_MODES.includes(value as QuizMode);
}

export type QuizItem = {
  id: string; // 問題の識別子（microCMS のコンテンツ ID）
  chapter: string;
  questionNumber: string;
  question: string;
  choices: QuizChoice[];
  answer: string[]; // 正解の選択肢 ID（複数で複数正解）
  explanation: string;
};
