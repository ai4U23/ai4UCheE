# Phase 04: Live Multi-Workbench QA/QC Calculation Sheet Builder & Exporter

<!-- Updated: Validation Session 1 (2026-10-30) - builder integrates with existing generateCalcSheetAction flow (generate-calc-sheet.ts); false 2.042e5 test premise removed (phase7 does not assert it); button label corrected (Export Senior Calc Sheet / export-calc-sheet-btn); citations locked to PDF-verified ground truths; phase7 contract testids preserved -->

- **Parent Plan**: [`plan.md`](file:///Users/nad/ai4u/ai4UCheE/plans/261029-2335-chemie-interactive-ux-and-live-copilot/plan.md)
- **Status**: Pending
- **Estimated Effort**: 2.5h
- **Depends On**: [`phase-03-bidirectional-copilot-and-live-solver.md`](file:///Users/nad/ai4u/ai4UCheE/plans/261029-2335-chemie-interactive-ux-and-live-copilot/phase-03-bidirectional-copilot-and-live-solver.md)

## Context & Overview

Currently, clicking **`Export Senior Calc Sheet`** (`data-testid="export-calc-sheet-btn"`, `app-shell.tsx:108`) opens [`src/components/workbenches/calc-sheet-preview-modal.tsx`](file:///Users/nad/ai4u/ai4UCheE/src/components/workbenches/calc-sheet-preview-modal.tsx) (150 LOC), which shows a hardcoded `Re = 2.042 × 10^{5}` (`:62,:137`) regardless of which workbench (`WB1`..`WB4`) is active or what parameters the user has scrubbed. The existing compile flow (`calc-sheet-modal` → `compile-calc-sheet-btn` → `compiled-calc-sheet-output`) routes through [`src/actions/generate-calc-sheet.ts`](file:///Users/nad/ai4u/ai4UCheE/src/actions/generate-calc-sheet.ts) (`generateCalcSheetAction`, 137 LOC) with SQLite persistence and a deterministic sidecar fallback.

**Note (Validation Session 1):** `phase7-e2e.test.tsx` does **not** assert `2.042e5` anywhere — it asserts the modal opens (`calc-sheet-modal`), compiles (`compile-calc-sheet-btn` → `compiled-calc-sheet-output`), and that `calc-sheet-summary` reflects the test's own input (`T-201-DIST`). No forced `2.042e5` baseline row is needed.

This phase replaces the static sheet with a **live multi-workbench QA/QC calculation sheet generator** that **feeds the existing `generateCalcSheetAction` flow** rather than duplicating it:
1. Creates [`src/components/workbenches/calc-sheet-builder.ts`](file:///Users/nad/ai4u/ai4UCheE/src/components/workbenches/calc-sheet-builder.ts) (`buildLiveCalcSheet(state: ClientScreenState)`) that reads the active workbench's live `inputs`, `metrics`, `equations` (3-stage white-box derivations), and safety status from `getClientAppState()`, producing structured preview rows, Markdown export text, and the `inputs_summary`/`equations` payload shape `generateCalcSheetAction` already consumes.
2. Upgrades [`src/components/workbenches/calc-sheet-preview-modal.tsx`](file:///Users/nad/ai4u/ai4UCheE/src/components/workbenches/calc-sheet-preview-modal.tsx) to display the live inputs table, 3-stage KaTeX equations, safety audit badge (`PASS` vs. `ACTION REQUIRED`), and a `"Copy Markdown Report"` action while preserving the full phase7 contract (`export-calc-sheet-btn`, `calc-sheet-modal`, `compile-calc-sheet-btn`, `compiled-calc-sheet-output`, `calc-sheet-summary`, `genui-calc-sheet-card`).

---

## Tasks

### Task 4.1: Create `src/components/workbenches/calc-sheet-builder.ts`

- **Goal**: Build a pure calculation-sheet compiler that converts `ClientScreenState` (`activeWorkbench`, `personaMode`, `payload`) into a complete QA/QC calculation package with live inputs, 3-stage equations, safety diagnostics, and Markdown export text — shaped to feed `generateCalcSheetAction`'s existing `inputs_summary`/`equations` parameters.
- **Target files and symbols**:
  - [`src/components/workbenches/calc-sheet-builder.ts`](file:///Users/nad/ai4u/ai4UCheE/src/components/workbenches/calc-sheet-builder.ts):
    - `CalcSheetRow` interface (`parameter`, `symbol`, `value`, `units`, `basis`)
    - `LiveCalcSheetDocument` interface (`docId`, `workbenchTitle`, `citationHeader`, `safetyStatus`, `rows: CalcSheetRow[]`, `equations: WhiteBoxStageEquation[]`, `markdownReport: string`)
    - `buildLiveCalcSheet(state: ClientScreenState): LiveCalcSheetDocument`
- **Steps**:
  1. Create [`src/components/workbenches/calc-sheet-builder.ts`](file:///Users/nad/ai4u/ai4UCheE/src/components/workbenches/calc-sheet-builder.ts) (~125 LOC).
  2. Map `state.activeWorkbench` (long ids `wb1-visual-verifier`..`wb4-distillation`) and `state.payload`:
     - For `wb1-visual-verifier`, include Chart Section/Page, Student Reading, Perry-Exact Value, Reading Error % with `[Perry's 9th Ed., Fig. 6-9, p. 6-10]`.
     - For `wb2-thermo-dippr`, include Compound, Temperature ($K$ and $^\circ\text{C}$), Saturation Vapor Pressure $P^{\text{sat}}$ ($\text{Pa}$ and $\text{kPa}$), and $\Delta H_{\text{vap}}$ with `[Perry's 9th Ed., Table 2-8, p. 2-53]` (DIPPR Eq. 101) and `[Perry's 9th Ed., Table 2-69, p. 2-120]` (Eq. 106).
     - For `wb3-hydraulics`, include Volumetric Flow Rate ($\text{gpm}$), NPS + Schedule + inner diameter ($\text{in}$), Gauge Suction Pressure ($\text{psig}$), Absolute Suction Pressure ($\text{psia} = \text{psig} + 14.696$), Fanning $f_F$, Darcy $f_D = 4 f_F$, and $\text{NPSH}_A$ vs. $\text{NPSH}_r$ with `[Perry's 9th Ed., Eqs. 6-37..6-39, p. 6-11]` and `[Perry's 9th Ed., Sec. 10, pp. 10-24..25]`.
     - For `wb4-distillation`, include Relative Volatility $\alpha$, Feed/Distillate/Bottoms compositions ($x_F, x_D, x_B$), Reflux multiplier $R/R_{\min}$, Minimum Reflux $R_{\min}$, Theoretical Stages $N$, and Fair Flooding % with `[Perry's 9th Ed., Sec. 13, p. 13-36; Fig. 14-32, p. 14-37]`.
  3. Generate `markdownReport` containing a formatted Markdown table, LaTeX equations, and QA/QC sign-off block; expose `buildCalcSheetActionInput(sheet)` returning the exact `inputs_summary`/`equations` object shape `generateCalcSheetAction`'s schema expects.
- **Success criteria**:
  - `buildLiveCalcSheet(getClientAppState())` returns live scrubbed values for whichever workbench is active, and its output round-trips through the existing compile action without schema errors.
  - File length of [`src/components/workbenches/calc-sheet-builder.ts`](file:///Users/nad/ai4u/ai4UCheE/src/components/workbenches/calc-sheet-builder.ts) is `< 140` LOC.
- **Verify**:
  ```bash
  npm run typecheck && test $(wc -l < src/components/workbenches/calc-sheet-builder.ts) -lt 200
  ```

### Task 4.2: Upgrade `src/components/workbenches/calc-sheet-preview-modal.tsx` to Render Live Sheet & Markdown Copy

- **Goal**: Connect [`src/components/workbenches/calc-sheet-preview-modal.tsx`](file:///Users/nad/ai4u/ai4UCheE/src/components/workbenches/calc-sheet-preview-modal.tsx) to `buildLiveCalcSheet(getClientAppState())` so the modal reflects live scrubbed parameters, 3-stage equations, and a `"Copy Markdown QA/QC"` button (`data-testid="copy-calc-sheet-md"`), keeping the compile flow intact.
- **Target files and symbols**:
  - [`src/components/workbenches/calc-sheet-preview-modal.tsx`](file:///Users/nad/ai4u/ai4UCheE/src/components/workbenches/calc-sheet-preview-modal.tsx) (`CalcSheetPreviewModal`) — 150 LOC baseline
- **Steps**:
  1. Read `getClientAppState()` inside `CalcSheetPreviewModal` when `isOpen` is true and build the sheet via `buildLiveCalcSheet(state)`; the hardcoded `Re = 2.042 × 10^{5}` strings (`:62,:137`) become live values computed from the WB3 payload (falling back to the existing illustrative row only when `payload` is empty).
  2. Render the live parameter table (`sheet.rows`), the live 3-stage equations (`sheet.equations`), and a safety status badge (`PASS` vs. `CAVITATION / FLOODING ALERT`).
  3. Add a `"Copy Markdown QA/QC"` button (`data-testid="copy-calc-sheet-md"`) that copies `sheet.markdownReport` to clipboard (with safe fallback in JSDOM test environments) and shows `"Copied Markdown!"` confirmation state.
  4. Preserve the existing compile flow and testids: `calc-sheet-modal`, `compile-calc-sheet-btn`, `compiled-calc-sheet-output`, `calc-sheet-summary`, and the `genui-calc-sheet-card` GenUI path.
- **Success criteria**:
  - Opening the modal after scrubbing `WB3` flow rate to `420 gpm` renders `420` in the QA/QC table and exports it in Markdown.
  - Existing test `phase7-e2e.test.tsx` (export → modal → compile → summary containing `T-201-DIST`) passes without modification.
  - File length of [`src/components/workbenches/calc-sheet-preview-modal.tsx`](file:///Users/nad/ai4u/ai4UCheE/src/components/workbenches/calc-sheet-preview-modal.tsx) is strictly `< 200` LOC (target ~195).
- **Verify**:
  ```bash
  npm run typecheck && npx vitest run src/__tests__/phase7-e2e.test.tsx && test $(wc -l < src/components/workbenches/calc-sheet-preview-modal.tsx) -lt 200
  ```

---

## Failure Protocol

If any task verification command in Phase 04 fails, produces a TypeScript error, breaks an existing Vitest test, or exceeds the 200-LOC file cap:
1. **STOP** immediately — do not proceed to Phase 05 and do not weaken any test assertion or LOC gate.
2. Capture the failing command output, exact file/line reference, and root cause hypothesis.
3. Escalate to the `kongming` advisor subagent (`invoke_subagent` with `TypeName: "kongming"`) with the failure evidence before attempting an architectural workaround.
