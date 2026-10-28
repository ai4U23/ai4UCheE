---
title: "Perry's Intelligent Workbench V1 7-Phase Implementation Plan (--advice --ultra)"
date: 2026-10-27
summary: Authored and validated 7-phase handover-ready implementation plan for perrys-agent-workbench under kongming supervision and best-of-5 ultra verification.
---

# Perry's Intelligent Workbench V1 7-Phase Implementation Plan (--advice --ultra)

## What happened
Completed `/ak:plan --advice --ultra` for **Perry's Intelligent Workbench** (`/Users/nad/ai4u/ai4UCheE`), grounded in `/Users/nad/ai4u/ai4UCheE/Perry's Chemical Engineers' Handbook, 9th Edition.pdf` (215 MB, 2,274 pages, 25 sections + Index). Spawned 5 independent candidate planners, evaluated all 5 via `kongming` Ultra Verifier (`winner: Candidate A` at 99/100), and wrote `plan.md` plus 7 separate phase files (`phase-01` through `phase-07`).

## Decision
- **Host & UI Stack**: `BuilderIO/agent-native` (React 19 + Vite + TypeScript + Express/Nitro + SQLite/Drizzle) paired with `motion/react` (`layoutId` shared-layout transitions, scrubbable number inputs) and Dual Theme (`#FAF8F5` EPC Paper vs `#0B101B` Control Room Blueprint).
- **Python ChE & PDF Sidecar (`services/perry-engine/`)**: `FastAPI` + `PyMuPDF` (`fitz`) + `chemicals` + `fluids` + `ht` + `thermo` + `CoolProp` + `SciPy` + `pint` + 3-stage `handcalcs` AST-to-KaTeX renderer.
- **Handover Contract**: Every phase file embeds granular numbered tasks with mechanical `Verify` pass commands, `<200` LOC file modularity enforcement, and the literal `## Failure Protocol` block escalating to `kongming`.

## Next steps
Execute `/ak:cook /Users/nad/ai4u/ai4UCheE/plans/261027-2242-perrys-intelligent-workbench/plan.md --advice` starting with Phase 1, Task 1.1.

> Historical work record — not durable authority. Prefer docs/specs/ADRs for current decisions.
