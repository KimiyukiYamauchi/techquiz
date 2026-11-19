"use client";

import { useState } from "react";
import type { QuizItem } from "@/types/quiz";
import { correctAnswerText, isCorrectAnswer } from "@/lib/grading";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import styles from "./Quiz.module.css";

interface QuizScreenProps {
  question: QuizItem;
  index: number; // 何問目か（0 始まり）
  total: number; // 出題数
  // 回答済みならその回答（選択肢 ID）、未回答なら null。親が保存し、リロード後も復元する
  answer: string[] | null;
  onAnswer: (selected: string[]) => void;
  onNext: () => void;
  onQuit: () => void; // クイズを中断して章選択に戻る
}

export default function QuizScreen({
  question: q,
  index,
  total,
  answer,
  onAnswer,
  onNext,
  onQuit,
}: QuizScreenProps) {
  // 複数選択問題で「回答する」を押す前の選択
  const [pending, setPending] = useState<string[]>([]);

  const isAnswered = answer !== null;
  const selected = answer ?? pending;
  const isSingleAnswer = q.answer.length === 1;
  const isCorrect = isAnswered && isCorrectAnswer(q, answer);

  // choiceId は選択肢の ID（本文が同じ選択肢があっても区別できる）
  const handleChoiceClick = (choiceId: string) => {
    if (isAnswered) return;

    if (isSingleAnswer) {
      // 択一問題はクリックした瞬間に採点
      onAnswer([choiceId]);
    } else {
      // 複数選択問題はトグル
      setPending((prev) =>
        prev.includes(choiceId)
          ? prev.filter((id) => id !== choiceId)
          : [...prev, choiceId],
      );
    }
  };

  const handleAnswer = () => {
    if (pending.length === 0) return;
    onAnswer(pending);
  };

  const handleQuit = () => {
    if (
      window.confirm(
        "クイズを中断して章選択に戻りますか？\nここまでの回答結果は保存されません。",
      )
    ) {
      onQuit();
    }
  };

  const answerText = correctAnswerText(q);

  return (
    <div className={styles.container}>
      <div className={styles.topBar}>
        <span>
          {index + 1} / {total}
        </span>
        <button
          type="button"
          className={styles.quitButton}
          onClick={handleQuit}
        >
          中断して章選択に戻る
        </button>
      </div>

      <div className={styles.question}>
        <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
          {q.question}
        </ReactMarkdown>
      </div>

      {!isSingleAnswer && (
        <p className={styles.hint}>※ 複数選択可（クリックで選択/解除）</p>
      )}

      <ul className={styles.choiceList}>
        {q.choices.map((c) => {
          const isSelected = selected.includes(c.id);

          const isAnswerChoice = q.answer.includes(c.id);
          const isWrongSelected = isAnswered && isSelected && !isAnswerChoice;

          const className = [
            styles.choiceItem,
            !isAnswered && isSelected ? styles.selected : "",
            isAnswered ? styles.disabled : "",
            isAnswered && isAnswerChoice ? styles.correctChoice : "",
            isWrongSelected ? styles.wrongChoice : "",
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <li
              key={c.id}
              className={className}
              onClick={() => handleChoiceClick(c.id)}
            >
              {c.text}
            </li>
          );
        })}
      </ul>

      {!isSingleAnswer && !isAnswered && (
        <button
          className={styles.button}
          onClick={handleAnswer}
          disabled={pending.length === 0}
        >
          回答する
        </button>
      )}

      {isAnswered && (
        <>
          <p className={isCorrect ? styles.correct : styles.wrong}>
            {isCorrect ? "正解！" : "不正解"}
          </p>

          <p className={styles.answerLine}>正解：{answerText}</p>

          <div className={styles.explanation}>
            <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
              {q.explanation}
            </ReactMarkdown>
          </div>

          <button className={styles.button} onClick={onNext}>
            次へ
          </button>
        </>
      )}
    </div>
  );
}
