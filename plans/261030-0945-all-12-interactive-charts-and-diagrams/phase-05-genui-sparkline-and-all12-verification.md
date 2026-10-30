# Phase 05: Copilot Inline GenUI Sparkline Scrubber (Chart 12), Full 12-Chart Test Suite, Visual Audit & Docs Sync

- **Parent Plan**: [`plan.md`](file:///Users/nad/ai4u/ai4UCheE/plans/261030-0945-all-12-interactive-charts-and-diagrams/plan.md)
- **Status**: Completed
- **Estimated Effort**: 2.5h
- **Depends On**: [`phase-04-wb4-mccabe-thiele-5handles-and-column-flooding.md`](file:///Users/nad/ai4u/ai4UCheE/plans/261030-0945-all-12-interactive-charts-and-diagrams/phase-04-wb4-mccabe-thiele-5handles-and-column-flooding.md)

## Context & Overview

This final phase completes **Chart 12** by embedding an interactive SVG Operating-Window Sparkline Scrubber (`data-testid="genui-interactive-sparkline"` / `data-testid="genui-sparkline-handle"`) inside [`src/components/gen-ui/render-inline-extension.tsx`](file:///Users/nad/ai4u/ai4UCheE/src/components/gen-ui/render-inline-extension.tsx) so users can scrub the active workbench's primary parameter (`tempK`, `flowGpm`, `rMult`, or `userReading`) directly from inside a Copilot GenUI card. It then locks in all 12 interactive charts with a dedicated end-to-end Vitest suite (`src/__tests__/phase10-all12-interactive-charts.test.tsx`), runs the headless Chromium `render-check.mjs` layout/contrast audit (`0 errors, 0 warnings`), verifies the `< 200` LOC invariant across all repository files, and updates `./docs/`.

---

## Tasks

### Task 5.1: Upgrade `src/components/gen-ui/render-inline-extension.tsx` with Interactive Sparkline Scrubber (Chart 12)

- **Goal**: Embed an interactive SVG operating-window sparkline and draggable handle (`data-testid="genui-interactive-sparkline"`, `data-testid="genui-sparkline-handle"`) inside `<RenderInlineExtension />` that dispatches `dispatchWorkbenchMutation` in real time.
- **Target files and symbols**:
  - [`src/components/gen-ui/render-inline-extension.tsx`](file:///Users/nad/ai4u/ai4UCheE/src/components/gen-ui/render-inline-extension.tsx) (`RenderInlineExtension`)
- **Steps**:
  1. Import `dispatchWorkbenchMutation` and `getClientAppState` from `../../actions/view-screen` and `clientPointToViewBox` from `../../lib/svg-drag-math`.
  2. Render an interactive SVG sparkline bar (`viewBox="0 0 320 44"`, `data-testid="genui-interactive-sparkline"`) with safe-operating-window shading, curve locus, and a draggable thumb (`data-testid="genui-sparkline-handle"`).
  3. On pointer click or drag along `genui-interactive-sparkline`, map normalized `u ∈ [0, 1]` to the active workbench's primary control:
     - `wb1-visual-verifier`: `userReading` $\in [0.002, 0.025]$
     - `wb2-thermo-dippr`: `tempK` $\in [280, 500]\text{ K}$
     - `wb3-hydraulics`: `flowGpm` $\in [50, 500]\text{ gpm}$
     - `wb4-distillation`: `rMult` $\in [1.1, 3.5]$
     and call `dispatchWorkbenchMutation({ targetWorkbench: activeWorkbench, params, reason: 'Scrubbed inline GenUI sparkline' })`.
- **Success criteria**:
  - Clicking or dragging `data-testid="genui-interactive-sparkline"` dispatches `dispatchWorkbenchMutation` and updates the active workbench parameter live.
  - File length of [`render-inline-extension.tsx`](file:///Users/nad/ai4u/ai4UCheE/src/components/gen-ui/render-inline-extension.tsx) is `< 160` LOC.
- **Verify**:
  ```bash
  npm run typecheck && test $(wc -l < src/components/gen-ui/render-inline-extension.tsx) -lt 200
  ```

### Task 5.2: Create `src/__tests__/phase10-all12-interactive-charts.test.tsx` Verifying All 12 Interactive Charts

- **Goal**: Write an automated Vitest + React Testing Library suite exercising pointer click/drag and landmark interactions across all 12 charts and diagrams.
- **Target files and symbols**:
  - `src/__tests__/phase10-all12-interactive-charts.test.tsx`
- **Steps**:
  1. Create `src/__tests__/phase10-all12-interactive-charts.test.tsx` (~180 LOC) with tests covering:
     - **Charts 1–4 (`WB1`)**: Scrubs `perry-svg-interactive-surface` / `calibrated-crosshair` across all 4 presets (`6-10`, `14-37`, `14-57`, `2-53`) and asserts `wb1-hover-readout` and `userReading` update (including explicit $f_D = 4f_F$ on `6-10`).
     - **Charts 5 & 6 (`WB2`)**: Dragging `wb2-operating-handle`, clicking `wb2-nbp-marker` ($1\text{ atm}$ snap), clicking `wb2-critical-marker`, clicking `carlson-node-polarity` / `carlson-node-lle` / `carlson-node-assoc`, and scrubbing `carlson-boiling-curve`.
     - **Charts 7 & 8 (`WB3`)**: Dragging `wb3-liquid-level-handle` (`zSuctionM`), clicking `wb3-pipe-nps-trigger` (`npsInch`), dragging `wb3-valve-dp-handle` (`valveDpPsi`), and dragging `wb3-duty-point-handle` (`flowGpm`) on `wb3-pump-system-curve-svg`.
     - **Charts 9, 10 & 11 (`WB4`)**: Dragging `q-line-handle`, `mt-xd-handle`, `mt-zf-handle`, `mt-xb-handle`, `mt-rol-handle`, dragging `wb4-col-diam-handle`, clicking `wb4-tray-spacing-trigger`, clicking `wb4-tray-hit-1`, and dragging `wb4-flood-bar-handle`.
     - **Chart 12 (`Copilot GenUI`)**: Scrubbing `genui-interactive-sparkline` inside `<RenderInlineExtension />` and asserting `dispatchWorkbenchMutation` updates the workbench state.
- **Success criteria**:
  - All existing test suites (`phase3`, `phase7`, `phase8`, `phase9`) plus `phase10-all12-interactive-charts.test.tsx` pass 100%.
- **Verify**:
  ```bash
  npx vitest run && test $(wc -l < src/__tests__/phase10-all12-interactive-charts.test.tsx) -lt 200
  ```

### Task 5.3: Run `< 200` LOC Gate, `render-check.mjs` Visual Audit & Synchronize `./docs/`

- **Goal**: Verify zero files exceed 200 LOC, confirm `0 errors, 0 warnings` in headless Chromium across mobile/tablet/desktop viewports, and update `./docs/` (`AGENTS.md` Invariant #6).
- **Target files and symbols**:
  - [`docs/system-architecture.md`](file:///Users/nad/ai4u/ai4UCheE/docs/system-architecture.md)
  - [`docs/codebase-summary.md`](file:///Users/nad/ai4u/ai4UCheE/docs/codebase-summary.md)
  - [`docs/design-guidelines.md`](file:///Users/nad/ai4u/ai4UCheE/docs/design-guidelines.md)
  - [`docs/project-roadmap.md`](file:///Users/nad/ai4u/ai4UCheE/docs/project-roadmap.md)
- **Steps**:
  1. Run the `< 200` LOC audit across all files in `src/` and `services/perry-engine/`.
  2. Run `npm run typecheck && npx vitest run && npm run build`.
  3. Update `docs/system-architecture.md`, `docs/codebase-summary.md`, `docs/design-guidelines.md`, and `docs/project-roadmap.md` to document all 12 bi-directionally interactive charts and their helper modules (`svg-drag-math.ts`, `perry-figure-curve-sampler.ts`, `hydraulics-curve-svg-math.ts`, `pump-system-curve-svg.tsx`, `mccabe-thiele-svg-handles.ts`, `mccabe-thiele-handles-overlay.tsx`, `column-flooding-inverse-math.ts`).
- **Success criteria**:
  - Every source file in `src/` and `services/perry-engine/` is `< 200` LOC.
  - All Vitest tests and production build pass with 0 errors.
- **Verify**:
  ```bash
  npm run typecheck && npx vitest run && npm run build && for f in $(find src services/perry-engine -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.css" -o -name "*.py" \)); do lines=$(wc -l < "$f"); if [ "$lines" -ge 200 ]; then echo "LOC VIOLATION: $f ($lines)"; exit 1; fi; done
  ```

---

## Failure Protocol

If any task verification command in Phase 05 fails, produces a TypeScript error, breaks a Vitest test, or exceeds the 200-LOC file cap:
1. **STOP** immediately — do not mark the plan complete and do not weaken any test assertion or LOC gate.
2. Capture the failing command output, exact file/line reference, and root cause hypothesis.
3. Escalate to the `kongming` advisor subagent (`invoke_subagent` with `TypeName: "kongming"`) with the failure evidence before attempting an architectural workaround.
