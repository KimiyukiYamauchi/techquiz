"use client";

import { useMemo, useState } from "react";
import type { QuizItem } from "@/types/quiz";
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
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);
  // const [mode, setMode] = useState<Mode | null>(null);

  const [questions, setQuestions] = useState<QuizItem[]>([]);
  const [index, setIndex] = useState(0);

  const [correctCount, setCorrectCount] = useState(0);

  const [wrongQuestions, setWrongQuestions] = useState<QuizItem[]>([]);

  const chapters = useMemo(() => {
    const uniqueChapters = Array.from(
      new Set(data.map((item) => item.chapter)),
    );
    return [...uniqueChapters, "すべての問題"];
  }, [data]);

  const startQuiz = (m: Mode) => {
    if (!selectedChapter) return;

    const filtered =
      selectedChapter === "すべての問題"
        ? data
        : data.filter((q) => q.chapter === selectedChapter);

    let list = filtered;
    if (m === "random") {
      list = [...filtered].sort(() => Math.random() - 0.5);
    }

    // setMode(m);
    setQuestions(list);
    setIndex(0);
    setCorrectCount(0);
    setWrongQuestions([]);
    setScreen("quiz");
  };

  const handleSelectChapter = (chapter: string) => {
    setSelectedChapter(chapter);
    setScreen("mode");
  };

  const handleBackToChapter = () => {
    setSelectedChapter(null);
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
      const exists = prev.some(
        (item) =>
          item.chapter === question.chapter &&
          item.questionNumber === question.questionNumber,
      );

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
    setSelectedChapter(null);
    setCorrectCount(0);
    setIndex(0);
    setWrongQuestions([]);
    setQuestions([]);
  };

  if (data.length === 0)
    return <p className={styles.container}>問題がまだ登録されていません。</p>;

  if (screen === "chapter") {
    return (
      <ChapterSelect
        chapters={chapters}
        onSelectChapter={handleSelectChapter}
      />
    );
  }

  if (screen === "mode") {
    return (
      <ModeSelect
        selectedChapter={selectedChapter!}
        onStartQuiz={startQuiz}
        onBack={handleBackToChapter}
      />
    );
  }

  if (screen === "quiz") {
    const currentQuestion = questions[index];
    return (
      <QuizScreen
        key={
          currentQuestion
            ? `${currentQuestion.chapter}-${currentQuestion.questionNumber}`
            : `quiz-${index}`
        }
        questions={questions}
        index={index}
        onNext={handleNextQuestion}
        onCorrect={handleCorrect}
        onWrong={handleWrong}
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
