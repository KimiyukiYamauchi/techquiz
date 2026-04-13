"use client";

import styles from "./Quiz.module.css";

interface ChapterSelectProps {
  chapters: string[];
  onSelectChapter: (chapter: string) => void;
}

export default function ChapterSelect({
  chapters,
  onSelectChapter,
}: ChapterSelectProps) {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>章を選択</h1>
      <div className={styles.grid}>
        {chapters.map((chapter) => (
          <button
            key={chapter}
            className={styles.button}
            onClick={() => onSelectChapter(chapter)}
            title={chapter}
          >
            {chapter}
          </button>
        ))}
      </div>
    </div>
  );
}
