# Phase 3 — Private Per-Browser Saves (Pseudonymous Client ID + Schema Change)

## Context
- Brainstorm: `plans/reports/brainstorm-20261111-pvu-sharepoint-edition.md` · Research: `plans/reports/research-20261111-interactive-html-on-sharepoint.md`
- Related phases: after Phase 2 (authedFetch exists); schema ships in the Phase 5 container; acceptance names per-surface saves.

## Overview
Priority P1 · Status Pending · Effort 0.25d.
Today `saved_calculations` has no owner column: `GET /api/saved-calculations` returns everyone's rows and `DELETE` wipes the whole table (`src/server/api-server.ts:103-113`). This phase adds a pseudonymous client-generated ID so each browser sees and deletes only its own saved calc sheets, on both surfaces (embed partition and direct origin — separate storage partitions, hence separate save lists, named in acceptance). No accounts, no personal data.

## Requirements
Functional:
- Client generates `crypto.randomUUID()` once, persisted at localStorage `ai4uchee.client.id.v1` with in-memory fallback (pattern of `src/lib/student-adaptive-model.ts:18`).
- ALL `/api` browser calls send `X-Client-Id` — attached CENTRALLY in `authedFetch` (the missed-call-site bug class is eliminated structurally): `GET /api/saved-calculations` (filter), `DELETE /api/saved-calculations` (scoped delete — critical fix), and the NEW `POST /api/saved-calculations` browser persist hop. The `/api/actions` route also stamps the request-scoped bucket via `setActionClientId` (kept for parity; browsers never call it today — grep-verified).
- Schema: `saved_calculations.client_id TEXT NOT NULL DEFAULT ''` + index; idempotent `ALTER TABLE` migration for existing DB files (old rows keep `''`).
- Backwards compat: requests without the header operate on the legacy `client_id = ''` bucket — today's AWS bundle keeps working unchanged.
Non-functional: no PII (random UUID only); migration is online-safe (WAL, one ALTER).

## Architecture
```
Browser ── X-Client-Id: <uuid> ──> Express
   └─ GET  /api/saved-calculations   → WHERE client_id = ?
   └─ DELETE /api/saved-calculations → WHERE client_id = ?   (was: DELETE all)
   └─ NEW POST /api/saved-calculations (browser default persister — the ACTUAL hop;
      body NEVER carries clientId; the server stamps client_id from the X-Client-Id HEADER only,
      and stores ids namespaced `${clientId}::${rec.id}` so cross-bucket PK clobber is impossible)
         └─ setCalcSheetPersister record → INSERT … client_id
SQLite: saved_calculations (+ client_id, idx)  — per-browser buckets in one table
```

## Related Code Files
| Path | Action | Change |
|---|---|---|
| `src/lib/client-id.ts` | create | `getClientId()` — UUID, localStorage + memory fallback. |
| `src/db/client.ts` | modify | Column in the CREATE block; guarded `ALTER` + composite index `idx_saved_calcs_client_created (client_id, created_at)` AFTER `exec(CREATE_SQL)` — an index inside CREATE_SQL throws 'no such column' on old DBs before the ALTER runs (kongming A2). |
| `src/server/saved-calculations-route.ts` | create | All saved-calc routes + the Node persister in one module (<200-LOC law): UUID-sanitized bucket fn, GET/DELETE scoped, NEW zod-capped POST (field-length caps — client-writable INSERT is a new surface), namespaced-PK insert, `setActionClientId` for the actions route. |
| `src/lib/client-id.ts` | create | `getClientId()` — crypto.randomUUID with feature-detect fallback, persisted at `ai4uchee.client.id.v1`, memory fallback. |
| `src/db/schema.ts` | modify | Line 14 `savedCalculations` drizzle table: add `clientId` column. |
| `src/actions/generate-calc-sheet.ts` | modify | Lines 14–24 `SavedCalculationRecord` + `clientId`; action zod input gains optional `clientId`; persister call (line 127) carries it. |
| `src/server/api-server.ts` | modify | Persister + GET/DELETE handlers REPLACED by `registerSavedCalculationsRoutes(app)`; actions route wraps `action.handler` with `setActionClientId(header)` / finally-clear; entrypoint now `createApiServer(process.env.DB_PATH)` (the DB_PATH passthrough did not exist in source — phase-5 landmine, kongming Q3-2). |
| `src/actions/generate-calc-sheet.ts` | modify | NEW `browserPersist` default persister (window-guarded, fire-and-forget) — the actual feature hop: browser saves previously NEVER reached SQLite (persister was Node-only; nothing POSTed /api/actions/* — grep-verified, kongming A1). |
| `src/lib/trust-boundary-copy.ts` | modify | Per-owner delete toast + private-per-browser persistence wording, both locales (the old 'cleared ALL sheets' copy is now false — kongming A8). |
| `src/__tests__/client-id.test.ts`, `src/__tests__/db-migration.test.ts`, `src/__tests__/saved-calcs-isolation.test.ts`, `src/__tests__/browser-persist-hop.test.ts` | create | All under the vitest-include dir (third occurrence of the include trap — kongming A3). Migration probe = SYNTHETIC old-schema DB (the repo DB has WAL sidecars — not deterministic — kongming A4); isolation = real createApiServer (A/B disjoint, scoped DELETE, legacy '' bucket, non-UUID sanitized, namespaced PK non-clobber, body client_id ignored, zod caps); browser-hop = jsdom stubbed-fetch POST with X-Client-Id. |

## Tasks

### Task 3.1 — Client ID module
**Goal:** Every browser session has a stable pseudonymous ID with no PII.
**Target files and symbols:** `src/lib/client-id.ts` (`getClientId`), storage key `ai4uchee.client.id.v1`.
**Steps:**
1. Implement `getClientId()`: memory-first; on first call try localStorage read, else generate UUID and persist (try/catch → memory only).
2. Export a test hook to reset module state.
**Success criteria:** Two jsdom instances yield different IDs; same instance returns the same ID across calls; throwing storage still returns a UUID.
**Verify:** `npx vitest run src/__tests__/client-id.test.ts` → exit 0 (UUID shape, stability, distinctness, memory fallback, test reset).

### Task 3.2 — Schema + migration
**Goal:** Existing DB files upgrade in place; fresh DBs create the column directly.
**Target files and symbols:** `src/db/client.ts:12-53` (`CREATE_SQL`, `initDb`), `src/db/schema.ts:14`.
**Steps:**
1. Add `client_id TEXT NOT NULL DEFAULT ''` to the `saved_calculations` CREATE block. The composite index `idx_saved_calcs_client_created (client_id, created_at)` is created AFTER the PRAGMA/ALTER block — NEVER inside CREATE_SQL (old DBs: the CREATE TABLE no-ops and the index statement would throw 'no such column' before the ALTER runs — kongming A2).
2. In `initDb` after `conn.exec(CREATE_SQL)`: read `PRAGMA table_info(saved_calculations)`; if no `client_id` column, `ALTER TABLE saved_calculations ADD COLUMN client_id TEXT NOT NULL DEFAULT ''`, then create the index.
3. Mirror the column in the drizzle table definition.
**Success criteria:** Opening the repo's existing `perry_workbench.sqlite` (copy to temp) succeeds and gains the column with old rows intact at `''`.
**Verify:** `npx vitest run src/__tests__/db-migration.test.ts` → exit 0 (primary probe = SYNTHETIC old-schema DB created without client_id + a fixture row: column added, row intact at bucket '', composite index present, second `initDb` idempotent, fresh-DB path direct — kongming A4; the repo DB's WAL sidecars make it non-deterministic).

### Task 3.3 — Server scoping (filter, scoped delete, save stamping)
**Goal:** One browser can never read or delete another browser's saves.
**Target files and symbols:** `src/server/api-server.ts:50-68,103-113,115-129`; `src/actions/generate-calc-sheet.ts:14-24,127`.
**Steps:**
1. Extend `SavedCalculationRecord` with `clientId: string` and the action's zod input with `clientId: z.string().default('')`.
2. The actions route sets the request-scoped bucket via `setActionClientId(req.headers['x-client-id'])` (UUID-sanitized, finally-cleared); the persister stamps from it. The REAL browser hop is the new `POST /api/saved-calculations` (zod-capped record, header-only client_id stamp, namespaced PK — see file table).
3. INSERT (persister callback) writes `client_id`; GET filters `WHERE client_id = ?` (header value, `''` when absent); DELETE runs `WHERE client_id = ?`.
4. Update the modal (line 162) and the saved-list GET caller (locate via `grep -rn "/api/saved-calculations" src/` — modal + any list loader found) to send the header through `authedFetch`.
**Success criteria:** With IDs A and B: A saves → B's list is empty, A's list has 1; B's DELETE changes 0 rows and A's save survives; header-less requests see only legacy `''` rows.
**Verify:** `npx vitest run src/__tests__/saved-calcs-isolation.test.ts` → exit 0 (A/B disjoint; B's DELETE → 0 changes, A survives; headerless → '' bucket only; header-bearing never sees ''; non-UUID → '' bucket; identical client ids cannot clobber across buckets; body client_id ignored; oversized fields 400). The suite pins CHE_EMBED_AUTH='0' — bucket semantics are orthogonal to the gate (flag-on leg covered by embed-auth-integration).

### Task 3.4 — Regression gate
**Steps:** `npm test` (both modes) && `npm run test:e2e` && `npm run typecheck` && `npm run build` → exit 0. NOTE (kongming A6): e2e does NOT touch the delete button — no e2e asserts server state (Playwright's webServer is vite-only; Express is down and client failures are swallowed by design). The real assertions live in the node integration suites.
**Success criteria:** All green.
**Verify:** the compound command, exit 0.

## Todo
- [x] 3.1 Client ID module
- [x] 3.2 Schema + idempotent migration
- [x] 3.3 Server scoping + call-site headers
- [x] 3.4 Regression gate

## Success Criteria
- Per-surface saves named in acceptance: a save created inside the SharePoint embed (embed storage partition → its client ID) is invisible on the direct origin surface (different partition → different client ID), and vice versa; each surface deletes only its own.
- Legacy bucket preserved (no header → `''` rows only).
- Rollback: revert commits; the added column is harmless to old code (SELECT * consumers unaffected — verified by `npm test` on the reverted tree).

## Risk Assessment
- DELETE-all currently live (line 111): any missed caller means one student erases everyone's legacy saves — mitigated by the Task 3.3 grep sweep + isolation tests; likelihood low after tests, impact contained to `''` bucket anyway.
- Storage partitioning differences across browsers could surprise users with "missing" saves across surfaces — by-design (named in acceptance), banner-free.
- UUID collision: negligible.

## Security Considerations
- Pseudonymous by construction: no name/email/IP stored; client_id is a random UUID chosen by the browser.
- Saves DB stays on the PVU host behind the Bearer gate (Phase 2) — never in SharePoint.
- Saved content is student work product; equations/citations textual — no raw PDF crops involved.

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
- Unblocks Phase 5 (schema bakes into the container image; DB volume persists buckets).
- Follow-up (Phase 10 ops): note DB growth is bounded by 50-row-per-client GET window; occasional vacuum guidance lives in the ops runbook.

## Amendments (execution 261111 — kongming counsel, folded during implementation)

1. A0 honored: Phase 2 committed FIRST (b3f8a32) before any phase-3 edit; phase 3 is its own commit.
2. A1 THE MISSING HOP: browser saves never reached SQLite before this phase — the modal runs the action in-process and the persister was Node-only. The feature shipped here is the NEW `POST /api/saved-calculations` browser persist (generate-calc-sheet browserPersist, fire-and-forget; server stamps client_id from the header only; namespaced PK blocks cross-bucket clobber; zod caps bound body size).
3. A7: no screen-state change (no such task in this doc; screen_states is write-only — per-browser screen state would need GET-by-header + hydration + a client caller: separate design, out of scope).
4. A8 owner-visible changes: the delete button now clears only THIS browser's sheets (both-locale copy updated — was 'cleared all'); header-bearing clients never see pre-upgrade communal ('') rows — correct, the communal bucket WAS the bug; AWS https origin additionally gains working sidecar features via the phase-02 SIDECAR fix.
5. DB_PATH passthrough landed here (createApiServer(process.env.DB_PATH) at the entrypoint) — the phase-05 compose volume is useless without it (kongming Q3-2).
6. Evidence: 28 files / 152 tests green BOTH modes; typecheck 0; build green; e2e 21/21; isolation 7/7 (incl. namespaced-PK non-clobber + spoofed-body rejection); migration probe synthetic-old-DB 3/3; browser-hop jsdom 2/2.
