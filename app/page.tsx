import Quiz from "@/components/Quiz";
import { getAllQuizItems } from "@/lib/microcms";

// 問題は microCMS から取得する（60 秒ごとに再取得。lib/microcms.ts 参照）
export const revalidate = 60;

export default async function Home() {
  const data = await getAllQuizItems();
  return <Quiz data={data} />;
}
