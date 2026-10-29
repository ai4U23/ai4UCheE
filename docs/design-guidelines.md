# Design Guidelines — ai4UCheE

## Visual Language & Dual Theme (`ai4UMasterplan` Sovereign Design System)
`ai4UCheE` implements the canonical **`ai4U` (`ai4UMasterplan`)** visual identity across two working contexts:

1. **Institutional Ivory (`☀️ Ivory #FBF6EC` / `data-theme="paper"`)**:
   - **Canvas & Surfaces**: Primary Institutional Ivory (`--ivory: #fbf6ec`), Secondary Paper panels (`--paper: #f5f0e0`), Elevated cards (`#ffffff`).
   - **Typography & Ink**: Sovereign Deep Navy (`--navy-deep: #071a33`) primary text, Muted Slate (`--muted-foreground: #3b455d`, WCAG 2.2 AA $\ge 4.5:1$ contrast).
   - **Masthead & Brand**: Sovereign Deep Navy header (`#071a33`) with the canonical `ai4U` logo (`/ai4u-logo.png`, Maize drop-shadow glow), `Cormorant Garamond` display title, and Maize Gold (`--maize: #e8c547`) eyebrow & hairline border.
   - **Accents**: Maize Gold (`--maize: #e8c547`, `--maize-soft: #f7dca6`) for active workbench tabs, Point-and-Ask selection halos, and citation badges; Navy (`--navy: #0f1b3d`) for primary traces.

2. **Sovereign Dark Navy (`🌙 Dark Navy #071A33` / `data-theme="blueprint"`)**:
   - **Canvas & Surfaces**: Deep Sovereign Navy ground (`--navy-deep: #071a33`), Navy panel cards (`--navy: #0f1b3d`), Elevated controls (`--navy-mid: #1e2f5c`), Royal hairlines (`--royal: #2a3a66`).
   - **Text**: Institutional Ivory (`#fbf6ec`) and warm muted parchment (`#d5ccb8`).
   - **Accents**: Signature Maize Gold (`#e8c547`) and Soft Maize (`#f7dca6`), paired with process alarm states (Emerald `#34d399`, Maize `#e8c547`, Crimson `#f87171`).

## Typography
- **Display & Section Headings**: `Cormorant Garamond`, serif (weights 500, 600, 700).
- **UI & Narrative Body**: `Karla`, sans-serif (weights 400, 500, 600, 700).
- **Calculations, Units & Citations**: `JetBrains Mono` (`tabular-nums`) and `KaTeX`.

## Interactive Ergonomics
- **Point-and-Ask (`useAgentSelectable`)**: Clicking any calculation result, table cell, or diagram region attaches an `agent-select:<kind>:<id>` context pill to the chat composer with a `--maize` (`#e8c547`) selection outline.
- **Scrubbable Numeric Inputs**: Engineering parameters (flow rate, temperature, pipe diameter) support drag-to-scrub manipulation with immediate live re-calculation.
- **Visual Grounding**: Calculations link directly to side-by-side PDF crops showing the handbook source equation and table row.

## Sovereign Two-File CSS Architecture (Academic-Tactile Overhaul)
- **Two-file split, each `< 200` LOC**: `src/styles/theme-tokens.css` (palette tokens, typography, `.app-shell` with `grid-template-rows: auto auto auto 1fr`, and `@import './workbench-components.css'`) plus `src/styles/workbench-components.css` (tactile `.scrubbable-*`, `.motion-pill`, `.mission-*`, `.learn-callout`, `.chat-drawer`, `.chip-tray`, `.composer-chip`, `.genui-*`, `.wb-verdict`, `.wb-crop-placeholder`, `.modal-backdrop`, `.katex-block`).
- **Nested-grid discipline**: `.shell-workspace` (outer AppShell `<main>`, `grid-template-columns: minmax(0, 1.68fr) minmax(340px, 0.92fr)`) vs. `.wb-split` (inner workbench splits, `1.4fr 1fr`). Both are equal-specificity single-class selectors, so `.shell-workspace` is deliberately pinned AFTER `.wb-split` in source order (cascade pin) to win on `<main class="shell-workspace wb-split">`; both collapse to `1fr` below 1080 px.
- **`<KaTeXBlock />`**: safe `katex.renderToString` wrapper (`throwOnError: false`) for display & inline equations — DIPPR Eq. 101/106 (WB2), the Darcy–Fanning guardrail (WB3), Fenske `N_min` (WB4), and every inline `equation-proof-card` GenUI card. Never render equations as ASCII monospace.
- **`<GuidedMissionBar />`**: 4 one-click student missions under the nav (Catch the 4× Friction Trap, Boil Water at 100 °C, Check Pump Cavitation, Stage a Binary Distillation Column). A mission click switches to 🎓 Learn Mode, selects the target workbench, attaches the mission's Point-and-Ask chip, and instantly emits an `equation-proof-card` into the Co-Pilot drawer's GenUI stream (collapsible via the toggle button).
- **`<LearnModeCallout />`**: plain-English student intuition card (title / plain-English explanation / ⚠️ common trap / Perry anchor) rendered only when `personaMode === 'learn'` so Plant Mode keeps its compact EPC workspace.

## Interactive Intelligence Layer (Phase 9, 2026-10-30)
- **`<WhiteBoxEquationCard />`** (`src/components/ui/white-box-equation-card.tsx`): the canonical equation presentation — Stage 1 `SYMBOLIC` → Stage 2 `LIVE SUBSTITUTION` (re-typeset on every slider drag) → Stage 3 `EVALUATED RESULT`, each with a `--maize` citation badge carrying the exact `[Perry's 9th Ed., ..., p. S-P]` reference. A learn-mode `plainExplanation` note and a crimson `warningText` strip (cavitation / flooding alarms) round out the card. The 3-column `.white-box-stage-grid` collapses to a single column ≤ 900 px.
- **`<DipprPhaseEnvelopeSvg />`** (`src/components/sketches/dippr-phase-envelope-svg.tsx`): log-scaled DIPPR Eq. 101 saturation curve (270 K → `T_c`) with the dashed 1 atm (101.325 kPa) reference, critical-point marker, and a maize operating crosshair whose caption badge reads SUBCOOLED LIQUID / NORMAL BOILING POINT / PRESSURIZED SATURATION.
- **`<MissionChecklistBanner />`** (`src/components/shell/mission-checklist-banner.tsx`): live 3-step rescue strip (Observe Trap → Scrub Control → Verify Proof) that auto-checks against the payload bus and offers the maize `⚡ Auto-Fix & Ask Copilot` button dispatching solver-verified rescue mutations.
- **`.copilot-mutation-pill`**: emerald confirmation pill on assistant messages (`⚡ Applied to Workbench: key=val, ...`) shown whenever copilot `actionMutations` scrub workbench sliders — mutability is always made visible and reversible through the mission bar's re-click.
- **Quick actions** (`copilot-prompts.ts`): one 1-tap What-If pill per workbench above the chat input, so the natural-language mutation loop is discoverable without typing.
