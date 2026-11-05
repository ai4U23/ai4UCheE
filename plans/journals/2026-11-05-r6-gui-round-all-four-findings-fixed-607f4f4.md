---
title: "R6 GUI round: all four findings fixed (607f4f4)"
date: 2026-11-05
summary: "ak-fix all after R6 browser QA on chemeng — header overlap, table clipping, locale wording; deploy pending Tailscale re-auth"
---

# R6 GUI round: all four findings fixed (607f4f4)

## What happened
R6 GUI round (2026-11-05, chemeng.ai4u.now @ b929af6) surfaced 2 defects + 2 wording observations. `/ak-fix all` repaired all four in commit `607f4f4` (pushed to origin main):

- **DEF-1 (P2)** top-studio-bar pill overlapped EN/VI chips at 1280 AND 1440. Root cause measured live: `.shell-header` grid `auto 1fr auto` (theme-tokens.css:87) let the two `auto` side clusters (brand 664px + actions 523px) starve the `1fr` middle track to ~37px; the `fit-content` mission-bar (workbench-components.css:70) centered in that track spilled ±150px over both neighbours. Fix: middle track `minmax(0,1fr)` + header-stack breakpoint 1200px→1560px (1-row needs ~1549px intrinsic) + `min-width:0` on the bar. Verified: stacked & clean at 1280/1440 (header 142px), 1-row with 198px clearance at 1680. Phantom clashes from the `studio-drawer-collapsed` popover (fixed w0/h0 overflow:hidden) disproved visually.
- **DEF-2 (P3)** fault-map matrix + tier-rubric tables clipped by `.wb-panel{overflow-x:hidden}`: rubric auto-layout min-content 956–1123px, matrix chips spilled fixed columns at ≤1280/375. Fix: `overflow-x:auto` wrappers + width floors (matrix 620px; rubric 480px fixed layout + break-word). Sections now clip 0px; content reachable; page overflow stays 0.
- **OBS-2** hardcoded "BUỔI n" session prefix → `curriculum-copy.sessionOrdinal` (EN "SESSION n" / VI "BUỔI n").
- **OBS-3** VI rubric axis cells were EN → localized `rubricAxisValues`; PROGRESSION_TIER_META stays verbatim per the locked 261105-1411 decision.

## Decision
Honor the zero-overview rule over the 1-row header aesthetic below 1560px (stacked posture is the already-tested tablet layout). Keep tier meta verbatim; localize only the 4-axis comparison phrases. Reachability (scroll wrapper) over cramming for 7-column matrix at mobile.

## Verification
typecheck 0 · 98/98 Vitest · build ok · e2e 20/20 · render-check 0 errors @320/375/768/1440 (26 pre-existing KaTeX kerning warnings) · all files <200 LOC · browser-verified EN+VI at 1280/1440/1680 (evidence: gui-test-screenshots/fix_def1_header_stacked_1280.png, fix_obs23_vi_sessions_rubric.png).

## Next steps
- Deploy `607f4f4` to chemeng — BLOCKED on Tailscale SSH periodic re-auth check (non-TTY scp/ssh hang; user must visit the login URL once). Tarball ready at /tmp/r6fix-sync.tar. Live re-verify DEF-1/DEF-2 after deploy.
- Optional regression guard: add intra-header overlap assertion to e2e (page-overflow check missed DEF-1).

> Historical work record — not durable authority. Prefer docs/specs/ADRs for current decisions.
