---
title: "Phase 01 — Sovereign CSS Design System, Tactile Controls, Modal Backdrop & Real KaTeX Math"
description: "Split CSS below 200 LOC, style all 18+ missing component classes, extract WB1/WB2 subcomponents for LOC safety, wrap CalcSheetPreviewModal in a fixed backdrop, and render equations with KaTeX."
status: completed
priority: P1
effort: 2.5h
branch: main
tags: [css, katex, modularization, modal, phase-01]
created: 2026-10-28
---

# Phase 01 — Sovereign CSS Design System, Tactile Controls, Modal Backdrop & Real KaTeX Math

- **Parent Plan:** [`plan.md`](./plan.md)
- **Phase Status:** Pending
- **Effort:** 2.5h
- **Depends On:** None
<!-- Updated: Validation Session 1 - Task 1.1 cascade pin (.shell-workspace after .wb-split) + ordering check in Verify -->

## Goal

Eliminate every unstyled component, nested `.wb-split` layout collision, raw ASCII math string, and near-200-LOC file hazard by:
1. Splitting the CSS into `src/styles/theme-tokens.css` (~140 LOC) and `src/styles/workbench-components.css` (~165 LOC) with full styling for tactile scrubbable sliders, motion pills, chips, chat bubbles, verdicts, and a fixed `.modal-backdrop`.
2. Creating a reusable `<KaTeXBlock />` component (`src/components/ui/katex-block.tsx`) backed by `katex.renderToString`.
3. Extracting `<VisualVerifierTutorCard />` from WB1 (`visual-verifier-workbench.tsx`, currently 182 LOC) and `<CarlsonAdvisorCard />` from WB2 (`thermo-dippr-workbench.tsx`, currently 189 LOC) so both workbenches drop well below 150 LOC while rendering real KaTeX equations.
4. Wrapping `<CalcSheetPreviewModal />` in a fixed `.modal-backdrop` overlay.

## Files to Create or Modify

| File Path | Action | Current LOC | Target LOC | Purpose |
| :--- | :--- | :---: | :---: | :--- |
| `src/styles/workbench-components.css` | Create | 0 | ~165 | Tactile `.scrubbable-*`, `.motion-pill`, `.composer-chip`, `.chip-tray`, `.genui-*`, `.chat-*`, `.wb-verdict`, `.wb-coaching`, `.mission-*`, `.learn-callout`, `.modal-backdrop`, `.katex-block` |
| `src/styles/theme-tokens.css` | Modify | 181 | ~140 | Core palette tokens (`paper` `#fbf6ec` / `blueprint` `#071a33`), typography, `.app-shell`, `.shell-header`, `.shell-workspace`, `@import './workbench-components.css'` |
| `src/components/ui/katex-block.tsx` | Create | 0 | ~55 | Safe `katex.renderToString` wrapper (`throwOnError: false`) for inline & display equations |
| `src/components/workbenches/visual-verifier-tutor-card.tsx` | Create | 0 | ~95 | Extracted right-hand DeepTutor chart-reading challenge & Fanning 4× trap coaching card from WB1 |
| `src/components/workbenches/visual-verifier-workbench.tsx` | Modify | 182 | ~125 | WB1 25-Section visual crop canvas + preset anchors + `<VisualVerifierTutorCard />` |
| `src/components/workbenches/carlson-advisor-card.tsx` | Create | 0 | ~85 | Extracted Carlson (1996) / Perry Sec 4 decision tree from WB2 |
| `src/components/workbenches/thermo-dippr-workbench.tsx` | Modify | 189 | ~140 | WB2 DIPPR Eq. 101 & 106 with `<KaTeXBlock />` and `<CarlsonAdvisorCard />` |
| `src/components/workbenches/calc-sheet-preview-modal.tsx` | Modify | 128 | ~142 | Wrapped in `.modal-backdrop` overlay with Escape-key & backdrop-click close + `<KaTeXBlock />` |

---

## Tasks & Steps (`--advice` Handover Contract)

### Task 1.1 — Create `src/styles/workbench-components.css` and modularize `src/styles/theme-tokens.css`
- **Goal:** Provide complete sovereign styling for all 18+ missing component classes and separate `.shell-workspace` (outer `AppShell` grid) from `.wb-split` (inner workbench 2-column grid) while keeping both CSS files strictly `< 200` LOC.
- **Target files and symbols:**
  - `src/styles/workbench-components.css` (new stylesheet imported by `src/styles/theme-tokens.css`)
  - `src/styles/theme-tokens.css` (root tokens, `.app-shell`, `.shell-header`, `.shell-workspace`, `.wb-split`)
- **Steps:**
  1. Create `src/styles/workbench-components.css` (keep under 175 LOC) containing rules for:
     - `.scrubbable-input` (`background: var(--bg-elevated); border: 1px solid var(--border-grid); border-radius: 8px; padding: 0.55rem 0.75rem; margin-bottom: 0.55rem; transition: border-color 150ms ease, box-shadow 150ms ease;`), `.scrubbable-input[data-agent-selected="true"]` (`border-color: var(--maize); box-shadow: 0 0 0 2px rgba(232, 197, 71, 0.25);`), `.scrubbable-header` (`display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem; font-size: 0.84rem; font-weight: 600;`), `.scrubbable-handle` (`cursor: ew-resize; user-select: none; padding: 0.1rem 0.4rem; border-radius: 4px; background: rgba(232, 197, 71, 0.14);`), `.scrubbable-chip-btn` (`font-size: 0.72rem; padding: 0.15rem 0.5rem; border-radius: 999px;`), `.scrubbable-row` (`display: flex; align-items: center; gap: 0.5rem;`), `.scrubbable-row input` (`flex: 1; font-family: var(--font-mono); font-weight: 600;`), and `.scrubbable-unit` (`font-size: 0.78rem; color: var(--ink-muted); min-width: 3rem; text-align: right;`).
     - `.persona-btn`, `.wb-tab` (`position: relative; overflow: hidden; display: inline-flex; align-items: center; gap: 0.4rem;`) and `.motion-pill` (`position: absolute; inset: 0; border-radius: inherit; background: rgba(232, 197, 71, 0.22); z-index: 0; pointer-events: none;`) with `.persona-btn > span:not(.motion-pill), .wb-tab > span:not(.motion-pill), .wb-tab > small { position: relative; z-index: 1; }`.
     - `.wb-tab-title`, `.wb-tab-sub`, `.mission-bar`, `.mission-pill`, `.learn-callout`.
     - `.chat-drawer` (`display: flex; flex-direction: column; gap: 0.7rem; max-height: calc(100vh - 8.5rem); position: sticky; top: 1rem;`), `.chip-tray`, `.composer-chip`, `.starter-prompts`, `.starter-pill`, `.genui-stream`, `.genui-card`, `.chat-messages` (`flex: 1; overflow-y: auto`), `.chat-msg`, `.chat-user`, `.chat-agent`.
     - `.wb-verdict`, `.wb-verdict.pass`, `.wb-verdict.fail`, `.wb-coaching`, `.wb-chip`, `.wb-crop-placeholder`, `.wb-crop-img`, `.katex-block`.
     - `.modal-backdrop` (`position: fixed; inset: 0; z-index: 100; background: rgb(7 26 51 / 0.68); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; padding: 1.5rem;`) and `.modal-dialog` (`max-width: 880px; width: 100%; max-height: 90vh; overflow-y: auto;`).
  2. In `src/styles/theme-tokens.css`, add `@import './workbench-components.css';` right after `@import 'katex/dist/katex.min.css';`.
  3. In `src/styles/theme-tokens.css`, add `.shell-workspace { display: grid; grid-template-columns: minmax(0, 1.68fr) minmax(340px, 0.92fr); gap: 1.1rem; align-items: start; }` and responsive `@media (max-width: 1080px)` rules so `.shell-workspace` and `.wb-split` stack cleanly on smaller viewports. Keep `src/styles/theme-tokens.css` under 155 LOC.
  4. **CASCADE PIN (Validation Session 1):** the `.shell-workspace` rule MUST be written AFTER the existing `.wb-split` rule (currently `theme-tokens.css:129`). Both selectors are single-class (equal specificity), so source order decides `grid-template-columns` on the outer `<main className="shell-workspace wb-split">` — writing `.shell-workspace` first would silently keep the cramped `1.4fr 1fr` outer layout.
- **Success criteria:** Both `src/styles/theme-tokens.css` and `src/styles/workbench-components.css` exist, are `< 200` lines each, define `.scrubbable-input`, `.motion-pill`, `.composer-chip`, `.modal-backdrop`, and `.shell-workspace`, and the `.shell-workspace` rule appears after `.wb-split` in source order.
- **Verify:** `node -e "const fs=require('fs'); const a=fs.readFileSync('src/styles/theme-tokens.css','utf8'); const b=fs.readFileSync('src/styles/workbench-components.css','utf8'); if(a.split('\n').length>=200 || b.split('\n').length>=200) process.exit(1); if(!a.includes('workbench-components.css') || !b.includes('.scrubbable-input') || !b.includes('.modal-backdrop')) process.exit(1); if(!(a.indexOf('.shell-workspace') > a.indexOf('.wb-split'))) process.exit(1); console.log('CSS_SPLIT_OK');"` exits 0 and prints `CSS_SPLIT_OK`.

### Task 1.2 — Create `<KaTeXBlock />` component (`src/components/ui/katex-block.tsx`)
- **Goal:** Render LaTeX formulas into real typeset HTML using `katex.renderToString` with graceful fallback and accessible `aria-label`.
- **Target files and symbols:**
  - `src/components/ui/katex-block.tsx` (`KaTeXBlock`, `KaTeXBlockProps`)
- **Steps:**
  1. Create `src/components/ui/katex-block.tsx` exporting `KaTeXBlockProps` (`latex: string`, `displayMode?: boolean`, `className?: string`, `testId?: string`, `ariaLabel?: string`) and `KaTeXBlock`.
  2. Call `katex.renderToString(latex, { displayMode, throwOnError: false, output: 'htmlAndMathml' })` inside `useMemo` (wrapped in `try/catch`).
  3. Render `<div className={`katex-block ${className ?? ''}`.trim()} data-testid={testId ?? 'katex-rendered'} aria-label={ariaLabel ?? latex} dangerouslySetInnerHTML={{ __html: html }} />` (or `<span>` when `displayMode === false`).
- **Success criteria:** `src/components/ui/katex-block.tsx` compiles cleanly, is under 65 LOC, and outputs `.katex` DOM markup.
- **Verify:** `npm run typecheck && awk 'END { exit (NR > 0 && NR < 70) ? 0 : 1 }' src/components/ui/katex-block.tsx` exits 0.

### Task 1.3 — Extract `VisualVerifierTutorCard` and `CarlsonAdvisorCard` & wire `<KaTeXBlock />` into WB2
- **Goal:** Bring `visual-verifier-workbench.tsx` (currently 182 LOC) and `thermo-dippr-workbench.tsx` (currently 189 LOC) down below 145 LOC each while adding real KaTeX equations to WB2 and preserving all existing `data-testid` and `aria-label` contracts.
- **Target files and symbols:**
  - `src/components/workbenches/visual-verifier-tutor-card.tsx` (`VisualVerifierTutorCard`)
  - `src/components/workbenches/visual-verifier-workbench.tsx` (`VisualVerifierWorkbench`)
  - `src/components/workbenches/carlson-advisor-card.tsx` (`CarlsonAdvisorCard`)
  - `src/components/workbenches/thermo-dippr-workbench.tsx` (`ThermoDipprWorkbench`)
- **Steps:**
  1. Create `src/components/workbenches/visual-verifier-tutor-card.tsx` containing the `<aside className="wb-tutor-card">` section from `visual-verifier-workbench.tsx` (preserving `aria-label="Chart reading value"`, `Verify & Reveal Crosshair`, `data-testid="load-pdf-crop-btn"`, `data-testid="chart-verdict"`, and `data-testid="fanning-4x-coaching"`).
  2. Update `src/components/workbenches/visual-verifier-workbench.tsx` to render `<VisualVerifierTutorCard ... />`, reducing its line count to ~120 LOC.
  3. Create `src/components/workbenches/carlson-advisor-card.tsx` containing the `<aside className="wb-tutor-card" data-testid="carlson-advisor-panel">` section from `thermo-dippr-workbench.tsx` (preserving `aria-label="Mixture polarity"`, `data-testid="carlson-recommended"`, and `data-testid="carlson-lle-warning"`).
  4. Update `src/components/workbenches/thermo-dippr-workbench.tsx` to use `<KaTeXBlock latex="P_{\\mathrm{vp}} = \\exp\\!\\left(C_1 + \\frac{C_2}{T} + C_3 \\ln T + C_4 T^{C_5}\\right)" testId="katex-dippr-101" />` inside the Eq. 101 panel and `<KaTeXBlock latex="\\Delta H_{\\mathrm{vap}} = C_1 (1 - T_r)^{C_2 + C_3 T_r + C_4 T_r^2 + C_5 T_r^3}" testId="katex-dippr-106" />` inside the Eq. 106 panel, while keeping `data-testid="dippr-vp-result"` text format (`Result at T = {tKelvin.toFixed(2)} K: <strong>{vpPa.toLocaleString()} Pa</strong> ({vpDisplay}) · <code>[Perry's 9th Ed., Table 2-8 (DIPPR Eq. 101), p. 2-53]</code>`) 100% unchanged. Render `<CarlsonAdvisorCard ... />`.
- **Success criteria:** Both WB1 and WB2 are `< 155` LOC, render KaTeX math in WB2, and pass all WB1/WB2 tests in `phase7-e2e.test.tsx`.
- **Verify:** `awk 'END { exit (NR < 160) ? 0 : 1 }' src/components/workbenches/visual-verifier-workbench.tsx && awk 'END { exit (NR < 160) ? 0 : 1 }' src/components/workbenches/thermo-dippr-workbench.tsx && npx vitest run src/__tests__/phase7-e2e.test.tsx` exits 0 and prints `5 passed`.

### Task 1.4 — Upgrade `CalcSheetPreviewModal` with `.modal-backdrop` overlay and KaTeX preview
- **Goal:** Render `CalcSheetPreviewModal` inside a fixed backdrop overlay (`.modal-backdrop`) with click-outside / Escape dismissal and KaTeX equation preview while preserving `data-testid="calc-sheet-modal"`.
- **Target files and symbols:**
  - `src/components/workbenches/calc-sheet-preview-modal.tsx` (`CalcSheetPreviewModal`)
- **Steps:**
  1. Wrap the modal `<div className="wb-panel modal-dialog" role="dialog" aria-modal="true" aria-label="Senior-Engineer QA/QC Calculation Sheet Modal" data-testid="calc-sheet-modal" onClick={(e) => e.stopPropagation()}>` inside `<div className="modal-backdrop" data-testid="calc-sheet-backdrop" onClick={onClose}>`.
  2. Render `<KaTeXBlock latex="Re = \\frac{\\rho \\cdot v \\cdot D}{\\mu} = 2.042 \\times 10^{5}" testId="katex-calc-sheet" />` inside `compiled-calc-sheet-output` alongside `data-testid="calc-sheet-summary"` and `data-testid="calc-sheet-markdown"`. Keep file `< 155` LOC.
- **Success criteria:** `CalcSheetPreviewModal` renders inside `.modal-backdrop`, stays `< 160` LOC, and passes `phase3-shell.test.tsx` and `phase7-e2e.test.tsx`.
- **Verify:** `npx vitest run src/__tests__/phase3-shell.test.tsx src/__tests__/phase7-e2e.test.tsx` exits 0 and prints `9 passed`.

---

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
