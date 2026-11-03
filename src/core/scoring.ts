/** 全对 3 星；错题数 ≤ max(2, 15%) 给 2 星；否则 1 星 */
export function stars(correct: number, total: number): 1 | 2 | 3 {
  if (total > 0 && correct === total) return 3
  const wrong = total - correct
  if (wrong <= Math.max(2, Math.round(total * 0.15))) return 2
  return 1
}

export function fmtDuration(ms: number): string {
  const s = Math.round(ms / 1000)
  const m = Math.floor(s / 60)
  return m > 0 ? `${m}分${s % 60}秒` : `${s}秒`
}
