---
title: "R7: 607f4f4 deployed + prod-verified, DEF-1 e2e guard landed"
date: 2026-11-06
summary: "Tailscale re-auth unblocked via PTY probe; 607f4f4 file-synced to chemeng; 21/21 live e2e + 38/38 live geometry/wording checks green"
---

# R7: 607f4f4 deployed + prod-verified, DEF-1 e2e guard landed

## What happened
R6's blocked deploy completed. Tailscale SSH re-auth was surfaced by running ssh under a PTY
(`/tmp/ssh-pty-probe.py`, pty.fork + 30s read window) — non-TTY sessions block silently, as the
deploy guide warned. Key operational lesson: **each probe mints a NEW auth URL and the poll loop
was invalidating the URL the user was working on**; single-probe-after-user-confirms is the
discipline. User completed `login.tailscale.com/a/…`, SSH opened as `admin@chemeng`.

Deploy (runbook file-sync): 6 files of `607f4f4` (lab-session-view, phase-domain-matrix,
tier-rubric-panel, curriculum-copy, theme-tokens.css, workbench-components.css) → scp tar →
sudo cp → `npm run build` (5.95s, bundle `index-DbaA0VPQ.js` + css `index-D0sm3FAA.css`) →
restart perry-engine + perry-workbench + perry-workbench-http.

## Regression guard (journal next-step from R6)
`T10b` in `tests/e2e/app-shell-persona.spec.ts`: pairwise rect-disjointness of the three header
grid zones (`.brand-identity` / guided-mission-bar / `.wb-actions-row`) @1280/1440/1680.
Page-overflow checks cannot see intra-header collisions — that is exactly how DEF-1 slipped.
**Negative-validated**: with pre-fix `theme-tokens.css` (`auto 1fr auto`) restored, T10b fails with
`mission×actions rects intersect @1280 (182px × 32px)`; post-fix green.

## Verification (all on live https://chemeng.ai4u.now post-deploy)
- CSS markers flipped: `grid-template-columns:auto minmax(0,1fr) auto` + `1560px` breakpoint
  (before: `auto 1fr auto` + `1200px`); `/health` ok, pdf 2274 pages.
- e2e suite vs live: **21/21** (incl. T10b against prod).
- One-off geometry/wording sweep (EN+VI × 1280/1440/375): DEF-1 zones disjoint 6/6 · matrix
  section clip 0px 6/6 · rubric section clip 0px 6/6 · page overflowX 0 6/6 · OBS-2 ordinals
  `SESSION 1..6` / `BUỔI 1..6` · OBS-3 VI rubric axes + VI matrix title/locked-chips/roadmap note.
- Screenshots eyeballed (r7-live-en-1280.png, r7-live-vi-1280-sessions.png): stacked header clean;
  rubric last column reaches via scroll wrapper at narrow widths — the locked
  reachability-over-cramming decision, working as designed.
- Note: OBS-2 ordinal renders only in Library→"Lab Sessions" view; first sweep false-FAILed
  checking it on the library view (script gap, not an app defect).

## Next steps
- None blocking. Backlog unchanged (Lương review: control/heat-transfer/L4 expansion, title-de-leak).
- If Tailscale re-auth blocks again: PTY-probe once, open the URL, DO NOT re-probe until the user confirms.

> Historical work record — not durable authority. Prefer docs/specs/ADRs for current decisions.
