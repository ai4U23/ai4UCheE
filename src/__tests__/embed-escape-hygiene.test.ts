// Embed-escape hygiene (plan 261111 follow-up, ak-fix 261111): in an embed session (#t= token
// consumed at boot) students must never see or leave for an ai4u.now URL — the share group and
// the showcase frontdoor link are hidden, trust copy carries no ai4u.now hostnames, and the
// boot wiring actually moves #t= into the store before first render. Base (non-embed) variants
// stay verbatim for the AWS host — the byte-identical law.
import fs from 'node:fs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  consumeFragmentToken,
  getToken,
  isEmbedSession,
  resetEmbedTokenStoreForTests,
} from '../lib/embed-token-store';
import { TRUST_BOUNDARY_COPY } from '../lib/trust-boundary-copy';

function fakeStorage(): Storage {
  const map = new Map<string, string>();
  return {
    getItem: (k: string) => (map.has(k) ? (map.get(k) as string) : null),
    setItem: (k: string, v: string) => void map.set(k, String(v)),
    removeItem: (k: string) => void map.delete(k),
    clear: () => map.clear(),
    key: (i: number) => Array.from(map.keys())[i] ?? null,
    get length() {
      return map.size;
    },
  } as Storage;
}

describe('embed escape hygiene — token store + trust copy', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', fakeStorage());
    resetEmbedTokenStoreForTests();
    window.location.hash = '';
  });
  afterEach(() => {
    resetEmbedTokenStoreForTests();
    vi.unstubAllGlobals();
  });

  it('consumeFragmentToken moves #t= into the store and strips the fragment', () => {
    window.location.hash = '#t=embed-token-abc.123-XYZ';
    consumeFragmentToken();
    expect(getToken()).toBe('embed-token-abc.123-XYZ');
    expect(isEmbedSession()).toBe(true);
    expect(window.location.hash).toBe('');
  });

  it('without a token the session is non-embed and AWS trust copy stays verbatim', () => {
    expect(isEmbedSession()).toBe(false);
    expect(TRUST_BOUNDARY_COPY.en.localDemoProfileTooltip).toContain('gateway.ai4u.now');
    expect(TRUST_BOUNDARY_COPY.en.supportPrivacyNote).toContain('support@ai4u.now');
    expect(TRUST_BOUNDARY_COPY.vi.localDemoProfileTooltip).toContain('gateway.ai4u.now');
    expect(TRUST_BOUNDARY_COPY.vi.supportPrivacyNote).toContain('support@ai4u.now');
  });

  it.each(['en', 'vi'] as const)('embed trust copy (%s) shows zero ai4u.now strings', (locale) => {
    window.location.hash = '#t=hygiene-check';
    consumeFragmentToken();
    for (const field of ['localDemoProfileTooltip', 'supportPrivacyNote'] as const) {
      const text = TRUST_BOUNDARY_COPY[locale][field];
      expect(text).not.toMatch(/ai4u\.now/i);
      expect(text).not.toContain('AI4U.now');
      expect(text.length).toBeGreaterThan(80); // redacted, not gutted
    }
  });

  it('embed toggles only the two hostname-bearing fields — all other copy stays verbatim', () => {
    const before = {
      enBoundary: TRUST_BOUNDARY_COPY.en.engineeringBoundaryBody,
      viPersistence: TRUST_BOUNDARY_COPY.vi.calcSheetPersistenceNote,
      enDelete: TRUST_BOUNDARY_COPY.en.deletedSavedSheetsToast,
    };
    window.location.hash = '#t=hygiene-check';
    consumeFragmentToken();
    expect(TRUST_BOUNDARY_COPY.en.engineeringBoundaryBody).toBe(before.enBoundary);
    expect(TRUST_BOUNDARY_COPY.vi.calcSheetPersistenceNote).toBe(before.viPersistence);
    expect(TRUST_BOUNDARY_COPY.en.deletedSavedSheetsToast).toBe(before.enDelete);
  });
});

describe('embed escape hygiene — wiring guards (fs-level pins)', () => {
  it('main.tsx consumes the fragment token BEFORE the first render', () => {
    const src = fs.readFileSync('src/main.tsx', 'utf8');
    expect(src).toContain('consumeFragmentToken()');
    expect(src.indexOf('consumeFragmentToken()')).toBeLessThan(src.indexOf('createRoot('));
  });

  it('app-shell hides the PageAxShareMenu group in embed sessions', () => {
    const src = fs.readFileSync('src/components/shell/app-shell.tsx', 'utf8');
    expect(src).toContain('!isEmbedSession() && <PageAxShareMenu');
  });

  it('showcase modal hides the external frontdoor link in embed sessions', () => {
    const src = fs.readFileSync('src/components/shell/showcase-video-modal.tsx', 'utf8');
    expect(src).toContain('!isEmbedSession() &&');
  });

  it('vite rewrites index.html hardcoded hosts for branded builds (VITE_CANONICAL_URL)', () => {
    const src = fs.readFileSync('vite.config.ts', 'utf8');
    expect(src).toContain("html.replaceAll('https://chemeng.ai4u.now', canonicalHost)");
  });
});
