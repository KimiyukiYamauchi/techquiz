#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# JSON 形式の問題（README の「クイズデータ形式」）を microCMS の CSV インポート用ファイルに変換する
#   python3 scripts/json_to_microcms_csv.py <input_json> exports/techquiz-questions.csv [テンプレートCSV]
#
# テンプレートCSV（管理画面の「CSVインポート」でダウンロードしたもの）を渡すと、
# その見出し行と同じ列・同じ順番で出力する（API に無いフィールドの列は出さない）
#
# 入力（1 問）:
#   {"chapter": "...", "questionNumber": 1, "question": "...",
#    "choices": ["A", "B", ...], "answer": ["B"], "explanation": "..."}
# 出力の列: コンテンツID, chapter, questionNumber, text, choices, answerId, explanation
#   choices  : [{"fieldId":"choice","selectId":"a","text":"A"}, ...]
#   answerId : [{"fieldId":"answerId","answerId":"b"}, ...]

import csv
import json
import sys
from pathlib import Path

CHOICE_CUSTOM_FIELD_ID = "choice"  # 選択肢（繰り返し）の中のカスタムフィールドID
ANSWER_CUSTOM_FIELD_ID = "answerId"  # 正解（繰り返し）の中のカスタムフィールドID
LETTERS = "abcdefghijklmnopqrstuvwxyz"

HEADERS = [
    "コンテンツID※空欄で構いません。特定の値を設定したい場合に入力してください。",
    "chapter",
    "questionNumber",
    "text",
    "choices",
    "answerId",
    "explanation",
]


def convert(rec: dict, pos: int) -> dict:
    label = f"#{pos} ({rec.get('chapter', '')} - {rec.get('questionNumber', '')})"
    choices = [str(c) for c in rec.get("choices", [])]
    if len(choices) > len(LETTERS):
        raise ValueError(f"{label}: 選択肢が多すぎます")

    letters = []
    for ans in rec.get("answer", []):
        if ans not in choices:
            raise ValueError(f"{label}: 正解「{ans}」が選択肢にありません")
        letter = LETTERS[choices.index(ans)]
        if letter not in letters:
            letters.append(letter)
    if not letters:
        raise ValueError(f"{label}: 正解がありません")

    choices_cell = [
        {"fieldId": CHOICE_CUSTOM_FIELD_ID, "selectId": LETTERS[i], "text": t}
        for i, t in enumerate(choices)
    ]
    answers_cell = [{"fieldId": ANSWER_CUSTOM_FIELD_ID, "answerId": a} for a in letters]

    return {
        "chapter": rec.get("chapter", ""),
        "questionNumber": rec.get("questionNumber", ""),
        "text": rec.get("question", ""),
        "choices": json.dumps(choices_cell, ensure_ascii=False),
        "answerId": json.dumps(answers_cell, ensure_ascii=False),
        "explanation": rec.get("explanation", ""),
    }


def read_template_headers(path: Path) -> list:
    with path.open(encoding="utf-8-sig", newline="") as f:
        headers = next(csv.reader(f))
    unknown = [h for h in headers[1:] if h not in HEADERS]
    if unknown:
        raise ValueError(f"変換方法が分からない列があります: {unknown}")
    return headers


def main() -> None:
    if len(sys.argv) < 3:
        print(
            "Usage: python3 scripts/json_to_microcms_csv.py <input_json> <output_csv> [template_csv]"
        )
        sys.exit(1)

    in_path, out_path = Path(sys.argv[1]), Path(sys.argv[2])
    headers = read_template_headers(Path(sys.argv[3])) if len(sys.argv) > 3 else HEADERS
    skipped = [h for h in HEADERS[1:] if h not in headers]
    if skipped:
        print(f"⚠️  テンプレートに無いため出力しない列: {skipped}")

    records = json.loads(in_path.read_text(encoding="utf-8"))
    # 1 列目（コンテンツID）は空欄にして自動採番させる
    rows = [
        [""] + [values[h] for h in headers[1:]]
        for values in (convert(rec, i + 1) for i, rec in enumerate(records))
    ]

    out_path.parent.mkdir(parents=True, exist_ok=True)
    with out_path.open("w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f, quoting=csv.QUOTE_MINIMAL)
        writer.writerow(headers)
        writer.writerows(rows)

    print(f"✅ Wrote {len(rows)} rows: {out_path}")


if __name__ == "__main__":
    main()
