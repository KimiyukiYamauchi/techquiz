"use client";

import { scopeKey, scopeLabel, type QuizScope } from "@/lib/quizScope";
import styles from "./Quiz.module.css";

interface ChapterSelectProps {
  scopes: QuizScope[]; // 各章と「すべての問題」
  onSelectScope: (scope: QuizScope) => void;
}

export default function ChapterSelect({
  scopes,
  onSelectScope,
}: ChapterSelectProps) {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>章を選択</h1>
      <div className={styles.grid}>
        {scopes.map((scope) => {
          const label = scopeLabel(scope);
          return (
            <button
              key={scopeKey(scope)}
              className={styles.button}
              onClick={() => onSelectScope(scope)}
              title={label}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
