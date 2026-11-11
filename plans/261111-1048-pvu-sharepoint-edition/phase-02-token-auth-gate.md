# Phase 2 — Token Auth Gate: Middleware, Rate Limit, SPA Token Store, vi Banner

## Context
- Brainstorm: `plans/reports/brainstorm-20261111-pvu-sharepoint-edition.md` · Research: `plans/reports/research-20261111-interactive-html-on-sharepoint.md`
- Token machinery reference (verified): `/Users/nad/ai4u/ai4UPVU/mcps/publish/token_manager.py` — wire format `base64url(canonical_json).base64url(hmac_sha256)`, claims `jti/slug/iat/exp/nbf/aud/sub/purpose`, `aud` fixed to `artifact_viewer` (line 38), min secret length 32 (line 37).
- Related phases: contract consumed by Phase 4 (mint) and enforced live in Phase 5.

## Overview
Priority P1 · Status Pending · Effort 0.5d.
Today every `/api/*` route on `src/server/api-server.ts` is open to the internet. This phase adds an Express middleware that requires a valid Bearer token (HMAC-verified, 30-day, audience-checked) on all `/api/*` calls, adds per-IP rate limits, and teaches the SPA to read the token from the URL fragment, keep it in partitioned localStorage (memory fallback), strip it from the address bar, and attach it to every API call. When the token is missing or expired inside the SharePoint embed, students see the Vietnamese banner "Token hết hạn — liên hệ quản trị".

## Requirements
Functional:
- `Authorization: Bearer <token>` required on every `/api/*` route (including `/api/copilot` and the sidecar proxies `/api/v1/*`, `/api/perry/*`); `/health` exempt; static SPA assets never gated.
- Token verification (RAW-BYTES law, kongming 261111): split on `.` (exactly 2 segments), base64url-decode BOTH segments (padding-tolerant), HMAC-SHA256 over the RAW decoded payload bytes (NEVER re-canonicalize — the signature covers the exact bytes; a JS array-replacer does NOT sort, it whitelists), timing-safe compare with a 32-byte signature length guard BEFORE `crypto.timingSafeEqual` (it throws on length mismatch). Claims checks: deny `exp <= now` (exp==now → 401), deny `nbf > now` (nbf==now → pass), `aud === 'artifact_viewer'`, `slug === 'che-workbench'`, `purpose === 'embed'` (strict CheE-only tier — upstream ignores purpose and defaults missing → 'share'; a leaked share-link token must NOT open the embed). Secrets: `CHE_EMBED_TOKEN_SECRET` then `CHE_EMBED_TOKEN_SECRET_FALLBACK` (rotation overlap, both ≥32 bytes).
- Revocation (two tiers, kongming 261111): in-memory set refreshed every 60 s from `CHE_EMBED_REVOCATION_URL` (Phase 4 provides it) with `Authorization: Bearer $CHE_EMBED_REVOCATION_TOKEN` when set; feed shape `{"slug": "che-workbench", "jtis": [...], "epoch": <float seconds | null>}`. Deny on revoked JTI OR `iat <= epoch` (INCLUSIVE — mirrors token_manager; without the epoch tier, Phase 10's revoke_all_tokens kill switch is FAKE). Fetch failure keeps the last known set (documented fail-open divergence — see Risk); "URL set but never synced" logs LOUDLY at boot. HMAC + temporal remain the hard gate.
- Rate limits: general `CHE_API_RATE_LIMIT_PER_MIN` (default 300 req/min/IP) on `/api/*`; copilot-specific `CHE_COPILOT_RATE_LIMIT_PER_MIN` (default 20 req/min/IP). 429 with `Retry-After`.
- SPA boot: read `#t=` from `location.hash`, store (try localStorage `ai4uchee.embed_token.v1`, catch → in-memory), `history.replaceState` to strip the fragment, never place the token in router state or internal links.
- `authedFetch()` wrapper used by every client API call site; on any 401 the app shows the vi banner.
- Auth is enabled by `CHE_EMBED_AUTH=1` (set in PVU compose, Phase 5). Unset = pass-through, preserving the AWS chemeng deployment and all existing tests.
Non-functional: middleware adds < 1 ms per request (one HMAC); no new cookie; works with third-party storage blocked (Safari) via memory fallback + fragment re-supply on iframe reload.

## Architecture
```
SharePoint page (pvuedu.sharepoint.com)
 └─ <iframe src="https://chemeng.pvu.ai4u.now/app#t=TOKEN">
     └─ SPA boot: parse #t= → store (partitioned localStorage | memory)
        → history.replaceState strips #t= → authedFetch adds
          "Authorization: Bearer TOKEN" to every /api call
caddy (host PVU VPS) → Express :3000
 └─ rate limiters → Bearer middleware (HMAC + claims + JTI cache)
     ├─ /health → pass-through
     ├─ valid token → route handler
     └─ missing/invalid/expired/revoked → 401 → SPA shows vi banner
```
Token lifetime in Safari embeds: localStorage may throw in third-party iframes; the memory copy lives for the page session, and every iframe reload re-receives the fragment from the iframe src (which always carries `#t=`), so sessions re-authenticate silently.

## Related Code Files
| Path | Action | Change |
|---|---|---|
| `src/server/embed-token-verify.ts` | create | Pure crypto core: `verifyEmbedToken` + `mintEmbedToken` (spec mirror, golden-pinned), secret readers, claims/VerifyResult types. (Split per the repo <200-LOC law — kongming 261111.) |
| `src/server/embed-auth-gate.ts` | create | Express wiring: `mountEmbedAuth(app)` (flag-gated: trust proxy → general limiter → copilot limiter → auth middleware → CSP → revocation sync), `validateSecretOrExit` fail-closed when `CHE_EMBED_AUTH=1`. |
| `src/server/api-server.ts` | modify | After `express.json`: single call `mountEmbedAuth(app)` (flag check lives inside the gate; `/health` naturally exempt — it is not under `/api`). `proxyToSidecar` + `SIDECAR_BASE` extracted to `src/server/sidecar-proxy.ts` (LOC law). |
| `src/lib/embed-token-store.ts` | create | `readFragmentToken()`, `getToken()`, `stripFragment()`, `onUnauthorized()`; storage key `ai4uchee.embed_token.v1` (mirrors `src/lib/student-adaptive-model.ts:18` pattern). |
| `src/lib/api-fetch.ts` | create | `authedFetch(url, init)` — attaches Bearer header; on 401 fires `onUnauthorized()`. |
| `src/actions/copilot-responder.ts` | modify | Line 181 fetch → `authedFetch`. |
| `src/actions/run-distillation.ts` | modify | Line 29 fetch → `authedFetch`. |
| `src/actions/run-hydraulics.ts` | modify | Line 40 fetch → `authedFetch`. |
| `src/actions/generate-calc-sheet.ts` | modify | Line 91 fetch → `authedFetch`. |
| `src/actions/query-dippr.ts` | modify | Line 13 fetch → `authedFetch`. |
| `src/actions/search-perry-pdf.ts` | modify | Lines 13 and 23 fetches → `authedFetch`. |
| `src/components/workbenches/calc-sheet-preview-modal.tsx` | modify | Line 162 DELETE fetch → `authedFetch` (header added in Phase 3). |
| `src/components/shell/token-expired-banner.tsx` | create | Vi banner "Token hết hạn — liên hệ quản trị", rendered by app shell on `onUnauthorized()`. |
| `src/components/shell/app-shell.tsx` | modify | Mount the banner. |
| `src/lib/i18n/vi-shell-dictionary.ts` | modify | Add the banner string. |
| `package.json` | modify | Add dependency `express-rate-limit`. |
| `src/__tests__/embed-token-auth.test.ts`, `src/__tests__/embed-token-store.test.ts`, `src/__tests__/embed-auth-integration.test.ts` | create | Verifier matrix (real-engine GOLDEN fixture + spec-mirror pin + full negative set incl. wrong-length sig, exp==now/nbf==now, dual-secret, epoch, share-vector), store (fake storage via `vi.stubGlobal` — ambient localStorage is a method-less stub here), and a REAL-server integration suite (flag-on `createApiServer`: bare 401s on every gated route incl. both proxies, /health ungated, valid-token 200, 429, CSP; flag-off parity open API + no CSP). All in `src/__tests__/` — the vitest include only collects that dir (phase-01 lesson). |

## Tasks

### Task 2.1 — Middleware with hard verification and fail-closed secret
**Goal:** `/api/*` returns 401 without a valid Bearer token when `CHE_EMBED_AUTH=1`, and the server refuses to start with a fake secret.
**Target files and symbols:** `src/server/embed-token-verify.ts` (`verifyEmbedToken`, `mintEmbedToken`), `src/server/embed-auth-gate.ts` (`mountEmbedAuth`), `src/server/api-server.ts` (mount point after `express.json`), env `CHE_EMBED_AUTH`, `CHE_EMBED_TOKEN_SECRET` (+ `_FALLBACK`).
**Steps:**
1. Add `express-rate-limit` to `package.json` dependencies (`npm install express-rate-limit`).
2. Implement per the RAW-BYTES law (see Requirements): HMAC over the decoded payload bytes; never re-canonicalize; mint test fixtures FROM the real `token_manager.create_signed_token` (monkeypatched uuid4/time, fixed test secret) and pin the spec-mirror signer byte-identical against that golden string — never hand-write fixtures.
3. In `createApiServer` after `express.json`: call `mountEmbedAuth(app)` — the ENTIRE gate (trust proxy, limiters, auth, CSP, sync) is flag-gated INSIDE the gate module. Flag-off must keep the AWS deployment byte-identical (no trust-proxy, no limiters, no CSP).
4. At server boot (module init of the middleware factory): if `CHE_EMBED_AUTH=1` and secret missing or `< 32` chars → `console.error` and `process.exit(1)` (mirrors `secret_policy.require_token_secret` posture).
**Success criteria:** With flag on: bare `POST /api/copilot` → 401; with a token minted by the Phase 4 script → 200; boot exits non-zero with a short secret. With flag off: all routes behave exactly as today.
**Verify:** `npx vitest run src/__tests__/embed-token-auth.test.ts` → exit 0 (matrix: golden real-mint fixture accepted + spec-mirror pinned byte-identical to it; no-token/malformed/wrong-content-signature 401; WRONG-LENGTH signature 401 not 500; expired 401 at exp==now; nbf==now passes; wrong slug/aud 401; share-purpose 401; revoked JTI 401; epoch iat<=epoch 401 / iat>epoch 200; dual-secret fallback accepted; padded base64 tolerated) and `npx vitest run src/__tests__/embed-auth-integration.test.ts` → exit 0 (real-server negative controls + 429 + flag-off parity). `npm test` file count must RISE (vacuous-pass guard).

### Task 2.2 — SPA token store and fragment hygiene
**Goal:** Boot inside the embed authenticates silently, the fragment disappears from the address bar, and the token never leaks into links.
**Target files and symbols:** `src/lib/embed-token-store.ts` (`readFragmentToken`, `stripFragment`), `src/lib/api-fetch.ts` (`authedFetch`).
**Steps:**
1. Implement the store: `readFragmentToken()` parses `location.hash` for `#t=<value>`; `getToken()` reads memory first, then localStorage (wrapped in try/catch → memory fallback); `stripFragment()` calls `history.replaceState(null, '', location.pathname + location.search)`.
2. Run store init at app boot before first render's API calls (in the same bootstrap path that resolves locale).
3. Implement `authedFetch(url, init)`: merge `Authorization: Bearer <getToken()>` into headers when a token exists; on response status 401 call `onUnauthorized()`.
4. Replace the eight listed fetch call sites with `authedFetch`; then run `grep -rn "fetch('/api\|fetch(\`\${SIDECAR}" src/ --include='*.ts' --include='*.tsx'` and wrap every remaining hit the same way (the sweep's real result: exactly the 8 listed sites; `/index.md` at `page-ax-share-menu.tsx:52` is a static asset and stays ungated — record the count in the phase summary. PLUS the SIDECAR bug fix, kongming 261111: all five `${SIDECAR}` action files resolved to the STUDENT'S LOOPBACK on default-port HTTPS origins — browser default is now unconditionally relative `''`; AWS https behavior changes broken→working, owner-visible).
5. Assert no code path writes `#t=` into any URL it constructs: `grep -rn "#t=" src/` shows only `embed-token-store.ts`.
**Success criteria:** jsdom boot test with `#t=abc.def` ends with empty `location.hash`, a stored token, and `authedFetch` sending the header; a throwing localStorage still yields a working memory token.
**Verify:** `npx vitest run src/__tests__/embed-token-store.test.ts` → exit 0 (fake storage injected — ambient localStorage is a stub here); `grep -rn "#t=" src/` shows hits ONLY in `embed-token-store.ts` and its test (no router state, no links, no query params).

### Task 2.3 — Vietnamese expiry banner
**Goal:** A student inside the embed with a missing/expired/revoked token sees the vi banner instead of silent failures.
**Target files and symbols:** `src/components/shell/token-expired-banner.tsx` (new), `src/components/shell/app-shell.tsx` (mount), `src/lib/i18n/vi-shell-dictionary.ts` (string), `src/lib/embed-token-store.ts` (`onUnauthorized`).
**Steps:**
1. Add the exact string "Token hết hạn — liên hệ quản trị" to the vi shell dictionary with an English counterpart ("Access token expired — contact the administrator").
2. Implement the banner component: hidden by default; shown when `onUnauthorized()` fires; dismissible; `data-testid="token-expired-banner"`.
3. Mount it in `app-shell.tsx` (top-of-shell, non-blocking — workbench visuals remain visible).
**Success criteria:** A rendered shell that receives a simulated 401 shows the banner text.
**Verify:** `npx vitest run` with a targeted test file for the banner → exit 0 and the test asserts the exact vi string appears.

### Task 2.4 — Regression gate
**Goal:** Existing suites pass with auth off (AWS parity) and with auth on (PVU posture).
**Steps:**
1. `npm test` (flag off default) → exit 0.
2. `CHE_EMBED_AUTH=1 CHE_EMBED_TOKEN_SECRET=<32+ char test secret> npx vitest run` → exit 0.
3. `npm run test:e2e` → exit 0 (e2e servers run flag-off).
**Success criteria:** Both modes green.
**Verify:** the compound commands above, exit 0.

## Todo
- [x] 2.1 Middleware + rate limits + fail-closed secret
- [x] 2.2 Token store + fragment strip + authedFetch at all call sites
- [x] 2.3 vi expiry banner
- [x] 2.4 Regression gate both modes

## Success Criteria
- Negative controls (mandatory): bare `POST /api/copilot` → 401; garbage/expired/wrong-slug tokens → 401; 21st copilot call/min/IP → 429.
- Positive: valid Phase 4 token → 200 through the full chain (Phase 5 live proof).
- Fragment stripped after boot; `#t=` appears nowhere else in `src/`.
- Rollback: `git revert` + `npm ci` restores open API (flag-off default proves parity); no data migration involved.

## Risk Assessment
- Classroom NAT (many students, one IP): a 60/min blanket cap would starve a class — hence 300/min general, 20/min copilot-only. Likelihood medium, impact high if ignored; mitigated by split limits + env tunables.
- Revocation cache fail-open on fetch error (HMAC still enforced): accepted, documented; alternative (fail-closed on revocation-service outage) would make student availability hostage to the publish engine. Revisit if abuse observed.
- Missing a call site would break one feature silently post-deploy — mitigated by the Task 2.2 grep sweep recorded in the summary, plus Phase 5 live smoke.

## Security Considerations
- Secret `CHE_EMBED_TOKEN_SECRET` (value = `PUBLISH_MCP_TOKEN_SECRET`) lives only in the VPS env file, never in git; boot fails closed if absent/short (day-one real-secret rule).
- Token travels in the URL fragment only (never Referer/logs/query); stripped from the address bar immediately.
- Cohort-shared token posture: iframe src is readable by site members — internal tier by design; revocation (JTI/epoch) is the backstop.
- Copyright: gating `/api/v1/*` also gates the sidecar PDF routes — corpus reachable only via Bearer-gated API.

## Failure Protocol
If any Verify step does not meet its stated pass condition, STOP this phase.
Do not improvise a fix, retry blindly, or reason around the failure.
Spawn the `kongming` subagent for next-step counsel and pass:
- the phase and task id,
- what you attempted (the steps you ran),
- the exact command and its full output,
- the pass condition it failed to meet.
Apply kongming's guidance, then re-run the Verify step.
If `kongming` cannot be spawned in this environment, STOP and report the same
failure evidence to the user. Never continue by self-reasoning.

## Next Steps
- Contract handoff to Phase 4 (kongming 261111 pins): slug `che-workbench`, sub `pvu-cohort`, purpose MUST be passed as `purpose='embed'` explicitly (upstream defaults 'share' → every minted token would 401), aud `artifact_viewer`, wire base64url(canonical).base64url(hmac) with HMAC over the raw payload bytes; revocation feed `{"slug","jtis","epoch"}` consumed with `CHE_EMBED_REVOCATION_TOKEN` bearer; `CHE_EMBED_TOKEN_SECRET` ≡ `PUBLISH_MCP_TOKEN_SECRET` byte-for-byte + `_FALLBACK` pair for rotation; golden-vector procedure = fixtures generated from the real mint (monkeypatched uuid4/time), incl. a share-purpose negative vector, pinned byte-identical in `src/__tests__/embed-token-auth.test.ts`.
- Phase 5 sets `CHE_EMBED_AUTH=1` + secret in compose and proves the negative control live.

## Amendments (execution 261111 — kongming counsel, folded before/during implementation)

1. RAW-BYTES HMAC law replaces re-canonicalization (the doc's JS array-replacer idiom was a whitelist, not a sort).
2. Module split per the repo <200-LOC invariant (phase19 Test 4): `embed-token-verify.ts` (129) + `embed-auth-gate.ts` (131) + `sidecar-proxy.ts` (31); api-server at 176; `theme-tokens.css` 178 with pvu tokens + banner extracted to `src/styles/pvu-edition.css` (34) — selector bumped to `:root[data-theme="pvu"]` so import order can never silently kill the theme (fs-guard assertion pinned in `brand-preset.test.ts`).
3. Flag-gated mount: the entire gate (trust proxy + limiters + CSP) mounts ONLY under `CHE_EMBED_AUTH=1` — flag-off AWS parity asserted by the integration suite.
4. SIDECAR browser-default bug fix (pre-existing production defect on default-port HTTPS origins) folded into the call-site sweep.
5. Evidence: 135/135 both flag modes, typecheck 0, build green (pvu selector + brand string in bundle), sweeps clean, e2e 21/21.
