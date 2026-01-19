import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from "path"


// https://vite.dev/config/
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  plugins: [
    react(),

    VitePWA({
      registerType: 'autoUpdate',
      // Disable PWA in development to avoid caching issues
      devOptions: {
        enabled: false
      },
      manifest: {
        name: 'TeachPivot',
        short_name: 'TeachPivot',
        description: 'Teaching guidance that respects your students',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: []
      },
      workbox: {
        // Skip waiting ensures new service worker activates immediately
        skipWaiting: true,
        clientsClaim: true,
        // Clear old caches on new deployments
        cleanupOutdatedCaches: true,
        // Don't precache API routes - let them always go to network
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api/, /^\/curriculum/, /^\/prep-cards/, /^\/crp/, /^\/reflections/],
        runtimeCaching: [
          {
            // Match relative API calls (local dev with proxy)
            urlPattern: /^\/(api|curriculum|prep-cards|crp|reflections)\//,
            handler: 'NetworkOnly', // Changed from NetworkFirst - never cache API
            options: {
              cacheName: 'teachpivot-api-bypass',
            }
          },
          {
            // Match absolute API URLs (production with VITE_API_URL)
            urlPattern: /^https?:\/\/.*\/(api|curriculum|prep-cards|crp|reflections)\//,
            handler: 'NetworkOnly', // Never cache API responses
            options: {
              cacheName: 'teachpivot-external-api-bypass',
            }
          },
          {
            // Cache static assets aggressively
            urlPattern: /\.(js|css|png|jpg|jpeg|svg|gif|woff2?)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'teachpivot-static',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          }
        ]
      }
    })
  ],
})
