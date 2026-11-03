<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { Question } from '@/types'
import { go, store } from '@/store'
import { fmtDuration, stars } from '@/core/scoring'
import { formula } from '@/core/generator'
import Mascot from '@/components/Mascot.vue'
import ExplainPanel from '@/components/ExplainPanel.vue'

const r = store.last
if (!r) go('home')
const s = r ? stars(r.correct, r.total) : 1
const explainQ = ref<Question | null>(null)

onMounted(async () => {
  if (!r || s < 2) return
  const confetti = (await import('canvas-confetti')).default
  confetti({ particleCount: s === 3 ? 200 : 90, spread: 90, origin: { y: 0.55 }, colors: ['#2f6bff', '#ffc23d', '#ff7a1a', '#2ecc71'] })
})
</script>

<template>
  <div v-if="r" class="result">
    <div class="checker" />
    <div class="hero"><Mascot :mood="s === 1 ? 'idle' : 'happy'" /></div>
    <div class="stars">
      <span v-for="n in 3" :key="n" class="star" :class="{ on: n <= s }" :style="{ animationDelay: `${n * 0.15}s` }">★</span>
    </div>
    <h2>{{ s === 3 ? '冠军！' : s === 2 ? '很棒的比赛！' : '继续加油！' }}</h2>

    <div class="stats">
      <div><b>{{ r.correct }}</b><span>/ {{ r.total }} 题答对</span></div>
      <div><b>{{ fmtDuration(r.ms) }}</b><span>用时</span></div>
      <div><b>🔥 {{ r.bestStreak }}</b><span>最长连对</span></div>
      <div><b>赛道 {{ r.levelEnd }}</b><span>{{ r.levelEnd > r.levelStart ? '升级了！' : r.levelEnd < r.levelStart ? '下次再冲' : '保持' }}</span></div>
    </div>

    <div v-if="r.wrong.length" class="wrong">
      <h3>这几题再看看 <small>（点一下看讲解）</small></h3>
      <ul>
        <li v-for="(w, i) in r.wrong" :key="i" @click="explainQ = w.q">
          <span class="f">{{ formula(w.q).replace('□', String(w.q.answer)) }}</span>
          <span class="you">你填的 {{ w.input }}</span>
        </li>
      </ul>
    </div>

    <div class="row">
      <button class="btn" @click="go('quiz')">🏁 再来一局</button>
      <button class="btn ghost" @click="go('home')">回首页</button>
    </div>
    <ExplainPanel v-if="explainQ" :q="explainQ" @close="explainQ = null" />
  </div>
</template>

<style scoped>
.result { min-height: 100dvh; display: flex; flex-direction: column; align-items: center; gap: 16px; padding: 24px 20px 40px; max-width: 760px; margin: 0 auto; }
.checker { width: min(80vw, 420px); }
.hero { width: min(40vw, 220px); }
.stars { display: flex; gap: 8px; font-size: clamp(44px, 9vmin, 72px); }
.star { color: var(--c-track); animation: pop .4s ease-out both; }
.star.on { color: var(--c-accent); text-shadow: 0 4px 0 rgba(0,0,0,.08); }
h2 { margin: 0; font-size: clamp(28px, 5.5vmin, 44px); color: var(--c-primary); }
.stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; width: 100%; }
.stats div { background: #fff; border-radius: var(--radius-sm); padding: 14px; display: flex; flex-direction: column; align-items: center; box-shadow: 0 4px 0 rgba(30,42,58,.08); }
.stats b { font-size: var(--fs-big); }
.stats span { color: var(--c-muted); font-size: 14px; }
.wrong { width: 100%; background: #fff; border-radius: var(--radius-sm); padding: 14px 18px; }
.wrong h3 { margin: 0 0 8px; font-size: var(--fs-body); color: var(--c-muted); }
.wrong ul { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }
.wrong li { display: flex; justify-content: space-between; align-items: center; font-weight: 800; cursor: pointer; padding: 6px 8px; border-radius: 10px; }
.wrong li:active { background: var(--c-bg); }
.wrong small { font-weight: 600; }
.wrong .f { font-size: var(--fs-big); }
.wrong .you { color: var(--c-bad); font-size: 14px; }
.row { display: flex; gap: 12px; flex-wrap: wrap; justify-content: center; margin-top: 8px; }
@media (min-width: 900px) { .stats { grid-template-columns: repeat(4, 1fr); } }
</style>
