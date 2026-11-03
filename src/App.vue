<script setup lang="ts">
import { computed, watchEffect } from 'vue'
import { store } from './store'
import { setSoundEnabled } from './audio/sfx'
import Home from './views/Home.vue'
import Quiz from './views/Quiz.vue'
import Result from './views/Result.vue'
import Settings from './views/Settings.vue'
import History from './views/History.vue'
import PrintSheet from './views/PrintSheet.vue'

const views = { home: Home, quiz: Quiz, result: Result, settings: Settings, history: History, print: PrintSheet }
const current = computed(() => views[store.view])

watchEffect(() => document.body.classList.toggle('lock-scroll', store.view === 'quiz'))
watchEffect(() => setSoundEnabled(store.settings.sound))
</script>

<template>
  <component :is="current" :key="store.view" />
</template>
