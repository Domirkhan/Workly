import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';

export default defineConfig({
  plugins: [
    react(),
    commonjs(),
    nodeResolve()
  ],
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
    rollupOptions: {
      external: ['@rollup/rollup-linux-x64-gnu'],
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['@headlessui/react', 'lucide-react'],
          charts: ['recharts'],
          utils: ['date-fns', 'jspdf', 'jspdf-autotable']
        },
        format: 'es'
      }
    },
    target: 'es2015',
    sourcemap: false,
    minify: 'terser',
    chunkSizeWarningLimit: 1600
  },
  optimizeDeps: {
    exclude: ['@rollup/rollup-linux-x64-gnu']
  }
});