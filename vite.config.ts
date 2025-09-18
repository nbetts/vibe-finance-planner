import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { githubPagesSpa } from '@sctg/vite-plugin-github-pages-spa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), githubPagesSpa()],
  base: '/vibe-finance-planner/',
})
