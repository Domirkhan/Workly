import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://workly-backend.onrender.com',
        changeOrigin: true,
        secure: false
      }
    }
  },
  // Добавляем настройки для сборки
  build: {
    outDir: 'dist',
    rollupOptions: {
      external: ['@rollup/rollup-linux-x64-gnu'],
      output: {
        manualChunks: undefined
      }
    }
  },
  // Добавляем настройки для совместимости
  optimizeDeps: {
    exclude: ['@rollup/rollup-linux-x64-gnu']
  }
});