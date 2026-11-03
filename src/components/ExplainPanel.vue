<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import type { Question } from '@/types'
import { explain } from '@/core/explain'
import { formula } from '@/core/generator'

const props = defineProps<{ q: Question }>()
const emit = defineEmits<{ close: [] }>()

/** 三步：0 摆出来 → 1 动作（再摆 / 划掉 / 凑十 / 退位）→ 2 数一数得答案 */
const LAST = 2
const AUTO_MS = 2200

const step = computed(() => explain(props.q))
const phase = ref(0)
const timers: ReturnType<typeof setTimeout>[] = []

function clearTimers() {
  timers.forEach(clearTimeout)
  timers.length = 0
}
function play() {
  clearTimers()
  phase.value = 0
  for (let i = 1; i <= LAST; i++) timers.push(setTimeout(() => (phase.value = i), AUTO_MS * i))
}
/** 点「下一步」后改为手动节奏，不再自动推进 */
function next() {
  if (phase.value >= LAST) return
  clearTimers()
  phase.value++
}
onMounted(play)
onBeforeUnmount(clearTimers)

const caption = computed(() => step.value.captions[Math.min(phase.value, step.value.captions.length - 1)])
const title = computed(() => formula(props.q).replace('□', String(props.q.answer)).replace(' - ', ' − '))

const total = computed(() => {
  const s = step.value
  return s.type === 'dots-add' ? s.x + s.y : s.type === 'dots-sub' ? s.x : 0
})

/** 摆点区每个点的状态与出现/动作延时 */
function dot(i: number): { cls: string[]; style: Record<string, string> } {
  const s = step.value
  const p = phase.value
  if (s.type === 'dots-add') {
    const second = i > s.x
    const order = second ? i - s.x - 1 : i - 1
    return {
      cls: [second ? 'orange' : 'blue', second && p < 1 ? 'hidden' : '', p >= 2 ? 'counting' : ''],
      style: { '--d': `${order * 140}ms`, '--c': `${(i - 1) * 110}ms` },
    }
  }
  if (s.type === 'dots-sub') {
    const keep = s.x - s.y
    const crossed = i > keep
    return {
      cls: ['blue', crossed && p >= 1 ? 'crossed' : '', !crossed && p >= 2 ? 'counting' : ''],
      style: { '--d': `${(i - 1) * 110}ms`, '--x': `${(i - keep - 1) * 160}ms`, '--c': `${(i - 1) * 110}ms` },
    }
  }
  return { cls: [], style: {} }
}

/** 十格框每格的状态 */
function cell(i: number): { cls: string[]; style: Record<string, string> } {
  const s = step.value
  const p = phase.value
  if (s.type === 'ten-add') {
    if (i < s.x) return { cls: ['blue', p >= 2 ? 'counting' : ''], style: { '--d': `${i * 90}ms`, '--c': `${i * 100}ms` } }
    if (i < s.x + s.take) return { cls: [p >= 1 ? 'orange moved' : 'empty', p >= 2 ? 'counting' : ''], style: { '--d': `${(i - s.x) * 180}ms`, '--c': `${i * 100}ms` } }
    return { cls: ['empty'], style: {} }
  }
  if (s.type === 'ten-sub') {
    const crossed = i >= 10 - s.y
    return {
      cls: ['blue', crossed && p >= 1 ? 'crossed' : '', !crossed && p >= 2 ? 'counting' : ''],
      style: { '--d': `${i * 90}ms`, '--x': `${(i - (10 - s.y)) * 160}ms`, '--c': `${i * 100}ms` },
    }
  }
  return { cls: ['empty'], style: {} }
}

/** 框外的点 */
const outside = computed(() => {
  const s = step.value
  if (s.type === 'ten-add') return { color: 'orange', count: phase.value >= 1 ? s.rest : s.y, offset: s.x }
  if (s.type === 'ten-sub') return { color: 'blue', count: s.x - 10, offset: 10 - s.y }
  return { color: 'blue', count: 0, offset: 0 }
})
</script>

<template>
  <div class="mask" @click.self="emit('close')">
    <div class="panel pop">
      <div class="title">{{ title }}</div>

      <div v-if="step.type === 'dots-add' || step.type === 'dots-sub'" class="dots">
        <span v-for="i in total" :key="i" class="dot" :class="dot(i).cls" :style="dot(i).style" />
      </div>

      <div v-else class="ten">
        <div class="frame">
          <span v-for="i in 10" :key="i" class="cell" :class="cell(i - 1).cls" :style="cell(i - 1).style" />
        </div>
        <div class="plus">+</div>
        <div class="dots small">
          <span
            v-for="i in outside.count" :key="i" class="dot" :class="[outside.color, phase >= 2 ? 'counting' : '']"
            :style="{ '--d': `${(i - 1) * 110}ms`, '--c': `${(outside.offset + i - 1) * 100}ms` }"
          />
          <span v-if="outside.count === 0" class="zero">0</span>
        </div>
      </div>

      <p class="caption" :key="phase">{{ caption }}</p>
      <div class="answer" :class="{ show: phase >= LAST }">= {{ step.answer }}</div>

      <div class="steps">
        <i v-for="n in LAST + 1" :key="n" :class="{ on: n - 1 <= phase }" />
      </div>

      <div class="row">
        <button v-if="phase < LAST" class="btn orange sm" @click="next">下一步 ▶</button>
        <button v-else class="btn ghost sm" @click="play">🔁 再看一遍</button>
        <button class="btn sm" @click="emit('close')">知道了</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.mask { position: fixed; inset: 0; background: rgba(30, 42, 58, .45); display: flex; align-items: center; justify-content: center; padding: 16px; z-index: 50; }
.panel { background: #fff; border-radius: var(--radius); padding: 20px 22px; width: min(92vw, 560px); max-height: 92dvh; display: flex; flex-direction: column; align-items: center; gap: 12px; box-shadow: 0 16px 40px rgba(30,42,58,.25); }
.title { font-size: var(--fs-big); font-weight: 900; color: var(--c-muted); }

.dots { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; justify-items: center; min-height: 40px; }
.dots.small { gap: 6px; }
.dot, .cell { position: relative; border-radius: 50%; width: clamp(26px, 5vmin, 40px); height: clamp(26px, 5vmin, 40px); }
.dots.small .dot { width: clamp(20px, 4vmin, 30px); height: clamp(20px, 4vmin, 30px); }
.dot { animation: pop .35s ease-out var(--d, 0ms) both; }
.dot.blue, .cell.blue { background: var(--c-primary); }
.dot.orange, .cell.orange { background: var(--c-orange); }
.dot.hidden { visibility: hidden; animation: none; }

.crossed::after {
  content: ''; position: absolute; inset: 0; border-radius: 50%;
  background:
    linear-gradient(45deg, transparent 44%, var(--c-bad) 44%, var(--c-bad) 56%, transparent 56%),
    linear-gradient(-45deg, transparent 44%, var(--c-bad) 44%, var(--c-bad) 56%, transparent 56%);
  animation: pop .3s ease-out var(--x, 0ms) both;
}
.crossed { opacity: .4; transition: opacity .3s; transition-delay: var(--x, 0ms); }

.counting { animation: count .55s ease-out var(--c, 0ms) both; }
@keyframes count {
  0% { transform: scale(1); }
  50% { transform: scale(1.4); box-shadow: 0 0 0 5px rgba(255, 194, 61, .55); }
  100% { transform: scale(1); }
}

.ten { display: flex; align-items: center; gap: 14px; }
.frame { display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; padding: 8px; border: 3px solid var(--c-text); border-radius: 12px; }
.cell { background: #eef1f6; transition: background .3s; }
.cell.moved { animation: pop .4s ease-out var(--d, 0ms) both; }
.plus, .zero { font-size: var(--fs-big); font-weight: 900; color: var(--c-muted); }

.caption { margin: 0; font-size: var(--fs-big); font-weight: 800; text-align: center; animation: pop .25s ease-out; min-height: 1.4em; }
.answer { font-size: clamp(32px, 7vmin, 56px); font-weight: 900; color: var(--c-ok); opacity: 0; transform: scale(.6); transition: opacity .3s, transform .3s; line-height: 1; }
.answer.show { opacity: 1; transform: scale(1); transition-delay: .5s; }

.steps { display: flex; gap: 8px; }
.steps i { width: 10px; height: 10px; border-radius: 50%; background: var(--c-track); transition: background .2s; }
.steps i.on { background: var(--c-primary); }
.row { display: flex; gap: 12px; margin-top: 2px; }
</style>
