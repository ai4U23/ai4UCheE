// Express host API & production static server (port 3000):
// Serves dist/ bundle, /api/screen-state, /api/saved-calculations, /api/actions/:actionName,
// wires SQLite persistence for screen_states & saved_calculations, and proxies /api/v1/* & /api/perry/* to :8001.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express, { type Express, type Request, type Response } from 'express';
import { ActionRegistry } from '../actions';
import { registerSavedCalculationsRoutes, setActionClientId } from './saved-calculations-route';
import {
  getClientAppState,
  serializeCurrentScreenTag,
  writeClientAppState,
} from '../actions/view-screen';
import { getConn, initDb } from '../db/client';
import { registerCopilotRoute } from './copilot-route';
import { mountEmbedAuth } from './embed-auth-gate';
import { proxyToSidecar } from './sidecar-proxy';
import { transformHtmlForRequest } from './html-locale-responder';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.resolve(__dirname, '../../dist');

export function createApiServer(dbPath?: string): Express {
  initDb(dbPath);

  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '10mb' }));

  // PVU embed auth gate — mounts only when CHE_EMBED_AUTH=1 (flag-off default keeps the chemeng
  // AWS deployment byte-identical). Mount order + policy live in embed-auth-gate.ts.
  mountEmbedAuth(app);
  registerSavedCalculationsRoutes(app);

  app.get('/health', async (req: Request, res: Response): Promise<void> => {
    await proxyToSidecar(req, res, '/health');
  });

  app.get('/api/screen-state', (_req: Request, res: Response): void => {
    const state = getClientAppState();
    res.json({ state, xml: serializeCurrentScreenTag(state) });
  });

  app.post('/api/screen-state', (req: Request, res: Response): void => {
    const next = writeClientAppState(req.body ?? {});
    getConn()
      .prepare(
        `INSERT OR REPLACE INTO screen_states
         (id, active_workbench, persona_mode, theme_mode, selected_chips_json, payload_json, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        'default',
        next.activeWorkbench,
        next.personaMode,
        next.themeMode,
        JSON.stringify(next.selectedChips),
        JSON.stringify(next.payload),
        next.updatedAt,
      );
    res.json({ state: next, xml: serializeCurrentScreenTag(next) });
  });

  app.post('/api/actions/:actionName', async (req: Request, res: Response): Promise<void> => {
    const name = String(req.params.actionName);
    const action = ActionRegistry.get(name);
    if (!action) {
      res.status(404).json({ error: `Unknown action '${name}'` });
      return;
    }
    setActionClientId(req.headers['x-client-id']);
    try {
      const parsed = action.schema.parse(req.body ?? {});
      const output = await action.handler(parsed);
      res.json({ ok: true, action: name, output });
    } catch (err) {
      res.status(400).json({ ok: false, error: (err as Error).message });
    } finally {
      setActionClientId('');
    }
  });

  registerCopilotRoute(app); // POST /api/copilot + GET /api/copilot/status (Tier-2 gateway, Tier-1 fallback)

  app.all('/api/perry/*', async (req: Request, res: Response): Promise<void> => {
    await proxyToSidecar(req, res, req.path.replace(/^\/api\/perry/, '/api/v1'));
  });

  app.all('/api/v1/*', async (req: Request, res: Response): Promise<void> => {
    await proxyToSidecar(req, res, req.path);
  });

  app.get(['/', '/showcase.html'], (req: Request, res: Response): void => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.setHeader('Vary', 'Accept');
    if (String(req.headers.accept ?? '').includes('text/markdown')) {
      res.setHeader('X-Robots-Tag', 'noindex');
      res.type('text/markdown; charset=utf-8').sendFile(path.join(DIST_DIR, 'index.md'));
      return;
    }
    const rawHtml = fs.readFileSync(path.join(DIST_DIR, 'showcase.html'), 'utf8');
    res.type('text/html; charset=utf-8').send(transformHtmlForRequest(rawHtml, req.originalUrl || req.url, String(req.headers['accept-language'] ?? '')));
  });

  app.get(['/app', '/workbench', '/index.html'], (req: Request, res: Response): void => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.setHeader('Vary', 'Accept');
    if (String(req.headers.accept ?? '').includes('text/markdown')) {
      res.setHeader('X-Robots-Tag', 'noindex');
      res.type('text/markdown; charset=utf-8').sendFile(path.join(DIST_DIR, 'index.md'));
      return;
    }
    const rawHtml = fs.readFileSync(path.join(DIST_DIR, 'index.html'), 'utf8');
    res.type('text/html; charset=utf-8').send(transformHtmlForRequest(rawHtml, req.originalUrl || req.url, String(req.headers['accept-language'] ?? '')));
  });

  app.use(
    express.static(DIST_DIR, {
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('.html')) {
          res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
          res.setHeader('Vary', 'Accept');
        } else if (filePath.endsWith('.md')) {
          res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
          res.setHeader('X-Robots-Tag', 'noindex');
        } else if (filePath.endsWith('llms.txt') || filePath.endsWith('llms-full.txt')) {
          res.setHeader('Content-Type', 'text/plain; charset=utf-8');
          res.setHeader('X-Robots-Tag', 'noindex');
        }
      },
    }),
  );
  app.get('*', (_req: Request, res: Response): void => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.setHeader('Vary', 'Accept');
    res.sendFile(path.join(DIST_DIR, 'index.html'));
  });

  return app;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const port = Number(process.env.PORT ?? 3000);
  const host = process.env.HOST ?? '0.0.0.0';
  createApiServer(process.env.DB_PATH).listen(port, host, () => {
    console.log(`Perry Host API & Workbench UI listening on http://${host}:${port}`);
  });
}
