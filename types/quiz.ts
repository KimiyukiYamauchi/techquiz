export type QuizChoice = {
  id: string; // 選択肢の ID（microCMS の selectId。a, b, c…）
  text: string;
};

export type QuizItem = {
  id: string; // 問題の識別子（microCMS のコンテンツ ID）
  chapter: string;
  questionNumber: string;
  question: string;
  choices: QuizChoice[];
  answer: string[]; // 正解の選択肢 ID（複数で複数正解）
  explanation: string;
};
