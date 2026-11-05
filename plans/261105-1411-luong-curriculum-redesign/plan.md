---
title: "Lương Curriculum Redesign — Causal Tree, Phase×Domain Matrix, Lab Sessions, Tier Rubric"
description: "Implements all 9 locked decisions from the 2026-11-05 Lương feedback walkthrough on the 24-Real-Life Problem Library + 6-Stage Fogler Studio"
status: completed
priority: P1
effort: 3h
tags: [curriculum, problem-library, taxonomy, troubleshooting-studio, i18n]
blockedBy: []
blocks: []
created: 2026-11-05
---

# Lương Curriculum Redesign

## Overview

Restructure how the 24-Real-Life Problem Library and the 6-Stage Fogler & LeBlanc studio **present** diagnostic reasoning, without touching problem content, numbering, or existing filters. Four user-visible additions: (1) an explicit 4-tier rubric panel, (2) a per-problem taxonomy (lifecycle phase × cause domain, 6 domains), (3) a Stage-5 causal hypothesis tree with pre-authored consequence predictions, (4) a "Buổi thực hành" lab-session view grouped by 6 course topics plus a phase×domain coverage matrix with spoiler gating.

**This plan is authored under the `--advice` handover contract**: every phase decomposes into tasks with mechanical pass conditions and a literal Failure Protocol, ready for a downstream executor model. The executor reads `plan.md` and the phase files only.

## Locked Decisions (user-confirmed 2026-11-05, slow walkthrough session)

| # | Decision | Value | Source |
|---|----------|-------|--------|
| A2 | Consequence slot on tree branches | **Pre-authored** "if H correct → we'd observe X" text, visible pre-verdict. MUST follow the authoring rule: neutral prediction, never verdict keywords (enforced by unit test wordlist) | Issue 1 |
| B | Tree placement | Tree = the Stage-5 view (replaces flat hypothesis cards) + a 1-line mini-map visible from Stage 1; Stages 1–4 untouched | Issue 1 |
| C | Candidate enumeration | 3 authored hypotheses only; no student-authored branches, no free-text grading | Issue 1 |
| D1 | causeDomain value set | Lương's 5 (process-limit / equipment / operating-conditions / catalyst / control) + 6th `convention-procedure` + boolean `caseStudy` badge | Issue 2 |
| E | Tagging rule | ONE dominant domain per problem; rationale recorded in this plan's audit table (phase-02) for Lương's review | Issue 2 |
| F′ | Spoiler gate | Matrix cell counts always visible; problem chips only for solved problems; local "Chế độ giảng viên" toggle inside the matrix reveals all chips (NOT a new persona — existing personas are `learn \| plant` only) | Issue 2 |
| G | Entry axis | The 5 observation-based symptom groups stay as the library's primary entry; no new filter facets | Issue 2 |
| H=6 | courseTopic values | 6 topics, truyền nhiệt split from fluids: thermo / fluids / heat-transfer / separations / reaction / design-control-safety | Issue 3 |
| I | Session view | Additive second view in the browser ("Thư viện / Buổi thực hành"); session headers from curriculum metadata; L1→L4 order inside; global numbering #1–24 kept | Issue 3 |
| J | In-session progression | Soft recommended ordering (no hard unlock); hard mode later = flag flip | Issue 3 |

## Non-Goals (do NOT do)

- No renumbering of problems, no new problems (control-domain + more L4 = backlog for Lương), no content rewriting of the 24 entries.
- No new filter facets (taxonomy lives in matrix/sessions views only).
- No new store state (consequences are static data; verdicts already persisted in `hypothesis-verification-engine`).
- No diagram library — tree is a vertical CSS-indent tree.
- No changes to routes, robots.txt, sitemap.xml, llms.txt (no new routes are added).

## Goals

| # | Goal | Priority |
|---|------|----------|
| 1 | Tier rubric panel visible in the library browser (EN+VI), content verbatim from `PROGRESSION_TIER_META` | P1 |
| 2 | All 24 problems tagged `courseTopic`/`lifecyclePhase`/`causeDomain`/`caseStudy` per the audit table below; audit table deliverable for Lương | P1 |
| 3 | Stage-5 causal tree with pre-verdict consequence text, verdict-gated reveals, prune states; existing e2e testids preserved | P1 |
| 4 | Phase×Domain matrix (counts always, chips gated on solved, teacher toggle) + 6-session lab view | P1 |
| 5 | All gates green: `npm test`, `npm run typecheck`, `npm run build`, LOC < 200 on every touched/new file, phase17+phase19 untouched-and-green | P1 |

## Phase-2 Audit Table (authored by planner; executor transcribes verbatim)

Session totals: thermo 5 · fluids 3 · heat-transfer 2 · separations 3 · reaction 8 · design-control-safety 3 = 24 ✓
Phase totals: design-audit 6 · operation 18 ✓ — Domain totals: convention-procedure 6 · process-limit 5 · equipment 3 · operating-conditions 7 · catalyst 2 · control 1 ✓

| # | problemId | courseTopic | lifecyclePhase | causeDomain | caseStudy | rationale (dominant-cause note) |
|---|-----------|-------------|----------------|-------------|-----------|--------------------------------|
| 1 | prob-01-fanning-darcy-audit | fluids | design-audit | convention-procedure | — | f_D entered into f_F slot; paper audit, no physical fault |
| 2 | prob-02-subcooled-jacket-boil | thermo | design-audit | convention-procedure | — | 0 psig misread as zero pressure; spec-check misconception |
| 3 | prob-03-butane-isomerization-oops | thermo | design-audit | process-limit | — | design ignored P_sat(360 K) — thermodynamic saturation limit |
| 4 | prob-04-wilson-lle-decanter-trap | thermo | design-audit | convention-procedure | — | wrong activity model (Wilson cannot LLE) — methodology error |
| 5 | prob-05-high-pressure-eos-z-trap | thermo | design-audit | process-limit | — | Z ≪ 1 at P_r 1.5 — ideal-gas validity limit (physics, not typo) |
| 6 | prob-06-pump-cavitation-boiler-hx | fluids | operation | operating-conditions | — | startup at 450 gpm / −10 psig suction crashed NPSHa |
| 7 | prob-07-isa-control-valve-choked | fluids | operation | control | — | control-loop actuator saturation (ISA ΔP_max ceiling) |
| 8 | prob-08-hx-temperature-cross-ft | heat-transfer | operation | equipment | — | 1-2 shell config pushed past Bowman F_T cliff |
| 9 | prob-09-distillation-fair-flooding | separations | operation | equipment | — | 0.55 m column at ~200% Fair flood — shell capacity ceiling |
| 10 | prob-10-mccabe-feed-q-upset | separations | operation | operating-conditions | — | feed preheater trip → q = 1.35 floods stripping section |
| 11 | prob-11-kremser-absorber-pinch | separations | operation | operating-conditions | — | L/V below absorption-factor pinch at 95% flood |
| 12 | prob-12-cooling-tower-wetbulb-pinch | heat-transfer | operation | process-limit | — | wet-bulb thermodynamic floor — no equipment fix exists |
| 13 | prob-13-catalytic-pore-and-runaway | reaction | operation | catalyst | — | oversized pellets (φ = 5.5) starve 55% of catalyst |
| 14 | prob-14-monsanto-t2-batch-runaway | reaction | operation | operating-conditions | — | 3× charge + lost cooling (ψ = 0.78); concrete fault chain, no badge |
| 15 | prob-15-ethylene-pbr-ergun-dp | reaction | operation | equipment | — | Ergun bed ΔP stall dominates (psig trap is the woven L1 bait) |
| 16 | prob-16-trambouze-series-selectivity | reaction | operation | operating-conditions | — | X = 0.94 past τ_opt — over-conversion selectivity collapse |
| 17 | prob-17-chemostat-monod-washout | reaction | operation | operating-conditions | — | D = 0.55 h⁻¹ > D_wash — dilution-rate cliff |
| 18 | prob-18-photolithography-pag-poisoning | reaction | operation | catalyst | — | trace base neutralizes photogenerated acid catalyst |
| 19 | prob-19-lake-nyos-co2-eruption | thermo | operation | process-limit | ✔ | natural system (phase-equilibrium showcase); phase tag is a stretch — noted for Lương |
| 20 | prob-20-bhopal-mic-relief-runaway | design-control-safety | operation | convention-procedure | — | psig-instead-of-psia relief under-prediction dominates the sizing fault |
| 21 | prob-21-api520-psv-datum-trap | design-control-safety | design-audit | convention-procedure | — | API 520 datum/unit audit trap |
| 22 | prob-22-dispersion-pasquill-plume | design-control-safety | operation | process-limit | ✔ | environmental DO-floor phenomenon teaching (Streeter-Phelps) |
| 23 | prob-23-electrolyzer-butler-volmer | reaction | operation | convention-procedure | — | chart misread 4× (userReading 1.8 vs η = 0.48) — nomograph error |
| 24 | prob-24-aiche-chem-e-car-clock | reaction | operation | operating-conditions | ✔ | Arrhenius k(T) drift with ambient T (flippable to `control` at Lương's audit — noted) |

Known honest gaps to surface to Lương (non-blocking): heat-transfer session has only 2 problems; control domain has 1; L4 exists only in sessions reaction(2) + design-control-safety(1). All three = roadmap cells credited to his feedback (EU cold-storage control incident referenced in the matrix footnote).

## Phases

| # | Phase | Status |
|---|-------|--------|
| 1 | [Tier Rubric Panel](./phase-01-tier-rubric-panel.md) | Completed |
| 2 | [Taxonomy Metadata + 24-Problem Tagging](./phase-02-taxonomy-metadata-and-tagging.md) | Completed |
| 3 | [Causal Hypothesis Tree (A2+B)](./phase-03-causal-hypothesis-tree.md) | Completed |
| 4 | [Phase×Domain Matrix + Lab Sessions](./phase-04-matrix-and-lab-sessions.md) | Completed |
| 5 | [Full Verification + Docs Sync](./phase-05-verification-docs-and-sync.md) | Completed |

## Extension trace

Boundary created: `ProblemTaxonomyTags` keyed by `problemId` (phase 2) + consequence copy keyed by `caseId:hypId` (phase 3). Credible next variant: **adding new control-domain problems** (EU cold-storage backlog). Contract that stays stable: a new catalog entry + its tag row + its consequence rows — matrix cells, session blocks, and count badges all derive from `ALL_24_REAL_LIFE_PROBLEMS.length` at render time (asserted by the phase-21 test using data length, never a hardcoded 24). Pieces that must change: only the data files. The plan proves this by keeping every new component data-driven from day one.

## Execution notes for the executor (read once)

- Run all commands from repo root `/Users/nad/ai4u/ai4UCheE`.
- Before any UI edit, read `DESIGN.md` and `REVIEW.md` (repo invariant 7).
- LOC ceiling 199 per file (repo invariant 2). Every phase's final Verify includes an `wc -l` check.
- i18n rule: all new user-visible strings are bilingual `Record<LocaleCode, string>`; VI ships with EN in the same phase.
- Motion rule: never animate `opacity` to 0 (repo memory: WAAPI `opacity: 0` bug); prune styling uses a static CSS class at `opacity: 0.45` with `text-decoration: line-through`.
