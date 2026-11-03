<script setup lang="ts">
withDefaults(defineProps<{ mood?: 'idle' | 'happy' | 'oops' }>(), { mood: 'idle' })
</script>

<template>
  <svg class="mascot" :class="mood" viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <g class="smoke" fill="#b8c2d0">
      <circle cx="22" cy="74" r="8" />
      <circle cx="12" cy="60" r="6" />
      <circle cx="26" cy="52" r="4" />
    </g>
    <g class="stars" fill="#ffc23d">
      <path d="M168 14l4 9 10 1-7 7 2 10-9-5-9 5 2-10-7-7 10-1z" />
      <path d="M186 44l2 5 6 1-4 4 1 6-5-3-5 3 1-6-4-4 6-1z" />
      <path d="M150 6l2 4 5 1-3 3 1 5-5-2-4 2 1-5-4-3 5-1z" />
    </g>
    <path d="M30 84q0-22 22-24l18-22q6-6 14-6h46q8 0 12 6l16 22q22 2 22 24v12q0 8-8 8H38q-8 0-8-8z" fill="#2f6bff" />
    <path d="M78 42h46l14 20H68z" fill="#dcebff" />
    <g class="eyes">
      <circle cx="92" cy="52" r="6.5" fill="#1e2a3a" />
      <circle cx="116" cy="52" r="6.5" fill="#1e2a3a" />
      <circle cx="94.5" cy="49.5" r="2.2" fill="#fff" />
      <circle cx="118.5" cy="49.5" r="2.2" fill="#fff" />
    </g>
    <path v-if="mood === 'oops'" d="M152 86q10-7 20 0" stroke="#1e2a3a" stroke-width="3.5" fill="none" stroke-linecap="round" />
    <path v-else d="M152 80q10 8 20 0" stroke="#1e2a3a" stroke-width="3.5" fill="none" stroke-linecap="round" />
    <rect x="96" y="64" width="14" height="38" fill="#ffc23d" />
    <circle cx="62" cy="102" r="17" fill="#1e2a3a" />
    <circle cx="62" cy="102" r="7" fill="#fff" />
    <circle cx="150" cy="102" r="17" fill="#1e2a3a" />
    <circle cx="150" cy="102" r="7" fill="#fff" />
    <rect x="24" y="80" width="10" height="8" rx="2" fill="#ffc23d" />
  </svg>
</template>

<style scoped>
.mascot { display: block; overflow: visible; width: 100%; height: 100%; }
.smoke, .stars { opacity: 0; transition: opacity .2s; }
.oops .smoke { opacity: 1; animation: float .5s ease-in-out infinite; }
.happy .stars { opacity: 1; animation: pop .35s ease-out; }
.happy { animation: float .5s ease-in-out infinite; }
.oops { animation: shake .4s ease-in-out; }
.eyes { transform-origin: 104px 52px; }
.idle .eyes { animation: blink 4s infinite; }
@keyframes blink { 0%, 92%, 100% { transform: scaleY(1); } 95% { transform: scaleY(.1); } }
</style>
