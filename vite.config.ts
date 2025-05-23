import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  esbuild: {
    target: 'esnext', // or 'es2022'
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});