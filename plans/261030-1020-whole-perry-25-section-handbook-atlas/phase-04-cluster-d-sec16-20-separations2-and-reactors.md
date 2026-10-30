# Phase 04: Cluster D (`Sec 16–20`): Langmuir Adsorption & LUB, Gas-Solid Ergun/Fluidization, Liquid-Solid Filtration, CSTR/PFR/Semenov Reactors & Monod Bioreactors

- **Parent Plan**: [`plan.md`](file:///Users/nad/ai4u/ai4UCheE/plans/261030-1020-whole-perry-25-section-handbook-atlas/plan.md)
- **Mode**: Parallel Track C (can run in parallel with Phases 02 and 03 after Phase 01 completes)
- **Exclusive File Ownership**: `src/lib/perry-sections/sec-16-20-solvers.ts`
- **Status**: Completed
- **Estimated Effort**: 4.5h

## Context & Overview

Phase 04 implements **Cluster D (`Sec 16` through `Sec 20`)** in `src/lib/perry-sections/sec-16-20-solvers.ts` (~174 LOC), covering Adsorption and Ion Exchange (`Sec 16`), Gas-Solid Operations and Equipment (`Sec 17`), Liquid-Solid Operations and Equipment (`Sec 18`), Reactors (`Sec 19`), and Bioreactions and Bioprocessing (`Sec 20`).

---

## Tasks

### Task 4.1: Implement `Sec 16` (Langmuir Adsorption & LUB) & `Sec 17` (Gas-Solid Fluidization & Cyclone Cut-Size) Solvers

- **Goal**: Build deterministic forward curve evaluators, 3-stage white-box KaTeX equations, and inverse SVG drag mappings for `Sec 16` and `Sec 17`.
- **Target files and symbols**:
  - `src/lib/perry-sections/sec-16-20-solvers.ts` (`solveSec16Adsorption`, `solveSec17GasSolid`)
- **Steps**:
  1. **Sec 16 (`16-8`, PDF p. 1453, `tok="Langmuir"`) — Adsorption & Ion Exchange (Langmuir Isotherm & Collins LUB Breakthrough)**:
     - Primary $x$: Feed solute concentration $C \in [0.05, 10.0]\text{ kg/m}^3$ (`defaultVal: 1.50`); Secondary $\theta$: Langmuir affinity parameter $b \in [0.10, 5.00]\text{ m}^3\text{/kg}$ (`defaultVal: 1.20`).
     - Computes equilibrium solid loading $q^*(C) = \frac{q_{\max} b C}{1 + b C}$, separation factor $R_L = \frac{1}{1 + b C}$, and Collins length-of-unused-bed (LUB) breakthrough time $t_b = \frac{\rho_b q^*(C)}{u_s C}(L_{\text{bed}} - L_{\text{MTZ}})$.
     - Inverse SVG drag: X sets $C \in [0.05, 10.0]$; Y sets $b \in [0.10, 5.00]$.
     - Citation: `[Perry's 9th Ed., Sec. 16, Eq. 16-11, p. 16-8]`.
  2. **Sec 17 (`17-3`, PDF p. 1502, `tok="fluidized"`) — Gas-Solid Operations & Equipment (Ergun $\Delta P/L$, Wen-Yu $u_{mf}$ & Lapple Cyclone $d_{pc}$)**:
     - Primary $x$: Superficial gas velocity $u_0 \in [0.01, 2.50]\text{ m/s}$ (`defaultVal: 0.45`); Secondary $\theta$: Mean particle diameter $d_p \in [100, 3000]\text{ }\mu\text{m}$ (`defaultVal: 500`).
     - Computes Ergun packed-bed pressure gradient $\frac{\Delta P}{L} = \frac{150\mu(1-\varepsilon)^2 u_0}{\phi_s^2 d_p^2 \varepsilon^3} + \frac{1.75\rho_g(1-\varepsilon)u_0^2}{\phi_s d_p \varepsilon^3}$, Wen-Yu minimum fluidization velocity $u_{mf}$ (clamping $\Delta P/L$ at bed weight $(1-\varepsilon_{mf})(\rho_p-\rho_g)g$ once $u_0 \ge u_{mf}$), packed-bed friction factor $f_p = \frac{150}{\text{Re}_p} + 1.75$ vs. pipe Fanning $f_F$, and Lapple cyclone 50% cut diameter $d_{pc}$.
     - Citation: `[Perry's 9th Ed., Sec. 17, Fig. 17-2, p. 17-3]`.

### Task 4.2: Implement `Sec 18` (Cake Filtration), `Sec 19` (CSTR/PFR Levenspiel & Semenov Runaway) & `Sec 20` (Monod Bioreactor) Solvers

- **Goal**: Complete `SEC_16_20_DESCRIPTORS` with `Sec 18`, `Sec 19`, and `Sec 20` inside `src/lib/perry-sections/sec-16-20-solvers.ts`.
- **Target files and symbols**:
  - `src/lib/perry-sections/sec-16-20-solvers.ts` (`solveSec18LiquidSolid`, `solveSec19Reactors`, `solveSec20Bioprocessing`, `SEC_16_20_DESCRIPTORS`)
- **Steps**:
  1. **Sec 18 (`18-3`, PDF p. 1572, `tok="Filtration"`) — Liquid-Solid Operations & Equipment (Ruth Constant-$\Delta P$ Cake Filtration & Thickener Settling)**:
     - Primary $x$: Specific filtrate volume $V/A \in [0.05, 2.50]\text{ m}^3\text{/m}^2$ (`defaultVal: 0.80`); Secondary $\theta$: Filtration pressure drop $\Delta P \in [20, 500]\text{ kPa}$ (`defaultVal: 150`).
     - Computes Ruth filtration ratio $\frac{t}{V/A} = \frac{\mu \alpha_c c}{2\Delta P}\!\left(\frac{V}{A}\right) + \frac{\mu R_m}{\Delta P}$ and total filtration cycle time $t$.
     - Citation: `[Perry's 9th Ed., Sec. 18, p. 18-3]`.
  2. **Sec 19 (`19-3`, PDF p. 1696, `tok="residence"`) — Reactors (CSTR vs. PFR Levenspiel Sizing & Semenov Thermal Runaway)**:
     - Primary $x$: Target conversion $X \in [0.05, 0.98]$ (`defaultVal: 0.85`); Secondary $\theta$: Semenov dimensionless heat-generation number $\psi \in [0.05, 0.80]$ (`defaultVal: 0.25`).
     - Computes 1st-order PFR space time $\tau_{\text{PFR}} = \frac{-\ln(1-X)}{k_1}$ (secondary curve), CSTR space time $\tau_{\text{CSTR}} = \frac{X}{k_1(1-X)}$ (primary curve), volume ratio $V_{\text{CSTR}}/V_{\text{PFR}}$, and **Semenov thermal runaway trap** (`isAlert: true` when $\psi > e^{-1} \approx 0.3679$).
     - Citation: `[Perry's 9th Ed., Sec. 19, p. 19-3]`.
  3. **Sec 20 (`20-83`, PDF p. 1832, `tok="TABLE 20-36"`) — Bioreactions & Bioprocessing (Monod Chemostat Washout & Oxygen Transfer $k_L a$)**:
     - Primary $x$: Dilution rate $D \in [0.02, 0.95]\text{ h}^{-1}$ (`defaultVal: 0.35`); Secondary $\theta$: Monod half-saturation constant $K_s \in [0.05, 2.50]\text{ g/L}$ (`defaultVal: 0.40`).
     - Computes steady-state substrate $S^* = \frac{K_s D}{\mu_{\max} - D}$, biomass concentration $X^* = Y_{X/S}(S_0 - S^*)$, volumetric productivity $D\cdot X^*$, oxygen transfer rate $\text{OTR} = k_L a(C^* - C_L)$, and flags chemostat washout (`isAlert: true`) when $D \ge D_{\text{wash}} = \frac{\mu_{\max}S_0}{K_s + S_0}$.
     - Citation: `[Perry's 9th Ed., Sec. 20, Table 20-36, p. 20-83]`.
- **Success criteria**:
  - `SEC_16_20_DESCRIPTORS` exports all 5 descriptors (`Sec 16`..`Sec 20`) with zero TypeScript errors and `< 200` LOC.
- **Verify**:
  ```bash
  npm run typecheck && test $(wc -l < src/lib/perry-sections/sec-16-20-solvers.ts) -lt 200
  ```

---

## Failure Protocol

If any task verification command in Phase 04 fails, produces a TypeScript error, or exceeds the 200-LOC file cap:
1. **STOP** immediately — do not weaken any equation, invariant, or `< 200` LOC gate.
2. Capture the failing command output, exact file/line reference, and root cause hypothesis.
3. Escalate to the `kongming` advisor subagent (`invoke_subagent` with `TypeName: "kongming"`) with the failure evidence before attempting an architectural workaround.
