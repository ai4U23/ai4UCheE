# Phase 02: `WB2` Dual-Curve DIPPR Phase Envelope & Interactive Carlson Decision Flowchart (Charts 5 & 6)

- **Parent Plan**: [`plan.md`](file:///Users/nad/ai4u/ai4UCheE/plans/261030-0945-all-12-interactive-charts-and-diagrams/plan.md)
- **Status**: Completed
- **Estimated Effort**: 3.5h
- **Depends On**: [`phase-01-shared-svg-drag-and-wb1-curves.md`](file:///Users/nad/ai4u/ai4UCheE/plans/261030-0945-all-12-interactive-charts-and-diagrams/phase-01-shared-svg-drag-and-wb1-curves.md)

## Context & Overview

In `WB2` ([`thermo-dippr-workbench.tsx`](file:///Users/nad/ai4u/ai4UCheE/src/components/workbenches/thermo-dippr-workbench.tsx)), there are two visual SVG diagrams:
1. **Chart 5 ([`dippr-phase-envelope-svg.tsx`](file:///Users/nad/ai4u/ai4UCheE/src/components/sketches/dippr-phase-envelope-svg.tsx))**: Currently plots only $P^{\text{sat}}(T)$ one-way; you cannot drag along the curve to scrub `tempK`, you cannot click the $1\text{ atm}$ Normal Boiling Point or Critical Point markers to snap `tempK`, and DIPPR Eq. 106 $\Delta H_{\text{vap}}(T_r)$ has no curve showing how latent heat vanishes at $T_c$.
2. **Chart 6 ([`carlson-advisor-card.tsx`](file:///Users/nad/ai4u/ai4UCheE/src/components/workbenches/carlson-advisor-card.tsx))**: Contains a decision-tree flowchart SVG (`Nonpolar / Polar` $\to$ `Single Liquid / 2 Liquid Phases` $\to$ `Selected Model`) and a bottom boiling curve, but clicking the SVG flowchart nodes or boiling curve currently does nothing.

This phase makes both **Chart 5** and **Chart 6** bi-directionally interactive while keeping every file `< 185` LOC.

---

## Tasks

### Task 2.1: Upgrade Chart 5 (`dippr-phase-envelope-svg.tsx`) with Dual $P^{\text{sat}}(T)$ / $\Delta H_{\text{vap}}(T_r)$ Curves, Pointer Scrubbing & Snap Markers

- **Goal**: Make [`src/components/sketches/dippr-phase-envelope-svg.tsx`](file:///Users/nad/ai4u/ai4UCheE/src/components/sketches/dippr-phase-envelope-svg.tsx) plot both DIPPR Eq. 101 $P^{\text{sat}}(T)$ and Eq. 106 $\Delta H_{\text{vap}}(T_r)$, scrub `tempK` when dragged or clicked, snap to $T_{\text{nbp}}$ ($1\text{ atm}$) or $T_c$ when landmark markers are clicked, and show a live hover tooltip.
- **Target files and symbols**:
  - [`src/components/sketches/dippr-phase-envelope-svg.tsx`](file:///Users/nad/ai4u/ai4UCheE/src/components/sketches/dippr-phase-envelope-svg.tsx):
    - `DipprPhaseEnvelopeSvgProps` (`compound`, `tempK`, `onChangeTempK?: (nextTempK: number) => void`)
    - `DipprPhaseEnvelopeSvg` component
- **Steps**:
  1. Add secondary curve polyline for DIPPR Eq. 106 $\Delta H_{\text{vap}}(T_r)$ (`dippr106(fluid, t)`) scaled to the plot height so students visually see $\Delta H_{\text{vap}} \to 0$ as $T \to T_c$ (`data-testid="dippr-hvap-curve"`).
  2. Use `clientPointToViewBox` from `src/lib/svg-drag-math.ts` on the SVG plot area and draggable handle (`data-testid="wb2-operating-handle"`) to invert horizontal pointer position `u` into $T = \text{clamp}(T_{\min} + u(T_c - 0.5 - T_{\min}), 270, T_c - 0.5)$ and invoke `onChangeTempK?.(Number(T.toFixed(2)))`.
  3. Compute the fluid's $1\text{ atm}$ ($101.325\text{ kPa} = 14.696\text{ psia} = 0.0\text{ psig}$) Normal Boiling Point $T_{\text{nbp}}$ via 20-step bisection on `dippr101(fluid, T) = 101325` (`373.15 K` for water, `351.44 K` for ethanol, `353.24 K` for benzene) and render clickable marker `data-testid="wb2-nbp-marker"` that calls `onChangeTempK?.(tNbp)`.
  4. Make the Critical Point marker (`data-testid="wb2-critical-marker"`) clickable to snap `tempK` to `Number((fluid.tcK - 0.5).toFixed(2))`.
  5. Render live hover readout `data-testid="wb2-hover-tooltip"` displaying $T\text{ (K / °C)}$, $P^{\text{sat}}\text{ (kPa / psia / psig)}$, and $\Delta H_{\text{vap}}\text{ (kJ/mol)}$.
- **Success criteria**:
  - Dragging `data-testid="wb2-operating-handle"` or clicking `data-testid="wb2-nbp-marker"` / `data-testid="wb2-critical-marker"` calls `onChangeTempK` with exact clamped temperatures.
  - File length of [`dippr-phase-envelope-svg.tsx`](file:///Users/nad/ai4u/ai4UCheE/src/components/sketches/dippr-phase-envelope-svg.tsx) is `< 170` LOC.
- **Verify**:
  ```bash
  npm run typecheck && test $(wc -l < src/components/sketches/dippr-phase-envelope-svg.tsx) -lt 200
  ```

### Task 2.2: Make Chart 6 (`carlson-advisor-card.tsx`) Decision Flowchart Nodes & Boiling Curve Interactive

- **Goal**: Make the SVG decision tree nodes and boiling curve inside [`src/components/workbenches/carlson-advisor-card.tsx`](file:///Users/nad/ai4u/ai4UCheE/src/components/workbenches/carlson-advisor-card.tsx) directly interactive, and wire [`thermo-dippr-workbench.tsx`](file:///Users/nad/ai4u/ai4UCheE/src/components/workbenches/thermo-dippr-workbench.tsx) to both Chart 5 and Chart 6.
- **Target files and symbols**:
  - [`src/components/workbenches/carlson-advisor-card.tsx`](file:///Users/nad/ai4u/ai4UCheE/src/components/workbenches/carlson-advisor-card.tsx) (`CarlsonAdvisorCardProps`, `CarlsonAdvisorCard`)
  - [`src/components/workbenches/thermo-dippr-workbench.tsx`](file:///Users/nad/ai4u/ai4UCheE/src/components/workbenches/thermo-dippr-workbench.tsx) (`ThermoDipprWorkbench`)
- **Steps**:
  1. Add optional `tempK?: number` and `onChangeTempK?: (nextTempK: number) => void` props to `CarlsonAdvisorCardProps`.
  2. In [`carlson-advisor-card.tsx`](file:///Users/nad/ai4u/ai4UCheE/src/components/workbenches/carlson-advisor-card.tsx), wrap the 3 SVG flowchart boxes in interactive `<g role="button" tabIndex={0}>` elements:
     - `data-testid="carlson-node-polarity"`: clicking toggles `polarity` between `'nonpolar'` and `'polar_non_electrolyte'` via `onPolarityChange`.
     - `data-testid="carlson-node-lle"`: clicking toggles `hasLle` via `onHasLleChange(!hasLle)`.
     - `data-testid="carlson-node-assoc"`: clicking the model/association node toggles `hasAssoc` via `onHasAssocChange(!hasAssoc)`.
  3. Make the bottom boiling curve (`data-testid="carlson-boiling-curve"`) scrubbable with pointer click/drag to update `onChangeTempK` (`[280, 500] K`) and position its operating dot dynamically from `tempK`.
  4. In [`thermo-dippr-workbench.tsx`](file:///Users/nad/ai4u/ai4UCheE/src/components/workbenches/thermo-dippr-workbench.tsx), pass `onChangeTempK={(nextK) => { setTempUnit('K'); setTempK(nextK); }}` to `<DipprPhaseEnvelopeSvg />` and `<CarlsonAdvisorCard />`.
- **Success criteria**:
  - Clicking `carlson-node-polarity`, `carlson-node-lle`, or `carlson-node-assoc` inside the SVG immediately updates `carlson-recommended`.
  - Dragging on `DipprPhaseEnvelopeSvg` or `carlson-boiling-curve` updates `dippr-vp-result` in `ThermoDipprWorkbench`.
  - Both files remain strictly `< 200` LOC.
- **Verify**:
  ```bash
  npm run typecheck && npx vitest run && test $(wc -l < src/components/workbenches/carlson-advisor-card.tsx) -lt 200 && test $(wc -l < src/components/workbenches/thermo-dippr-workbench.tsx) -lt 200
  ```

---

## Failure Protocol

If any task verification command in Phase 02 fails, produces a TypeScript error, breaks an existing Vitest test, or exceeds the 200-LOC file cap:
1. **STOP** immediately — do not proceed to Phase 03 and do not weaken any test assertion or LOC gate.
2. Capture the failing command output, exact file/line reference, and root cause hypothesis.
3. Escalate to the `kongming` advisor subagent (`invoke_subagent` with `TypeName: "kongming"`) with the failure evidence before attempting an architectural workaround.
