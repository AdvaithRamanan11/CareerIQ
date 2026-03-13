import { defineConfig } from 'vite'

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: 'public/index.html',
    },
  },
  server: {
    port: 5173,
    open: '/public/index.html',
    proxy: {
      '/api': {
        target: 'http://localhost:8888',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api\/cos/, '/.netlify/functions/cos'),
      },
    },
  },
})
