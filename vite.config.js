import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa' // 1. Import du plugin

export default defineConfig({
  plugins: [
    react(),
    // 2. Configuration PWA
    VitePWA({
      registerType: 'autoUpdate', // Met à jour l'app automatiquement dès qu'une nouvelle version est dispo
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'], // Fichiers statiques à mettre en cache
      manifest: {
        name: 'Hermes by NLE',
        short_name: 'Hermes',
        description: "L'application de l'association étudiante qui t'accompagne à Pau.",
        theme_color: '#003366', // Votre bleu foncé
        background_color: '#ffffff',
        display: 'standalone', // Mode "App" sans barre d'URL
        orientation: 'portrait',
        icons: [
          {
            src: '/pwa-192x192.png', // Nous allons créer ces images juste après
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
            purpose: 'any maskable' // Important pour Android (icônes rondes)
          }
        ]
      }
    })
  ]
})