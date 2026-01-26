import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // On inclut tous les assets statiques pour qu'ils soient gérés par le cache PWA
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg', 'images/**/*'], 
      
      // CONFIGURATION DU CACHE (Workbox)
      workbox: {
        // Cache les fichiers locaux (JS, CSS, images, sons)
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,mp3}'],
        runtimeCaching: [
          {
            // STRATÉGIE POUR LES IMAGES SUPABASE
            // On cible l'URL de ton stockage Supabase
            urlPattern: /^https:\/\/.*\.supabase\.co\/storage\/v1\/object\/public\/.*/i,
            handler: 'CacheFirst', // On regarde d'abord le cache du téléphone
            options: {
              cacheName: 'supabase-storage-cache',
              expiration: {
                maxEntries: 100, // On garde jusqu'à 100 images
                maxAgeSeconds: 60 * 60 * 24 * 30, // Conservation : 30 jours
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            // STRATÉGIE POUR LES POLICES OU AUTRES ASSETS EXTERNES
            urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
            handler: 'StaleWhileRevalidate', // Affiche vite, puis met à jour en fond
            options: {
              cacheName: 'google-fonts-cache',
            },
          }
        ],
      },

      manifest: {
        name: 'Hermes by NLE',
        short_name: 'Hermes',
        description: "L'application de l'association étudiante qui t'accompagne à Pau.",
        theme_color: '#000000',
        background_color: '#000000',
        display: 'standalone',
        orientation: 'landscape',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  
  // OPTIMISATION DU BUILD (Réduction Egress JS)
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // On sépare les grosses librairies pour qu'elles restent en cache 
          // même si tu modifies ton code métier (.jsx)
          vendor: ['react', 'react-dom', 'react-router-dom'],
          supabase: ['@supabase/supabase-js'],
          ui: ['swiper', 'lucide-react']
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
})