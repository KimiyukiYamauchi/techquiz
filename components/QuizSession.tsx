"use client";

// クイズの進行（出題 → 結果 → 間違えた問題の復習）を管理する
// 進み具合は sessionStorage に保存し、リロードしても続きから再開する（lib/quizSession.ts）
// sessionStorage はブラウザにしか無いので、このコンポーネントは QuizSessionLoader から
// サーバーレンダリングせずに読み込む
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { isCorrectAnswer } from "@/lib/grading";
import {
  clearSession,
  loadSession,
  newSession,
  saveSession,
  sessionKey,
  startWith,
  type QuizSessionState,
} from "@/lib/quizSession";
import type { QuizItem, QuizMode } from "@/types/quiz";
import QuizScreen from "./QuizScreen";
import ResultScreen from "./ResultScreen";

export interface QuizSessionProps {
  questions: QuizItem[]; // この章（範囲）の問題
  scopeId: string;
  mode: QuizMode;
}

export default function QuizSession({
  questions,
  scopeId,
  mode,
}: QuizSessionProps) {
  const router = useRouter();
  const key = sessionKey(scopeId, mode);

  const [state, setState] = useState<QuizSessionState>(
    () => loadSession(key, questions) ?? newSession(questions, mode),
  );

  useEffect(() => {
    saveSession(key, state);
  }, [key, state]);

  const byId = useMemo(
    () => new Map(questions.map((q) => [q.id, q])),
    [questions],
  );
  const toItems = (ids: string[]) =>
    ids.map((id) => byId.get(id)).filter((q): q is QuizItem => !!q);

  const backToChapters = () => {
    clearSession(key);
    router.push("/");
  };

  if (state.finished) {
    return (
      <ResultScreen
        correctCount={state.correctCount}
        totalQuestions={state.questionIds.length}
        wrongQuestions={toItems(state.wrongIds)}
        onReviewWrong={() =>
          setState((s) => (s.wrongIds.length > 0 ? startWith(s.wrongIds) : s))
        }
        onRestart={backToChapters}
      />
    );
  }

  const question = byId.get(state.questionIds[state.index]);
  if (!question) return null;

  const handleAnswer = (selected: string[]) => {
    setState((s) => {
      if (s.answer !== null) return s; // 二重に採点しない
      const correct = isCorrectAnswer(question, selected);
      return {
        ...s,
        answer: selected,
        correctCount: s.correctCount + (correct ? 1 : 0),
        wrongIds:
          correct || s.wrongIds.includes(question.id)
            ? s.wrongIds
            : [...s.wrongIds, question.id],
      };
    });
  };

  const handleNext = () => {
    setState((s) =>
      s.index + 1 < s.questionIds.length
        ? { ...s, index: s.index + 1, answer: null }
        : { ...s, finished: true },
    );
  };

  return (
    <QuizScreen
      key={`${state.index}-${question.id}`}
      question={question}
      index={state.index}
      total={state.questionIds.length}
      answer={state.answer}
      onAnswer={handleAnswer}
      onNext={handleNext}
      onQuit={backToChapters}
    />
  );
}
