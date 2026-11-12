# Phase 3 — Golden-Value Battery (JS vs Python Oracle)

## Context
- Parent: `../plan.md` (laws 4, 7, 9). Depends on Phase 0 (repaired oracle) —
  the battery's psig cases pin the FIXED gauge branch forever.
- Oracle runner (plan-review correction): PRIMARY =
  `services/perry-engine/.venv/bin/python` (exists; deps proven 2026-11-13) —
  same-tree truth, which is what an oracle wants. The VPS container fallback is
  DEMOTED to last resort and explicitly second-best: the deployed image is
  built from whatever commit last shipped and can silently differ from the
  working tree (live-server truth ≠ oracle truth).
- Precedent: the engine's own pytest suite covers the psig normalization
  hazard with an exact-value pin since Phase 0 — the battery mirrors that
  discipline across a committed grid.

## Overview
Priority P2 · Status Pending · Effort 0.25d · Depends on Phase 2.
Machine proof that the JavaScript port and the Python engine agree on a
committed input grid, to rel 1e-6, with mandatory psig/psia coverage. This is
the numeric-integrity asset that survives even if the lane parks (plan law 3).

## Requirements
- Grid: ≥ 20 DIPPR cases (spread compounds and temperatures, including each
  compound's T-range boundaries and water at 373.15 K) and ≥ 20 NPSHa cases
  with at least 5 NONZERO psig-input and 5 psia-input cases, plus: the
  equivalence pairs (10 psig ≡ 24.6959 psia; 0 psig ≡ 14.6959 psia), ≥ 1 barg
  or kpag case (pins the repaired branch), a vacuum case (negative psig), and
  a boiling/near-cavitation case.
- Comparison: relative tolerance 1e-6 (abs floor 1e-12 for near-zero values) on
  every numeric output field the JS exports for the same inputs.
- All checks are plain node/Python scripts — NOT vitest (law 9: vitest include
  pattern would silently never collect them).

## Architecture
```
gadget/oracle/input_grid.json   committed cases (the contract)
gadget/oracle/golden_battery.py imports perry-engine → expected.json
                               → subprocess `node gadget/src/cli-selftest.js` → exit code
gadget/src/cli-selftest.js      imports dippr.js/npsha.js, evaluates grid,
                                compares to expected.json, prints ALL GREEN or diff
```

## Related Code Files
| Path | Action | Change |
|---|---|---|
| `gadget/oracle/input_grid.json` | create | The committed case grid. |
| `gadget/oracle/golden_battery.py` | create | Oracle + driver. |
| `gadget/oracle/expected.json` | create (generated) | Oracle outputs; committed for auditability. |
| `gadget/src/cli-selftest.js` | create | JS-side evaluator + comparator. |

## Tasks

### Task 3.1 — Author the input grid
- Goal: a committed grid that makes transcription bugs impossible to miss.
- Target files: `gadget/oracle/input_grid.json`.
- Steps:
  1. DIPPR block: one case per compound minimum, plus temperature sweeps for
     water and two other compounds (≥ 20 total), each `{compound, temp_k}`.
  2. NPSHa block: ≥ 20 cases as `{p_suction_val, p_suction_unit, patm_psia,
     z_suction_m, hf_suction_m, p_vapor_pa, rho_kg_m3, npshr_m}` including the
     mandatory coverage: ≥ 5 NONZERO `psig` cases, ≥ 5 `psia` cases, the two
     equivalence pairs (10 psig / 24.6959 psia; 0 psig / 14.6959 psia), ≥ 1
     `barg` or `kpag` case, one negative-psig vacuum case, and one case with
     `p_vapor_pa` near the absolute suction pressure (margin ≈ 0 —
     status-flip zone).
- Success criteria: JSON parses; coverage counts hold.
- Verify: `python3 -c "import json;g=json.load(open('gadget/oracle/input_grid.json'));n=g['npsha'];print(len(g['dippr'])>=20 and len(n)>=20 and sum(1 for c in n if c['p_suction_unit']=='psig' and c['p_suction_val']!=0)>=5 and sum(1 for c in n if c['p_suction_unit']=='psia')>=5 and any(c['p_suction_val']<0 for c in n) and any(c['p_suction_val']==0 and c['p_suction_unit']=='psig' for c in n) and any(c['p_suction_unit'] in ('barg','kpag') for c in n))"`
  prints `True`.

### Task 3.2 — Oracle: Python truth
- Goal: `expected.json` holds the engine's answers for every grid case.
- Target files: `gadget/oracle/golden_battery.py`.
- Steps:
  1. `sys.path.insert(0, 'services/perry-engine')`; import
     `evaluate_all_dippr_properties` (or the three per-equation functions) and
     `evaluate_pump_npsha`.
  2. Evaluate the grid; write `gadget/oracle/expected.json` with the SAME field
     names the JS exports (agree on the contract in Phase 2 Task 2.1/2.2;
     document the mapping in this script's docstring).
  3. If the venv is somehow unusable (missing deps): last-resort fallback is
     the VPS engine container — record which path was used in the run log
     line, and prefer re-creating the venv over shipping a container-fallback
     `expected.json` (see Context: same-tree truth).
- Success criteria: `expected.json` exists, one record per grid case.
- Verify: `python3 gadget/oracle/golden_battery.py` exits 0 (it may print the
  container-fallback note; the file existence check is the pass).

### Task 3.3 — JS selftest + one-command driver
- Goal: one command proves agreement or fails loudly.
- Target files: `gadget/src/cli-selftest.js`; wiring in `golden_battery.py`.
- Steps:
  1. `cli-selftest.js`: dynamic-import `./dippr.js` and `./npsha.js`, read
     `input_grid.json` + `expected.json`, evaluate, compare every numeric field
     at rel 1e-6 (abs floor 1e-12); print one line per failing case with both
     values; on success print exactly `ALL GREEN` (case counts included).
  2. `golden_battery.py` ends by running
     `subprocess.run(['node', 'gadget/src/cli-selftest.js'])` and exiting with
     its return code, so ONE command is the whole battery.
- Success criteria: the single command exits 0 with `ALL GREEN` on the last line.
- Verify: `python3 gadget/oracle/golden_battery.py; echo "exit=$?"` → last line
  before `exit=` is `ALL GREEN` and `exit=0`.

### Task 3.4 — Artifact audit (re-run at battery time)
- Goal: the shipped file still passes the lane-laws audit.
- Steps: re-run the Phase 2 Task 2.4 audit greps against
  `gadget/dist/index.html`.
- Verify: all four conditions still hold (`data:font` ≥ 1; external refs = 0;
  storage/fetch APIs = 0; size < 10240 KB).

## Todo
- [ ] 3.1 Grid authored + coverage check
- [ ] 3.2 expected.json produced (path used: local|container — record)
- [ ] 3.3 One-command battery ALL GREEN
- [ ] 3.4 Dist audit re-verified

## Success Criteria
- `python3 gadget/oracle/golden_battery.py` → exit 0, final line `ALL GREEN`,
  including all mandatory psig/psia and boundary cases; dist audit clean.

## Risk Assessment
- Field-name drift between oracle and JS export (false greens): the contract
  mapping is documented in both files; the comparator asserts the field SET
  matches, not just intersecting keys.
- Container fallback path silently using a stale engine image: the run log line
  records the path; the VPS perry-engine image is the LIVE one by construction.

## Security Considerations
- None new: local scripts, no network, no credentials.

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
- Phase 4 (perf) consumes the same dist; run it next, then the combined
  2–4 kongming checkpoint.
