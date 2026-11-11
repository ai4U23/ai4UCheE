// URL-fragment embed-token store: #t=<token> → localStorage (storage-partitioned per top-site in
// embed contexts) with in-memory fallback → history.replaceState strip. The token NEVER travels
// in query params, router state, or internal links (grepped invariant — phase-02).
const STORAGE_KEY = 'ai4uchee.embed_token.v1';
const FRAGMENT_RE = /^#t=([A-Za-z0-9\-_.]+)/;

/** Event fired on any 401 from the gated API; the TokenExpiredBanner listens. */
export const AUTH_ERROR_EVENT = 'che:unauthorized';

let memoryToken: string | null = null;

function setToken(token: string): void {
  memoryToken = token;
  try {
    localStorage.setItem(STORAGE_KEY, token);
  } catch {
    /* sandboxed iframe / storage blocked → memory fallback; the iframe src re-carries #t= on reload */
  }
}

/** Read #t= from the address bar once, persist it, and strip the fragment. Idempotent. */
export function consumeFragmentToken(): void {
  if (typeof window === 'undefined') return;
  const match = FRAGMENT_RE.exec(window.location.hash);
  if (!match) return;
  setToken(match[1]);
  try {
    window.history.replaceState(null, '', window.location.pathname + window.location.search);
  } catch {
    /* history API unavailable → fragment stays, token still stored */
  }
}

export function getToken(): string | null {
  if (memoryToken) return memoryToken;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      memoryToken = stored;
      return stored;
    }
  } catch {
    /* storage blocked → memory only */
  }
  return memoryToken;
}

/**
 * True when this browser session carries an embed token (the PVU SharePoint framing). Gates
 * student-visible escapes: share menu, showcase external link, and the ai4u.now hostnames in
 * trust-boundary copy — students only ever see the SharePoint address bar (plan 261111 ak-fix).
 */
export function isEmbedSession(): boolean {
  return getToken() !== null;
}

/** Test-only: clear the token from memory + storage so base (non-embed) variants assert cleanly. */
export function resetEmbedTokenStoreForTests(): void {
  memoryToken = null;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* no storage (Node) — memory is already cleared */
  }
}

/** Surface a 401 (with its code) to the shell so the vi banner can appear. */
export function onUnauthorized(code: string): void {
  try {
    window.dispatchEvent(new CustomEvent(AUTH_ERROR_EVENT, { detail: { code } }));
  } catch {
    /* no window (Node) — tests assert on the middleware directly */
  }
}
