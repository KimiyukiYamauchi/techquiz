"use client";

import type { QuizItem } from "@/types/quiz";
import styles from "./Quiz.module.css";

interface ResultScreenProps {
  correctCount: number;
  totalQuestions: number;
  wrongQuestions: QuizItem[];
  onReviewWrong: () => void;
  onRestart: () => void;
}

export default function ResultScreen({
  correctCount,
  totalQuestions,
  wrongQuestions,
  onReviewWrong,
  onRestart,
}: ResultScreenProps) {
  const score = Math.round((correctCount / totalQuestions) * 100);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>結果</h1>

      <p>
        正解数: {correctCount} / {totalQuestions}
      </p>

      <p>正答率: {score}%</p>

      <p>不正解数: {wrongQuestions.length}</p>

      {/* ▼ 間違えた問題一覧 */}
      {wrongQuestions.length > 0 && (
        <>
          <h2 className={styles.subtitle}>間違えた問題</h2>

          <ul className={styles.wrongList}>
            {wrongQuestions.map((q) => (
              <li key={`${q.chapter}-${q.questionNumber}`}>
                {q.chapter} - {q.questionNumber}
              </li>
            ))}
          </ul>

          <button className={styles.button} onClick={onReviewWrong}>
            間違った問題を復習する
          </button>
        </>
      )}

      <button className={styles.button} onClick={onRestart}>
        最初からやり直す
      </button>
    </div>
  );
}
