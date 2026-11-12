# Phase 2 — Calculators + Single-File Build

## Context
- Parent: `../plan.md` (laws 1, 4, 6, 7, 10).
- Python sources of truth (verified 2026-11-13, exact symbols):
  `services/perry-engine/solvers/thermo_dippr.py` — `evaluate_dippr_eq101_vp(compound, temp_k)`,
  `evaluate_dippr_eq106_hvap_t_c5(compound, temp_k)`, `evaluate_dippr_eq105_rhol(compound, temp_k)`,
  `evaluate_all_dippr_properties(...)` (line 152);
  `services/perry-engine/solvers/dippr_coeffs.py` — `DIPPR_COMPOUNDS` (line 15),
  `get_compound_dippr(compound)` (line 149);
  `services/perry-engine/solvers/hydraulics_pump_valve.py` —
  `evaluate_pump_npsha(p_suction_val, p_suction_unit, patm_psia=14.6959, z_suction_m=2.0,
  hf_suction_m=0.8, p_vapor_pa=3169.0, rho_kg_m3=998.2, npshr_m=3.0)` using
  `normalize_pressure_to_pa` (transcribe its unit set exactly — see `is_gauge_converted`).
- KaTeX is already a repo devDependency; woff2 fonts at
  `node_modules/katex/dist/fonts/` (verified).
- Reference tests naming edge hazards:
  `services/perry-engine/tests/test_phase4_thermo.py::test_water_nbp_dippr_properties`,
  `services/perry-engine/tests/test_phase5_hydraulics.py::test_pump_npsha_psig_normalization_and_cavitation_trigger`
  (exact-value pinned by Phase 0).
- **Port the repaired engine** (Phase 0's fix is a prerequisite — do NOT port
  from a tree where `2.0 psig → 13804 psia`).

## Overview
Priority P2 · Status Pending · Effort 0.75d · Depends on G1 only (parallel with
Phase 1; the lane verdict affects Phase 5, not this build).
Port the two calculations to plain JavaScript, wrap them in a Vietnamese two-tab
UI, and emit ONE self-contained `gadget/dist/index.html` with pre-rendered KaTeX
equations and base64-inlined fonts. Plain DOM, zero frameworks, ZERO Microsoft
libraries (law 1: version-drift surface we don't need).

## Requirements
- Functional: DIPPR tab (compound selector with every entry of
  `DIPPR_COMPOUNDS`, temperature input in K with sensible range, results for the
  eq-101/105/106 properties with units); NPSHa tab (suction pressure + unit
  selector matching `normalize_pressure_to_pa`'s unit set, z, h_f, p_vapor,
  rho, NPSH_r inputs with the engine's defaults pre-filled; result NPSH_a in m,
  margin, SAFE / CAVITATION_DANGER with the engine's exact thresholds
  `margin < 1.0 or ratio < 1.35`); "đổi đơn vị" hint; pre-rendered equations
  under each result.
- Non-functional: in-memory state only (cleared on reload — by construction,
  since the file contains no storage API calls); every interactive update
  synchronous and < 50 ms unthrottled; Vietnamese labels (match the workbench's
  tone; digits with VN comma decimal display only at the formatting edge —
  compute internally in plain IEEE floats).
- Budget: `gadget/dist/index.html` ≤ 10 MB (expect ≈ 0.4–0.7 MB).

## Architecture
```
gadget/src/dippr.js   COMPOUNDS (transcribed) + dipprEvaluate(compound, tempK) -> {vp, rhol, hvap, units...}
gadget/src/npsha.js   UNITS + npshaEvaluate(input) -> {npsha_m, margin_m, ratio, status}
gadget/src/ui.js      tabs, inputs, formatters, result render (pure DOM)
gadget/build.mjs      katex.renderToString(equations) + katex.min.css + woff2→base64 @font-face
                      + inline src/*.js → dist/index.html
```

## Related Code Files
| Path | Action | Change |
|---|---|---|
| `gadget/src/dippr.js` | create | Transcribed coefficients + eq 101/105/106 evaluation. |
| `gadget/src/npsha.js` | create | Pressure normalization + NPSH_a + cavitation status. |
| `gadget/src/ui.js` | create | Vietnamese two-tab UI, plain DOM. |
| `gadget/build.mjs` | create | Single-file builder with font inlining. |
| `gadget/dist/index.html` | create (generated) | The artifact. Not committed if > 1 MB — decide at commit time; the battery consumes it either way. |
| No existing app/server file changes. | — | — |

## Tasks

### Task 2.1 — Port DIPPR to JavaScript
- Goal: `dipprEvaluate(compound, tempK)` returns the same numbers as
  `evaluate_all_dippr_properties` for every compound.
- Target files: `gadget/src/dippr.js`.
- Steps:
  1. Read `solvers/dippr_coeffs.py`; transcribe `DIPPR_COMPOUNDS` verbatim into
     a `COMPOUNDS` const (values byte-identical; header comment cites the source
     file and its repo SHA at port time).
  2. Read `solvers/thermo_dippr.py`; port eq 101 (vp), 105 (rhol), 106 (hvap)
     arithmetic exactly. NOTE: the engine does NOT clamp T into [Tmin, Tmax] —
     it sets a `range_warning` instead; the ONLY clamp is eq 101's
     `exp(min(exponent, 60.0))` overflow guard, which the JS must mirror.
     Do not add a clamp the oracle lacks (the battery would catch it, at the
     cost of a confusing red).
  3. Export `COMPOUNDS` and `dipprEvaluate` (ES module; `build.mjs` bundles it).
- Success criteria: `node -e` smoke below runs and prints finite numbers.
- Verify: `node -e "import('./gadget/src/dippr.js').then(m=>{const r=m.dipprEvaluate('water',373.15);console.log(typeof r.vp_pa==='number'&&isFinite(r.vp_pa))})"`
  prints `true` (adjust the property key to the actual export; the check is
  "finite number for water at its normal boiling point").

### Task 2.2 — Port NPSHa to JavaScript
- Goal: `npshaEvaluate(input)` mirrors `evaluate_pump_npsha` including the
  psig↔psia normalization hazard.
- Target files: `gadget/src/npsha.js`.
- Steps:
  1. Read `normalize_pressure_to_pa` (locate via
     `grep -rn "def normalize_pressure_to_pa" services/perry-engine/`); port it
     and its supported unit strings exactly; default `patm_psia = 14.6959`.
  2. Port the NPSH_a formula and status exactly:
     `npsha = (p_abs_pa - p_vapor_pa)/(rho*9.80665) + z - hf`;
     `status = CAVITATION_DANGER if (margin < 1.0 or ratio < 1.35) else SAFE`.
  3. Export `UNITS`, `npshaEvaluate`.
- Success criteria: a NONZERO psig case and its psia equivalent agree exactly —
  the equivalence pair `10 psig` vs `24.6959 psia` (plan-review correction: the
  original 0-psig smoke was the multiplicative-identity case where the
  Phase 0 defect hid; zero stays as an extra case, never the only one).
- Verify: `node -e "import('./gadget/src/npsha.js').then(m=>{const g=m.npshaEvaluate({p_suction_val:10,p_suction_unit:'psig'});const a=m.npshaEvaluate({p_suction_val:24.6959,p_suction_unit:'psia'});console.log(Math.abs(g.npsha_m-a.npsha_m)<1e-9)})"`
  prints `true`.

### Task 2.3 — Vietnamese UI (plain DOM)
- Goal: both calculators usable in Vietnamese with live results.
- Target files: `gadget/src/ui.js`.
- Steps:
  1. Two tabs: "Tra cứu tính chất (DIPPR)" and "NPSHa bơm". Labels Vietnamese;
     inputs carry unit selectors where units exist; results update on `input`
     events.
  2. Pre-rendered equation placeholders `<div data-eq="...">` filled by the
     builder (Task 2.4); a "đổi đơn vị" hint near the pressure input.
  3. No storage, no fetch, no timers beyond `input` handlers, no frameworks.
- Success criteria: opening the built file locally shows both tabs working
  (covered mechanically by Phase 3/4; here: code review against requirements).
- Verify: `no verification needed` (Phase 3 battery + Phase 4 perf cover it).

### Task 2.4 — Builder with KaTeX + font inlining (the law-1 core)
- Goal: one self-contained file, equations pre-rendered, fonts base64-inlined.
- Target files: `gadget/build.mjs` → output `gadget/dist/index.html`.
- Steps:
  1. `import katex from 'katex'` (repo node_modules) and render each equation
     (DIPPR eq forms, NPSH_a definition, the gauge-conversion identity) with
     `renderToString(..., {output: 'html'})` into template slots.
  2. Read `node_modules/katex/dist/katex.min.css`; rewrite every
     `url(fonts/KaTeX_*.woff2)` reference to a `data:font/woff2;base64,...`
     URI built from `node_modules/katex/dist/fonts/KaTeX_*.woff2` (woff2 only —
     the ttf/woff fallbacks in the same rules may be dropped to save size).
  3. Inline `dippr.js`/`npsha.js`/`ui.js` bodies into `<script>` tags (no
     modules needed — concatenate in dependency order inside one script).
  4. Write `gadget/dist/index.html`; print its size.
- Success criteria: build exits 0; artifact under budget; zero external refs;
  zero storage/fetch APIs; at least one inlined font.
- Verify: all of
  `node gadget/build.mjs` exits 0;
  `du -k gadget/dist/index.html` prints < 10240;
  `grep -c "data:font/woff2;base64" gadget/dist/index.html` prints ≥ 1;
  `grep -cE '(src|href)="https?://' gadget/dist/index.html` prints `0`;
  `grep -cE 'fetch\(|localStorage|sessionStorage|document\.cookie' gadget/dist/index.html` prints `0`.

## Todo
- [ ] 2.1 dippr.js ported + smoke
- [ ] 2.2 npsha.js ported + psig/psia equivalence smoke
- [ ] 2.3 ui.js Vietnamese two tabs
- [ ] 2.4 build.mjs + dist audit all green

## Success Criteria
- The four Task 2.4 Verify conditions hold simultaneously; `file://` open shows
  Vietnamese labels and renders equations in KaTeX fonts (eyeball check, the
  owner re-checks in Phase 5).

## Risk Assessment
- Transcription slips in coefficients (silent wrong answers): Phase 3 exists to
  catch exactly this; transcribe programmatically where possible (generate the
  JS const from the Python dict via a one-off script — keep the script in
  `gadget/tools/` if used).
- KaTeX font subset mismatch (equations render with wrong glyphs): inlining the
  full standard woff2 set (Main, Math, Size1–4, AMS) avoids subsetting bugs.

## Security Considerations
- The artifact is inert by construction (no network, no storage, no eval);
  coefficient data is factual (law 7).

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

## Next Steps
- Phase 3 consumes `gadget/src/*.js` (battery) and `gadget/dist/index.html`
  (audit); Phase 4 consumes `gadget/dist/`. Kongming checkpoint after the
  phase-4 pass (phases 2–4 report together at their boundary).
