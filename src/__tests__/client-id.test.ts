// Client-id contract: UUID shape, per-browser stability, memory fallback, fresh-module distinctness.
// Ambient localStorage is a method-less stub here → fake storage via vi.stubGlobal (phase-02 lesson).
import { afterEach, describe, expect, it, vi } from 'vitest';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function makeFakeStorage(): Storage {
  const map = new Map<string, string>();
  return {
    get length() {
      return map.size;
    },
    clear: () => map.clear(),
    getItem: (k: string) => map.get(k) ?? null,
    key: (i: number) => [...map.keys()][i] ?? null,
    removeItem: (k: string) => {
      map.delete(k);
    },
    setItem: (k: string, v: string) => {
      map.set(k, v);
    },
  } as Storage;
}

async function fresh(fake: Storage) {
  vi.resetModules();
  vi.stubGlobal('localStorage', fake);
  return await import('../lib/client-id');
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('client-id', () => {
  it('mints a UUID and persists it', async () => {
    const fake = makeFakeStorage();
    const mod = await fresh(fake);
    const id = mod.getClientId();
    expect(id).toMatch(UUID_RE);
    expect(fake.getItem('ai4uchee.client.id.v1')).toBe(id);
  });

  it('is stable within a browser (same id across calls, re-read from storage)', async () => {
    const fake = makeFakeStorage();
    const mod = await fresh(fake);
    const first = mod.getClientId();
    expect(mod.getClientId()).toBe(first);
    vi.resetModules();
    const mod2 = await import('../lib/client-id');
    expect(mod2.getClientId()).toBe(first);
  });

  it('distinct browsers mint distinct ids', async () => {
    const a = (await fresh(makeFakeStorage())).getClientId();
    const b = (await fresh(makeFakeStorage())).getClientId();
    expect(a).not.toBe(b);
  });

  it('falls back to memory when storage throws (sandboxed iframe)', async () => {
    const blocked = {
      ...makeFakeStorage(),
      setItem: () => {
        throw new DOMException('blocked', 'SecurityError');
      },
    } as Storage;
    const mod = await fresh(blocked);
    const id = mod.getClientId();
    expect(id).toMatch(UUID_RE);
    expect(mod.getClientId()).toBe(id);
  });

  it('resetClientIdForTests mints a fresh id on next call', async () => {
    const fake = makeFakeStorage();
    const mod = await fresh(fake);
    const first = mod.getClientId();
    mod.resetClientIdForTests();
    fake.removeItem('ai4uchee.client.id.v1');
    expect(mod.getClientId()).not.toBe(first);
  });
});
