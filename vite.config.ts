/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: { port: 5173, strictPort: false, proxy: { '/api': 'http://127.0.0.1:3000' } },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('katex')) return 'vendor-katex';
            if (id.includes('motion') || id.includes('lucide-react') || id.includes('zod') || id.includes('clsx')) {
              return 'vendor-motion-ui';
            }
            if (id.includes('react')) return 'vendor-react';
          }
          if (id.includes('/src/lib/perry-sections/')) return 'perry-atlas-solvers';
          if (id.includes('/src/components/sketches/')) return 'che-interactive-sketches';
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/__tests__/**/*.test.{ts,tsx}'],
    testTimeout: 20000,
  },
});
