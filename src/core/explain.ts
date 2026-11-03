import type { Question } from '../types'

/**
 * 讲解数据：把一道题转成"画面指令 + 分步一句话"，由 ExplainPanel 渲染。
 * - dots-add：先摆 x 个再摆 y 个，一起数
 * - dots-sub：摆 x 个，划掉 y 个
 * - ten-add：凑十（x + y，x ≥ y，把 y 拆成 take + rest）
 * - ten-sub：退位（x − y，x > 10，先 10 − y 再加个位）
 */
export type ExplainStep =
  | { type: 'dots-add'; x: number; y: number; answer: number; captions: string[] }
  | { type: 'dots-sub'; x: number; y: number; answer: number; captions: string[] }
  | { type: 'ten-add'; x: number; y: number; take: number; rest: number; answer: number; captions: string[] }
  | { type: 'ten-sub'; x: number; y: number; answer: number; captions: string[] }

/** 把缺数题换算成一道普通加/减法 */
export function normalize(q: Question): { op: '+' | '-'; x: number; y: number; answer: number } {
  if (q.blank === 'result') return { op: q.op, x: q.a, y: q.b, answer: q.result }
  if (q.op === '+') {
    // □ + b = r  或  a + □ = r  →  r − 已知数
    const known = q.blank === 'a' ? q.b : q.a
    return { op: '-', x: q.result, y: known, answer: q.answer }
  }
  if (q.blank === 'a') return { op: '+', x: q.result, y: q.b, answer: q.answer } // □ − b = r → r + b
  return { op: '-', x: q.a, y: q.result, answer: q.answer } // a − □ = r → a − r
}

export function explain(q: Question): ExplainStep {
  const n = normalize(q)
  if (n.op === '+') {
    const [x, y] = n.x >= n.y ? [n.x, n.y] : [n.y, n.x]
    const carry = x < 10 && y < 10 && x + y > 10
    if (carry) {
      const take = 10 - x
      const rest = y - take
      return {
        type: 'ten-add', x, y, take, rest, answer: n.answer,
        captions: [`${x} 和 ${y}`, `从 ${y} 里拿 ${take} 个，和 ${x} 凑成 10`, `10 再加 ${rest}，就是 ${n.answer}`],
      }
    }
    return { type: 'dots-add', x, y, answer: n.answer, captions: [`先摆 ${x} 个，再摆 ${y} 个`, `一起数：${n.answer} 个`] }
  }
  const { x, y } = n
  const borrow = x > 10 && x % 10 < y
  if (borrow) {
    return {
      type: 'ten-sub', x, y, answer: n.answer,
      captions: [`${x} 是 10 和 ${x - 10}`, `先从 10 里划掉 ${y}，剩 ${10 - y}`, `${10 - y} 再加 ${x - 10}，就是 ${n.answer}`],
    }
  }
  return { type: 'dots-sub', x, y, answer: n.answer, captions: [`摆 ${x} 个`, `划掉 ${y} 个，剩 ${n.answer} 个`] }
}
