export type QuizChoice = {
  id: string; // 選択肢の ID（microCMS の selectId。a, b, c…）
  text: string;
};

export type QuizItem = {
  chapter: string;
  questionNumber: string;
  question: string;
  choices: QuizChoice[];
  answer: string[]; // 正解の選択肢 ID（複数で複数正解）
  explanation: string;
};
