"use client";

import { useRouter } from "next/navigation";
import { scopeLabel, type QuizScope } from "@/lib/quizScope";
import styles from "./Quiz.module.css";

interface ChapterSelectProps {
  scopes: QuizScope[]; // 各章と「すべての問題」
}

export default function ChapterSelect({ scopes }: ChapterSelectProps) {
  const router = useRouter();

  return (
    <div className={styles.container}>
      {/* タイトルとボタンを同じ幅の枠に入れて、左端をそろえる */}
      <div className={styles.narrowContainer}>
        <h1 className={styles.title}>章を選択</h1>
        <div className={styles.grid}>
          {scopes.map((scope) => {
            const label = scopeLabel(scope);
            return (
              <button
                key={scope.id}
                className={styles.button}
                onClick={() => router.push(`/chapter/${scope.id}`)}
                title={label}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
