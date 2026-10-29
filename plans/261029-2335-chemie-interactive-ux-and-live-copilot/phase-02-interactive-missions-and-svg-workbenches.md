# Phase 02: Interactive SVG Workbenches (`WB1`–`WB4`), Solver Math Extraction & Self-Guided Rescue Missions

<!-- Updated: Validation Session 1 (2026-10-30) - WB1 re-scoped (no new sliders; chart-reading mission), mutation keys corrected to actual state vars (compound/tempK, npsInch/schedule/pSuctionPsig, rMult/q), solver extraction preserves in-repo Swamee-Jain math (no Churchill swap), mission ids preserved (mission-fanning-trap etc.), Perry citations locked to PDF-verified ground truths, added thermo-solver-math.ts -->

- **Parent Plan**: [`plan.md`](file:///Users/nad/ai4u/ai4UCheE/plans/261029-2335-chemie-interactive-ux-and-live-copilot/plan.md)
- **Status**: Completed
- **Estimated Effort**: 4.5h
- **Depends On**: [`phase-01-live-screen-bus-and-3stage-katex.md`](file:///Users/nad/ai4u/ai4UCheE/plans/261029-2335-chemie-interactive-ux-and-live-copilot/phase-01-live-screen-bus-and-3stage-katex.md)

## Context & Overview

To make `Chemie.ai4U.now` genuinely intuitive and impressive for students and junior engineers while respecting the `< 200` LOC file cap (`AGENTS.md` Invariant #2), this phase:
1. Extracts pure chemical engineering solver calculations and 3-stage LaTeX builders into [`src/components/workbenches/hydraulics-solver-math.ts`](file:///Users/nad/ai4u/ai4UCheE/src/components/workbenches/hydraulics-solver-math.ts) and [`src/components/workbenches/distillation-solver-math.ts`](file:///Users/nad/ai4u/ai4UCheE/src/components/workbenches/distillation-solver-math.ts) so [`hydraulics-workbench.tsx`](file:///Users/nad/ai4u/ai4UCheE/src/components/workbenches/hydraulics-workbench.tsx) drops from 174 LOC to ~158 LOC and [`distillation-workbench.tsx`](file:///Users/nad/ai4u/ai4UCheE/src/components/workbenches/distillation-workbench.tsx) stays ~152 LOC.
2. Adds [`src/components/sketches/dippr-phase-envelope-svg.tsx`](file:///Users/nad/ai4u/ai4UCheE/src/components/sketches/dippr-phase-envelope-svg.tsx) (`<DipprPhaseEnvelopeSvg />`) so `WB2` (`ThermodynamicsWorkbench`) has a live interactive SVG vapor-pressure curve ($250\text{–}650\text{ K}$) with an operating crosshair, $1\text{ atm}$ normal boiling point marker, and subcooled liquid vs. superheated vapor phase badge.
3. Connects all 4 workbenches (`WB1`..`WB4`) to `syncWorkbenchPayload`, `subscribeWorkbenchMutation`, and `<WhiteBoxEquationCard />` so every slider scrub updates 3-stage live numerical substitutions in real time.
4. Upgrades the Guided Mission Bar with [`src/components/shell/mission-scenarios.ts`](file:///Users/nad/ai4u/ai4UCheE/src/components/shell/mission-scenarios.ts) and [`src/components/shell/mission-checklist-banner.tsx`](file:///Users/nad/ai4u/ai4UCheE/src/components/shell/mission-checklist-banner.tsx) so clicking a mission presets a dramatic engineering trap (e.g., pump cavitation in `WB3` or column flooding in `WB4`), guides the user through a 3-step live rescue checklist (`Observe Trap -> Scrub Control -> Verify Proof`), and provides an `"Auto-Fix & Explain"` button.

---

## Tasks

### Task 2.1: Extract `hydraulics-solver-math.ts`, `thermo-solver-math.ts` & `distillation-solver-math.ts`

- **Goal**: Keep [`hydraulics-workbench.tsx`](file:///Users/nad/ai4u/ai4UCheE/src/components/workbenches/hydraulics-workbench.tsx) (174 LOC), [`thermo-dippr-workbench.tsx`](file:///Users/nad/ai4u/ai4UCheE/src/components/workbenches/thermo-dippr-workbench.tsx) (153 LOC), and [`distillation-workbench.tsx`](file:///Users/nad/ai4u/ai4UCheE/src/components/workbenches/distillation-workbench.tsx) (140 LOC) below 200 LOC while adding bus sync + 3-stage cards, by extracting the **existing in-repo solver math** (do NOT change formulas — no Churchill swap, no new constants) plus 3-stage LaTeX builders into dedicated modules.
- **Target files and symbols**:
  - [`src/components/workbenches/hydraulics-solver-math.ts`](file:///Users/nad/ai4u/ai4UCheE/src/components/workbenches/hydraulics-solver-math.ts):
    - `HydraulicsInputs`, `HydraulicsMetrics` interfaces
    - `solveHydraulics(inputs: HydraulicsInputs): HydraulicsMetrics & { equations: WhiteBoxStageEquation[] }`
  - [`src/components/workbenches/thermo-solver-math.ts`](file:///Users/nad/ai4u/ai4UCheE/src/components/workbenches/thermo-solver-math.ts):
    - `ThermoInputs`, `ThermoMetrics` interfaces
    - `solveThermo(inputs: ThermoInputs): ThermoMetrics & { equations: WhiteBoxStageEquation[] }`
  - [`src/components/workbenches/distillation-solver-math.ts`](file:///Users/nad/ai4u/ai4UCheE/src/components/workbenches/distillation-solver-math.ts):
    - `DistillationInputs`, `DistillationMetrics` interfaces
    - `solveDistillation(inputs: DistillationInputs): DistillationMetrics & { equations: WhiteBoxStageEquation[] }`
- **Steps**:
  1. Create [`src/components/workbenches/hydraulics-solver-math.ts`](file:///Users/nad/ai4u/ai4UCheE/src/components/workbenches/hydraulics-solver-math.ts) (~95 LOC) **extracting the exact formulas already running in `hydraulics-workbench.tsx`** (lines ~30-48):
     - Explicit gauge-to-absolute suction pressure conversion (`P_abs = P_psig + 14.696 psia`) (`[Perry's 9th Ed., Sec. 1 — Unit Conversion Factors and Symbols]`).
     - Swamee-Jain explicit Darcy friction factor $f_D = 0.25 / \log_{10}(\varepsilon/3.7D + 5.74/Re^{0.9})^2$ with $f_F = f_D / 4$ — the shipped convention, kept verbatim (`[Perry's 9th Ed., Fig. 6-9, p. 6-10; Eqs. 6-37..6-39, p. 6-11]`). **Do not replace with Churchill.**
     - $\text{NPSH}_A = \frac{P_{\text{abs}} - P_{\text{vap}}}{\rho g} + z_s - h_{f,\text{suction}}$ vs. the user-scrubbable $\text{NPSH}_r$ slider (default 3.0 m) (`[Perry's 9th Ed., Sec. 10, pp. 10-24..25]` — the NPSH equations are **unnumbered** in Perry's; never cite "Eq. 10-33").
     - Inputs use the workbench's actual state keys: `flowGpm`, `npsInch`, `schedule`, `pSuctionPsig`, `zSuctionM`, `npshrM`, `lengthM`, `valveDpPsi`.
     - Three `WhiteBoxStageEquation` objects (`wb3-psig-psia`, `wb3-darcy-fanning-fd`, `wb3-npsha`) with live numeric Stage 2 substitution strings.
  2. Create [`src/components/workbenches/thermo-solver-math.ts`](file:///Users/nad/ai4u/ai4UCheE/src/components/workbenches/thermo-solver-math.ts) (~85 LOC) **upgrading WB2 to true DIPPR Eq. 101** using the PDF-verified A–E coefficients already curated in `services/perry-engine/solvers/dippr_coeffs.py` (port the water/ethanol/benzene rows verbatim — single source of truth stays the sidecar):
     - $P^{\text{sat}} = \exp(A + B/T + C\ln T + D\,T^{E})$ in Pa, replacing the crude anchored correlation `vpAt373Pa·exp(12.2·(1−373.15/T))` (`[Perry's 9th Ed., Table 2-8, p. 2-53]`).
     - $\Delta H_{\text{vap}}$ via DIPPR Eq. 106 Watson-style correlation (extract the existing `hvap` formula) (`[Perry's 9th Ed., Table 2-69, p. 2-120]`).
     - Two `WhiteBoxStageEquation` objects (`wb2-dippr-101`, `wb2-dippr-106`) with live A–E + $T$ substitution in Stage 2.
  3. Create [`src/components/workbenches/distillation-solver-math.ts`](file:///Users/nad/ai4u/ai4UCheE/src/components/workbenches/distillation-solver-math.ts) (~90 LOC) **extracting the exact formulas already in `distillation-workbench.tsx`**:
     - Fenske minimum stages $N_{\min}$, Underwood minimum reflux $R_{\min}$, operating reflux via the existing `rMult` (R = `rMult` × $R_{\min}$), theoretical stages, and Fair flooding percentage (`floodPercent >= 85%` triggers flooding warning) (`[Perry's 9th Ed., Sec. 13, p. 13-36; Fig. 14-32, p. 14-37]` — **never** Fig. 14-26/14-27).
     - Inputs use the workbench's actual state keys: `alpha`, `xf`, `xd`, `xb`, `q`, `rMult`, `traySpacingM`, `colDiamM`.
     - Two `WhiteBoxStageEquation` objects (`wb4-fenske-underwood`, `wb4-fair-flooding`) with live numeric Stage 2 substitution strings.
- **Success criteria**:
  - All three solver modules compile cleanly, reproduce the shipped workbench numbers bit-for-bit for the same inputs (except WB2's upgraded DIPPR 101, whose $P^{\text{sat}}$(water, 373.15 K) must still round to $101{,}325$ Pa), enforce `AGENTS.md` Invariant #5 (`psig` $\to$ `psia`, $f_D = 4f_F$, PDF-verified citations), and are `< 110` LOC each.
- **Verify**:
  ```bash
  npm run typecheck && test $(wc -l < src/components/workbenches/hydraulics-solver-math.ts) -lt 200 && test $(wc -l < src/components/workbenches/thermo-solver-math.ts) -lt 200 && test $(wc -l < src/components/workbenches/distillation-solver-math.ts) -lt 200
  ```

### Task 2.2: Create Interactive `<DipprPhaseEnvelopeSvg />` (`src/components/sketches/dippr-phase-envelope-svg.tsx`)

- **Goal**: Give `WB2` (`ThermoDipprWorkbench`, tab `tab-wb2-thermo-dippr`) an interactive SVG saturation curve ($P^{\text{sat}}(T)$ from $250\text{ K}$ to $T_c$) that plots the DIPPR Eq. 101 curve for the selected compound (`water`, `ethanol`, `benzene` — the exact keys of the workbench's `FLUIDS` map), highlights the $101.325\text{ kPa}$ ($1\text{ atm}$) normal boiling point, and moves an animated operating crosshair as the user scrubs temperature $T$.
- **Target files and symbols**:
  - [`src/components/sketches/dippr-phase-envelope-svg.tsx`](file:///Users/nad/ai4u/ai4UCheE/src/components/sketches/dippr-phase-envelope-svg.tsx):
    - `DipprPhaseEnvelopeSvgProps` interface
    - `DipprPhaseEnvelopeSvg` component (`data-testid="dippr-phase-envelope-svg"`)
- **Steps**:
  1. Create [`src/components/sketches/dippr-phase-envelope-svg.tsx`](file:///Users/nad/ai4u/ai4UCheE/src/components/sketches/dippr-phase-envelope-svg.tsx) (~135 LOC) rendering an SVG (`viewBox="0 0 600 240"`).
  2. Plot log-scaled $P^{\text{sat}}(T)$ curve from $270\text{ K}$ up to compound critical temperature $T_c$ (from the workbench's `FLUIDS` map: `647.096 K` for Water, `514.0 K` for Ethanol, `562.05 K` for Benzene).
  3. Draw dashed reference line at $101.325\text{ kPa}$ ($1\text{ atm}$ Normal Boiling Point) and mark the critical point $(T_c, P_c)$.
  4. Render live operating point crosshair at `(tempK, pSatKpa)` with a phase state badge (`SUBCOOLED LIQUID (< 1 atm)`, `NORMAL BOILING POINT (1 atm)`, or `PRESSURIZED SATURATION (> 1 atm)`).
- **Success criteria**:
  - `<DipprPhaseEnvelopeSvg />` renders with `data-testid="dippr-phase-envelope-svg"`, zero hardcoded low-contrast fills, and `< 150` LOC.
- **Verify**:
  ```bash
  npm run typecheck && test $(wc -l < src/components/sketches/dippr-phase-envelope-svg.tsx) -lt 200
  ```

### Task 2.3: Wire `WB1`–`WB4` to Live Payload Bus, Mutation Listeners & 3-Stage `<WhiteBoxEquationCard />`

- **Goal**: Upgrade [`visual-verifier-workbench.tsx`](file:///Users/nad/ai4u/ai4UCheE/src/components/workbenches/visual-verifier-workbench.tsx), [`thermo-dippr-workbench.tsx`](file:///Users/nad/ai4u/ai4UCheE/src/components/workbenches/thermo-dippr-workbench.tsx), [`hydraulics-workbench.tsx`](file:///Users/nad/ai4u/ai4UCheE/src/components/workbenches/hydraulics-workbench.tsx), and [`distillation-workbench.tsx`](file:///Users/nad/ai4u/ai4UCheE/src/components/workbenches/distillation-workbench.tsx) to:
  1. Publish live inputs, calculated metrics, and 3-stage equations via `syncWorkbenchPayload(...)` on mount and on every parameter change.
  2. Listen to `subscribeWorkbenchMutation(...)` so Guided Missions and Copilot `actionMutations` immediately scrub workbench controls.
  3. Render `<WhiteBoxEquationCard />` (WB2/WB3/WB4 only) so students see live numerical substitution on every slider drag.
- **Target files and symbols**:
  - [`src/components/workbenches/visual-verifier-workbench.tsx`](file:///Users/nad/ai4u/ai4UCheE/src/components/workbenches/visual-verifier-workbench.tsx) (`VisualVerifierWorkbench`) — 136 LOC baseline
  - [`src/components/workbenches/thermo-dippr-workbench.tsx`](file:///Users/nad/ai4u/ai4UCheE/src/components/workbenches/thermo-dippr-workbench.tsx) (`ThermoDipprWorkbench`) — 153 LOC baseline
  - [`src/components/workbenches/hydraulics-workbench.tsx`](file:///Users/nad/ai4u/ai4UCheE/src/components/workbenches/hydraulics-workbench.tsx) (`HydraulicsWorkbench`) — 174 LOC baseline
  - [`src/components/workbenches/distillation-workbench.tsx`](file:///Users/nad/ai4u/ai4UCheE/src/components/workbenches/distillation-workbench.tsx) (`DistillationWorkbench`) — 140 LOC baseline
- **Steps**:
  1. In [`visual-verifier-workbench.tsx`](file:///Users/nad/ai4u/ai4UCheE/src/components/workbenches/visual-verifier-workbench.tsx) (**re-scoped per Validation Session 1 — no new sliders, no Re equation card**; WB1 is a Fig. 6-9 chart-reading tutor with `secNum`, `secPage`, `userReading`, `exactValue`, `crosshair` state and no Reynolds inputs):
     - Subscribe to chart-reading mutations (`secPage`, `userReading`, `exactValue`).
     - Sync `WB1` payload (`secPage`, `userReading`, `exactValue`, `errorPct`, `fFanning` (the Perry-exact chart value), `readingWithinTolerance`) to `syncWorkbenchPayload('wb1-visual-verifier', ...)` on mount and on every change.
     - Preserve all existing testids (`wb1-visual-verifier`, `calibrated-crosshair`) and the `perry-figure` integration.
  2. In [`thermo-dippr-workbench.tsx`](file:///Users/nad/ai4u/ai4UCheE/src/components/workbenches/thermo-dippr-workbench.tsx):
     - Delegate calculations to `solveThermo({ compound, tempK })` from [`thermo-solver-math.ts`](file:///Users/nad/ai4u/ai4UCheE/src/components/workbenches/thermo-solver-math.ts).
     - Subscribe to `compound` and `tempK` mutations (the actual state keys — not `fluid`/`temperatureK`).
     - Embed `<DipprPhaseEnvelopeSvg />` in the visual column alongside `<CarlsonAdvisorCard />`.
     - Render `<WhiteBoxEquationCard />` for DIPPR Eq. 101 with live coefficients $A, B, C, D, E$ and current $T$ substituted in Stage 2 (`[Perry's 9th Ed., Table 2-8, p. 2-53]`).
     - Sync `WB2` payload (`compound`, `tempK`, `tempC`, `pSatPa`, `pSatKpa`, `hVapKjMol`) to `syncWorkbenchPayload('wb2-thermo-dippr', ...)`.
  3. In [`hydraulics-workbench.tsx`](file:///Users/nad/ai4u/ai4UCheE/src/components/workbenches/hydraulics-workbench.tsx):
     - Delegate calculations to `solveHydraulics({ flowGpm, npsInch, schedule, pSuctionPsig, zSuctionM, npshrM, lengthM })` from [`hydraulics-solver-math.ts`](file:///Users/nad/ai4u/ai4UCheE/src/components/workbenches/hydraulics-solver-math.ts).
     - Subscribe to `flowGpm`, `npsInch`, `schedule`, `pSuctionPsig`, `zSuctionM`, and `npshrM` mutations (pipe ID is derived from NPS + Sch 40/80 — there is no free `pipeDiaIn` slider).
     - Render `<WhiteBoxEquationCard />` items (`wb3-psig-psia`, `wb3-darcy-fanning-fd`, `wb3-npsha`) and sync `WB3` payload (incl. `npshAvailableM`, `isCavitating`) to `syncWorkbenchPayload('wb3-hydraulics', ...)`.
  4. In [`distillation-workbench.tsx`](file:///Users/nad/ai4u/ai4UCheE/src/components/workbenches/distillation-workbench.tsx):
     - Delegate calculations to `solveDistillation({ alpha, xf, xd, xb, q, rMult, traySpacingM, colDiamM })` from [`distillation-solver-math.ts`](file:///Users/nad/ai4u/ai4UCheE/src/components/workbenches/distillation-solver-math.ts).
     - Subscribe to `alpha`, `xf`, `xd`, `xb`, `q`, and `rMult` mutations (reflux is a multiplier on $R_{\min}$ — there is no absolute `refluxRatio` slider).
     - Render `<WhiteBoxEquationCard />` items (`wb4-fenske-underwood`, `wb4-fair-flooding`) and sync `WB4` payload (incl. `floodPercent`, `isFlooding`) to `syncWorkbenchPayload('wb4-distillation', ...)`.
- **Success criteria**:
  - Scrubbing any parameter on `WB1`..`WB4` immediately updates `getClientAppState().payload`, and on WB2–WB4 updates Stage 2 (`eq-stage-substituted-*`) + Stage 3 (`eq-stage-result-*`) live.
  - All 4 workbench files remain strictly `< 200` LOC (plan targets: WB1 ~180, WB2 ~185, WB3 ~175, WB4 ~165).
- **Verify**:
  ```bash
  npm run typecheck && npx vitest run && for f in src/components/workbenches/*.tsx; do test $(wc -l < "$f") -lt 200 || exit 1; done
  ```

### Task 2.4: Create Self-Guided Rescue Missions (`mission-scenarios.ts`, `mission-checklist-banner.tsx`, `guided-mission-bar.tsx`)

- **Goal**: Make the Guided Mission Bar truly interactive: clicking a mission pill presets a dramatic engineering trap on that workbench (e.g., active pump cavitation on `WB3` or column flooding on `WB4`), opens a 3-step interactive walkthrough banner (`Step 1: Observe Trap -> Step 2: Scrub Control -> Step 3: Verify Proof`), automatically checks off Step 2 & Step 3 as the student scrubs the slider to safety, and offers a one-click `"Auto-Fix & Explain"` button — **while preserving the existing mission ids and the chip + `learn-callout-*` + GenUI proof-card behaviors that phase8 tests depend on**.
- **Target files and symbols**:
  - [`src/components/shell/mission-scenarios.ts`](file:///Users/nad/ai4u/ai4UCheE/src/components/shell/mission-scenarios.ts):
    - `GuidedMissionScenario` interface (extends the existing inline mission objects)
    - `GUIDED_MISSIONS: GuidedMissionScenario[]` — **ids preserved verbatim**: `mission-fanning-trap`, `mission-boil-water`, `mission-pump-npsha`, `mission-distillation`
  - [`src/components/shell/mission-checklist-banner.tsx`](file:///Users/nad/ai4u/ai4UCheE/src/components/shell/mission-checklist-banner.tsx):
    - `MissionChecklistBanner` component (`data-testid="mission-checklist-banner"`, `data-testid="mission-autofix-btn"`)
  - [`src/components/shell/guided-mission-bar.tsx`](file:///Users/nad/ai4u/ai4UCheE/src/components/shell/guided-mission-bar.tsx):
    - `GuidedMissionBar` component (preserves `data-testid={mission.id}` — the current rendering contract)
- **Steps**:
  1. Create [`src/components/shell/mission-scenarios.ts`](file:///Users/nad/ai4u/ai4UCheE/src/components/shell/mission-scenarios.ts) (~120 LOC) extending the 4 **existing** missions with trap/rescue data (mutation keys = actual workbench state vars; **trap/rescue numbers below are hand-verified against the shipped solver formulas — the executor must re-confirm each by running the extracted solvers before finalizing**, and the phase9 tests assert the trap/rescue states mechanically):
     - `mission-pump-npsha` (`wb3-hydraulics`, **Stop Pump Cavitation**): `initialMutations: { flowGpm: 450, pSuctionPsig: -12, zSuctionM: 2 }` — deep-vacuum trap giving $\text{NPSH}_A \approx 2.8\text{ m} < \text{NPSH}_r\,3.0\text{ m}$, cavitating (verified: $P_{abs} = (-12 + 14.696)$ psia $= 18.6\text{ kPa}$; $\text{NPSH}_A = (18600-3169)/9790 + 2 - 0.8 \approx 2.78$ m), `rescueMutations: { pSuctionPsig: 15, flowGpm: 260 }` ($\text{NPSH}_A \approx 21.8\text{ m}$, safe), `checkSolved: (payload) => payload.metrics?.isCavitating === false && Number(payload.metrics?.npshAvailableM) >= 5.0`.
     - `mission-distillation` (`wb4-distillation`, **Prevent Column Flooding**): trap via the actual knobs — high `rMult` and undersized `colDiamM` (e.g., `rMult: 1.9`, `colDiamM: 0.55`) driving `floodPercent >= 85`, rescue restoring `rMult: 1.3`, `colDiamM: 0.85` (`floodPercent < 70`), `checkSolved: (payload) => payload.metrics?.isFlooding === false`. **Exact values must be derived by executing `solveDistillation`** (Task 2.1) — do not hardcode unverified numbers.
     - `mission-boil-water` (`wb2-thermo-dippr`, **Verify Vapor Pressure Curve**): `initialMutations: { compound: 'ethanol', tempK: 351.5 }`, `rescueMutations: { compound: 'water', tempK: 373.15 }`, `checkSolved: (payload) => Math.abs(Number(payload.metrics?.pSatKpa) - 101.325) < 5`.
     - `mission-fanning-trap` (`wb1-visual-verifier`, **Audit the Chart Reading** — re-scoped per Validation Session 1): trap sets `userReading: '0.018'` against `exactValue: 0.0045` (the classic $4\times$ Fanning/Darcy mix-up demonstrated via the chart-reading error), rescue corrects `userReading: '0.0045'`, `checkSolved: (payload) => Math.abs(Number(payload.inputs?.userReading) - Number(payload.inputs?.exactValue)) / Number(payload.inputs?.exactValue) < 0.05`. **No `reynolds`/`relRoughness` mutations — WB1 has no such controls.**
  2. Create [`src/components/shell/mission-checklist-banner.tsx`](file:///Users/nad/ai4u/ai4UCheE/src/components/shell/mission-checklist-banner.tsx) (~95 LOC) subscribing to `subscribeClientAppState` to show live 3-step checkmarks (`Step 1: Trap Loaded`, `Step 2: Scrub Control`, `Step 3: Safe Operating Margin Verified`) plus an `"Auto-Fix & Ask Copilot"` button (`data-testid="mission-autofix-btn"`) that dispatches `rescueMutations` and attaches a chip for the copilot.
  3. Update [`src/components/shell/guided-mission-bar.tsx`](file:///Users/nad/ai4u/ai4UCheE/src/components/shell/guided-mission-bar.tsx) (~160 LOC) to dispatch `mission.initialMutations` via `dispatchWorkbenchMutation` (wrapped in `setTimeout(..., 0)` so workbench mount completes first if switching tabs), mount `<MissionChecklistBanner />`, and **keep every existing behavior**: chip attach (`chip-agent-select:*` testids), `learn-callout-wb1`/`learn-callout-wb3`, GenUI proof cards, `composer-chip-tray` text, and `data-testid={mission.id}`.
- **Success criteria**:
  - Clicking `data-testid="mission-pump-npsha"` switches to `WB3`, loads the cavitation trap (`isCavitating === true`), displays `data-testid="mission-checklist-banner"`, and clicking `data-testid="mission-autofix-btn"` (or scrubbing `pSuctionPsig` to `15`) resolves the cavitation and marks the mission solved.
  - Existing test `phase8-ux-copilot.test.tsx` ("guided mission clicks switch to 🎓 Learn Mode, attach mission chips, and emit inline GenUI proof cards") continues to pass **without modification** — it clicks `mission-fanning-trap` and `mission-pump-npsha` and asserts `learn-callout-wb1/wb3`, `chip-agent-select:*`, and `composer-chip-tray`.
- **Verify**:
  ```bash
  npm run typecheck && npx vitest run src/__tests__/phase8-ux-copilot.test.tsx && test $(wc -l < src/components/shell/guided-mission-bar.tsx) -lt 200 && test $(wc -l < src/components/shell/mission-checklist-banner.tsx) -lt 200
  ```

---

## Failure Protocol

If any task verification command in Phase 02 fails, produces a TypeScript error, breaks an existing Vitest test, or exceeds the 200-LOC file cap:
1. **STOP** immediately — do not proceed to Phase 03 and do not weaken any test assertion or LOC gate.
2. Capture the failing command output, exact file/line reference, and root cause hypothesis.
3. Escalate to the `kongming` advisor subagent (`invoke_subagent` with `TypeName: "kongming"`) with the failure evidence before attempting an architectural workaround.
