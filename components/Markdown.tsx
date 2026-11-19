import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";

// 段落を <span> にして、文中（「正解：」の後ろなど）に並べられるようにする
const inlineComponents: Components = {
  p: ({ children }) => <span>{children}</span>,
};

interface MarkdownProps {
  children: string;
  inline?: boolean; // true なら段落を <p> ではなく <span> で描画する
}

// 問題文・選択肢・解説で共通の Markdown 描画（生の HTML は描画しない）
export default function Markdown({ children, inline = false }: MarkdownProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkBreaks]}
      components={inline ? inlineComponents : undefined}
    >
      {children}
    </ReactMarkdown>
  );
}
