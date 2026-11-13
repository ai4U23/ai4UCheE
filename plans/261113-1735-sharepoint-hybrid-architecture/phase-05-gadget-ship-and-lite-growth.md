# Phase 5 — Gadget SHIP + Lite Growth (Optional)

## Context
- Parent: `../plan.md` (laws 1, 2, 9; gate GA). Resolves the 261113-0638 P5
  ship/kill gate: the owner's "go hybrid" locks **DECISION: SHIP** — the
  gadget becomes the native Lite core of the workbench surface.
- Live state (261113): pilot `SitePages/che-quick-calcs-pilot.html` published
  v1.0, render receipts PASS (water@353.15 → 972,832 kg/m³; NPSHa 0 psig →
  11,2271 m / AN TOÀN); battery 377/0; perf p95 12–13 ms; tenant cleaned.
- Evidence pack: `261113-0638/reports/pilot-2026-11-13.md` + screenshots +
  `probe-2026-11-13.md`.
- Lite growth law (from the 261113-0638 battery discipline): every ported
  calculator = printed-source transcription + golden battery vs the
  `services/perry-engine/.venv` oracle (rel 1e-6, mandatory unit-coverage) +
  plausibility sweep + the sandbox audit greps. No exceptions.

## Overview
Priority P2 · Status Pending · Effort 0.1d ship + ~0.5d per additional
calculator (optional growth, owner-picked) · Depends on GA (app-only writes).
Ship = promote the pilot to its final name + registry + decision record.
Growth = port the remaining workbench calculators into the same single-file
page (pipe 3-case hydraulics, control-valve Cv, pump system curve — sources
at `services/perry-engine/solvers/hydraulics_pipe.py`,
`hydraulics_pump_valve.py`; exact symbols verified 261113).

## Tasks

### Task 5.1 — SHIP record + promote

> **DECISION: SHIP 2026-11-13** (owner "go hybrid" — the gadget becomes the
> native Lite core). Evidence bundle: 261113-0638 pilot receipts (render
> PASS ×2: water@353.15 → 972,832 kg/m³; NPSHa 0 psig → 11,2271 m / AN TOÀN),
> battery 377/0, perf p95 12–13 ms. The PROMOTE leg (final-name upload +
> pilot delete) is GA-gated and parked for the 2026-11-14 06:20 canary.
- Goal: the decision recorded; the final page live.
- Steps:
  1. Write into `261113-0638/phase-05-…md` summary:
     `DECISION: SHIP 2026-11-14 (owner "go hybrid") — evidence: pilot receipts
     261113, battery 377/0, perf p95 13ms, render PASS ×2.`
  2. App-only: `Files/Add` the SAME byte-identical
     `gadget/dist/index.html` as `che-quick-calcs.html` (final name) +
     Publish; engine-delete the pilot file; record both receipts.
  3. Registry: add the surface entry (final name, native lane, quarterly
     sweep hook — the 261111-1048 P10 slot).
- Success criteria: final URL live; pilot 404; decision line exists.
- Verify: final URL 200 in IAB + `grep -c "DECISION: SHIP"
  plans/261113-0638-quick-calcs-html-pages/phase-05-pilot-and-ship-kill-gate.md`
  prints ≥1 + pilot listing shows 0 rows.

### Task 5.2 — Lite growth (per calculator, owner-picked; skip = fine)
- Goal: one more real calculator in the single native page.
- Steps per calculator (repeat verbatim each time):
  1. Read the printed handbook source for the exact equations/constants
     (render the PDF page; NEVER transcribe from memory) — the 261113 law
     that caught the water-density bug.
  2. Port to `gadget/src/<calc>.js`; extend `ui.js` (a tab per calculator or
     a grouped tab; two-calculator-tab structure may become a tab-group —
     keep files modest).
  3. Extend `gadget/oracle/input_grid.json` (+ its battery field contract) and
     `cli-selftest.js` comparisons; regenerate `expected.json` via the venv
     oracle; battery ALL GREEN (rel 1e-6; unit-trap cases mandatory).
  4. Rebuild (`node gadget/build.mjs`); re-run the full audit greps (fonts ≥1,
     external 0, net/storage 0, ≤10 MB) + the throttled perf gate
     (`gadget/tools/run-perf.sh`, p95 < 1500 ms).
  5. Re-publish the final page (`Files/Add` overwrite + Publish); IAB render
     receipt with one pre-written battery value per new calculator.
- Success criteria: battery + audits + perf all green; final page updated.
- Verify: battery prints `ALL GREEN`; audit greps print
  `fonts≥1 ext=0 net=0 KB<10240`; perf prints `1 passed`; render receipt has
  one `LITE_<calc>_PASS` line each.

### Task 5.3 — Growth bookkeeping
- Goal: scope kept honest.
- Steps: after each calculator, commit by path
  (`gadget/`, `tests/e2e/gadget-perf.spec.ts` if touched) with the battery
  counts in the message; update this file's Todo; declines recorded, not
  argued (the two-calculator law generalizes: growth is owner-picked, one at
  a time).
- Verify: `git log --oneline` shows one commit per calculator + this plan's
  files.

## Todo
- [ ] 5.1 SHIP record + promote to che-quick-calcs.html
- [ ] 5.2 Per-calculator growth (owner-picked list: ______)
- [ ] 5.3 Bookkeeping clean

## Success Criteria
Final native calculator page shipped under its permanent name with the
decision on record; any growth proven by the full battery discipline; the
261113-0638 plan closed `completed` with the SHIP line.

## Risk Assessment
- Page size growth toward the 10 MB cap: each calculator is a few KB of JS —
  no realistic risk; the audit grep still checks it every publish.
- ui.js file growth vs the <200-LOC law: `gadget/` is outside the app `src/`
  tree (261113-0638 law 10) but keep files readable; split per-calculator
  modules rather than growing one file.

## Security Considerations
- Same as shipped gadget: inert by construction; app-only publishes;
  coefficients/equations are technical data (no copyrightable expression).

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
- P6 cross-links `che-quick-calcs.html` ↔ the workbench embed page and folds
  the quarterly sweep slot.
