<script setup lang="ts">
defineProps<{ disabled: boolean }>()
const emit = defineEmits<{ digit: [d: string]; del: []; ok: [] }>()
const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'del', '0', 'ok']

function press(k: string) {
  if (k === 'del') emit('del')
  else if (k === 'ok') emit('ok')
  else emit('digit', k)
}
</script>

<template>
  <div class="numpad">
    <button v-for="k in keys" :key="k" class="key" :class="k" :disabled="disabled" @click="press(k)">
      <template v-if="k === 'del'">⌫</template>
      <template v-else-if="k === 'ok'">✓</template>
      <template v-else>{{ k }}</template>
    </button>
  </div>
</template>

<style scoped>
.numpad { display: grid; grid-template-columns: repeat(3, 1fr); grid-auto-rows: 1fr; gap: 10px; flex: 1; min-height: 0; }
.key {
  background: #fff; color: var(--c-text); border-radius: var(--radius-sm);
  font-size: clamp(28px, 6vmin, 52px); font-weight: 900; box-shadow: var(--shadow); min-height: 56px;
  transition: transform .08s, box-shadow .08s;
}
.key:active:not(:disabled) { transform: translateY(5px); box-shadow: var(--shadow-press); }
.key.del { background: var(--c-orange); color: #fff; }
.key.ok { background: var(--c-ok); color: #fff; }
.key:disabled { opacity: .5; }
</style>
