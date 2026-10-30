# Brainstorm Contract — Candidate 4 / Winner A (`ak:brainstorm --advice --ultra`)

> **Runtime & Supervision Note**: This `--ultra` run executed as a same-tier best-of-5 (five independent read-only candidate samples + rubric selection) and `--advice` ran as same-model `kongming` counsel because the host subagent API delegates via session-model inheritance.

## 1. Outcome

Transform **ChemEng's Intelligent Workbench (`ai4UCheE`)** from a static, 2-animation (`layoutId`) interface into an **animated, tactile, executive-grade engineering command center** directly choreographed from the live Framer MCP inspection of **"Luxurious Three" (`bPWSkk20pwfxzXmKGtRh`)**—while preserving 100% of the 45 Vitest E2E assertions, chemical engineering calculation rigor, dual-theme sovereignty (`#FBF6EC` Ivory & `#071A33` Dark Navy), and the strict `< 200` LOC modularization invariant.

### User-Visible & Operational End State
1. **Framer-Choreographed Workbench & Diagram Entrances**: Switching any of the 6 workbenches (`WB1..WB6`) or filtering any `<DiagramModeBar />` view triggers Framer's signature entrance cascade (`opacity: 0 → 1, y: 18 → 0`, cubic-bezier `[0.22, 1, 0.36, 1]`, `0.65s` with `60ms` panel stagger) via enter-only `key`-scoped motion containers that **unmount synchronously** when switched away.
2. **Ubiquitous Shared-Layout Pill Morphing (`layoutId`)**: Framer's high-precision layout spring (`stiffness: 500, damping: 60, mass: 1`) expands from the 2 existing header pills to:
   - `<DiagramModeBar />` across `WB2`, `WB3`, `WB4`, and `WB6` (`layoutId={`${testId}-active-pill`}`)
   - `WB1` 10-chart preset chips (`layoutId="wb1-preset-active-pill"`)
   - `WB5` Perry cluster pills (`layoutId="wb5-cluster-pill"`) and 25-section selector pills (`layoutId="wb5-sec-pill"`)
   - Cross-Subject Visual Verifier utility toggle (`tab-wb1-visual-verifier` halo & pill illumination)
3. **3-Stage White-Box Equation Cascade & Live Scrub Pulse**: `<WhiteBoxEquationCard />` stages (`1 · SYMBOLIC` → `2 · LIVE SUBSTITUTION` → `3 · EVALUATED RESULT`) enter with Framer's `0s / 0.06s / 0.12s` stagger and flash a subtle Maize Gold border/halo pulse (`rgba(250, 204, 21, 0.28)`) whenever stage 2/3 LaTeX recalculates during live slider or SVG scrubbing.
4. **Framer "Swarm Pulse" Live Telemetry & Safety Beacons**:
   - Co-Pilot header (`copilot-model-badge` & `current-screen-badge`) and `dof-badge` gain Framer's `7px` `Swarm Pulse` status indicator (`#FACC15` / `#10B981`, `repeatType: "mirror"`, `opacity: 0.35 → 1`, `scale: 1 → 1.25`, `duration: 1.4s`, `ease: [0.42, 0, 0.58, 1]`).
   - Safety verdict banners (`wb-verdict.pass/fail`, `atlas-status-banner`, `wb6-status-banner`, `calc-sheet-safety-badge`) and `<MissionChecklistBanner />` step completions (`☐ → ☑`) animate with Framer's `Evidence Approval Preview` spring flip (`duration: 0.4s, bounce: 0.2`).
5. **Luxurious Surface & Glass Choreography**:
   - Header and active workbench surfaces adopt Framer's ambient radial spotlights (`radial-gradient(50% 50% at 50% 100%, rgba(99,73,180,0.14) 0%, rgba(10,15,29,0) 70%)` and gold radial glow `rgba(250,204,21,0.09)`) plus `1px` hairline bento borders (`rgba(250,204,21,0.22)` in Blueprint / `rgba(184,134,11,0.22)` in Paper) and card hover elevation (`y: -3px`, `scale: 1.01`, gold glow `0 0 20px 1px rgba(250,204,21,0.22)`).
   - Interactive SVG drag handles (`dippr-phase-envelope-svg`, `mccabe-thiele`, `levenspiel`, `genui-sparkline-handle`, `calibrated-crosshair`) emit an ambient gold/emerald halo ring that expands on pointer grab.

---

## 2. Constraints

1. **Strict `< 200` LOC Modularization Invariant (`AGENTS.md` Invariant #2)**:
   - Every `.ts`, `.tsx`, `.css`, and `.py` file MUST strictly remain `< 200` lines (`ALL_SRC_UNDER_200_OK`).
   - High-water-mark files (`agent-chat-drawer.tsx` at 189 LOC, `app-shell.tsx` at 188 LOC, `visual-verifier-workbench.tsx` at 186 LOC, `calc-sheet-preview-modal.tsx` at 184 LOC, `render-inline-extension.tsx` at 176 LOC, `thermo-dippr-workbench.tsx` at 171 LOC) MUST NOT grow past 199 lines; extract compact sub-modules or shared primitives to lower their line counts while adding motion.
2. **Synchronous Unmount Requirement for Vitest `queryByTestId` Guardrails**:
   - Across the 45 Vitest E2E tests (`phase14-diagram-switcher-and-advanced-charts.test.tsx`, `phase3-shell.test.tsx`, etc.), tests fire `fireEvent.click(...)` on workbench tabs and diagram mode pills (`wb2-mode-cycles-eq`, `wb2-mode-phase`) and **synchronously assert** `expect(screen.queryByTestId('wb2-vle-txy-svg')).toBeNull()` on the very next line.
   - **Rule**: Never wrap conditionally unmounted workbench panels, diagram gallery views, or modals in `<AnimatePresence>` exit transitions that keep exiting DOM nodes mounted. Use **enter-only `motion.div` choreography** (`initial` + `animate` + `transition`, zero `exit` prop) combined with **`layoutId` shared indicator pills** so DOM unmounts remain 100% synchronous (`0ms` unmount latency).
3. **Dual-Theme & Persona Contract Preservation**:
   - `theme-toggle` button text MUST preserve `#FBF6EC` and `#071A33` (`☀️ Ivory #FBF6EC` / `🌙 Dark Navy #071A33`).
   - Root attributes `data-theme="paper"|"blueprint"` and `data-persona="learn"|"plant"` and all existing `data-testid` attributes MUST remain intact.
   - CSS cascade pin in `src/styles/theme-tokens.css` (`.wb-split` before `.shell-workspace`) MUST remain untouched.
4. **Chemical Engineering Rigor (`AGENTS.md` Invariant #5)**:
   - Zero alterations to `psig ↔ psia` (+14.6959 psi) conversions, `f_D = 4·f_F` Fanning/Darcy guardrails, or `[Perry's 9th Ed., ...]` citations.
   - 60fps pointer scrubbing on `<ScrubbableNumberInput />` and SVG canvases: motion springs must never lag or throttle live numeric state updates (`onChange` fires synchronously; visual glow/scale responds in parallel).
5. **Accessibility & Motion Safety (`prefers-reduced-motion` + JSDOM Compatibility)**:
   - Respect `prefers-reduced-motion: reduce` via both CSS `@media (prefers-reduced-motion: reduce)` and `motion/react` reduced-motion fallbacks, collapsing transforms/loops to instant opacity states when requested.
   - Ensure all `motion.*` primitives degrade cleanly in Vitest/JSDOM without `IntersectionObserver` or `WebAnimations` crashes (prefer mount-triggered `initial`/`animate` over `whileInView` so JSDOM renders immediately at full visibility).

---

## 3. Non-Goals

- **No Tailwind CSS or external UI component libraries**: Keep the existing plain CSS variable architecture (`theme-tokens.css` + `workbench-components.css` + new `< 200` LOC `framer-motion-surfaces.css`).
- **No Framer Cloud runtime lock-in or external iframe embeds**: Extract the design tokens, radial gradients, easing curves, and spring physics from Framer MCP (`bPWSkk20pwfxzXmKGtRh`) into native local `motion/react` + CSS tokens.
- **No WebGL / Three.js heavy 3D canvas shaders**: Keep SVG nomographs and phase envelopes crisp, deterministic, and lightweight.
- **No changes to Python `services/perry-engine/` or deterministic solver math**: Purely visual, kinetic, and tactile elevation of the React 19 frontend.

---

## 4. Acceptance Criteria

1. **Test Suite & LOC Gate**: `npx vitest run` passes all 45+ E2E tests across all 9+ test suites with zero failures, and every `.ts`, `.tsx`, `.css`, `.py` file in `src/` and `services/` is strictly `< 200` lines (`wc -l` check).
2. **Framer Motion Token Fidelity**: A dedicated `src/lib/framer-motion-tokens.ts` exports the exact Framer MCP curves:
   - `FRAMER_ENTRANCE_EASE = [0.22, 1, 0.36, 1]` (`duration: 0.65`, `stagger: 0.06`)
   - `FRAMER_LAYOUT_SPRING = { type: 'spring', stiffness: 500, damping: 60, mass: 1 }`
   - `FRAMER_BOUNCE_SPRING = { type: 'spring', duration: 0.4, bounce: 0.2 }`
   - `FRAMER_SWARM_LOOP = { duration: 1.4, repeat: Infinity, repeatType: 'mirror', ease: [0.42, 0, 0.58, 1] }`
3. **Shared-Layout Pill Coverage**: Clicking any pill in `<DiagramModeBar />` (`WB2`, `WB3`, `WB4`, `WB6`), `WB1` preset bar (`wb1-preset-chips`), `WB5` cluster bar (`atlas-cluster-*`), or `WB5` section bar (`atlas-section-pills`) animates a shared `<motion.span layoutId="..." className="motion-pill" />` indicator across options.
4. **Synchronous Unmount Verification**: Switching workbench tabs or `<DiagramModeBar />` modes triggers a `motion.div` entrance animation on the newly mounted surface while immediately removing the old surface from the DOM (`screen.queryByTestId(...) === null` synchronously).
5. **Swarm Pulse & Verdict Choreography**: Header telemetry badges (`dof-badge`, `copilot-model-badge`, `current-screen-badge`) render the pulsing `7px` Framer status dot (`data-testid="swarm-pulse-dot"`), and `<WhiteBoxEquationCard />`, `<AgentChatDrawer />` messages/GenUI cards, `<MissionChecklistBanner />`, and `<CalcSheetPreviewModal />` animate with Framer entrance and spring hover physics.
6. **Dual-Theme Glass & Spotlight Polish**: Both `[data-theme="blueprint"]` and `[data-theme="paper"]` render Framer's radial ambient spotlights, hairline gold-tinted borders, and elevated hover states without breaking contrast or print-to-PDF (`@media print`).

---

## 5. Option Exploration & Trade-offs

### Option A: Pure CSS Keyframes & Transitions Layer (`framer-surfaces.css` Only)
Translate Framer MCP's radial spotlights, hover elevations (`transform: translateY(-4px) scale(1.015)`), `@keyframes` entrance fades, and `@keyframes` Swarm Pulse purely into CSS rules applied to existing class names (`.wb-panel`, `.white-box-eq-card`, `.chat-msg`, `.dof-badge`), keeping `motion/react` restricted to the 2 existing `layoutId` pills in `app-shell.tsx`.
- **Pros**: Near-zero TSX line-count growth; zero risk of breaking synchronous DOM unmounts in Vitest; tiny bundle footprint.
- **Cons**: Cannot perform shared-layout `layoutId` pill morphing across `<DiagramModeBar />`, `WB1` presets, or `WB5` 25-section pills; cannot drive true spring physics (`stiffness: 500, damping: 60`) or reactive equation-value-change micro-pulses.
- **Load-bearing assumption**: CSS cubic-bezier transitions alone are sufficient to make the app feel "animated, impressive, premium and elegant" without `motion/react` spring choreography.
- **Fails first when**: The user clicks between `<DiagramModeBar />` pills, `WB5` section pills, or Point-and-Ask chips and notices hard, static background jumps that lack the fluid shared-layout spring morphing present in the header tabs.

### Option B: Full `AnimatePresence` Page & Sub-View Transitions Everywhere
Wrap `renderWorkbench(activeWorkbench)` in `App.tsx`, every conditional chart group in `ThermoDiagramGallery` / `HydraulicsDiagramGallery` / `DistillationDiagramGallery` / `KineticsDiagramGallery`, and `CalcSheetPreviewModal` in `<AnimatePresence mode="wait">` with `exit={{ opacity: 0, y: -12, transition: { duration: 0.25 } }}`.
- **Pros**: Classic cinematic cross-fade out + fade in on every view change.
- **Cons**: **Guaranteed to break Vitest E2E suites** (`phase14-diagram-switcher-and-advanced-charts.test.tsx`, `phase3-shell.test.tsx`, etc.) because `AnimatePresence` keeps the exiting DOM node mounted for `250ms` after `fireEvent.click`, causing immediate `expect(screen.queryByTestId('wb2-vle-txy-svg')).toBeNull()` assertions to fail. Also adds `mode="wait"` input latency when engineers rapidly flip between workbenches.
- **Load-bearing assumption**: Consumers and tests wait for asynchronous exit animations to finish before querying the DOM.
- **Fails first when**: Running `npx vitest run`—`phase14-diagram-switcher-and-advanced-charts.test.tsx` fails immediately because exiting SVG charts remain in the DOM during synchronous post-click assertions.

### Option C: Enter-Only `motion/react` Primitives + Ubiquitous `layoutId` Spring Pills + Framer Ambient Glass CSS (Recommended)
Extract a compact `< 200` LOC motion system (`src/lib/framer-motion-tokens.ts` + `src/components/ui/framer-motion-primitives.tsx` + `src/styles/framer-motion-surfaces.css`) that combines:
1. **Enter-only `motion.div` choreography** (`initial={{ opacity: 0, y: 18 }}` → `animate={{ opacity: 1, y: 0 }}` with Framer's `[0.22, 1, 0.36, 1]` `0.65s` tween and `60ms` stagger, **zero `exit` prop**) on workbench roots, diagram gallery groups, equation stages, chat messages, GenUI cards, and modals—preserving **100% synchronous DOM unmounts**.
2. **Ubiquitous `layoutId` spring pills** (`stiffness: 500, damping: 60, mass: 1`) across `<DiagramModeBar />`, `WB1` presets, `WB5` clusters/sections, and header controls.
3. **Framer `Swarm Pulse` status beacons & reactive value-scrub halos** on live telemetry badges, safety verdicts, `<WhiteBoxEquationCard />` results, and SVG drag handles.
- **Pros**: Delivers 100% of Framer MCP's visual & kinetic richness ("Luxurious Three"), keeps every file strictly `< 200` LOC by trimming near-limit files via clean component extraction, and passes all 45 synchronous Vitest assertions out of the box.
- **Cons**: Requires disciplined line-count budgeting on `app-shell.tsx` (188 LOC) and `agent-chat-drawer.tsx` (189 LOC) by extracting tiny sub-pieces (`SwarmPulseDot`, `MotionPillButton`).
- **Load-bearing assumption**: Enter-only spring/tween choreography paired with continuous `layoutId` pill morphing and ambient CSS glass spotlights provides the full perceptual luxury of Framer without needing DOM-retaining exit animations.
- **Fails first when**: A developer accidentally adds `<AnimatePresence>` with an `exit` prop around a test-queried conditional node, or adds inline JSX to `app-shell.tsx` / `agent-chat-drawer.tsx` without delegating to `framer-motion-primitives.tsx`.

---

## 6. Better Approaches

**Superior Approach Discovered via Codebase + Framer MCP Inspection:**
Instead of scattering inline `motion.div` props across all 6 workbench files (which would push `app-shell.tsx` [188 LOC], `agent-chat-drawer.tsx` [189 LOC], `visual-verifier-workbench.tsx` [186 LOC], and `calc-sheet-preview-modal.tsx` [184 LOC] over the 200-line cliff), upgrade the **existing shared UI primitives** (`App.tsx` workbench host, `DiagramModeBar`, `WhiteBoxEquationCard`, `LearnModeCallout`, `ScrubbableNumberInput`) plus two new `< 130` LOC files (`src/lib/framer-motion-tokens.ts` and `src/components/ui/framer-motion-primitives.tsx`).

- **Concrete Evidence**:
  - Every workbench (`WB2`, `WB3`, `WB4`, `WB5`, `WB6`) already renders through `App.tsx` (`renderWorkbench`), `<DiagramModeBar />` (`src/components/ui/diagram-mode-bar.tsx`, currently only 66 LOC), `<WhiteBoxEquationCard />` (`src/components/ui/white-box-equation-card.tsx`, currently only 41 LOC), `<LearnModeCallout />` (`src/components/ui/learn-mode-callout.tsx`, currently only 34 LOC), and `<MissionChecklistBanner />` (`src/components/shell/mission-checklist-banner.tsx`, currently only 54 LOC).
  - Animating those 5 low-LOC shared primitives automatically animates **all 6 workbenches, 18+ white-box equations, 4 diagram galleries, and all student missions** while touching almost zero lines in the 170–190 LOC workbench files!
- **Operational Delta**:
  - **80% less code duplication** across workbenches.
  - **Zero risk to the `< 200` LOC ceiling** on large workbench files.
  - **Automatic consistency**: every equation card, diagram mode switcher, and scrubbable control inherits identical Framer physics (`[0.22, 1, 0.36, 1]` entrance, `500/60/1` layout spring, `0.4s bounce 0.2` hover/verdict spring).
- **Cost of Switching**: Zero—it is strictly faster to implement, easier to test, and safer under `AGENTS.md` Invariant #2.

---

## 7. Recommended Architecture & Choreography Blueprint

### 7.1 Exact File Breakdown & `< 200` LOC Budget Plan

| File Path | Action | Current LOC | Target LOC | Responsibility |
| :--- | :--- | :---: | :---: | :--- |
| `src/lib/framer-motion-tokens.ts` | **NEW** | 0 | ~75 | Exact Framer MCP (`bPWSkk20pwfxzXmKGtRh`) easing curves, layout springs, hover elevation variants, stagger helpers, and Swarm Pulse loop configs. |
| `src/components/ui/framer-motion-primitives.tsx` | **NEW** | 0 | ~130 | Reusable enter-only `<FramerEntranceStage />`, `<SwarmPulseDot />`, `<MotionPillButton />` (shared `layoutId` pill wrapper), and `<FramerModalShell />`. |
| `src/styles/framer-motion-surfaces.css` | **NEW** | 0 | ~125 | Framer radial spotlights (Midnight/Obsidian/Radiant Yellow `#FACC15`/Emerald `#10B981` mapped to Blueprint & Paper themes), `1px` bento hairline glow, SVG handle pulse rings, and `@media (prefers-reduced-motion: reduce)`. |
| `src/styles/theme-tokens.css` | **EDIT** | 137 | ~142 | Add `@import './framer-motion-surfaces.css';` after `workbench-components.css` (preserving `.wb-split` / `.shell-workspace` cascade pin). |
| `src/App.tsx` | **EDIT** | 76 | ~95 | Wrap active workbench output in `<FramerEntranceStage key={activeWorkbench}>` for instant unmount + Framer `0.65s` `[0.22, 1, 0.36, 1]` entrance on tab switch. |
| `src/components/ui/diagram-mode-bar.tsx` | **EDIT** | 66 | ~95 | Add `motion.span` shared `layoutId={`${testId}-pill`}` with `FRAMER_LAYOUT_SPRING` (`500/60/1`) and tactile hover/tap micro-interactions. |
| `src/components/ui/white-box-equation-card.tsx` | **EDIT** | 41 | ~95 | Wrap card in `motion.div` hover elevation (`y: -3, scale: 1.01`), 3 stages (`SYMBOLIC`, `SUBSTITUTED`, `RESULT`) in `0s / 0.06s / 0.12s` staggered entrance, plus a key-triggered gold highlight pulse when `equation.resultLatex` updates. |
| `src/components/ui/learn-mode-callout.tsx` | **EDIT** | 34 | ~55 | Enter-only Framer slide-and-fade (`y: 12 → 0, opacity: 0 → 1`) when switching into `🎓 Learn Mode`. |
| `src/components/shell/mission-checklist-banner.tsx` | **EDIT** | 54 | ~85 | Framer `Evidence Approval Preview` spring (`duration: 0.4, bounce: 0.2`) on step completion (`done: true`) and banner entrance. |
| `src/components/shell/app-shell.tsx` | **EDIT** | 188 | ~175 | Replace inline `motion.span` boilerplate with `<SwarmPulseDot />` inside `dof-badge` and apply `FRAMER_LAYOUT_SPRING` to `active-persona-pill` & `active-workbench-tab` while trimming 14 lines via helper reuse. |
| `src/components/shell/agent-chat-drawer.tsx` | **EDIT** | 189 | ~172 | Extract message list item or use `<SwarmPulseDot />` on `copilot-model-badge` & `current-screen-badge`, and animate new chat bubbles, Point-and-Ask chips, and GenUI cards on mount while staying `< 180` LOC. |
| `src/components/workbenches/calc-sheet-preview-modal.tsx` | **EDIT** | 184 | ~182 | Replace static `.modal-backdrop` / `.modal-dialog` outer divs with `<FramerModalShell>` (enter-only backdrop blur fade + dialog spring `scale: 0.96 → 1, y: 14 → 0`; synchronous `if (!isOpen) return null` preserved). |
| `src/components/workbenches/thermo-diagram-gallery.tsx` (+ `hydraulics`, `distillation`, `kinetics` galleries) | **EDIT** | 78–156 | ~95–165 | Wrap conditional diagram sections (`showPhase`, `showCyclesEq`, etc.) in `<FramerEntranceStage key={diagramMode}>` so switching diagram modes triggers Framer's entrance cascade with synchronous DOM unmount. |
| `src/components/workbenches/handbook-atlas-workbench.tsx` & `visual-verifier-workbench.tsx` | **EDIT** | 158 / 186 | ~170 / ~184 | Add shared `layoutId` pill morphing to `WB5` cluster/section pills and `WB1` preset chips via `<MotionPillButton />`. |

---

### 7.2 Exact Framer MCP Tokens (`src/lib/framer-motion-tokens.ts`)

```ts
// Exact motion & surface choreography tokens extracted from Framer MCP
// Project: "Luxurious Three" (bPWSkk20pwfxzXmKGtRh) in AI4U's Workspace.
import type { Transition, Variants } from 'motion/react';

/** Framer appearEffect cubic-bezier: [0.22, 1, 0.36, 1], 0.65s, 60ms cascade stagger */
export const FRAMER_ENTRANCE_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const FRAMER_ENTRANCE_TRANSITION: Transition = {
  type: 'tween',
  ease: FRAMER_ENTRANCE_EASE,
  duration: 0.65,
};

export const FRAMER_STAGGER_DELAYS = [0, 0.06, 0.12, 0.18] as const;

/** Framer breakpoint / shared-layout pill spring: stiffness 500, damping 60, mass 1 */
export const FRAMER_LAYOUT_SPRING: Transition = {
  type: 'spring',
  stiffness: 500,
  damping: 60,
  mass: 1,
};

/** Framer Sector card hover & Evidence Approval state-flip spring: duration 0.4s, bounce 0.2 */
export const FRAMER_BOUNCE_SPRING: Transition = {
  type: 'spring',
  duration: 0.4,
  bounce: 0.2,
};

/** Framer Swarm Pulse (NgQ5bLGaW -> TSGDAqBQ2): 1.4s mirror loop on 7px status beacon */
export const FRAMER_SWARM_PULSE_TRANSITION: Transition = {
  duration: 1.4,
  repeat: Infinity,
  repeatType: 'mirror',
  ease: [0.42, 0, 0.58, 1],
};

/** Enter-only container & item variants (NO exit prop -> 100% synchronous DOM unmount for Vitest) */
export const FRAMER_STAGE_VARIANTS: Variants = {
  initial: { opacity: 0, y: 18, scale: 1 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      ...FRAMER_ENTRANCE_TRANSITION,
      staggerChildren: 0.06,
    },
  },
};
```

---

### 7.3 Core Choreography Recipes Across Surfaces

1. **`<SwarmPulseDot />` (Framer `NgQ5bLGaW -> TSGDAqBQ2`)**:
   - A `7px × 7px` rounded status light rendered inside `dof-badge`, `copilot-model-badge`, `current-screen-badge`, and safety verdict banners.
   - Animates `opacity: [0.35, 1]` and `scale: [1, 1.25]` over `1.4s` (`repeatType: "mirror"`, `ease: [0.42, 0, 0.58, 1]`).
   - Color adapts to engineering state: Radiant Gold (`#FACC15` / `var(--maize)`) for active telemetry, Emerald (`#10B981` / `var(--status-pass)`) for safe/converged operating points (`DoF = 0`, `PASS`), and Amber/Coral (`var(--status-danger)`) when a cavitation, flooding, or Semenov runaway trap is active.

2. **Ubiquitous Shared-Layout Pill Morphing (`<MotionPillButton />` & `<DiagramModeBar />`)**:
   - Every segmented switcher renders `{isActive && <motion.span layoutId={groupLayoutId} className="motion-pill framer-pill-glow" transition={FRAMER_LAYOUT_SPRING} />}` behind its label `<span style={{ position: 'relative', zIndex: 1 }}>`.
   - Active pills emit Framer's subtle gold halo (`box-shadow: 0 0 28px 2px rgba(250, 204, 21, 0.22)` in Blueprint mode; `0 0 18px 1px rgba(232, 197, 71, 0.32)` in Paper mode).

3. **3-Stage White-Box Equation Choreography (`<WhiteBoxEquationCard />`)**:
   - Card container uses `whileHover={{ y: -3, scale: 1.01 }}` with `FRAMER_BOUNCE_SPRING` (`duration: 0.4, bounce: 0.2`).
   - Stages 1 (`SYMBOLIC`), 2 (`LIVE SUBSTITUTION`), and 3 (`EVALUATED RESULT`) enter with `delay: 0s`, `0.06s`, and `0.12s` (`ease: [0.22, 1, 0.36, 1]`, `duration: 0.65s`).
   - Stage 3 (`eq-stage-result-${equation.id}`) carries a subtle CSS/motion highlight transition so scrubbing any parameter slider illuminates the evaluated result badge in real time without unmounting the KaTeX node.

4. **Interactive SVG Handle & Crosshair Halo (`framer-motion-surfaces.css`)**:
   - All draggable SVG handles (`circle[style*="cursor: grab"]`, `data-testid="genui-sparkline-handle"`, `data-testid="calibrated-crosshair"` circle, and `.scrubbable-handle`) gain a smooth scale-up on hover/active (`transform-box: fill-box; transform-origin: center; transition: transform 180ms cubic-bezier(0.22, 1, 0.36, 1), filter 180ms ease`) with a Radiant Gold drop-shadow halo (`filter: drop-shadow(0 0 8px rgba(250, 204, 21, 0.65))`).

5. **Modal & Co-Pilot Drawer Choreography (`<CalcSheetPreviewModal />` & `<AgentChatDrawer />`)**:
   - When `isOpen` becomes `true`, `<FramerModalShell>` fades the backdrop (`opacity: 0 → 1`, `duration: 0.22s`) and springs the dialog (`opacity: 0 → 1, y: 18 → 0, scale: 0.97 → 1`, `FRAMER_BOUNCE_SPRING`). When `isOpen` becomes `false`, `if (!isOpen) return null` executes synchronously so tests asserting modal closure pass immediately.
   - In `<AgentChatDrawer />`, newly attached Point-and-Ask `.composer-chip` pills, `.chat-msg` bubbles, and `.genui-stream` cards enter with `initial={{ opacity: 0, y: 12, scale: 0.98 }}` → `animate={{ opacity: 1, y: 0, scale: 1 }}` (`FRAMER_BOUNCE_SPRING`), and `.copilot-mutation-pill` flashes Framer's Emerald glow (`#10B981`).

---

## 8. Ranking Appendix (`--ultra` Verifier & `--advice` Kongming Counsel)

| Anonymized ID | Original Slot | Score (`/100`) | Rationale |
| :--- | :--- | :---: | :--- |
| **Candidate A (Winner)** | Candidate 4 | **96/100** | Highest architectural leverage: animates the 5 shared low-LOC primitives (`App.tsx`, `DiagramModeBar`, `WhiteBoxEquationCard`, `LearnModeCallout`, `MissionChecklistBanner`) + diagram galleries and *reduces* line counts in `app-shell.tsx` (188 $\to$ ~175 LOC) and `agent-chat-drawer.tsx` (189 $\to$ ~172 LOC) via `<MotionPillButton />` and `<SwarmPulseDot />`, while guaranteeing synchronous DOM unmount for Vitest. |
| **Candidate E** | Candidate 2 | **94/100** | Close runner-up; explicitly formulates the **SVG Scrub Guard** (excluding `.wb-crop-stage` and `<svg data-testid>` from container hover scale transforms so `clientPointToViewBox` bounding-box math stays pixel-accurate). |
| **Candidate B** | Candidate 1 | **86/100** | Strong dual-theme CSS variable mapping and Mermaid architecture diagram, but leaves `agent-chat-drawer.tsx` without TSX-level `<SwarmPulseDot />` primitives. |
| **Candidate C** | Candidate 5 | **85/100** | Solid hybrid structure, but falls back to CSS-only animations for the chat drawer and visual verifier rather than compacting JSX via shared primitives. |
| **Candidate D** | Candidate 3 | **82/100** | Relies on CSS `::before` pseudo-elements for Swarm Pulse dots, sacrificing DOM-queryable `data-testid="swarm-pulse-dot"` nodes. |

### Kongming `--advice` Checkpoint Summary
- **Verdict**: **GO** — Proceed to `/ak:plan --advice` or `/ak:cook --advice`.
- **Top Risk to Watch During Implementation**:
  1. **Namespace `layoutId` per group** (`layoutId={`${testId}-active-pill`}`) so Framer Motion's FLIP engine never cross-animates pills between the header toolbar and `<DiagramModeBar />`.
  2. **Enforce the SVG Scrub Guard**: Never apply `scale()` or `translateY()` hover transforms to `.wb-crop-stage` or `<svg data-testid="...">` so `getBoundingClientRect()` inside `clientPointToViewBox` stays pixel-exact during pointer scrubbing.
  3. **Verify `< 200` LOC (`wc -l`)** on `app-shell.tsx` and `agent-chat-drawer.tsx` before and after wiring `<SwarmPulseDot />` and `<MotionPillButton />`.

---

## Unresolved Questions
- None — all Framer MCP tokens (`bPWSkk20pwfxzXmKGtRh`), codebase line counts, and Vitest synchronous-unmount constraints are fully verified.

ultra: picked=A/5 margin=high unanimous=yes rejected_all=no
