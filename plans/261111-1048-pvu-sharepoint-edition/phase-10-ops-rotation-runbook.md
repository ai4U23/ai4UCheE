# Phase 10 — Ops Runbook: 30-Day Token Rotation, Monitoring, Kill Switches

## Context
- Brainstorm: `plans/reports/brainstorm-20261111-pvu-sharepoint-edition.md` · Research: `plans/reports/research-20261111-interactive-html-on-sharepoint.md`
- Related phases: consumes Phase 4 (mint/revoke), Phase 6/7 (pages to rotate), Phase 5 (origin to monitor).

## Overview
Priority P2 · Status Pending · Effort 0.25d setup + recurring ~20 min/30 days.
The embed token expires every 30 days by design; without rotation the students' front door goes dark. This phase writes the runbook that makes rotation routine (mint → paste → revoke old → verify), sets up lightweight monitoring of the origin, and documents the kill switches and the quarterly law re-check. It also records the token ledger (surface registry).

## Requirements
Functional:
- Rotation ritual documented with exact commands and owner steps, executed the first time as the rehearsal.
- Token ledger: mint date, jti, expiry, page(s) holding it, revoke date — kept beside the Phase 4 slug registry note.
- Monitoring: VPS-side cron health probe every 5 min with alert on 2 consecutive failures `[VERIFY-AT-EXECUTION: alert channel — reuse an existing ai4UPVU notification path or owner email; keep it simple]`; weekly one-liner log review (401/429 rates).
- Kill switches documented and drilled once (non-destructively): epoch revocation darkens the embed while the direct surface stays up.
- Quarterly law re-check checklist (corpus containment, no client keys, registry vs reality, allowlist entries).
Non-functional: every recurring action is a copy-paste command; nothing depends on CI (law).

## Architecture
```
Every 30 days:
 mint (VPS script) → owner edits page property/iframe src (10 min)
   → revoke old JTI/epoch → verify (embed loads; old token 401; bare 401)
   → ledger updated
Always: cron /health probe → alert channel; weekly log scan
Emergency: revoke_all_tokens('che-workbench') → embed dark ≤60 s; direct surface unaffected
```

## Related Code Files
| Path | Action | Change |
|---|---|---|
| `docs/ops-pvu-embed.md` (repo ai4UCheE) | create | The runbook (ritual, monitoring, kill switches, quarterly checklist, ledger pointer). |
| VPS crontab (host) | modify | Health probe entry `[VERIFY-AT-EXECUTION: user/paths]`. |
| Token ledger note (beside Phase 4 registry) | modify | Living table. |
| `plans/261111-1048-pvu-sharepoint-edition/reports/rotation-rehearsal-<date>.md` | create | First-rotation evidence. |

## Tasks

### Task 10.1 — Write the runbook
**Goal:** A single page an owner can follow under time pressure.
**Target files and symbols:** `docs/ops-pvu-embed.md`.
**Steps:**
1. Sections: rotation ritual (with the exact mint command from Phase 4, owner edit steps for Lane A page and Lane B property, revoke command, verify trio), monitoring, kill switches (ordered: revoke tokens → caddy vhost → compose down → delete page), quarterly checklist, secret-rotation procedure (fallback-secret dance per `token_manager.py:96-100`).
2. Include the verify trio as copy-paste: (a) page loads in member session; (b) `curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer <OLD>" https://chemeng.pvu.ai4u.now/api/screen-state` → `401`; (c) bare POST `/api/copilot` → `401`.
**Success criteria:** Runbook covers all sections; commands match Phase 4/5 reality.
**Verify:** `grep -c "## " docs/ops-pvu-embed.md` → ≥ 5.

### Task 10.2 — First rotation rehearsal (the real one)
**Goal:** The Phase 6/7 token is rotated once, proving the ritual end-to-end.
**Steps:**
1. Mint fresh token; owner updates the live page (Lane A iframe src or Lane B property).
2. Revoke the previous JTI (or advance epoch if rotating all surfaces).
3. Run the verify trio; record results + ledger row.
**Success criteria:** All three verifications pass; students' page keeps working through the rotation.
**Verify:** the trio commands' outputs recorded in the rehearsal file; `grep -c "401" <rehearsal file>` → ≥ 2 (old-token + bare controls).

### Task 10.3 — Monitoring live
**Goal:** Origin outages surface without a student reporting them.
**Steps:**
1. Add VPS cron: `*/5 * * * * curl -fsS -m 10 https://chemeng.pvu.ai4u.now/health >/dev/null || echo "che-workbench health fail $(date)" >> /var/log/che-health.log` plus the chosen alert hook on repeat failure.
2. Weekly review one-liner documented: `docker logs --since 168h <workbench-container> 2>&1 | grep -c " 401 "` and same for `429` (baselines recorded in the runbook after week 1).
**Success criteria:** Cron entry active; one deliberate failure test (stop container 2 min) triggers the log/alert; restart clean.
**Verify:** `grep che-workbench <crontab dump>` present; failure-test line present in `/var/log/che-health.log`.

### Task 10.4 — Kill-switch drill (non-destructive) + quarterly checklist
**Goal:** Confidence that the emergency brake works before it is ever needed.
**Steps:**
1. Mint a throwaway token (short TTL); revoke via epoch on the slug is NOT used here (it would kill the live token too) — instead revoke the throwaway JTI and confirm 401 (already proven in Phase 5; drill = re-run + time it).
2. Document measured propagation time (expect ≤ 60 s).
3. Write the quarterly checklist into the runbook: corpus containment re-check (Task 5.5 step 6 commands), `grep` gateway key absence from `dist/` (`grep -r "GATEWAY_API_KEY\|sk-" dist/ | wc -l` → 0), allowlist + registry vs reality, surface list (Lane A archived?, Lane B active, gadget state).
**Success criteria:** Drill timed and recorded; checklist written.
**Verify:** `grep -c "quarterly" docs/ops-pvu-embed.md` → ≥ 1; drill note contains a propagation time.

## Todo
- [ ] 10.1 Runbook written
- [ ] 10.2 First rotation rehearsed + ledger row
- [ ] 10.3 Monitoring cron + failure test
- [ ] 10.4 Kill-switch drill + quarterly checklist

## Success Criteria
- Rotation performed once for real with the verify trio green; next rotation date in the owner's calendar (set during 10.2).
- Monitoring catches a deliberate outage; weekly review commands documented with baselines.
- Rollback/rollback-of-ops: runbook is docs-only; cron removable in one line; no application changes in this phase.

## Risk Assessment
- Missed rotation = students dark at day 30: mitigations — calendar event set in 10.2, banner copy tells students to contact the admin (Phase 2), monitoring would show 401 spikes if tokens lapse unexpectedly.
- Alert channel unverified: Task 10.3 keeps a log-file floor even if the fancy channel fails.
- Owner availability: ritual is ~20 min and fully scripted; the planner can run all server-side steps with the owner doing only the page edit.

## Security Considerations
- Secret rotation procedure uses the engine's fallback-secret dance (dual-verify window, no downtime); secret values never printed in the ledger (jti + dates only).
- Quarterly checklist re-proves the standing laws (corpus, keys, registry) — decay of containment is the long-game risk this exists for.
- No credentials in cron beyond what the VPS already holds; log file contains no tokens (fragment transport means tokens never appear in server logs).

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
- Hand the runbook URL to the owner; set the recurring calendar event.
- Plan complete when phases 1–10 are executed or explicitly cancelled (Phase 8 may legitimately end Cancelled by its kill gate).
