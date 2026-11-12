# Phase 0 — Oracle Defect Fix (Gauge-Pressure Conversion)

## Context
- Found by the 2026-11-13 plan-review kongming checkpoint; verified
  empirically same day with the engine's own venv:
  `2.0 psig → 13804.2105 psia` (truth 16.6959 — off ~827×);
  `1.0 barg → 14.6960 psia` (truth 29.1997 — gauge contribution erased);
  `psia` and `0 psig` correct (zero and the absolute branch hide the bug).
- Root cause, `services/perry-engine/core/unit_registry.py` line 66:
  `gauge_psia = value * _PSI_TO_PA if u == "psig" else value / _PSI_TO_PA`
  — a psi→Pa magnitude mislabeled as psia (psig), and a Pa-scale division
  (barg/kpag). The docstring and `datum_note` state the intended arithmetic
  (`P_abs = P_gauge + P_atm`), so this is a bug, not a convention.
- The engine's own test is blind to it:
  `services/perry-engine/tests/test_phase5_hydraulics.py`
  (`test_pump_npsha_psig_normalization_and_cavitation_trigger`) passes 2.0 psig
  but asserts only `npsha_m > 10.0` — both the correct (~12.6 m) and buggy
  (~9722 m) results pass.
- **Live impact (out of this plan's scope to deploy, MUST be reported to the
  owner)**: the deployed workbench NPSHa calculator
  (`src/components/workbenches/hydraulics-workbench.tsx` psig input path)
  computes garbage suction head for any nonzero psig entry on BOTH live
  deployments until the engine image is rebuilt with this fix. The fix commit
  heals them at the next engine rebuild — redeploying is a separate ritual.

## Overview
Priority P0 (blocks Phases 2–3) · Status Pending · Effort ~1h.
This phase is the recorded law-6 exception: exactly ONE logic line +
test-tightening in the existing engine, its own commit, before any gadget port.
Without it, Phase 3's mandatory psig cases fork the executor: JS correct →
battery fails; JS mirrors the bug → a student-facing cavitation calculator
canonizes 827×-wrong math.

## Requirements
- Fingerprint recorded (red), fix applied, exact-value assertion pinned,
  engine suite green, own commit. No other engine changes.

## Tasks

### Task 0.1 — Fingerprint (expected RED — this is the point)
- Goal: the defect demonstrated and recorded before touching anything.
- Steps:
  1. From `services/perry-engine/`, run with `./.venv/bin/python`:
     `normalize_pressure_to_pa(2.0, "psig")`, `(1.0, "barg")`,
     `(16.6959, "psia")`, `(0.0, "psig")` — print `value_psia` each.
  2. Compare to hand-truth: 16.6959 / 29.1997 / 16.6959 / 14.6959 psia.
- Success criteria: the psig/barg lines mismatch hand-truth (this RED state is
  the pass condition — a clean run means the bug is already fixed; skip to 0.3).
- Verify: command output shows psig `13804.21` (or any value ≠ 16.6959 ± 1e-3);
  record the four printed values in this file's summary.

### Task 0.2 — Tighten the engine test FIRST (expected RED against the bug)
- Goal: an exact-value pin that catches this defect class forever.
- Target files: `services/perry-engine/tests/test_phase5_hydraulics.py`
  (function `test_pump_npsha_psig_normalization_and_cavitation_trigger`).
- Steps:
  1. Extend the existing 2.0-psig case with the hand-derived exact expectation:
     `p_abs_psia = 2.0 + 14.6959`; `npsha_m == (p_abs_psia*6894.757293168 - 3169.0)/(998.2*9.80665) + 2.0 - 0.8`
     asserted `abs(actual - expected) < 1e-6` (derive in the test from
     constants, do not paste a magic number), plus `result["p_suction_abs_pa"]`
     ≈ 129,282 Pa ± 1 Pa and `is_gauge_converted is True`.
  2. Run the single test — it MUST FAIL (red). **Expected-red pass condition**:
     the run exits non-zero with an assertion error naming `npsha`. A pass here
     would mean the defect is already fixed — re-check 0.1 output.
- Success criteria: red run recorded.
- Verify: `./.venv/bin/python -m pytest tests/test_phase5_hydraulics.py -q` (cwd
  `services/perry-engine`) exits non-zero; output contains `AssertionError`.

### Task 0.3 — The one-line fix
- Goal: gauge magnitudes expressed in psia, mirroring the codebase's ureg idiom.
- Target files: `services/perry-engine/core/unit_registry.py` (the single line
  inside the `if u in GAUGE_PRESSURE_UNITS:` branch).
- Steps:
  1. Replace the line with:
     ```python
     gauge_psia = float(value) if u == "psig" else ureg.Quantity(
         value, "bar" if u == "barg" else "kPa"
     ).to("psi").magnitude
     ```
  2. Change nothing else in the function.
- Success criteria: fingerprint turns green (task 0.1 command now prints the
  hand-truth four-tuple).
- Verify: re-run the 0.1 command — psig prints `16.6959` ± 1e-3 and barg
  prints `29.1997` ± 1e-3.

### Task 0.4 — Suite green + own commit
- Goal: the fix proven harmless to the rest of the engine, committed alone.
- Steps:
  1. `./.venv/bin/python -m pytest tests -q` (cwd `services/perry-engine`) —
     full engine suite.
  2. Commit BY PATH:
     `git add services/perry-engine/core/unit_registry.py services/perry-engine/tests/test_phase5_hydraulics.py`
     with message `fix(perry-engine): gauge→absolute conversion (psig/barg/kpag) + exact-value test pin (261113 oracle fingerprint)`.
- Success criteria: suite green; one commit containing exactly those two files.
- Verify: pytest exits 0 (or the suite's documented pre-existing-failure count,
  if any — record it); `git show --stat --oneline HEAD` lists exactly 2 files.

## Todo
- [ ] 0.1 Fingerprint recorded (red)
- [ ] 0.2 Test pin red against the bug
- [ ] 0.3 One-line fix → fingerprint green
- [ ] 0.4 Suite green + own commit

## Success Criteria
- The tightened test would have failed on the old line (0.2's red proves it);
  fingerprint matches hand-truth; full engine suite green; single-purpose
  commit; owner informed of the live-workbench impact (this file's Context
  paragraph is the disclosure record).

## Risk Assessment
- Other callers depending on the buggy magnitudes: the function's consumers
  are the NPSHa path (garbage today — fix heals) and any white-box traces
  (display-only). The full suite is the guard.
- Live redeploy is NOT in this plan: both deployments keep computing the bug
  until the next engine image rebuild; the final report to the owner names
  this explicitly with the rebuild command reference (`deploy/docker-compose.yml`).

## Security Considerations
- None new (local logic fix + test).

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

(Note: Task 0.2's expected-red is NOT a Failure-Protocol trigger — it is the
stated pass condition. Only an unexpected green there triggers the protocol.)

## Next Steps
- Phases 2–3 unblocked (their psig/psia coverage now pins the repaired branch);
  kongming checkpoint: report Phase 0's red→green evidence with the phases 2–4
  boundary checkpoint.
