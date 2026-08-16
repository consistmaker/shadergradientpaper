import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Memastikan kompatibilitas universal di Vercel, Netlify, maupun sub-folder GitHub Pages
})
