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
        manualChunks: undefined,
        format: 'es'
      }
    },
    target: 'es2015',
    sourcemap: false,
    minify: 'terser'
  },
  optimizeDeps: {
    exclude: ['@rollup/rollup-linux-x64-gnu']
  }
});