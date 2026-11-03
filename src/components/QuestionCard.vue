<script setup lang="ts">
import { computed } from 'vue'
import type { Question } from '@/types'

const props = defineProps<{ q: Question; input: string; status: 'asking' | 'ok' | 'bad' }>()

const parts = computed(() => [
  { key: 'a', text: String(props.q.a) },
  { key: 'op', text: props.q.op === '-' ? '−' : '+' },
  { key: 'b', text: String(props.q.b) },
  { key: 'eq', text: '=' },
  { key: 'result', text: String(props.q.result) },
])

const slotText = computed(() => {
  if (props.status !== 'asking') return String(props.q.answer)
  return props.input || '?'
})
</script>

<template>
  <div class="formula" :class="status">
    <template v-for="p in parts" :key="p.key">
      <span v-if="p.key === q.blank" class="slot" :class="{ filled: input || status !== 'asking' }">{{ slotText }}</span>
      <span v-else :class="p.key">{{ p.text }}</span>
    </template>
  </div>
</template>

<style scoped>
.formula {
  display: flex; align-items: center; justify-content: center; gap: .18em; flex-wrap: nowrap;
  font-size: var(--fs-formula); font-weight: 900; line-height: 1; letter-spacing: .02em;
}
.op, .eq { color: var(--c-muted); font-weight: 700; }
.slot {
  display: inline-flex; align-items: center; justify-content: center;
  min-width: 1.5em; height: 1.35em; padding: 0 .2em;
  border: 4px dashed var(--c-primary); border-radius: .3em; color: var(--c-primary); background: #fff;
  transition: background .15s, color .15s, border-color .15s;
}
.slot.filled { border-style: solid; }
.ok .slot { background: var(--c-ok); border-color: var(--c-ok); color: #fff; animation: pop .25s; }
.bad .slot { background: var(--c-ok); border-color: var(--c-ok); color: #fff; }
.bad { animation: shake .3s; }
</style>
