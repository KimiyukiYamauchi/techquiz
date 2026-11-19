"use client";

import { useMemo, useState } from "react";
import type { QuizItem } from "@/types/quiz";
import { shuffle } from "@/lib/shuffle";
import {
  ALL_QUESTIONS_SCOPE,
  filterByScope,
  scopeLabel,
  type QuizScope,
} from "@/lib/quizScope";
import ChapterSelect from "./ChapterSelect";
import ModeSelect from "./ModeSelect";
import QuizScreen from "./QuizScreen";
import ResultScreen from "./ResultScreen";
import styles from "./Quiz.module.css";

type Screen = "chapter" | "mode" | "quiz" | "result";
type Mode = "sequential" | "random";

interface QuizProps {
  data: QuizItem[]; // microCMS から取得した問題（app/page.tsx で取得）
}

export default function Quiz({ data }: QuizProps) {
  const [screen, setScreen] = useState<Screen>("chapter");
  const [selectedScope, setSelectedScope] = useState<QuizScope | null>(null);
  // const [mode, setMode] = useState<Mode | null>(null);

  const [questions, setQuestions] = useState<QuizItem[]>([]);
  const [index, setIndex] = useState(0);

  const [correctCount, setCorrectCount] = useState(0);

  const [wrongQuestions, setWrongQuestions] = useState<QuizItem[]>([]);

  const scopes = useMemo<QuizScope[]>(() => {
    const uniqueChapters = Array.from(
      new Set(data.map((item) => item.chapter)),
    );
    return [
      ...uniqueChapters.map((chapter) => ({
        type: "chapter" as const,
        chapter,
      })),
      ALL_QUESTIONS_SCOPE,
    ];
  }, [data]);

  const startQuiz = (m: Mode) => {
    if (!selectedScope) return;

    const filtered = filterByScope(data, selectedScope);

    const list = m === "random" ? shuffle(filtered) : filtered;

    // setMode(m);
    setQuestions(list);
    setIndex(0);
    setCorrectCount(0);
    setWrongQuestions([]);
    setScreen("quiz");
  };

  const handleSelectScope = (scope: QuizScope) => {
    setSelectedScope(scope);
    setScreen("mode");
  };

  const handleBackToChapter = () => {
    setSelectedScope(null);
    setScreen("chapter");
  };

  const handleNextQuestion = () => {
    if (index + 1 < questions.length) {
      setIndex(index + 1);
    } else {
      setScreen("result");
    }
  };

  const handleCorrect = () => {
    setCorrectCount((c) => c + 1);
  };

  const handleWrong = (question: QuizItem) => {
    setWrongQuestions((prev) => {
      const exists = prev.some((item) => item.id === question.id);

      return exists ? prev : [...prev, question];
    });
  };

  const startReviewWrongQuestions = () => {
    if (wrongQuestions.length === 0) return;

    setQuestions(wrongQuestions);
    setIndex(0);
    setCorrectCount(0);
    setWrongQuestions([]);
    setScreen("quiz");
  };

  const handleRestart = () => {
    setScreen("chapter");
    setSelectedScope(null);
    setCorrectCount(0);
    setIndex(0);
    setWrongQuestions([]);
    setQuestions([]);
  };

  if (data.length === 0)
    return <p className={styles.container}>問題がまだ登録されていません。</p>;

  if (screen === "chapter") {
    return <ChapterSelect scopes={scopes} onSelectScope={handleSelectScope} />;
  }

  if (screen === "mode") {
    return (
      <ModeSelect
        selectedChapter={scopeLabel(selectedScope!)}
        onStartQuiz={startQuiz}
        onBack={handleBackToChapter}
      />
    );
  }

  if (screen === "quiz") {
    const currentQuestion = questions[index];
    return (
      <QuizScreen
        key={currentQuestion ? currentQuestion.id : `quiz-${index}`}
        questions={questions}
        index={index}
        onNext={handleNextQuestion}
        onCorrect={handleCorrect}
        onWrong={handleWrong}
        onQuit={handleRestart}
      />
    );
  }

  if (screen === "result") {
    return (
      <ResultScreen
        correctCount={correctCount}
        totalQuestions={questions.length}
        wrongQuestions={wrongQuestions}
        onReviewWrong={startReviewWrongQuestions}
        onRestart={handleRestart}
      />
    );
  }

  return null;
}
