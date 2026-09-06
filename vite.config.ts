import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// path aliases can go here later if the import paths get out of hand
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // autoUpdate rather than the default prompt-based flow - a hand-rolled
      // service worker serving a stale cached build forever was exactly the
      // failure mode picked vite-plugin-pwa over hand-rolling one in the
      // first place, so let a new build take over as soon as it's ready
      // rather than waiting on a prompt nobody will see
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'favicon.ico', 'apple-touch-icon.png'],
      manifest: {
        name: 'Summit Atlas',
        short_name: 'Summit Atlas',
        description: "An atlas of the world's summits - track climbs, explore peaks, build a climbing résumé.",
        start_url: '/',
        display: 'standalone',
        // sampled from the illustrated logo's own background, not the
        // Deep Vintage token - keeps the splash screen and icon reading as
        // one seamless piece of art with no visible seam at the edges
        background_color: '#0e2329',
        theme_color: '#0e2329',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-maskable-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
          { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // everything Vite already emits into the build is fine to
        // precache wholesale - nothing here is large enough (individual
        // country-flag SVGs aside, and those are already small) to need
        // more deliberate globbing/runtime-caching rules
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
      },
    }),
  ],
  test: {
    // pure util tests for now, no DOM needed - switch to jsdom if/when
    // component tests get added
    environment: 'node',
  },
})