"use client";

import styles from "./Quiz.module.css";

interface ModeSelectProps {
  selectedChapter: string;
  onStartQuiz: (mode: "sequential" | "random") => void;
  onBack: () => void;
}

export default function ModeSelect({
  selectedChapter,
  onStartQuiz,
  onBack,
}: ModeSelectProps) {
  return (
    <div className={styles.container}>
      <div className={styles.narrowContainer}>
        <h1 className={styles.title}>モード選択</h1>
        <p className={styles.subtitle}>章: {selectedChapter}</p>
        <div className={styles.row}>
          <button
            className={styles.button}
            onClick={() => onStartQuiz("sequential")}
          >
            順番に出題
          </button>

          <button
            className={styles.button}
            onClick={() => onStartQuiz("random")}
          >
            ランダムに出題
          </button>
        </div>

        <button className={styles.linkButton} onClick={onBack}>
          ← 章選択に戻る
        </button>
      </div>
    </div>
  );
}
