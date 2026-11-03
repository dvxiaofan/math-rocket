import { describe, expect, it } from 'vitest'
import { generate, generateSet, pool, formula } from '../src/core/generator'
import type { Level } from '../src/types'

function seeded(seed: number) {
  let s = seed
  return () => ((s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296)
}

describe('pool 规则', () => {
  it('L1 只有加法且和 ≤ 10', () => {
    for (const c of pool(1)) {
      expect(c.op).toBe('+')
      expect(c.a + c.b).toBeLessThanOrEqual(10)
      expect(c.a).toBeGreaterThan(0)
      expect(c.b).toBeGreaterThan(0)
    }
  })
  it('L2 只有减法且结果 > 0、被减数 ≤ 10', () => {
    for (const c of pool(2)) {
      expect(c.op).toBe('-')
      expect(c.a).toBeLessThanOrEqual(10)
      expect(c.a - c.b).toBeGreaterThan(0)
    }
  })
  it('L4 加法不进位、减法不退位，范围 20 以内', () => {
    for (const c of pool(4)) {
      if (c.op === '+') {
        expect(c.a + c.b).toBeLessThanOrEqual(20)
        expect(c.a + c.b).toBeGreaterThan(10)
        expect((c.a % 10) + (c.b % 10)).toBeLessThanOrEqual(9)
      } else {
        expect(c.a).toBeGreaterThan(10)
        expect(c.a % 10).toBeGreaterThanOrEqual(c.b % 10)
        expect(c.a - c.b).toBeGreaterThan(0)
      }
    }
  })
  it('L5 加法必进位、减法必退位', () => {
    for (const c of pool(5)) {
      if (c.op === '+') {
        expect(c.a + c.b).toBeGreaterThanOrEqual(10)
        expect(c.a + c.b).toBeLessThanOrEqual(20)
        expect((c.a % 10) + (c.b % 10)).toBeGreaterThanOrEqual(10)
      } else {
        expect(c.a % 10).toBeLessThan(c.b)
        expect(c.a - c.b).toBeGreaterThan(0)
      }
    }
  })
  it('每档候选足够一局 20 题', () => {
    for (const l of [1, 2, 3, 4, 5] as Level[]) expect(pool(l).length).toBeGreaterThanOrEqual(20)
  })
})

describe('generate', () => {
  it('不出 ±0、不出 a−a、不出负数', () => {
    const rng = seeded(7)
    for (let i = 0; i < 2000; i++) {
      const l = ((i % 5) + 1) as Level
      const q = generate(l, new Set(), rng)
      expect(q.a).toBeGreaterThan(0)
      expect(q.b).toBeGreaterThan(0)
      expect(q.result).toBeGreaterThanOrEqual(0)
      if (q.op === '-') expect(q.a).not.toBe(q.b)
      expect(q.answer).toBeGreaterThanOrEqual(0)
      expect(q.answer).toBeLessThanOrEqual(20)
    }
  })
  it('一局内不重复，a+b 与 b+a 视为同题', () => {
    for (let seed = 1; seed <= 20; seed++) {
      const qs = generateSet(3, 20, seeded(seed))
      const ids = new Set(qs.map((q) => q.id))
      expect(ids.size).toBe(20)
    }
  })
  it('L1/L2 不出缺数题，L3+ 缺数题占比约 10%', () => {
    const rng = seeded(42)
    let blanks = 0
    for (let i = 0; i < 1000; i++) {
      expect(generate(1, new Set(), rng).blank).toBe('result')
      expect(generate(2, new Set(), rng).blank).toBe('result')
      if (generate(5, new Set(), rng).blank !== 'result') blanks++
    }
    expect(blanks).toBeGreaterThan(50)
    expect(blanks).toBeLessThan(160)
  })
  it('缺数题 answer 对应被挖掉的数', () => {
    const rng = seeded(3)
    for (let i = 0; i < 500; i++) {
      const q = generate(4, new Set(), rng)
      if (q.blank === 'a') expect(q.answer).toBe(q.a)
      if (q.blank === 'b') expect(q.answer).toBe(q.b)
      if (q.blank === 'result') expect(q.answer).toBe(q.result)
    }
  })
  it('formula 用 □ 标出空位', () => {
    expect(formula({ id: '3+4', a: 3, b: 4, op: '+', result: 7, answer: 7, blank: 'result', level: 1 })).toBe('3 + 4 = □')
    expect(formula({ id: '3+4', a: 3, b: 4, op: '+', result: 7, answer: 3, blank: 'a', level: 3 })).toBe('□ + 4 = 7')
  })
})
