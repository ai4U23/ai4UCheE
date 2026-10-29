# Phase 03: Bi-Directional `gemini-4-argon-low` Copilot (`gateway.ai4u.now`) & Natural-Language Slider Control

<!-- Updated: Validation Session 1 (2026-10-30) - additive two-tier integration per user decision: payload into CopilotRequestSchema, optional actionMutations into CopilotResponse (keeps tier/genUiCards), parser inside Tier-1; corrected actual signatures (runCopilotResponder(input, options?), askPerryCopilot, callGeminiGateway, registerCopilotRoute); actual mutation keys; render-inline widget tags dropped -->

- **Parent Plan**: [`plan.md`](file:///Users/nad/ai4u/ai4UCheE/plans/261029-2335-chemie-interactive-ux-and-live-copilot/plan.md)
- **Status**: Pending
- **Estimated Effort**: 3.5h
- **Depends On**: [`phase-02-interactive-missions-and-svg-workbenches.md`](file:///Users/nad/ai4u/ai4UCheE/plans/261029-2335-chemie-interactive-ux-and-live-copilot/phase-02-interactive-missions-and-svg-workbenches.md)

## Context & Overview

Currently, [`src/components/shell/agent-chat-drawer.tsx`](file:///Users/nad/ai4u/ai4UCheE/src/components/shell/agent-chat-drawer.tsx) hardcodes `payload: {}` inside its `serializeCurrentScreenTag(...)` call (line ~50), and [`src/actions/copilot-responder.ts`](file:///Users/nad/ai4u/ai4UCheE/src/actions/copilot-responder.ts) — the shipped two-tier responder (`d7caaa7`) — grounds Tier-1 in canned intent-matched replies (`373.15 K`, `101,325 Pa`) without reading live workbench state or mutating workbench sliders when a student asks a `"What-If"` question.

**Integration approach (locked by Validation Session 1): extend the shipped two-tier architecture additively.** Actual signatures to build on: `runCopilotResponder(input: unknown, options?: { emitUi?: boolean }): CopilotResponse` (`copilot-responder.ts:131`), `askPerryCopilot(input: unknown): Promise<CopilotResponse>` (browser helper, `:143`), `CopilotResponse = { reply, model, tier, citations, genUiCards }` (`:20-26`), `callGeminiGateway(...)` + `registerCopilotRoute(app: Express)` + `GATEWAY_DEFAULT_URL = 'https://gateway.ai4u.now'` + `GATEWAY_DEFAULT_MODEL = 'gemini-4-argon-low'` (`copilot-route.ts:11-12,50,79`). Call sites to preserve: `copilot-route.ts:54` (`runCopilotResponder(parsed, { emitUi: false })`), `copilot-responder.ts:144` (`askPerryCopilot`), `:166` (`askPerryCopilotAction` handler), and the drawer's `askPerryCopilot` call.

This phase makes the `gemini-4-argon-low` (`https://gateway.ai4u.now`) Copilot **genuinely bi-directional and live-state grounded**:
1. Creates [`src/actions/copilot-scenario-parser.ts`](file:///Users/nad/ai4u/ai4UCheE/src/actions/copilot-scenario-parser.ts) to parse natural-language `"What-If"` commands (e.g., *"set flow to 420 gpm and pipe diameter to 6 in"*, *"fix cavitation"*, *"switch to ethanol at 355 K"*, *"reduce reflux to 1.3× Rmin"*) into concrete `WorkbenchMutationCommand` objects (`actionMutations`) and compute live before/after engineering diagnostics.
2. **Additively** upgrades [`src/actions/copilot-responder.ts`](file:///Users/nad/ai4u/ai4UCheE/src/actions/copilot-responder.ts) (`payload` in `CopilotRequestSchema`, optional `actionMutations?` in `CopilotResponse` — `tier` and `genUiCards` untouched) and [`src/server/copilot-route.ts`](file:///Users/nad/ai4u/ai4UCheE/src/server/copilot-route.ts) (`callGeminiGateway` enriches the system prompt with serialized payload) so both tiers ground their numbers in the live payload and return `actionMutations`.
3. Upgrades [`src/components/shell/agent-chat-drawer.tsx`](file:///Users/nad/ai4u/ai4UCheE/src/components/shell/agent-chat-drawer.tsx) to pass live `getClientAppState().payload`, auto-dispatch returned `actionMutations` to scrub the active workbench sliders, and display interactive `data-testid="copilot-mutation-pill"` badges + contextual Quick Action chips (preserving `copilot-model-badge`, `copilot-starter-prompts`, `starter-prompt-*`, `composer-chip-tray`, `chip-agent-select:*`).

---

## Tasks

### Task 3.1: Create Natural-Language `"What-If"` Scenario Parser (`src/actions/copilot-scenario-parser.ts`)

- **Goal**: Build a deterministic parser and live-telemetry narrator that extracts parameter mutations from natural-language prompts and computes live engineering answers from the payload inside `ClientScreenState`.
- **Target files and symbols**:
  - [`src/actions/copilot-scenario-parser.ts`](file:///Users/nad/ai4u/ai4UCheE/src/actions/copilot-scenario-parser.ts):
    - `ParsedCopilotScenario` interface (`mutations?: WorkbenchMutationCommand`, `liveReply: string`, `citations: string[]`, `cards?: GenUiPayload[]`)
    - `parseCopilotScenario(prompt: string, state: ClientScreenState): ParsedCopilotScenario`
- **Steps**:
  1. Create [`src/actions/copilot-scenario-parser.ts`](file:///Users/nad/ai4u/ai4UCheE/src/actions/copilot-scenario-parser.ts) (plain `.ts`, ~120 LOC) inspecting `prompt` and `state`:
     - Detect natural-language parameter requests across all 4 workbenches, emitting `WorkbenchMutationCommand` with **long ids** and **actual state keys**:
       - `wb3-hydraulics`: flow rate (`/\b(\d+(?:\.\d+)?)\s*gpm\b/i` → `flowGpm`), pipe size (`/\b(\d+(?:\.\d+)?)\s*(?:in|inch|")/i` → `npsInch`), suction pressure (`/\b(-?\d+(?:\.\d+)?)\s*psig\b/i` → `pSuctionPsig`), or rescue intents (`/(?:fix|stop|prevent|solve)\s+cavitation/i` $\to$ the `mission-pump-npsha` rescue values `{ flowGpm: 260, pSuctionPsig: 15 }`).
       - `wb2-thermo-dippr`: compound (`/\b(water|ethanol|benzene)\b/i` → `compound`), temperature in Kelvin (`/\b(\d{3}(?:\.\d+)?)\s*K\b/i` → `tempK`), or boiling-point intent.
       - `wb4-distillation`: reflux multiplier (`/\breflux\s*(?:to|=|of)?\s*(\d+(?:\.\d+)?)(?:\s*[×x]\s*r?\s*min)?/i` → `rMult`), relative volatility (`/\balpha\s*(?:to|=|of)?\s*(\d+(?:\.\d+)?)\b/i` → `alpha`), or flooding rescue (`/(?:fix|stop|prevent)\s+flooding/i` $\to$ the `mission-distillation` rescue values).
       - `wb1-visual-verifier`: chart reading (`/\b(?:reading|fanning)\s*(?:to|=|of)?\s*(\d(?:\.\d+)?)/i` → `userReading`).
     - Read live `state.payload.inputs` and `state.payload.metrics` (with sensible defaults when `payload` is empty so the Tier-1 canned `373.15 K` / `101,325 Pa` fallback in `wb2Thermo()` keeps `phase8-ux-copilot.test.tsx` green).
     - Format a concise, persona-aware engineering explanation as plain text + exact `[Perry's 9th Ed., ...]` citations (ground-truth pages per plan.md §5), returning rich proof cards through the **existing** `GenUiPayload`/`card()` mechanism — there is no `<render-inline>` widget-tag vocabulary in this codebase.
- **Success criteria**:
  - `parseCopilotScenario("Set pipe diameter to 6 in and suction pressure to 15 psig to fix cavitation", state)` returns `mutations.params = { npsInch: 6, pSuctionPsig: 15 }` with `targetWorkbench: 'wb3-hydraulics'`, and a live $\text{NPSH}_A$ calculation citing `[Perry's 9th Ed., Sec. 10, pp. 10-24..25]`.
  - When `state.activeWorkbench === 'wb2-thermo-dippr'` and `payload` is `{}` (or at default `373.15 K`), the composed reply includes `373.15 K` and `101,325 Pa` so `phase8-ux-copilot.test.tsx` passes without modification.
- **Verify**:
  ```bash
  npm run typecheck && test $(wc -l < src/actions/copilot-scenario-parser.ts) -lt 200
  ```

### Task 3.2: Upgrade `copilot-responder.ts` & `copilot-route.ts` for Live State & `actionMutations` (Additive)

- **Goal**: Wire [`src/actions/copilot-responder.ts`](file:///Users/nad/ai4u/ai4UCheE/src/actions/copilot-responder.ts) and [`src/server/copilot-route.ts`](file:///Users/nad/ai4u/ai4UCheE/src/server/copilot-route.ts) to carry live payload and deterministic `actionMutations` **without breaking the shipped two-tier contract**: `CopilotResponse` keeps `reply`, `model`, `tier`, `citations`, `genUiCards` and gains optional `actionMutations?: WorkbenchMutationCommand`; the browser path stays `askPerryCopilot(input)`; the server path stays `callGeminiGateway` / `registerCopilotRoute`.
- **Target files and symbols**:
  - [`src/actions/copilot-responder.ts`](file:///Users/nad/ai4u/ai4UCheE/src/actions/copilot-responder.ts) (168 LOC baseline):
    - `CopilotRequestSchema` gains `payload: z.record(z.unknown()).optional()` (all existing fields untouched)
    - `CopilotResponse` gains `actionMutations?: WorkbenchMutationCommand` (`tier`/`genUiCards` unchanged)
    - `runCopilotResponder(input: unknown, options?: { emitUi?: boolean })` — signature unchanged; internally runs `parseCopilotScenario` when `parsed.payload` is present and merges `actionMutations` + a live-grounded appendix into the Tier-1 reply
  - [`src/server/copilot-route.ts`](file:///Users/nad/ai4u/ai4UCheE/src/server/copilot-route.ts) (90 LOC baseline):
    - `callGeminiGateway(...)` enriches the `SYSTEM_PROMPT` context with serialized `payload.inputs` / `payload.metrics`; `registerCopilotRoute` forwards the request body verbatim (schema fields flow through)
- **Steps**:
  1. In [`src/actions/copilot-responder.ts`](file:///Users/nad/ai4u/ai4UCheE/src/actions/copilot-responder.ts):
     - Inside `runCopilotResponder`, call `parseCopilotScenario(parsed.prompt, state)` (state assembled from `parsed.activeWorkbench`/`personaMode`/`payload`) to extract deterministic `mutations` and append the live-grounded engineering appendix to the Tier-1 reply; return `actionMutations: parsed.mutations?.params ? parsed.mutations : undefined`.
     - Keep `askPerryCopilot` behavior: Tier-1 first, then POST `/api/copilot` (already sends the full input — now including `payload`); merge the Tier-2 response with `{ ...tier1, ...data }` as shipped so `actionMutations` survives both online and offline.
     - Preserve the `import.meta.env?.MODE === 'test'` short-circuit so phase8 tests stay deterministic.
  2. In [`src/server/copilot-route.ts`](file:///Users/nad/ai4u/ai4UCheE/src/server/copilot-route.ts):
     - Enrich the `<current-screen>` system prompt context sent to `https://gateway.ai4u.now` (`GATEWAY_DEFAULT_URL`, `gemini-4-argon-low`) with the serialized `payload.inputs` and `payload.metrics` so the LLM reasons over exact live numbers.
- **Success criteria**:
  - `runCopilotResponder` still returns `tier: 'tier1-deterministic'` with `genUiCards` emitted via `agentNative.ui.output` (phase8 contract), and additionally returns `actionMutations` when the user asks to change parameters or fix a hazard; Tier-2 (`tier: 'tier2-gemini-4-argon-low'`) responses merge without dropping fields.
  - Both files remain strictly `< 200` LOC (targets: responder ~195, route ~120).
- **Verify**:
  ```bash
  npm run typecheck && npx vitest run src/__tests__/phase8-ux-copilot.test.tsx && test $(wc -l < src/actions/copilot-responder.ts) -lt 200 && test $(wc -l < src/server/copilot-route.ts) -lt 200
  ```

### Task 3.3: Upgrade `AgentChatDrawer` to Sync Live Payload & Dispatch `actionMutations`

- **Goal**: Fix [`src/components/shell/agent-chat-drawer.tsx`](file:///Users/nad/ai4u/ai4UCheE/src/components/shell/agent-chat-drawer.tsx) (160 LOC baseline) so it reads the real `getClientAppState().payload` instead of the `payload: {}` hardcode (line ~50), includes `payload` in the `askPerryCopilot` request, dispatches `response.actionMutations` via `dispatchWorkbenchMutation(...)` to scrub workbench sliders live, renders a `data-testid="copilot-mutation-pill"` confirmation pill inside the assistant message, and provides workbench-specific Quick Action prompt pills — while preserving every existing testid (`copilot-model-badge`, `copilot-starter-prompts`, `starter-prompt-*`, `composer-chip-tray`, `chip-agent-select:*`, `genui-*`).
- **Target files and symbols**:
  - [`src/components/shell/agent-chat-drawer.tsx`](file:///Users/nad/ai4u/ai4UCheE/src/components/shell/agent-chat-drawer.tsx) (`AgentChatDrawer`)
- **Steps**:
  1. In [`src/components/shell/agent-chat-drawer.tsx`](file:///Users/nad/ai4u/ai4UCheE/src/components/shell/agent-chat-drawer.tsx), replace `payload: {}` inside the `serializeCurrentScreenTag(...)` call with `payload: getClientAppState().payload`, and add `payload: getClientAppState().payload` to the `askPerryCopilot` request body (flows through `CopilotRequestSchema.payload`).
  2. When `response.actionMutations` is present:
     - Call `dispatchWorkbenchMutation(response.actionMutations)` so the active workbench sliders animate to the new values immediately.
     - Store `appliedMutations` on the assistant `ChatMessage` and render a high-contrast badge (`data-testid="copilot-mutation-pill"`) showing the exact parameters updated (e.g., `⚡ Applied to Workbench: npsInch=6, pSuctionPsig=15`).
  3. Add workbench-contextual Quick Action pills (`data-testid="copilot-quick-action"`) above the chat input so students can click 1-tap `"What-If"` actions (e.g., `"⚡ Fix Cavitation (6 in pipe, 15 psig)"` on `WB3`, `"⚡ Stop Column Flooding (R = 1.3 × Rmin)"` on `WB4`, `"⚡ Switch to Ethanol @ 351.5 K"` on `WB2`, `"⚡ Correct Chart Reading to Perry-Exact"` on `WB1`).
- **Success criteria**:
  - Sending a `"What-If"` message or clicking a Quick Action pill in `AgentChatDrawer` reads live `getClientAppState().payload`, mutates the workbench state via `dispatchWorkbenchMutation`, and renders `data-testid="copilot-mutation-pill"`.
  - [`src/components/shell/agent-chat-drawer.tsx`](file:///Users/nad/ai4u/ai4UCheE/src/components/shell/agent-chat-drawer.tsx) stays strictly `< 200` LOC (target ~195; extract Quick-Action pill lists into `copilot-prompts.ts` if needed).
- **Verify**:
  ```bash
  npm run typecheck && npx vitest run src/__tests__/phase8-ux-copilot.test.tsx && test $(wc -l < src/components/shell/agent-chat-drawer.tsx) -lt 200
  ```

---

## Failure Protocol

If any task verification command in Phase 03 fails, produces a TypeScript error, breaks an existing Vitest test, or exceeds the 200-LOC file cap:
1. **STOP** immediately — do not proceed to Phase 04 and do not weaken any test assertion or LOC gate.
2. Capture the failing command output, exact file/line reference, and root cause hypothesis.
3. Escalate to the `kongming` advisor subagent (`invoke_subagent` with `TypeName: "kongming"`) with the failure evidence before attempting an architectural workaround.
