export type Level = 1 | 2 | 3 | 4 | 5
export type Op = '+' | '-'
export type Blank = 'result' | 'a' | 'b'
export type Rng = () => number

export interface Question {
  /** 规范化 key，用于一局内去重；a+b 与 b+a 同 key */
  id: string
  a: number
  b: number
  op: Op
  /** 算式的真实结果 */
  result: number
  /** 需要作答的那个数（缺数题时为被挖掉的加数/被减数/减数） */
  answer: number
  blank: Blank
  level: Level
  choices?: number[]
}

export interface Attempt {
  q: Question
  input: number
  correct: boolean
  ms: number
}

export interface QuizResult {
  at: number
  total: number
  correct: number
  ms: number
  bestStreak: number
  levelStart: Level
  levelEnd: Level
  wrong: Attempt[]
}

export type Mode = 'choice' | 'numpad'

export interface Settings {
  count: 10 | 15 | 20
  mode: Mode
  lockLevel: Level | null
  sound: boolean
}
