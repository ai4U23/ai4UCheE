---
title: "fix(ai4UCheE): resolve all 8 Round-2 Studio-UI GUI audit findings (ghosted ivory text, hypothesis tally, citation sanitization, copilot question guard, mobile header)"
date: 2026-10-31
summary: "Fixed inherited --ivory text color on light drawers/banners inside .shell-header, counted tested hypotheses toward X/3 tally & Stage 5 with truthful Rule #12 card titles, validated WB1 section/page citations against all 25 Perry sections, guarded copilot What-If parser against conceptual questions & wired WB1 quick action, and fixed mobile 375px header wrapping."
---

# fix(ai4UCheE): resolve all 8 Round-2 Studio-UI GUI audit findings

## What happened
- Round-2 `web-gui-tester` run after the 3-Zone Studio-UI overhaul (`bec72c3`..`0e828e7`) and Phase 16–19 additions found 8 defects/polish items across `https://chemie.ai4u.now`:
  1. **DEF-4 (HIGH)**: `GuidedMissionBar` is mounted inside `<header className="shell-header">` (`color: var(--ivory)` = `rgb(251, 246, 236)`), and its child surfaces (`ProblemLibraryBrowser`, `AdaptiveRecommendationRail`, `.studio-floating-mission-wrap > MissionChecklistBanner`, `HypothesisTroubleshootingBoard`) had light backgrounds (`#ffffff`/`#f5f0e0`) without resetting `color: var(--ink-primary)`, rendering text near-invisible.
  2. **DEF-5 (HIGH)**: `evaluateSixStageProgress` only incremented `correctHypothesisCount` when `userVerdict === expected` and required `rootCauseProved && decoysDisproved` for `stage5HypothesesDone`, while `HypothesisTroubleshootingBoard` emitted `🔬 Hypothesis PROVED` GenUI card titles even when falsified by Rule #12.
  3. **DEF-1 & DEF-1b (HIGH — Citation Integrity)**: Switching WB1 `Section selector` hardcoded `${s}-1` without updating `exactValue` (leaving `0.0045` and falling through to Sec 2 water vapor pressure `373.15 K`), and `Sec-Page` accepted arbitrary strings (`zz-99`) to fabricate `[Perry's 9th Ed., p. zz-99]`.
  4. **DEF-6 & DEF-2 (MEDIUM)**: `parseCopilotScenario` had no guard against interrogative/conceptual questions, so `"Why is my reading 4x higher than Perry's value?"` matched `"reading 4"` and mutated `userReading` to `4`; meanwhile WB1's quick action `'⚡ Correct Chart Reading to Perry-Exact (0.0045)'` failed to match because `" Perry-Exact ("` sat before `"0.0045"`.
  5. **DEF-7 & OBS-1..3**: Mobile 375px `.shell-header` kept a 3-column grid and `right: 390px` on `.studio-floating-mission-wrap`; `.starter-prompts` clipped horizontally; `ProblemLibraryBrowser` stayed open after clicking `Solve Problem #N`; empty reading + Verify coerced `""` to `0`.

## Root-cause fixes implemented (11 files, all <= 195 LOC)
- `src/styles/workbench-components.css` & `src/styles/theme-tokens.css`: reset `color: var(--ink-primary)` on `.wb-panel`, `.wb-tutor-card`, `.chat-drawer`, `.mission-bar`, `.studio-floating-mission-wrap`, `[data-testid="problem-library-browser"]`, `[data-testid="adaptive-recommendation-rail"]`, and `.mission-banner`; scoped dark header button chrome to direct header bar children; stacked `.shell-header` at `<=767px` and wrapped `.starter-prompts`.
- `src/lib/hypothesis-verification-engine.ts` & `src/components/shell/hypothesis-troubleshooting-board.tsx`: counted `testedCount` toward `X/3` progress and `stage5HypothesesDone` (`testedCount >= 2`), and updated GenUI proof card titles to distinguish `✅ Hypothesis Verified` vs `⚠️ Rule #12 Falsification`.
- `src/lib/perry-figure-chart-meta.ts`, `src/lib/perry-figure-curve-sampler.ts`, `src/components/workbenches/visual-verifier-workbench.tsx`, `src/components/workbenches/visual-verifier-tutor-card.tsx`: added `resolvePresetForSection` + `sanitizeSecPageInput` backed by `PRESET_ANCHORS` and `getPerrySectionByNumber`, prevented fabricated citations on invalid `Sec-Page` (`invalid-secpage-warning`), auto-revealed verdict on `userReading` mutation, and added empty-reading prompt.
- `src/actions/copilot-scenario-parser.ts` & `src/components/shell/guided-mission-bar.tsx`: added `isConceptualQuestion(prompt)` guard, tightened `reading` (`(?![x×\d])`) and `nps` regexes, restricted implicit Atlas routing, and auto-closed `ProblemLibraryBrowser` on problem launch.
- `src/__tests__/phase17-problem-library-catalog.test.tsx`: added `Test 4` covering `DEF-1`, `DEF-1b`, `DEF-2`, `DEF-5`, `DEF-6`, `OBS-1`, and `OBS-3`.

## Verification
- `npx tsc --noEmit`: 0 errors.
- `npx vitest run`: 13/13 test suites, 61/61 tests passing.
- `npm run build`: clean production bundle (`index-B8TCD9sU.js`, `index-Cs2GJ_mV.css`).
- Live deployment to `chemie` (`https://chemie.ai4u.now`) verified via In-App Browser (`r2_verify_def4_library_crisp.png`, `r2_verify_obs1_def4_banner_crisp.png`, `r2_verify_def1_def2_def5_def6_all_pass.png`, `r2_verify_def7_mobile_375_clean.png`).
- Kongming final review score: **9.7 / 10 (GO)**.

> Historical work record — not durable authority. Prefer docs/specs/ADRs for current decisions.
