---
title: "Plan 261029-2335 cooked: bi-directional bus, white-box cards, missions, What-If copilot"
date: 2026-10-29
summary: "All 5 phases of the chemie interactive-UX plan implemented, verified (19/19 vitest, render-check 0/0, build OK, LOC gate) and committed be7e34c"
---

# Plan 261029-2335 cooked: bi-directional bus, white-box cards, missions, What-If copilot

## What happened
Executed `ak:cook --advice --auto --parallel` on the validated plan `plans/261029-2335-chemie-interactive-ux-and-live-copilot/` (validation session earlier today: 16/31 stale claims revised in place). Pre-committed the uncommitted working tree first (`a2ef921`) per the plan's action item, then implemented:
- Phase 01: `view-screen.ts` bi-directional bus (`syncWorkbenchPayload` per-workbench snapshots, `dispatchWorkbenchMutation` pub/sub, structured `<payload live="true">` XML) + `<WhiteBoxEquationCard/>` (Symbolic → Live Substitution → Evaluated Result, `eq-stage-*` testids).
- Phase 02: verbatim solver extraction into `hydraulics/thermo/distillation-solver-math.ts`; WB2 upgraded to true DIPPR Eq. 101/106 (A–E ported from `services/perry-engine/solvers/dippr_coeffs.py`); interactive `<DipprPhaseEnvelopeSvg/>`; WB1–WB4 wired to the bus via `use-workbench-mutations`; mission ids preserved (`mission-fanning-trap` etc.) with solver-verified trap/rescue values + `<MissionChecklistBanner/>`.
- Phase 03: additive two-tier copilot — `payload` in `CopilotRequestSchema`, `actionMutations?` in `CopilotResponse`, deterministic `copilot-scenario-parser.ts`, Tier-2 payload grounding + defensive `{"actionMutations": ...}` extraction, drawer mutation pills + quick actions.
- Phase 04: `calc-sheet-builder.ts` live QA/QC compiler feeding the existing `generateCalcSheetAction` flow; modal live rows + safety badge + Copy-Markdown.
- Phase 05: `phase9-interactive-intelligence.test.tsx` (6 tests → 19 total), `render-check.mjs` 0 errors/0 warnings (375/768/1440), clean build, `<200` LOC gate clean, docs sync (system-architecture, codebase-summary, design-guidelines, project-roadmap).

## Decision
- Kongming/code-simplifier subagent spawning was host-blocked ("unusual activity", 3 attempts) → advisory checkpoints noted, run continued under the skill's own failure gates; simplifier logged as unavailable (797-LOC delta / 23 files breached the Step-3.S threshold).
- One failed verification (phase7 pinned the old anchored-correlation values `101,325 Pa / 0.00 psig / 14.70 psia` at water 373.15 K). True DIPPR 101 = 101,261 Pa (−0.01 psig / 14.69 psia). Kept the locked true-DIPPR decision, added the `1 atm = 101,325 Pa` reference to the result line, re-pinned the psig/psia assertion with a citation comment. Not a weakening — strength preserved, 19/19 after.
- WB3 psig slider min extended −10 → −14 so the deep-vacuum cavitation trap sits in-bounds.
- phase-05 LOC-gate command fixed to exclude `.venv`/`__pycache__`/egg-info (original could never pass).

## Next steps
- Deploy to chemie VPS when ready (push main → restart systemd services; rollback `a2ef921`); Tier-2 stays dormant until `GATEWAY_API_KEY` is set.
- Optional: `/ak:plan archive 261029-2335-chemie-interactive-ux-and-live-copilot`.

> Historical work record — not durable authority. Prefer docs/specs/ADRs for current decisions.
