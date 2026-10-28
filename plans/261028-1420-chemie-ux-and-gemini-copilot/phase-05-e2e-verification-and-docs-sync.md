---
title: "Phase 05 — E2E Vitest Suite, <200 LOC Modularity Gate, Production Build & ./docs/ Sync"
description: "Prove all 4 UX and Co-Pilot pillars with phase8-ux-copilot.test.tsx, enforce the <200 LOC repository invariant, verify npm run build, and synchronize ./docs/."
status: done
priority: P1
effort: 1.5h
branch: main
tags: [vitest, e2e, modularity, docs-sync, phase-05]
created: 2026-10-28
---

# Phase 05 — E2E Vitest Suite, `<200` LOC Modularity Gate, Production Build & `./docs/` Sync

- **Parent Plan:** [`plan.md`](./plan.md)
- **Phase Status:** Pending
- **Effort:** 1.5h
- **Depends On:** [`phase-04-point-and-ask-drawer-and-inline-genui.md`](./phase-04-point-and-ask-drawer-and-inline-genui.md)
<!-- Updated: Validation Session 1 - Task 5.2 LOC gate Verify extended to services/perry-engine (.py, .venv excluded) -->

## Goal

Prove end-to-end correctness of all 4 UX & AI Co-Pilot pillars with a dedicated Vitest integration suite (`src/__tests__/phase8-ux-copilot.test.tsx`), enforce the non-negotiable `< 200` LOC modularity ceiling across every code file in the repository (`AGENTS.md` Invariant #2), verify the production Vite build (`npm run build`), and synchronize `./docs/` (`AGENTS.md` Invariant #6).

## Files to Create or Modify

| File Path | Action | Current LOC | Target LOC | Purpose |
| :--- | :--- | :---: | :---: | :--- |
| `src/__tests__/phase8-ux-copilot.test.tsx` | Create | 0 | ~165 | End-to-end Vitest coverage for Guided Missions, Learn-Mode callouts, KaTeX math rendering, human-readable chip labels, starter prompts, and Two-Tier `gemini-4-argon-low` Co-Pilot responses |
| `docs/system-architecture.md` | Modify | — | — | Document Two-Tier `gateway.ai4u.now` (`gemini-4-argon-low`) `POST /api/copilot` architecture + Tier-1 deterministic ChE Tutor fallback |
| `docs/design-guidelines.md` | Modify | — | — | Document two-file sovereign CSS architecture (`theme-tokens.css` + `workbench-components.css`), `.shell-workspace` vs `.wb-split`, `<KaTeXBlock />`, and `<GuidedMissionBar />` |
| `docs/codebase-summary.md` | Modify | — | — | Update file inventory with new UI/Co-Pilot modules and `<200` LOC compliance table |
| `docs/deployment-guide.md` | Modify | — | — | Document server-only `GATEWAY_URL=https://gateway.ai4u.now`, `GATEWAY_API_KEY`, and `GATEWAY_MODEL=gemini-4-argon-low` env vars |
| `docs/project-roadmap.md` | Modify | — | — | Mark the Student-Intuitive UX & `gemini-4-argon-low` Co-Pilot milestone complete |

---

## Tasks & Steps (`--advice` Handover Contract)

### Task 5.1 — Create End-to-End UX & Co-Pilot Vitest Suite (`src/__tests__/phase8-ux-copilot.test.tsx`)
- **Goal:** Add an automated integration test suite covering all 4 UX/AI pillars and the `gateway.ai4u.now` (`gemini-4-argon-low`) server endpoint.
- **Target files and symbols:**
  - `src/__tests__/phase8-ux-copilot.test.tsx`
- **Steps:**
  1. Create `src/__tests__/phase8-ux-copilot.test.tsx` (< 180 LOC) testing:
     - **KaTeX Math Rendering:** Rendering `<App />` and switching to `wb2-thermo-dippr` mounts `.katex` elements inside `data-testid="katex-dippr-101"` and `data-testid="katex-dippr-106"`, while preserving `data-testid="dippr-vp-result"`.
     - **Guided Mission Bar & Learn-Mode Callout:** Clicking `data-testid="mission-fanning-trap"` or `data-testid="mission-pump-npsha"` switches `personaMode` to `'learn'`, displays `data-testid="learn-callout-wb1"` / `data-testid="learn-callout-wb3"`, attaches the mission chip in `data-testid="composer-chip-tray"`, and emits an inline `genui-equation-proof-card`.
     - **Human-Readable Chip Badges & 1-Click Starter Prompts:** Attaching a chip displays its human-friendly `chip.label` (e.g., `Volumetric Flow (gpm)`) and clicking a starter prompt button in `data-testid="copilot-starter-prompts"` produces a Perry-cited response in `data-testid="copilot-agent-message"` alongside `data-testid="copilot-model-badge"` (`gemini-4-argon-low`).
     - **Two-Tier `gateway.ai4u.now` (`gemini-4-argon-low`) Co-Pilot Route:** Calling `callGeminiGateway({ prompt: 'Why does Wilson fail for LLE?', activeWorkbench: 'wb2-thermo-dippr', personaMode: 'learn', selectedChips: [] })` returns `model: 'gemini-4-argon-low'`, `gatewayUrl: 'https://gateway.ai4u.now'`, a Perry-cited reply, and at least one `genUiCards` item.
- **Success criteria:** `npx vitest run src/__tests__/phase8-ux-copilot.test.tsx` passes all tests and the test file is `< 185` LOC.
- **Verify:** `npx vitest run src/__tests__/phase8-ux-copilot.test.tsx` exits 0.

### Task 5.2 — Enforce Repository-Wide `< 200` LOC Modularity Gate & Production Build Verification
- **Goal:** Mechanically verify that every `.ts`, `.tsx`, `.css`, and `.py` file in `src/` and `services/perry-engine/` is strictly `< 200` lines of code, and that `npm run typecheck`, `npx vitest run`, and `npm run build` succeed with zero errors.
- **Target files and symbols:**
  - All files under `src/**/*.{ts,tsx,css}` and `services/perry-engine/**/*.py`
- **Steps:**
  1. Run a Node verification check across all `.ts`, `.tsx`, and `.css` files in `src/` AND all `.py` files in `services/perry-engine/` (excluding the `.venv` virtualenv directory) to confirm every file is `< 200` lines. If any file is `>= 200` lines, extract helper subcomponents until all files are `< 195` lines.
  2. Run `npm run typecheck && npx vitest run && npm run build`.
- **Success criteria:** Every code file in `src/` and `services/perry-engine/` (excluding `.venv`) is `< 200` lines, all Vitest suites pass 100%, and `npm run build` produces a clean `dist/` bundle.
- **Verify:** `node -e "const fs=require('fs'), path=require('path'); function walk(d){for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,e.name); if(e.isDirectory()){ if(e.name!=='.venv') walk(p); } else if(/\.(ts|tsx|css|py)$/.test(e.name)){const n=fs.readFileSync(p,'utf8').split('\n').length; if(n>=200){console.error('OVER_200:',p,n); process.exit(1);}}}} walk('src'); walk('services/perry-engine'); console.log('ALL_SRC_UNDER_200_OK');" && npm run typecheck && npx vitest run && npm run build` exits 0 and prints `ALL_SRC_UNDER_200_OK`.

### Task 5.3 — Synchronize `./docs/` Suite (`AGENTS.md` Invariant #6)
- **Goal:** Update `./docs/` to reflect the Sovereign Academic-Tactile UX overhaul, `<GuidedMissionBar />`, `<KaTeXBlock />`, `<LearnModeCallout />`, and the Two-Tier `gateway.ai4u.now` (`gemini-4-argon-low`) AI Co-Pilot.
- **Target files and symbols:**
  - `docs/system-architecture.md`
  - `docs/design-guidelines.md`
  - `docs/codebase-summary.md`
  - `docs/deployment-guide.md`
  - `docs/project-roadmap.md`
- **Steps:**
  1. Update `docs/system-architecture.md` with the Two-Tier `POST /api/copilot` flow (`https://gateway.ai4u.now/v1/chat/completions`, `model: gemini-4-argon-low`, `4500ms` timeout, and Tier-1 `copilot-responder.ts` fallback).
  2. Update `docs/design-guidelines.md` to document the two-file CSS architecture (`theme-tokens.css` + `workbench-components.css`), `.shell-workspace` vs `.wb-split`, `<KaTeXBlock />`, `<GuidedMissionBar />`, and `<LearnModeCallout />`.
  3. Update `docs/codebase-summary.md`, `docs/deployment-guide.md`, and `docs/project-roadmap.md` with the new module inventory and environment variables (`GATEWAY_URL`, `GATEWAY_API_KEY`, `GATEWAY_MODEL=gemini-4-argon-low`).
- **Success criteria:** All 5 documentation files in `./docs/` reference `gemini-4-argon-low` / `gateway.ai4u.now` and the new UX components accurately.
- **Verify:** `grep -q "gemini-4-argon-low" docs/system-architecture.md && grep -q "workbench-components.css" docs/design-guidelines.md && grep -q "GATEWAY_MODEL" docs/deployment-guide.md && echo "DOCS_SYNC_OK"` exits 0 and prints `DOCS_SYNC_OK`.

---

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
