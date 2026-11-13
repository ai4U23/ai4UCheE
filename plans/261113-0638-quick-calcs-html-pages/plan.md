---
title: "Quick-Calcs Gadget — SharePoint HTML Pages Lane (PVU)"
description: "Self-contained two-calculator gadget (DIPPR + NPSHa) published as a SharePoint-native HTML page: placement probe, JS port with golden-value battery, throttled perf gate, engine pilot publish, owner ship/kill decision."
status: in-progress
priority: P2
effort: 2d
branch: main
tags: [feature, frontend, sharepoint, gadget, pvu]
blockedBy: []
blocks: []
created: 2026-11-13
---

# Quick-Calcs Gadget — SharePoint HTML Pages Lane (PVU)

**Supersedes** phase 8 of `plans/261111-1048-pvu-sharepoint-edition/` (authored
pre-article: owner-desire gate before build, Site-Pages-only placement assumption,
no font-inlining requirement). This plan encodes the 2026-11-13 brainstorm
(kongming GO) and the n8d.at built-in-libraries findings.

## Overview

A PVU student opens the course SharePoint site and — with no login, no token, no
ai4u.now anywhere — uses "PVU CHE Quick-Calcs": a tiny page with two chemistry
calculators (DIPPR property lookup, pump NPSHa) in Vietnamese. The page is one
self-contained HTML file stored IN SharePoint, rendered by Microsoft's HTML-pages
sandbox. It is the first student-facing surface that satisfies the owner's
standing directive *literally*: zero ai4u.now in the address bar AND in the page
source. The workbench (engine-backed) and the BOD dashboard stay on their
existing lanes; this lane is for self-contained artifacts only.

## Contract Summary (locked 2026-11-13 brainstorm)

- Outcome: a SharePoint-native Quick-Calcs page in the PVU site (or a dated kill
  decision), with the HTML-pages lane availability proven by a placement probe.
- Constraints: sandbox laws below; engine APP-ONLY uploads; two calculators
  only; no changes to existing app code (additive `gadget/` tree only); all
  batteries LOCAL (no CI — standing repo law).
- Non-goals: no BOD/workbench re-host (engine-backed, sandbox blocks fetch); no
  Microsoft libraries in v1 (version-drift surface, gadget needs none); no
  LiveData list-driven data in v1 (named v2 trigger: teachers want updated
  coefficients without republish); no SPFx changes.
- Acceptance: probe receipt with placement answer + date; battery ALL GREEN incl.
  mandatory psig/psia; perf p95 < 1500 ms @ 4× throttle; pilot renders for the
  owner with correct KaTeX fonts; dated SHIP or KILL decision.

## Owner gates

- **G1 — green-light to execute** (brainstorm decision 1, pending as of
  2026-11-13). Phases 01–04 are pure-local/additive and may run once G1 lands;
  nothing touches the tenant before Phase 01's two probe uploads.
- **G2 — combined browser session (~30 min, owner)**: Lane A 5 clicks (see
  `261111-1048/reports/phase-06-owner-handover.md`) + gadget pilot check, batched
  into one sign-in. Deliberately decoupled from the BUILD (kongming: don't gate
  the cheapest-to-abandon phase behind the least-predictable input).
- **G3 — ship/kill** at the end of Phase 05, all evidence on the table.

## Standing laws (violating any rejects the plan)

1. **Sandbox laws** (HTML-pages viewer): no `fetch`/XHR; no
   `localStorage`/`sessionStorage`/cookies; no external scripts (CSP blocks CDN
   even when allowlisted); fonts only via `data:`/`blob:` URIs — KaTeX woff2
   MUST be base64-inlined at build time (else equations silently fall back to
   serif, discovered only in front of the owner); ≤ 10 MB per file; ≤ 6
   Microsoft-managed libraries (we declare ZERO).
2. **Placement is decided by probe, not assumption** (kongming): Microsoft
   anchors rendering to the Site Pages library; doc-library rendering is an
   unverified reading. Probe tests BOTH. Site-Pages fallback upload = plain
   drive file upload — NEVER the aspx provisioner (page-forking quirk, BOD
   incident law).
3. **Park rule is dated**: probe finds no HTML viewer → lane PARKED, retry
  **2026-11-27**. Phases 02–04 proceed regardless (battery is a numeric-integrity
   asset even if the lane dies); only Phase 05 blocks.
4. **Two calculators only.** "Just one more calculator" declines are recorded,
   not argued.
5. **APP-ONLY credentials** for every tenant write, through the publish-mcp
   engine (in-container Python, pattern proven 2026-11-13). No delegated creds.
6. **Additive only**: `gadget/` tree + `tests/e2e/gadget-perf.spec.ts`. Zero
   edits to existing app/server code. **One recorded exception**: Phase 0
   fixes a verified gauge-conversion defect in the engine oracle (exactly one
   logic line + one test pin, own commit) — without it, the battery would
   canonize 827×-wrong psig math into a student-facing cavitation calculator.
7. **No copyrighted corpus material**: equations and coefficient values are
   data; the gadget contains no Perry page images or text extracts.
8. **Engine container law**: never hand-type a publish-mcp recreate —
   `deploy/publish-mcp-recreate.sh` is the only sanctioned surgery (not needed
   by this plan; recorded because Phase 05 touches the engine).
9. **Vitest include is `src/__tests__/**` only** — gadget checks are plain
   node/Python scripts, NOT vitest tests (the silent-collection trap).
10. The `<200 LOC per src/ file` law scopes to the app's `src/` tree;
    `gadget/src/` is a separate standalone tree — keep files modest anyway.

## Risk Notes (honest)

- Tenant timing: HTML pages GA worldwide mid-Nov–late-Dec 2026; today is the
  window's opening days. Probe may park. Cost of a park: minutes.
- MS sandbox may disallow something the build assumed (e.g. inline script
  nonce): discovered only at pilot render — which is why the upload path is
  proven BEFORE any lifecycle promise (Phase 05 before announcement).
- JS/Python numeric drift on unit edges (psig↔psia, the +14.6959 class): the
  battery exists to catch it; the engine's own test
  `test_pump_npsha_psig_normalization_and_cavitation_trigger` names the hazard.
- KaTeX font fallback (serif equations): the build inlines fonts; the owner
  session checklist names the visual check explicitly.

## Phase Table

| # | Phase | Status | Effort | Depends on |
|---|-------|--------|--------|------------|
| 0 | [Oracle defect fix (gauge conversion)](phase-00-oracle-defect-fix.md) | Completed 261113 (e7b0565) | ~1h | G1 |
| 1 | [Tenant placement probe (both libraries)](phase-01-placement-probe.md) | Completed 261113 — LANE_GREEN placement=either (06:58 ICT evidence) | 0.25d | G1 |
| 2 | [Calculators + single-file build](phase-02-calculators-build.md) | Completed 261113 (d6e5b4e) | 0.75d | 0 |
| 3 | [Golden-value battery (JS vs Python oracle)](phase-03-golden-battery.md) | Completed 261113 — ALL GREEN 377/0 (7b733d6) | 0.25d | 0, 2 |
| 4 | [Throttled perf gate](phase-04-throttled-perf.md) | Completed 261113 — p95 12-13ms (ec29072) | 0.15d | 2 |
| 5 | [Pilot publish + owner ship/kill gate](phase-05-pilot-and-ship-kill-gate.md) | **Pilot LIVE 261113** (published v1.0; render receipt PASS ×2) — awaiting owner G2 session + G3 ship/kill | 0.25d + 30min owner | 1 green, 3, 4, G2 |

Total: ≈1.65d + 1h engineer + ~30 min owner. Phases 0→2→{3,4} form the build
track; Phase 1 (probe) runs parallel to it; Phase 5 is strictly last.

## Handoff

Authored under `--advice`: every phase decomposes into tasks with Goal / Target
files and symbols / Steps / Success criteria / Verify (mechanical pass
condition), and carries its own Failure Protocol. Handover-ready for a
downstream executor; stopping on a failed check is intended behavior. Next
step: `/ak-cook` once G1 lands. No durable task-management surface exists in
this runtime — phase Todo blocks are the task ledger (hydration skipped, reason
recorded per task-management rules).
