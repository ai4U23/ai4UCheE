# Phase 01: Bi-Directional `<current-screen>` State Bus & 3-Stage White-Box KaTeX Component

<!-- Updated: Validation Session 1 (2026-10-30) - corrected view-screen exports to actual code (ClientScreenState, writeClientAppState, existing subscribeClientAppState), long workbench ids, personaMode 'learn' -->

- **Parent Plan**: [`plan.md`](file:///Users/nad/ai4u/ai4UCheE/plans/261029-2335-chemie-interactive-ux-and-live-copilot/plan.md)
- **Status**: Completed
- **Estimated Effort**: 3.0h

## Context & Overview

Currently, [`src/actions/view-screen.ts`](file:///Users/nad/ai4u/ai4UCheE/src/actions/view-screen.ts) (89 LOC) stores `payload: {}` and has no mechanism for workbenches to publish their live parameter state (`compound`, `tempK`, `flowGpm`, `npsInch`, `pSuctionPsig`, `rMult`, `npshAvailableM`, `isCavitating`, `isFlooding`) or for the AI Copilot / Guided Mission Bar to push parameter mutations (`actionMutations`) back into the active workbench. In addition, equation displays across the app only render 1-line static formulas rather than **3-Stage White-Box KaTeX substitution (`Symbolic -> Substituted -> Result`)**.

**Workbench id convention (validated):** the app uses long ids — `wb1-visual-verifier`, `wb2-thermo-dippr`, `wb3-hydraulics`, `wb4-distillation` (see `app-shell.tsx` `WORKBENCH_TABS`). All new bus APIs take these ids; short `'wb3'`-style ids are never used.

This phase establishes:
1. The bi-directional `<current-screen>` payload store and `WorkbenchMutationCommand` pub/sub bus in [`src/actions/view-screen.ts`](file:///Users/nad/ai4u/ai4UCheE/src/actions/view-screen.ts).
2. The reusable [`src/components/ui/white-box-equation-card.tsx`](file:///Users/nad/ai4u/ai4UCheE/src/components/ui/white-box-equation-card.tsx) component (`<WhiteBoxEquationCard />`) with CSS styling in [`src/styles/workbench-components.css`](file:///Users/nad/ai4u/ai4UCheE/src/styles/workbench-components.css).

---

## Tasks

### Task 1.1: Upgrade `src/actions/view-screen.ts` into a Bi-Directional State & Mutation Bus

- **Goal**: Extend [`src/actions/view-screen.ts`](file:///Users/nad/ai4u/ai4UCheE/src/actions/view-screen.ts) so every workbench can publish its live parameters, calculated metrics, and 3-stage equations into `ClientScreenState.payload`, and subscribe to incoming `WorkbenchMutationCommand` events from Guided Missions or the `gemini-4-argon-low` Copilot.
- **Target files and symbols**:
  - [`src/actions/view-screen.ts`](file:///Users/nad/ai4u/ai4UCheE/src/actions/view-screen.ts):
    - `WhiteBoxStageEquation` interface (`id`, `title`, `citation`, `symbolicLatex`, `substitutedLatex`, `resultLatex`, `plainExplanation?`, `warningText?`)
    - `WorkbenchLivePayload` interface (`summary?`, `inputs?`, `metrics?`, `equations?`, `statusBanner?`, plus `[key: string]: unknown`)
    - `WorkbenchMutationCommand` interface (`targetWorkbench?: WorkbenchId`, `params: Record<string, number | string>`, `reason?: string`)
    - `syncWorkbenchPayload(workbench: WorkbenchId, payload: WorkbenchLivePayload): void`
    - `subscribeClientAppState(listener: (state: ClientScreenState) => void): () => void` (already exists at `view-screen.ts:46` — extend behavior, keep the export stable)
    - `dispatchWorkbenchMutation(command: WorkbenchMutationCommand): void`
    - `subscribeWorkbenchMutation(listener: (command: WorkbenchMutationCommand) => void): () => void`
- **Steps**:
  1. Preserve the **actual** existing exports so all 13 existing tests remain 100% compatible: `ClientScreenState` (the state interface — there is no `ClientAppState` alias), `writeClientAppState` (not `setClientAppState`), `getClientAppState`, `subscribeClientScreenState`/`subscribeClientAppState` (already exists at `view-screen.ts:46` — extend, don't duplicate), `serializeCurrentScreenTag`, `viewScreenAction`, and `ClientScreenState.payload: Record<string, unknown>`. `activeWorkbench` is a plain `string` (no `WorkbenchId` union exists) — introduce an exported `WorkbenchId` union of the four long ids and use it in new APIs while keeping `activeWorkbench: string` assignment-compatible.
  2. Add `stateListeners = new Set<(state: ClientScreenState) => void>()` and `mutationListeners = new Set<(cmd: WorkbenchMutationCommand) => void>()` inside [`src/actions/view-screen.ts`](file:///Users/nad/ai4u/ai4UCheE/src/actions/view-screen.ts).
  3. Implement `syncWorkbenchPayload(workbench: WorkbenchId, payload: WorkbenchLivePayload)` to merge `payload` into `currentState.payload` when `currentState.activeWorkbench === workbench` (or store per-workbench snapshots and expose the active workbench snapshot in `currentState.payload`) and notify `stateListeners`.
  4. Implement `dispatchWorkbenchMutation(command)` to notify all registered `mutationListeners` so the active workbench updates its React state sliders immediately.
  5. Enhance `serializeCurrentScreenTag()` XML serialization to include `<live-summary>`, `<inputs>`, and `<metrics>` inside `<payload>` so the LLM receives rich live context.
  6. Keep [`src/actions/view-screen.ts`](file:///Users/nad/ai4u/ai4UCheE/src/actions/view-screen.ts) under `165` LOC (baseline measured: 89).
- **Success criteria**:
  - Calling `syncWorkbenchPayload('wb3-hydraulics', { inputs: { flowGpm: 450 } })` updates `getClientAppState().payload.inputs` immediately.
  - Calling `dispatchWorkbenchMutation({ targetWorkbench: 'wb3-hydraulics', params: { npsInch: 6 } })` invokes all subscribed workbench listeners synchronously.
  - File length of [`src/actions/view-screen.ts`](file:///Users/nad/ai4u/ai4UCheE/src/actions/view-screen.ts) is strictly `< 200` LOC.
- **Verify**:
  ```bash
  npm run typecheck && npx vitest run src/__tests__/phase3-shell.test.tsx
  ```

### Task 1.2: Create Reusable 3-Stage `<WhiteBoxEquationCard />` (`src/components/ui/white-box-equation-card.tsx`)

- **Goal**: Build a reusable, persona-aware 3-stage white-box equation derivation component that renders **Stage 1 (Symbolic Formula)**, **Stage 2 (Live Numeric Substitution)**, and **Stage 3 (Evaluated Engineering Result + Citation Badge)** using [`KatexBlock`](file:///Users/nad/ai4u/ai4UCheE/src/components/ui/katex-block.tsx).
- **Target files and symbols**:
  - [`src/components/ui/white-box-equation-card.tsx`](file:///Users/nad/ai4u/ai4UCheE/src/components/ui/white-box-equation-card.tsx):
    - `WhiteBoxEquationCardProps` interface
    - `WhiteBoxEquationCard` component
  - [`src/styles/workbench-components.css`](file:///Users/nad/ai4u/ai4UCheE/src/styles/workbench-components.css):
    - `.white-box-eq-card`, `.white-box-stage-grid`, `.white-box-stage-pill`, `.white-box-plain-note`
- **Steps**:
  1. Create [`src/components/ui/white-box-equation-card.tsx`](file:///Users/nad/ai4u/ai4UCheE/src/components/ui/white-box-equation-card.tsx) accepting `equation: WhiteBoxStageEquation` and `personaMode?: PersonaMode`.
  2. Render header with equation `title` and a high-contrast citation badge (`[Perry's 9th Ed., ...]`).
  3. Render 3 distinct visual stages inside `.white-box-stage-grid`:
     - `data-testid={`eq-stage-symbolic-${equation.id}`}` with label `1. SYMBOLIC` and `<KatexBlock latex={equation.symbolicLatex} />`
     - `data-testid={`eq-stage-substituted-${equation.id}`}` with label `2. LIVE SUBSTITUTION` and `<KatexBlock latex={equation.substitutedLatex} />`
     - `data-testid={`eq-stage-result-${equation.id}`}` with label `3. EVALUATED RESULT` and `<KatexBlock latex={equation.resultLatex} />`
  4. When `personaMode === 'learn'` (the app's student persona — the other is `'plant'`) and `equation.plainExplanation` is present, render a warm amber intuition callout explaining what physically happens as the user scrubs the slider.
  5. Add responsive CSS rules in [`src/styles/workbench-components.css`](file:///Users/nad/ai4u/ai4UCheE/src/styles/workbench-components.css) so the 3 stages stack cleanly without horizontal overflow at `375px`, `768px`, and `1440px`.
  6. Keep [`src/components/ui/white-box-equation-card.tsx`](file:///Users/nad/ai4u/ai4UCheE/src/components/ui/white-box-equation-card.tsx) under `120` LOC and [`src/styles/workbench-components.css`](file:///Users/nad/ai4u/ai4UCheE/src/styles/workbench-components.css) well structured.
- **Success criteria**:
  - `<WhiteBoxEquationCard />` renders all 3 KaTeX stages with deterministic `data-testid` selectors (`eq-stage-symbolic-*`, `eq-stage-substituted-*`, `eq-stage-result-*`).
  - `wc -l src/actions/view-screen.ts src/components/ui/white-box-equation-card.tsx` confirms both files are `< 200` LOC.
- **Verify**:
  ```bash
  npm run typecheck && npx vitest run && test $(wc -l < src/actions/view-screen.ts) -lt 200 && test $(wc -l < src/components/ui/white-box-equation-card.tsx) -lt 200
  ```

---

## Failure Protocol

If any task verification command in Phase 01 fails, produces a TypeScript error, breaks an existing Vitest test, or exceeds the 200-LOC file cap:
1. **STOP** immediately — do not proceed to Phase 02 and do not weaken any test assertion or LOC gate.
2. Capture the failing command output, exact file/line reference, and root cause hypothesis.
3. Escalate to the `kongming` advisor subagent (`invoke_subagent` with `TypeName: "kongming"`) with the failure evidence before attempting an architectural workaround.
