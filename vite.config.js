import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['@headlessui/react', 'lucide-react']
        }
      }
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://workly-backend.onrender.com',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    },
    headers: {
      'Cache-Control': 'no-cache',
      'Access-Control-Allow-Origin': '*'
    }
  },
  // Настройки для правильной работы маршрутизации
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  // Настройки для SPA
  preview: {
    port: 5000,
    // Добавляем обработку всех маршрутов через index.html
    historyApiFallback: true
  }
});