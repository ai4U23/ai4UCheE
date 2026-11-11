// Sidecar proxy plumbing extracted from api-server.ts (repo <200-LOC law): forwards /api/v1/* and
// /api/perry/* (plus /health) to the PerryEngine FastAPI sidecar, with the offline fallbacks for
// the search routes. Pure plumbing — no app state.
import type { Request, Response } from 'express';

const SIDECAR_BASE = process.env.PERRY_SIDECAR_URL ?? 'http://127.0.0.1:8001';

export async function proxyToSidecar(req: Request, res: Response, targetPath: string): Promise<void> {
  const qs = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
  const url = `${SIDECAR_BASE}${targetPath}${qs}`;
  try {
    const upstream = await fetch(url, {
      method: req.method,
      headers: { 'Content-Type': 'application/json' },
      body: req.method === 'GET' || req.method === 'HEAD' ? undefined : JSON.stringify(req.body ?? {}),
    });
    const contentType = upstream.headers.get('content-type') ?? 'application/json';
    const buf = Buffer.from(await upstream.arrayBuffer());
    if (upstream.status === 404 && (targetPath.includes('search-index') || targetPath.includes('textbooks/search'))) {
      res.status(200).json({ results: [], fallback: 'offline' });
      return;
    }
    res.status(upstream.status).type(contentType).send(buf);
  } catch (err) {
    if (targetPath.includes('search-index') || targetPath.includes('textbooks/search')) {
      res.status(200).json({ results: [], fallback: 'offline' });
      return;
    }
    res.status(502).json({ error: `Sidecar unreachable: ${(err as Error).message}` });
  }
}
