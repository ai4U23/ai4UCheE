# Phase 5 — Pilot Publish + Owner Ship/Kill Gate

> **AMENDMENT 2026-11-13 (kongming-counseled, Tasks 5.1/5.4 transport):** the
> tenant's app registration has NO Graph app roles (Phase 1 finding), so the
> prescribed Graph content-download Verify is structurally unpassable.
> Replacement receipts (proven in Phase 1): write-side = SP REST `Files/Add`
> 200 with the server's own `Length` == local byte count (+ `UniqueId`); the
> IAB render is the read-side receipt. If SHIP's deletion/rename checks are
> needed, use the same SP REST methods (403 on file reads is a known grant
> asymmetry — record, don't fail).

## Context
- Parent: `../plan.md` (laws 2, 4, 5, 6, 8). Blocked until: Phase 1 verdict
  `LANE_GREEN` (placement recorded), Phases 3–4 green, and gates G1/G2 open.
- Engine upload = the Phase 1 pattern (`resolve_site` → `resolve_drive` at the
  PROVEN placement → `upload_file(..., "text/html")`; simple upload < 4 MiB,
  else `upload_large_file`). Site Pages placement uses the plain drive upload
  ONLY (law 2: never the aspx provisioner).
- Pilot path at the proven placement: `che-quick-calcs-pilot.html` (Documents:
  under a `Quick Calcs/` folder; Site Pages: library root).

## Overview
Priority P2 · Status Pending · Effort 0.25d + ~30 min owner.
Put the battery-proven artifact in the tenant behind an obvious pilot name,
verify it renders in the real sandbox, run the owner's ONE combined browser
session (Lane A 5 clicks + gadget check — one sign-in), then record SHIP or
KILL with dates. Either way the tenant ends clean of probe/pilot leftovers
(unless SHIP, which renames to the final path).

## Requirements
- Pilot live at the proven placement; render receipt (IAB or owner session)
  showing: page renders, both calculators compute a value that matches the
  battery grid, KaTeX fonts correct (italic math glyphs, NOT fallback serif).
- Owner one-pager (plain English, Vietnamese-first where student-facing).
- Decision recorded in THIS file's summary: `DECISION: SHIP <date>` or
  `DECISION: KILL <date>` + one-paragraph rationale.
- SHIP: final name `che-quick-calcs.html` at the same placement; surface
  registry entry + quarterly sweep hook (261111-1048 phase 10); probe files
  deleted; pilot file deleted.
- KILL: pilot + probe files deleted via engine; plan status → cancelled.

## Architecture
```
gadget/dist/index.html ──engine APP-ONLY──> <placement>/che-quick-calcs-pilot.html
Render receipt (IAB/owner) ──> reports/pilot-<date>.md
Owner combined session (G2) ──> SHIP: rename to che-quick-calcs.html + registry
                             └─> KILL: engine-delete, decision note, plan cancelled
```

## Related Code Files
| Path | Action | Change |
|---|---|---|
| `plans/261113-0638-quick-calcs-html-pages/reports/pilot-<date>.md` | create | Render receipt + owner session outcome. |
| `plans/261113-0638-quick-calcs-html-pages/reports/owner-session-<date>.md` | create | The one-pager handed to the owner (G2). |
| `plans/261111-1048-pvu-sharepoint-edition/phase-10-ops-rotation-runbook.md` | modify (SHIP only) | Add the gadget to the quarterly sweep list. |
| `gadget/dist/index.html` | publish (no change) | The artifact, byte-identical to the battery-audited build. |

## Tasks

### Task 5.1 — Publish the pilot
- Goal: the pilot URL is live at the proven placement.
- Steps:
  1. Re-run the Phase 2 Task 2.4 + Phase 3 Task 3.4 audits on
     `gadget/dist/index.html` (both must be green — publish only a re-audited
     artifact; record the audit output in the pilot report).
  2. Upload via the engine pattern at
     `<proven placement>/che-quick-calcs-pilot.html`; capture webUrl.
- Success criteria (per the Amendment above): SP REST `Files/Add` at
  `/sites/PVIAICowork/SitePages` returns 200 with the server's own
  `Length` == local byte count of `gadget/dist/index.html`, and a `UniqueId`
  receipt is captured.
- Verify: the heredoc script ends by printing
  `PILOT_OK Length=<server> local=<n>` where the two numbers are equal.
  (Read-side receipt = the IAB render in Task 5.2; Graph/`$value` downloads
  are dead on this grant — Phase 1 finding.)

### Task 5.2 — In-sandbox render receipt
- Goal: observed proof the artifact works inside the MS sandbox, before the
  owner is asked to look.
- Steps:
  1. Open the pilot webUrl in IAB (or Chrome). Checklist: page renders in the
     HTML viewer; DIPPR tab computes water @ 373.15 K and the shown value
     matches `gadget/oracle/expected.json` for that case (write the expected
     value into the report BEFORE opening the page — compare against the
     pre-written number, not memory); NPSHa tab computes the 0-psig case
     likewise; equations show KaTeX italic math (screenshot the two tabs).
  2. Record everything in `reports/pilot-<date>.md` with the screenshots'
     paths, PLUS one line capturing the pilot file's sharing mode (inherited
     site sharing vs org-link) — the plan's "no login for students" promise
     rests on it; confirm the gadget URL inherits the cohort's site access
     (or flag an owner sharing decision before SHIP). If IAB unusable → mark
     `RENDER-PENDING-OWNER` and fold this check into Task 5.3's session.
- Success criteria: report exists; both battery-value comparisons PASS or the
  PENDING-OWNER marker is set.
- Verify: `grep -cE "(PASS|PENDING-OWNER)" reports/pilot-<date>.md` prints ≥ 2.

### Task 5.3 — Owner combined session (gate G2)
- Goal: one sign-in covers Lane A AND the gadget.
- Target files: `reports/owner-session-<date>.md` (the one-pager).
- Steps:
  1. Write the one-pager (plain English): part 1 = the Lane A 5 clicks,
     linking `261111-1048/reports/phase-06-owner-handover.md`; part 2 = pilot
     URL + the same three checks as Task 5.2 phrased for a human ("does the
     math font look like proper math, not plain italic text?"); ~30 min total.
  2. Hand it over; record the owner's outcomes (either live or by reply).
- Success criteria: owner outcomes recorded for both parts.
- Verify: the report contains the strings `Lane A` and `pilot` and a dated
  outcome line per part.

### Task 5.4 — Ship or kill (gate G3)
- Goal: the dated decision, and a clean tenant either way.
- Steps:
  1. Present the evidence set: battery ALL GREEN, perf p95, render receipt,
     owner outcomes, effort spent.
  2. SHIP: re-upload `dist/index.html` as `che-quick-calcs.html` at the same
     placement; engine-delete the pilot + both probe files; add the registry
     entry (surface registry follows the 261111-1048 phase-6 containment
     convention — distinct final name, cadence note); append the gadget to the
     261111-1048 phase-10 quarterly sweep list; write `DECISION: SHIP <date>`
     + rationale in this file's summary; set parent plan.md status → completed.
  3. KILL: engine-delete pilot + probe files; write `DECISION: KILL <date>` +
     rationale; parent plan.md status → cancelled (the battery remains a repo
     asset — note it).
- Success criteria: decision line exists; tenant clean.
- Verify: `grep -c "DECISION: SHIP\|DECISION: KILL" phase-05-pilot-and-ship-kill-gate.md`
  prints ≥ 1; if SHIP, a SP REST `Files/Add` receipt exists for the final
  `che-quick-calcs.html` (UniqueId + Length == local bytes) AND the pilot file
  is engine-deleted (delete via SP REST `Files` delete; a read-after-delete
  check is not possible under the read-403 asymmetry — record the 200 delete
  receipt); if KILL, the pilot delete receipt is recorded.

## Todo
- [ ] 5.1 Pilot published + 200 receipt
- [ ] 5.2 Sandbox render receipt (or PENDING-OWNER)
- [ ] 5.3 Owner combined session outcomes
- [ ] 5.4 Decision recorded + tenant clean

## Success Criteria
- A dated SHIP/KILL decision with complete evidence links; no probe/pilot
  leftovers; on SHIP, the final URL is the only gadget artifact in the tenant.

## Risk Assessment
- Sandbox rejects something the audits couldn't see (inline-script nonce,
  viewer quirk): discovered at 5.2, BEFORE the owner session — that ordering is
  the protection; a KILL here costs only the build effort already banked.
- Owner session slips past the token expiry window (workbench token dies
  2026-12-11): the Lane A leg of the one-pager carries its own expiry warning;
  re-minting is the 261111-1048 track, not this plan's.

## Security Considerations
- APP-ONLY engine writes; the artifact is inert by construction; deletion via
  the engine (Graph delete on the driveItem) — never leave orphan files.

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
- SHIP → announce per owner's channel; the gadget joins the quarterly sweep.
- KILL → lane re-evaluation only on a new owner ask (v2 triggers: LiveData
  coefficients, second gadget case).
- Kongming checkpoint (advice mode): after the decision, spawn kongming with
  the full evidence set for a closing review.
