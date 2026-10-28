---
title: "Phase 5: Sec 6, 8 & 10 Fluid Hydraulics, Commercial Pipe Sizing, Pump NPSHa & Control Valve Cv Workbench (WB3)"
status: todo
---

# Phase 5: Sec 6, 8 & 10 Fluid Hydraulics, Commercial Pipe Sizing, Pump NPSHa & Control Valve Cv Workbench (WB3)

## Overview

Implement the *Perry's 9th Ed.* Section 6, 8 & 10 Hydraulics Engine: commercial `ASME B36.10M` pipe schedule lookup (`fluids.piping.nearest_pipe`), explicit **Darcy vs. Fanning friction factor guardrail** ($f_D = 4 f_F$, since Perry's Fig. 6-9 plots Fanning $f_F$ while standard Darcy-Weisbach uses $f_D$), the **3-Case Operating Matrix** (`Min 70% / Normal 100% / Rated 120%`), Pump $\text{NPSH}_A$ vs. $\text{NPSH}_R$ cavitation check with explicit `psig`/`psia` enforcement, ISA-75.01 / IEC 60534-2-1 control valve $C_v$ sizing with explicit liquid critical pressure ratio factor $F_F = 0.96 - 0.28\sqrt{P_v / P_c}$ and choked flow ($\Delta P_{\max} = F_L^2(P_1 - F_F P_v)$) detection, and a `Calcpad`-style parametric SVG piping/pump sketch. Every code file MUST remain `< 200` lines.

## Requirements

- [ ] Commercial `ASME B36.10M` pipe schedule resolver (`solvers/hydraulics_pipe.py`) computing `Min 70% / Normal 100% / Rated 120%` cases, both Fanning $f_F$ and Darcy $f_D = 4 f_F$, velocity erosion guardrails, and calibrated `(Re, f_F)` crosshair for Perry's `Fig. 6-9` (`p. 6-10`).
- [ ] Pump $\text{NPSH}_A$ vs. $\text{NPSH}_R$ solver & ISA-75.01 Control Valve $C_v$ solver (`solvers/hydraulics_pump_valve.py`) rendering explicit 3-stage `handcalcs` steps for $F_F = 0.96 - 0.28\sqrt{P_v / P_c}$, $\Delta P_{\max} = F_L^2(P_1 - F_F P_v)$, and $C_v$.
- [ ] FastAPI Hydraulics Router (`routers/hydraulics_router.py`) + `tests/test_phase5_hydraulics.py`.
- [ ] Parametric `PipingPumpSvgSketch` (`src/components/sketches/piping-pump-svg-sketch.tsx`), `HydraulicsWorkbench` (`src/components/workbenches/hydraulics-workbench.tsx`), and Zod action (`src/actions/run-hydraulics.ts`).

## Implementation Steps

### Task 5.1 — Implement Commercial Pipe Sizing (`ASME B36.10M`), Darcy/Fanning Guardrail & 3-Case Matrix (`solvers/hydraulics_pipe.py`)
- **Goal**: Build `services/perry-engine/solvers/hydraulics_pipe.py` (`< 200` lines) resolving exact inner diameter $D_i$ via `fluids.piping.nearest_pipe`, computing both Fanning $f_F$ and Darcy $f_D = 4 f_F$, and evaluating the `Min 70% / Normal 100% / Rated 120%` flow matrix with 3-stage `handcalcs` KaTeX steps.
- **Target files and symbols**:
  - `/Users/nad/ai4u/ai4UCheE/services/perry-engine/solvers/hydraulics_pipe.py` (`solve_pipe_hydraulics_3case()`, `PipeCaseResult`)
- **Steps**:
  1. Use `fluids.piping.nearest_pipe(NPS=nps_inch, schedule=schedule_str)` to retrieve exact `NPS`, `D_inner_m`, `D_outer_m`, and wall thickness `t_m` (`[Perry's 9th Ed., Table 10-18 (ASME B36.10M), p. 10-72]`).
  2. Implement `solve_single_flow_case(flow_m3_s, D_i, L_m, roughness_m, rho, mu, K_fittings, elev_m)` computing:
     - Velocity $v = \frac{4 Q}{\pi D_i^2}$ and Reynolds number $Re = \frac{\rho v D_i}{\mu}$ (`[Perry's 9th Ed., Eq. 6-38, p. 6-10]`).
     - Darcy friction factor $f_D$ via Churchill/Colebrook (`fluids.friction.friction_factor(Re=Re, eD=roughness_m/D_i)`) and **Fanning friction factor** $f_F = f_D / 4.0$ (`[Perry's 9th Ed., Fig. 6-9 & Eq. 6-39, p. 6-10]`). Include an explicit guardrail note: `"Perry's Fig. 6-9 plots Fanning f_F; Darcy f_D = 4 * f_F is used in head loss h_f = (f_D*L/D + sum(K)) * v^2/(2g)."`
     - Frictional head loss $h_f = \left(f_D \frac{L}{D_i} + \sum K\right) \frac{v^2}{2g}$, static head $\Delta z$, and total $\Delta P$ in `kPa` and `psi`.
     - Erosion/velocity check against Perry's Sec 6 liquid velocity guidelines ($0.9 \le v \le 3.0\text{ m/s}$ normal).
  3. Implement `solve_pipe_hydraulics_3case(...)` running `case_min` (`0.70 * Q_normal`), `case_normal` (`1.00 * Q_normal`), and `case_rated` (`1.20 * Q_normal`), plus generating the calibrated crosshair coordinates `(Re, f_F)` on Perry's `Fig. 6-9` (`p. 6-10`).
- **Success criteria**: For 4-inch Sch 40 pipe (`D_i = 0.10226 m`) at `250 gpm` water, `solve_pipe_hydraulics_3case` returns exact `70% / 100% / 120%` cases, verifies `abs(f_D - 4.0 * f_F) < 1e-9`, and emits 3-stage KaTeX steps.
- **Verify**: `PYTHONPATH=/Users/nad/ai4u/ai4UCheE/services/perry-engine /Users/nad/ai4u/ai4UCheE/services/perry-engine/.venv/bin/python -c "from solvers.hydraulics_pipe import solve_pipe_hydraulics_3case; res = solve_pipe_hydraulics_3case(nps_inch=4, schedule='40', flow_gpm=250.0, length_m=100.0, roughness_mm=0.045, rho_kg_m3=998.2, mu_cp=1.0, k_fittings=4.5, elev_m=5.0); n = res['cases']['normal']; assert abs(n['f_darcy'] - 4*n['f_fanning']) < 1e-8 and abs(res['pipe']['d_inner_m'] - 0.10226) < 0.001; print('PIPE_3CASE_OK', n['reynolds'], n['dp_total_kpa'])"` exits `0` and prints `PIPE_3CASE_OK`.

### Task 5.2 — Implement Pump $\text{NPSH}_A$ Cavitation Solver & ISA/IEC Control Valve $C_v$ Choked-Flow Solver (`solvers/hydraulics_pump_valve.py`)
- **Goal**: Build `services/perry-engine/solvers/hydraulics_pump_valve.py` (`< 200` lines) computing Pump $\text{NPSH}_A$ vs. $\text{NPSH}_R$ (`Perry's Sec 10`, `p. 10-28`) with explicit gauge-to-absolute pressure normalization and Control Valve $C_v$ (`Perry's Sec 8`, `p. 8-48`) with explicit liquid critical pressure ratio factor $F_F = 0.96 - 0.28\sqrt{P_v / P_c}$ and choked-flow $\Delta P_{\max} = F_L^2 (P_1 - F_F P_v)$ check, then expose via `routers/hydraulics_router.py`.
- **Target files and symbols**:
  - `/Users/nad/ai4u/ai4UCheE/services/perry-engine/solvers/hydraulics_pump_valve.py` (`evaluate_pump_npsha()`, `evaluate_control_valve_cv()`, `generate_pump_system_curve()`)
  - `/Users/nad/ai4u/ai4UCheE/services/perry-engine/routers/hydraulics_router.py` (`router`)
  - `/Users/nad/ai4u/ai4UCheE/services/perry-engine/tests/test_phase5_hydraulics.py`
- **Steps**:
  1. Implement `evaluate_pump_npsha(p_suction_val: float, p_suction_unit: str, patm_psia: float, z_suction_m: float, hf_suction_m: float, p_vapor_pa: float, rho_kg_m3: float, npshr_m: float = 3.0) -> dict`:
     - Call `normalize_pressure_to_pa(p_suction_val, p_suction_unit, patm_psia)` so `psig` vs. `psia` is explicitly normalized and logged in the 3-stage `handcalcs` trace.
     - Compute:
       $$\text{NPSH}_A = \frac{P_{\text{suction,abs}} - P_{vp}}{\rho g} + z_{\text{suction}} - h_{f,\text{suction}}$$
       with citation `[Perry's 9th Ed., Eq. 10-29, p. 10-28]`.
     - Check cavitation margin: `margin_m = npsha_m - npshr_m` and `ratio = npsha_m / npshr_m`; flag `cavitation_status = "CAVITATION_DANGER"` if `margin_m < 1.0` or `ratio < 1.3`, else `"SAFE"`.
  2. Implement `evaluate_control_valve_cv(flow_m3_s: float, p1_pa: float, p2_pa: float, p_vapor_pa: float, p_crit_pa: float, rho_kg_m3: float, fl_factor: float = 0.9) -> dict`:
     - Compute and render 3-stage `handcalcs` step for liquid critical pressure ratio factor:
       $$F_F = 0.96 - 0.28\sqrt{\frac{P_v}{P_c}}$$
       and choked pressure drop:
       $$\Delta P_{\max} = F_L^2\left(P_1 - F_F P_v\right)$$
       with citation `[Perry's 9th Ed., Sec. 8-12 (ISA-75.01 / IEC 60534), p. 8-48]`.
     - Compute effective sizing drop $\Delta P_{\text{eff}} = \min(\Delta P_{\text{actual}}, \Delta P_{\max})$ and $C_v = Q_{\text{gpm}} \sqrt{\frac{\text{SG}}{\Delta P_{\text{eff,psi}}}}$ across `Min 70% / Normal 100% / Rated 120%` and flag `is_choked: bool` and `is_flashing: bool` ($P_2 < P_v$).
  3. Implement `generate_pump_system_curve()` returning 15 points `(flow_gpm, system_head_m, pump_head_m, npsha_m, npshr_m)` for plotting the Pump Curve vs. System Curve intersection (operating point).
  4. Expose `POST /api/v1/hydraulics/evaluate` in `routers/hydraulics_router.py`, mount in `main.py`, and write `tests/test_phase5_hydraulics.py`.
- **Success criteria**: `pytest tests/test_phase5_hydraulics.py` passes all tests including `psig`/`psia` normalization, $f_D = 4 f_F$, $\text{NPSH}_A$ cavitation trigger, and choked valve $C_v$ with explicit $F_F$ step.
- **Verify**: `cd /Users/nad/ai4u/ai4UCheE/services/perry-engine && .venv/bin/pytest tests/test_phase5_hydraulics.py -v` exits `0` and prints `passed`.

### Task 5.3 — Build Parametric Piping/Pump SVG Sketch & Workbench 3 (`HydraulicsWorkbench`)
- **Goal**: Build `src/actions/run-hydraulics.ts`, `src/components/sketches/piping-pump-svg-sketch.tsx`, and `src/components/workbenches/hydraulics-workbench.tsx` (`< 200` lines each).
- **Target files and symbols**:
  - `/Users/nad/ai4u/ai4UCheE/src/actions/run-hydraulics.ts` (`runHydraulicsAction`)
  - `/Users/nad/ai4u/ai4UCheE/src/components/sketches/piping-pump-svg-sketch.tsx` (`PipingPumpSvgSketch`)
  - `/Users/nad/ai4u/ai4UCheE/src/components/workbenches/hydraulics-workbench.tsx` (`HydraulicsWorkbench`)
- **Steps**:
  1. Write `src/actions/run-hydraulics.ts` registering `runHydraulicsAction` via `defineAction`.
  2. Write `src/components/sketches/piping-pump-svg-sketch.tsx` (`< 200` lines) rendering a `Calcpad`-style annotated engineering SVG diagram showing:
     - Suction vessel ($P_{\text{suction}}$ in `psig` + `psia`, liquid level $z_{\text{suction}}$), suction line (`NPS` & `Sch`, $D_i$), centrifugal pump symbol (colored red with pulsing alert badge if $\text{NPSH}_A < \text{NPSH}_R + 1.0\text{ m}$), control valve symbol ($C_v$, choked/flashing status), and Pump vs. System Curve mini-plot.
     - Each equipment node uses `useAgentSelectable('equipment', 'pump-P101' | 'valve-FCV101' | 'pipe-L101', ...)`.
  3. Write `src/components/workbenches/hydraulics-workbench.tsx` (`< 200` lines) displaying:
     - 2-Tier Progressive Disclosure: `Tier 1 (Shortcut Sizing)` in `Learn` mode vs. `Tier 2 (Full 3-Case 70%/100%/120% EPC Datasheet Table + Pump/Valve Rating)` in `Plant` mode.
     - Explicit Darcy $f_D$ vs. Fanning $f_F$ comparison banner + Perry's `Fig. 6-9` (`p. 6-10`) crop with calibrated $(Re, f_F)$ crosshair.
- **Success criteria**: `tsc --noEmit` passes and both `piping-pump-svg-sketch.tsx` and `hydraulics-workbench.tsx` are `< 200` lines.
- **Verify**: `cd /Users/nad/ai4u/ai4UCheE && npx tsc --noEmit && awk 'END{if (NR>=200) exit 1}' src/components/workbenches/hydraulics-workbench.tsx && awk 'END{if (NR>=200) exit 1}' src/components/sketches/piping-pump-svg-sketch.tsx && echo "WB3_OK"` exits `0` and prints `WB3_OK`.

## Todo

- [ ] Task 5.1: Implement Commercial Pipe Sizing (`ASME B36.10M`), Darcy/Fanning Guardrail & 3-Case Matrix (`solvers/hydraulics_pipe.py`)
- [ ] Task 5.2: Implement Pump $\text{NPSH}_A$ Cavitation Solver & ISA/IEC Control Valve $C_v$ Choked-Flow Solver (`solvers/hydraulics_pump_valve.py`)
- [ ] Task 5.3: Build Parametric Piping/Pump SVG Sketch & Workbench 3 (`HydraulicsWorkbench`)

## Success Criteria

- `solve_pipe_hydraulics_3case` resolves `ASME B36.10M` 4-inch Sch 40 pipe (`D_i = 0.10226 m`) and verifies $f_D = 4 f_F$ (`PIPE_3CASE_OK`).
- `pytest tests/test_phase5_hydraulics.py -v` exits `0` (`passed`).
- `HydraulicsWorkbench` and `PipingPumpSvgSketch` compile cleanly (`WB3_OK`) and stay `< 200` lines each.

## Failure Protocol
If any Verify step does not meet its stated pass condition, STOP this phase.
Do not improvise a fix, retry blindly, or reason around the failure.
Spawn the `kongming` subagent for next-step counsel and pass:
- the phase and task id,
- what you attempted (the steps you ran),
- the exact command and its full output,
- the pass condition it failed to meet.
Apply kongming's guidance, then re-run the Verify step.
If `kongming` cannot be spawned in this environment, STOP and report the same
failure evidence to the user. Never continue by self-reasoning.
