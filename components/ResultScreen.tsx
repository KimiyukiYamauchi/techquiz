"use client";

import type { QuizItem } from "@/types/quiz";
import { markdownExcerpt } from "@/lib/excerpt";
import { correctAnswerText } from "@/lib/grading";
import styles from "./Quiz.module.css";

interface ResultScreenProps {
  correctCount: number;
  totalQuestions: number;
  wrongQuestions: QuizItem[];
  onReviewWrong: () => void;
  onRetry: () => void; // 同じ章・同じモードで、全問題を 1 問目からもう一度
  onBackToChapters: () => void;
}

export default function ResultScreen({
  correctCount,
  totalQuestions,
  wrongQuestions,
  onReviewWrong,
  onRetry,
  onBackToChapters,
}: ResultScreenProps) {
  // 出題数が 0 のときは割り算できない（NaN になる）ので「-」と表示する
  const scoreText =
    totalQuestions > 0
      ? `${Math.round((correctCount / totalQuestions) * 100)}%`
      : "-";

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>結果</h1>

      <p>
        正解数: {correctCount} / {totalQuestions}
      </p>

      <p>正答率: {scoreText}</p>

      <p>不正解数: {wrongQuestions.length}</p>

      {/* ▼ 間違えた問題一覧 */}
      {wrongQuestions.length > 0 && (
        <>
          <h2 className={styles.subtitle}>間違えた問題</h2>

          <ul className={styles.wrongList}>
            {wrongQuestions.map((q) => (
              <li key={q.id} className={styles.wrongItem}>
                <div className={styles.wrongMeta}>
                  {q.chapter} - {q.questionNumber}
                </div>
                <div>{markdownExcerpt(q.question)}</div>
                <div className={styles.wrongAnswer}>
                  正解：{markdownExcerpt(correctAnswerText(q), 80)}
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      <div className={styles.actions}>
        {wrongQuestions.length > 0 && (
          <button className={styles.button} onClick={onReviewWrong}>
            間違った問題を復習する
          </button>
        )}

        <button className={styles.button} onClick={onRetry}>
          同じ条件でもう一度
        </button>

        <button className={styles.button} onClick={onBackToChapters}>
          章選択に戻る
        </button>
      </div>
    </div>
  );
}
