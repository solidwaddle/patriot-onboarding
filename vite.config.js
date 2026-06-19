import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base must match the GitHub Pages project path
export default defineConfig({
  base: '/patriot-onboarding/',
  plugins: [react()],
  build: { outDir: 'docs', emptyOutDir: true },
})
