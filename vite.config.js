import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// Using the environment variable or a default value
const API_URI = process.env.VITE_BASE_API_URL || 'https://localhost:7292/';

export default defineConfig({
  plugins: [vue()],
  define: {
    'process.env': process.env
  },
  server: {
    proxy: {
      '/api': {
        target: API_URI,
        changeOrigin: true,
        // Adjusting the rewrite rule to match your request URL
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
