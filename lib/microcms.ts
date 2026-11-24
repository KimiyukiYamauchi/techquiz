// lib/microcms.ts
// microCMS から問題データを取得する（サーバー専用）
// API キーを扱うので、クライアントコンポーネントから import するとビルドエラーにする
import "server-only";
import { createClient } from "microcms-js-sdk";
import { convertCmsQuestions, type CmsQuestion } from "@/lib/cmsQuestion";
import type { QuizItem } from "@/types/quiz";

const SERVICE_DOMAIN = process.env.MICROCMS_SERVICE_DOMAIN;
const API_KEY = process.env.MICROCMS_API_KEY;
// 問題を登録している API のエンドポイント（未設定なら "techquiz-questions"）
const ENDPOINT = process.env.MICROCMS_ENDPOINT || "techquiz-questions";

if (!SERVICE_DOMAIN || !API_KEY) {
  throw new Error(
    "MICROCMS_SERVICE_DOMAIN / MICROCMS_API_KEY が未設定です（.env.local を確認）",
  );
}

const client = createClient({ serviceDomain: SERVICE_DOMAIN, apiKey: API_KEY });

// microCMS の取得結果をキャッシュする秒数（問題を更新してから最大この秒数で反映される）
const REVALIDATE_SECONDS = 60;

// 全問題を取得し、章（「第2章」が「第10章」より前）→ 問題番号の順に並べる
export async function getAllQuizItems(): Promise<QuizItem[]> {
  const contents = await client.getAllContents<CmsQuestion>({
    endpoint: ENDPOINT,
    queries: {
      fields: "id,chapter,questionNumber,text,choices,answerId,explanation",
      // questionNumber が無いときは登録順（CSV の行順）で並べる
      orders: "createdAt",
    },
    customRequestInit: { next: { revalidate: REVALIDATE_SECONDS } },
  });

  // 変換・並べ替えは lib/cmsQuestion.ts（単体テストあり）
  return convertCmsQuestions(contents);
}
