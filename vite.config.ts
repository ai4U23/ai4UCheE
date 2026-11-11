/// <reference types="vitest/config" />
import fs from 'node:fs';
import path from 'node:path';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { transformHtmlForRequest } from './src/server/html-locale-responder';

function discoveryHeadersPlugin(): Plugin {
  const publicDir = path.resolve(__dirname, 'public');
  return {
    name: 'ax-discovery-headers',
    transformIndexHtml(html, ctx) {
      return transformHtmlForRequest(html, ctx.originalUrl ?? ctx.path ?? '/app');
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const rawUrl = req.url ?? '/';
        const urlPath = rawUrl.split('?')[0];
        if (urlPath === '/' || urlPath === '/showcase.html') {
          res.setHeader('Vary', 'Accept');
          if (String(req.headers.accept ?? '').includes('text/markdown')) {
            res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
            res.setHeader('X-Robots-Tag', 'noindex');
            res.end(fs.readFileSync(path.join(publicDir, 'index.md'), 'utf8'));
            return;
          }
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          const rawHtml = fs.readFileSync(path.join(publicDir, 'showcase.html'), 'utf8');
          res.end(transformHtmlForRequest(rawHtml, rawUrl, String(req.headers['accept-language'] ?? '')));
          return;
        } else if (urlPath === '/app' || urlPath === '/workbench' || urlPath === '/index.html') {
          res.setHeader('Vary', 'Accept');
          if (String(req.headers.accept ?? '').includes('text/markdown')) {
            res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
            res.setHeader('X-Robots-Tag', 'noindex');
            res.end(fs.readFileSync(path.join(publicDir, 'index.md'), 'utf8'));
            return;
          }
          req.url = '/index.html';
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

/**
 * Build-time canonical-host rewrite for branded editions (plan 261111 ak-fix): index.html's
 * canonical/og/JSON-LD ship hardcoded to the AWS host; the PVU container builds with
 * VITE_CANONICAL_URL=https://chemeng-pvu.ai4u.now so the served head never advertises the
 * wrong deployment. Default (env unset) = byte-identical AWS output.
 */
function brandCanonicalHostPlugin(): Plugin {
  const canonicalHost = process.env.VITE_CANONICAL_URL ?? '';
  return {
    name: 'ax-brand-canonical-host',
    transformIndexHtml(html) {
      if (!canonicalHost || canonicalHost === 'https://chemeng.ai4u.now') return html;
      return html.replaceAll('https://chemeng.ai4u.now', canonicalHost);
    },
  };
}

export default defineConfig({
  plugins: [discoveryHeadersPlugin(), brandCanonicalHostPlugin(), react()],
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
