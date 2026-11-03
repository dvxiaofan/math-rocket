/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  base: '/math-rocket/',
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/icon.svg'],
      manifest: {
        name: '数学赛车 · 加减法练习',
        short_name: '数学赛车',
        description: '给 6 岁孩子的加减法练习小游戏',
        lang: 'zh-CN',
        theme_color: '#2f6bff',
        background_color: '#f4f7fb',
        display: 'standalone',
        start_url: '/math-rocket/',
        scope: '/math-rocket/',
        icons: [{ src: 'icons/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' }],
      },
    }),
  ],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: { environment: 'node' },
})
