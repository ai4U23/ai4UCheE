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
- All save-related calls send `X-Client-Id` header: `GET /api/saved-calculations` (filter), `DELETE /api/saved-calculations` (scoped delete — critical fix), and the calc-sheet save path (`POST /api/actions/generate-calc-sheet`).
- Schema: `saved_calculations.client_id TEXT NOT NULL DEFAULT ''` + index; idempotent `ALTER TABLE` migration for existing DB files (old rows keep `''`).
- Backwards compat: requests without the header operate on the legacy `client_id = ''` bucket — today's AWS bundle keeps working unchanged.
Non-functional: no PII (random UUID only); migration is online-safe (WAL, one ALTER).

## Architecture
```
Browser ── X-Client-Id: <uuid> ──> Express
   └─ GET  /api/saved-calculations   → WHERE client_id = ?
   └─ DELETE /api/saved-calculations → WHERE client_id = ?   (was: DELETE all)
   └─ POST /api/actions/generate-calc-sheet (body gains clientId)
         └─ setCalcSheetPersister record → INSERT … client_id
SQLite: saved_calculations (+ client_id, idx)  — per-browser buckets in one table
```

## Related Code Files
| Path | Action | Change |
|---|---|---|
| `src/lib/client-id.ts` | create | `getClientId()` — UUID, localStorage + memory fallback. |
| `src/db/client.ts` | modify | Lines 22–32: add column + index to CREATE SQL; add guarded `ALTER TABLE` migration in `initDb` (PRAGMA table_info check). |
| `src/db/schema.ts` | modify | Line 14 `savedCalculations` drizzle table: add `clientId` column. |
| `src/actions/generate-calc-sheet.ts` | modify | Lines 14–24 `SavedCalculationRecord` + `clientId`; action zod input gains optional `clientId`; persister call (line 127) carries it. |
| `src/server/api-server.ts` | modify | Lines 50–68 INSERT gains client_id; 103–108 GET filters by `X-Client-Id`; 110–113 DELETE scoped by header; 115–129 actions route injects header value into body when absent. |
| `src/components/workbenches/calc-sheet-preview-modal.tsx` | modify | Line 162 DELETE call sends `X-Client-Id` (via `authedFetch`). |
| `src/lib/client-id.test.ts`, `src/server/saved-calcs-isolation.test.ts` | create | Tests. |

## Tasks

### Task 3.1 — Client ID module
**Goal:** Every browser session has a stable pseudonymous ID with no PII.
**Target files and symbols:** `src/lib/client-id.ts` (`getClientId`), storage key `ai4uchee.client.id.v1`.
**Steps:**
1. Implement `getClientId()`: memory-first; on first call try localStorage read, else generate UUID and persist (try/catch → memory only).
2. Export a test hook to reset module state.
**Success criteria:** Two jsdom instances yield different IDs; same instance returns the same ID across calls; throwing storage still returns a UUID.
**Verify:** `npx vitest run src/lib/client-id.test.ts` → exit 0.

### Task 3.2 — Schema + migration
**Goal:** Existing DB files upgrade in place; fresh DBs create the column directly.
**Target files and symbols:** `src/db/client.ts:12-53` (`CREATE_SQL`, `initDb`), `src/db/schema.ts:14`.
**Steps:**
1. Add `client_id TEXT NOT NULL DEFAULT ''` to the `saved_calculations` CREATE block and `CREATE INDEX IF NOT EXISTS idx_saved_calcs_client ON saved_calculations(client_id);`.
2. In `initDb` after `conn.exec(CREATE_SQL)`: read `PRAGMA table_info(saved_calculations)`; if no `client_id` column, `ALTER TABLE saved_calculations ADD COLUMN client_id TEXT NOT NULL DEFAULT ''`, then create the index.
3. Mirror the column in the drizzle table definition.
**Success criteria:** Opening the repo's existing `perry_workbench.sqlite` (copy to temp) succeeds and gains the column with old rows intact at `''`.
**Verify:** `npx vitest run src/db` → exit 0 (include a test that copies `perry_workbench.sqlite` to a temp path, runs `initDb(tmp)`, asserts `PRAGMA table_info` lists `client_id` and pre-existing row count unchanged).

### Task 3.3 — Server scoping (filter, scoped delete, save stamping)
**Goal:** One browser can never read or delete another browser's saves.
**Target files and symbols:** `src/server/api-server.ts:50-68,103-113,115-129`; `src/actions/generate-calc-sheet.ts:14-24,127`.
**Steps:**
1. Extend `SavedCalculationRecord` with `clientId: string` and the action's zod input with `clientId: z.string().default('')`.
2. In the actions route handler, when `X-Client-Id` header is present and body lacks `clientId`, set `req.body.clientId = header` before `schema.parse`.
3. INSERT (persister callback) writes `client_id`; GET filters `WHERE client_id = ?` (header value, `''` when absent); DELETE runs `WHERE client_id = ?`.
4. Update the modal (line 162) and the saved-list GET caller (locate via `grep -rn "/api/saved-calculations" src/` — modal + any list loader found) to send the header through `authedFetch`.
**Success criteria:** With IDs A and B: A saves → B's list is empty, A's list has 1; B's DELETE changes 0 rows and A's save survives; header-less requests see only legacy `''` rows.
**Verify:** `npx vitest run src/server/saved-calcs-isolation.test.ts` → exit 0 (suite encodes exactly the A/B scenarios above).

### Task 3.4 — Regression gate
**Steps:** `npm test && npm run test:e2e && npm run typecheck` → exit 0 (e2e covers the modal delete flow with the header now present).
**Success criteria:** All green.
**Verify:** the compound command, exit 0.

## Todo
- [ ] 3.1 Client ID module
- [ ] 3.2 Schema + idempotent migration
- [ ] 3.3 Server scoping + call-site headers
- [ ] 3.4 Regression gate

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
