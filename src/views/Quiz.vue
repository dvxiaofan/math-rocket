<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import type { Attempt, Level, Question, QuizResult } from '@/types'
import { generate } from '@/core/generator'
import { choices } from '@/core/distractors'
import { nextLevel, type Streak } from '@/core/adaptive'
import { go, recordResult, startLevel, store } from '@/store'
import { sfx } from '@/audio/sfx'
import RaceTrack from '@/components/RaceTrack.vue'
import Mascot from '@/components/Mascot.vue'
import QuestionCard from '@/components/QuestionCard.vue'
import ChoicePad from '@/components/ChoicePad.vue'
import NumPad from '@/components/NumPad.vue'
import ExplainPanel from '@/components/ExplainPanel.vue'

type Status = 'asking' | 'ok' | 'bad'
const PRAISE = ['太棒了！', '真厉害！', '冲啊！', '漂亮！', '完美过弯！']

const total = store.settings.count
const mode = store.settings.mode
const locked = store.settings.lockLevel !== null
const levelStart = startLevel()

const level = ref<Level>(levelStart)
const streak = ref<Streak>({ right: 0, wrong: 0 })
const used = new Set<string>()
const attempts: Attempt[] = []
const idx = ref(0)
const input = ref('')
const picked = ref<number | null>(null)
const status = ref<Status>('asking')
const curStreak = ref(0)
const praise = ref('')
const showExplain = ref(false)
let bestStreak = 0
const startedAt = Date.now()
let qStart = Date.now()
let timer: ReturnType<typeof setTimeout> | undefined

function make(): Question {
  const nq = generate(level.value, used)
  used.add(nq.id)
  if (mode === 'choice') nq.choices = choices(nq)
  return nq
}
const q = ref<Question>(make())

const mood = computed(() => (status.value === 'ok' ? 'happy' : status.value === 'bad' ? 'oops' : 'idle'))
const done = computed(() => idx.value + (status.value === 'asking' ? 0 : 1))

function submit(val: number) {
  if (status.value !== 'asking') return
  const correct = val === q.value.answer
  attempts.push({ q: q.value, input: val, correct, ms: Date.now() - qStart })
  if (correct) {
    curStreak.value++
    bestStreak = Math.max(bestStreak, curStreak.value)
    praise.value = PRAISE[Math.floor(Math.random() * PRAISE.length)]
    status.value = 'ok'
    sfx.ok()
  } else {
    curStreak.value = 0
    status.value = 'bad'
    sfx.bad()
  }
  if (!locked) {
    const r = nextLevel(level.value, correct, streak.value)
    if (r.level > level.value) sfx.levelUp()
    level.value = r.level
    streak.value = r.streak
  }
  if (correct) timer = setTimeout(next, 750)
}

function next() {
  if (idx.value + 1 >= total) return finish()
  idx.value++
  q.value = make()
  input.value = ''
  picked.value = null
  status.value = 'asking'
  qStart = Date.now()
}

function finish() {
  const correct = attempts.filter((a) => a.correct).length
  const r: QuizResult = {
    at: Date.now(), total, correct, ms: Date.now() - startedAt, bestStreak,
    levelStart, levelEnd: level.value, wrong: attempts.filter((a) => !a.correct),
  }
  recordResult(r)
  sfx.win()
  go('result')
}

function onDigit(d: string) {
  if (status.value !== 'asking' || input.value.length >= 2) return
  input.value += d
  sfx.tap()
}
function onDel() {
  input.value = input.value.slice(0, -1)
  sfx.tap()
}
function onOk() {
  if (input.value !== '') submit(Number(input.value))
}
function onPick(n: number) {
  picked.value = n
  submit(n)
}

onBeforeUnmount(() => clearTimeout(timer))
</script>

<template>
  <div class="quiz">
    <header class="top">
      <button class="quit" aria-label="退出" @click="go('home')">✕</button>
      <RaceTrack :total="total" :done="done" :streak="curStreak" />
    </header>

    <section class="stage">
      <div class="mascot-box"><Mascot :mood="mood" /></div>
      <QuestionCard :q="q" :input="input" :status="status" />
      <p class="hint" :class="status">
        <template v-if="status === 'ok'">{{ praise }}</template>
        <template v-else-if="status === 'bad'">再想想，答案是 {{ q.answer }}</template>
        <template v-else>&nbsp;</template>
      </p>
    </section>

    <section class="pad">
      <ChoicePad v-if="mode === 'choice'" :choices="q.choices ?? []" :answer="q.answer" :picked="picked" :status="status" @pick="onPick" />
      <NumPad v-else :disabled="status !== 'asking'" @digit="onDigit" @del="onDel" @ok="onOk" />
      <transition name="rise">
        <div v-if="status === 'bad'" class="continue">
          <button class="btn ghost" @click="showExplain = true">💡 看看怎么算</button>
          <button class="btn orange" @click="next">继续 ▶</button>
        </div>
      </transition>
    </section>

    <ExplainPanel v-if="showExplain" :q="q" @close="showExplain = false; next()" />
  </div>
</template>

<style scoped>
.quiz {
  height: 100dvh; display: grid; gap: 12px; padding: 12px 16px;
  grid-template-rows: auto minmax(0, 1fr) minmax(0, 46dvh);
}
.top { display: flex; align-items: center; gap: 12px; }
.quit { width: 44px; height: 44px; border-radius: 50%; background: #fff; color: var(--c-muted); font-size: 20px; font-weight: 800; box-shadow: 0 3px 0 rgba(30,42,58,.1); flex-shrink: 0; }
.stage { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; min-height: 0; }
.mascot-box { width: min(34vmin, 200px); flex-shrink: 1; min-height: 0; }
.hint { margin: 0; min-height: 1.4em; font-size: var(--fs-big); font-weight: 800; color: var(--c-muted); }
.hint.ok { color: var(--c-ok); }
.hint.bad { color: var(--c-bad); }
.pad { position: relative; display: flex; flex-direction: column; min-height: 0; }
.continue { position: absolute; inset: 0; display: flex; flex-wrap: wrap; gap: 12px; align-items: center; justify-content: center; background: rgba(244,247,251,.85); border-radius: var(--radius); }
.rise-enter-active { transition: opacity .2s, transform .2s; }
.rise-enter-from { opacity: 0; transform: translateY(12px); }

@media (min-width: 900px) and (orientation: landscape) {
  .quiz { grid-template-columns: 1fr 1fr; grid-template-rows: auto minmax(0, 1fr); padding: 16px 28px; gap: 16px 32px; }
  .top { grid-column: 1 / -1; }
  .mascot-box { width: min(40vmin, 260px); }
}
@media (max-height: 460px) and (orientation: landscape) {
  .quiz { grid-template-columns: 1fr 1fr; grid-template-rows: auto minmax(0, 1fr); }
  .top { grid-column: 1 / -1; }
  .mascot-box { width: 18vmin; }
}
</style>
