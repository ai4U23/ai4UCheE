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
