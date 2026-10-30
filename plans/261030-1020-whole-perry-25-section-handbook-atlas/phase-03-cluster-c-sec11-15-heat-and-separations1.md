# Phase 03: Cluster C (`Sec 11–15`): Heat Exchanger LMTD $F_T$, Psychrometry & Drying, Multicomponent Distillation, Gas Absorption & Liquid-Liquid Extraction

- **Parent Plan**: [`plan.md`](file:///Users/nad/ai4u/ai4UCheE/plans/261030-1020-whole-perry-25-section-handbook-atlas/plan.md)
- **Mode**: Parallel Track B (can run in parallel with Phases 02 and 04 after Phase 01 completes)
- **Exclusive File Ownership**: `src/lib/perry-sections/sec-11-15-solvers.ts`
- **Status**: Completed
- **Estimated Effort**: 4.5h

## Context & Overview

Phase 03 implements **Cluster C (`Sec 11` through `Sec 15`)** in `src/lib/perry-sections/sec-11-15-solvers.ts` (~172 LOC), covering Heat-Transfer Equipment (`Sec 11`), Psychrometry, Evaporative Cooling, and Solids Drying (`Sec 12`), Distillation (`Sec 13`), Equipment for Distillation and Gas Absorption (`Sec 14`), and Liquid-Liquid Extraction (`Sec 15`).

---

## Tasks

### Task 3.1: Implement `Sec 11` (Heat Exchanger LMTD $F_T$) & `Sec 12` (Psychrometry & Drying) Forward + Inverse SVG Solvers

- **Goal**: Build deterministic forward curve evaluators, 3-stage white-box KaTeX equations, and inverse SVG drag mappings for `Sec 11` and `Sec 12`.
- **Target files and symbols**:
  - `src/lib/perry-sections/sec-11-15-solvers.ts` (`solveSec11HeatEquipment`, `solveSec12Psychrometry`)
- **Steps**:
  1. **Sec 11 (`11-4`, PDF p. 949, `tok="LMTD"`) — Heat-Transfer Equipment (Shell-and-Tube LMTD & Bowman Correction Factor $F_T$)**:
     - Primary $x$: Thermal effectiveness $P_{\text{th}} = \frac{t_2 - t_1}{T_1 - t_1} \in [0.05, 0.85]$ (`defaultVal: 0.45`); Secondary $\theta$: Heat-capacity ratio $R_{\text{th}} = \frac{T_1 - T_2}{t_2 - t_1} \in [0.20, 3.00]$ (`defaultVal: 1.00`).
     - Evaluates 1-shell, 2-tube-pass Bowman correction factor $F_T(P_{\text{th}}, R_{\text{th}})$ and required area $A = \frac{Q}{U F_T \Delta T_{\text{lm}}}$.
     - **ChE Trap Guard**: Flags temperature-cross infeasible alert (`isAlert: true`) whenever $F_T < 0.75$ (requiring 2-shell-pass configuration).
     - Inverse SVG drag: X sets $P_{\text{th}} \in [0.05, 0.85]$; Y sets $R_{\text{th}} \in [0.20, 3.00]$.
     - Citation: `[Perry's 9th Ed., Sec. 11, Eq. 11-5 & Fig. 11-3, p. 11-4]`.
  2. **Sec 12 (`12-4`, PDF p. 1047, `tok="wet-bulb"`) — Psychrometry, Evaporative Cooling & Solids Drying**:
     - Primary $x$: Dry-bulb temperature $T_{\text{db}} \in [5, 85]\text{ }^\circ\text{C}$ (`defaultVal: 35`); Secondary $\theta$: Relative humidity $\phi \in [0.05, 1.00]$ (`defaultVal: 0.50`).
     - Computes saturation vapor pressure $P_w^{\text{sat}}(T_{\text{db}})$, absolute humidity ratio $Y = 0.62198\frac{\phi P_w^{\text{sat}}}{P_{\text{tot}} - \phi P_w^{\text{sat}}}$ ($\text{kg H}_2\text{O/kg dry air}$), humid enthalpy $H_g = (1.005 + 1.88Y)T_{\text{db}} + 2501.4Y$ ($\text{kJ/kg}$), and constant-rate drying time.
     - Inverse SVG drag: X sets $T_{\text{db}} \in [5, 85]\text{ }^\circ\text{C}$; Y sets $\phi \in [0.05, 1.00]$.
     - Citation: `[Perry's 9th Ed., Sec. 12, Table 12-1, p. 12-4]`.

### Task 3.2: Implement `Sec 13` (Distillation), `Sec 14` (Gas Absorption & Flooding) & `Sec 15` (Liquid-Liquid Extraction) Solvers

- **Goal**: Complete `SEC_11_15_DESCRIPTORS` with `Sec 13`, `Sec 14`, and `Sec 15` inside `src/lib/perry-sections/sec-11-15-solvers.ts`.
- **Target files and symbols**:
  - `src/lib/perry-sections/sec-11-15-solvers.ts` (`solveSec13Distillation`, `solveSec14AbsorptionTower`, `solveSec15LiquidExtraction`, `SEC_11_15_DESCRIPTORS`)
- **Steps**:
  1. **Sec 13 (`13-17`, PDF p. 1150, `tok="Fenske"`, `deepDiveWorkbench: 'wb4-distillation'`) — Distillation (Fenske-Underwood-Gilliland & McCabe-Thiele)**:
     - Reuses `solveDistillation` from [`src/components/workbenches/distillation-solver-math.ts`](file:///Users/nad/ai4u/ai4UCheE/src/components/workbenches/distillation-solver-math.ts).
     - Primary $x$: Distillate purity $x_D \in [0.70, 0.995]$ (`defaultVal: 0.95`); Secondary $\theta$: Operating reflux ratio factor $R/R_{\min} \in [1.05, 3.00]$ (`defaultVal: 1.30`).
     - Citation: `[Perry's 9th Ed., Sec. 13, Eqs. 13-25..13-27, p. 13-17]`.
  2. **Sec 14 (`14-37`, PDF p. 1270, `tok="FIG. 14-32"`, `deepDiveWorkbench: 'wb4-distillation'`) — Equipment for Distillation & Gas Absorption (Fair $C_{sb}$, Eckert GPDC & Kremser $N_{OG}$)**:
     - Primary $x$: Flow parameter $F_{LV} \in [0.01, 1.00]$ (`defaultVal: 0.10`, `scale: 'log10'`); Secondary $\theta$: Column diameter $D_c \in [0.30, 4.50]\text{ m}$ (`defaultVal: 1.50`).
     - Computes Fair capacity factor $C_{sb}(F_{LV})$, flooding velocity $u_{\text{flood}}$, $\%\text{Flood}$ (flagging jet/entrainment flooding when $\%\text{Flood} > 85\%$), and Kremser $N_{OG}$ with explicit column `psig -> psia` note.
     - Citation: `[Perry's 9th Ed., Sec. 14, Fig. 14-32, p. 14-37]`.
  3. **Sec 15 (`15-7`, PDF p. 1358, `tok="Kremser"`) — Liquid-Liquid Extraction (Kremser Countercurrent Cascade)**:
     - Primary $x$: Extraction factor $E = m S / F \in [0.40, 4.00]$ (`defaultVal: 1.50`); Secondary $\theta$: Equilibrium stage count $N \in [1, 16]$ (`defaultVal: 6`, `step: 1`).
     - Computes unextracted raffinate fraction $\Phi(E, N) = \frac{E - 1}{E^{N+1} - 1}$ (handling singular limit $\Phi(1, N) = \frac{1}{N+1}$ when $|E-1| < 10^{-4}$) and solute recovery $\%R = (1 - \Phi)\times 100\%$.
     - Citation: `[Perry's 9th Ed., Sec. 15, Eq. 15-14, p. 15-7]`.
- **Success criteria**:
  - `SEC_11_15_DESCRIPTORS` exports all 5 descriptors (`Sec 11`..`Sec 15`) with zero TypeScript errors and `< 200` LOC.
- **Verify**:
  ```bash
  npm run typecheck && test $(wc -l < src/lib/perry-sections/sec-11-15-solvers.ts) -lt 200
  ```

---

## Failure Protocol

If any task verification command in Phase 03 fails, produces a TypeScript error, or exceeds the 200-LOC file cap:
1. **STOP** immediately — do not weaken any equation, invariant, or `< 200` LOC gate.
2. Capture the failing command output, exact file/line reference, and root cause hypothesis.
3. Escalate to the `kongming` advisor subagent (`invoke_subagent` with `TypeName: "kongming"`) with the failure evidence before attempting an architectural workaround.
