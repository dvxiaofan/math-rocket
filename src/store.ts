import { reactive, watch } from 'vue'
import type { Level, QuizResult, Settings } from './types'

export type View = 'home' | 'quiz' | 'result' | 'settings' | 'history' | 'print'

const K_SETTINGS = 'mr.settings'
const K_HISTORY = 'mr.history'
const K_LEVEL = 'mr.level'
const HISTORY_MAX = 30

const defaultSettings: Settings = { count: 10, mode: 'choice', lockLevel: null, sound: true }

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}
function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* 隐私模式等情况忽略 */
  }
}

export const store = reactive({
  view: 'home' as View,
  settings: { ...defaultSettings, ...read<Partial<Settings>>(K_SETTINGS, {}) } as Settings,
  history: read<QuizResult[]>(K_HISTORY, []),
  level: read<Level>(K_LEVEL, 1),
  last: null as QuizResult | null,
})

watch(() => store.settings, (v) => write(K_SETTINGS, v), { deep: true })
watch(() => store.history, (v) => write(K_HISTORY, v), { deep: true })
watch(() => store.level, (v) => write(K_LEVEL, v))

export function go(view: View) {
  store.view = view
}

/** 本局开局档位：锁档优先，否则用上次推荐档 */
export function startLevel(): Level {
  return store.settings.lockLevel ?? store.level
}

export function recordResult(r: QuizResult) {
  store.history.unshift(r)
  if (store.history.length > HISTORY_MAX) store.history.length = HISTORY_MAX
  store.last = r
  if (store.settings.lockLevel === null) store.level = r.levelEnd
}
