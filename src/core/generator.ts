import type { Blank, Level, Op, Question, Rng } from '../types'

interface Base { a: number; b: number; op: Op }

export const MAX_LEVEL: Level = 5
export const MIN_LEVEL: Level = 1

/** 枚举某档位全部合法算式（20 以内穷举，几百条，不会死循环） */
export function pool(level: Level): Base[] {
  const out: Base[] = []
  const add = (a: number, b: number) => out.push({ a, b, op: '+' })
  const sub = (a: number, b: number) => out.push({ a, b, op: '-' })

  if (level === 1 || level === 3) {
    for (let a = 1; a <= 9; a++) for (let b = a; b <= 9; b++) if (a + b <= 10) add(a, b)
  }
  if (level === 2 || level === 3) {
    for (let a = 2; a <= 10; a++) for (let b = 1; b < a; b++) sub(a, b)
  }
  if (level === 4) {
    for (let a = 1; a <= 19; a++)
      for (let b = a; b <= 19; b++)
        if (a + b <= 20 && a + b > 10 && (a % 10) + (b % 10) <= 9) add(a, b)
    for (let a = 11; a <= 20; a++)
      for (let b = 1; b <= 9; b++)
        if (b < a && a % 10 >= b % 10) sub(a, b)
  }
  if (level === 5) {
    for (let a = 2; a <= 9; a++) for (let b = a; b <= 9; b++) if (a + b >= 10) add(a, b)
    for (let a = 11; a <= 18; a++) for (let b = 2; b <= 9; b++) if (a % 10 < b) sub(a, b)
  }
  return out
}

export function keyOf(c: Base): string {
  if (c.op === '+') {
    const [x, y] = c.a <= c.b ? [c.a, c.b] : [c.b, c.a]
    return `${x}+${y}`
  }
  return `${c.a}-${c.b}`
}

const BLANK_RATE = 0.1

/**
 * 生成一题。exclude 为本局已出现的 id 集合；耗尽时放开去重兜底。
 * rng 可注入，便于测试。
 */
export function generate(level: Level, exclude: Set<string> = new Set(), rng: Rng = Math.random): Question {
  const all = pool(level)
  let cands = all.filter((c) => !exclude.has(keyOf(c)))
  if (cands.length === 0) cands = all
  const picked = cands[Math.floor(rng() * cands.length)]
  // 加法随机交换顺序，避免永远小数在前
  const swap = picked.op === '+' && rng() < 0.5
  const a = swap ? picked.b : picked.a
  const b = swap ? picked.a : picked.b
  const result = picked.op === '+' ? a + b : a - b

  let blank: Blank = 'result'
  let answer = result
  if (level >= 3 && rng() < BLANK_RATE) {
    blank = rng() < 0.5 ? 'a' : 'b'
    answer = blank === 'a' ? a : b
  }
  return { id: keyOf(picked), a, b, op: picked.op, result, answer, blank, level }
}

/** 固定档位生成 n 题（打印版用），尽量不重复 */
export function generateSet(level: Level, n: number, rng: Rng = Math.random): Question[] {
  const used = new Set<string>()
  const out: Question[] = []
  for (let i = 0; i < n; i++) {
    const q = generate(level, used, rng)
    used.add(q.id)
    out.push(q)
  }
  return out
}

/** 题面文本，□ 表示空位 */
export function formula(q: Question): string {
  const A = q.blank === 'a' ? '□' : String(q.a)
  const B = q.blank === 'b' ? '□' : String(q.b)
  const R = q.blank === 'result' ? '□' : String(q.result)
  return `${A} ${q.op} ${B} = ${R}`
}
