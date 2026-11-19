// Markdown の文章から、一覧に出す短いプレーンテキストを作る
// （コードブロックは「[コード]」に置き換え、記号を取り除いて先頭 maxLength 文字に切る）
export function markdownExcerpt(markdown: string, maxLength = 60): string {
  const plain = markdown
    .replace(/```[\s\S]*?(```|$)/g, " [コード] ") // コードブロック
    .replace(/<[^>]+>/g, " ") // HTML タグ
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ") // 画像
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1") // リンク → リンクの文字
    .replace(/`([^`]*)`/g, "$1") // インラインコード
    .replace(/^\s{0,3}#{1,6}\s+/gm, "") // 見出し
    .replace(/^\s{0,3}>\s?/gm, "") // 引用
    .replace(/^\s*([-*+]|\d+\.)\s+/gm, "") // 箇条書き
    .replace(/^\s*\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)*\|?\s*$/gm, " ") // 表の区切り行（|---|:-:| など）
    .replace(/\|/g, " ") // 表の縦線
    // 強調・打ち消し（user_name のような識別子を壊さないよう _ は対象にしない）
    .replace(/(\*\*|\*|~~)(?=\S)([^\n]*?\S)\1/g, "$2")
    .replace(/\s+/g, " ")
    .trim();

  const chars = Array.from(plain); // 絵文字などを途中で切らないよう文字単位で数える
  return chars.length > maxLength
    ? `${chars.slice(0, maxLength).join("")}…`
    : plain;
}
