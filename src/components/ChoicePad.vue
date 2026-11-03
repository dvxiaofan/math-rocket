<script setup lang="ts">
const props = defineProps<{ choices: number[]; answer: number; picked: number | null; status: 'asking' | 'ok' | 'bad' }>()
const emit = defineEmits<{ pick: [n: number] }>()

function cls(n: number) {
  if (props.status === 'asking') return ''
  if (n === props.answer) return 'ok'
  if (n === props.picked) return 'bad'
  return 'dim'
}
</script>

<template>
  <div class="choices">
    <button v-for="n in choices" :key="n" class="choice" :class="cls(n)" :disabled="status !== 'asking'" @click="emit('pick', n)">
      {{ n }}
    </button>
  </div>
</template>

<style scoped>
.choices { display: grid; grid-template-columns: 1fr 1fr; grid-auto-rows: 1fr; gap: 14px; flex: 1; min-height: 0; }
.choice {
  border-radius: var(--radius); background: #fff; color: var(--c-text);
  font-size: clamp(36px, 8vmin, 72px); font-weight: 900; box-shadow: var(--shadow); min-height: var(--tap);
  transition: transform .08s, box-shadow .08s, background .15s, color .15s, opacity .2s;
}
.choice:active:not(:disabled) { transform: translateY(6px); box-shadow: var(--shadow-press); }
.choice.ok { background: var(--c-ok); color: #fff; animation: pop .25s; }
.choice.bad { background: var(--c-bad); color: #fff; animation: shake .3s; }
.choice.dim { opacity: .35; }
</style>
