<script setup lang="ts">
import { computed, ref } from 'vue'
import { formula, generateSet } from '@/core/generator'
import { go } from '@/store'
import type { Level } from '@/types'

const level = ref<Level>(1)
const count = ref<20 | 30 | 40>(20)
const seed = ref(0)
const qs = computed(() => {
  void seed.value
  return generateSet(level.value, count.value)
})
const today = new Date().toLocaleDateString('zh-CN')
const LEVELS: Level[] = [1, 2, 3, 4, 5]
const COUNTS = [20, 30, 40] as const
function doPrint() {
  window.print()
}
</script>

<template>
  <div class="print-page">
    <div class="toolbar">
      <button class="btn ghost sm" @click="go('home')">← 返回</button>
      <div class="seg">
        <button v-for="l in LEVELS" :key="l" :class="{ on: level === l }" @click="level = l">赛道 {{ l }}</button>
      </div>
      <div class="seg">
        <button v-for="c in COUNTS" :key="c" :class="{ on: count === c }" @click="count = c">{{ c }} 题</button>
      </div>
      <button class="btn ghost sm" @click="seed++">🔄 换一批</button>
      <button class="btn sm" @click="doPrint">🖨️ 打印</button>
    </div>

    <div class="sheet">
      <header>
        <h1>加减法练习 · 赛道 {{ level }}</h1>
        <div class="meta">姓名：________　　日期：{{ today }}　　用时：______　　得分：______</div>
      </header>
      <ol>
        <li v-for="q in qs" :key="q.id + q.blank">{{ formula(q).replace('□', '____') }}</li>
      </ol>
    </div>
  </div>
</template>

<style scoped>
.print-page { max-width: 900px; margin: 0 auto; padding: 20px; display: flex; flex-direction: column; gap: 18px; }
.toolbar { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; }
.sheet { background: #fff; padding: 28px 32px; border-radius: var(--radius-sm); color: #000; }
.sheet h1 { margin: 0 0 6px; font-size: 24px; }
.meta { font-size: 15px; margin-bottom: 16px; }
ol { margin: 0; padding-left: 28px; columns: 2; column-gap: 40px; font-size: 22px; line-height: 2.1; font-weight: 700; font-variant-numeric: tabular-nums; }
li { break-inside: avoid; }
@media print {
  .toolbar { display: none; }
  .print-page { padding: 0; max-width: none; }
  .sheet { padding: 0; border-radius: 0; }
  @page { size: A4; margin: 15mm; }
}
</style>
