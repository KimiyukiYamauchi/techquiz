"use client";

// QuizSession は sessionStorage から途中経過を読むため、サーバーではレンダリングしない
// （サーバーとブラウザで表示が食い違う hydration エラーを防ぐ）
import dynamic from "next/dynamic";
import type { QuizSessionProps } from "./QuizSession";

const QuizSession = dynamic(() => import("./QuizSession"), { ssr: false });

export default function QuizSessionLoader(props: QuizSessionProps) {
  return <QuizSession {...props} />;
}
