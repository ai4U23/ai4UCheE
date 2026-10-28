---
title: "Phase 6: Sec 13 & 14 Distillation Workbench: Bi-Directional McCabe-Thiele Canvas + Tray/Packing Flooding Hydraulics (WB4)"
status: todo
---

# Phase 6: Sec 13 & 14 Distillation Workbench: Bi-Directional McCabe-Thiele Canvas + Tray/Packing Flooding Hydraulics (WB4)

## Overview

Implement the *Perry's 9th Ed.* Section 13 & 14 Distillation & Equipment Rating Engine: continuous binary McCabe-Thiele equilibrium & stage-stepping solver (`Perry's Sec 13`, `pp. 13-14 to 13-37`) supporting arbitrary feed thermal condition $q$ ($q$-line slope $\frac{q}{q-1}$), Fenske-Underwood-Gilliland (`FUG`) shortcut check, and Section 14 column hydraulics (`Fair's entrainment flooding` capacity parameter $C_{sb}$ on `Fig. 14-32`, `p. 14-37`, and `Eckert GPDC` packed-column flooding pressure drop correlation on `Fig. 14-55`, `p. 14-57`), paired with an interactive `LearnChemE`-style bi-directional SVG McCabe-Thiele canvas. Every code file MUST remain `< 200` lines.

## Requirements

- [ ] Binary McCabe-Thiele stage-stepping & FUG shortcut solver (`solvers/distillation_mccabe.py`) with 3-stage `handcalcs` derivations and exact stage staircase coordinates.
- [ ] Section 14 Fair's entrainment flooding ($C_{sb}$, `Fig. 14-32`, `p. 14-37`) and Eckert GPDC packed-column flooding (`Fig. 14-55`, `p. 14-57`) solver (`solvers/distillation_hydraulics.py`) + FastAPI router (`routers/distillation_router.py`) + `tests/test_phase6_distillation.py`.
- [ ] Interactive `McCabeThieleSvgCanvas` (`src/components/sketches/mccabe-thiele-svg-canvas.tsx`) with draggable $q$-line handle, `ColumnFloodingSvgSketch` (`src/components/sketches/column-flooding-svg-sketch.tsx`), and `DistillationWorkbench` (`src/components/workbenches/distillation-workbench.tsx`) with 2-Tier Progressive Disclosure (`Tier 1: Shortcut` $\leftrightarrow$ `Tier 2: Datasheet Rating`).

## Implementation Steps

### Task 6.1 — Implement Perry's Sec 13 McCabe-Thiele Stage-Stepping & FUG Shortcut Solver (`solvers/distillation_mccabe.py`)
- **Goal**: Build `services/perry-engine/solvers/distillation_mccabe.py` (`< 200` lines) solving binary VLE (constant $\alpha$ or Antoine/Raoult's Law from DIPPR Eq. 101), $q$-line intersection, minimum reflux $R_{\min}$ (Underwood/pinch), rectifying & stripping operating lines, exact staircase coordinates `[(x_0, y_0), ...]`, and 3-stage `handcalcs` KaTeX derivations.
- **Target files and symbols**:
  - `/Users/nad/ai4u/ai4UCheE/services/perry-engine/solvers/distillation_mccabe.py` (`solve_mccabe_thiele()`, `compute_vle_curve()`)
- **Steps**:
  1. Implement `compute_vle_curve(alpha: float = 2.45, num_points: int = 101)` computing $y^* = \frac{\alpha x}{1 + (\alpha - 1)x}$ (`[Perry's 9th Ed., Sec. 13, p. 13-14]` — the y-x/q-line construction region; note `13-19` there is a **Figure** (q-line intersection), not an equation).
  2. In `solve_mccabe_thiele(xf: float, xd: float, xb: float, q: float, r_mult: float = 1.3, alpha: float = 2.45, feed_kmol_hr: float = 100.0) -> dict`:
     - Solve overall & component material balances: $D = F \frac{z_F - x_B}{x_D - x_B}$ and $B = F - D$ (`[Perry's 9th Ed., Eq. 13-35, p. 13-25]`).
     - Compute $q$-line intersection $(x_{\text{pinch}}, y_{\text{pinch}})$ with the VLE curve ($y = \frac{q}{q-1}x - \frac{z_F}{q-1}$ for $q \ne 1$, or $x = z_F$ for saturated liquid $q = 1.0$) (`[Perry's 9th Ed., Sec. 13 q-line, p. 13-14]`).
     - Compute minimum reflux ratio $R_{\min} = \frac{x_D - y_{\text{pinch}}}{y_{\text{pinch}} - x_{\text{pinch}}}$, operating reflux $R = r_{\text{mult}} \cdot R_{\min}$, and Fenske minimum stages $N_{\min} = \frac{\ln\left[\frac{x_D(1-x_B)}{x_B(1-x_D)}\right]}{\ln \alpha}$ (`[Perry's 9th Ed., Sec. 13 Fenske, p. 13-36]`).
     - Step off theoretical stages from $x_D$ down to $x_B$, switching from the Rectifying Operating Line ($y = \frac{R}{R+1}x + \frac{x_D}{R+1}$) to the Stripping Operating Line at $x < x_{\text{intersect}}$, returning `stages_list`, `total_stages`, `feed_stage_index`, and 3-stage `handcalcs` equations.
- **Success criteria**: For benzene-toluene ($\alpha = 2.45, z_F = 0.50, x_D = 0.95, x_B = 0.05, q = 1.0, R/R_{\min} = 1.3$), `solve_mccabe_thiele` computes $R_{\min} \approx 1.14$ (closed-form $\frac{x_D - y^*(z_F)}{y^*(z_F) - z_F}$), $N_{\min} \approx 6.57$, and steps off `11–13` theoretical stages with exact staircase vertices.
- **Verify**: `PYTHONPATH=/Users/nad/ai4u/ai4UCheE/services/perry-engine /Users/nad/ai4u/ai4UCheE/services/perry-engine/.venv/bin/python -c "from solvers.distillation_mccabe import solve_mccabe_thiele; r = solve_mccabe_thiele(0.5, 0.95, 0.05, 1.0, 1.3, 2.45, 100.0); assert 1.1 < r['r_min'] < 1.3 and 10 <= r['total_stages'] <= 15; print('MCCABE_OK', r['r_min'], r['total_stages'])"` exits `0` and prints `MCCABE_OK`.

### Task 6.2 — Implement Perry's Sec 14 Souders-Brown Tray Flooding & Eckert GPDC Packing Solver (`solvers/distillation_hydraulics.py`)
- **Goal**: Build `services/perry-engine/solvers/distillation_hydraulics.py` (`< 200` lines) calculating internal vapor/liquid loads ($L, V$), flow parameter $F_{LV} = \frac{L_w}{V_w}\sqrt{\frac{\rho_V}{\rho_L}}$, Fair's entrainment flooding capacity parameter $C_{sb}$ (`Perry's Fig. 14-32`, `p. 14-37`), flooding velocity $u_{\text{flood}}$, column diameter $D_c$, `% Flood`, and Eckert Generalized Pressure Drop Correlation (`GPDC`, `Perry's Fig. 14-55`, `p. 14-57`), then expose via `routers/distillation_router.py`.
- **Target files and symbols**:
  - `/Users/nad/ai4u/ai4UCheE/services/perry-engine/solvers/distillation_hydraulics.py` (`solve_souders_brown_flooding()`, `solve_eckert_gpdc()`)
  - `/Users/nad/ai4u/ai4UCheE/services/perry-engine/routers/distillation_router.py` (`router`)
  - `/Users/nad/ai4u/ai4UCheE/services/perry-engine/tests/test_phase6_distillation.py`
- **Steps**:
  1. In `solve_souders_brown_flooding(...)`, compute:
     - Flow parameter $F_{LV} = \frac{L_{\text{mass}}}{V_{\text{mass}}} \sqrt{\frac{\rho_V}{\rho_L}}$ (`[Perry's 9th Ed., Fig. 14-32, p. 14-37]`).
     - Fair's correlation for entrainment flooding capacity factor $C_{sb}$ as a function of tray spacing $h_t \in \{0.305, 0.457, 0.610\}\text{ m}$ (`12, 18, 24 in`) and $F_{LV}$ (`[Perry's 9th Ed., Fig. 14-32, p. 14-37]`).
     - Flooding vapor velocity $u_{n,\text{flood}} = C_{sb} \left(\frac{\sigma}{20}\right)^{0.2} \sqrt{\frac{\rho_L - \rho_V}{\rho_V}}$ (`[Perry's 9th Ed., Fig. 14-32, p. 14-37]`).
     - Required net area $A_n$, total column cross-sectional area $A_t = A_n / (1 - f_{\text{downcomer}})$, standard column diameter $D_c$, actual `% Flood = (u_actual / u_flood) * 100`, and operating window classification (`"WEEPING_RISK" < 50%`, `"NORMAL_WINDOW" 50%..85%`, `"JET_FLOOD_DANGER" > 85%`).
     - Calibrated crosshair `(F_LV, C_sb)` for Perry's `Fig. 14-32` (`p. 14-37`).
  2. In `solve_eckert_gpdc(...)`, evaluate packed-bed capacity factor $C_P = u_V \sqrt{\frac{\rho_V}{\rho_L - \rho_V}} F_p^{0.5} \nu^{0.05}$ and pressure drop $\Delta P / Z$ (`mmH2O/m`) using packing factor $F_p$ (`[Perry's 9th Ed., Fig. 14-55, p. 14-57 & Table 14-13 (Characteristics of Random Packings), p. 14-58]`).
  3. Create `routers/distillation_router.py` exposing `POST /api/v1/distillation/evaluate`, mount in `main.py`, and write `tests/test_phase6_distillation.py` including citation-verification assertions using `pdf.section_map.verify_page_contains`: `verify_page_contains('14-37', 'FIG. 14-32')`, `verify_page_contains('14-57', 'FIG. 14-55')`, and `verify_page_contains('14-58', 'TABLE 14-13')` must all return `True`.
- **Success criteria**: `pytest tests/test_phase6_distillation.py` passes all tests and verifies that surging reflux ratio $R$ increases vapor load $V = (R+1)D$ and triggers `JET_FLOOD_DANGER` when `% Flood > 85%`.
- **Verify**: `cd /Users/nad/ai4u/ai4UCheE/services/perry-engine && .venv/bin/pytest tests/test_phase6_distillation.py -v` exits `0` and prints `passed`.

### Task 6.3 — Build Interactive McCabe-Thiele SVG Canvas, Column Flooding Sketch & Workbench 4 (`DistillationWorkbench`)
- **Goal**: Create `src/actions/run-distillation.ts`, `src/components/sketches/mccabe-thiele-svg-canvas.tsx`, `src/components/sketches/column-flooding-svg-sketch.tsx`, and `src/components/workbenches/distillation-workbench.tsx` (`< 200` lines each).
- **Target files and symbols**:
  - `/Users/nad/ai4u/ai4UCheE/src/actions/run-distillation.ts` (`runDistillationAction`)
  - `/Users/nad/ai4u/ai4UCheE/src/components/sketches/mccabe-thiele-svg-canvas.tsx` (`McCabeThieleSvgCanvas`)
  - `/Users/nad/ai4u/ai4UCheE/src/components/sketches/column-flooding-svg-sketch.tsx` (`ColumnFloodingSvgSketch`)
  - `/Users/nad/ai4u/ai4UCheE/src/components/workbenches/distillation-workbench.tsx` (`DistillationWorkbench`)
- **Steps**:
  1. Write `src/actions/run-distillation.ts` registering `runDistillationAction` via `defineAction`.
  2. Write `src/components/sketches/mccabe-thiele-svg-canvas.tsx` (`< 200` lines) rendering an interactive $500 \times 500$ SVG diagram:
     - $45^\circ$ diagonal ($y = x$), VLE equilibrium curve ($y^*$), Rectifying & Stripping operating lines, $q$-line with a **draggable handle** (`onPointerMove` updating feed quality $q \in [-0.5, 1.5]$ in real time), and numbered theoretical stage staircase steps (`Stage 1..N`).
     - Each stage step is selectable via `useAgentSelectable('stage', 'stage-k', ...)`.
  3. Write `src/components/sketches/column-flooding-svg-sketch.tsx` (`< 200` lines) rendering a parametric distillation column vessel shell ($D_c$, tray spacing $h_t$, rectifying/stripping vapor-liquid traffic arrows, and `% Flood` hydraulic gauge bar with `Weeping / Normal / Flooding` zones).
  4. Write `src/components/workbenches/distillation-workbench.tsx` (`< 200` lines) implementing **2-Tier Progressive Disclosure**:
     - `Tier 1 (Shortcut / Learn Mode)`: McCabe-Thiele interactive canvas + Fenske-Underwood-Gilliland summary (`5 core inputs`: $\alpha, z_F, x_D, x_B, q, R/R_{\min}$).
     - `Tier 2 (Datasheet Rating / Plant Mode)`: Full Sec 14 Fair's Tray Rating & Eckert GPDC Packing Hydraulics + Perry's `Fig. 14-32` (`p. 14-37`) crop with calibrated $(F_{LV}, C_{sb})$ crosshair.
- **Success criteria**: `tsc --noEmit` passes and all four Phase 6 frontend files are strictly `< 200` lines each.
- **Verify**: `cd /Users/nad/ai4u/ai4UCheE && npx tsc --noEmit && awk 'END{if (NR>=200) exit 1}' src/components/sketches/mccabe-thiele-svg-canvas.tsx && awk 'END{if (NR>=200) exit 1}' src/components/workbenches/distillation-workbench.tsx && echo "WB4_OK"` exits `0` and prints `WB4_OK`.

## Todo

- [x] Task 6.1: Implement Perry's Sec 13 McCabe-Thiele Stage-Stepping & FUG Shortcut Solver (`solvers/distillation_mccabe.py`, 168 LOC) — `MCCABE_OK 1.1414 14`
- [x] Task 6.2: Implement Perry's Sec 14 Souders-Brown Tray Flooding & Eckert GPDC Packing Solver (`solvers/distillation_hydraulics.py`, 158 LOC + `routers/distillation_router.py`, 73 LOC) — 4/4 pytest passed (incl. live-PDF `verify_page_contains` for `14-37`, `14-57`, `14-58` and reflux surge `JET_FLOOD_DANGER`)
- [x] Task 6.3: Build Interactive McCabe-Thiele SVG Canvas (`145 LOC`), Column Flooding Sketch (`86 LOC`) & Workbench 4 (`DistillationWorkbench`, 129 LOC + `run-distillation.ts`, 34 LOC) — `WB4_OK`

## Success Criteria

- `solve_mccabe_thiele(0.5, 0.95, 0.05, 1.0, 1.3, 2.45, 100.0)` computes $R_{\min} \approx 1.14$ and `11–13` theoretical stages (`MCCABE_OK`).
- `pytest tests/test_phase6_distillation.py -v` exits `0` (`passed`).
- `McCabeThieleSvgCanvas`, `ColumnFloodingSvgSketch`, and `DistillationWorkbench` compile cleanly (`WB4_OK`) and stay `< 200` lines each.

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

<!-- Updated: Validation Session 1 - flooding chart corrected to Fair's Fig. 14-32 p. 14-37 (Fig. 14-26 is channel-baffle tray; Eq. 14-74/75 numbers dropped in favor of the verified figure anchor), Eckert Fig. 14-55 p. 14-57, Table 14-13 p. 14-58, Sec 13 anchors fixed (13-19 is a Figure; Fenske -> p. 13-36; q-line -> p. 13-14), R_min 1.18 -> 1.14 closed-form, added verify_page_contains assertions to test_phase6 -->
