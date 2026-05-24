import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // base is set per-environment via VITE_BASE_URL in .env files
  // For GitHub Pages: set VITE_BASE_URL = /your-repo-name/
  base: process.env.VITE_BASE_URL || '/',
})
