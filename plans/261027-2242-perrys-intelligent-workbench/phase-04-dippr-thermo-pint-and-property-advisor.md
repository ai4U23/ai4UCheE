---
title: "Phase 4: Sec 1, 2 & 4 DIPPR Thermophysical Property Engine, Mixed Field-Unit Normalizer & Carlson's Property Advisor (WB2)"
status: todo
---

# Phase 4: Sec 1, 2 & 4 DIPPR Thermophysical Property Engine, Mixed Field-Unit Normalizer & Carlson's Property Advisor (WB2)

## Overview

Implement the *Perry's 9th Ed.* Section 2 DIPPR correlation solver (`Table 2-8` Vapor Pressure Eq. 101 (pp. `2-53` ff.), `Table 2-69` Heat of Vaporization Eq. 106 (pp. `2-120` ff., J/kmol) with exact $T_r^{C_2 + C_3 T_r + C_4 T_r^2 + C_5 T_r^3}$ evaluation, `Table 2-32` Liquid Density Eq. 105 (pp. `2-93` ff.), Ideal Gas $C_p$ Eq. 107, Liquid Viscosity Eq. 101) backed by `chemicals`/`CoolProp` + high-DPI PDF table row proof crops (`Sec 2`), paired with Eric Carlson's (*"Don't Gamble With Physical Properties"*, *CEP* 1996 / Perry's Sec 4) Property Package Decision Tree Advisor. Every code file MUST remain `< 200` lines.

## Requirements

- [ ] Curated *Perry's* Sec 2 DIPPR coefficients (`solvers/dippr_coeffs.py`) and exact 5-parameter $T^{C_5}$ solver (`solvers/thermo_dippr.py`) with 3-stage `handcalcs` KaTeX steps and `[T_min, T_max]` range validation.
- [ ] Carlson's (1996) / Perry's Sec 4 Property Package Decision Tree (`solvers/carlson_tree.py`) with explicit warnings against `Wilson` for LLE and `NRTL-HOC` recommendation for carboxylic acid vapor dimerization.
- [ ] FastAPI Thermo Router (`routers/thermo_router.py`) + `tests/test_phase4_thermo.py`.
- [ ] Workbench 2 frontend (`src/components/workbenches/thermo-dippr-workbench.tsx`) & Zod action (`src/actions/query-dippr.ts`).

## Implementation Steps

### Task 4.1 — Implement Curated Perry's Sec 2 DIPPR Coefficient Table & Exact $T^{C_5}$ Solver (`solvers/dippr_coeffs.py` & `solvers/thermo_dippr.py`)
- **Goal**: Build `services/perry-engine/solvers/dippr_coeffs.py` and `services/perry-engine/solvers/thermo_dippr.py` (`< 200` lines each) evaluating Perry's Section 2 DIPPR Equations 100, 101, 105, 106 (including $C_5$), and 107 with 3-stage `handcalcs` KaTeX output and automatic `T_min <= T <= T_max` bounds checking.
- **Target files and symbols**:
  - `/Users/nad/ai4u/ai4UCheE/services/perry-engine/solvers/dippr_coeffs.py` (`DIPPR_COMPOUNDS`, `get_compound_dippr()`)
  - `/Users/nad/ai4u/ai4UCheE/services/perry-engine/solvers/thermo_dippr.py` (`evaluate_dippr_eq101_vp()`, `evaluate_dippr_eq106_hvap_t_c5()`, `evaluate_dippr_eq105_rhol()`, `evaluate_all_dippr_properties()`)
- **Steps**:
  1. Populate `solvers/dippr_coeffs.py` with verified *Perry's 9th Ed.* Section 2 coefficients (`Table 2-8` "Vapor Pressure of Inorganic and Organic Liquids, ln P = C1 + C2/T + C3 ln T + C4 T^C5, P in Pa", pp. `2-53` ff.; `Table 2-69` "Heats of Vaporization of Inorganic and Organic Liquids (J/kmol)", pp. `2-120` ff.; `Table 2-32` "Densities of Inorganic and Organic Liquids (mol/dm³)", pp. `2-93` ff.) — coefficients (`C1..C5`, `T_min`, `T_max`, `Tc`, `Pc`, `MW`, `omega`, `sec_page_vp`, `sec_page_hvap`) for benchmark process fluids: `water`, `benzene`, `toluene`, `ethanol`, `methanol`, `acetone`, `n-hexane`, `n-heptane`, `ammonia`, `methane` (with fallback to `chemicals` / `CoolProp` for 1,000+ additional CAS fluids).
  2. In `solvers/thermo_dippr.py`, implement:
     - **DIPPR Eq. 101 (Vapor Pressure, Table 2-8, Pa)**:
       $$P_{vp} = \exp\left(C_1 + \frac{C_2}{T} + C_3 \ln(T) + C_4 T^{C_5}\right)$$
       Render 3-stage `handcalcs` step with citation `[Perry's 9th Ed., Table 2-8 (DIPPR Eq. 101), p. 2-53]`.
     - **DIPPR Eq. 106 (Heat of Vaporization $\Delta H_{vap}$, Table 2-69, J/kmol) with full $C_5$ exponent polynomial**:
       $$\Delta H_{vap} = C_1 \left(1 - T_r\right)^{C_2 + C_3 T_r + C_4 T_r^2 + C_5 T_r^3}, \quad T_r = \frac{T}{T_c}$$
       Render 3-stage `handcalcs` step explicitly showing $T_r$ and $C_1..C_5$ with citation `[Perry's 9th Ed., Table 2-69 (DIPPR Eq. 106), p. 2-120]`.
     - **DIPPR Eq. 105 (Liquid Molar Density $\rho_L$, Table 2-32, kmol/m³)**:
       $$\rho_L = \frac{C_1}{C_2^{1 + (1 - T/C_3)^{C_4}}}$$
       Cite `[Perry's 9th Ed., Table 2-32 (DIPPR Eq. 105), p. 2-93]`.
  3. Enforce strict temperature range validation (`T_min <= T <= T_max`): if `T` is outside the tabulated DIPPR validity window, set `range_warning: True` with the exact `[T_min, T_max]` K bounds and fall back to `CoolProp` Helmholtz EOS reference calculation for comparison.
- **Success criteria**: At `T = 373.15 K`, `water` DIPPR Eq. 101 yields $P_{vp} \approx 101,325\text{ Pa}$ (`±0.5%`) and Eq. 106 yields $\Delta H_{vap} \approx 4.065 \times 10^7\text{ J/kmol}$ (`±1%`), both accompanied by 3-stage KaTeX equations and Perry's citations.
- **Verify**: `PYTHONPATH=/Users/nad/ai4u/ai4UCheE/services/perry-engine /Users/nad/ai4u/ai4UCheE/services/perry-engine/.venv/bin/python -c "from solvers.thermo_dippr import evaluate_all_dippr_properties; res = evaluate_all_dippr_properties('water', 373.15, 'K'); assert abs(res['vapor_pressure_pa'] - 101325) < 600 and abs(res['hvap_j_kmol'] - 4.065e7) < 5e5; print('DIPPR_SOLVER_OK', res['vapor_pressure_pa'])"` exits `0` and prints `DIPPR_SOLVER_OK`.

### Task 4.2 — Implement Carlson's Property Package Decision Tree Advisor (`solvers/carlson_tree.py`) & Thermo Router
- **Goal**: Build `services/perry-engine/solvers/carlson_tree.py` and `services/perry-engine/routers/thermo_router.py` (`< 200` lines each) implementing Carlson's 1996 / Perry's Sec 4 thermodynamic model selector (`Peng-Robinson`, `SRK`, `NRTL`, `UNIQUAC`, `UNIFAC`, `NRTL-HOC` for carboxylic acid vapor dimerization, `Electrolyte-NRTL`, `IAPWS-95 Steam Tables`).
- **Target files and symbols**:
  - `/Users/nad/ai4u/ai4UCheE/services/perry-engine/solvers/carlson_tree.py` (`advise_carlson_method()`, `CarlsonRecommendation`)
  - `/Users/nad/ai4u/ai4UCheE/services/perry-engine/routers/thermo_router.py` (`router`)
  - `/Users/nad/ai4u/ai4UCheE/services/perry-engine/tests/test_phase4_thermo.py`
- **Steps**:
  1. Write `solvers/carlson_tree.py` evaluating system flags (Perry's Sec 4 anchors verified against the live PDF):
     - `is_pure_water`: recommends `IAPWS-95 / ASME Steam Tables` via `CoolProp` (`[Perry's 9th Ed., Sec. 2 water tables (Table 2-31), p. 2-92]`).
     - `has_electrolytes`: recommends `Electrolyte-NRTL (eNRTL) / Pitzer` (`[Perry's 9th Ed., Sec. 4, p. 4-4]` — electrolyte systems note; eNRTL itself is modeled in the simulator, not tabulated in Perry's).
     - `polarity == "nonpolar"` and `pressure_bar < 10`: recommends `Peng-Robinson (PR) or Soave-Redlich-Kwong (SRK)` (`[Perry's 9th Ed., Sec. 4 (SRK & PR equations of state), p. 4-12]`).
     - `polarity == "polar_non_electrolyte"` and `pressure_bar < 10`:
       - If `has_vapor_association` (e.g., acetic/formic acid): recommends `NRTL + Hayden-O'Connell (NRTL-HOC)` for vapor-phase dimerization.
       - If `has_liquid_liquid_split` (`LLE`): recommends `NRTL` or `UNIQUAC` (explicitly warning **against** `Wilson`, which mathematically cannot predict two liquid phases!).
       - Otherwise: recommends `Wilson / NRTL / UNIQUAC` (with `UNIFAC` group-contribution fallback if binary interaction parameters $k_{ij}$ are missing). Anchor the activity-model discussion at `[Perry's 9th Ed., Sec. 4 (Margules, Wilson, NRTL, UNIQUAC), p. 4-18]`.
     - Returns `decision_path: list[str]`, `recommended_package: str`, `warnings: list[str]`, and `citation: str`.
  2. Create `routers/thermo_router.py` exposing `POST /api/v1/thermo/dippr` (including optional composite PDF table row proof crop of the Perry's Table 2-8/2-69 page via `render_table_row_composite_crop`) and `POST /api/v1/thermo/carlson-advisor`. Mount in `main.py`.
  3. Write `services/perry-engine/tests/test_phase4_thermo.py` testing DIPPR equations, out-of-range temperature warning, and Carlson's LLE Wilson warning + carboxylic acid `NRTL-HOC` path. Include citation-verification assertions using `pdf.section_map.verify_page_contains`: `verify_page_contains('2-53', 'TABLE 2-8')`, `verify_page_contains('2-120', 'TABLE 2-69')`, and `verify_page_contains('2-93', 'TABLE 2-32')` must all return `True`.
- **Success criteria**: `pytest tests/test_phase4_thermo.py` passes all tests.
- **Verify**: `cd /Users/nad/ai4u/ai4UCheE/services/perry-engine && .venv/bin/pytest tests/test_phase4_thermo.py -v` exits `0` and prints `passed`.

### Task 4.3 — Build Workbench 2 Frontend (`ThermoDipprWorkbench`) & Action (`src/actions/query-dippr.ts`)
- **Goal**: Create `src/actions/query-dippr.ts` and `src/components/workbenches/thermo-dippr-workbench.tsx` (`< 200` lines each) combining DIPPR property evaluation, 3-stage KaTeX equations, Perry's Sec 2 table proof crop, mixed field-unit converter, and Carlson's interactive decision tree.
- **Target files and symbols**:
  - `/Users/nad/ai4u/ai4UCheE/src/actions/query-dippr.ts` (`queryDipprAction`, `queryCarlsonAdvisorAction`)
  - `/Users/nad/ai4u/ai4UCheE/src/components/workbenches/thermo-dippr-workbench.tsx` (`ThermoDipprWorkbench`)
- **Steps**:
  1. Write `src/actions/query-dippr.ts` registering `queryDipprAction` and `queryCarlsonAdvisorAction` via `defineAction`.
  2. Write `src/components/workbenches/thermo-dippr-workbench.tsx` (`< 200` lines) with:
     - Compound selector + `ScrubbableNumberInput` for Temperature (with `K / °C / °F / °R` unit selector) and Pressure (`psig / psia / bar / kPa`).
     - 3-Stage KaTeX equation cards (`Symbolic -> Substituted -> Result + Citation`) wrapped in `useAgentSelectable('equation', ...)`.
     - Interactive Carlson's Property Method Advisor panel showing the active decision path and LLE/association warnings.
     - Embedded *Perry's* Sec 2 (`Table 2-8` / `2-69`) PDF proof crop viewer.
- **Success criteria**: `tsc --noEmit` passes and `thermo-dippr-workbench.tsx` is `< 200` lines.
- **Verify**: `cd /Users/nad/ai4u/ai4UCheE && npx tsc --noEmit && awk 'END{if (NR>=200) exit 1}' src/components/workbenches/thermo-dippr-workbench.tsx && echo "WB2_OK"` exits `0` and prints `WB2_OK`.

## Todo

- [x] Task 4.1: Implement Curated Perry's Sec 2 DIPPR Coefficient Table & Exact $T^{C_5}$ Solver (`solvers/dippr_coeffs.py` & `solvers/thermo_dippr.py`, 159+180 LOC) — `DIPPR_SOLVER_OK 101260.56`
- [x] Task 4.2: Implement Carlson's Property Package Decision Tree Advisor (`solvers/carlson_tree.py`, 126 LOC) & Thermo Router (`routers/thermo_router.py`, 70 LOC) — 6/6 pytest passed (incl. live-PDF `verify_page_contains` for Tables 2-8/2-69/2-32)
- [x] Task 4.3: Build Workbench 2 Frontend (`ThermoDipprWorkbench`, 171 LOC) & Action (`src/actions/query-dippr.ts`, 46 LOC) — `WB2_OK`

## Success Criteria

- `evaluate_all_dippr_properties('water', 373.15, 'K')` matches normal boiling point vapor pressure ($101,325\text{ Pa}$) and heat of vaporization ($4.065 \times 10^7\text{ J/kmol}$) (`DIPPR_SOLVER_OK`).
- `pytest tests/test_phase4_thermo.py -v` exits `0` (`passed`).
- `ThermoDipprWorkbench` compiles cleanly (`WB2_OK`) and stays strictly `< 200` lines.

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

<!-- Updated: Validation Session 1 - re-anchored DIPPR tables to verified artifacts (Table 2-8 p. 2-53 VP, Table 2-69 p. 2-120 Hvap J/kmol, Table 2-32 p. 2-93 density; old 2-141/2-150 numbers were diffusivity/thermal-conductivity tables), Carlson citations grounded (p. 2-92, p. 4-4, p. 4-12, p. 4-18; fake Table 2-305 p. 2-414 removed), added verify_page_contains citation assertions to test_phase4 -->
