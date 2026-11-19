import { notFound } from "next/navigation";
import ModeSelect from "@/components/ModeSelect";
import { getAllQuizItems } from "@/lib/microcms";
import { findScope, listScopes, scopeLabel } from "@/lib/quizScope";

export const revalidate = 60;

// ビルド時に各章のページを作っておく（後から増えた章は初回アクセス時に作る）
export async function generateStaticParams() {
  const data = await getAllQuizItems();
  return listScopes(data).map((scope) => ({ id: scope.id }));
}

// モード選択（/chapter/[id]）。id は章番号、すべての問題は "all"
export default async function ChapterPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const scope = findScope(await getAllQuizItems(), id);
  if (!scope) notFound();

  return <ModeSelect scopeId={scope.id} label={scopeLabel(scope)} />;
}
