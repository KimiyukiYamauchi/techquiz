import { describe, expect, it } from "vitest";
import { correctAnswerText, isCorrectAnswer } from "@/lib/grading";
import type { QuizItem } from "@/types/quiz";

const question = (answer: string[]): QuizItem => ({
  id: "q1",
  chapter: "第1章",
  questionNumber: "1",
  question: "問題文",
  choices: [
    { id: "a", text: "選択肢A" },
    { id: "b", text: "選択肢B" },
    { id: "c", text: "選択肢C" },
    { id: "d", text: "選択肢D" },
  ],
  answer,
  explanation: "解説",
});

describe("isCorrectAnswer: 択一問題", () => {
  const q = question(["b"]);

  it("正解の選択肢を選ぶと正解", () => {
    expect(isCorrectAnswer(q, ["b"])).toBe(true);
  });

  it("ほかの選択肢を選ぶと不正解", () => {
    expect(isCorrectAnswer(q, ["a"])).toBe(false);
  });

  it("何も選んでいなければ不正解", () => {
    expect(isCorrectAnswer(q, [])).toBe(false);
  });
});

describe("isCorrectAnswer: 複数選択問題", () => {
  const q = question(["a", "c"]);

  it("正解をすべて選ぶと正解", () => {
    expect(isCorrectAnswer(q, ["a", "c"])).toBe(true);
  });

  it("選んだ順番が違っても正解（順不同）", () => {
    expect(isCorrectAnswer(q, ["c", "a"])).toBe(true);
  });

  it("正解の一部だけでは不正解", () => {
    expect(isCorrectAnswer(q, ["a"])).toBe(false);
  });

  it("正解に余分な選択肢が混ざると不正解", () => {
    expect(isCorrectAnswer(q, ["a", "b", "c"])).toBe(false);
  });

  it("同じ選択肢が重複して渡されても、選んだ選択肢の集合で判定する", () => {
    expect(isCorrectAnswer(q, ["a", "c", "a"])).toBe(true);
  });

  it("何も選んでいなければ不正解", () => {
    expect(isCorrectAnswer(q, [])).toBe(false);
  });
});

describe("correctAnswerText", () => {
  it("択一問題は正解の選択肢の本文", () => {
    expect(correctAnswerText(question(["b"]))).toBe("選択肢B");
  });

  it("複数正解は選択肢の並び順で「 / 」につなぐ", () => {
    expect(correctAnswerText(question(["c", "a"]))).toBe("選択肢A / 選択肢C");
  });
});
