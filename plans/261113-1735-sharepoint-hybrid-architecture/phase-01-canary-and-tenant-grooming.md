# Phase 1 — Canary + Tenant Grooming + Graph Consent

## Context
- Parent: `../plan.md` (laws 2, 5, 9; gates GA/GB).
- Canary facts: the 261113 grant restore (Graph 201, permission entry listed)
  left the app-only SP write lane still 403 as of ~10:00 ICT (identity
  materialization lag). The 06:20 ICT BOD cron (`/var/log/pvu-bod-republish.log`)
  is the fail-loud canary: `=== republish exit 0 (publish ok, liveness GREEN) ===`
  = re-armed; `FAILED` = not yet.
- Spike leftovers (verified 261113 03:42 ICT via app-only enumeration): Site
  Pages rows titled `pvu-bod-usage-spike` ×3 (Ids 3/4/5 from the October dry
  run).
- Graph-consent route facts (verified 261113): app `5b4c6b66` has ZERO Graph
  app roles (token decode `roles=None`) — SP `Sites.Selected` only; consented
  delegated app `e71cb649` (device-flow as `duc.a.nguyen@pvu.edu.vn`) carries
  `Application.ReadWrite.All`, `AppRoleAssignment.ReadWrite.All`,
  `Directory.ReadWrite.All`, `Sites.ReadWrite.All` — sufficient to add the
  Graph app role + admin consent + site-scoped grant by API IF the signed-in
  identity holds a consent-capable admin role (verify at execution; portal
  fallback via IAB otherwise). Delegated tokens are EPHEMERAL ceremony only
  (law 2): delete token files immediately after each use; never persist.

## Overview
Priority P1 · Status Pending · Effort 0.25d · Morning of 2026-11-14.
Three independent legs: (A) read the canary and record the verdict;
(B) groom the tenant (delete spike pages; verify probe cleanup held);
(C) land Graph consent so app `5b4c6b66` gets working Graph lanes.
Legs B's deletes are app-only writes → gated on GA green; legs A/C need no
write permission (C writes to Entra, not SharePoint).

## Related Code Files
| Path | Action | Change |
|---|---|---|
| `plans/261113-1735-sharepoint-hybrid-architecture/reports/canary-2026-11-14.md` | create | Canary verdict + receipts (the GA record). |
| No repo code changes. | — | — |

## Tasks

### Task 1.1 — Read the canary (gate GA verdict)
- Goal: a dated, quoted verdict on the app-only write lane.
- Target files: `reports/canary-2026-11-14.md` (new).
- Steps:
  1. After 06:25 ICT on 2026-11-14: `ssh pvu 'sudo tail -40 /var/log/pvu-bod-republish.log'`.
  2. Quote the final `===` line verbatim into the report.
  3. Independently re-arm-check: run the tiny app-only write
     (`Files/Add` of `write-verify-tiny.html` into Site Pages, then delete it)
     — a live second signal beyond the cron's page lane.
- Success criteria: report exists with both signals quoted.
- Verify: `grep -c "VERDICT:" reports/canary-2026-11-14.md` prints 1 and the
  line matches `GA_GREEN|GA_PARKED|GA_FAILED`.
  - `GA_GREEN` = cron exit 0 AND tiny write 200.
  - `GA_PARKED` = cron FAILED or tiny 403 → Phase 2/5 park, retry next 06:20;
    after 2 consecutive failures, stop and spawn kongming — the
    delegated-fallback proposal is an owner decision, never a default, and the
    proposal MUST demand the audit answer first (who/what removed the grant —
    a re-grant that keeps getting re-rescoped changes the calculus).
  - `GA_FAILED` = anything else (infra) → Failure Protocol.
- **Morning additions (kongming evening-1 counsel, 261113):** at the 06:25
  read —
  (2a) **Site-permission entry listing** (read-only): compare each entry's
  `grantedToIdentities[].application.id` against the client appId
  `5b4c6b66-…` — the restore's request body exists in no repo (only the
  tenant holds it); a mis-named entry both explains a persistent 403 and
  means ONE correctly-named owner re-grant (their round-2 command) fixes GA
  and provides GB's site grant together.
  (2b) **Mask probe** (the parse-corrected one — read
  `d.EffectiveBasePermissions.High/Low`): write bits present + writes 403 =
  a policy layer ABOVE the ACL → the audit answer becomes THE blocker.
  Also: classify the canary from the QUOTED raw lines (a Python traceback
  with no `WRITE-LANE PARKED` line = GA_FAILED infra, not a park), and
  confirm the start line carries `SCRIPT_SHA` `be25e7bd5cac` (the deployed
  copy ran).

### Task 1.2 — Spike-page cleanup (GA green only)
- Goal: the three October test pages are gone.
- Steps:
  1. App-only, in-container: list Site Pages rows
     (`sitepages/pages?$select=Id,FileLeafRef,Title&$top=100`) — confirm
     exactly the 3 `pvu-bod-usage-spike` rows remain.
  2. Delete each by page id via the engine's delete path
     (`sharepoint/provisioner.delete_sharepoint_page` or the pages-REST delete
     by Id — use the engine surface, not ad-hoc REST shapes).
  3. Re-list: zero `pvu-bod-usage-spike` rows.
- Success criteria: before/after listings recorded in the canary report.
- Verify: re-list command output shows `0` spike rows (record the count line).

### Task 1.3 — Graph consent (gate GB) — kongming-amended 261113 (order: app role → engine probe → conditional site grant)
- Goal: app `5b4c6b66` holds the Graph `Sites.Selected` app role, proven by
  the ENGINE's own Graph calls going green.
- Facts folded from review: the Create-permission API needs
  `Sites.FullControl.All` delegated (NOT held by e71cb649 — no escalation
  path), and the tenant's own evidence says the site-permission store is
  audience-AGNOSTIC (the round-2 PnP/Graph grant served SP REST writes) — one
  grant store, two lanes; the Graph lane's real blocker is the missing APP
  ROLE. Therefore the site-grant POST is CONDITIONAL, never a default.
- Steps:
  1. Fresh device-flow token as the admin identity (scope:
     `Application.ReadWrite.All AppRoleAssignment.ReadWrite.All
     Directory.ReadWrite.All` — the app-role assignment API's least-privilege
     shape; offline_access NOT requested; delete the token file at task end).
  2. Resolve ids: `GET /v1.0/servicePrincipals?$filter=appId eq 5b4c6b66-…`
     (SP object id) and the Graph resource SP's `Sites.Selected` app-role id.
  3. **App-role grant (the sound step):**
     `POST /v1.0/servicePrincipals/{sp-of-5b4c6b66}/appRoleAssignments`
     with the Graph resource SP + `Sites.Selected` role id. Subject to the
     signed-in identity holding a consent-capable role (Application
     Administrator class) — verify at execution.
  4. **Engine probe FIRST** (the only receiver that matters): in-container
     `get_client().resolve_site(SP_SITE_URL)` + `resolve_drive(site_id,
     "Documents")` — the exact calls that 400/401'd on 261113.
  5. **Only if step 4 still fails**: site-scoped grant via the 261113-proven
     command shape that returned 201 (replicate it verbatim; do NOT re-derive
     scopes). Treat a conflict/duplicate-class response as
     `ALREADY_GRANTED` (record, continue) — never a protocol failure.
  6. Re-run the engine probe.
- Success criteria: engine-side Graph calls green with at most steps 1–4 run.
- Verify: the in-container probe prints `GRAPH_LANE_OK site=<id> drive=<id>`;
  exit 0. **Portal/IAB fallback triggers on ANY 403/401 on either write step**
  (not just role insufficiency): Entra portal → App registrations → 5b4c6b66 →
  API permissions → Graph Sites.Selected → Grant admin consent → re-run the
  engine probe — same Verify.

### Task 1.4 — Hygiene close-out
- Goal: no token ceremony residue; tenant list clean.
- Steps: delete all device-flow token/state files (local `/tmp` and any VPS
  copies); re-run the 261113 probe-cleanup listing (zero `pvu-html-probe*`,
  `write-verify*`, zero `_probes` folder, AND — added 261113 — zero
  `_writeprobe.html`/`_doctorprobe.html` residue from the cron/doctor
  probes); record both in the canary report.
- Success criteria: clean listings; zero token files remain.
- Verify: `ls /tmp/gtok.json /tmp/sptok.json /tmp/devicestate.json 2>&1`
  prints only "No such file"; listings quoted in the report.

## Todo
- [ ] 1.1 Canary verdict recorded
- [ ] 1.2 Spike pages deleted (3→0)
- [ ] 1.3 Graph consent + engine probe GRAPH_LANE_OK
- [ ] 1.4 Hygiene close-out

## Success Criteria
GA verdict dated and quoted; tenant holds only intended pages; app `5b4c6b66`
has working Graph lanes proven by the engine itself; no delegated-token
residue anywhere.

## Risk Assessment
- Admin-role insufficiency on the API consent path → portal fallback (same
  Verify, ~10 min more).
- Deleting pages by Id is irreversible → the before-listing is captured in the
  report first; only the 3 verified spike rows are touched.

## Security Considerations
- Ephemeral delegated tokens (law 2): requested WITHOUT offline_access where
  possible, deleted immediately after use, never written to any repo/host file
  beyond the transient `/tmp` of the acting machine, never committed.

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
- GA green → Phase 2 + Phase 5 unlock. GB green → Phase 4 unlocks.
- Kongming checkpoint (advice mode): after this phase, pass both verdicts +
  cleanup receipts for a go/no-go before the gated phases start.
