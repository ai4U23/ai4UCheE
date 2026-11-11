// Embed-token crypto core: verify + mint. Pure spec-mirror — no Express, no state.
// NORMATIVE SPEC = ai4UPVU mcps/publish/token_manager.py (verified line-by-line 2026-11-11):
//   wire  = base64url(canonical_json_payload).base64url(hmac_sha256) — no JWT header, exactly 2 segments
//   HMAC  = over the RAW decoded payload bytes (never re-canonicalized on verify)
//   b64   = RFC 4648 URL-safe; padding stripped on encode, decode re-pads → tolerate padded input
//   sig   = exactly 32 decoded bytes; length-guard BEFORE crypto.timingSafeEqual (it throws on mismatch)
//   time  = deny exp <= now; deny nbf > now (exp==now → 401; nbf==now → pass)
//   claims= aud 'artifact_viewer', slug 'che-workbench'; purpose==='embed' is a STRICTER CheE-only
//           tier (upstream ignores purpose and defaults missing → 'share'; a leaked share-link
//           token must NOT open the embed)
//   secret= CHE_EMBED_TOKEN_SECRET + CHE_EMBED_TOKEN_SECRET_FALLBACK (rotation overlap), ≥32 bytes.
// The Express wiring (middleware, limiters, revocation sync) lives in embed-auth-gate.ts.
import crypto from 'node:crypto';

export const EMBED_SLUG = 'che-workbench';
export const EMBED_AUDIENCE = 'artifact_viewer';
export const EMBED_PURPOSE = 'embed';
export const MIN_SECRET_LEN = 32;

export interface EmbedTokenClaims {
  jti: string;
  slug: string;
  iat: number;
  exp: number;
  nbf: number;
  aud: string;
  sub: string;
  purpose: string;
}

export type VerifyFailureCode =
  | 'token_malformed'
  | 'token_invalid'
  | 'token_expired'
  | 'token_not_yet_valid'
  | 'token_wrong_slug'
  | 'token_wrong_purpose'
  | 'token_revoked';

export type VerifyResult = { ok: true; claims: EmbedTokenClaims } | { ok: false; code: VerifyFailureCode };

export interface VerifyOptions {
  now: number;
  slug?: string;
  revokedJtis?: Set<string>;
  revocationEpoch?: number | null;
}

export function primarySecret(): string | null {
  const s = (process.env.CHE_EMBED_TOKEN_SECRET ?? '').trim();
  return s.length >= MIN_SECRET_LEN ? s : null;
}

export function fallbackSecret(): string | null {
  const s = (process.env.CHE_EMBED_TOKEN_SECRET_FALLBACK ?? '').trim();
  return s.length >= MIN_SECRET_LEN ? s : null;
}

export function verifyEmbedToken(token: string, options: VerifyOptions): VerifyResult {
  const parts = token.trim().split('.');
  if (parts.length !== 2 || !parts[0] || !parts[1]) return { ok: false, code: 'token_malformed' };
  let payloadBytes: Buffer;
  let presentedSig: Buffer;
  let claims: EmbedTokenClaims;
  try {
    payloadBytes = Buffer.from(parts[0], 'base64url');
    presentedSig = Buffer.from(parts[1], 'base64url');
    const parsed = JSON.parse(payloadBytes.toString('utf8')) as Record<string, unknown>;
    claims = {
      jti: String(parsed.jti ?? ''),
      slug: String(parsed.slug ?? ''),
      iat: Number(parsed.iat ?? 0),
      exp: Number(parsed.exp ?? 0),
      nbf: Number(parsed.nbf ?? 0),
      aud: String(parsed.aud ?? ''),
      sub: String(parsed.sub ?? ''),
      // Upstream compat: tokens minted before the purpose claim are share tokens.
      purpose: String(parsed.purpose ?? 'share'),
    };
  } catch {
    return { ok: false, code: 'token_malformed' };
  }
  if (presentedSig.length !== 32) return { ok: false, code: 'token_invalid' };
  const secrets = [primarySecret(), fallbackSecret()].filter((s): s is string => s !== null);
  const sigMatch = secrets.some((secret) =>
    crypto.timingSafeEqual(presentedSig, crypto.createHmac('sha256', secret).update(payloadBytes).digest()),
  );
  if (!sigMatch) return { ok: false, code: 'token_invalid' };
  const now = options.now;
  if (claims.exp <= now) return { ok: false, code: 'token_expired' };
  if (claims.nbf > now) return { ok: false, code: 'token_not_yet_valid' };
  if (claims.slug !== (options.slug ?? EMBED_SLUG)) return { ok: false, code: 'token_wrong_slug' };
  if (claims.aud !== EMBED_AUDIENCE) return { ok: false, code: 'token_invalid' };
  if (claims.purpose !== EMBED_PURPOSE) return { ok: false, code: 'token_wrong_purpose' };
  if (options.revokedJtis?.has(claims.jti)) return { ok: false, code: 'token_revoked' };
  if (options.revocationEpoch != null && claims.iat <= options.revocationEpoch) {
    return { ok: false, code: 'token_revoked' };
  }
  return { ok: true, claims };
}

/**
 * Spec-mirror signer for tests + local round-trip checks. Pinned byte-for-byte against the REAL
 * engine mint by the golden-fixture test (same fixed uuid/time/secret → identical token string),
 * so anything minted here is provably what token_manager produces. Server-side only.
 */
export function mintEmbedToken(opts: {
  secret: string;
  iat: number;
  ttlSeconds?: number;
  jti?: string;
  slug?: string;
  sub?: string;
  purpose?: string;
}): string {
  const payload: EmbedTokenClaims = {
    jti: opts.jti ?? '12345678-1234-5678-1234-567812345678',
    slug: opts.slug ?? EMBED_SLUG,
    iat: opts.iat,
    exp: opts.iat + (opts.ttlSeconds ?? 30 * 86400),
    nbf: opts.iat,
    aud: EMBED_AUDIENCE,
    sub: opts.sub ?? 'pvu-cohort',
    purpose: opts.purpose ?? EMBED_PURPOSE,
  };
  const payloadBytes = Buffer.from(JSON.stringify(payload, Object.keys(payload).sort()), 'utf8');
  const sig = crypto.createHmac('sha256', opts.secret).update(payloadBytes).digest();
  return `${payloadBytes.toString('base64url')}.${sig.toString('base64url')}`;
}
