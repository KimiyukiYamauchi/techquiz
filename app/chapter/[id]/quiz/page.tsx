import { notFound, redirect } from "next/navigation";
import QuizSessionLoader from "@/components/QuizSessionLoader";
import { getAllQuizItems } from "@/lib/microcms";
import { filterByScope, findScope } from "@/lib/quizScope";
import { isQuizMode } from "@/types/quiz";

// クイズ（/chapter/[id]/quiz?mode=sequential|random）
// 出題と結果の表示を行う。進み具合はブラウザの sessionStorage に保存する
export default async function QuizPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ mode?: string | string[] }>;
}) {
  const { id } = await params;
  const { mode } = await searchParams;

  const data = await getAllQuizItems();
  const scope = findScope(data, id);
  if (!scope) notFound();

  // モードの指定が無い・不正なときはモード選択に戻す
  if (!isQuizMode(mode)) redirect(`/chapter/${scope.id}`);

  const questions = filterByScope(data, scope);
  if (questions.length === 0) notFound();

  return (
    <QuizSessionLoader
      key={`${scope.id}-${mode}`}
      questions={questions}
      scopeId={scope.id}
      mode={mode}
    />
  );
}
