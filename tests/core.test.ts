import { describe, expect, it } from 'vitest'
import { choices, distractors } from '../src/core/distractors'
import { nextLevel } from '../src/core/adaptive'
import { stars } from '../src/core/scoring'
import { generate } from '../src/core/generator'
import type { Level } from '../src/types'

describe('distractors', () => {
  it('三个干扰项互不相同、不等于答案、0..20', () => {
    for (let i = 0; i < 1000; i++) {
      const q = generate(((i % 5) + 1) as Level)
      const d = distractors(q)
      expect(d).toHaveLength(3)
      expect(new Set(d).size).toBe(3)
      for (const n of d) {
        expect(n).not.toBe(q.answer)
        expect(n).toBeGreaterThanOrEqual(0)
        expect(n).toBeLessThanOrEqual(20)
      }
      const c = choices(q)
      expect(c).toHaveLength(4)
      expect(c).toContain(q.answer)
    }
  })
})

describe('adaptive', () => {
  it('连对 3 升档并清零', () => {
    let s = { right: 0, wrong: 0 }
    let l: Level = 2
    for (let i = 0; i < 3; i++) ({ level: l, streak: s } = nextLevel(l, true, s))
    expect(l).toBe(3)
    expect(s.right).toBe(0)
  })
  it('连错 2 降档，封顶 5 保底 1', () => {
    let r = nextLevel(1, false, { right: 0, wrong: 1 })
    expect(r.level).toBe(1)
    r = nextLevel(5, true, { right: 2, wrong: 0 })
    expect(r.level).toBe(5)
  })
  it('一次答错清空连对计数', () => {
    const r = nextLevel(3, false, { right: 2, wrong: 0 })
    expect(r.streak.right).toBe(0)
    expect(r.streak.wrong).toBe(1)
    expect(r.level).toBe(3)
  })
})

describe('stars', () => {
  it('10 题：全对 3 星，错 1–2 题 2 星，错 3 题 1 星', () => {
    expect(stars(10, 10)).toBe(3)
    expect(stars(9, 10)).toBe(2)
    expect(stars(8, 10)).toBe(2)
    expect(stars(7, 10)).toBe(1)
  })
  it('20 题：错 3 题仍 2 星，错 4 题 1 星', () => {
    expect(stars(17, 20)).toBe(2)
    expect(stars(16, 20)).toBe(1)
  })
})
