<script setup lang="ts">
import { computed } from 'vue'
import Mascot from './Mascot.vue'

const props = defineProps<{ total: number; done: number; streak: number }>()
const pct = computed(() => Math.min(100, (props.done / props.total) * 100))
</script>

<template>
  <div class="track">
    <div class="road">
      <div class="dash" />
      <div class="car" :style="{ left: `calc(${pct}% - 28px)` }"><Mascot mood="idle" /></div>
      <div class="flag">🏁</div>
    </div>
    <div class="meta">
      <span class="count">{{ done }} / {{ total }}</span>
      <span v-if="streak >= 2" class="streak pop">🔥 连对 {{ streak }}</span>
    </div>
  </div>
</template>

<style scoped>
.track { display: flex; align-items: center; gap: 16px; width: 100%; }
.road { position: relative; flex: 1; height: 36px; background: var(--c-track); border-radius: 18px; }
.dash { position: absolute; inset: 16px 20px auto; height: 4px; border-top: 4px dashed #fff; }
.car { position: absolute; top: -14px; width: 56px; height: 40px; transition: left .45s cubic-bezier(.3, 1.4, .5, 1); }
.flag { position: absolute; right: -6px; top: -10px; font-size: 28px; }
.meta { display: flex; flex-direction: column; align-items: flex-end; min-width: 64px; font-weight: 800; }
.count { font-size: var(--fs-big); }
.streak { color: var(--c-orange); font-size: 14px; white-space: nowrap; }
</style>
