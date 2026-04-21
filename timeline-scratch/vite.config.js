import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Use relative paths for assets
  esbuild: {
    drop: ['console', 'debugger'],
  },
  build: {
    outDir: '../apps',
    emptyOutDir: true,
    sourcemap: false,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        'church-history': resolve(__dirname, 'church-history.html'),
        'church-history-supabase': resolve(__dirname, 'church-history-supabase.html'),
        'historical-eras': resolve(__dirname, 'historical-eras.html'),
        'biblical-places': resolve(__dirname, 'biblical-places.html'),
        'african-kingdoms': resolve(__dirname, 'african-kingdoms.html'),
      },
    },
  },
})
