import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/ (configuration Vite)
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // redirige les appels /api vers le backend express en développement
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
