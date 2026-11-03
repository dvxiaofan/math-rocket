<script setup lang="ts">
import { go, startLevel } from '@/store'
import { initAudio, sfx } from '@/audio/sfx'
import Mascot from '@/components/Mascot.vue'

const level = startLevel()
let pressTimer: ReturnType<typeof setTimeout> | undefined

function start() {
  initAudio()
  sfx.tap()
  go('quiz')
}
function pressStart() {
  pressTimer = setTimeout(() => go('settings'), 800)
}
function pressEnd() {
  clearTimeout(pressTimer)
}
</script>

<template>
  <div class="home">
    <div class="checker" />
    <h1>数学赛车</h1>
    <div class="hero"><Mascot mood="idle" /></div>
    <div class="level">
      赛道 <b>{{ level }}</b>
      <span class="dots"><i v-for="n in 5" :key="n" :class="{ on: n <= level }" /></span>
    </div>
    <button class="btn start" @click="start">🏁 开始比赛</button>
    <div class="row">
      <button class="btn ghost sm" @pointerdown="pressStart" @pointerup="pressEnd" @pointerleave="pressEnd" @pointercancel="pressEnd">⚙️ 设置</button>
      <button class="btn ghost sm" @click="go('history')">📜 记录</button>
      <button class="btn ghost sm" @click="go('print')">🖨️ 打印</button>
    </div>
    <p class="tip">设置需要长按一下</p>
  </div>
</template>

<style scoped>
.home { min-height: 100dvh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 18px; padding: 24px; }
.checker { width: min(80vw, 420px); }
h1 { margin: 0; font-size: clamp(36px, 7vmin, 64px); color: var(--c-primary); letter-spacing: .04em; }
.hero { width: min(60vw, 320px); animation: float 2.4s ease-in-out infinite; }
.level { display: flex; align-items: center; gap: 10px; font-size: var(--fs-big); font-weight: 800; }
.level b { color: var(--c-orange); }
.dots { display: flex; gap: 6px; }
.dots i { width: 16px; height: 16px; border-radius: 50%; background: var(--c-track); }
.dots i.on { background: var(--c-accent); }
.start { font-size: clamp(26px, 5vmin, 40px); min-height: 80px; padding: 0 44px; }
.row { display: flex; gap: 12px; flex-wrap: wrap; justify-content: center; }
.tip { margin: 0; color: var(--c-muted); font-size: 14px; }
</style>
