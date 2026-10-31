# Plan: ai4UCheE Showcase Homepage (`/ak:show-off`) & Interactive User Guide Video (`/ak:remotion`)

- **Date:** 2026-10-31
- **Mission:** `/ak:show-off create a homepage for the app to introduce features and a /ak:remotion video to guide users to use it`
- **Resolved Preferences (`ak:show-off`):**
  - `screenshots`: `true` (horizontal `1920x1080`, vertical `1080x1920`, square `1080x1080` per section)
  - `publishing`: `true` (`agentwiki` CLI not on `PATH` locally — local artifact + in-app `/public/showcase.html` & modal integration delivered and documented)
  - `languages`: `["en"]` (`dualLanguage: false` — English-only persisted via `preferences.js set --languages en`)

## Design Brief (`ak:frontend-design` Decision Procedure)
```text
Register:  Brand + Product Showcase (Sovereign Chemical Engineering Studio)
Scene:     ChE students (🎓 Learn Mode) & plant/process engineers (🏭 Plant Mode) exploring ai4UCheE on desktop/tablet/mobile
Direction: Sovereign Scholarly Handbook meets Tactile AI-Native Studio because it bridges 6 canonical ChE textbooks with live interactive SVG nomographs and White-Box KaTeX proofs
Color:     Committed Sovereign Palette; bg Institutional Ivory (#FBF6EC / #071A33 dark), text Deep Navy (#071A33 / #FBF6EC), accent Maize Gold (#E8C547)
Type:      Cormorant Garamond (display serif) + Karla (narrative sans) + JetBrains Mono (tabular equations & citations)
Signature: Interactive 6-Book Subject Matrix + Embedded Frame-Accurate Walkthrough Video Player + 3-Stage White-Box Proof & 6-Stage Fogler Detective Showcase
Dials:     variance 6, motion 6, density 5
```

## Checklist
- [x] 1. **Request Analysis & Plan Setup:** Resolve `ak:show-off` preferences (`en` only, `screenshots=true`), inspect `DESIGN.md` & `REVIEW.md`.
- [x] 2. **Remotion Guide Video (`/ak:remotion`):**
  - Build Remotion composition (`video-guide/`) following `ak:remotion` rules (`useCurrentFrame`, `useVideoConfig`, `spring`, `interpolate`, `<Series>`, `<Sequence premountFor={...}>`, zero CSS animations).
  - Render frame-accurate MP4 video (`public/ai4uchee-guide.mp4` & `assets/showoff/ai4uchee-homepage/ai4uchee-guide.mp4`) guiding users through:
    1. **Scene 1 — Welcome & 3-Zone Studio (`1 Bar · 1 Canvas · 1 Agent`)**
    2. **Scene 2 — Dual-Persona Switch (`🎓 Learn Mode` vs. `🏭 Plant Mode`) & 5 Subject Labs**
    3. **Scene 3 — Problem-First 6-Stage Fogler Flow (24 Real-Life Plant Problems & `L1–L4` Tiers)**
    4. **Scene 4 — Interactive SVG Scrubbing & 3-Stage White-Box KaTeX Proofs (`f_D = 4·f_F`, `psig → psia`)**
    5. **Scene 5 — Bi-Directional AI Co-Pilot (`+ Ask` chips, What-If slider mutations) & Senior EPC QA/QC Calc Sheet**
- [x] 3. **Showcase Content (`assets/showoff/ai4uchee-homepage/content.md`):**
  - English-only structured markdown across 6 sections with verbatim citations & references.
- [x] 4. **Interactive Diagram (`ak:diagram`) & Self-Contained HTML Showcase (`assets/showoff/ai4uchee-homepage/index.html` + `public/showcase.html`):**
  - Compile typed JSON IR system architecture diagram via `ak:diagram` (`scripts/compiler/compile.mjs --format fragment`).
  - Assemble 100% offline-capable self-contained HTML showcase with 6 viewport-fitted sections (`#hero`, `#video-guide`, `#six-books-labs`, `#problem-solving`, `#whitebox-copilot`, `#calc-sheet-cta`), `System/Light/Dark` theme switcher, embedded Remotion MP4 video + interactive chapter-seeking player, and citation footnotes.
- [x] 5. **In-App Homepage Tour & Video Guide Drawer (`src/components/shell/showcase-video-modal.tsx`):**
  - Add `🎬 Guide` button in `AppShell` header so users inside the live React workbench can watch the Remotion guide video, explore the feature overview, or jump straight into any lab/mission without breaking any existing Vitest tests.
- [x] 6. **Multi-Ratio Section Screenshots & Verification Gates:**
  - Capture `horizontal` (1920×1080), `vertical` (1080×1920), and `square` (1080×1080) screenshots for all 6 sections into `assets/showoff/ai4uchee-homepage/images/`.
  - Run `render-check.mjs`, `npm test`, and `npm run build`, then open the showcase HTML page.
