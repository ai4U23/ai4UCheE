---
title: "Phase 04 — Point-and-Ask Co-Pilot Drawer, Human-Readable Chip Badges, Starter Prompts & KaTeX GenUI Cards"
description: "Upgrade RenderInlineExtension with KaTeX math, extract copilot-prompts.ts, and upgrade AgentChatDrawer with human chip labels, 1-click starter prompts, and Two-Tier Co-Pilot execution."
status: completed
priority: P1
effort: 1.5h
branch: main
tags: [agent-chat-drawer, point-and-ask, genui, katex, starter-prompts, phase-04]
created: 2026-10-28
---

# Phase 04 — Point-and-Ask Co-Pilot Drawer, Human-Readable Chip Badges, Starter Prompts & KaTeX GenUI Cards

- **Parent Plan:** [`plan.md`](./plan.md)
- **Phase Status:** Pending
- **Effort:** 1.5h
- **Depends On:** [`phase-03-gemini-gateway-and-copilot-responder.md`](./phase-03-gemini-gateway-and-copilot-responder.md)

## Goal

Turn the right-hand Co-Pilot drawer (`src/components/shell/agent-chat-drawer.tsx`) and inline GenUI renderer (`src/components/gen-ui/render-inline-extension.tsx`) into an attractive, student-friendly, AI-native workspace:
1. Render `equation-proof-card` in `RenderInlineExtension` using `<KaTeXBlock />` so white-box derivations are typeset in textbook math notation.
2. Create `src/components/shell/copilot-prompts.ts` (~70 LOC) holding the contextual 1-click **Starter Prompt Pills** for each workbench (`WB1`..`WB4`) so `agent-chat-drawer.tsx` stays comfortably below 170 LOC (`< 200` LOC invariant).
3. Display human-readable `chip.label` in `AgentChatDrawer`'s chip tray (while keeping `data-testid="chip-${chip.chipId}"` and `aria-label="Remove ${chip.chipId}"` intact for existing tests).
4. Connect `AgentChatDrawer`'s `handleSend` (and starter pills) to `askPerryCopilot` (`POST /api/copilot` with instant local fallback to `runCopilotResponder`) so it works seamlessly both against the live Express server (`gateway.ai4u.now` / `gemini-4-argon-low`) and in standalone `jsdom` component tests.

## Files to Create or Modify

| File Path | Action | Current LOC | Target LOC | Purpose |
| :--- | :--- | :---: | :---: | :--- |
| `src/components/gen-ui/render-inline-extension.tsx` | Modify | 74 | ~95 | Render `equation-proof-card` symbolic, substituted, and result LaTeX with `<KaTeXBlock />` |
| `src/components/shell/copilot-prompts.ts` | Create | 0 | ~70 | Contextual 1-click starter prompt catalog per workbench (`WB1`..`WB4`) + human chip label formatter |
| `src/components/shell/agent-chat-drawer.tsx` | Modify | 129 | ~165 | Upgrade chip badges (`chip.label`), add workbench starter prompts, and wire `handleSend` to `askPerryCopilot` |

---

## Tasks & Steps (`--advice` Handover Contract)

### Task 4.1 — Upgrade `RenderInlineExtension` (`src/components/gen-ui/render-inline-extension.tsx`) with `<KaTeXBlock />`
- **Goal:** Typeset symbolic, substituted, and final equations inside `genui-equation-proof-card` using `<KaTeXBlock />` while preserving all existing `data-testid` selectors (`genui-equation-proof-card`, `genui-hydraulics-summary-card`, `genui-calc-sheet-card`, `genui-open-print-sheet`, `genui-copy-markdown`).
- **Target files and symbols:**
  - `src/components/gen-ui/render-inline-extension.tsx` (`RenderInlineExtension`)
- **Steps:**
  1. Import `KaTeXBlock` from `../ui/katex-block`.
  2. In the `type === 'equation-proof-card'` branch, render `<KaTeXBlock latex={String(data.symbolic_latex ?? 'Re = \\frac{\\rho \\cdot v \\cdot D}{\\mu}')} />`, optional `<KaTeXBlock latex={String(data.substituted_latex)} />` when non-empty, and `<strong><KaTeXBlock latex={String(data.result_latex ?? '')} displayMode={false} /></strong>` alongside `<code className="mono">{String(data.citation ?? "[Perry's 9th Ed., p. 6-10]")}</code>`.
  3. Keep `src/components/gen-ui/render-inline-extension.tsx` `< 105` LOC.
- **Success criteria:** `genui-equation-proof-card` renders `.katex` elements and preserves all existing GenUI `data-testid` attributes.
- **Verify:** `npm run typecheck && awk 'END { exit (NR > 0 && NR < 110) ? 0 : 1 }' src/components/gen-ui/render-inline-extension.tsx` exits 0.

### Task 4.2 — Create `src/components/shell/copilot-prompts.ts` and upgrade `AgentChatDrawer` (`src/components/shell/agent-chat-drawer.tsx`)
- **Goal:** Extract the workbench starter prompt catalog into `copilot-prompts.ts` and replace the echo stub in `AgentChatDrawer` with real Co-Pilot responses (`gemini-4-argon-low` via `/api/copilot` + Tier-1 `runCopilotResponder` fallback), human-readable chip labels, model badge (`gemini-4-argon-low`), and 1-click starter prompt buttons while keeping `agent-chat-drawer.tsx` `< 175` LOC.
- **Target files and symbols:**
  - `src/components/shell/copilot-prompts.ts` (`getStarterPromptsForWorkbench`, `formatChipDisplayLabel`)
  - `src/components/shell/agent-chat-drawer.tsx` (`AgentChatDrawer`)
- **Steps:**
  1. Create `src/components/shell/copilot-prompts.ts` (< 80 LOC) exporting `getStarterPromptsForWorkbench(workbench: WorkbenchId)` returning 3 student/engineer starter prompts per workbench:
     - `wb1-visual-verifier`: `["Why is Moody f_D = 4 × Fanning f_F?", "How do I read Fig. 6-9 at Re = 10⁵?", "Show the white-box Perry equation proof"]`
     - `wb2-thermo-dippr`: `["Why convert psig to psia first?", "Why does Wilson fail for LLE?", "Derive DIPPR Eq. 101 at 100 °C"]`
     - `wb3-hydraulics`: `["Is Pump P-101 safe from cavitation (NPSHa)?", "Check if the control valve is choked (ISA-75.01)", "Compare 70% / 100% / 120% flow cases"]`
     - `wb4-distillation`: `["How does reflux ratio R/R_min affect flooding?", "Explain the q-line slope for saturated liquid", "Walk through Fenske N_min & Underwood R_min"]`
  2. In `src/components/shell/agent-chat-drawer.tsx`, add a header model badge `<span className="dof-badge" data-testid="copilot-model-badge">⚡ gemini-4-argon-low · gateway.ai4u.now</span>` alongside `data-testid="current-screen-badge"`.
  3. In `data-testid="composer-chip-tray"`, update each `.composer-chip` (`data-testid={`chip-${chip.chipId}`}`) to display `<strong className="composer-chip-label">{chip.label || chip.chipId}</strong>` (with `title={chip.chipId}`) while keeping `aria-label={`Remove ${chip.chipId}`}` on the remove button.
  4. Add a `<div className="starter-prompts" data-testid="copilot-starter-prompts">` row of 3 contextual starter prompt buttons (`data-testid={`starter-prompt-${idx}`}`) from `getStarterPromptsForWorkbench(activeWorkbench)`. Clicking a starter button immediately calls `submitQuestion(promptText)`.
  5. Replace `handleSend` with an async dispatcher `submitQuestion(rawPrompt: string)` that appends the user message, calls `await askPerryCopilot({ prompt: rawPrompt, activeWorkbench, personaMode, selectedChips })`, and appends the returned `reply` (`data-testid="copilot-agent-message"`).
- **Success criteria:** `AgentChatDrawer` renders `data-testid="copilot-model-badge"` (`gemini-4-argon-low`), human-readable `chip.label` badges, `data-testid="copilot-starter-prompts"`, and Perry-cited replies with GenUI cards while staying `< 180` LOC.
- **Verify:** `awk 'END { exit (NR > 0 && NR < 185) ? 0 : 1 }' src/components/shell/agent-chat-drawer.tsx && npx vitest run src/__tests__/phase3-shell.test.tsx src/__tests__/phase7-e2e.test.tsx` exits 0 and prints `9 passed`.

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
