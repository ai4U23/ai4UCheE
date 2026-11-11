// Embed-token verifier matrix. The GOLDEN fixture was minted by the REAL ai4UPVU engine
// (token_manager.create_signed_token, uuid4+time pinned) — never hand-written (kongming 261111).
// The spec-mirror signer is pinned byte-identical to that fixture, so negatives minted through it
// are provably engine-shaped.
import crypto from 'node:crypto';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { mintEmbedToken, verifyEmbedToken, type VerifyResult } from '../server/embed-token-verify';

const GOLDEN_SECRET = 'che-golden-secret-0123456789abcdef0123456789';
const FIXED_NOW = 1794384000; // 2026-11-11T12:00:00Z (pinned at mint time)
const EXP = 1796976000; // FIXED_NOW + 30d
const IN_WINDOW = FIXED_NOW + 60;
const GOLDEN_JTI = '12345678-1234-5678-1234-567812345678';
const GOLDEN_TOKEN =
  'eyJhdWQiOiJhcnRpZmFjdF92aWV3ZXIiLCJleHAiOjE3OTY5NzYwMDAsImlhdCI6MTc5NDM4NDAwMCwianRpIjoiMTIzNDU2NzgtMTIzNC01Njc4LTEyMzQtNTY3ODEyMzQ1Njc4IiwibmJmIjoxNzk0Mzg0MDAwLCJwdXJwb3NlIjoiZW1iZWQiLCJzbHVnIjoiY2hlLXdvcmtiZW5jaCIsInN1YiI6InB2dS1jb2hvcnQifQ.UMEp1Vk4Ynf7w8sfIjX9KpzP3_1G5XzNPMnuDaUVz7Q';
const SHARE_TOKEN =
  'eyJhdWQiOiJhcnRpZmFjdF92aWV3ZXIiLCJleHAiOjE3OTY5NzYwMDAsImlhdCI6MTc5NDM4NDAwMCwianRpIjoiMTIzNDU2NzgtMTIzNC01Njc4LTEyMzQtNTY3ODEyMzQ1Njc4IiwibmJmIjoxNzk0Mzg0MDAwLCJwdXJwb3NlIjoic2hhcmUiLCJzbHVnIjoiY2hlLXdvcmtiZW5jaCIsInN1YiI6InB2dS1jb2hvcnQifQ.MQXXiK37oYEkZSqGegE-YRCaz3TxwdrMcJeHn1iGdeY';

beforeEach(() => {
  process.env.CHE_EMBED_TOKEN_SECRET = GOLDEN_SECRET;
  delete process.env.CHE_EMBED_TOKEN_SECRET_FALLBACK;
});
afterEach(() => {
  delete process.env.CHE_EMBED_TOKEN_SECRET;
  delete process.env.CHE_EMBED_TOKEN_SECRET_FALLBACK;
});

const verify = (token: string, now: number, extra: Record<string, unknown> = {}): VerifyResult =>
  verifyEmbedToken(token, { now, ...extra });

const code = (r: VerifyResult): string => (r.ok ? 'ok' : r.code);

describe('spec-mirror signer', () => {
  it('mints byte-identical to the REAL engine mint (golden pin)', () => {
    expect(mintEmbedToken({ secret: GOLDEN_SECRET, iat: FIXED_NOW, ttlSeconds: 30 * 86400 })).toBe(GOLDEN_TOKEN);
  });
});

describe('verifyEmbedToken — golden real-mint matrix', () => {
  it('accepts the golden token and returns the exact minted claims', () => {
    const r = verify(GOLDEN_TOKEN, IN_WINDOW);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.claims).toEqual({
        jti: GOLDEN_JTI,
        slug: 'che-workbench',
        iat: FIXED_NOW,
        exp: EXP,
        nbf: FIXED_NOW,
        aud: 'artifact_viewer',
        sub: 'pvu-cohort',
        purpose: 'embed',
      });
    }
  });

  it('rejects at exp == now (strict upstream boundary)', () => {
    expect(code(verify(GOLDEN_TOKEN, EXP))).toBe('token_expired');
  });

  it('accepts at nbf == now', () => {
    expect(verify(GOLDEN_TOKEN, FIXED_NOW).ok).toBe(true);
  });

  it('rejects a share-purpose token (stricter CheE tier — leaked share links must not open the embed)', () => {
    expect(code(verify(SHARE_TOKEN, IN_WINDOW))).toBe('token_wrong_purpose');
  });

  it('rejects a tampered signature', () => {
    const [p, s] = GOLDEN_TOKEN.split('.');
    const tampered = s.slice(0, -1) + (s.endsWith('A') ? 'B' : 'A');
    expect(code(verify(`${p}.${tampered}`, IN_WINDOW))).toBe('token_invalid');
  });

  it('rejects a wrong-LENGTH signature without throwing (timingSafeEqual length guard)', () => {
    const [p] = GOLDEN_TOKEN.split('.');
    const shortSig = Buffer.alloc(31, 7).toString('base64url');
    const r = verify(`${p}.${shortSig}`, IN_WINDOW);
    expect(r.ok).toBe(false);
    expect(code(r)).toBe('token_invalid');
  });

  it('rejects malformed inputs', () => {
    expect(code(verify('not-a-token', IN_WINDOW))).toBe('token_malformed');
    expect(code(verify('a.b.c', IN_WINDOW))).toBe('token_malformed');
    expect(code(verify(`${Buffer.from('{bad json').toString('base64url')}.AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA`, IN_WINDOW))).toBe('token_malformed');
  });

  it('rejects a revoked JTI', () => {
    expect(code(verify(GOLDEN_TOKEN, IN_WINDOW, { revokedJtis: new Set([GOLDEN_JTI]) }))).toBe('token_revoked');
  });

  it('enforces the epoch tier inclusively (iat <= epoch deny; iat > epoch pass)', () => {
    expect(code(verify(GOLDEN_TOKEN, IN_WINDOW, { revocationEpoch: FIXED_NOW }))).toBe('token_revoked');
    expect(verify(GOLDEN_TOKEN, IN_WINDOW, { revocationEpoch: FIXED_NOW - 1 }).ok).toBe(true);
  });

  it('rejects a wrong slug', () => {
    expect(code(verify(GOLDEN_TOKEN, IN_WINDOW, { slug: 'some-other-artifact' }))).toBe('token_wrong_slug');
  });

  it('accepts via the fallback (rotation-overlap) secret', () => {
    process.env.CHE_EMBED_TOKEN_SECRET = 'a'.repeat(40); // rotated primary — old tokens must survive
    process.env.CHE_EMBED_TOKEN_SECRET_FALLBACK = GOLDEN_SECRET;
    expect(verify(GOLDEN_TOKEN, IN_WINDOW).ok).toBe(true);
  });

  it('tolerates padded base64url segments (upstream decode re-pads)', () => {
    const [p, s] = GOLDEN_TOKEN.split('.');
    expect(verify(`${p}==.${s}==`, IN_WINDOW).ok).toBe(true);
  });

  it('treats a missing purpose claim as share → rejected (upstream back-compat)', () => {
    const payload = {
      aud: 'artifact_viewer',
      exp: EXP,
      iat: FIXED_NOW,
      jti: GOLDEN_JTI,
      nbf: FIXED_NOW,
      slug: 'che-workbench',
      sub: 'pvu-cohort',
    };
    const bytes = Buffer.from(JSON.stringify(payload, Object.keys(payload).sort()), 'utf8');
    const sig = crypto.createHmac('sha256', GOLDEN_SECRET).update(bytes).digest('base64url');
    expect(code(verify(`${bytes.toString('base64url')}.${sig}`, IN_WINDOW))).toBe('token_wrong_purpose');
  });
});
