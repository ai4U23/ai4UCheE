# Phase 02: Cluster B (`Sec 6–10`): Fluid/Particle Dynamics ($f_D=4f_F$), Reaction Kinetics, Process Control, Process Economics & Fluid Transport ($\text{NPSH}_A$ `psig`/`psia`)

- **Parent Plan**: [`plan.md`](file:///Users/nad/ai4u/ai4UCheE/plans/261030-1020-whole-perry-25-section-handbook-atlas/plan.md)
- **Mode**: Parallel Track A (can run in parallel with Phases 03 and 04 after Phase 01 completes)
- **Exclusive File Ownership**: `src/lib/perry-sections/sec-06-10-solvers.ts`
- **Status**: Completed
- **Estimated Effort**: 4.5h

## Context & Overview

Phase 02 implements **Cluster B (`Sec 6` through `Sec 10`)** in `src/lib/perry-sections/sec-06-10-solvers.ts` (~172 LOC), covering Fluid and Particle Dynamics (`Sec 6`), Reaction Kinetics (`Sec 7`), Process Control (`Sec 8`), Process Economics (`Sec 9`), and Transport and Storage of Fluids (`Sec 10`).

---

## Tasks

### Task 2.1: Implement `Sec 6` (Fluid & Particle Dynamics) & `Sec 7` (Reaction Kinetics) Forward + Inverse SVG Solvers

- **Goal**: Build the deterministic forward curve evaluators, 3-stage white-box KaTeX equations, and inverse SVG drag mappings for `Sec 6` and `Sec 7`.
- **Target files and symbols**:
  - `src/lib/perry-sections/sec-06-10-solvers.ts` (`solveSec06FluidDynamics`, `solveSec07ReactionKinetics`)
- **Steps**:
  1. **Sec 6 (`6-10`, PDF p. 593, `tok="FIG. 6-9"`, `deepDiveWorkbench: 'wb3-hydraulics'`) — Fluid & Particle Dynamics (Colebrook Fanning $f_F$, Darcy $f_D=4f_F$ & Terminal Settling)**:
     - Primary $x$: Reynolds number $\text{Re} \in [10^3, 10^7]$ (`defaultVal: 100000`, `scale: 'log10'`); Secondary $\theta$: Relative roughness $\varepsilon/D \in [10^{-5}, 0.05]$ (`defaultVal: 0.00045`).
     - Governing equations:
       - Stage 1 (Symbolic): $\frac{1}{\sqrt{f_F}} = -4.0\log_{10}\!\left(\frac{\varepsilon/D}{3.7} + \frac{1.256}{\text{Re}\sqrt{f_F}}\right), \quad f_D = 4 f_F$
       - Dual SVG curves: Primary curve plots Fanning $f_F(\text{Re})$; secondary dashed curve plots Darcy $f_D = 4 f_F$ so the `4x` Fanning-vs-Darcy factor (`AGENTS.md` #5) is visually unmistakable.
     - Inverse SVG drag: X (log10) sets $\text{Re} \in [10^3, 10^7]$; Y sets relative roughness $\varepsilon/D \in [10^{-5}, 0.05]$.
     - Citation: `[Perry's 9th Ed., Sec. 6, Fig. 6-9 & Eqs. 6-37..6-39, p. 6-10]`.
  2. **Sec 7 (`7-6`, PDF p. 639, `tok="Arrhenius"`) — Reaction Kinetics (Arrhenius Rate Law $k(T)$ & Batch Conversion)**:
     - Primary $x$: Reaction temperature $T \in [300, 750]\text{ K}$ (`defaultVal: 450`); Secondary $\theta$: Activation energy $E_a \in [25, 180]\text{ kJ/mol}$ (`defaultVal: 75`).
     - Governing equations: $k(T) = A\exp\!\left(-\frac{E_a}{RT}\right)$ with $R = 8.314\text{ J/(mol}\cdot\text{K)}$, batch conversion $X = 1 - \exp(-k(T)t)$, and thermal sensitivity $\frac{d\ln k}{dT} = \frac{E_a}{RT^2}$.
     - Inverse SVG drag: X sets $T \in [300, 750]\text{ K}$; Y sets $E_a \in [25, 180]\text{ kJ/mol}$.
     - Citation: `[Perry's 9th Ed., Sec. 7, Eq. 7-11, p. 639 (7-6)]`.

### Task 2.2: Implement `Sec 8` (Process Control), `Sec 9` (Process Economics) & `Sec 10` (Fluid Transport) Forward + Inverse SVG Solvers

- **Goal**: Complete `SEC_06_10_DESCRIPTORS` with `Sec 8`, `Sec 9`, and `Sec 10` inside `src/lib/perry-sections/sec-06-10-solvers.ts`.
- **Target files and symbols**:
  - `src/lib/perry-sections/sec-06-10-solvers.ts` (`solveSec08ProcessControl`, `solveSec09ProcessEconomics`, `solveSec10FluidTransport`, `SEC_06_10_DESCRIPTORS`)
- **Steps**:
  1. **Sec 8 (`8-14`, PDF p. 683, `tok="Ziegler"`, `deepDiveWorkbench: 'wb3-hydraulics'`) — Process Control (FOPDT IMC / Ziegler-Nichols PID Tuning)**:
     - Primary $x$: Closed-loop time constant $\tau_c \in [0.5, 25.0]\text{ s}$ (`defaultVal: 4.0`); Secondary $\theta$: Dead-time ratio $\theta_d/\tau_p \in [0.05, 1.00]$ (`defaultVal: 0.25`).
     - Computes controller gain $K_c = \frac{\tau_p}{K_p(\tau_c + \theta_d)}$, reset time $\tau_I = \tau_p$, and step-response overshoot, flagging controllability warning when $\theta_d/\tau_p > 0.65$.
     - Citation: `[Perry's 9th Ed., Sec. 8, Fig. 8-21, p. 8-14]`.
  2. **Sec 9 (`9-3`, PDF p. 758, `tok="depreciation"`) — Process Economics (Six-Tenths Rule CAPEX, CEPCI Escalation & NPV/IRR)**:
     - Primary $x$: Discount rate $i \in [0.02, 0.30]$ (`defaultVal: 0.10`); Secondary $\theta$: Capacity ratio $S_2/S_1 \in [0.2, 5.0]$ (`defaultVal: 1.8`).
     - Computes escalated capital cost $C_2 = C_1(S_2/S_1)^{0.6}(\text{CEPCI}_2/\text{CEPCI}_1)$ and 10-year $\text{NPV}(i)$, flagging negative NPV when $i > \text{IRR}$.
     - Citation: `[Perry's 9th Ed., Sec. 9, p. 9-3]`.
  3. **Sec 10 (`10-24`, PDF p. 827, `tok="NPSH"`, `deepDiveWorkbench: 'wb3-hydraulics'`) — Transport & Storage of Fluids (Pump $\text{NPSH}_A$, Polytropic Head & Valve $C_v$)**:
     - Reuses `solveHydraulics` from [`src/components/workbenches/hydraulics-solver-math.ts`](file:///Users/nad/ai4u/ai4UCheE/src/components/workbenches/hydraulics-solver-math.ts).
     - Primary $x$: Volumetric flow $Q \in [20, 600]\text{ gpm}$ (`defaultVal: 250`); Secondary $\theta$: Suction vessel gauge pressure $P_{\text{suc,psig}} \in [-5.0, 60.0]\text{ psig}$ (`defaultVal: 5.0`).
     - Enforces explicit `psig -> psia` (`P_abs,psia = P_suc,psig + 14.6959`) and Darcy $f_D = 4f_F$ in suction line loss $h_{f,\text{suc}}$, flagging cavitation alert when $\text{NPSH}_A < \text{NPSH}_R + 1.0\text{ m}$.
     - Citation: `[Perry's 9th Ed., Sec. 10, pp. 10-24..25]`.
- **Success criteria**:
  - `SEC_06_10_DESCRIPTORS` exports all 5 descriptors (`Sec 6`..`Sec 10`) with zero TypeScript errors and `< 200` LOC.
- **Verify**:
  ```bash
  npm run typecheck && test $(wc -l < src/lib/perry-sections/sec-06-10-solvers.ts) -lt 200
  ```

---

## Failure Protocol

If any task verification command in Phase 02 fails, produces a TypeScript error, or exceeds the 200-LOC file cap:
1. **STOP** immediately — do not weaken any equation, invariant, or `< 200` LOC gate.
2. Capture the failing command output, exact file/line reference, and root cause hypothesis.
3. Escalate to the `kongming` advisor subagent (`invoke_subagent` with `TypeName: "kongming"`) with the failure evidence before attempting an architectural workaround.
