---
title: "R5 GUI-round fixes: WB3 NPSHa flow response + locale-aware dial"
date: 2026-11-04
summary: "Fixed R5 DEF-1 (flow-dependent h_f,s) and OBS-1 (browser-locale dial digits); OBS-2 closed not-a-defect"
---

# R5 GUI-round fixes: WB3 NPSHa flow response + locale-aware dial

## What happened
R5 browser QA on prod chemeng.ai4u.now (2026-11-04) found DEF-1 (WB3 NPSHa static vs Flow Q), OBS-1 (WB2 dial rendering "373,15" under EN UI — native type=number follows browser locale), OBS-2 (suspected mission-banner overlap).

Root causes:
- DEF-1: `hydraulics-solver-math.ts` used `HF_SUCTION_M = 0.8` constant while the NPSHa(Q) chart (`hydraulics-curve-svg-math.ts:76`) models `0.8·(Q/250)^1.8` — card vs chart convention mismatch.
- OBS-1: `<input type="number">` display is browser-locale-controlled; app cannot override.
- OBS-2: `.mission-banner` is static in-flow (workbench-components.css:142) — overlap geometrically impossible; R5 read was a stale-compositor artifact.

## Decision
- DEF-1 fix: h_f,s = 0.8·(Q/250)^1.8 in the solver, calibrated to the shipped duty point so ALL existing numbers at 250 gpm are preserved (NPSHa 12.64 m). Mission preset truth changes 4.18→2.68 m; rescue 21.8→21.7 m — narrative catalogs (fogler-problem-solving-catalog, problem-library-catalog-a, mission-scenarios comment, VI dictionary key+value in sync) and phase15 fixture updated together so UI never contradicts itself.
- OBS-1 fix: dial rewritten as locale-controlled text field (app locale via getActiveLocale + subscribeLocale re-render), accepts "." and "," entry, draft state survives garbage input, explicit role="spinbutton" + aria-valuenow/valuetext preserves AT semantics (no role-based locators existed, verified by grep).
- OBS-2: no code change; render-check DOM audit 0 errors confirms.

## Verification
- New regression tests: `src/__tests__/hydraulics-solver-npsh-flow.test.ts` (4: duty anchor 12.64, monotonic Q response + h_f,s in substitution, mission cavitating, rescue predicate) and `src/__tests__/scrubbable-input-locale.test.tsx` (4: EN dot, VI comma re-render on locale switch, comma/dot entry, garbage-draft blur recovery).
- Full suite 80/80 PASS (18 files), tsc --noEmit clean.
- REVIEW.md gate: render-check.mjs 0 errors on showcase AND mission deeplink at 320/375/768/1440 (44 warnings = KaTeX sub/superscript glyph pairing, pre-existing class).
- LOC ceilings: 155 / 118 / 77 / 40 — all < 200.
- Mission banner visual re-verified at 1440×900: chip shows "NPSHa (2.7 m) < NPSHr (8.0 m)".

## Next steps
- Not committed (ak-fix: commit only when authorized) — 7 modified + 2 new test files staged in worktree.
- Deploy to chemeng Lightsail + prod re-verify pending user go-ahead; e2e suite (`npm run test:e2e`) recommended post-deploy.
- Copilot-responder narrative strings interpolate payload metrics, so no further 4.18/21.8 references remain (grep-verified).

> Historical work record — not durable authority. Prefer docs/specs/ADRs for current decisions.
