import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: './',
  plugins: [
    react(),
    VitePWA({
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      registerType: 'autoUpdate',
      manifest: {
        id: './',
        name: '收藏清醒器 | Collection Cleaner',
        short_name: '收藏清醒器',
        description: 'A local-first tool for reviewing and cleaning saved content.',
        lang: 'zh-CN',
        theme_color: '#075f46',
        background_color: '#fafaf9',
        display: 'standalone',
        start_url: './',
        scope: './',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
  },
});
