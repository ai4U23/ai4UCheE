// Browser-persist hop (phase-03's actual feature): running generate-calc-sheet IN a browser context
// (window defined, no Node persister) must POST the record to /api/saved-calculations with the
// X-Client-Id header attached — the private-saves path that previously did not exist.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

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

const calls: Array<{ url: string; init: RequestInit }> = [];

beforeEach(() => {
  calls.length = 0;
  vi.resetModules();
  vi.stubGlobal('localStorage', makeFakeStorage());
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string | URL | Request, init?: RequestInit) => {
      calls.push({ url: String(url), init: init ?? {} });
      return {
        ok: true,
        json: async () => ({ html_document: '<html><body>sheet</body></html>', markdown_latex: '# sheet' }),
      } as unknown as Response;
    }),
  );
});
afterEach(() => {
  vi.unstubAllGlobals();
});

describe('browser default persister (the feature hop)', () => {
  it('POSTs the compiled record to /api/saved-calculations with the X-Client-Id header', async () => {
    const mod = await import('../actions/generate-calc-sheet');
    const out = (await mod.generateCalcSheetAction.run({})) as Record<string, unknown>;
    expect(out.html_document).toBeTruthy();
    const persist = calls.find((c) => c.url === '/api/saved-calculations' && c.init.method === 'POST');
    if (!persist) throw new Error('persist POST not found among fetch calls');
    const headers = persist.init.headers as Headers;
    expect(headers.get('X-Client-Id')).toMatch(UUID_RE);
    const body = JSON.parse(String(persist.init.body)) as { id: string; inputsJson: string };
    expect(body.id).toMatch(/^calc-/);
    expect(JSON.parse(body.inputsJson)).toEqual({ Flow: '250 gpm', Pipe: '4-in Sch 40' });
  });

  it('keeps the session copy in memory even if the persist POST fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string | URL | Request, init?: RequestInit) => {
        calls.push({ url: String(url), init: init ?? {} });
        if (String(url) === '/api/saved-calculations') {
          throw new TypeError('network down');
        }
        return {
          ok: true,
          json: async () => ({ html_document: '<html></html>', markdown_latex: '# x' }),
        } as unknown as Response;
      }),
    );
    const mod = await import('../actions/generate-calc-sheet');
    const out = (await mod.generateCalcSheetAction.run({})) as Record<string, unknown>;
    expect(out.html_document).toBeTruthy();
    expect(mod.getSavedCalculationsMemory().length).toBeGreaterThan(0);
  });
});
