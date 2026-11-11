// @vitest-environment node
// Per-browser saves isolation (real createApiServer + temp DB): A/B buckets disjoint, scoped
// DELETE never crosses buckets, legacy ''-bucket semantics preserved, non-UUID headers sanitized,
// id collisions namespaced (PK non-clobber), body client_id ignored (header is the only stamp).
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createApiServer } from '../server/api-server';

const A = '11111111-1111-1111-1111-111111111111';
const B = '22222222-2222-2222-2222-222222222222';

let base = '';
let server: Server;
let dir = '';
const savedAuthFlag = process.env.CHE_EMBED_AUTH;

beforeAll(async () => {
  // This suite tests BUCKET semantics, not auth — pin the gate OFF regardless of the ambient mode
  // (the flag-on leg of the gate itself is covered by embed-auth-integration). Per-file workers
  // keep this env pin isolated from the other suites.
  process.env.CHE_EMBED_AUTH = '0';
  dir = fs.mkdtempSync(path.join(os.tmpdir(), 'che-iso-'));
  const app = createApiServer(path.join(dir, 'iso.sqlite'));
  server = app.listen(0, '127.0.0.1');
  await new Promise<void>((resolve) => server.once('listening', resolve));
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

afterAll(async () => {
  await new Promise<void>((resolve) => server.close(() => resolve()));
  fs.rmSync(dir, { recursive: true, force: true });
  if (savedAuthFlag === undefined) delete process.env.CHE_EMBED_AUTH;
  else process.env.CHE_EMBED_AUTH = savedAuthFlag;
});

const record = (id: string) => ({
  id,
  projectCode: 'AI4U-CHE-2026',
  equipmentTag: `T-${id}`,
  workbenchType: 'hydraulics',
  revision: 'Rev 0',
  inputsJson: '{"Flow":"250 gpm"}',
  outputsJson: '{}',
  equationsJson: '[]',
  createdAt: Date.now(),
});

async function post(body: unknown, clientId?: string): Promise<Response> {
  return fetch(`${base}/api/saved-calculations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(clientId ? { 'X-Client-Id': clientId } : {}) },
    body: JSON.stringify(body),
  });
}

async function getRows(clientId?: string): Promise<Array<{ id: string; client_id: string }>> {
  const res = await fetch(`${base}/api/saved-calculations`, {
    headers: clientId ? { 'X-Client-Id': clientId } : {},
  });
  return ((await res.json()) as { calculations: Array<{ id: string; client_id: string }> }).calculations;
}

async function del(clientId?: string): Promise<{ deleted: number }> {
  const res = await fetch(`${base}/api/saved-calculations`, {
    method: 'DELETE',
    headers: clientId ? { 'X-Client-Id': clientId } : {},
  });
  return (await res.json()) as { deleted: number };
}

describe('private per-browser saves (real server)', () => {
  it('A and B see disjoint buckets', async () => {
    await post(record('a-1'), A);
    await post(record('a-2'), A);
    await post(record('b-1'), B);
    const rowsA = await getRows(A);
    const rowsB = await getRows(B);
    expect(rowsA).toHaveLength(2);
    expect(rowsB).toHaveLength(1);
    expect(rowsA.every((r) => r.client_id === A && r.id.startsWith(`${A}::`))).toBe(true);
    expect(rowsB.every((r) => r.client_id === B)).toBe(true);
  });

  it("B's DELETE removes only B's rows — A survives", async () => {
    const result = await del(B);
    expect(result.deleted).toBe(1);
    expect((await getRows(A))).toHaveLength(2);
    expect((await getRows(B))).toHaveLength(0);
  });

  it('headerless requests use the legacy "" bucket (AWS/dev parity); header-bearing never see it', async () => {
    await post(record('legacy-1'));
    const headerless = await getRows();
    expect(headerless.every((r) => r.client_id === '')).toBe(true);
    expect((await getRows(A)).some((r) => r.client_id === '')).toBe(false);
  });

  it('non-UUID headers are sanitized to the legacy bucket', async () => {
    await post(record('garbage-1'), 'not-a-uuid-just-garbage');
    const headerless = await getRows();
    expect(headerless.some((r) => r.id === 'garbage-1' && r.client_id === '')).toBe(true);
  });

  it('identical client-supplied ids cannot clobber across buckets (namespaced PK)', async () => {
    await post(record('shared-id'), A);
    await post(record('shared-id'), B);
    const rowsA = await getRows(A);
    const rowsB = await getRows(B);
    expect(rowsA.filter((r) => r.id.endsWith('::shared-id'))).toHaveLength(1);
    expect(rowsB.filter((r) => r.id.endsWith('::shared-id'))).toHaveLength(1);
  });

  it('ignores a client_id in the POST body — only the header stamps the bucket', async () => {
    await post({ ...record('spoof-1'), client_id: B }, A);
    const rowsB = await getRows(B);
    expect(rowsB.some((r) => r.id.endsWith('::spoof-1'))).toBe(false);
    const rowsA = await getRows(A);
    expect(rowsA.some((r) => r.id.endsWith('::spoof-1'))).toBe(true);
  });

  it('rejects oversized fields (body-size caps)', async () => {
    const res = await post({ ...record('x'.repeat(200)), projectCode: 'P' }, A);
    expect(res.status).toBe(400);
  });
});
