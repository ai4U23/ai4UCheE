# Design Guidelines — ai4UCheE

## Visual Language & Dual Theme
`ai4UCheE` implements two deliberate visual identities tailored to working contexts:

1. **EPC Calc-Pad Paper (`☀️ Learn Mode`)**:
   - Background: Warm off-white paper (`#FAF8F5`)
   - Text: Deep charcoal engineering ink (`#1A202C`)
   - Accent: Engineering amber/ochre (`#D97706`) and grid lines (`#E5E7EB`)
   - Typography: Clean sans-serif for UI (`Inter` / `Geist Sans`), monospaced for calculations (`JetBrains Mono`), and math formatting (`KaTeX`).

2. **Control Room Blueprint (`🌙 Plant Mode`)**:
   - Background: Industrial blueprint navy (`#0B101B`)
   - Panels: Dark slate cockpit surfaces (`#131B2E`)
   - Text: High-contrast luminescent white (`#F8FAFC`)
   - Accents: Valve / alarm states (Cyan `#06B6D4`, Emerald `#10B981`, Amber `#F59E0B`, Crimson `#EF4444`).

## Interactive Ergonomics
- **Point-and-Ask (`useAgentSelectable`)**: Clicking any calculation result, table cell, or diagram region attaches an `agent-select:<kind>:<id>` context pill to the chat composer.
- **Scrubbable Numeric Inputs**: Engineering parameters (flow rate, temperature, pipe diameter) support drag-to-scrub manipulation with immediate live re-calculation.
- **Visual Grounding**: Calculations link directly to side-by-side PDF crops showing the handbook source equation and table row.
