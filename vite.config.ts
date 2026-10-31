/// <reference types="vitest/config" />
import fs from 'node:fs';
import path from 'node:path';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

function discoveryHeadersPlugin(): Plugin {
  const publicDir = path.resolve(__dirname, 'public');
  return {
    name: 'ax-discovery-headers',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const urlPath = (req.url ?? '/').split('?')[0];
        if (urlPath === '/' || urlPath === '/index.html') {
          res.setHeader('Vary', 'Accept');
          if (String(req.headers.accept ?? '').includes('text/markdown')) {
            res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
            res.setHeader('X-Robots-Tag', 'noindex');
            res.end(fs.readFileSync(path.join(publicDir, 'index.md'), 'utf8'));
            return;
          }
        } else if (urlPath === '/index.md' || urlPath === '/index.html.md') {
          res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
          res.setHeader('X-Robots-Tag', 'noindex');
          res.end(fs.readFileSync(path.join(publicDir, 'index.md'), 'utf8'));
          return;
        } else if (urlPath === '/llms.txt' || urlPath === '/llms-full.txt') {
          res.setHeader('Content-Type', 'text/plain; charset=utf-8');
          res.setHeader('X-Robots-Tag', 'noindex');
          res.end(fs.readFileSync(path.join(publicDir, urlPath.slice(1)), 'utf8'));
          return;
        }
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [discoveryHeadersPlugin(), react()],
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
