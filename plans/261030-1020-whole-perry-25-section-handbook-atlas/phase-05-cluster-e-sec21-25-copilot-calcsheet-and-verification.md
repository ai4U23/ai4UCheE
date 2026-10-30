# Phase 05: Cluster E (`Sec 21–25`), 25-Section Master Registry, Copilot What-If Router, Guided Trap Presets, QA/QC Calc Sheet & Full 25-Section E2E Suite

- **Parent Plan**: [`plan.md`](file:///Users/nad/ai4u/ai4UCheE/plans/261030-1020-whole-perry-25-section-handbook-atlas/plan.md)
- **Mode**: Sequential Join (runs after Phases 01, 02, 03, and 04 complete)
- **Status**: Completed
- **Estimated Effort**: 5.0h

## Context & Overview

Phase 05 implements **Cluster E (`Sec 21` through `Sec 25`)** in `src/lib/perry-sections/sec-21-25-solvers.ts`, joins all 5 clusters (`Sec 1`–`Sec 25`) into `src/lib/perry-sections/perry-atlas-registry.ts`, wires the **25-Section AI Copilot What-If Router** (`src/lib/perry-sections/perry-atlas-copilot-router.ts` + hooks in [`copilot-scenario-parser.ts`](file:///Users/nad/ai4u/ai4UCheE/src/actions/copilot-scenario-parser.ts) and [`copilot-responder.ts`](file:///Users/nad/ai4u/ai4UCheE/src/actions/copilot-responder.ts)), extends Senior EPC QA/QC Calc Sheet generation (`buildCalcSheetFromLiveState` in [`calc-sheet-builder.ts`](file:///Users/nad/ai4u/ai4UCheE/src/components/workbenches/calc-sheet-builder.ts)) to format any active section `Sec 1`–`Sec 25`, and verifies the entire 25-section expansion with `src/__tests__/phase11-whole-perry-handbook.test.tsx` + `./docs/` synchronization.

---

## Tasks

### Task 5.1: Implement Cluster E (`Sec 21–25`) Forward & Inverse SVG Solvers (`src/lib/perry-sections/sec-21-25-solvers.ts`)

- **Goal**: Build deterministic forward curve evaluators, 3-stage white-box KaTeX equations, and inverse SVG drag mappings for `Sec 21` through `Sec 25`.
- **Target files and symbols**:
  - `src/lib/perry-sections/sec-21-25-solvers.ts` (~176 LOC):
    - `SEC_21_25_DESCRIPTORS: ReadonlyArray<PerrySectionDescriptor>`
- **Steps**:
  1. **Sec 21 (`21-34`, PDF p. 1885, `tok="FIG. 21-76"`) — Solids Processing & Particle Technology (Bond Work Index Comminution)**:
     - Primary $x$: Product 80%-passing size $d_{80,P} \in [25, 2000]\text{ }\mu\text{m}$ (`defaultVal: 250`, `scale: 'log10'`); Secondary $\theta$: Bond Work Index $W_i \in [5.0, 25.0]\text{ kWh/t}$ (`defaultVal: 13.5`).
     - Computes specific grinding energy $E = 10\,W_i\!\left(\frac{1}{\sqrt{d_{80,P}}} - \frac{1}{\sqrt{d_{80,F}}}\right)$ ($d_{80,F} = 5000\text{ }\mu\text{m}$) and mill motor power.
     - Citation: `[Perry's 9th Ed., Sec. 21, Fig. 21-76, p. 21-34]`.
  2. **Sec 22 (`22-3`, PDF p. 1964, `tok="BOD"`) — Waste Management (Streeter-Phelps Dissolved Oxygen Sag & Activated Sludge BOD)**:
     - Primary $x$: River travel time $t \in [0.2, 15.0]\text{ d}$ (`defaultVal: 3.5`); Secondary $\theta$: Ultimate BOD load $L_0 \in [20, 400]\text{ mg/L}$ (`defaultVal: 120`).
     - Computes oxygen deficit $D_{\text{ox}}(t) = \frac{k_1 L_0}{k_2-k_1}(e^{-k_1 t}-e^{-k_2 t}) + D_0 e^{-k_2 t}$, dissolved oxygen $\text{DO}(t) = \text{DO}_{\text{sat}} - D_{\text{ox}}(t)$, and flags hypoxia alert (`isAlert: true`) when $\text{DO}(t) < 4.0\text{ mg/L}$.
     - Citation: `[Perry's 9th Ed., Sec. 22, p. 22-3]`.
  3. **Sec 23 (`23-30`, PDF p. 2085, `tok="relief"`) — Process Safety (API 520 Relief Valve Sizing with `psig -> psia` & Le Chatelier LFL)**:
     - Primary $x$: PSV set gauge pressure $P_{\text{set,psig}} \in [15, 1000]\text{ psig}$ (`defaultVal: 150`); Secondary $\theta$: Required relief mass rate $W \in [500, 50000]\text{ kg/h}$ (`defaultVal: 8500`).
     - **Mandatory `AGENTS.md` #5 Invariant**: Converts gauge set pressure to absolute relieving pressure with 10% accumulation:
       $$P_{1,\text{psia}} = 1.10\,P_{\text{set,psig}} + 14.6959\text{ psia}$$
     - Computes required API 520 orifice area $A_{\text{orifice}}$ ($\text{in}^2$ and $\text{cm}^2$), selects standard API letter orifice (`D` through `T`), and reports the % undersizing error if `psig` were mistakenly used instead of `psia`.
     - Citation: `[Perry's 9th Ed., Sec. 23, p. 23-30]`.
  4. **Sec 24 (`24-21`, PDF p. 2162, `tok="Rankine"`) — Energy Resources, Conversion & Utilization (Carnot Bound, Rankine Cycle & Exergy)**:
     - Primary $x$: Hot source temperature $T_H \in [450, 900]\text{ K}$ (`defaultVal: 650`); Secondary $\theta$: Second-law exergetic efficiency $\eta_{\text{II}} \in [0.45, 0.90]$ (`defaultVal: 0.72`).
     - Computes Carnot limit $\eta_{\text{Carnot}} = 1 - T_C/T_H$ ($T_C = 303.15\text{ K}$, plotted as dashed secondary curve), actual thermal efficiency $\eta_{\text{th}} = \eta_{\text{II}}\eta_{\text{Carnot}}$, and specific exergy destruction $I = T_0 S_{\text{gen}}$.
     - Citation: `[Perry's 9th Ed., Sec. 24, p. 24-21]`.
  5. **Sec 25 (`25-3`, PDF p. 2206, `tok="corrosion"`) — Materials of Construction (Faraday/Fontana Corrosion Rate `mpy` & Alloy PREN)**:
     - Primary $x$: Operating temperature $T_{\text{op}} \in [20, 180]\text{ }^\circ\text{C}$ (`defaultVal: 85`); Secondary $\theta$: Alloy Pitting Resistance Equivalent Number $\text{PREN} \in [18, 48]$ (`defaultVal: 25`, e.g., 316L SS $\approx 25$, Duplex 2205 $\approx 35$, Hastelloy C-276 $\approx 45$).
     - Computes corrosion rate $\text{CR}_{\text{mpy}}$ ($\text{mils/yr}$) and $\text{CR}_{\text{mm/yr}} = \text{CR}_{\text{mpy}} / 39.37$, flagging material failure (`isAlert: true`) when $\text{CR}_{\text{mpy}} > 5.0\text{ mpy}$ ($0.125\text{ mm/yr}$).
     - Citation: `[Perry's 9th Ed., Sec. 25, p. 25-3]`.
- **Success criteria**:
  - `SEC_21_25_DESCRIPTORS` exports all 5 descriptors (`Sec 21`..`Sec 25`) with zero TypeScript errors and `< 200` LOC.
- **Verify**:
  ```bash
  npm run typecheck && test $(wc -l < src/lib/perry-sections/sec-21-25-solvers.ts) -lt 200
  ```

### Task 5.2: Assemble 25-Section Master Registry & Calc-Sheet Formatter (`src/lib/perry-sections/perry-atlas-registry.ts`)

- **Goal**: Join all 5 cluster arrays (`SEC_01_05_DESCRIPTORS` .. `SEC_21_25_DESCRIPTORS`) into a single 25-section registry and provide the QA/QC Calc Sheet row builder for `wb5-handbook-atlas`.
- **Target files and symbols**:
  - `src/lib/perry-sections/perry-atlas-registry.ts` (~145 LOC):
    - `ALL_25_PERRY_SECTIONS: ReadonlyArray<PerrySectionDescriptor>` (length `25`, ordered `Sec 1`..`Sec 25`)
    - `PERRY_CLUSTERS: ReadonlyArray<{ id: PerryClusterId; label: string; secRange: [number, number] }>`
    - `getPerrySectionByNumber(secNum: number): PerrySectionDescriptor`
    - `buildAtlasCalcSheetSection(livePayload?: WorkbenchScreenPayload): { docNoSuffix: string; title: string; section: string; service: string; inputs: CalcSheetInputRow[]; equations: WhiteBoxStageEquation[]; conclusion: string }`
  - [`src/components/workbenches/calc-sheet-builder.ts`](file:///Users/nad/ai4u/ai4UCheE/src/components/workbenches/calc-sheet-builder.ts) (`172 -> ~176` LOC): delegate `activeWorkbench === 'wb5-handbook-atlas'` to `buildAtlasCalcSheetSection(livePayload)`.
- **Success criteria**:
  - `ALL_25_PERRY_SECTIONS.length === 25`, every section `1..25` resolves deterministically, and `buildCalcSheetFromLiveState` generates a complete QA/QC sheet for any active `WB5` section.
- **Verify**:
  ```bash
  npm run typecheck && test $(wc -l < src/lib/perry-sections/perry-atlas-registry.ts) -lt 200 && test $(wc -l < src/components/workbenches/calc-sheet-builder.ts) -lt 200
  ```

### Task 5.3: Implement 25-Section AI Copilot What-If Router & Starter Prompts (`src/lib/perry-sections/perry-atlas-copilot-router.ts`)

- **Goal**: Enable natural-language What-If mutations and grounded tutoring across all 25 Perry sections while keeping [`copilot-responder.ts`](file:///Users/nad/ai4u/ai4UCheE/src/actions/copilot-responder.ts) strictly `< 200` LOC and preserving all existing Phase 8/9/10 Copilot tests.
- **Target files and symbols**:
  - `src/lib/perry-sections/perry-atlas-copilot-router.ts` (~155 LOC):
    - `parseAtlasSectionScenario(prompt: string, activeWorkbench: WorkbenchId): WorkbenchMutationCommand | null`
      - Detects `"sec 11"` / `"lmtd"` / `"temperature cross"`, `"sec 15"` / `"kremser"` / `"extraction"`, `"sec 16"` / `"langmuir"` / `"adsorption"`, `"sec 17"` / `"ergun"` / `"fluidized"`, `"sec 19"` / `"cstr"` / `"pfr"` / `"semenov"` / `"runaway"`, `"sec 20"` / `"monod"` / `"bioreactor"`, `"sec 21"` / `"bond work"`, `"sec 23"` / `"relief valve"` / `"psv"` / `"api 520"`, `"sec 25"` / `"corrosion"` / `"pren"`, or any explicit `"sec <1..25>"` / `"section <1..25>"` + numeric parameter and returns a `WorkbenchMutationCommand` targeting `'wb5-handbook-atlas'`.
    - `buildAtlasCopilotResponse(prompt: string, screenContext: ScreenContextSnapshot, mutation: WorkbenchMutationCommand | null): CopilotResponse | null`
  - [`src/actions/copilot-scenario-parser.ts`](file:///Users/nad/ai4u/ai4UCheE/src/actions/copilot-scenario-parser.ts) (`117 -> ~148` LOC): delegate to `parseAtlasSectionScenario(prompt, activeWorkbench)` when existing WB1–WB4 rules do not match or when `activeWorkbench === 'wb5-handbook-atlas'`.
  - [`src/actions/copilot-responder.ts`](file:///Users/nad/ai4u/ai4UCheE/src/actions/copilot-responder.ts) (`190 -> ~188` LOC): compact `CopilotRequestSchema` formatting by 8 lines and delegate `wb5-handbook-atlas` / 25-section queries to `buildAtlasCopilotResponse`.
  - [`src/components/shell/copilot-prompts.ts`](file:///Users/nad/ai4u/ai4UCheE/src/components/shell/copilot-prompts.ts) (`54 -> ~72` LOC): add 3 starter prompts for `'wb5-handbook-atlas'` (`wb5-sec11-lmtd`, `wb5-sec19-reactor`, `wb5-sec23-psv`) so `getStarterPromptsForWorkbench('wb5-handbook-atlas').length === 3`.
- **Success criteria**:
  - Asking the Copilot `"Check Sec 23 relief valve sizing at 150 psig"` or `"Test Sec 11 LMTD temperature cross at P=0.65, R=1.5"` switches to `wb5-handbook-atlas`, mutates the live section solver, and returns a white-box 3-stage KaTeX proof + citation.
  - All existing Phase 8/9/10 Copilot tests pass with zero regressions.
- **Verify**:
  ```bash
  npm run typecheck && npx vitest run src/__tests__/phase8-ux-copilot.test.tsx src/__tests__/phase9-interactive-intelligence.test.tsx && test $(wc -l < src/actions/copilot-responder.ts) -lt 200
  ```

### Task 5.4: Write Full 25-Section + Index Verification Suite (`src/__tests__/phase11-whole-perry-handbook.test.tsx`) & Sync `./docs/`

- **Goal**: Prove with automated Vitest + Pytest tests that all 25 Perry sections (`Sec 1`–`Sec 25`) + Back-of-Book Index (`pp. 2244–2274`) work end-to-end and sync `./docs/` (`AGENTS.md` #6).
- **Target files and symbols**:
  - `src/__tests__/phase11-whole-perry-handbook.test.tsx` (~180 LOC):
    1. **Test 1 (All 25 Section Descriptors & ChE Invariants)**: Iterates through all 25 sections (`1..25`) in `ALL_25_PERRY_SECTIONS`, verifying forward `solve()`, 3-stage `equations`, `[Perry's 9th Ed., ...]` citations, explicit `psig`/`psia` in `Sec 1, 2, 4, 10, 23`, $f_D = 4 f_F$ in `Sec 6`, LMTD $F_T < 0.75$ trap in `Sec 11`, Semenov runaway trap in `Sec 19`, and reversible `inverseSvgDrag(0.65, 0.35)` across all 25 sections.
    2. **Test 2 (`WB5: 25-Section Perry Atlas` UI, Section Switching & SVG Pointer Scrubbing)**: Renders `<App />`, clicks `tab-wb5-handbook-atlas`, switches across clusters (`Sec 1`, `Sec 11`, `Sec 19`, `Sec 23`, `Sec 25`), dispatches `fireEvent.pointerDown` on `perry-sec-drag-handle`, and verifies live parameter + KaTeX equation updates.
    3. **Test 3 (Back-of-Book Index Search `pp. 2244–2274` & `Sec-Page` Jump)**: Searches the Index in `PerryAtlasPdfExplorer` (`perry-index-search-input`), clicks an extracted `S-P` reference chip, and verifies `WB5` jumps to Section `S` and updates the active `Sec-Page`.
    4. **Test 4 (25-Section Copilot What-If Mutation & Senior EPC Calc Sheet)**: Sends a `Sec 23` PSV / `Sec 11` LMTD prompt in the Copilot drawer, verifies live `wb5-handbook-atlas` mutation, and opens the Senior Calc Sheet modal (`calc-sheet-open-button`) to confirm `Sec 23` / `Sec 11` equations render.
  - Documentation sync (`AGENTS.md` #6):
    - [`docs/system-architecture.md`](file:///Users/nad/ai4u/ai4UCheE/docs/system-architecture.md)
    - [`docs/codebase-summary.md`](file:///Users/nad/ai4u/ai4UCheE/docs/codebase-summary.md)
    - [`docs/project-roadmap.md`](file:///Users/nad/ai4u/ai4UCheE/docs/project-roadmap.md)
- **Success criteria**:
  - `npm run typecheck`, `npx vitest run` (all 6 test suites, 32+ tests), `npm run build`, `pytest`, and the `< 200` LOC check across all `.ts`, `.tsx`, and `.py` files pass 100%.
- **Verify**:
  ```bash
  npm run typecheck && npx vitest run && npm run build && services/perry-engine/.venv/bin/pytest services/perry-engine/tests -q && find src services/perry-engine -not -path "*/.venv/*" -not -path "*/__pycache__/*" \( -name "*.ts" -o -name "*.tsx" -o -name "*.py" \) -exec wc -l {} + | awk '$1 >= 200 && $2 != "total" {print "FAIL >200 LOC:", $1, $2; exit 1}'
  ```

---

## Failure Protocol

If any task verification command in Phase 05 fails, produces a TypeScript/Python error, breaks an existing test, or exceeds the 200-LOC file cap:
1. **STOP** immediately — do not mark the phase complete and do not weaken any test assertion or `< 200` LOC gate.
2. Capture the failing command output, exact file/line reference, and root cause hypothesis.
3. Escalate to the `kongming` advisor subagent (`invoke_subagent` with `TypeName: "kongming"`) with the failure evidence before attempting an architectural workaround.
