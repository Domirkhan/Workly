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
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true, // Добавляем source maps для отладки
    rollupOptions: {
      output: {
        manualChunks: undefined, // Отключаем ручное разделение чанков
      }
    }
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@headlessui/react',
      'lucide-react',
      'recharts',
      'date-fns',
      'jspdf',
      'html5-qrcode'
    ]
  }
});