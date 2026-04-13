"use client";

import { useState } from "react";
import type { QuizItem } from "@/types/quiz";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import styles from "./Quiz.module.css";

interface QuizScreenProps {
  questions: QuizItem[];
  index: number;
  onNext: () => void;
  onCorrect: () => void;
  onWrong: (question: QuizItem) => void;
}

export default function QuizScreen({
  questions,
  index,
  onNext,
  onCorrect,
  onWrong,
}: QuizScreenProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const [isAnswered, setIsAnswered] = useState(false);

  const q = questions[index];
  if (!q) return null;

  const isSingleAnswer = q.answer.length === 1;

  // 並び順の違いを無視して一致判定する
  const normalize = (arr: string[]) => [...arr].sort();

  const isCorrect = isSingleAnswer
    ? selected[0] === (q.answer[0] ?? "")
    : normalize(selected).join("|") === normalize(q.answer).join("|");

  const handleAnswer = () => {
    if (selected.length === 0) return;

    setIsAnswered(true);

    if (isCorrect) {
      onCorrect();
    } else {
      onWrong(q);
    }
  };

  const handleChoiceClick = (choice: string) => {
    if (isAnswered) return;

    if (isSingleAnswer) {
      // 択一問題はクリックした瞬間に採点
      setSelected([choice]);
      setIsAnswered(true);

      if (choice === (q.answer[0] ?? "")) {
        onCorrect();
      } else {
        onWrong(q);
      }
    } else {
      // 複数選択問題は従来通りトグル
      setSelected((prev) => {
        if (prev.includes(choice)) {
          return prev.filter((c) => c !== choice);
        }
        return [...prev, choice];
      });
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.topBar}>
        <span>
          {index + 1} / {questions.length}
        </span>
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
          const isSelected = selected.includes(c);

          const isAnswerChoice = q.answer.includes(c);
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
              key={c}
              className={className}
              onClick={() => handleChoiceClick(c)}
            >
              {c}
            </li>
          );
        })}
      </ul>

      {!isSingleAnswer && !isAnswered && (
        <button
          className={styles.button}
          onClick={handleAnswer}
          disabled={selected.length === 0}
        >
          回答する
        </button>
      )}

      {isAnswered && (
        <>
          <p className={isCorrect ? styles.correct : styles.wrong}>
            {isCorrect ? "正解！" : "不正解"}
          </p>

          <p className={styles.answerLine}>正解：{q.answer.join(" / ")}</p>

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
