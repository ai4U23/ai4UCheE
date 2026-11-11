// Fragment store: consume #t= → persist → strip; memory fallback when storage is blocked.
// The ambient window.localStorage in this repo's vitest is a method-less stub (node
// --localstorage-file), so every test injects a controlled fake via vi.stubGlobal.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

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

function makeBlockedStorage(): Storage {
  const fake = makeFakeStorage();
  return {
    ...fake,
    setItem: () => {
      throw new DOMException('blocked', 'SecurityError');
    },
  } as Storage;
}

async function freshStore() {
  vi.resetModules();
  return await import('../lib/embed-token-store');
}

describe('embed-token-store', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/app');
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('consumes #t=, stores it, and strips the fragment from the address bar', async () => {
    vi.stubGlobal('localStorage', makeFakeStorage());
    const store = await freshStore();
    window.location.hash = '#t=abc.def';
    store.consumeFragmentToken();
    expect(store.getToken()).toBe('abc.def');
    expect(window.location.hash).toBe('');
    expect(localStorage.getItem('ai4uchee.embed_token.v1')).toBe('abc.def');
  });

  it('returns null with no fragment and clean storage', async () => {
    vi.stubGlobal('localStorage', makeFakeStorage());
    const store = await freshStore();
    store.consumeFragmentToken();
    expect(store.getToken()).toBeNull();
  });

  it('re-reads a persisted token without a fragment (survives reload in the same partition)', async () => {
    vi.stubGlobal('localStorage', makeFakeStorage());
    const store = await freshStore();
    localStorage.setItem('ai4uchee.embed_token.v1', 'stored.tok');
    expect(store.getToken()).toBe('stored.tok');
  });

  it('falls back to memory when storage.setItem throws (sandboxed iframe)', async () => {
    vi.stubGlobal('localStorage', makeBlockedStorage());
    const store = await freshStore();
    window.location.hash = '#t=mem.tok';
    store.consumeFragmentToken();
    expect(store.getToken()).toBe('mem.tok');
    expect(window.location.hash).toBe('');
  });

  it('ignores non-token fragments', async () => {
    vi.stubGlobal('localStorage', makeFakeStorage());
    const store = await freshStore();
    window.location.hash = '#section-3';
    store.consumeFragmentToken();
    expect(store.getToken()).toBeNull();
    expect(window.location.hash).toBe('#section-3');
  });
});
