---
title: "Phase 7: Senior-Engineer Calculation Sheet Exporter, Inline Generative UI Cards & End-to-End Verification"
status: completed
---

# Phase 7: Senior-Engineer Calculation Sheet Exporter, Inline Generative UI Cards & End-to-End Verification

## Overview

Build the formal EPC Senior-Engineer Calculation Sheet Exporter (`HTML / Print-to-PDF` with `@media print` A4/Letter engineering borders and `Markdown / LaTeX` source) containing a QA/QC Document Control Header (`Project`, `Equipment Tag`, `Service`, `Calc No.`, `Rev`, `Prepared By`, `Checked By`, `Date`, `Design Basis`), the 3-stage `handcalcs` equation audit trail, the 3-Case (`70%/100%/120%`) operating summary table, and embedded *Perry's 9th Ed.* visual proof crops, plus wire `render-inline-extension` (`agentNative.ui.output()`) and execute the full E2E verification suite and `< 200` LOC modularity gate.

## Requirements

- [x] Senior-Engineer Calculation Sheet compiler (`solvers/calc_sheet_exporter.py` & `routers/export_router.py`) producing both print-ready EPC HTML (`@media print`) and Markdown/LaTeX notes + `tests/test_phase7_export.py`.
- [x] Inline Generative UI extension renderer (`src/components/gen-ui/render-inline-extension.tsx`), `CalcSheetPreviewModal` (`src/components/workbenches/calc-sheet-preview-modal.tsx`), and `generateCalcSheetAction` (`src/actions/generate-calc-sheet.ts`).
- [x] Full application assembly (`src/App.tsx`, `src/main.tsx`), End-to-End integration test suite (`src/__tests__/phase7-e2e.test.tsx`), and mechanical `< 200` line verification across all `.py`, `.ts`, and `.tsx` source files.

## Implementation Steps

### Task 7.1 — Implement Senior-Engineer Calculation Sheet Compiler (`solvers/calc_sheet_exporter.py` & `routers/export_router.py`)
- **Goal**: Build `services/perry-engine/solvers/calc_sheet_exporter.py` and `services/perry-engine/routers/export_router.py` (`< 200` lines each) compiling any workbench calculation into both a standalone print-ready EPC HTML Calculation Sheet and a Markdown/LaTeX audit file.
- **Target files and symbols**:
  - `/Users/nad/ai4u/ai4UCheE/services/perry-engine/solvers/calc_sheet_exporter.py` (`build_senior_calc_sheet()`, `CalcSheetMetadata`)
  - `/Users/nad/ai4u/ai4UCheE/services/perry-engine/routers/export_router.py` (`router`)
  - `/Users/nad/ai4u/ai4UCheE/services/perry-engine/tests/test_phase7_export.py`
- **Steps**:
  1. Define `CalcSheetMetadata` in `solvers/calc_sheet_exporter.py`: `project_name`, `project_no`, `equipment_tag` (e.g., `"P-101A/B"`, `"T-201"`), `service_description`, `calc_no`, `revision` (`"Rev 0 — Issued for Review"`), `prepared_by`, `checked_by`, `date_iso`, `design_basis_notes`.
  2. Implement `build_senior_calc_sheet(metadata: CalcSheetMetadata, workbench_type: str, inputs_summary: dict, equations: list[dict], cases_table: dict | None, proof_crops: list[dict]) -> dict` returning:
     - `html_document`: Self-contained EPC Calculation Pad HTML with `@media print` page-break rules, ruled engineering header block (`Project / Tag / Rev / Prepared / Checked / Date`), design basis assumptions, rendered 3-stage equations (`Symbolic -> Substituted w/ Units -> Result + [Perry's 9th Ed. Citation]`), 3-Case (`Min 70% / Normal 100% / Rated 120%`) table, and embedded base64 *Perry's* figure proof crops with SVG crosshairs.
     - `markdown_latex`: Clean Markdown + `$$\begin{aligned}...\end{aligned}$$` LaTeX block for engineering repository archival.
  3. Expose `POST /api/v1/export/calc-sheet` in `routers/export_router.py`, mount in `main.py`, and write `tests/test_phase7_export.py`.
- **Success criteria**: `pytest tests/test_phase7_export.py` passes and verifies the generated HTML contains the QA/QC Document Control Header, all 3 equation stages, Perry's citations, and `@media print` styling.
- **Verify**: `cd /Users/nad/ai4u/ai4UCheE/services/perry-engine && .venv/bin/pytest tests/test_phase7_export.py -v` exits `0` and prints `passed`.

### Task 7.2 — Implement Inline Generative UI (`render-inline-extension.tsx`), Calc Sheet Modal & Export Action
- **Goal**: Build `src/actions/generate-calc-sheet.ts`, `src/components/gen-ui/render-inline-extension.tsx`, and `src/components/workbenches/calc-sheet-preview-modal.tsx` (`< 200` lines each), wiring `agentNative.ui.output(value)` so agent tool calls render interactive mini-cards directly inside the chat stream.
- **Target files and symbols**:
  - `/Users/nad/ai4u/ai4UCheE/src/actions/generate-calc-sheet.ts` (`generateCalcSheetAction`)
  - `/Users/nad/ai4u/ai4UCheE/src/components/gen-ui/render-inline-extension.tsx` (`RenderInlineExtension`)
  - `/Users/nad/ai4u/ai4UCheE/src/components/workbenches/calc-sheet-preview-modal.tsx` (`CalcSheetPreviewModal`)
- **Steps**:
  1. Write `src/actions/generate-calc-sheet.ts` calling `POST /api/v1/export/calc-sheet`, persisting the calculation record into SQLite `saved_calculations`, and calling `agentNative.ui.output({ type: 'calc-sheet-card', ... })`.
  2. Write `src/components/gen-ui/render-inline-extension.tsx` (`< 200` lines) handling inline generative UI payloads emitted via `agentNative.ui.output()`:
     - `type: 'equation-proof-card'` (renders 3-stage KaTeX + Perry's crop thumbnail inline in chat).
     - `type: 'hydraulics-summary-card'` (renders 3-Case `70%/100%/120%` badge + $\text{NPSH}_A$ status inline in chat).
     - `type: 'calc-sheet-card'` (renders QA/QC header preview + **"Open Print-to-PDF Sheet"** & **"Copy Markdown/LaTeX"** buttons).
  3. Write `src/components/workbenches/calc-sheet-preview-modal.tsx` (`< 200` lines) rendering the full Senior-Engineer Calculation Sheet with editable QA/QC header fields (`Equipment Tag`, `Rev`, `Prepared By`, `Checked By`), one-click `window.print()` (`Print-to-PDF`), `.html` download, and `.md` download.
- **Success criteria**: `tsc --noEmit` passes and all Phase 7 frontend files are `< 200` lines.
- **Verify**: `cd /Users/nad/ai4u/ai4UCheE && npx tsc --noEmit && awk 'END{if (NR>=200) exit 1}' src/components/gen-ui/render-inline-extension.tsx && awk 'END{if (NR>=200) exit 1}' src/components/workbenches/calc-sheet-preview-modal.tsx && echo "GENUI_EXPORT_OK"` exits `0` and prints `GENUI_EXPORT_OK`.

### Task 7.3 — Full End-to-End Integration Suite & `< 200` Line Modularity Gate
- **Goal**: Write and execute `src/__tests__/phase7-e2e.test.tsx` verifying all 4 Workbenches, `<current-screen>` sync, `useAgentSelectable` chips, `agentNative.ui.output()` inline GenUI cards, Calc Sheet export, and enforce the `< 200` line modularity invariant across all source files.
- **Target files and symbols**:
  - `/Users/nad/ai4u/ai4UCheE/src/__tests__/phase7-e2e.test.tsx`
  - `/Users/nad/ai4u/ai4UCheE/src/App.tsx`
  - `/Users/nad/ai4u/ai4UCheE/src/main.tsx`
- **Steps**:
  1. Write `src/App.tsx` and `src/main.tsx` (`< 200` lines each) assembling `PersonaThemeProvider`, `AppShell`, all 4 Workbenches (`VisualVerifierWorkbench`, `ThermoDipprWorkbench`, `HydraulicsWorkbench`, `DistillationWorkbench`), `AgentChatDrawer`, and `CalcSheetPreviewModal`.
  2. Write `src/__tests__/phase7-e2e.test.tsx` (`< 200` lines) testing:
     - Switching between `WB1`, `WB2`, `WB3`, and `WB4` updates `<current-screen>` via `writeClientAppState`.
     - Clicking a selectable equation or equipment node attaches `agent-select:<kind>:<id>` to the chat composer.
     - Calling `agentNative.ui.output({ type: 'calc-sheet-card', ... })` mounts the inline generative UI card inside `AgentChatDrawer`.
     - Generating a Senior-Engineer Calculation Sheet populates the QA/QC Document Control Header and saves to SQLite `saved_calculations`.
  3. Run the complete Python `pytest` suite (`test_phase1` through `test_phase7`), the complete Frontend `vitest` suite, production `vite build`, and a line-count audit confirming no `.ts`, `.tsx`, or `.py` file exceeds 200 lines.
- **Success criteria**: All Python tests pass, all Vitest tests pass, `vite build` succeeds, and 0 code files exceed 200 lines.
- **Verify**: `cd /Users/nad/ai4u/ai4UCheE && services/perry-engine/.venv/bin/pytest services/perry-engine/tests -v && npx vitest run && npx vite build && python3 -c "import pathlib, sys; bad=[ (str(p), len(p.read_text().splitlines())) for p in list(pathlib.Path('src').rglob('*.ts*')) + list(pathlib.Path('services/perry-engine').rglob('*.py')) if '.venv' not in str(p) and len(p.read_text().splitlines()) >= 200 ]; assert not bad, f'Files >= 200 lines: {bad}'; print('ALL_PHASES_AND_LINE_LIMITS_OK')"` exits `0` and prints `ALL_PHASES_AND_LINE_LIMITS_OK`.

## Todo

- [x] Task 7.1: Implement Senior-Engineer Calculation Sheet Compiler (`solvers/calc_sheet_exporter.py`, 160 LOC & `routers/export_router.py`, 34 LOC) — 2/2 pytest passed
- [x] Task 7.2: Implement Inline Generative UI (`render-inline-extension.tsx`, 73 LOC), Calc Sheet Modal (`calc-sheet-preview-modal.tsx`, 127 LOC) & Export Action (`generate-calc-sheet.ts`, 132 LOC) — `GENUI_EXPORT_OK`
- [x] Task 7.3: Full End-to-End Integration Suite (`phase7-e2e.test.tsx`, 122 LOC, `App.tsx`, 67 LOC, `main.tsx`, 14 LOC) & `< 200` Line Modularity Gate — 40/40 pytest + 8/8 vitest + `vite build` + `ALL_PHASES_AND_LINE_LIMITS_OK`

## Success Criteria

- `pytest tests/test_phase7_export.py -v` passes all HTML and Markdown/LaTeX calc-sheet export assertions (`passed`).
- Full E2E test suite (`pytest` + `vitest` + `vite build`) and `< 200` LOC modularity check exit `0` and print `ALL_PHASES_AND_LINE_LIMITS_OK`.

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
