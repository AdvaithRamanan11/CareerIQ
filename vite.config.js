import { defineConfig } from 'vite'

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    proxy: {
      '/api/cos': {
        target: 'http://localhost:8888',
        changeOrigin: true,
      },
    },
  },
})
