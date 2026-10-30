# Phase 01: Shared SVG Pointer Math & `WB1` Calibrated Perry Curves + 2D Crosshair (Charts 1–4)

- **Parent Plan**: [`plan.md`](file:///Users/nad/ai4u/ai4UCheE/plans/261030-0945-all-12-interactive-charts-and-diagrams/plan.md)
- **Status**: Completed
- **Estimated Effort**: 3.5h

## Context & Overview

In `WB1` ([`perry-figure-svg-preview.tsx`](file:///Users/nad/ai4u/ai4UCheE/src/components/workbenches/perry-figure-svg-preview.tsx) and [`visual-verifier-workbench.tsx`](file:///Users/nad/ai4u/ai4UCheE/src/components/workbenches/visual-verifier-workbench.tsx)), all **4 preset Perry charts** (`6-10` Fig. 6-9 Moody Fanning $f_F$ vs. $\text{Re}$, `14-37` Fig. 14-32 Fair Entrainment Flooding $C_{sb}$ vs. $F_{LV}$, `14-57` Fig. 14-55 Eckert GPDC Packing Flooding $Y_{\text{flood}}$ vs. $F_{LV}$, and `2-53` Table 2-8 DIPPR Vapor Pressure $P_{\text{vp}}$ vs. $T$) currently render a static marker at `(260, 130)` (`50%, 50%`), and the 2D overlay crosshair (`wb-crosshair-svg`) is frozen at `{ xPct: 50, yPct: 49.8 }`.

This phase creates:
1. `src/lib/svg-drag-math.ts` (~75 LOC) providing JSDOM-safe `clientPointToViewBox`, `[0, 100]` percentage projection, linear/log10 inverse mappers, and safe `setPointerCapture` drag lifecycle helpers used across all 12 charts.
2. `src/lib/perry-figure-curve-sampler.ts` (~85 LOC) implementing forward/inverse curve evaluators for all 4 Perry charts (`6-10`, `14-37`, `14-57`, `2-53`).
3. Interactive upgrades to [`perry-figure-svg-preview.tsx`](file:///Users/nad/ai4u/ai4UCheE/src/components/workbenches/perry-figure-svg-preview.tsx) (~155 LOC) and [`visual-verifier-workbench.tsx`](file:///Users/nad/ai4u/ai4UCheE/src/components/workbenches/visual-verifier-workbench.tsx) (~178 LOC) so clicking or dragging across any of Charts 1–4 or the 2D crosshair overlay moves the crosshair dynamically, evaluates the calibrated curve, auto-populates `userReading`, and displays `data-testid="wb1-hover-readout"`.

---

## Tasks

### Task 1.1: Create Shared SVG Pointer & Inverse Coordinate Helper (`src/lib/svg-drag-math.ts`)

- **Goal**: Build a zero-dependency, JSDOM-compatible SVG coordinate projection and pointer-capture module shared by all 12 charts.
- **Target files and symbols**:
  - `src/lib/svg-drag-math.ts`:
    - `ViewBoxRect` interface (`width`, `height`, `plotX`, `plotY`, `plotW`, `plotH`)
    - `clientPointToViewBox(e: { clientX: number; clientY: number }, svgEl: SVGElement | null, viewBox: ViewBoxRect)`
    - `clampDomainValue(val: number, min: number, max: number, step?: number): number`
    - `inverseLinearMap(t: number, min: number, max: number): number`
    - `inverseLog10Map(t: number, min: number, max: number): number`
    - `safeSetPointerCapture(el: Element | null, pointerId?: number): void`
- **Steps**:
  1. Create `src/lib/svg-drag-math.ts` (~75 LOC).
  2. In `clientPointToViewBox`, read `svgEl?.getBoundingClientRect()`. When `rect.width > 0 && rect.height > 0`, scale `(clientX - rect.left) / rect.width * viewBox.width`; when `rect.width === 0` (standard in Vitest/JSDOM), treat `clientX` and `clientY` directly as `viewBox` user coordinates so unit tests can pass exact SVG coordinates in `fireEvent.pointerMove`.
  3. Compute normalized plot fractions `u = clamp((vx - plotX) / plotW, 0, 1)` and `v = clamp((vy - plotY) / plotH, 0, 1)` plus `xPct = u * 100` and `yPct = v * 100`.
  4. Wrap `el.setPointerCapture?.(pointerId)` in a `try/catch` inside `safeSetPointerCapture`.
- **Success criteria**:
  - `clientPointToViewBox` returns finite, clamped `(vx, vy, u, v, xPct, yPct)` in both browser and JSDOM environments.
  - `src/lib/svg-drag-math.ts` is strictly `< 200` LOC.
- **Verify**:
  ```bash
  npm run typecheck && test $(wc -l < src/lib/svg-drag-math.ts) -lt 200
  ```

### Task 1.2: Create Perry Figure Curve Sampler (`src/lib/perry-figure-curve-sampler.ts`) for Charts 1–4

- **Goal**: Provide analytical forward/inverse curve evaluators and citation-rich hover readouts for all 4 `WB1` Perry charts (`6-10`, `14-37`, `14-57`, `2-53`).
- **Target files and symbols**:
  - `src/lib/perry-figure-curve-sampler.ts`:
    - `PerryCurveSampleResult` interface (`secPage`, `xDomain`, `yCurve`, `yCursor`, `yCurvePct`, `readoutText`, `citation`)
    - `samplePerryCurveAtPct(secPage: string, xPct: number, yPct: number): PerryCurveSampleResult`
- **Steps**:
  1. Create `src/lib/perry-figure-curve-sampler.ts` (~85 LOC).
  2. Implement the 4 calibrated curve laws over `u = clamp(xPct / 100, 0, 1)`:
     - **`6-10` (Chart 1 — Perry Fig. 6-9 Moody Fanning Friction)**: $\text{Re} = 10^{3 + 4u}$, evaluate turbulent Colebrook-White / Churchill Fanning $f_F(\text{Re})$ and Darcy $f_D = 4 f_F$, formatting readout with both $f_F$ and $f_D = 4f_F$ (`[Perry's 9th Ed., Fig. 6-9, p. 6-10]`).
     - **`14-37` (Chart 2 — Perry Fig. 14-32 Fair Entrainment Flooding)**: $F_{LV} = 10^{-2 + 2u}$, evaluate Fair capacity parameter $C_{sb}(F_{LV})$ (`[Perry's 9th Ed., Fig. 14-32, p. 14-37]`).
     - **`14-57` (Chart 3 — Perry Fig. 14-55 Eckert GPDC Packing Flooding)**: $F_{LV} = 10^{-2 + 2u}$, evaluate flood ordinate $Y_{\text{flood}}(F_{LV})$ (`[Perry's 9th Ed., Fig. 14-55, p. 14-57]`).
     - **`2-53` (Chart 4 — Perry Table 2-8 DIPPR Water Vapor Pressure)**: $T = 273.15 + 200u\text{ K}$, evaluate DIPPR Eq. 101 $P_{\text{vp}}(T)$ in $\text{Pa}$, $\text{psia}$, and $\text{psig}$ (`[Perry's 9th Ed., Table 2-8, p. 2-53]`).
  3. Map the cursor's vertical position `yPct` to `yCursor` so dragging vertically lets the student test off-curve readings (including triggering the $4\times$ Fanning/Darcy trap on `6-10`), while double-clicking or clicking the curve snaps `yCursor` to `yCurve`.
- **Success criteria**:
  - At `xPct = 50` on `6-10`, `samplePerryCurveAtPct('6-10', 50, 50)` returns $\text{Re} = 10^5$, $f_F \approx 0.0045$, $f_D \approx 0.0180$.
  - File length is `< 110` LOC.
- **Verify**:
  ```bash
  npm run typecheck && test $(wc -l < src/lib/perry-figure-curve-sampler.ts) -lt 200
  ```

### Task 1.3: Wire Bi-Directional Scrubbing & Hover Readout in `perry-figure-svg-preview.tsx` & `visual-verifier-workbench.tsx`

- **Goal**: Make all 4 charts in [`perry-figure-svg-preview.tsx`](file:///Users/nad/ai4u/ai4UCheE/src/components/workbenches/perry-figure-svg-preview.tsx) and the 2D crosshair overlay in [`visual-verifier-workbench.tsx`](file:///Users/nad/ai4u/ai4UCheE/src/components/workbenches/visual-verifier-workbench.tsx) interactive on pointer click, drag, and hover.
- **Target files and symbols**:
  - [`src/components/workbenches/perry-figure-svg-preview.tsx`](file:///Users/nad/ai4u/ai4UCheE/src/components/workbenches/perry-figure-svg-preview.tsx) (`PerryFigureSvgPreviewProps`, `PerryFigureSvgPreview`)
  - [`src/components/workbenches/visual-verifier-workbench.tsx`](file:///Users/nad/ai4u/ai4UCheE/src/components/workbenches/visual-verifier-workbench.tsx) (`VisualVerifierWorkbench`)
- **Steps**:
  1. Extend `PerryFigureSvgPreviewProps` with optional `crosshair?: { xPct: number; yPct: number }` and `onScrubCrosshair?: (sample: PerryCurveSampleResult, nextCrosshair: { xPct: number; yPct: number }) => void`.
  2. Replace the hardcoded `<circle cx="260" cy="130" />` in [`perry-figure-svg-preview.tsx`](file:///Users/nad/ai4u/ai4UCheE/src/components/workbenches/perry-figure-svg-preview.tsx) with dynamic coordinates computed from `crosshair` (`cx = 55 + (xPct / 100) * 425`, `cy = 28 + (yPct / 100) * 192`) and add `data-testid="wb1-crosshair-handle"`.
  3. Add pointer down/move/up handlers on `<svg data-testid="perry-svg-interactive-surface">` and on the overlay `<svg className="wb-crosshair-svg" data-testid="calibrated-crosshair">` in [`visual-verifier-workbench.tsx`](file:///Users/nad/ai4u/ai4UCheE/src/components/workbenches/visual-verifier-workbench.tsx) so dragging updates `crosshair`, updates `exactValue` (`sample.yCurve`), and auto-populates `userReading` (`String(sample.yCursor)`).
  4. Render live readout badge `data-testid="wb1-hover-readout"` inside `PerryFigureSvgPreview` displaying `sample.readoutText`.
- **Success criteria**:
  - Dragging or clicking on `perry-svg-interactive-surface` or `calibrated-crosshair` moves the crosshair, updates `userReading` in `VisualVerifierWorkbench`, and renders `data-testid="wb1-hover-readout"`.
  - Both files remain strictly `< 200` LOC and all existing tests pass.
- **Verify**:
  ```bash
  npm run typecheck && npx vitest run && test $(wc -l < src/components/workbenches/perry-figure-svg-preview.tsx) -lt 200 && test $(wc -l < src/components/workbenches/visual-verifier-workbench.tsx) -lt 200
  ```

---

## Failure Protocol

If any task verification command in Phase 01 fails, produces a TypeScript error, breaks an existing Vitest test, or exceeds the 200-LOC file cap:
1. **STOP** immediately — do not proceed to Phase 02 and do not weaken any test assertion or LOC gate.
2. Capture the failing command output, exact file/line reference, and root cause hypothesis.
3. Escalate to the `kongming` advisor subagent (`invoke_subagent` with `TypeName: "kongming"`) with the failure evidence before attempting an architectural workaround.
