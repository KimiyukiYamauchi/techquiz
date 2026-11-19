// 配列をランダムに並べ替えた新しい配列を返す（元の配列は変更しない）
// Fisher–Yates シャッフル: どの並び順も同じ確率で出る
// （sort(() => Math.random() - 0.5) は並び順に偏りが出るので使わない）
export function shuffle<T>(items: readonly T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); // 0 〜 i
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
