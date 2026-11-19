"use client";

// microCMS に接続できないときなどに表示するエラー画面
import styles from "@/components/Quiz.module.css";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className={styles.container}>
      <p>クイズデータの取得に失敗しました。</p>
      <button className={styles.button} onClick={() => reset()}>
        再読み込み
      </button>
    </div>
  );
}
