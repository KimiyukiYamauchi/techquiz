import ChapterSelect from "@/components/ChapterSelect";
import styles from "@/components/Quiz.module.css";
import { getAllQuizItems } from "@/lib/microcms";
import { listScopes } from "@/lib/quizScope";

// 問題は microCMS から取得する（60 秒ごとに再取得。lib/microcms.ts 参照）
export const revalidate = 60;

// 章選択（/）
export default async function Home() {
  const data = await getAllQuizItems();
  if (data.length === 0) {
    return <p className={styles.container}>問題がまだ登録されていません。</p>;
  }
  return <ChapterSelect scopes={listScopes(data)} />;
}
