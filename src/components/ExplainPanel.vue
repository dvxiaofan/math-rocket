<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import type { Question } from '@/types'
import { explain } from '@/core/explain'
import { formula } from '@/core/generator'

const props = defineProps<{ q: Question }>()
const emit = defineEmits<{ close: [] }>()

const step = computed(() => explain(props.q))
const phase = ref(0)
const timers: ReturnType<typeof setTimeout>[] = []

function play() {
  timers.forEach(clearTimeout)
  timers.length = 0
  phase.value = 0
  const last = step.value.captions.length - 1
  for (let i = 1; i <= last; i++) timers.push(setTimeout(() => (phase.value = i), 1000 * i))
}
onMounted(play)
onBeforeUnmount(() => timers.forEach(clearTimeout))

const caption = computed(() => step.value.captions[Math.min(phase.value, step.value.captions.length - 1)])
const title = computed(() => formula(props.q).replace('□', String(props.q.answer)))

/** 十格框里每个格子的状态 */
function frameCell(i: number): string {
  const s = step.value
  if (s.type === 'ten-add') {
    if (i < s.x) return 'blue'
    if (phase.value >= 1 && i < s.x + s.take) return 'orange moved'
    return 'empty'
  }
  if (s.type === 'ten-sub') {
    if (phase.value >= 1 && i >= 10 - s.y) return 'blue crossed'
    return 'blue'
  }
  return 'empty'
}
/** 框外剩余的点 */
const outside = computed(() => {
  const s = step.value
  if (s.type === 'ten-add') return { color: 'orange', count: phase.value >= 1 ? s.rest : s.y }
  if (s.type === 'ten-sub') return { color: 'blue', count: s.x - 10 }
  return { color: 'blue', count: 0 }
})
</script>

<template>
  <div class="mask" @click.self="emit('close')">
    <div class="panel pop">
      <div class="title">{{ title }}</div>

      <!-- 摆点：加法两组 / 减法划掉 -->
      <div v-if="step.type === 'dots-add' || step.type === 'dots-sub'" class="dots">
        <span
          v-for="i in step.type === 'dots-add' ? step.x + step.y : step.x" :key="i"
          class="dot"
          :class="[
            step.type === 'dots-add' && i > step.x ? 'orange' : 'blue',
            step.type === 'dots-add' && i > step.x && phase < 1 ? 'hidden' : '',
            step.type === 'dots-sub' && phase >= 1 && i > step.x - step.y ? 'crossed' : '',
          ]"
          :style="{ animationDelay: `${(i % 10) * 40}ms` }"
        />
      </div>

      <!-- 十格框：凑十 / 退位 -->
      <div v-else class="ten">
        <div class="frame">
          <span v-for="i in 10" :key="i" class="cell" :class="frameCell(i - 1)" />
        </div>
        <div class="plus">+</div>
        <div class="dots small">
          <span v-for="i in outside.count" :key="i" class="dot" :class="outside.color" />
          <span v-if="outside.count === 0" class="zero">0</span>
        </div>
      </div>

      <p class="caption" :key="phase">{{ caption }}</p>
      <div class="big" v-if="phase >= step.captions.length - 1">= {{ step.answer }}</div>

      <div class="row">
        <button class="btn ghost sm" @click="play">🔁 再看一遍</button>
        <button class="btn sm" @click="emit('close')">知道了</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.mask { position: fixed; inset: 0; background: rgba(30, 42, 58, .45); display: flex; align-items: center; justify-content: center; padding: 16px; z-index: 50; }
.panel { background: #fff; border-radius: var(--radius); padding: 20px 22px; width: min(92vw, 560px); max-height: 92dvh; display: flex; flex-direction: column; align-items: center; gap: 14px; box-shadow: 0 16px 40px rgba(30,42,58,.25); }
.title { font-size: var(--fs-big); font-weight: 900; color: var(--c-muted); }
.dots { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; justify-items: center; }
.dots.small { grid-template-columns: repeat(5, 1fr); gap: 6px; }
.dot { width: clamp(26px, 5vmin, 40px); height: clamp(26px, 5vmin, 40px); border-radius: 50%; position: relative; animation: pop .3s ease-out both; transition: opacity .3s; }
.dots.small .dot { width: clamp(20px, 4vmin, 30px); height: clamp(20px, 4vmin, 30px); }
.dot.blue, .cell.blue { background: var(--c-primary); }
.dot.orange, .cell.orange { background: var(--c-orange); }
.dot.hidden { opacity: 0; }
.crossed::after { content: ''; position: absolute; inset: 0; background:
  linear-gradient(45deg, transparent 44%, var(--c-bad) 44%, var(--c-bad) 56%, transparent 56%),
  linear-gradient(-45deg, transparent 44%, var(--c-bad) 44%, var(--c-bad) 56%, transparent 56%);
  border-radius: 50%; animation: pop .25s ease-out; }
.cell.crossed { opacity: .35; }
.ten { display: flex; align-items: center; gap: 14px; }
.frame { display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; padding: 8px; border: 3px solid var(--c-text); border-radius: 12px; }
.cell { width: clamp(26px, 5vmin, 40px); height: clamp(26px, 5vmin, 40px); border-radius: 50%; background: #eef1f6; position: relative; transition: background .3s, opacity .3s; }
.cell.moved { animation: pop .35s ease-out; }
.plus { font-size: var(--fs-big); font-weight: 900; color: var(--c-muted); }
.zero { font-size: var(--fs-big); font-weight: 900; color: var(--c-muted); }
.caption { margin: 0; font-size: var(--fs-big); font-weight: 800; text-align: center; animation: pop .25s ease-out; min-height: 1.4em; }
.big { font-size: clamp(32px, 7vmin, 56px); font-weight: 900; color: var(--c-ok); animation: pop .3s ease-out; }
.row { display: flex; gap: 12px; margin-top: 4px; }
</style>
