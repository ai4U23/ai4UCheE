---
title: "Phase 02 — Student Guided Mission Bar, Approachable Workbench Tabs & Learn-Mode Plain-English Callouts"
description: "Add a 4-mission GuidedMissionBar with instant GenUI proof card reward, plain-English LearnModeCallout banners across WB1-WB4, and approachable workbench tab subtitles."
status: done
priority: P1
effort: 2.0h
branch: main
tags: [student-ux, guided-missions, learn-mode, onboarding, phase-02]
created: 2026-10-28
---

# Phase 02 — Student Guided Mission Bar, Approachable Workbench Tabs & Learn-Mode Plain-English Callouts

- **Parent Plan:** [`plan.md`](./plan.md)
- **Phase Status:** Pending
- **Effort:** 2.0h
- **Depends On:** [`phase-01-sovereign-css-and-katex-math.md`](./phase-01-sovereign-css-and-katex-math.md)

## Goal

Make `Chemie.ai4U.now` immediately intuitive and welcoming for students and beginners by:
1. Creating `<LearnModeCallout />` (`src/components/ui/learn-mode-callout.tsx`) so switching to `🎓 Learn Mode` reveals plain-English "Why this matters / Common student trap" explanations across WB1–WB4.
2. Creating a 1-click `<GuidedMissionBar />` (`src/components/shell/guided-mission-bar.tsx`) with 4 curated chemical engineering starter missions (plus a collapse/expand toggle) that switch workbenches, enable `🎓 Learn Mode`, attach a relevant Point-and-Ask chip, and emit an immediate starter `equation-proof-card` into the Co-Pilot drawer.
3. Updating `AppShell` (`src/components/shell/app-shell.tsx`) to use `<main className="shell-workspace wb-split">`, friendly two-line workbench tab labels (student-friendly title + Perry section subtitle), and a clear tooltip on the `DoF = 0 · Fully Specified` badge.

## Files to Create or Modify

| File Path | Action | Current LOC | Target LOC | Purpose |
| :--- | :--- | :---: | :---: | :--- |
| `src/components/ui/learn-mode-callout.tsx` | Create | 0 | ~65 | Plain-English student intuition card visible when `personaMode === 'learn'` |
| `src/components/shell/guided-mission-bar.tsx` | Create | 0 | ~118 | 4 1-click student missions + collapse toggle + instant GenUI proof card emission |
| `src/components/shell/app-shell.tsx` | Modify | 139 | ~160 | Friendly workbench tab titles + subtitles, `<GuidedMissionBar />`, outer `<main className="shell-workspace wb-split">` |
| `src/components/workbenches/visual-verifier-workbench.tsx` | Modify | ~125 | ~138 | Mount `<LearnModeCallout workbenchId="wb1" ... />` |
| `src/components/workbenches/thermo-dippr-workbench.tsx` | Modify | ~140 | ~152 | Mount `<LearnModeCallout workbenchId="wb2" ... />` |
| `src/components/workbenches/hydraulics-workbench.tsx` | Modify | 164 | ~180 | Mount `<LearnModeCallout workbenchId="wb3" ... />` + `<KaTeXBlock />` Darcy-Fanning formula |
| `src/components/workbenches/distillation-workbench.tsx` | Modify | 130 | ~155 | Mount `<LearnModeCallout workbenchId="wb4" ... />` + `<KaTeXBlock />` Fenske-Underwood equation |

---

## Tasks & Steps (`--advice` Handover Contract)

### Task 2.1 — Create `<LearnModeCallout />` (`src/components/ui/learn-mode-callout.tsx`)
- **Goal:** Provide a reusable student-intuition callout banner that renders when `personaMode === 'learn'` and stays hidden in `plant` mode so senior engineers retain a compact workspace.
- **Target files and symbols:**
  - `src/components/ui/learn-mode-callout.tsx` (`LearnModeCallout`, `LearnModeCalloutProps`)
- **Steps:**
  1. Create `src/components/ui/learn-mode-callout.tsx` accepting `workbenchId: string`, `title: string`, `plainEnglish: string`, `commonTrap: string`, and `perryAnchor: string`.
  2. Read `const { personaMode } = usePersonaTheme();`.
  3. When `personaMode === 'learn'`, render `<div className="learn-callout" data-testid={`learn-callout-${workbenchId}`}>` showing `🎓 Student Guide: {title}`, `plainEnglish`, `⚠️ Watch out: {commonTrap}`, and `<code>{perryAnchor}</code>`. When `personaMode === 'plant'`, return `null`.
- **Success criteria:** `src/components/ui/learn-mode-callout.tsx` is `< 70` LOC and renders `data-testid="learn-callout-<workbenchId>"` whenever `personaMode === 'learn'`.
- **Verify:** `npm run typecheck && awk 'END { exit (NR > 0 && NR < 75) ? 0 : 1 }' src/components/ui/learn-mode-callout.tsx` exits 0.

### Task 2.2 — Create `<GuidedMissionBar />` (`src/components/shell/guided-mission-bar.tsx`)
- **Goal:** Give students and first-time visitors 4 1-click guided missions right below the navigation bar that switch to `🎓 Learn Mode`, select the target workbench, attach the mission's Point-and-Ask chip, and emit a starter `equation-proof-card` via `agentNative.ui.output()`.
- **Target files and symbols:**
  - `src/components/shell/guided-mission-bar.tsx` (`GuidedMissionBar`, `STUDENT_MISSIONS`)
- **Steps:**
  1. Create `src/components/shell/guided-mission-bar.tsx` defining `STUDENT_MISSIONS`:
     - `mission-fanning-trap`: Workbench `wb1-visual-verifier`, button label `"🔍 Catch the 4× Friction Trap"`, chip `{ kind: 'figure', id: 'perry-crop', label: "Perry's 6-10 visual crop", payload: { secPage: '6-10', exactValue: 0.0045 } }`, proof card `{ type: 'equation-proof-card', title: 'Mission 1 — Moody Darcy vs. Perry Fanning Factor', data: { symbolic_latex: 'f_D = 4 \\cdot f_F', substituted_latex: 'f_D = 4 \\times 0.0045', result_latex: 'f_D = 0.0180', citation: "[Perry's 9th Ed., Fig. 6-9, p. 6-10]" } }`.
     - `mission-boil-water`: Workbench `wb2-thermo-dippr`, button label `"💧 Boil Water at 100°C (psig vs psia)"`, chip `{ kind: 'equation', id: 'dippr-eq-101', label: 'DIPPR Eq. 101 Vapor Pressure (Water (H₂O))', payload: { compound: 'water', tempK: 373.15 } }`, proof card `{ type: 'equation-proof-card', title: 'Mission 2 — DIPPR Eq. 101 Boiling Vapor Pressure', data: { symbolic_latex: 'P_{\\mathrm{vp}} = \\exp(C_1 + C_2/T + C_3 \\ln T + C_4 T^{C_5})', substituted_latex: 'T = 373.15\\text{ K (100}^\\circ\\text{C)}', result_latex: 'P_{\\mathrm{vp}} = 101{,}325\\text{ Pa (14.70 psia / 0.00 psig)}', citation: "[Perry's 9th Ed., Table 2-8, p. 2-53]" } }`.
     - `mission-pump-npsha`: Workbench `wb3-hydraulics`, button label `"⚙️ Check Pump Cavitation (NPSHa)"`, chip `{ kind: 'equipment', id: 'pump-P101', label: 'Centrifugal Pump P-101 (NPSHa vs NPSHr)', payload: { tag: 'P-101' } }`, proof card `{ type: 'equation-proof-card', title: 'Mission 3 — Pump Suction Cavitation Guardrail', data: { symbolic_latex: '\\mathrm{NPSH}_a = \\frac{P_{\\mathrm{suc,abs}} - P_{\\mathrm{vp}}}{\\rho g} + z_s - h_{f,s}', substituted_latex: '\\mathrm{NPSH}_a - \\mathrm{NPSH}_r \\ge 1.0\\text{ m}', result_latex: '\\text{SAFE (No Impeller Cavitation)}', citation: "[Perry's 9th Ed., Sec. 10, p. 10-28]" } }`.
     - `mission-distillation`: Workbench `wb4-distillation`, button label `"🗼 Stage a Binary Distillation Column"`, chip `{ kind: 'equation', id: 'eq-13-fenske', label: 'Fenske N_min & Underwood R_min (Perry Sec 13, p. 13-36)', payload: { alpha: 2.45 } }`, proof card `{ type: 'equation-proof-card', title: 'Mission 4 — Fenske Minimum Stages & Fair Flooding', data: { symbolic_latex: 'N_{\\min} = \\frac{\\ln[(x_D/(1-x_D))\\cdot((1-x_B)/x_B)]}{\\ln \\alpha_{AB}}', substituted_latex: '\\alpha_{AB} = 2.45, \\; R / R_{\\min} = 1.25', result_latex: '\\text{Active Tray Deck}<85\\%\\text{ Flood}', citation: "[Perry's 9th Ed., Sec. 13, p. 13-36 & Fig. 14-32, p. 14-37]" } }`.
  2. Include a collapse/expand button (`data-testid="toggle-mission-bar"`) so users can tuck the bar away when desired.
  3. When a mission button (`data-testid={mission.id}`) is clicked:
     - Call `setPersonaMode('learn')`
     - Call `setActiveWorkbench(mission.workbench)`
     - Call `clearChips()` followed by `toggleChip(mission.chip)`
     - Call `agentNative.ui.output(mission.proofCard)` so the Co-Pilot drawer immediately displays the typeset KaTeX equation proof card.
- **Success criteria:** `src/components/shell/guided-mission-bar.tsx` compiles cleanly, is `< 130` LOC, and renders `data-testid="guided-mission-bar"` with all 4 mission buttons.
- **Verify:** `npm run typecheck && awk 'END { exit (NR > 0 && NR < 135) ? 0 : 1 }' src/components/shell/guided-mission-bar.tsx` exits 0.

### Task 2.3 — Wire `<GuidedMissionBar />` and friendly tab subtitles into `AppShell`
- **Goal:** Upgrade `src/components/shell/app-shell.tsx` to render `<GuidedMissionBar />`, friendly 2-line workbench tab labels, and `<main className="shell-workspace wb-split">` while keeping all existing `data-testid` attributes (`tab-wb1-visual-verifier`..`tab-wb4-distillation`, `dof-badge`, `theme-toggle`, `persona-learn`, `persona-plant`) intact.
- **Target files and symbols:**
  - `src/components/shell/app-shell.tsx` (`WORKBENCH_TABS`, `AppShell`)
- **Steps:**
  1. Update `WORKBENCH_TABS` in `src/components/shell/app-shell.tsx` so each tab displays its canonical label plus a student-friendly subtitle (`<small className="wb-tab-sub">{tab.short}</small>`):
     - `wb1-visual-verifier`: `short: "Chart & Figure Verifier"`
     - `wb2-thermo-dippr`: `short: "Boiling, Vapor Pressure & Thermo"`
     - `wb3-hydraulics`: `short: "Pipe Loss, Pump NPSHa & Valves"`
     - `wb4-distillation`: `short: "Stage Stepping & Flooding Limits"`
  2. Add `title="Degrees of Freedom = 0: Every required input variable is specified so the solver has a unique physical answer."` to `data-testid="dof-badge"`.
  3. Render `<GuidedMissionBar />` right below `<nav className="wb-toolbar" ...>`.
  4. Change `<main className="wb-split">` in `src/components/shell/app-shell.tsx` to `<main className="shell-workspace wb-split">`. Keep `app-shell.tsx` `< 170` LOC.
- **Success criteria:** `AppShell` renders `GuidedMissionBar`, uses `.shell-workspace`, stays `< 170` LOC, and passes `phase3-shell.test.tsx`.
- **Verify:** `npx vitest run src/__tests__/phase3-shell.test.tsx` exits 0 and prints `4 passed`.

### Task 2.4 — Mount `<LearnModeCallout />` and `<KaTeXBlock />` in WB1, WB2, WB3, and WB4
- **Goal:** Surface plain-English student guidance in all 4 workbenches when `🎓 Learn Mode` is active, and add KaTeX formula display to WB3 (`f_D = 4 f_F`) and WB4 (Fenske-Underwood) while keeping all 4 workbench files `< 190` LOC.
- **Target files and symbols:**
  - `src/components/workbenches/visual-verifier-workbench.tsx`
  - `src/components/workbenches/thermo-dippr-workbench.tsx`
  - `src/components/workbenches/hydraulics-workbench.tsx`
  - `src/components/workbenches/distillation-workbench.tsx`
- **Steps:**
  1. In `visual-verifier-workbench.tsx`, render `<LearnModeCallout workbenchId="wb1" title="How to Read Log-Log Perry Charts" plainEnglish="Pick a preset figure chip above, read the curve at the target Reynolds or flow parameter, and type your estimate to check against the calibrated SVG crosshair." commonTrap="Perry's Fig. 6-9 plots Fanning f_F, which is 4× smaller than the Moody Darcy friction factor f_D = 4·f_F." perryAnchor="[Perry's 9th Ed., Fig. 6-9, p. 6-10]" />`.
  2. In `thermo-dippr-workbench.tsx`, render `<LearnModeCallout workbenchId="wb2" title="Vapor Pressure, Boiling & Property Packages" plainEnglish="A liquid boils when its vapor pressure P_vp equals the surrounding absolute pressure. Use Carlson's decision tree on the right to pick the right thermodynamic model." commonTrap="Plant gauges read psig (gauge). Always add 14.696 psi to convert psig → psia before plugging into thermodynamic equations, and never use Wilson for two liquid phases (LLE)." perryAnchor="[Perry's 9th Ed., Table 2-8, p. 2-53 & Sec. 4, p. 4-18]" />`.
  3. In `hydraulics-workbench.tsx`, render `<LearnModeCallout workbenchId="wb3" title="Pipe Friction Loss, Pump Cavitation & Control Valves" plainEnglish="Drag Flow Q or Suction Pressure to see how velocity, friction loss, and Available Net Positive Suction Head (NPSHa) respond across 70% / 100% / 120% operating cases." commonTrap="If NPSHa drops below Pump NPSHr, liquid flashes into vapor bubbles that implode on the impeller (cavitation)." perryAnchor="[Perry's 9th Ed., Eqs. 6-37..6-39, p. 6-11 & Sec. 8, p. 8-71]" />` and add `<KaTeXBlock latex="f_D = 4 f_F, \\quad h_f = f_D \\frac{L}{D} \\frac{v^2}{2g}" testId="katex-darcy-fanning" />` inside `darcy-fanning-banner` without removing any existing text in `darcy-fanning-banner`.
  4. In `distillation-workbench.tsx`, render `<LearnModeCallout workbenchId="wb4" title="McCabe-Thiele Stage Stepping & Column Flooding" plainEnglish="Drag the feed thermal quality q or Reflux Ratio R/R_min. More reflux reduces the number of equilibrium stages (stairs) needed, but increases vapor boilup V and pushes the column closer to flooding." commonTrap="Operating above ~80–85% of Fair's entrainment flood velocity blows liquid up into the tray above, collapsing separation efficiency." perryAnchor="[Perry's 9th Ed., Sec. 13, p. 13-36 & Fig. 14-32, p. 14-37]" />` and render `<KaTeXBlock latex="N_{\\min} = \\frac{\\ln[(x_D/(1-x_D))\\cdot((1-x_B)/x_B)]}{\\ln \\alpha_{AB}}" testId="katex-fenske" />` inside the right-hand tutor card.
- **Success criteria:** All 4 workbenches render their `LearnModeCallout` in `learn` mode, stay strictly `< 190` LOC each, and pass all existing tests.
- **Verify:** `node -e "const fs=require('fs'); for (const f of fs.readdirSync('src/components/workbenches')) { const n=fs.readFileSync('src/components/workbenches/'+f,'utf8').split('\n').length; if (n>=195) { console.error(f, n); process.exit(1); } } console.log('WB_LOC_OK');" && npx vitest run src/__tests__/phase3-shell.test.tsx src/__tests__/phase7-e2e.test.tsx` exits 0 and prints `WB_LOC_OK` and `9 passed`.

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
