---
title: "fix(ai4UCheE): WAAPI opacity-0 lag re-applied after Phase 16 clobber + sticky calc-sheet modal"
date: 2026-10-31
summary: "Replaced user-facing initial opacity:0 with opacity:1 across 6 motion surfaces, added sticky modal header + instant compiled-output scroll, live-verified on chemie.ai4u.now; parallel Phase 16 session clobbered 2 files mid-cycle and the fix was surgically re-applied."
---

# fix(ai4UCheE): WAAPI opacity-0 lag re-applied after Phase 16 clobber + sticky calc-sheet modal

## What happened
- Black-box GUI test of https://chemie.ai4u.now found 2 defects: (1) motion/react v12 WAAPI left inline `style="opacity: 0"` on stage wrappers/cards/banners while compositing opacity, breaking Playwright actionability and flashing washed-out text during tab switches; (2) CalcSheetPreviewModal's Close button scrolled out of view and the compiled EPC output mounted below the fold.
- Fix: all user-facing `initial={{ opacity: 0, ... }}` -> `opacity: 1` with subtle y/scale offsets in framer-motion-tokens.ts, framer-motion-primitives.tsx, white-box-equation-card.tsx, mission-checklist-banner.tsx, agent-chat-drawer.tsx; `.modal-sticky-header` CSS + `data-testid='calc-sheet-sticky-header'`; guarded `scrollIntoView({ behavior: 'auto', block: 'start' })` after compile (smooth is rAF-driven and stalls in occluded panes).
- **Clobber incident**: parallel session building "Phase 16 — Fogler Problem-Solving Flow" overwrote white-box-equation-card.tsx and mission-checklist-banner.tsx from a pre-fix snapshot mid-cycle. Kongming caught it by direct source grep (settled-state live checks cannot distinguish fixed vs reverted). Fix re-applied surgically around their 6-stage/HypothesisTroubleshootingBoard code; re-verified: grep clean (only SwarmPulseDot 0.4), tsc errors confined to their 5 WIP spots, Vitest 56/56 full + 13/13 targeted, Pytest 46/46, all files < 200 LOC.
- Live verification on chemie (dist-only deploy, health 200): stage/modal `opacity: 1`, mission banner + steps opacity 1 from mount with Phase 16 six-stage stepper intact, sticky Close pinned at top=55px through scroll+compile, compiled output instantly in view (outputTop 264).

## Decision
- Left the parallel session's 5 tsc-only errors (phase16 test initialPersona x4, calc-sheet-builder.ts:165 string->WorkbenchId) entirely to them — runtime green, escalation over types is noise.
- Did NOT commit: the re-applied fix is interleaved with Phase 16 logic in 2 files; commit hygiene belongs to whoever lands Phase 16.
- Deployed dist only (not src) to avoid pushing their mid-flight server-side src to the VPS runtime.

## Next steps
- Whoever lands Phase 16: run `npx tsc --noEmit` clean before commit; my `style.opacity !== '0'` tripwires live in phase15-framer-luxurious-motion.test.tsx Test 2/3.
- Residual (accepted, do not reopen): occluded-pane rAF throttling stalls the JS transform spring leaving `translateY(~10-12px)` until the pane foregrounds — imperceptible with opacity at 1.
- Coordination: parallel sessions editing this repo must re-run `grep -rn "opacity: 0" src/` before trusting any prior "verified" claim.

> Historical work record — not durable authority. Prefer docs/specs/ADRs for current decisions.
