import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env.NODE_ENV': '"production"'
  },
  build: {
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: [
            'react', 
            'react-dom', 
            'react-router-dom',
            '@headlessui/react',
            'lucide-react'
          ],
          utils: [
            'date-fns',
            'zustand'
          ]
        }
      }
    }
  },
  server: {
    proxy: {
      '/api/v1': {
        target: process.env.VITE_API_URL || 'https://workly-backend.onrender.com',
        changeOrigin: true,
        secure: false
      }
    }
  }
});