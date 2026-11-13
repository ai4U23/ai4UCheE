# Phase 3 — Workbench Embed (Lane A)

## Context
- Parent: `../plan.md` (laws 5, 6, 7; gate GC). Supersedes-for-execution:
  `261111-1048/phase-06-lane-a-sharepoint-embed.md` (its runbook remains the
  click-by-click source of truth).
- Workbench state: LIVE at the hidden origin, 261111 embed-escape hygiene
  battery 8/8 (commit 6a453cb), frontdoor basic-auth, token-gated APIs.
- Glue URL: minted 261111, jti d2996ea2, **exp 2026-12-11T08:34:03Z**
  (`261111-1048/reports/phase-06-owner-handover.md` holds the paste-ready
  string).
- Executor choice (gate GC): the owner's standing directive ("we are IT admin
  so use IAB to proceed", 261113) authorizes ME to attempt the clicks via the
  owner-authenticated IAB session; the owner may alternatively do them
  personally. Default in this phase: IAB-executed with owner told first; every
  click is a SharePoint UI action as the signed-in admin — no tenant API
  ceremony needed.

## Overview
Priority P1 · Status Pending · Effort 0.25d (IAB) or ~30 min owner.
Create + publish the student-facing workbench page
`che-workbench-embed.aspx` with the OOB **Embed** web part pointing at the
glue URL (height 1600), then prove it with the full browser battery. The
student link = this page's SharePoint address.

## Requirements
- Functional: page exists, published; embed frame renders the PVU-branded
  Vietnamese workbench; one calculation + one copilot question complete
  INSIDE the frame (the kongming Lane-A acceptance from 261111).
- Non-functional: hygiene law 6 (zero ai4u.now in the rendered embed DOM; no
  tab-off elements); token stays in the frame src, never in the address bar.

## Tasks

### Task 3.1 — TTL decision executed (gate GC input)
- Goal: the glue URL's life matches the owner's choice.
- Steps:
  1. Ask once (by reply or in the same session): **30 days** (monthly
     re-paste ritual) or **term (~90 days)**.
  2. If term: amend the mint CLI clamp in ai4UPVU
     (`mcps/publish/scripts/mint_che_embed_token.py`, the 1–30 `--ttl-days`
     bound that encodes the locked brainstorm decision) to allow ≤90, re-mint
     (purpose MUST be `embed`, slug `che-workbench`, sub `pvu-cohort`), update
     the handover doc's glue string, commit by path.
  3. If 30 days: keep the existing URL; add the expiry probe to the P6
     healthcheck ritual (re-mint reminder before 2026-12-11).
- Success criteria: the decision recorded with date in the phase summary; the
  glue string in the handover doc matches the decision.
- Verify: `grep -c "TTL DECISION:" <this file's summary>` prints 1 after
  execution (write it in).
- Escalation note (kongming): if the owner is silent by ~2026-11-25, ASK ONCE
  MORE with the mid-term-outage rationale (a 30-day pass expires 12-11,
  mid-term → silent class disruption; a term pass rides the term). NEVER
  silently default either way — 30d was a locked brainstorm decision and
  term-length is kongming-counseled; it stays the owner's call.

### Task 3.2 — The five clicks (IAB-executed default)
- Goal: the page exists with the embed web part.
- Steps (owner-authenticated IAB; each verified by DOM snapshot before the
  next):
  1. Site settings → HTML Field Security → allow
     `https://chemeng-pvu.ai4u.now` (if the modern UI exposes it; if the
     settings page 403s for the group site, record it and proceed — the OOB
     Embed web part allowlist is checked at render; the render battery in
     3.4 is the arbiter).
  2. Site Pages → New → Page → title "CHE Workbench"; rename address to
     `che-workbench-embed` if prompted.
  3. Add web part → the one called **Embed** (not "Link"/"Website address").
  4. Paste the glue URL from the handover doc; set height ≈1600.
  5. Save as draft → render check (3.3) → **Publish**.
- Success criteria: draft page exists with the frame loading the workbench.
- Verify: the draft page URL opens in IAB and `domSnapshot()` shows the
  workbench app shell inside the frame (heading + app chrome).

### Task 3.3 — In-frame interaction acceptance
- Goal: a student flow completes inside the page.
- Steps (IAB on the draft):
  1. Run one real calculation (any workbench module) inside the frame.
  2. Ask the copilot one question inside the frame; receive an answer.
  3. Screenshot both into the report dir.
- Success criteria: both interactions complete; frame never navigates the tab.
- Verify: report contains `CALC_PASS` and `COPILOT_PASS` dated lines
  (`grep -cE "CALC_PASS|COPILOT_PASS"` prints 2).

### Task 3.4 — Hygiene battery + publish
- Goal: law 6 proven on the real page, then published.
- Steps:
  0. **(kongming amendment) Author the battery script first** — the 261111
     "8/8" was SESSION evidence; no in-tree battery targets an external page
     URL (the committed artifact is the unit-level
     `src/__tests__/embed-escape-hygiene.test.ts`). Write a small Playwright
     spec (or IAB equivalent) against the page URL with the five enumerated
     assertions: share-menu count 0; showcase-link count 0; zero `ai4u.now`
     strings in the rendered DOM; store-backed API 200 inside the frame;
     address bar SharePoint throughout. Commit it with this plan's receipts.
  1. Run that battery against the draft page URL.
  2. All green → click **Publish** in the page UI; record the published URL.
  3. Copy the page's own address — that is THE student link (handover doc's
     two-link table).
- Success criteria: battery green; published; student link recorded.
- Verify: the battery output shows all assertions passing (paste the summary
  into the report); the published URL returns 200 in IAB.

## Todo
- [ ] 3.1 TTL decision recorded (+ re-mint if term)
- [ ] 3.2 Five clicks done (IAB/owner)
- [ ] 3.3 CALC_PASS + COPILOT_PASS
- [ ] 3.4 Battery 8/8 + published + student link recorded

## Success Criteria
Published SharePoint page embedding the workbench; interactions proven inside
the frame; zero hygiene escapes; the student link lives in the handover doc.

## Risk Assessment
- HTML Field Security page unavailable on group sites → the render battery
  arbitrates; if the frame is blocked, the fallback is the owner's tenant
  allowlist (portal) — recorded, not improvised.
- Copilot needs the gateway env on the VPS (paste-ready since 261111) — if
  unset, the copilot degrades to Tier-1 deterministic (still answers; note in
  the receipt which tier served).

## Security Considerations
- Token in fragment only; the frame src is member-readable (accepted
  internal-tier posture, recorded 261111); no new secrets anywhere.

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
- P6 adds the cross-link (native Lite page ↔ this embed page) and the
  expiry-rotation ritual slot. Sibling-lane note: this phase touches ONLY the
  tenant UI + (optionally) the ai4UPVU mint script — never the BOD surfaces.
