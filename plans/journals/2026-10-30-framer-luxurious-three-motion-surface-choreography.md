---
title: "Framer Luxurious Three Motion & Surface Choreography"
date: 2026-10-30
summary: "Implemented Framer MCP bPWSkk20pwfxzXmKGtRh motion tokens, enter-only stage transitions, ubiquitous shared-layout pills, Swarm Pulse beacons, and dual-theme spotlights across ai4UCheE."
---

# Framer Luxurious Three Motion & Surface Choreography

## What happened
Implemented the accepted `ak:brainstorm --advice --ultra` plan (`plans/reports/framer-luxurious-three-motion-brainstorm-report.md`) via `/ak:cook --advice --auto --parallel`:
1. Created `src/lib/framer-motion-tokens.ts` (70 LOC), `src/components/ui/framer-motion-primitives.tsx` (132 LOC), and `src/styles/framer-motion-surfaces.css` (122 LOC) capturing Framer MCP project `bPWSkk20pwfxzXmKGtRh` ("Luxurious Three") choreography (`[0.22, 1, 0.36, 1]` 0.65s entrance, `500/60/1` layout spring, `0.4s/0.2` bounce spring, and `1.4s` mirror Swarm Pulse).
2. Wired `<FramerEntranceStage>`, `<MotionPillButton>`, `<SwarmPulseDot>`, and `<FramerModalShell>` across `src/App.tsx`, `src/components/shell/app-shell.tsx` (trimmed from 188 to 167 LOC), `src/components/shell/agent-chat-drawer.tsx` (trimmed from 189 to 173 LOC), `src/components/ui/diagram-mode-bar.tsx`, `src/components/ui/white-box-equation-card.tsx`, `src/components/ui/learn-mode-callout.tsx`, `src/components/shell/mission-checklist-banner.tsx`, all 4 diagram galleries (`WB2`, `WB3`, `WB4`, `WB6`), `WB1` preset bar, `WB5` cluster/section bars, and `CalcSheetPreviewModal`.
3. Added `src/__tests__/phase15-framer-luxurious-motion.test.tsx` (104 LOC) and verified all 48 Vitest tests across 10 suites pass alongside `npm run build` and the `< 200` LOC gate (`ALL_SRC_UNDER_200_OK`).

## Decision
Used enter-only `motion.div` choreography (`FramerEntranceStage` with zero `exit` prop) paired with `layoutId` spring pills (`MotionPillButton`) so DOM unmounts remain 100% synchronous (`0ms` unmount latency) for Vitest post-click `queryByTestId(...).toBeNull()` assertions, and preserved the SVG Scrub Guard by never applying hover scale/translateY transforms to `.wb-crop-stage` or `<svg>`.

## Next steps
Ready for `/ak:ship` or live browser inspection.

> Historical work record — not durable authority. Prefer docs/specs/ADRs for current decisions.
