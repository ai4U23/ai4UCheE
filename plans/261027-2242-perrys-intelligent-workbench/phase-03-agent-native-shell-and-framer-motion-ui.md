---
title: "Phase 3: BuilderIO/agent-native Core Shell, Dual-Lens UI, useAgentSelectable & motion/react Design System"
status: todo
---

# Phase 3: BuilderIO/agent-native Core Shell, Dual-Lens UI, useAgentSelectable & motion/react Design System

## Overview

Implement the `BuilderIO/agent-native` architectural primitives (`defineAction`, `<current-screen>` bi-directional synchronization via `actions/view-screen.ts` & `writeClientAppState`, and `useAgentSelectable` Point-and-Ask chip attachment), the Dual Theme CSS token system (`☀️ EPC Calc-Pad Paper #FAF8F5` vs. `🌙 Control Room Blueprint #0B101B`), the `Learn` $\leftrightarrow$ `Plant` Dual-Lens toggle with `motion/react` `layoutId` shared-layout morphing, and `ScrubbableNumberInput`. Every file created MUST remain strictly `< 200` lines.

## Requirements

- [ ] Dual Theme CSS tokens (`src/styles/theme-tokens.css`) and `PersonaThemeProvider` (`src/context/persona-theme-context.tsx`) supporting `personaMode: 'learn' | 'plant'` and `themeMode: 'paper' | 'blueprint'`.
- [ ] `BuilderIO/agent-native` action registry (`src/actions/define-action.ts`), bi-directional `<current-screen>` state serializer (`src/actions/view-screen.ts`), and `useAgentSelectable` Point-and-Ask hook (`src/hooks/use-agent-selectable.ts`).
- [ ] Tactile `ScrubbableNumberInput` (`src/components/ui/scrubbable-number-input.tsx`), `AppShell` (`src/components/shell/app-shell.tsx`) with `motion/react` `layoutId` transitions and Degrees-of-Freedom (`DoF`) status badge, `AgentChatDrawer`, and Express/Nitro API bridge (`src/server/api-server.ts`).

## Implementation Steps

### Task 3.1 — Implement Dual Theme Tokens (`#FAF8F5` Paper vs. `#0B101B` Blueprint) & Persona Context
- **Goal**: Create `src/styles/theme-tokens.css` and `src/context/persona-theme-context.tsx` (`< 200` lines each) managing `personaMode: 'learn' | 'plant'` and `themeMode: 'paper' | 'blueprint'`.
- **Target files and symbols**:
  - `/Users/nad/ai4u/ai4UCheE/src/styles/theme-tokens.css`
  - `/Users/nad/ai4u/ai4UCheE/src/context/persona-theme-context.tsx` (`PersonaThemeProvider`, `usePersonaTheme`)
- **Steps**:
  1. Write `src/styles/theme-tokens.css` importing `katex/dist/katex.min.css` and defining CSS variables for:
     - `[data-theme="paper"]` (`☀️ EPC Calc-Pad Paper`): `--bg-canvas: #FAF8F5`, `--bg-panel: #F2EFE9`, `--ink-primary: #141413`, `--ink-muted: #5C5852`, `--border-grid: #DCD6CC`, `--accent-primary: #B8332A` (Perry's Crimson), `--accent-secondary: #1D5B79`.
     - `[data-theme="blueprint"]` (`🌙 Control Room Blueprint`): `--bg-canvas: #0B101B`, `--bg-panel: #121A2B`, `--ink-primary: #E8F0FE`, `--ink-muted: #8BA0C2`, `--border-grid: #1E2D4A`, `--accent-primary: #38BDF8` (Cyan Trace), `--accent-secondary: #F59E0B` (Amber Alarm).
  2. Write `src/context/persona-theme-context.tsx` exporting `PersonaThemeProvider` and `usePersonaTheme()` with state:
     - `personaMode: 'learn' | 'plant'` (defaults to `'plant'`; toggling switches explanation depth, `DeepTutor` hints, vs. 3-case datasheet grids).
     - `themeMode: 'paper' | 'blueprint'` (defaults to `'paper'`; binds `document.documentElement.setAttribute('data-theme', themeMode)`).
     - `selectedChips: Array<{ chipId: string; kind: string; id: string; label: string; payload?: Record<string, unknown> }>` for Point-and-Ask.
- **Success criteria**: `PersonaThemeProvider` switches `data-theme` between `"paper"` (`#FAF8F5`) and `"blueprint"` (`#0B101B`) and switches `personaMode` between `"learn"` and `"plant"`.
- **Verify**: `cd /Users/nad/ai4u/ai4UCheE && grep -q "#FAF8F5" src/styles/theme-tokens.css && grep -q "#0B101B" src/styles/theme-tokens.css && echo "THEME_TOKENS_OK"` exits `0` and prints `THEME_TOKENS_OK`.

### Task 3.2 — Implement `defineAction`, `<current-screen>` Sync (`actions/view-screen.ts`) & `useAgentSelectable` Hook
- **Goal**: Build the `BuilderIO/agent-native` action registry (`src/actions/define-action.ts`), bi-directional screen state sync (`src/actions/view-screen.ts` with `writeClientAppState` and `<current-screen>` XML serializer), and `src/hooks/use-agent-selectable.ts` attaching `agent-select:<kind>:<id>` chips to the chat composer.
- **Target files and symbols**:
  - `/Users/nad/ai4u/ai4UCheE/src/actions/define-action.ts` (`defineAction`, `ActionRegistry`, `agentNative`)
  - `/Users/nad/ai4u/ai4UCheE/src/actions/view-screen.ts` (`viewScreenAction`, `writeClientAppState`, `serializeCurrentScreenTag`)
  - `/Users/nad/ai4u/ai4UCheE/src/hooks/use-agent-selectable.ts` (`useAgentSelectable`)
- **Steps**:
  1. Write `src/actions/define-action.ts` (`< 200` lines) providing `defineAction({ name, description, schema, handler })` which registers Zod-validated actions in `ActionRegistry` and exports the `agentNative.ui.output(value)` dispatcher so actions or agent turns can emit inline generative UI cards into the chat stream.
  2. Write `src/actions/view-screen.ts` (`< 200` lines) implementing:
     - `writeClientAppState(stateUpdate)`: persists active workbench, `personaMode`, `themeMode`, selected chips, and live calculation state into memory/SQLite (`screen_states`) and notifies subscribers.
     - `serializeCurrentScreenTag(state)`: formats the live UI state as a structured `<current-screen workbench="..." personaMode="..." themeMode="...">...</current-screen>` block injected into every agent prompt turn.
     - `viewScreenAction`: `defineAction` allowing the agent to read or mutate the active workbench parameters bi-directionally.
  3. Write `src/hooks/use-agent-selectable.ts` (`< 200` lines) returning `{ selectableProps, isSelected, toggleSelect }` for a given `(kind: string, id: string, label: string, payload?: Record<string, unknown>)`. Clicking a selectable UI element (or pressing `Alt+Click` / clicking its inspect badge) appends chip `agent-select:${kind}:${id}` into the chat composer context.
- **Success criteria**: `serializeCurrentScreenTag` outputs `<current-screen ...>` XML and `useAgentSelectable('equation', 'eq-6-38', ...)` generates chip ID `agent-select:equation:eq-6-38`.
- **Verify**: `cd /Users/nad/ai4u/ai4UCheE && npx tsx -e "import { serializeCurrentScreenTag } from './src/actions/view-screen'; const xml = serializeCurrentScreenTag({ activeWorkbench: 'hydraulics', personaMode: 'plant', themeMode: 'paper', selectedChips: ['agent-select:pipe:sch40-4in'], payload: { flowGpm: 250 } }); if (!xml.includes('<current-screen') || !xml.includes('agent-select:pipe:sch40-4in')) process.exit(1); console.log('AGENT_SYNC_OK');"` exits `0` and prints `AGENT_SYNC_OK`.

### Task 3.3 — Build `ScrubbableNumberInput`, `AppShell` with `motion/react` `layoutId` Morphing & Express/Nitro Host API
- **Goal**: Build `src/components/ui/scrubbable-number-input.tsx`, `src/components/shell/app-shell.tsx`, `src/components/shell/agent-chat-drawer.tsx`, and `src/server/api-server.ts` (`< 200` lines each), plus unit tests in `src/__tests__/phase3-shell.test.tsx`.
- **Target files and symbols**:
  - `/Users/nad/ai4u/ai4UCheE/src/components/ui/scrubbable-number-input.tsx` (`ScrubbableNumberInput`)
  - `/Users/nad/ai4u/ai4UCheE/src/components/shell/app-shell.tsx` (`AppShell`)
  - `/Users/nad/ai4u/ai4UCheE/src/components/shell/agent-chat-drawer.tsx` (`AgentChatDrawer`)
  - `/Users/nad/ai4u/ai4UCheE/src/server/api-server.ts` (`createApiServer`)
  - `/Users/nad/ai4u/ai4UCheE/src/__tests__/phase3-shell.test.tsx`
- **Steps**:
  1. Write `ScrubbableNumberInput` (`< 200` lines) supporting horizontal pointer-drag scrubbing (`onPointerDown` / `onPointerMove` delta multiplied by `step`), direct keyboard numeric entry, unit badge display, and `useAgentSelectable('input', paramId, ...)` chip binding.
  2. Write `AppShell` (`< 200` lines) using `motion/react` (`<motion.div layoutId="active-persona-pill" />` and `<motion.div layoutId="active-workbench-tab" />`) to morph smoothly between:
     - Top Dual-Lens Switcher (`🎓 Learn Mode [Constrained Guided Discovery]` $\leftrightarrow$ `🏭 Plant Mode [EPC Datasheet & 3-Case Rating]`) + Degrees of Freedom (`DoF = 0 Fully Specified`) badge.
     - Dual Theme Toggle (`☀️ EPC Paper #FAF8F5` $\leftrightarrow$ `🌙 Blueprint #0B101B`).
     - 4 Workbench Tabs (`WB1: Perry's Visual Verifier`, `WB2: Sec 1/2/4 DIPPR & Thermo`, `WB3: Sec 6/8/10 Fluid Hydraulics`, `WB4: Sec 13/14 Distillation`) + `Export Senior Calc Sheet` button.
  3. Write `AgentChatDrawer` (`< 200` lines) displaying attached `agent-select:<kind>:<id>` chips in the composer, the live `<current-screen>` indicator badge, and rendering inline generative UI cards via `renderInlineExtension`.
  4. Write `src/server/api-server.ts` (`< 200` lines) exposing `/api/screen-state`, `/api/actions/:actionName`, and proxying `/api/perry/*` to `http://127.0.0.1:8001/api/v1/*`.
  5. Write `src/__tests__/phase3-shell.test.tsx` verifying Dual-Lens toggle, Theme toggle (`#FAF8F5` vs `#0B101B`), `useAgentSelectable` chip attachment (`agent-select:`), and `<current-screen>` state sync.
- **Success criteria**: `vitest run src/__tests__/phase3-shell.test.tsx` passes all tests and all Phase 3 files are `< 200` lines.
- **Verify**: `cd /Users/nad/ai4u/ai4UCheE && npx vitest run src/__tests__/phase3-shell.test.tsx` exits `0` and prints `passed`.

## Todo

- [x] Task 3.1: Implement Dual Theme Tokens (`#FAF8F5` Paper vs. `#0B101B` Blueprint) & Persona Context — `THEME_TOKENS_OK`
- [x] Task 3.2: Implement `defineAction`, `<current-screen>` Sync (`actions/view-screen.ts`) & `useAgentSelectable` Hook — `AGENT_SYNC_OK`
- [x] Task 3.3: Build `ScrubbableNumberInput`, `AppShell` with `motion/react` `layoutId` Morphing & Express/Nitro Host API — `vitest` 4/4 passed (`80ms`)

## Success Criteria

- `theme-tokens.css` defines both `#FAF8F5` (`paper`) and `#0B101B` (`blueprint`) themes (`THEME_TOKENS_OK`).
- `serializeCurrentScreenTag` emits valid `<current-screen>` XML with attached `agent-select:` chips (`AGENT_SYNC_OK`).
- `npx vitest run src/__tests__/phase3-shell.test.tsx` exits `0` (`passed`).

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
