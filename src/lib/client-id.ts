// Pseudonymous per-browser client id for private saves: crypto.randomUUID persisted at
// ai4uchee.client.id.v1 with memory fallback (sandboxed iframes / storage stubs). Privacy-by-
// partition: no PII, never auth — the phase-02 Bearer gate is the security boundary; this id is
// only a scoping key. Server sanitizes non-UUID values to the legacy '' bucket.
const STORAGE_KEY = 'ai4uchee.client.id.v1';
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

let memoryId: string | null = null;

function mintId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    // Environments without crypto.randomUUID (older jsdom): RFC-4122-shaped from Math.random.
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    });
  }
}

export function getClientId(): string {
  if (memoryId) return memoryId;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && UUID_RE.test(stored)) {
      memoryId = stored;
      return stored;
    }
  } catch {
    /* storage blocked → memory */
  }
  const id = mintId();
  memoryId = id;
  try {
    localStorage.setItem(STORAGE_KEY, id);
  } catch {
    /* memory only */
  }
  return id;
}

/** Deterministic reset for Vitest isolation. */
export function resetClientIdForTests(): void {
  memoryId = null;
}

export const CLIENT_ID_STORAGE_KEY = STORAGE_KEY;
