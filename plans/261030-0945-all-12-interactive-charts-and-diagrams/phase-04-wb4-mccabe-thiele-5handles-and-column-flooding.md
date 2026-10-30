# Phase 04: `WB4` 5-Handle McCabe-Thiele Canvas, Interactive Column `T-201` & Fair Flooding Curve (Charts 9–11)

- **Parent Plan**: [`plan.md`](file:///Users/nad/ai4u/ai4UCheE/plans/261030-0945-all-12-interactive-charts-and-diagrams/plan.md)
- **Status**: Completed
- **Estimated Effort**: 4.5h
- **Depends On**: [`phase-03-wb3-interactive-pfd-and-pump-system-curves.md`](file:///Users/nad/ai4u/ai4UCheE/plans/261030-0945-all-12-interactive-charts-and-diagrams/phase-03-wb3-interactive-pfd-and-pump-system-curves.md)

## Context & Overview

In `WB4` ([`mccabe-thiele-svg-canvas.tsx`](file:///Users/nad/ai4u/ai4UCheE/src/components/sketches/mccabe-thiele-svg-canvas.tsx), [`column-flooding-svg-sketch.tsx`](file:///Users/nad/ai4u/ai4UCheE/src/components/sketches/column-flooding-svg-sketch.tsx), and [`distillation-workbench.tsx`](file:///Users/nad/ai4u/ai4UCheE/src/components/workbenches/distillation-workbench.tsx)):
1. **Chart 9 (McCabe-Thiele $y\text{–}x$ Equilibrium & Stage-Stepping Canvas)**: Currently only `q-line-handle` is draggable (`151` LOC); you cannot drag the Distillate purity handle ($x_D$), Feed handle ($z_F$), or Bottoms handle ($x_B$) along the $y=x$ diagonal, you cannot drag the Rectifying Operating Line y-intercept $(0, x_D/(R+1))$ to scrub Reflux Ratio $R/R_{\min}$, and hovering over stages or the VLE curve shows no live $(x, y^*(x), \text{Stage } \#)$ tooltip.
2. **Chart 10 (Column `T-201` Shell & Sieve Tray Stack)**: Currently static geometry; you cannot drag the column wall to resize $D_c$ (`colDiamM`), click the tray spacing badge to cycle `12"/18"/24"`, or click individual trays `1..5` to inspect tray hydraulics.
3. **Chart 11 (Fair's Entrainment Flooding Curve $C_{sb}(F_{LV})$ & Hydraulic Window Gauge)**: Currently only renders a static progress bar without plotting Fair's $C_{sb}(F_{LV})$ curve or allowing the user to drag the `% Flood` marker (`wb4-flood-bar-handle`) to inversely solve for column diameter $D_c$ (or `rMult` on Shift-drag).

This phase makes **Charts 9, 10, and 11** bi-directionally interactive while keeping every file `< 180` LOC by extracting `mccabe-thiele-svg-handles.ts`, `mccabe-thiele-handles-overlay.tsx`, and `column-flooding-inverse-math.ts`.

---

## Tasks

### Task 4.1: Extract McCabe-Thiele 5-Handle Math (`src/lib/mccabe-thiele-svg-handles.ts`) & Overlay (`src/components/sketches/mccabe-thiele-handles-overlay.tsx`) — Chart 9

- **Goal**: Add 5 draggable handles (`q-line-handle`, `mt-xd-handle`, `mt-zf-handle`, `mt-xb-handle`, `mt-rol-handle`) and a live stage/VLE hover tooltip (`mt-hover-tooltip`) to **Chart 9** while dropping [`mccabe-thiele-svg-canvas.tsx`](file:///Users/nad/ai4u/ai4UCheE/src/components/sketches/mccabe-thiele-svg-canvas.tsx) from `151` LOC to `~135` LOC.
- **Target files and symbols**:
  - `src/lib/mccabe-thiele-svg-handles.ts`:
    - `ActiveMtHandle` type (`'q' | 'xd' | 'zf' | 'xb' | 'rol' | null`)
    - `clampMcCabeComposition(target: 'xd' | 'zf' | 'xb', rawX: number, current: { xd: number; xf: number; xb: number }): number`
    - `solveQFromSvgNorm(xf: number, normX: number): number`
    - `solveRMultFromInterceptNormY(xd: number, rMin: number, normY: number): number`
  - `src/components/sketches/mccabe-thiele-handles-overlay.tsx`:
    - `McCabeThieleHandlesOverlayProps` interface
    - `McCabeThieleHandlesOverlay` component
  - [`src/components/sketches/mccabe-thiele-svg-canvas.tsx`](file:///Users/nad/ai4u/ai4UCheE/src/components/sketches/mccabe-thiele-svg-canvas.tsx) (`McCabeThieleSvgCanvas`)
- **Steps**:
  1. Create `src/lib/mccabe-thiele-svg-handles.ts` (~85 LOC) enforcing physical ordering bounds ($0.005 \le x_B \le z_F - 0.04$, $x_B + 0.04 \le z_F \le x_D - 0.04$, $z_F + 0.04 \le x_D \le 0.995$) and inverse ROL y-intercept solver $y_{\text{int}} = \frac{x_D}{R_{\text{op}} + 1} \implies R_{\text{op}} = \frac{x_D}{y_{\text{int}}} - 1 \implies r_{\text{mult}} = \text{clamp}(R_{\text{op}} / R_{\min}, 1.05, 4.5)$.
  2. Create `src/components/sketches/mccabe-thiele-handles-overlay.tsx` (~115 LOC) rendering:
     - `data-testid="q-line-handle"` at `(xInt, yInt)`
     - `data-testid="mt-xd-handle"` at `(xd, xd)` on the $45^\circ$ diagonal
     - `data-testid="mt-zf-handle"` at `(xf, xf)` on the $45^\circ$ diagonal
     - `data-testid="mt-xb-handle"` at `(xb, xb)` on the $45^\circ$ diagonal
     - `data-testid="mt-rol-handle"` at `(0, xd / (rOp + 1))` on the left y-axis
     - `data-testid="mt-hover-tooltip"` showing hovered $(x, y, y^*(x) = \frac{\alpha x}{1 + (\alpha - 1)x}, \text{Stage } \#)$
  3. Update [`src/components/sketches/mccabe-thiele-svg-canvas.tsx`](file:///Users/nad/ai4u/ai4UCheE/src/components/sketches/mccabe-thiele-svg-canvas.tsx) (~135 LOC) to accept optional `rMin`, `onChangeXd`, `onChangeXf`, `onChangeXb`, and `onChangeRMult` props and delegate handle rendering to `<McCabeThieleHandlesOverlay />`.
- **Success criteria**:
  - Dragging any of the 5 handles (`q-line-handle`, `mt-xd-handle`, `mt-zf-handle`, `mt-xb-handle`, `mt-rol-handle`) updates the corresponding parameter cleanly without crossing composition bounds.
  - All 3 files remain strictly `< 200` LOC.
- **Verify**:
  ```bash
  npm run typecheck && test $(wc -l < src/lib/mccabe-thiele-svg-handles.ts) -lt 200 && test $(wc -l < src/components/sketches/mccabe-thiele-handles-overlay.tsx) -lt 200 && test $(wc -l < src/components/sketches/mccabe-thiele-svg-canvas.tsx) -lt 200
  ```

### Task 4.2: Create `src/lib/column-flooding-inverse-math.ts` & Upgrade `column-flooding-svg-sketch.tsx` + `distillation-workbench.tsx` — Charts 10 & 11

- **Goal**: Make **Chart 10** (`T-201` Column Shell & Sieve Trays) and **Chart 11** (`Fair's Entrainment Flooding Curve C_sb(F_LV) & Hydraulic Window Gauge`) bi-directionally interactive in [`src/components/sketches/column-flooding-svg-sketch.tsx`](file:///Users/nad/ai4u/ai4UCheE/src/components/sketches/column-flooding-svg-sketch.tsx) and wire all callbacks in [`src/components/workbenches/distillation-workbench.tsx`](file:///Users/nad/ai4u/ai4UCheE/src/components/workbenches/distillation-workbench.tsx).
- **Target files and symbols**:
  - `src/lib/column-flooding-inverse-math.ts`:
    - `CYCLE_TRAY_SPACING: readonly number[]` (`[0.305, 0.457, 0.61]`)
    - `nextTraySpacingM(current: number): number`
    - `solveColDiamFromTargetFloodPct(currentDiamM: number, currentFloodPct: number, targetFloodPct: number): number`
    - `solveRMultFromTargetFloodPct(currentRMult: number, currentFloodPct: number, targetFloodPct: number): number`
    - `buildFairCsbCurvePoints(traySpacingM: number): string`
  - [`src/components/sketches/column-flooding-svg-sketch.tsx`](file:///Users/nad/ai4u/ai4UCheE/src/components/sketches/column-flooding-svg-sketch.tsx) (`ColumnFloodingSvgSketch`)
  - [`src/components/workbenches/distillation-workbench.tsx`](file:///Users/nad/ai4u/ai4UCheE/src/components/workbenches/distillation-workbench.tsx) (`DistillationWorkbench`)
- **Steps**:
  1. Create `src/lib/column-flooding-inverse-math.ts` (~80 LOC) implementing:
     - Inverse column diameter solver from target `% Flood`: since superficial vapor velocity $u_n \propto D_c^{-2}$ (`[Perry's 9th Ed., Fig. 14-32, p. 14-37]`), $D_{c,\text{next}} = \text{clamp}(D_c \sqrt{\%\text{Flood}_{\text{cur}} / \%\text{Flood}_{\text{target}}}, 0.5, 3.5)$.
     - Fair $C_{sb}(F_{LV})$ curve polyline generator for the embedded mini Fair chart (`Chart 11`).
  2. In [`src/components/sketches/column-flooding-svg-sketch.tsx`](file:///Users/nad/ai4u/ai4UCheE/src/components/sketches/column-flooding-svg-sketch.tsx) (~168 LOC):
     - **Chart 10 (`T-201` Column Shell & Trays)**:
       - Scale visual column width dynamically with `columnDiameterM` and add horizontal wall drag handle `data-testid="wb4-col-diam-handle"` calling `onChangeColDiamM`.
       - Add clickable tray-spacing trigger `data-testid="wb4-tray-spacing-trigger"` cycling `0.305 -> 0.457 -> 0.61` m via `onChangeTraySpacingM`.
       - Make the 5 sieve tray lines clickable (`data-testid="wb4-tray-hit-1"`..`5`), highlighting the selected tray and rendering `data-testid="wb4-tray-tooltip"` with local tray stage index, section (`Rectifying` vs. `Stripping`), $F_{LV}$, $C_{sb}$, and `% Flood`.
     - **Chart 11 (`Fair C_sb(F_LV) Curve & Flooding Window Bar`)**:
       - Render the Fair $C_{sb}(F_{LV})$ curve (`data-testid="wb4-fair-csb-curve"`) with live operating dot $(F_{LV}, C_{sb})$.
       - Add draggable handle `data-testid="wb4-flood-bar-handle"` on the `% Flood` bar (`0–120%`) that inversely updates `onChangeColDiamM` (or `onChangeRMult` when `e.shiftKey` is held).
  3. In [`src/components/workbenches/distillation-workbench.tsx`](file:///Users/nad/ai4u/ai4UCheE/src/components/workbenches/distillation-workbench.tsx) (~175 LOC), pass `rMin={rMin}`, `onChangeXd={setXd}`, `onChangeXf={setXf}`, `onChangeXb={setXb}`, `onChangeRMult={setRMult}` to `<McCabeThieleSvgCanvas />` and `onChangeColDiamM={setColDiamM}`, `onChangeTraySpacingM={setTraySpacingM}`, `onChangeRMult={setRMult}` to `<ColumnFloodingSvgSketch />`.
- **Success criteria**:
  - Dragging `wb4-col-diam-handle`, clicking `wb4-tray-spacing-trigger`, clicking `wb4-tray-hit-1..5`, and dragging `wb4-flood-bar-handle` all mutate `DistillationWorkbench` state and update `% Flood` in real time.
  - All modified/created files are strictly `< 200` LOC.
- **Verify**:
  ```bash
  npm run typecheck && npx vitest run && test $(wc -l < src/lib/column-flooding-inverse-math.ts) -lt 200 && test $(wc -l < src/components/sketches/column-flooding-svg-sketch.tsx) -lt 200 && test $(wc -l < src/components/workbenches/distillation-workbench.tsx) -lt 200
  ```

---

## Failure Protocol

If any task verification command in Phase 04 fails, produces a TypeScript error, breaks an existing Vitest test, or exceeds the 200-LOC file cap:
1. **STOP** immediately — do not proceed to Phase 05 and do not weaken any test assertion or LOC gate.
2. Capture the failing command output, exact file/line reference, and root cause hypothesis.
3. Escalate to the `kongming` advisor subagent (`invoke_subagent` with `TypeName: "kongming"`) with the failure evidence before attempting an architectural workaround.
