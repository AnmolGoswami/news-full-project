import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      // This tells Vite to ignore all node_modules changes
      ignored: ['**/node_modules/**'],
    },
  },
})
