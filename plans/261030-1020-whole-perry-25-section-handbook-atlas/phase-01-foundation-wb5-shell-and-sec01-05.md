# Phase 01: `WB5` 25-Section Perry Atlas Shell, PDF Index (`pp. 2244–2274`) Explorer, Bi-Directional SVG Curve Engine & Cluster A (`Sec 1–5`) Solvers

- **Parent Plan**: [`plan.md`](file:///Users/nad/ai4u/ai4UCheE/plans/261030-1020-whole-perry-25-section-handbook-atlas/plan.md)
- **Mode**: Sequential Foundation (must complete before Parallel Tracks A/B/C in Phases 02–04)
- **Status**: Completed
- **Estimated Effort**: 5.5h

## Context & Overview

Phase 01 establishes the shared type contract (`perry-section-types.ts`), implements **Cluster A (`Sec 1–5`)** solvers (`sec-01-05-solvers.ts`), creates the universal bi-directional SVG chart component (`perry-section-interactive-svg.tsx`), adds the full-book PDF Index (`pp. 2244–2274`) & Section Explorer (`perry-atlas-pdf-explorer.tsx` + `GET /api/v1/pdf/sections`), and mounts the 5th workbench tab **`wb5-handbook-atlas` (`"WB5: 25-Section Perry Atlas"`)** in `HandbookAtlasWorkbench`.

---

## Tasks

### Task 1.1: Create Unified 25-Section Type Contract & SVG Curve Projection Helpers (`src/lib/perry-sections/perry-section-types.ts`)

- **Goal**: Define the canonical TypeScript interfaces for all 25 Perry sections so `HandbookAtlasWorkbench`, `PerrySectionInteractiveSvg`, Copilot, and Calc Sheets share a single strongly-typed contract.
- **Target files and symbols**:
  - `src/lib/perry-sections/perry-section-types.ts` (~98 LOC):
    - `PerrySectionNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24 | 25`
    - `PerryClusterId = 'cluster-a' | 'cluster-b' | 'cluster-c' | 'cluster-d' | 'cluster-e'`
    - `PerryParamSpec` (`key: string`, `label: string`, `symbol: string`, `unit: string`, `min: number`, `max: number`, `step: number`, `defaultVal: number`, `scale: 'linear' | 'log10'`)
    - `PerryCurvePoint` (`x: number`, `y: number`, `sx: number`, `sy: number`)
    - `PerrySectionSolverResult` (`secNum: PerrySectionNumber`, `secTitle: string`, `clusterId: PerryClusterId`, `secPage: string`, `pdfPage1Based: number`, `verifyToken: string`, `citation: string`, `primaryVal: number`, `secondaryVal: number`, `responseVal: number`, `responseUnit: string`, `secondaryResponseLabel: string`, `secondaryResponseVal: string`, `statusBanner: string`, `isAlert: boolean`, `curvePoints: PerryCurvePoint[]`, `secondaryCurvePoints?: PerryCurvePoint[]`, `secondaryCurveLabel?: string`, `operatingPoint: PerryCurvePoint`, `readoutText: string`, `learnCallout: { title: string; body: string }`, `deepDiveWorkbench?: 'wb2-thermo-dippr' | 'wb3-hydraulics' | 'wb4-distillation'`, `equations: WhiteBoxStageEquation[]`)
    - `PerrySectionDescriptor` (`secNum: PerrySectionNumber`, `secTitle: string`, `clusterId: PerryClusterId`, `secPage: string`, `pdfPage1Based: number`, `verifyToken: string`, `citation: string`, `xAxisLabel: string`, `yAxisLabel: string`, `primaryParam: PerryParamSpec`, `secondaryParam: PerryParamSpec`, `deepDiveWorkbench?: 'wb2-thermo-dippr' | 'wb3-hydraulics' | 'wb4-distillation'`, `solve: (primaryVal: number, secondaryVal: number) => PerrySectionSolverResult`, `inverseSvgDrag: (u: number, v: number) => { primaryVal: number; secondaryVal: number }`)
    - `buildSvgCurvePoints(xs: number[], ys: number[], xScale: 'linear' | 'log10', yScale: 'linear' | 'log10', yBounds?: [number, number]): PerryCurvePoint[]`
- **Steps**:
  1. Import `WhiteBoxStageEquation` from [`src/actions/view-screen.ts`](file:///Users/nad/ai4u/ai4UCheE/src/actions/view-screen.ts) and `clampDomainValue`, `inverseLinearMap`, `inverseLog10Map` from [`src/lib/svg-drag-math.ts`](file:///Users/nad/ai4u/ai4UCheE/src/lib/svg-drag-math.ts).
  2. Implement `buildSvgCurvePoints` projecting 25-point domain arrays onto `VIEW_BOX = { width: 520, height: 240, plotX: 56, plotY: 26, plotW: 432, plotH: 174 }`.
- **Success criteria**:
  - Compiles with zero TypeScript errors and stays strictly `< 110` LOC.
- **Verify**:
  ```bash
  npm run typecheck && test $(wc -l < src/lib/perry-sections/perry-section-types.ts) -lt 200
  ```

### Task 1.2: Implement Cluster A (`Sec 1–5`) Forward & Inverse SVG Solvers (`src/lib/perry-sections/sec-01-05-solvers.ts`)

- **Goal**: Build deterministic solvers, 3-stage white-box KaTeX equations, and inverse SVG pointer-drag mappings for `Sec 1` through `Sec 5`.
- **Target files and symbols**:
  - `src/lib/perry-sections/sec-01-05-solvers.ts` (~168 LOC):
    - `SEC_01_05_DESCRIPTORS: ReadonlyArray<PerrySectionDescriptor>`
- **Steps**:
  1. **Sec 1 (`1-4`, PDF p. 21, `tok="Conversion"`) — Unit Conversion Factors & Pressure Datum**:
     - Primary $x$: Gauge pressure $P_{\text{psig}} \in [-14.696, 500]\text{ psig}$ (`defaultVal: 100`); Secondary $\theta$: Barometric pressure $P_{\text{atm}} \in [10.0, 15.5]\text{ psia}$ (`defaultVal: 14.696`).
     - Governing law: $P_{\text{abs,psia}} = P_{\text{psig}} + P_{\text{atm,psia}}$, $P_{\text{abs,Pa}} = P_{\text{abs,psia}} \times 6894.757$, $\text{bar}_a = P_{\text{abs,Pa}}/10^5$.
     - Inverse drag: `primaryVal = clampDomainValue(inverseLinearMap(u, -14.696, 500), -14.696, 500, 0.5)`, `secondaryVal = clampDomainValue(inverseLinearMap(1 - v, 10.0, 15.5), 10.0, 15.5, 0.01)`.
     - Citation: `[Perry's 9th Ed., Sec. 1, Table 1-4, p. 1-4]`.
  2. **Sec 2 (`2-53`, PDF p. 88, `tok="TABLE 2-8"`, `deepDiveWorkbench: 'wb2-thermo-dippr'`) — Physical & Chemical Data (DIPPR Eq. 101 & 106)**:
     - Reuses `dippr101`, `dippr106`, `DIPPR_COMPOUNDS` from [`src/components/workbenches/thermo-solver-math.ts`](file:///Users/nad/ai4u/ai4UCheE/src/components/workbenches/thermo-solver-math.ts).
     - Primary $x$: $T \in [273.15, 647.0]\text{ K}$ (`defaultVal: 373.15`); Secondary $\theta$: Vessel gauge pressure $P_{\text{sys,psig}} \in [-14.0, 300.0]\text{ psig}$ (`defaultVal: 0.0`).
     - Explicitly reports $P^{\text{sat}}$ in $\text{Pa}$, $\text{psia}$, and $\text{psig}$ (`psia - 14.6959`) plus $\Delta H_{\text{vap}}$.
     - Citation: `[Perry's 9th Ed., Sec. 2, Table 2-8, p. 2-53]`.
  3. **Sec 3 (`3-37`, PDF p. 434, `tok="Newton"`) — Mathematics (Damped Newton-Raphson & Simpson Quadrature)**:
     - Primary $x$: Initial guess $x_0 \in [0.2, 4.0]$ (`defaultVal: 2.5`); Secondary $\theta$: Damping factor $\omega \in [0.2, 1.8]$ (`defaultVal: 1.0`).
     - Evaluates damped Newton iteration $x_{k+1} = x_k - \omega f(x_k)/\max(|f'(x_k)|, 10^{-9})$ on cubic $f(x) = x^3 - 3x - 2 = 0$ ($x^* = 2.0$) and 1/3 Simpson integral.
     - Citation: `[Perry's 9th Ed., Sec. 3, p. 3-37]`.
  4. **Sec 4 (`4-11`, PDF p. 484, `tok="Peng"`, `deepDiveWorkbench: 'wb2-thermo-dippr'`) — Thermodynamics (Peng-Robinson EOS $Z(P_r, T_r)$ & Fugacity)**:
     - Primary $x$: Reduced pressure $P_r \in [0.05, 6.00]$ (`defaultVal: 1.20`); Secondary $\theta$: Reduced temperature $T_r \in [0.55, 2.00]$ (`defaultVal: 1.15`).
     - Solves Peng-Robinson cubic for real-gas compressibility $Z$ and fugacity coefficient $\ln\hat{\phi}$ with explicit `psig -> psia` note ($P_r = (P_{\text{psig}}+14.696)/P_{c,\text{psia}}$).
     - Citation: `[Perry's 9th Ed., Sec. 4, Eq. 4-25, p. 4-11]`.
  5. **Sec 5 (`5-3`, PDF p. 512, `tok="Nusselt"`) — Heat & Mass Transfer (Dittus-Boelter $\text{Nu}$ & Gilliland $\text{Sh}$)**:
     - Primary $x$: Reynolds number $\text{Re} \in [2500, 10^6]$ (`defaultVal: 50000`, `scale: 'log10'`); Secondary $\theta$: Prandtl number $\text{Pr} \in [0.7, 160.0]$ (`defaultVal: 4.5`).
     - Evaluates $\text{Nu} = 0.023\,\text{Re}^{0.8}\,\text{Pr}^{0.4}$, film coefficient $h = \text{Nu}\cdot k/D$, and Chilton-Colburn mass-transfer $\text{Sh}$.
     - Citation: `[Perry's 9th Ed., Sec. 5, Eq. 5-44, p. 5-3]`.
- **Success criteria**:
  - All 5 descriptors return non-empty `curvePoints`, valid `operatingPoint`, 3-stage `equations`, and stay `< 200` LOC.
- **Verify**:
  ```bash
  npm run typecheck && test $(wc -l < src/lib/perry-sections/sec-01-05-solvers.ts) -lt 200
  ```

### Task 1.3: Create Universal Bi-Directional Section SVG Component (`src/components/sketches/perry-section-interactive-svg.tsx`)

- **Goal**: Build a reusable, tactile SVG chart canvas for any of the 25 Perry sections supporting pointer down/move/up scrubbing, primary + optional secondary curve rendering (`f_D = 4f_F` in Sec 6, Carnot bound in Sec 24), alert zone badge, and hover readout pill.
- **Target files and symbols**:
  - `src/components/sketches/perry-section-interactive-svg.tsx` (~162 LOC):
    - `PerrySectionInteractiveSvg` (`descriptor: PerrySectionDescriptor`, `result: PerrySectionSolverResult`, `onScrubParameters: (primaryVal: number, secondaryVal: number) => void`)
- **Steps**:
  1. Render `<svg viewBox="0 0 520 240" data-testid={`perry-sec-${descriptor.secNum}-svg`}>` with gridlines, primary curve path (`data-testid="perry-sec-primary-curve"`), optional dashed secondary curve path (`data-testid="perry-sec-secondary-curve"`), draggable operating handle `<circle data-testid="perry-sec-drag-handle">` (also aliased with `data-testid={`perry-sec-${descriptor.secNum}-handle`}`), and readout pill (`data-testid="perry-sec-hover-readout"`).
  2. Wire `onPointerDown`, `onPointerMove`, and `onPointerUp` using `clientPointToViewBox` and `safeSetPointerCapture` from [`src/lib/svg-drag-math.ts`](file:///Users/nad/ai4u/ai4UCheE/src/lib/svg-drag-math.ts) to call `descriptor.inverseSvgDrag(pt.u, pt.v)` and invoke `onScrubParameters(next.primaryVal, next.secondaryVal)`.
- **Success criteria**:
  - Dragging or clicking anywhere on the SVG canvas updates `primaryVal` and `secondaryVal` in real time in both browser and JSDOM (`fireEvent.pointerDown`).
- **Verify**:
  ```bash
  npm run typecheck && test $(wc -l < src/components/sketches/perry-section-interactive-svg.tsx) -lt 200
  ```

### Task 1.4: Add FastAPI `GET /api/v1/pdf/sections` & Full-Book PDF Index (`pp. 2244–2274`) Explorer (`src/components/workbenches/perry-atlas-pdf-explorer.tsx`)

- **Goal**: Expose the 25-section PDF offset table + Index metadata from [`services/perry-engine/routers/pdf_router.py`](file:///Users/nad/ai4u/ai4UCheE/services/perry-engine/routers/pdf_router.py) and build the interactive PDF Index (`pp. 2244–2274`) search, `Sec-Page` resolver, and live page crop viewer inside `WB5`.
- **Target files and symbols**:
  - [`services/perry-engine/routers/pdf_router.py`](file:///Users/nad/ai4u/ai4UCheE/services/perry-engine/routers/pdf_router.py) (`132 -> ~156` LOC): add `@router.get("/sections")` returning `SECTION_TITLES`, 1-based PDF start/end pages from `build_or_load_section_offsets()`, and `index_pdf_range: [2244, 2274]`.
  - [`src/actions/search-perry-pdf.ts`](file:///Users/nad/ai4u/ai4UCheE/src/actions/search-perry-pdf.ts) (`130 -> ~154` LOC): add `listPerrySectionsAction` with offline fallback table for all 25 sections (`18..2243`) and Index (`2244..2274`).
  - `src/components/workbenches/perry-atlas-pdf-explorer.tsx` (~155 LOC):
    - `PerryAtlasPdfExplorer` (`activeSecNum`, `activeSecPage`, `onSelectSecPage: (secNum: number, secPage: string) => void`)
    - Renders Back-of-Book Index search input (`data-testid="perry-index-search-input"`), search button (`data-testid="perry-index-search-btn"`), clickable `Sec-Page` reference chips (`data-testid={`index-ref-chip-${ref}`}`), and live high-DPI PDF page crop button (`data-testid="perry-atlas-crop-btn"`) calling `cropPerryPageAction`.
- **Success criteria**:
  - Searching `"NPSH"`, `"LMTD"`, `"Kremser"`, `"Langmuir"`, or `"relief"` in the Index search bar returns clickable `S-P` chips that jump directly to Section `S` and load its `S-P` page crop.
- **Verify**:
  ```bash
  npm run typecheck && test $(wc -l < services/perry-engine/routers/pdf_router.py) -lt 200 && test $(wc -l < src/actions/search-perry-pdf.ts) -lt 200 && test $(wc -l < src/components/workbenches/perry-atlas-pdf-explorer.tsx) -lt 200
  ```

### Task 1.5: Create `HandbookAtlasWorkbench` (`wb5-handbook-atlas`) & Wire into App Shell (`src/components/workbenches/handbook-atlas-workbench.tsx`)

- **Goal**: Build the 25-Section Perry Atlas workbench (`wb5-handbook-atlas`) and register it as the 5th workbench tab in `AppShell`, `App.tsx`, `persona-theme-context.tsx`, `view-screen.ts`, and `render-inline-extension.tsx`.
- **Target files and symbols**:
  - `src/components/workbenches/handbook-atlas-workbench.tsx` (~182 LOC):
    - 5 Cluster filter pills (`Cluster A: Sec 1–5`, `Cluster B: Sec 6–10`, `Cluster C: Sec 11–15`, `Cluster D: Sec 16–20`, `Cluster E: Sec 21–25`, plus `All 25 Sections`), 25 Section selector pills (`data-testid={`atlas-sec-pill-${secNum}`}`), Quick Trap Preset buttons (`data-testid="atlas-trap-sec11-ft"`, `data-testid="atlas-trap-sec19-runaway"`, `data-testid="atlas-trap-sec23-psv"`), dual parameter sliders/inputs (`data-testid="atlas-primary-input"`, `data-testid="atlas-secondary-input"`), `PerrySectionInteractiveSvg`, `WhiteBoxEquationProof`, Cross-Workbench Deep-Dive button (`data-testid="atlas-deep-dive-btn"`), and `PerryAtlasPdfExplorer`.
    - Subscribes to `useWorkbenchMutations('wb5-handbook-atlas', ...)` (`secNum`, `primaryVal`, `secondaryVal`, `secPage`) and syncs live state via `syncWorkbenchPayload('wb5-handbook-atlas', ...)`.
  - [`src/context/persona-theme-context.tsx`](file:///Users/nad/ai4u/ai4UCheE/src/context/persona-theme-context.tsx) (`107 -> ~109` LOC): add `| 'wb5-handbook-atlas'` to `WorkbenchId`.
  - [`src/actions/view-screen.ts`](file:///Users/nad/ai4u/ai4UCheE/src/actions/view-screen.ts) (`167 -> ~169` LOC): add `| 'wb5-handbook-atlas'` to `WorkbenchId`.
  - [`src/components/shell/app-shell.tsx`](file:///Users/nad/ai4u/ai4UCheE/src/components/shell/app-shell.tsx) (`147 -> ~154` LOC): add `{ id: 'wb5-handbook-atlas', shortCode: 'WB5', title: '25-Section Perry Atlas', subtitle: 'Sec 1–25 Solvers & Index (pp. 2244–2274)' }` to `WORKBENCH_TABS`.
  - [`src/App.tsx`](file:///Users/nad/ai4u/ai4UCheE/src/App.tsx) (`71 -> ~76` LOC): render `<HandbookAtlasWorkbench />` on `case 'wb5-handbook-atlas'`.
  - [`src/components/gen-ui/render-inline-extension.tsx`](file:///Users/nad/ai4u/ai4UCheE/src/components/gen-ui/render-inline-extension.tsx) (`168 -> ~174` LOC): add `else if (activeWb === 'wb5-handbook-atlas')` in `OperatingWindowSparkline` so scrubbing Chart 12 while on `WB5` dispatches `primaryVal` mutations to `wb5-handbook-atlas`.
- **Success criteria**:
  - Clicking `tab-wb5-handbook-atlas` renders `WB5: 25-Section Perry Atlas` with Cluster A (`Sec 1–5`) live immediately (and gracefully merges Clusters B–E as Phases 02–05 register them).
  - All 28 existing Vitest tests remain 100% passing.
- **Verify**:
  ```bash
  npm run typecheck && npx vitest run && test $(wc -l < src/components/workbenches/handbook-atlas-workbench.tsx) -lt 200
  ```

---

## Failure Protocol

If any task verification command in Phase 01 fails, introduces a TypeScript/Python error, breaks any of the 28 existing tests, or exceeds `< 200` LOC:
1. **STOP** immediately — do not proceed to Phases 02–04 and do not weaken any test assertion or `< 200` LOC gate.
2. Capture the failing command output, exact file/line reference, and root cause hypothesis.
3. Escalate to the `kongming` advisor subagent (`invoke_subagent` with `TypeName: "kongming"`) with the failure evidence before attempting an architectural workaround.
