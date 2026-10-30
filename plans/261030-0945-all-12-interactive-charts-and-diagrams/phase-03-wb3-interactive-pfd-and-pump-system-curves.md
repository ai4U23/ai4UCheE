# Phase 03: `WB3` Interactive PFD Schematic & Extracted Pump/System/$\text{NPSH}_A$ Curve Chart (Charts 7 & 8)

- **Parent Plan**: [`plan.md`](file:///Users/nad/ai4u/ai4UCheE/plans/261030-0945-all-12-interactive-charts-and-diagrams/plan.md)
- **Status**: Completed
- **Estimated Effort**: 4.0h
- **Depends On**: [`phase-02-wb2-dippr-dual-envelope-and-carlson-flowchart.md`](file:///Users/nad/ai4u/ai4UCheE/plans/261030-0945-all-12-interactive-charts-and-diagrams/phase-02-wb2-dippr-dual-envelope-and-carlson-flowchart.md)

## Context & Overview

In `WB3` ([`piping-pump-svg-sketch.tsx`](file:///Users/nad/ai4u/ai4UCheE/src/components/sketches/piping-pump-svg-sketch.tsx) and [`hydraulics-workbench.tsx`](file:///Users/nad/ai4u/ai4UCheE/src/components/workbenches/hydraulics-workbench.tsx)):
1. **Chart 7 (Process PFD Schematic `V-101` $\to$ `L-101` $\to$ `P-101` $\to$ `FCV-101`)**: The liquid level inside Suction Vessel `V-101` is hardcoded at `y1="95"` regardless of `zSuctionM`, clicking Pipe `L-101` does not change `npsInch`, and dragging Control Valve `FCV-101` does not adjust `valveDpPsi`.
2. **Chart 8 (Pump vs. System Head Curve + $\text{NPSH}_A(Q)$ vs. $\text{NPSH}_R$ + `70%/100%/120%` Operating Cases)**: Currently crammed into a `154x156` corner of `piping-pump-svg-sketch.tsx` with a hardcoded circle at `cx="84" cy="78"` and static curve paths that never move when `flowGpm`, `npsInch`, or `pSuctionPsig` change!

This phase:
- Extracts `src/lib/hydraulics-curve-svg-math.ts` (~85 LOC) and `src/components/sketches/pump-system-curve-svg.tsx` (~135 LOC) for **Chart 8**, plotting live parametric $H_{\text{pump}}(Q)$, $H_{\text{sys}}(Q)$, $\text{NPSH}_A(Q)$ vs. $\text{NPSH}_R$, `70%/100%/120%` operating dots, ISA-75.01 choked-flow warning, and a draggable `100%` duty-point handle (`data-testid="wb3-duty-point-handle"`) that scrubs `flowGpm`.
- Upgrades [`piping-pump-svg-sketch.tsx`](file:///Users/nad/ai4u/ai4UCheE/src/components/sketches/piping-pump-svg-sketch.tsx) (~142 LOC) for **Chart 7** with a draggable `V-101` liquid level handle (`data-testid="wb3-liquid-level-handle"`), clickable `L-101` NPS cycler (`data-testid="wb3-pipe-nps-trigger"`), and draggable `FCV-101` valve actuator (`data-testid="wb3-valve-dp-handle"`).

---

## Tasks

### Task 3.1: Create `src/lib/hydraulics-curve-svg-math.ts` (~85 LOC)

- **Goal**: Compute live parametric SVG polylines and inverse pointer mappings for `WB3` Charts 7 & 8 while preserving `psig` $\to$ `psia` (`+14.696 psia`) and Darcy $f_D = 4f_F$ rigor (`[Perry's 9th Ed., Eqs. 6-37..6-39, p. 6-11]`).
- **Target files and symbols**:
  - `src/lib/hydraulics-curve-svg-math.ts`:
    - `CYCLE_NPS_ORDER: readonly number[]` (`[2, 3, 4, 6]`)
    - `nextNpsInch(current: number): number`
    - `zSuctionMToSvgY(zM: number): number` and `svgYToZSuctionM(vy: number): number`
    - `valveDpPsiToSvgY(dpPsi: number): number` and `svgYToValveDpPsi(vy: number): number`
    - `buildHydraulicsCurveGeometry(params: { flowGpm: number; dInnerM: number; lengthM: number; zSuctionM: number; pSuctionPsig: number; npshrM: number })`
- **Steps**:
  1. Create `src/lib/hydraulics-curve-svg-math.ts` (~85 LOC).
  2. Implement `zSuctionMToSvgY` / `svgYToZSuctionM` mapping `zSuctionM ∈ [-5, 20]` m to vessel `V-101` liquid level `vy ∈ [152, 48]`.
  3. Implement `valveDpPsiToSvgY` / `svgYToValveDpPsi` mapping `valveDpPsi ∈ [2, 90]` psi to actuator stem `vy ∈ [112, 74]`.
  4. In `buildHydraulicsCurveGeometry`, generate SVG polyline strings across $Q \in [20, 600]\text{ gpm}$ (`plotX=44..296, plotY=22..148`):
     - `pumpHeadPoints`: $H_{\text{pump}}(Q) = H_0 - k_p Q^2$
     - `sysHeadPoints`: $H_{\text{sys}}(Q) = \max(0, -z_s) + h_f(Q, D_i, L)$ using Darcy $f_D = 4 f_F$
     - `npshaPoints`: $\text{NPSH}_A(Q)$ curve + horizontal $\text{NPSH}_R$ threshold line
     - Coordinates for the 3 operating markers: `case70` (`0.7 * flowGpm`), `case100` (`flowGpm`, draggable duty point), and `case120` (`1.2 * flowGpm`), plus `svgXToFlowGpm(vx)`.
- **Success criteria**:
  - `buildHydraulicsCurveGeometry` returns valid non-NaN SVG polyline strings and duty-point coordinates that shift dynamically with `flowGpm`, `dInnerM`, and `zSuctionM`.
  - File length is `< 110` LOC.
- **Verify**:
  ```bash
  npm run typecheck && test $(wc -l < src/lib/hydraulics-curve-svg-math.ts) -lt 200
  ```

### Task 3.2: Create Extracted Chart 8 Component (`src/components/sketches/pump-system-curve-svg.tsx`)

- **Goal**: Build a dedicated interactive SVG chart for **Chart 8** (`Pump vs. System Head Curve + NPSHa(Q) vs. NPSHr + 70%/100%/120% Markers`) with a draggable `100%` duty-point handle (`data-testid="wb3-duty-point-handle"`) that scrubs `flowGpm`.
- **Target files and symbols**:
  - `src/components/sketches/pump-system-curve-svg.tsx`:
    - `PumpSystemCurveSvgProps` interface
    - `PumpSystemCurveSvg` component (`data-testid="wb3-pump-system-curve-svg"`)
- **Steps**:
  1. Create `src/components/sketches/pump-system-curve-svg.tsx` (~135 LOC).
  2. Render `H_pump(Q)` (`stroke="var(--accent-secondary)"`), `H_sys(Q)` (`stroke="var(--accent-primary)"`), `NPSHa(Q)` (`stroke="var(--status-pass)"`), and the `NPSHr` cavitation threshold line (`stroke="var(--status-danger)"`).
  3. Render the `70% Min`, `100% Normal` (`data-testid="wb3-duty-point-handle"`), and `120% Rated` operating markers on `H_sys(Q)`.
  4. Attach pointer down/move/up scrubbing on the SVG plot area and `wb3-duty-point-handle` to call `onChangeFlowGpm?.(svgXToFlowGpm(vx))` and display `data-testid="wb3-curve-hover-tooltip"` showing $Q$, $H_{\text{sys}}$, $\text{NPSH}_A$ vs. $\text{NPSH}_R$, and ISA-75.01 valve choked status.
- **Success criteria**:
  - Dragging `data-testid="wb3-duty-point-handle"` or clicking the curve invokes `onChangeFlowGpm` with the corresponding flow rate in `gpm`.
  - File length is `< 155` LOC.
- **Verify**:
  ```bash
  npm run typecheck && test $(wc -l < src/components/sketches/pump-system-curve-svg.tsx) -lt 200
  ```

### Task 3.3: Upgrade Chart 7 (`piping-pump-svg-sketch.tsx`) & Wire Both Charts in `hydraulics-workbench.tsx`

- **Goal**: Make the `V-101` liquid level, `L-101` pipe NPS, and `FCV-101` valve actuator interactive in [`piping-pump-svg-sketch.tsx`](file:///Users/nad/ai4u/ai4UCheE/src/components/sketches/piping-pump-svg-sketch.tsx), mount `<PumpSystemCurveSvg />` alongside it, and wire all 4 bi-directional callbacks in [`hydraulics-workbench.tsx`](file:///Users/nad/ai4u/ai4UCheE/src/components/workbenches/hydraulics-workbench.tsx).
- **Target files and symbols**:
  - [`src/components/sketches/piping-pump-svg-sketch.tsx`](file:///Users/nad/ai4u/ai4UCheE/src/components/sketches/piping-pump-svg-sketch.tsx) (`PipingPumpSvgSketchProps`, `PipingPumpSvgSketch`)
  - [`src/components/workbenches/hydraulics-workbench.tsx`](file:///Users/nad/ai4u/ai4UCheE/src/components/workbenches/hydraulics-workbench.tsx) (`HydraulicsWorkbench`)
- **Steps**:
  1. Extend `PipingPumpSvgSketchProps` with optional `lengthM?: number`, `onChangeFlowGpm?: (nextGpm: number) => void`, `onChangeZSuctionM?: (nextZ: number) => void`, `onChangeNpsInch?: (nextNps: number) => void`, `onChangeValveDpPsi?: (nextDp: number) => void`, and `valveDpPsi?: number`.
  2. In [`piping-pump-svg-sketch.tsx`](file:///Users/nad/ai4u/ai4UCheE/src/components/sketches/piping-pump-svg-sketch.tsx):
     - Position the `V-101` liquid surface line dynamically at `y = zSuctionMToSvgY(zSuctionM)` and add draggable handle `data-testid="wb3-liquid-level-handle"` that scrubs `onChangeZSuctionM`.
     - Add `data-testid="wb3-pipe-nps-trigger"` on `L-101` that calls `onChangeNpsInch?.(nextNpsInch(npsInch))` on click.
     - Add draggable actuator handle `data-testid="wb3-valve-dp-handle"` on `FCV-101` that scrubs `onChangeValveDpPsi`.
     - Render `<PumpSystemCurveSvg />` in the right column of `.wb-split` inside `PipingPumpSvgSketch` (replacing the static inline `<g transform="translate(510, 22)">`).
  3. In [`hydraulics-workbench.tsx`](file:///Users/nad/ai4u/ai4UCheE/src/components/workbenches/hydraulics-workbench.tsx), pass `lengthM={lengthM}`, `valveDpPsi={valveDpPsi}`, `onChangeFlowGpm={setFlowGpm}`, `onChangeZSuctionM={setZSuctionM}`, `onChangeNpsInch={setNpsInch}`, and `onChangeValveDpPsi={setValveDpPsi}` to `<PipingPumpSvgSketch />`.
- **Success criteria**:
  - Dragging `wb3-liquid-level-handle`, clicking `wb3-pipe-nps-trigger`, dragging `wb3-valve-dp-handle`, and dragging `wb3-duty-point-handle` all update `HydraulicsWorkbench` state and the 3-case table live.
  - Both files remain strictly `< 200` LOC.
- **Verify**:
  ```bash
  npm run typecheck && npx vitest run && test $(wc -l < src/components/sketches/piping-pump-svg-sketch.tsx) -lt 200 && test $(wc -l < src/components/workbenches/hydraulics-workbench.tsx) -lt 200
  ```

---

## Failure Protocol

If any task verification command in Phase 03 fails, produces a TypeScript error, breaks an existing Vitest test, or exceeds the 200-LOC file cap:
1. **STOP** immediately — do not proceed to Phase 04 and do not weaken any test assertion or LOC gate.
2. Capture the failing command output, exact file/line reference, and root cause hypothesis.
3. Escalate to the `kongming` advisor subagent (`invoke_subagent` with `TypeName: "kongming"`) with the failure evidence before attempting an architectural workaround.
