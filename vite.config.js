import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
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
    '/api': {
      target: process.env.VITE_API_URL || 'http://localhost:5000',
      changeOrigin: true,
      secure: true,
      ws: true,
      cookieDomainRewrite: {
        '.onrender.com': ''
      },
      configure: (proxy) => {
        proxy.on('proxyRes', (proxyRes) => {
          const cookies = proxyRes.headers['set-cookie'];
          if (cookies) {
            proxyRes.headers['set-cookie'] = cookies.map(cookie =>
              cookie
                .replace(/Domain=[^;]+;/, '')
                .replace(/SameSite=\w+/, 'SameSite=None')
                .replace(/Secure/, 'Secure')
            );
          }
        });
      }
    }
  }
}
});