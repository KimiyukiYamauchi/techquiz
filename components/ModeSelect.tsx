"use client";

import { useRouter } from "next/navigation";
import { clearSession, sessionKey } from "@/lib/quizSession";
import type { QuizMode } from "@/types/quiz";
import styles from "./Quiz.module.css";

interface ModeSelectProps {
  scopeId: string; // URL の章 ID（章番号 または "all"）
  label: string; // 画面に出す章名
}

export default function ModeSelect({ scopeId, label }: ModeSelectProps) {
  const router = useRouter();

  const startQuiz = (mode: QuizMode) => {
    // ここから始めるときは、前回の途中経過を捨てて 1 問目から始める
    // （リロードやブラウザの「進む」でクイズ画面に戻ったときだけ続きから再開する）
    clearSession(sessionKey(scopeId, mode));
    router.push(`/chapter/${scopeId}/quiz?mode=${mode}`);
  };

  return (
    <div className={styles.container}>
      <div className={styles.narrowContainer}>
        <h1 className={styles.title}>モード選択</h1>
        <p className={styles.subtitle}>章: {label}</p>
        <div className={styles.row}>
          <button
            className={styles.button}
            onClick={() => startQuiz("sequential")}
          >
            順番に出題
          </button>

          <button className={styles.button} onClick={() => startQuiz("random")}>
            ランダムに出題
          </button>
        </div>

        <button className={styles.linkButton} onClick={() => router.push("/")}>
          ← 章選択に戻る
        </button>
      </div>
    </div>
  );
}
