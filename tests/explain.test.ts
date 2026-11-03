import { describe, expect, it } from 'vitest'
import { explain, normalize } from '../src/core/explain'
import type { Question } from '../src/types'

const mk = (p: Partial<Question>): Question =>
  ({ id: 'x', a: 1, b: 1, op: '+', result: 2, answer: 2, blank: 'result', level: 1, ...p }) as Question

describe('normalize 缺数题', () => {
  it('□ + 4 = 7 → 7 − 4', () => {
    expect(normalize(mk({ a: 3, b: 4, op: '+', result: 7, answer: 3, blank: 'a' }))).toEqual({ op: '-', x: 7, y: 4, answer: 3 })
  })
  it('□ − 4 = 5 → 5 + 4', () => {
    expect(normalize(mk({ a: 9, b: 4, op: '-', result: 5, answer: 9, blank: 'a' }))).toEqual({ op: '+', x: 5, y: 4, answer: 9 })
  })
  it('9 − □ = 4 → 9 − 4', () => {
    expect(normalize(mk({ a: 9, b: 5, op: '-', result: 4, answer: 5, blank: 'b' }))).toEqual({ op: '-', x: 9, y: 4, answer: 5 })
  })
})

describe('explain 类型选择', () => {
  it('不进位加法用摆点', () => {
    expect(explain(mk({ a: 3, b: 4, result: 7, answer: 7 })).type).toBe('dots-add')
    expect(explain(mk({ a: 12, b: 5, result: 17, answer: 17 })).type).toBe('dots-add')
  })
  it('进位加法用凑十，大数在前', () => {
    const s = explain(mk({ a: 5, b: 7, result: 12, answer: 12 }))
    expect(s.type).toBe('ten-add')
    if (s.type === 'ten-add') {
      expect(s.x).toBe(7)
      expect(s.take).toBe(3)
      expect(s.rest).toBe(2)
    }
  })
  it('退位减法用十格框', () => {
    expect(explain(mk({ a: 15, b: 9, op: '-', result: 6, answer: 6 })).type).toBe('ten-sub')
    expect(explain(mk({ a: 17, b: 4, op: '-', result: 13, answer: 13 })).type).toBe('dots-sub')
    expect(explain(mk({ a: 8, b: 5, op: '-', result: 3, answer: 3 })).type).toBe('dots-sub')
  })
  it('每种都有至少两句讲解且最后答案一致', () => {
    for (const q of [
      mk({ a: 3, b: 4, result: 7, answer: 7 }),
      mk({ a: 6, b: 8, result: 14, answer: 14 }),
      mk({ a: 9, b: 3, op: '-', result: 6, answer: 6 }),
      mk({ a: 13, b: 7, op: '-', result: 6, answer: 6 }),
    ]) {
      const s = explain(q)
      expect(s.captions.length).toBeGreaterThanOrEqual(2)
      expect(s.answer).toBe(q.answer)
    }
  })
})
