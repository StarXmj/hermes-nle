import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // 1. Corrige le problème "node:url" (pour Vercel / build)
  resolve: {
    alias: {
      'node:url': 'url'
    }
  },

  // 2. Corrige les problèmes "ajv", "ajv-keywords", etc.
  // On force Vite à pré-compiler ces paquets CJS
  optimizeDeps: {
    include: [
      'decap-cms-app',
      'ajv',
      'ajv-keywords',
      'ajv-errors'
    ]
  }
})