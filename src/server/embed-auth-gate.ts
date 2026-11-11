// PVU embed auth gate: Express wiring for the embed-token core (embed-token-verify.ts).
// REVOCATION FEED: per-JTI set + artifact epoch (iat <= epoch deny, INCLUSIVE — mirrors
// token_manager) from CHE_EMBED_REVOCATION_URL feed {"slug","jtis","epoch"}; 60s refresh; fetch
// failure keeps the last known set — DOCUMENTED FAIL-OPEN divergence from upstream's fail-closed
// (classroom availability over publish-engine outage; HMAC + temporal checks stay the hard gate;
// "URL set but never synced" is loud at boot). The whole mount is flag-gated: CHE_EMBED_AUTH=1
// or nothing mounts — flag-off keeps the chemeng AWS deployment byte-identical.
import type { Express, NextFunction, Request, Response } from 'express';
import { rateLimit } from 'express-rate-limit';
import {
  verifyEmbedToken,
  MIN_SECRET_LEN,
  primarySecret,
  type EmbedTokenClaims,
} from './embed-token-verify';

let revokedJtis = new Set<string>();
let revocationEpoch: number | null = null;
let revocationTimer: NodeJS.Timeout | null = null;
let revocationEverSynced = false;

async function syncRevocations(): Promise<void> {
  const url = process.env.CHE_EMBED_REVOCATION_URL;
  if (!url) return;
  try {
    const headers: Record<string, string> = {};
    const token = (process.env.CHE_EMBED_REVOCATION_TOKEN ?? '').trim();
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await fetch(url, { headers, signal: AbortSignal.timeout(5000) });
    if (!res.ok) throw new Error(`feed HTTP ${res.status}`);
    const feed = (await res.json()) as { slug?: string; jtis?: unknown; epoch?: unknown };
    revokedJtis = new Set(Array.isArray(feed.jtis) ? feed.jtis.map(String) : []);
    revocationEpoch = typeof feed.epoch === 'number' ? feed.epoch : null;
    revocationEverSynced = true;
  } catch (err) {
    if (!revocationEverSynced) {
      console.error(
        '[embed-auth] CHE_EMBED_REVOCATION_URL set but first sync failed — revocation tier (JTI/epoch) ' +
          'INACTIVE until a sync succeeds. HMAC + temporal checks remain the hard gate.',
        err,
      );
    } else {
      console.warn('[embed-auth] revocation feed sync failed — keeping last known set (fail-open, documented divergence).', err);
    }
  }
}

export function startRevocationSync(): void {
  if (revocationTimer || !process.env.CHE_EMBED_REVOCATION_URL) return;
  void syncRevocations();
  revocationTimer = setInterval(() => {
    void syncRevocations();
  }, 60_000);
  revocationTimer.unref?.();
}

export function embedAuthEnabled(): boolean {
  return process.env.CHE_EMBED_AUTH === '1';
}

export function validateSecretOrExit(): void {
  if (!embedAuthEnabled()) return;
  const s = (process.env.CHE_EMBED_TOKEN_SECRET ?? '').trim();
  if (s.length < MIN_SECRET_LEN) {
    console.error(
      `[embed-auth] CHE_EMBED_AUTH=1 requires CHE_EMBED_TOKEN_SECRET >= ${MIN_SECRET_LEN} bytes — refusing to start (fail-closed).`,
    );
    process.exit(1);
  }
}

export function applyFrameAncestorsCsp(res: Response): void {
  res.setHeader('Content-Security-Policy', "frame-ancestors 'self' https://*.sharepoint.com");
}

export function createEmbedAuthMiddleware() {
  return (req: Request, res: Response, next: NextFunction): void => {
    const header = req.headers.authorization ?? '';
    if (!header.startsWith('Bearer ')) {
      res.status(401).json({ error: 'unauthorized', code: 'token_missing' });
      return;
    }
    const result = verifyEmbedToken(header.slice('Bearer '.length), {
      now: Math.floor(Date.now() / 1000),
      revokedJtis,
      revocationEpoch,
    });
    if (!result.ok) {
      res.status(401).json({ error: 'unauthorized', code: result.code });
      return;
    }
    (req as Request & { embedClaims?: EmbedTokenClaims }).embedClaims = result.claims;
    next();
  };
}

export function createApiRateLimiters() {
  const general = rateLimit({
    windowMs: 60_000,
    limit: Number(process.env.CHE_API_RATE_LIMIT_PER_MIN ?? 300),
    standardHeaders: 'draft-7',
    legacyHeaders: false,
  });
  const copilot = rateLimit({
    windowMs: 60_000,
    limit: Number(process.env.CHE_COPILOT_RATE_LIMIT_PER_MIN ?? 20),
    standardHeaders: 'draft-7',
    legacyHeaders: false,
  });
  return { general, copilot };
}

/**
 * Mount the entire gate — ONLY when CHE_EMBED_AUTH=1. Call once after express.json and before the
 * first /api route. Mount order: trust proxy → general limiter (/api) → copilot limiter
 * (/api/copilot) → auth middleware (/api, /health naturally exempt) → CSP all-routes → revocation sync.
 */
export function mountEmbedAuth(app: Express): void {
  if (!embedAuthEnabled()) return;
  validateSecretOrExit();
  app.set('trust proxy', 1);
  const { general, copilot } = createApiRateLimiters();
  app.use('/api', general);
  app.use('/api/copilot', copilot);
  app.use('/api', createEmbedAuthMiddleware());
  app.use((_req: Request, res: Response, next: NextFunction): void => {
    applyFrameAncestorsCsp(res);
    next();
  });
  startRevocationSync();
}
