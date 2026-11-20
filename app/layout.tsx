import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tech+問題集",
  description:
    "Tech+の問題を章ごとに演習できるクイズサイト。択一・複数選択問題に対応し、解説付きで効率よく学習できます。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
