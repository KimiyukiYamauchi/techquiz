"use client";

import { useEffect, useMemo, useState } from "react";
import type { QuizItem } from "@/types/quiz";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import styles from "./Quiz.module.css";

type Screen = "chapter" | "mode" | "quiz" | "result";
type Mode = "sequential" | "random";

export default function Quiz() {
  const [data, setData] = useState<QuizItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [screen, setScreen] = useState<Screen>("chapter");
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode | null>(null);

  const [questions, setQuestions] = useState<QuizItem[]>([]);
  const [index, setIndex] = useState(0);

  const [selected, setSelected] = useState<string[]>([]);
  const [isAnswered, setIsAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/quiz2.json");
        if (!res.ok) throw new Error("Failed to load quiz2.json");
        const json = (await res.json()) as QuizItem[];
        setData(json);
      } catch (e) {
        console.error(e);
        alert("クイズデータの取得に失敗しました");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const chapters = useMemo(() => {
    return Array.from(new Set(data.map((item) => item.chapter)));
  }, [data]);

  const startQuiz = (m: Mode) => {
    if (!selectedChapter) return;

    const filtered = data.filter((q) => q.chapter === selectedChapter);

    let list = filtered;
    if (m === "random") {
      list = [...filtered].sort(() => Math.random() - 0.5);
    }

    setMode(m);
    setQuestions(list);
    setIndex(0);
    setScreen("quiz");
  };

  if (loading) return <p className={styles.container}>Loading...</p>;

  // --- 章選択 ---
  if (screen === "chapter") {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>章を選択</h1>
        <div className={styles.grid}>
          {chapters.map((chapter) => (
            <button
              key={chapter}
              className={styles.button}
              onClick={() => {
                setSelectedChapter(chapter);
                setScreen("mode");
              }}
            >
              {chapter}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // --- モード選択 ---
  if (screen === "mode") {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>モード選択</h1>
        <p className={styles.subtitle}>章: {selectedChapter}</p>

        <div className={styles.row}>
          <button
            className={styles.button}
            onClick={() => startQuiz("sequential")}
          >
            順番に出題
          </button>

          <button className={styles.button} onClick={() => startQuiz("random")}>
            ランダムに出題
          </button>
        </div>

        <button
          className={styles.linkButton}
          onClick={() => {
            setSelectedChapter(null);
            setScreen("chapter");
          }}
        >
          ← 章選択に戻る
        </button>
      </div>
    );
  }

  // --- クイズ画面（今は「表示だけ」） ---
  // --- クイズ画面 ---
  if (screen === "quiz") {
    const q = questions[index];
    if (!q) return null;

    const isSingleAnswer = q.answer.length === 1;

    // 並び順の違いを無視して一致判定する
    const normalize = (arr: string[]) => [...arr].sort();

    const isCorrect = isSingleAnswer
      ? selected[0] === (q.answer[0] ?? "")
      : normalize(selected).join("|") === normalize(q.answer).join("|");

    const handleAnswer = () => {
    if (selected.length === 0) return;

    setIsAnswered(true);

    if (isCorrect) {
      setCorrectCount((c) => c + 1);
    }
  };

    const handleChoiceClick = (choice: string) => {
      if (isAnswered) return;

      if (isSingleAnswer) {
        // 択一問題はクリックした瞬間に採点
        setSelected([choice]);
        setIsAnswered(true);

        if (choice === (q.answer[0] ?? "")) {
          setCorrectCount((c) => c + 1);
        }
      } else {
        // 複数選択問題は従来通りトグル
        setSelected((prev) => {
          if (prev.includes(choice)) {
            return prev.filter((c) => c !== choice);
          }
          return [...prev, choice];
        });
      }
    };

    const handleNext = () => {
      setSelected([]);
      setIsAnswered(false);

      if (index + 1 < questions.length) {
        setIndex(index + 1);
      } else {
        setScreen("result");
      }
    };

    return (
      <div className={styles.container}>
        <div className={styles.topBar}>
          <span>
            {index + 1} / {questions.length}
          </span>
        </div>

        <div className={styles.question}>
          <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
            {q.question}
          </ReactMarkdown>
        </div>

        {!isSingleAnswer && (
          <p className={styles.hint}>※ 複数選択可（クリックで選択/解除）</p>
        )}

        <ul className={styles.choiceList}>
          {q.choices.map((c) => {
            const isSelected = selected.includes(c);

            const isAnswerChoice = q.answer.includes(c);
            const isWrongSelected = isAnswered && isSelected && !isAnswerChoice;

            const className = [
              styles.choiceItem,
              !isAnswered && isSelected ? styles.selected : "",
              isAnswered ? styles.disabled : "",
              isAnswered && isAnswerChoice ? styles.correctChoice : "",
              isWrongSelected ? styles.wrongChoice : "",
            ]
              .filter(Boolean)
              .join(" ");

            return (
              <li
                key={c}
                className={className}
                onClick={() => handleChoiceClick(c)}
              >
                {c}
              </li>
            );
          })}
        </ul>

        {!isSingleAnswer && !isAnswered && (
          <button
            className={styles.button}
            onClick={handleAnswer}
            disabled={selected.length === 0}
          >
            回答する
          </button>
        )}

        {isAnswered && (
          <>
            <p className={isCorrect ? styles.correct : styles.wrong}>
              {isCorrect ? "正解！" : "不正解"}
            </p>

            <p className={styles.answerLine}>正解：{q.answer.join(" / ")}</p>

            <div className={styles.explanation}>
              <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                {q.explanation}
              </ReactMarkdown>
            </div>

            <button className={styles.button} onClick={handleNext}>
              次へ
            </button>
          </>
        )}
      </div>
    );
  }

  // --- 結果画面 ---
  if (screen === "result") {
    return (
      <div className={styles.container}>
        <h1>結果</h1>
        <p>
          正解数: {correctCount} / {questions.length}
        </p>

        <button
          className={styles.button}
          onClick={() => {
            setScreen("chapter");
            setCorrectCount(0);
            setSelected([]);
            setIndex(0);
          }}
        >
          もう一度最初から
        </button>
      </div>
    );
  }
}
