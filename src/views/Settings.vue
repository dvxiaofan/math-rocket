<script setup lang="ts">
import { go, store } from '@/store'
import type { Level } from '@/types'

const s = store.settings
const counts = [10, 15, 20] as const
const levels: (Level | null)[] = [null, 1, 2, 3, 4, 5]
</script>

<template>
  <div class="page">
    <h2>⚙️ 设置</h2>
    <section>
      <h3>一局几题</h3>
      <div class="seg"><button v-for="c in counts" :key="c" :class="{ on: s.count === c }" @click="s.count = c">{{ c }} 题</button></div>
    </section>
    <section>
      <h3>怎么答题</h3>
      <div class="seg">
        <button :class="{ on: s.mode === 'choice' }" @click="s.mode = 'choice'">四选一</button>
        <button :class="{ on: s.mode === 'numpad' }" @click="s.mode = 'numpad'">数字键盘</button>
      </div>
    </section>
    <section>
      <h3>赛道</h3>
      <div class="seg">
        <button v-for="l in levels" :key="String(l)" :class="{ on: s.lockLevel === l }" @click="s.lockLevel = l">{{ l === null ? '自动' : `赛道 ${l}` }}</button>
      </div>
      <p class="desc">
        自动：连对 3 题升一级，连错 2 题降一级。<br />
        1 十以内加法 · 2 十以内减法 · 3 十以内混合 · 4 二十以内不进退位 · 5 二十以内进退位
      </p>
    </section>
    <section>
      <h3>音效</h3>
      <div class="seg">
        <button :class="{ on: s.sound }" @click="s.sound = true">开</button>
        <button :class="{ on: !s.sound }" @click="s.sound = false">关</button>
      </div>
    </section>
    <button class="btn" @click="go('home')">返回</button>
  </div>
</template>
