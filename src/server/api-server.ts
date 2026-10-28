// Express host API & production static server (port 3000):
// Serves dist/ bundle, /api/screen-state, /api/actions/:actionName, and proxies /api/v1/* & /api/perry/* to :8001.
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express, { type Express, type Request, type Response } from 'express';
import { ActionRegistry } from '../actions/define-action';
import {
  getClientAppState,
  serializeCurrentScreenTag,
  writeClientAppState,
} from '../actions/view-screen';

const SIDECAR_BASE = process.env.PERRY_SIDECAR_URL ?? 'http://127.0.0.1:8001';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.resolve(__dirname, '../../dist');

async function proxyToSidecar(req: Request, res: Response, targetPath: string): Promise<void> {
  const qs = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
  const url = `${SIDECAR_BASE}${targetPath}${qs}`;
  try {
    const upstream = await fetch(url, {
      method: req.method,
      headers: { 'Content-Type': 'application/json' },
      body: req.method === 'GET' || req.method === 'HEAD' ? undefined : JSON.stringify(req.body ?? {}),
    });
    const text = await upstream.text();
    res.status(upstream.status).type('application/json').send(text);
  } catch (err) {
    res.status(502).json({ error: `Sidecar unreachable: ${(err as Error).message}` });
  }
}

export function createApiServer(): Express {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  app.get('/health', async (req: Request, res: Response): Promise<void> => {
    await proxyToSidecar(req, res, '/health');
  });

  app.get('/api/screen-state', (_req: Request, res: Response): void => {
    const state = getClientAppState();
    res.json({ state, xml: serializeCurrentScreenTag(state) });
  });

  app.post('/api/screen-state', (req: Request, res: Response): void => {
    const next = writeClientAppState(req.body ?? {});
    res.json({ state: next, xml: serializeCurrentScreenTag(next) });
  });

  app.post('/api/actions/:actionName', async (req: Request, res: Response): Promise<void> => {
    const name = String(req.params.actionName);
    const action = ActionRegistry.get(name);
    if (!action) {
      res.status(404).json({ error: `Unknown action '${name}'` });
      return;
    }
    try {
      const parsed = action.schema.parse(req.body ?? {});
      const output = await action.handler(parsed);
      res.json({ ok: true, action: name, output });
    } catch (err) {
      res.status(400).json({ ok: false, error: (err as Error).message });
    }
  });

  app.all('/api/perry/*', async (req: Request, res: Response): Promise<void> => {
    await proxyToSidecar(req, res, req.path.replace(/^\/api\/perry/, '/api/v1'));
  });

  app.all('/api/v1/*', async (req: Request, res: Response): Promise<void> => {
    await proxyToSidecar(req, res, req.path);
  });

  app.use(express.static(DIST_DIR));
  app.get('*', (_req: Request, res: Response): void => {
    res.sendFile(path.join(DIST_DIR, 'index.html'));
  });

  return app;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const port = Number(process.env.PORT ?? 3000);
  const host = process.env.HOST ?? '0.0.0.0';
  createApiServer().listen(port, host, () => {
    console.log(`Perry Host API & Workbench UI listening on http://${host}:${port}`);
  });
}
