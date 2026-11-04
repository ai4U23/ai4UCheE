---
title: "ak-fix: DEF-2 mission-panel layout + OBS-1 showcase smooth-scroll on ai4UCheE (R4 round)"
date: 2026-11-04
summary: "Fixed R4's DEF-2 (mission-banner-head flex collapse + trap-pill overflow when a mission is active) and OBS-1 (showcase scroll-behavior smooth), verified in headless Chromium across 4 viewports; pinned with phase20 CSS-contract test"
---

# ak-fix: DEF-2 mission-panel layout + OBS-1 showcase smooth-scroll (R4 follow-up)

## What happened
ak-fix all on the R4 GUI-round findings (deploy HEAD 4b6c26f, report `plans/reports/browser-qa-r4/R4-report.md`):
- FIXED DEF-2: `.mission-banner-head` was a NO-WRAP flex row and `.mission-pill` was `white-space: nowrap` — with a mission active, the two long pills (worked-case + 22fc2f8 trap banner) claimed full width and the title `<strong>` collapsed to min-content 70×315 px (one word/line) while the trap pill overflowed to x=1506 (inner h-scrollbar). Root cause introduced 2026-11-03 by the trap-note banner (22fc2f8); the ak-fix round's `/app overflow 0px @1440/768/375/320` check measured the DEFAULT state only — mission-active slipped through. Fix (CSS-only, `src/styles/workbench-components.css`): head `flex-wrap: wrap`, `strong { flex: 1 1 240px; min-width: 240px }`, pill `white-space: normal; overflow-wrap: break-word; max-width: 100%` (also future-proofs the adaptive-rail badges + detective nudge at mobile).
- FIXED OBS-1: `html { scroll-behavior: smooth }` in `public/showcase.html:115` (+ `assets/showoff/ai4uchee-homepage/index.html` mirror) → `auto`, per the repo's own 2026-10-31 rAF-stall lesson (IAB anchor nav stalled at scrollY 700 during R4; hero CTA reached 809 only on retry).
- OBS-2 (one-off self-reload wiping mission state): documented, no repro on relaunch (mission persisted 75s+), no code change.
- IAB input pipeline was fully wedged (clicks dead on every tab incl. fresh ones), so live verification ran on **headless Chromium** instead: playwright-core + cached `chromium-1248` in `/tmp/pw-verify` (no repo deps added; script `verify-def2.mjs` re-runs the exact failing path: Browse All → Solve Problem #2 → mission banner → measure).

## Decision
- CSS-only fix over JSX restructuring: cause is purely the flex/pill rules; `min-width: 240px` floor keeps the title readable at 320 while `flex-wrap` moves pills to their own rows. No component edits (mission-checklist-banner.tsx untouched at 137 LOC).
- Pills allowed to wrap globally (`white-space: normal`) rather than scoping to the banner: the only other `.mission-pill` consumers are 4 adaptive-rail badges whose text is shorter than their containers at all tested widths — wrap only engages on overflow, so it is strictly an improvement.
- Regression pin as CSS file-contract assertions (phase20, same style as the c43beca liveness pin) because jsdom cannot compute flex layout.

## Verification
- Real-engine re-run of the failing path (headless Chromium): title **304×63 @1440** (was 70×315), trap-pill right edge **730/730/342/287** @1440/768/375/320 (was 1506), `overflowX = 0` at all four viewports; mission panel screenshot evidence `fix-def2-mission-active-1440.png` / `-375.png` (title wraps naturally, trap banner fully visible, no h-scrollbar).
- OBS-1 re-run: showcase anchor click → `scrollY 810` (exact sticky-offset target), computed `behavior: auto`.
- Full Vitest **72/72** (16 files; +3 phase20 pins), `tsc --noEmit` clean, `npm run build` OK — bundle hash changes `index-DU8EZj8R.js` → `index-BUJYMsRm.js`.
- Housekeeping: killed a stale pre-fix vite (PID 57269) squatting on 5173 from the R4 session; stopped this round's dev server after verification.

## Next steps
- ~~Not committed / not deployed~~ → **DONE same session (2026-11-04):** commits `ea7e858` (fix: css + 2×html + phase20 test) and `8132c24` (docs: R4 artifacts + journal), pushed to `ai4U23/ai4UCheE` main, deployed via the proven file-sync flow (scp 3 files → on-box `npm run build` → restart `perry-workbench perry-workbench-http`). On-box build hash `index-BUJYMsRm.js` == local byte-for-byte; prod CSS `index-DisOKVB4.css` carries all 4 fix markers; `/health` ok (2274 pages).
- **Prod verification complete:** headless-Chromium re-run against https://chemeng.ai4u.now — identical green matrix (title 304×63 @1440, pill right 730/730/342/287, overflowX 0 @4 viewports; anchor scrollY 810, `behavior: auto`). Prod screenshots: `fix-def2-prod-mission-active-{1440,375}.png`.
- OBS-2 stays monitor-only; copilot NL what-if + WB1 scrub + WB5 PDF crop remain the untested backlog from R4.

> Historical work record — not durable authority. Prefer docs/specs/ADRs for current decisions.
