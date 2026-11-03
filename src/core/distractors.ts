import type { Question, Rng } from '../types'

export function shuffle<T>(arr: T[], rng: Rng = Math.random): T[] {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function swapDigits(n: number): number {
  if (n < 10) return n
  return (n % 10) * 10 + Math.floor(n / 10)
}

/** 三个干扰项：非负、≤20、不等于答案、互不相同 */
export function distractors(q: Question, rng: Rng = Math.random): number[] {
  const ans = q.answer
  const pool = new Set<number>()
  const push = (n: number) => {
    if (Number.isInteger(n) && n >= 0 && n <= 20 && n !== ans) pool.add(n)
  }
  ;[ans + 1, ans - 1, ans + 2, ans - 2, q.a + q.b, q.a - q.b, Math.abs(q.a - q.b), swapDigits(ans)].forEach(push)
  for (let d = 3; pool.size < 3 && d < 20; d++) {
    push(ans + d)
    push(ans - d)
  }
  return shuffle([...pool], rng).slice(0, 3)
}

/** 带正确答案的四个选项，已打乱 */
export function choices(q: Question, rng: Rng = Math.random): number[] {
  return shuffle([q.answer, ...distractors(q, rng)], rng)
}
