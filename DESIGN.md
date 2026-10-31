# DESIGN.md — ai4UCheE Sovereign Design System

## Brand Essence
**Modern scholarly chemical engineering handbook meets tactile AI-native studio** — blending 6 canonical ChE textbooks (*Perry's 9th Ed.*, *Fogler*, *Bird-Stewart-Lightfoot*, *Smith-Van Ness-Abbott*, *Seader*, *Crowl & Louvar*) with live interactive SVG nomographs, 3-stage White-Box KaTeX proofs, and bi-directional AI Co-Pilot slider control.

## Art Direction & Register
- **Register:** Product + Reference Atlas (`🎓 Learn Mode` for ChE students · `🏭 Plant Mode` for EPC/process engineers).
- **Surface Identity:** Single Institutional Ivory (`#FBF6EC` / `data-theme="paper"`) canvas paired with a Sovereign Deep Navy (`#071A33`) studio masthead and Maize Gold (`#E8C547`) interactive accents.
- **3-Zone AI-Native Studio ("1 Bar · 1 Canvas · 1 Agent"):**
  - **Zone 1 (Top Studio Bar):** Compact dark masthead (`#071A33`) with `ai4UCheE` brand + 5-second value-prop eyebrow (`6-Book ChE Solver · 55+ Charts · 24 Plant Problems`), `🔧 <Active Subject> · 5 Labs ▾` switcher, `🌱 L1 · 🔧 L2 · 🕵️ L3 · 🚨 L4 · 📚 Browse All 24 Problems ▾` launcher, `🎓 Learn` / `🏭 Plant` persona switcher, `📐 Charts` (`WB1`), `📄 Calc Sheet`, and `🔗 Share / AI` (`<PageAxShareMenu />`).
  - **Zone 2 (Interactive Engineering Canvas):** Primary interactive SVG diagram/nomograph + single-line `34px` `<ScrubbableNumberInput />` dials above the fold; progressive-disclosure drawers (`📐 Show Math Proofs`, `📊 More Diagrams`, `🕵️ 6-Stage Investigation`) below.
  - **Zone 3 (Sticky AI Co-Pilot Inspector):** Live `<current-screen>` sync pill, inline `genui-stream` proof cards, Point-and-Ask chip tray (`+ Ask`), 1-tap What-If quick actions, and natural-language slider mutation composer.

## Tokens (`src/styles/theme-tokens.css`)

### Color Palette
| Token | Value | Usage |
|---|---|---|
| `--ivory` / `--bg-canvas` | `#fbf6ec` | Primary Institutional Ivory page background |
| `--paper` / `--bg-panel` | `#f5f0e0` | Secondary workbench panel surface |
| `--bg-elevated` | `#ffffff` | Elevated cards, inputs, and inner split cards |
| `--navy-deep` / `--ink-primary` | `#071a33` | Primary body ink and top studio masthead |
| `--navy` / `--accent-primary` | `#0f1b3d` | Primary SVG curve strokes and header buttons |
| `--muted-foreground` / `--ink-muted` | `#3b455d` | Muted labels/subtitles (WCAG 2.2 AA ≥ 4.5:1) |
| `--border-grid` | `#dfd6c0` | Hairline card and table borders |
| `--maize` / `--accent-maize` | `#e8c547` | Active tabs, Point-and-Ask halos, focus rings, SVG handles |
| `--maize-soft` | `#f7dca6` | High-contrast gold text on dark navy surfaces |
| `--status-pass` | `#15803d` | Safe operating point / pass verdict |
| `--status-warn` | `#b45309` | Engineering caution / coaching callout |
| `--status-danger` | `#b91c1c` | Cavitation, flooding, or Semenov runaway hazard |

### Typography
- **Display & Headings (`--font-display`):** `'Cormorant Garamond', ui-serif, Georgia, serif` (weights 500, 600, 700; `letter-spacing: -0.015em`).
- **UI & Narrative Body (`--font-sans`):** `'Karla', -apple-system, BlinkMacSystemFont, sans-serif` (weights 400, 500, 600, 700; `line-height: 1.48`).
- **Calculations, Units & Citations (`--font-mono`):** `'JetBrains Mono', monospace` with `font-variant-numeric: tabular-nums` and `<KaTeXBlock />` for symbolic/substituted equations.

### Spacing, Radius & Elevation
- **Radius:** `10px` on top-level `.wb-panel` / `.chat-drawer`; `7px–8px` on buttons, inputs, and inner cards; `999px` on pills/chips.
- **Shadow (`--shadow-lift`):** `0 1px 2px rgb(7 26 51 / 0.06), 0 10px 28px -10px rgb(7 26 51 / 0.14)` on top-level panels; nested `.wb-panel .wb-panel` stays flat (`box-shadow: none`).

## Motion Principles (`src/lib/framer-motion-tokens.ts` & `src/styles/framer-motion-surfaces.css`)
- **Entrance (`FramerEntranceStage`):** `opacity: 1` initial state (never `opacity: 0`, preventing blank crawler/WAAPI traps), subtle translate/transition (`cubic-bezier(0.22, 1, 0.36, 1)`).
- **Shared-Layout Pill Spring (`FRAMER_LAYOUT_SPRING`):** `{ type: 'spring', stiffness: 500, damping: 60, mass: 1 }`.
- **Swarm Pulse Dot (`SwarmPulseDot`):** `8px` status beacon with `1.4s` halo keyframe loop.
- **SVG Scrub Guard:** Never apply `scale()` or `translateY()` hover transforms to `.wb-crop-stage` or `<svg>` elements so `getBoundingClientRect()` inside `clientPointToViewBox` remains pixel-exact.
- **Reduced Motion:** `@media (prefers-reduced-motion: reduce)` collapses all animation and transition durations to `0.01ms`.

## Responsive Breakpoints
- **`> 1120px` (Desktop Studio):** 1-row `.shell-header` (`grid-template-columns: auto 1fr auto`) + 2-column `.shell-workspace` (`minmax(0, 1.78fr) minmax(320px, 370px)`).
- **`768px–1120px` (Tablet):** 2-row `.shell-header` (`grid-template-columns: 1fr auto` with `.mission-bar` spanning `1 / -1` on row 2) so zero horizontal overflow occurs at `768×1024`; `.shell-workspace` and `.wb-split` stack to `minmax(0, 1fr)` below `1080px`.
- **`≤ 767px` (Mobile & 320px Reflow):** Single-column header and workspace, `44px` touch targets on canvas controls, compact `36px` header buttons so the masthead stays `≤ 20%` of viewport height.

## Voice, Tone & Do / Don't
- **Do:** Pair every calculated number with its physical unit (`psig` vs. `psia`), explicit friction basis (`f_F` vs. `f_D = 4·f_F`), and bracketed textbook anchor (`[Perry's 9th Ed., Fig. 6-9, p. 6-10]`).
- **Do:** Keep all CSS and TypeScript source files strictly `< 200` lines of code (`AGENTS.md` Invariant #2).
- **Don't:** Render equations as raw ASCII text when `<KaTeXBlock />` or `<WhiteBoxEquationCard />` applies, or expose raw internal IDs (`wb1-visual-verifier`) as user-facing titles without a friendly label.
