import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // --- AJOUTEZ CETTE SECTION ---
  // C'est la correction pour l'erreur "node:url"
  resolve: {
    alias: {
      'node:url': 'url'
    }
  }
  // --- FIN DE L'AJOUT ---
})