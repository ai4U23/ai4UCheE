// Express host API (port 3000): screen-state endpoint, action runner, and sidecar proxy.
import express, { type Express, type Request, type Response } from 'express';
import { ActionRegistry } from '../actions/define-action';
import {
  getClientAppState,
  serializeCurrentScreenTag,
  writeClientAppState,
} from '../actions/view-screen';

const SIDECAR_BASE = process.env.PERRY_SIDECAR_URL ?? 'http://127.0.0.1:8001';

export function createApiServer(): Express {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

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
    const subPath = req.path.replace(/^\/api\/perry/, '/api/v1');
    const url = `${SIDECAR_BASE}${subPath}`;
    try {
      const upstream = await fetch(url, {
        method: req.method,
        headers: { 'Content-Type': 'application/json' },
        body: req.method === 'GET' ? undefined : JSON.stringify(req.body ?? {}),
      });
      const text = await upstream.text();
      res.status(upstream.status).type('application/json').send(text);
    } catch (err) {
      res.status(502).json({ error: `Sidecar unreachable: ${(err as Error).message}` });
    }
  });

  return app;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const port = Number(process.env.PORT ?? 3000);
  createApiServer().listen(port, () => {
    console.log(`Perry Host API listening on http://127.0.0.1:${port}`);
  });
}
