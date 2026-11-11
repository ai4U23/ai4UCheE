// @vitest-environment node
// Integration gate: boots the REAL createApiServer with CHE_EMBED_AUTH=1 and asserts the mount
// end-to-end — every /api route 401s bare (including the sidecar proxies), /health stays ungated,
// a valid token 200s, the copilot limiter 429s, CSP is present; then flag-off parity (open API,
// no CSP) — the AWS byte-identical law. Mount-order regressions cannot hide from this file.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createApiServer } from '../server/api-server';
import { copilotRateKey } from '../server/embed-auth-gate';
import { mintEmbedToken } from '../server/embed-token-verify';

const GOLDEN_SECRET = 'che-golden-secret-0123456789abcdef0123456789';
const ENV_KEYS = ['CHE_EMBED_AUTH', 'CHE_EMBED_TOKEN_SECRET', 'CHE_EMBED_TOKEN_SECRET_FALLBACK', 'CHE_EMBED_REVOCATION_URL'] as const;
const savedEnv: Record<string, string | undefined> = {};

let base = '';
let server: Server;

async function bootApp(): Promise<{ url: string; close: () => Promise<void> }> {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'che-auth-'));
  const app = createApiServer(path.join(dir, 'test.sqlite'));
  const s = app.listen(0, '127.0.0.1');
  await new Promise<void>((resolve) => s.once('listening', resolve));
  return {
    url: `http://127.0.0.1:${(s.address() as AddressInfo).port}`,
    close: () => new Promise<void>((resolve) => s.close(() => resolve())),
  };
}

beforeAll(async () => {
  for (const k of ENV_KEYS) savedEnv[k] = process.env[k];
  process.env.CHE_EMBED_AUTH = '1';
  process.env.CHE_EMBED_TOKEN_SECRET = GOLDEN_SECRET;
  delete process.env.CHE_EMBED_REVOCATION_URL;
  ({ url: base } = await bootApp());
});

afterAll(() => {
  for (const [k, v] of Object.entries(savedEnv)) {
    if (v === undefined) delete process.env[k];
    else process.env[k] = v;
  }
});

const nowSecs = () => Math.floor(Date.now() / 1000);
const mint = () => mintEmbedToken({ secret: GOLDEN_SECRET, iat: nowSecs() - 10, ttlSeconds: 3600 });

async function hit(url: string, init?: RequestInit): Promise<{ status: number; body: Record<string, unknown> | null }> {
  const res = await fetch(`${base}${url}`, init);
  let body: Record<string, unknown> | null = null;
  try {
    body = (await res.json()) as Record<string, unknown>;
  } catch {
    /* non-JSON (e.g. proxied 502 text) */
  }
  return { status: res.status, body };
}

const post = (url: string, auth?: string) =>
  hit(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(auth ? { Authorization: `Bearer ${auth}` } : {}),
    },
    body: '{}',
  });

describe('embed auth gate — flag ON, real server', () => {
  it('bare POST /api/copilot → 401 token_missing (mandatory negative control)', async () => {
    const r = await post('/api/copilot');
    expect(r.status).toBe(401);
    expect(r.body?.code).toBe('token_missing');
  });

  it('bare GET /api/saved-calculations → 401', async () => {
    const r = await hit('/api/saved-calculations');
    expect(r.status).toBe(401);
  });

  it('bare POST /api/v1/units/convert → 401 (gated BEFORE the sidecar proxy)', async () => {
    const r = await post('/api/v1/units/convert');
    expect(r.status).toBe(401);
  });

  it('bare POST /api/perry/search → 401 (gated BEFORE the sidecar proxy)', async () => {
    const r = await post('/api/perry/search');
    expect(r.status).toBe(401);
  });

  it('GET /health is ungated (200 with live sidecar, 502 with sidecar down — never 401)', async () => {
    const r = await hit('/health');
    expect([200, 502]).toContain(r.status);
  });

  it('valid token → 200 on /api/copilot (Tier-1 deterministic under VITEST)', async () => {
    const r = await post('/api/copilot', mint());
    expect(r.status).toBe(200);
    expect(r.body?.ok).toBe(true);
  });

  it('expired token → 401 token_expired', async () => {
    const expired = mintEmbedToken({ secret: GOLDEN_SECRET, iat: nowSecs() - 7200, ttlSeconds: 3600 });
    const r = await post('/api/copilot', expired);
    expect(r.status).toBe(401);
    expect(r.body?.code).toBe('token_expired');
  });

  it('share-purpose token → 401 token_wrong_purpose', async () => {
    const share = mintEmbedToken({ secret: GOLDEN_SECRET, iat: nowSecs() - 10, ttlSeconds: 3600, purpose: 'share' });
    const r = await post('/api/copilot', share);
    expect(r.status).toBe(401);
    expect(r.body?.code).toBe('token_wrong_purpose');
  });

  it('CSP frame-ancestors is present on /app (SharePoint framing allowlist)', async () => {
    const res = await fetch(`${base}/app`);
    expect(res.headers.get('content-security-policy')).toContain("frame-ancestors 'self' https://*.sharepoint.com");
  });

  it('copilot limiter 429s past the per-minute cap', async () => {
    const statuses: number[] = [];
    for (let i = 0; i < 25; i++) {
      const res = await fetch(`${base}/api/copilot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${mint()}` },
        body: '{}',
      });
      statuses.push(res.status);
    }
    expect(statuses.filter((s) => s === 429).length).toBeGreaterThan(0);
  });

  it('copilot limiter buckets per X-Client-Id — classroom NAT isolation (real server)', async () => {
    const saved = process.env.CHE_COPILOT_RATE_LIMIT_PER_MIN;
    process.env.CHE_COPILOT_RATE_LIMIT_PER_MIN = '2';
    const app = await bootApp();
    try {
      const fire = (headers: Record<string, string>) =>
        fetch(`${app.url}/api/copilot`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...headers },
          body: '{}',
        });
      const cidA = { 'X-Client-Id': '11111111-1111-4111-8111-111111111111' };
      const cidB = { 'X-Client-Id': '22222222-2222-4222-8222-222222222222' };
      // Limiter runs BEFORE auth — 401s still count; no token needed to observe bucketing.
      expect((await fire(cidA)).status).toBe(401); // bucket A: 1
      expect((await fire(cidA)).status).toBe(401); // bucket A: 2
      expect((await fire(cidA)).status).toBe(429); // A exhausted → per-client keying proven
      expect((await fire(cidB)).status).toBe(401); // B independent of A
      expect((await fire({ 'X-Client-Id': 'garbage' })).status).toBe(401); // ip bucket: 1
      expect((await fire({})).status).toBe(401); // ip bucket: 2
      expect((await fire({})).status).toBe(429); // ip exhausted → fallback keying proven
    } finally {
      await app.close();
      if (saved === undefined) delete process.env.CHE_COPILOT_RATE_LIMIT_PER_MIN;
      else process.env.CHE_COPILOT_RATE_LIMIT_PER_MIN = saved;
    }
  });
});

describe('copilotRateKey (pure key matrix)', () => {
  const req = (headers: Record<string, unknown>, ip = '203.0.113.9') =>
    ({ headers, ip }) as unknown as Parameters<typeof copilotRateKey>[0];

  it('a valid UUID client id keys the browser, not the IP', () => {
    expect(copilotRateKey(req({ 'x-client-id': '11111111-1111-4111-8111-111111111111' }))).toBe(
      'cid:11111111-1111-4111-8111-111111111111',
    );
  });

  it('garbage / absent client ids fall back to the per-IP bucket', () => {
    expect(copilotRateKey(req({ 'x-client-id': 'not-a-uuid' }))).toBe('ip:203.0.113.9');
    expect(copilotRateKey(req({}))).toBe('ip:203.0.113.9');
  });

  it('a missing ip never produces an empty key', () => {
    expect(copilotRateKey(req({}, undefined)).length).toBeGreaterThan('ip:'.length);
  });
});

describe('flag OFF parity — default AWS deployment behavior', () => {
  it('bare POST /api/copilot → 200 with no CSP (open API, byte-identical default)', async () => {
    process.env.CHE_EMBED_AUTH = '0';
    const app = await bootApp();
    try {
      const res = await fetch(`${app.url}/api/copilot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      });
      expect(res.status).toBe(200);
      expect(res.headers.get('content-security-policy')).toBeNull();
    } finally {
      await app.close();
      process.env.CHE_EMBED_AUTH = '1';
    }
  });
});
