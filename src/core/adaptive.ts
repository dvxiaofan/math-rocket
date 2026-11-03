import type { Level } from '../types'
import { MAX_LEVEL, MIN_LEVEL } from './generator'

export interface Streak { right: number; wrong: number }

export const UP_AFTER = 3
export const DOWN_AFTER = 2

/** 连对 3 升档、连错 2 降档；返回新档位与新连击计数 */
export function nextLevel(level: Level, correct: boolean, s: Streak): { level: Level; streak: Streak } {
  let right = correct ? s.right + 1 : 0
  let wrong = correct ? 0 : s.wrong + 1
  let next = level
  if (right >= UP_AFTER) {
    next = Math.min(MAX_LEVEL, level + 1) as Level
    right = 0
  }
  if (wrong >= DOWN_AFTER) {
    next = Math.max(MIN_LEVEL, level - 1) as Level
    wrong = 0
  }
  return { level: next, streak: { right, wrong } }
}
