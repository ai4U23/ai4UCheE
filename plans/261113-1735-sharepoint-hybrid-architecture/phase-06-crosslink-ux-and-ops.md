# Phase 6 — Cross-Link UX + Ops Fold

## Context
- Parent: `../plan.md` (laws 2, 4, 9). Runs last; every surface it links must
  already be live (Phases 2–5).
- Surfaces to order (all SharePoint addresses):
  - Native: `che-quick-calcs.html` (Lite core), `pvu-bod-usage-mirror.html`
    (BOD native mirror), content folders (Calc Sheets, Teacher Guides,
    SiteAssets, Stream).
  - Window: `pvu-bod-usage-dashboard-vn.aspx` (chatbot — untouched),
    `che-workbench-embed.aspx` (full workbench).
- UX law from the owner's hybrid decision: the NATIVE page is the primary
  ("the SharePoint page" must be the one that always works); the AI page is
  one click away, clearly labeled.
- Ops folds: 261111-1048 P10 (rotation/healthcheck/backup) + this plan's
  watch items (page-version churn, GA/GB recurrence).

## Overview
Priority P2 · Status Pending · Effort 0.25d.
Make the hybrid legible (nav + cross-links + labels) and durable (ops
runbook entries: dual-lane liveness, rotation ritual, watch items, rollback
anchors).

## Tasks

### Task 6.1 — Navigation order + labels (kongming-amended: chatbot page is NAV-ONLY; native links live INSIDE the artifacts)
- Goal: site nav presents native-first with clear Vietnamese labels; every
  pair cross-linked WITHOUT touching the protected chatbot page and without
  pretending native `.html` files have a web-part canvas (they do not — they
  render through the sandboxed viewer).
- Steps (IAB, owner session; UI-only changes):
  1. Site navigation edit: order → Quick-Calcs (Lite) first, then the BOD
     native mirror, then the two AI pages labeled with the AI hint, e.g.
     "BOD dashboard (bản có Trợ lý AI)" and "CHE Workbench (bản đầy đủ — có
     Trợ lý AI)". Exact labels are owner-taste; propose, then apply.
  2. **Chatbot page (`pvu-bod-usage-dashboard-vn.aspx`): NAV-ONLY.** Law 3
     protects it absolutely — not even an additive text web part (a single
     web part is still a page version on the protected surface). Its
     discoverability flows from nav ordering; the MIRROR carries the
     forward link to it instead.
  3. **Native pages: cross-links are BAKED INTO the artifacts** (the gadget
     builder and the BOD mirror artifact get a small footer line: "Cần Trợ
     AI? Mở <twin page name>" + the twin's relative SharePoint URL).
     Then run a 30-second sandbox probe: does an `<a>` click inside the
     sandboxed viewer actually navigate (the sandbox may strip top
     navigation)? If yes → keep the link; if no → degrade to a plain-text
     pointer line ("mở từ menu trang") — record which shape shipped.
  4. Workbench embed page (unprotected surface): one text web part line +
     link back to the Lite page.
- Success criteria: every surface reachable from nav; each UNPROTECTED pair
  cross-linked both directions; chatbot page byte-untouched.
- Verify: nav listing screenshot + `domSnapshot` of the Lite page and the
  mirror showing the twin link (or the recorded text-fallback note) + the
  workbench page showing its back-link + a dated
  `CHATBOT_PAGE_UNTOUCHED` line asserting zero page-version churn on the
  protected surface (record its MajorVersion before/after — must be equal).

### Task 6.2 — Ops runbook fold (261111-1048 P10 slot)
- Goal: one page answers "how is this all operated".
- Target files:
  `plans/261111-1048-pvu-sharepoint-edition/phase-10-ops-rotation-runbook.md`
  (amend) + this plan's `reports/ops-fold-2026-11-xx.md`.
- Steps:
  1. Amend the P10 file with the hybrid sections: (a) dual-lane liveness —
     the 06:20 cron now asserts `publish ok, mirror ok` (single point of
     failure = the shared bake; if the mirror leg fails twice consecutively,
     kongming checkpoint); (b) token-rotation ritual — the workbench embed
     pass expiry probe (re-mint + re-paste BEFORE expiry; TTL per Phase 3's
     recorded decision; the BOD mirror carries no token — structural);
     (c) watch items — SitePages version churn (~60/mo combined vs 500 cap;
     alert threshold 300), GA recurrence signature (`FAILED` cron lines), GB
     lane health (the engine Graph probe as a quarterly sweep item).
  2. Healthcheck script slot: a LOCAL `hybrid-doctor.sh` stub in
     `deploy/` (ai4UCheE) that shells the three read-only checks (cron tail,
     engine Graph probe, expiry probe) — batteries-local law; cron optional
     at owner taste.
- Success criteria: P10 amended; doctor stub runs green on the live state.
- Verify: `bash -n deploy/hybrid-doctor.sh` exit 0; running it prints 3
  `OK` lines (or dated `PARKED` lines matching reality).

### Task 6.3 — Rollback anchors + final sweep
- Goal: every surface has a documented way back.
- Steps:
  1. Write the rollback table into the ops-fold report: Lite page →
     engine-delete + revert gadget commit; BOD mirror → remove the
     dual-publish step (one commit revert; the existing page was never
     touched); embed page → unpublish/delete the page (web part revert
     n/a — OOB); content items → engine-delete per item (receipts exist);
     Graph consent → remove the app-role assignment (recorded ids in
     Phase 1's report).
  2. Final sweep: every Verify receipt from Phases 1–5 listed with dates;
     every open item (owner decisions not yet taken) named with its gate.
- Success criteria: report complete; zero unnamed loose ends.
- Verify: `grep -c "ROLLBACK:" reports/ops-fold-2026-11-xx.md` ≥ 5 and the
  open-items list is either empty or each line names a gate.

## Todo
- [ ] 6.1 Nav + cross-links (4 pages, both directions)
- [ ] 6.2 P10 fold + hybrid-doctor stub
- [ ] 6.3 Rollback anchors + final sweep

## Success Criteria
A student or leader opening the site understands the layout in one glance
(native first, AI labeled); operations are a one-page answer; every surface
has a tested way back; the plan closes with all gates resolved or explicitly
parked with dates.

## Risk Assessment
- Nav editing on modern group sites is owner-taste territory — propose labels
  first, apply after a one-word OK; nothing here is load-bearing for the
  lanes themselves.
- The doctor stub is intentionally read-only; if any probe regresses, it
  reports `PARKED` lines — it never "fixes" anything itself.

## Security Considerations
- UI-only tenant changes; no credentials, no secrets in any report or
  runbook; the rollback table references recorded receipts, not stored
  tokens.

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
- Plan closure: statuses to completed as each phase proves out; the kongming
  closing review carries the full evidence set; then `/ak-cook` is DONE and
  the standing program continues under 261111-1048 P7 (Lane B SPFx) whenever
  the owner opens it.
