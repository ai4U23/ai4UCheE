# Phase 05: Phase 9 E2E Verification Suite, Headless Browser Visual Audit (`render-check.mjs`), `<200` LOC Gate & Docs Sync

<!-- Updated: Validation Session 1 (2026-10-30) - test counts corrected (phase3=4, phase7=5, phase8=4, +6 new = 19), mission/WB2/WB3 testids and state keys corrected (mission-pump-npsha, compound/tempK, npsInch), thermo-solver-math.ts added to docs list -->

- **Parent Plan**: [`plan.md`](file:///Users/nad/ai4u/ai4UCheE/plans/261029-2335-chemie-interactive-ux-and-live-copilot/plan.md)
- **Status**: Completed
- **Estimated Effort**: 2.5h
- **Depends On**: [`phase-04-live-qaqc-calc-sheet-exporter.md`](file:///Users/nad/ai4u/ai4UCheE/plans/261029-2335-chemie-interactive-ux-and-live-copilot/phase-04-live-qaqc-calc-sheet-exporter.md)

## Context & Overview

This final phase locks in every interactive UX and AI-native capability with an automated end-to-end test suite ([`src/__tests__/phase9-interactive-intelligence.test.tsx`](file:///Users/nad/ai4u/ai4UCheE/src/__tests__/phase9-interactive-intelligence.test.tsx)), verifies zero visual/layout/contrast regressions across mobile/tablet/desktop viewports using the real headless Chromium `render-check.mjs` harness (`0 errors, 0 warnings`), enforces the strict `< 200` LOC invariant across all files in `src/` and `services/perry-engine/`, and synchronizes `./docs/` (`AGENTS.md` Invariant #6).

---

## Tasks

### Task 5.1: Create `src/__tests__/phase9-interactive-intelligence.test.tsx` (6 End-to-End Interactive Tests)

- **Goal**: Write a comprehensive Vitest + React Testing Library suite proving that all 5 previously broken interactive loops work end-to-end.
- **Target files and symbols**:
  - [`src/__tests__/phase9-interactive-intelligence.test.tsx`](file:///Users/nad/ai4u/ai4UCheE/src/__tests__/phase9-interactive-intelligence.test.tsx)
- **Steps**:
  1. Create [`src/__tests__/phase9-interactive-intelligence.test.tsx`](file:///Users/nad/ai4u/ai4UCheE/src/__tests__/phase9-interactive-intelligence.test.tsx) (~165 LOC) with 6 tests:
     - **Test 1 (`bi-directional <current-screen> payload sync`)**: Renders `<App />`, switches to `WB3` (`tab-wb3-hydraulics`), verifies `getClientAppState().payload.inputs` and `serializeCurrentScreenTag()` XML contain live `flowGpm`, `npsInch`, `pSuctionPsig`, and `npshAvailableM` (not `{}`).
     - **Test 2 (`3-Stage White-Box KaTeX substitution updates on parameter change`)**: Renders `WB3`, verifies `eq-stage-symbolic-wb3-npsha`, `eq-stage-substituted-wb3-npsha`, and `eq-stage-result-wb3-npsha` are present, dispatches a mutation (`flowGpm: 440`), and asserts Stage 2 & Stage 3 text updates live.
     - **Test 3 (`Interactive Guided Mission presets cavitation trap and auto-completes on rescue`)**: Clicks `data-testid="mission-pump-npsha"` (existing id), verifies `WB3` enters cavitation (`isCavitating === true` — the trap values were derived from the actual solver in Task 2.4) and `data-testid="mission-checklist-banner"` appears, clicks `data-testid="mission-autofix-btn"`, and verifies cavitation clears (`isCavitating === false`) and the mission banner marks solved.
     - **Test 4 (`WB2 renders interactive DipprPhaseEnvelopeSvg and live saturation substitution`)**: Switches to `WB2` (`tab-wb2-thermo-dippr`), verifies `data-testid="dippr-phase-envelope-svg"` renders with operating crosshair and switching compound to `ethanol` updates `getClientAppState().payload.inputs.compound`.
     - **Test 5 (`Copilot natural-language What-If prompt mutates workbench sliders live`)**: On `WB3`, sends `"Set pipe diameter to 6 in and suction pressure to 15 psig to stop cavitation"` in `AgentChatDrawer`, verifies `data-testid="copilot-mutation-pill"` renders and `getClientAppState().payload.inputs.npsInch` becomes `6`.
     - **Test 6 (`Live QA/QC CalcSheetPreviewModal reflects active workbench parameters`)**: Switches to `WB3`, mutates `flowGpm: 415`, clicks `export-calc-sheet-btn` ("Export Senior Calc Sheet"), and verifies the modal displays `415` and the `[Perry's 9th Ed., Sec. 10, pp. 10-24..25]` citation.
- **Success criteria**:
  - All 19 tests across `phase3-shell.test.tsx` (4), `phase7-e2e.test.tsx` (5), `phase8-ux-copilot.test.tsx` (4), and `phase9-interactive-intelligence.test.tsx` (6) pass with 0 warnings or errors.
- **Verify**:
  ```bash
  npx vitest run && test $(wc -l < src/__tests__/phase9-interactive-intelligence.test.tsx) -lt 200
  ```

### Task 5.2: Run Headless Browser `render-check.mjs` Visual & Layout Gate + `< 200` LOC Audit

- **Goal**: Verify the live rendered application across `375x812`, `768x1024`, and `1440x900` viewports (`student` and `pro` themes) using `render-check.mjs` (`0 errors, 0 warnings`) and enforce the `< 200` LOC invariant across the entire repository.
- **Target files and symbols**:
  - All files under `src/**/*.{ts,tsx,css}` and `services/perry-engine/**/*.py`
- **Steps**:
  1. Run the `< 200` LOC gate across all source files in `src/` and `services/perry-engine/`.
  2. Run `npm run typecheck && npm run build`.
  3. Start the Vite dev server and run `node /Users/nad/.gemini/config/skills/ak-frontend-design/scripts/render-check.mjs http://127.0.0.1:4173 --viewports=375x812,768x1024,1440x900` to confirm `0 errors, 0 warnings`.
- **Success criteria**:
  - Every file in `src/` and `services/perry-engine/` is `< 200` LOC.
  - `render-check.mjs` reports `0 errors, 0 warnings`.
  - Production build (`npm run build`) succeeds cleanly.
- **Verify**:
  ```bash
  npm run typecheck && npx vitest run && npm run build && for f in $(find src services/perry-engine -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.css" -o -name "*.py" \) -not -path "*/.venv/*" -not -path "*/__pycache__/*" -not -path "*.egg-info*" -not -path "*/node_modules/*"); do lines=$(wc -l < "$f"); if [ "$lines" -ge 200 ]; then echo "LOC VIOLATION: $f ($lines)"; exit 1; fi; done
  ```
  <!-- Updated: Validation Session 1 follow-up (2026-10-30) — LOC gate excludes .venv/__pycache__/egg-info (the original command swept site-packages and could never pass) -->

### Task 5.3: Synchronize `./docs/` Suite (`AGENTS.md` Invariant #6)

- **Goal**: Update `./docs/` to document the bi-directional `<current-screen>` state/mutation bus, 3-stage `<WhiteBoxEquationCard />`, interactive `<DipprPhaseEnvelopeSvg />`, self-guided rescue missions (`MissionChecklistBanner`), natural-language `gemini-4-argon-low` copilot `actionMutations`, and live QA/QC Calculation Sheet builder.
- **Target files and symbols**:
  - [`docs/system-architecture.md`](file:///Users/nad/ai4u/ai4UCheE/docs/system-architecture.md)
  - [`docs/codebase-summary.md`](file:///Users/nad/ai4u/ai4UCheE/docs/codebase-summary.md)
  - [`docs/design-guidelines.md`](file:///Users/nad/ai4u/ai4UCheE/docs/design-guidelines.md)
  - [`docs/project-roadmap.md`](file:///Users/nad/ai4u/ai4UCheE/docs/project-roadmap.md)
- **Steps**:
  1. Update [`docs/system-architecture.md`](file:///Users/nad/ai4u/ai4UCheE/docs/system-architecture.md) with the bi-directional `syncWorkbenchPayload` / `dispatchWorkbenchMutation` dataflow and `copilot-scenario-parser.ts` pipeline.
  2. Update [`docs/codebase-summary.md`](file:///Users/nad/ai4u/ai4UCheE/docs/codebase-summary.md) with the new modules (`white-box-equation-card.tsx`, `dippr-phase-envelope-svg.tsx`, `hydraulics-solver-math.ts`, `thermo-solver-math.ts`, `distillation-solver-math.ts`, `mission-scenarios.ts`, `mission-checklist-banner.tsx`, `copilot-scenario-parser.ts`, `calc-sheet-builder.ts` (integrating `generate-calc-sheet.ts`), `phase9-interactive-intelligence.test.tsx`).
  3. Update [`docs/design-guidelines.md`](file:///Users/nad/ai4u/ai4UCheE/docs/design-guidelines.md) and [`docs/project-roadmap.md`](file:///Users/nad/ai4u/ai4UCheE/docs/project-roadmap.md) to mark Phase 9 (Interactive Self-Guided Missions, 3-Stage White-Box Equations & Bi-Directional Copilot) ready/complete upon execution.
- **Success criteria**:
  - All 4 documentation files reflect the new modules and architecture accurately.
- **Verify**:
  ```bash
  grep -q "white-box-equation-card" docs/codebase-summary.md && grep -q "dispatchWorkbenchMutation" docs/system-architecture.md
  ```

---

## Failure Protocol

If any task verification command in Phase 05 fails, produces a TypeScript error, breaks a Vitest test, reports a `render-check.mjs` error/warning, or exceeds the 200-LOC file cap:
1. **STOP** immediately — do not mark the plan complete and do not weaken any test assertion, visual check, or LOC gate.
2. Capture the failing command output, exact file/line reference, and root cause hypothesis.
3. Escalate to the `kongming` advisor subagent (`invoke_subagent` with `TypeName: "kongming"`) with the failure evidence before attempting an architectural workaround.
