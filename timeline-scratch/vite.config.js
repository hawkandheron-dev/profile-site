import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Use relative paths for assets
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        'church-history': resolve(__dirname, 'church-history.html'),
      },
    },
  },
})
