<script setup lang="ts">
import { go, store } from '@/store'
import { fmtDuration, stars } from '@/core/scoring'

const list = store.history.slice(0, 10)
function when(ts: number) {
  const d = new Date(ts)
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}
</script>

<template>
  <div class="page">
    <h2>📜 最近比赛</h2>
    <p v-if="!list.length" class="desc">还没有记录，去跑一局吧！</p>
    <ul v-else class="list">
      <li v-for="r in list" :key="r.at">
        <span class="t">{{ when(r.at) }}</span>
        <span class="s">{{ '★'.repeat(stars(r.correct, r.total)) }}</span>
        <span class="c">{{ r.correct }} / {{ r.total }}</span>
        <span class="d">{{ fmtDuration(r.ms) }}</span>
        <span class="l">赛道 {{ r.levelEnd }}</span>
      </li>
    </ul>
    <button class="btn" @click="go('home')">返回</button>
  </div>
</template>

<style scoped>
.list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 10px; }
.list li { display: grid; grid-template-columns: 1fr auto auto auto auto; gap: 14px; align-items: center; background: #fff; border-radius: var(--radius-sm); padding: 12px 16px; font-weight: 800; }
.t { color: var(--c-muted); font-weight: 600; }
.s { color: var(--c-accent); letter-spacing: 2px; }
.d, .l { color: var(--c-muted); font-size: 14px; font-weight: 600; }
</style>
