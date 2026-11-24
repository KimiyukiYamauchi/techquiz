import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  convertCmsQuestions,
  numberWithinChapters,
  toQuizItem,
  type CmsQuestion,
  type ConvertedItem,
} from "@/lib/cmsQuestion";

// microCMS から返ってくる形の問題を作る（selectId は a, b, c… を自動で振る）
const cms = (overrides: Partial<CmsQuestion> = {}): CmsQuestion => ({
  id: "q1",
  chapter: "第1章 ITの概要",
  questionNumber: 1,
  text: "問題文",
  choices: ["選択肢A", "選択肢B", "選択肢C"].map((text, i) => ({
    fieldId: "choice",
    selectId: "abc"[i],
    text,
  })),
  answerId: [{ fieldId: "answerId", answerId: "b" }],
  explanation: "解説",
  ...overrides,
});

// 除外したときに出す警告をテスト中は表示しないようにし、呼ばれたかを確かめられるようにする
let warn: ReturnType<typeof vi.spyOn>;
beforeEach(() => {
  warn = vi.spyOn(console, "warn").mockImplementation(() => {});
});
afterEach(() => {
  warn.mockRestore();
});

describe("toQuizItem: microCMS → QuizItem の変換", () => {
  it("各フィールドを QuizItem の形に変換する", () => {
    expect(toQuizItem(cms())).toEqual({
      item: {
        id: "q1",
        chapter: "第1章 ITの概要",
        question: "問題文",
        choices: [
          { id: "a", text: "選択肢A" },
          { id: "b", text: "選択肢B" },
          { id: "c", text: "選択肢C" },
        ],
        answer: ["b"],
        explanation: "解説",
      },
      number: 1,
    });
    expect(warn).not.toHaveBeenCalled();
  });

  it("本文が同じ選択肢があっても、ID で区別する", () => {
    const result = toQuizItem(
      cms({
        choices: [
          { selectId: "a", text: "同じ" },
          { selectId: "b", text: "同じ" },
        ],
        answerId: [{ answerId: "b" }],
      }),
    );
    expect(result?.item.choices.map((c) => c.id)).toEqual(["a", "b"]);
    expect(result?.item.answer).toEqual(["b"]);
  });
});

describe("toQuizItem: 正解 ID の対応付け", () => {
  it("selectId・answerId の大文字や前後の空白を無視して対応付ける", () => {
    const result = toQuizItem(
      cms({
        choices: [
          { selectId: " A ", text: "選択肢A" },
          { selectId: "B", text: "選択肢B" },
        ],
        answerId: [{ answerId: "b " }],
      }),
    );
    expect(result?.item.choices.map((c) => c.id)).toEqual(["a", "b"]);
    expect(result?.item.answer).toEqual(["b"]);
  });

  it("複数の正解をすべて持つ", () => {
    const result = toQuizItem(
      cms({ answerId: [{ answerId: "a" }, { answerId: "c" }] }),
    );
    expect(result?.item.answer).toEqual(["a", "c"]);
  });

  it("同じ正解が重複して登録されていても 1 つにまとめる", () => {
    const result = toQuizItem(
      cms({ answerId: [{ answerId: "a" }, { answerId: "A" }] }),
    );
    expect(result?.item.answer).toEqual(["a"]);
  });

  it("選択肢にない ID を正解にしている問題は除外し、警告を出す", () => {
    expect(toQuizItem(cms({ answerId: [{ answerId: "z" }] }))).toBeNull();
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining("正解 z が選択肢にない"),
    );
  });

  it("正解が登録されていない問題は除外する", () => {
    expect(toQuizItem(cms({ answerId: [] }))).toBeNull();
    expect(toQuizItem(cms({ answerId: undefined }))).toBeNull();
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining("正解が登録されていない"),
    );
  });

  it("selectId が空の選択肢がある問題は除外する", () => {
    const choices = [
      { selectId: "a", text: "選択肢A" },
      { selectId: " ", text: "選択肢B" },
    ];
    expect(toQuizItem(cms({ choices }))).toBeNull();
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("selectId が空"));
  });

  it("selectId が重複している問題は除外する（大文字・小文字の違いも重複とみなす）", () => {
    const choices = [
      { selectId: "a", text: "選択肢A" },
      { selectId: "A", text: "選択肢B" },
    ];
    expect(
      toQuizItem(cms({ choices, answerId: [{ answerId: "a" }] })),
    ).toBeNull();
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining("selectId が重複"),
    );
  });
});

describe("toQuizItem: 欠損値", () => {
  it("選択肢がない問題は除外する", () => {
    expect(toQuizItem(cms({ choices: [] }))).toBeNull();
    expect(toQuizItem(cms({ choices: undefined }))).toBeNull();
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("選択肢がない"));
  });

  it("chapter・explanation が無いときは空文字にする", () => {
    const result = toQuizItem(
      cms({ chapter: undefined, explanation: undefined }),
    );
    expect(result?.item.chapter).toBe("");
    expect(result?.item.explanation).toBe("");
  });

  it("選択肢の text が無いときは空文字にする", () => {
    const result = toQuizItem(
      cms({
        choices: [
          { selectId: "a", text: undefined as unknown as string },
          { selectId: "b", text: "選択肢B" },
        ],
      }),
    );
    expect(result?.item.choices[0]).toEqual({ id: "a", text: "" });
  });

  it("questionNumber が無い・数値でないときは number を undefined にする", () => {
    expect(toQuizItem(cms({ questionNumber: undefined }))?.number).toBe(
      undefined,
    );
    expect(toQuizItem(cms({ questionNumber: NaN }))?.number).toBeUndefined();
    expect(
      toQuizItem(cms({ questionNumber: "3" as unknown as number }))?.number,
    ).toBeUndefined();
  });
});

// numberWithinChapters に渡す形（変換済み）の問題を作る
const converted = (
  id: string,
  chapter: string,
  number?: number,
): ConvertedItem => ({
  item: {
    id,
    chapter,
    question: "",
    choices: [{ id: "a", text: "A" }],
    answer: ["a"],
    explanation: "",
  },
  number,
});
const summary = (
  items: { id: string; chapter: string; questionNumber: string }[],
) => items.map((q) => `${q.chapter}-${q.questionNumber}(${q.id})`);

describe("numberWithinChapters: 章の並び順", () => {
  it("「第2章」が「第10章」より前になる（文字列順ではなく数値順）", () => {
    const result = numberWithinChapters([
      converted("x", "第10章 応用", 1),
      converted("y", "第2章 基礎", 1),
      converted("z", "第1章 入門", 1),
    ]);
    expect(result.map((q) => q.chapter)).toEqual([
      "第1章 入門",
      "第2章 基礎",
      "第10章 応用",
    ]);
  });

  it("同じ章の中は questionNumber の数値順（「2」が「10」より前）", () => {
    const result = numberWithinChapters([
      converted("q10", "第1章", 10),
      converted("q2", "第1章", 2),
      converted("q1", "第1章", 1),
    ]);
    expect(result.map((q) => q.id)).toEqual(["q1", "q2", "q10"]);
  });

  it("番号の無い問題は章の最後に登録順で並び、章内の最大番号の続きを振る", () => {
    // 登録順（microCMS の createdAt 順）で渡す
    const result = numberWithinChapters([
      converted("x1", "第10章", undefined),
      converted("a1", "第2章", 5),
      converted("a2", "第2章", undefined),
      converted("a3", "第2章", 1),
      converted("a4", "第2章", undefined),
      converted("b1", "第1章", undefined),
      converted("b2", "第1章", undefined),
    ]);
    expect(summary(result)).toEqual([
      "第1章-1(b1)",
      "第1章-2(b2)",
      "第2章-1(a3)",
      "第2章-5(a1)",
      "第2章-6(a2)",
      "第2章-7(a4)",
      "第10章-1(x1)",
    ]);
  });

  it("同じ章の中で番号が重複しない", () => {
    const result = numberWithinChapters([
      converted("a", "第1章", 1),
      converted("b", "第1章", undefined),
      converted("c", "第1章", 2),
      converted("d", "第1章", undefined),
    ]);
    const numbers = result.map((q) => q.questionNumber);
    expect(new Set(numbers).size).toBe(numbers.length);
  });

  it("元の配列は並べ替えない", () => {
    const input = [converted("b", "第2章", 1), converted("a", "第1章", 1)];
    numberWithinChapters(input);
    expect(input.map((c) => c.item.id)).toEqual(["b", "a"]);
  });
});

describe("convertCmsQuestions: 変換と並べ替えをまとめて行う", () => {
  it("入力ミスのある問題を除外し、章 → 番号の順に並べる", () => {
    const result = convertCmsQuestions([
      cms({ id: "c10", chapter: "第10章", questionNumber: 1 }),
      cms({ id: "bad", chapter: "第1章", answerId: [{ answerId: "z" }] }),
      cms({ id: "c2", chapter: "第2章", questionNumber: 1 }),
      cms({ id: "c1-2", chapter: "第1章", questionNumber: 2 }),
      cms({ id: "c1-1", chapter: "第1章", questionNumber: 1 }),
    ]);
    expect(result.map((q) => q.id)).toEqual(["c1-1", "c1-2", "c2", "c10"]);
    expect(warn).toHaveBeenCalledTimes(1);
  });
});
