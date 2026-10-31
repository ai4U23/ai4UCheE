# UX/AX review & implementation report: ai4UCheE (ChemEng's Intelligent Workbench) — 2026-10-31

## Verdict
**Project DONE contract: 8 / 8 PASS (`--auto` implementation complete).**
All `Must`, `Should`, and `Could` proposals (`P1`–`P7`) have been implemented and verified:
- **AX / GEO (`check-discovery-surfaces.mjs`):** Went from **4 errors, 10 warnings** (`round-0`) to **0 errors, 0 warnings** (`round-1`, exit code `0`), with `public/robots.txt` allowing all AI search, user, and training crawlers (`OAI-SearchBot`, `Claude-SearchBot`, `PerplexityBot`, `GPTBot`, `ClaudeBot`, `Google-Extended`, `CCBot`), `public/sitemap.xml`, `public/llms.txt`, `public/llms-full.txt`, `/index.md` + `Accept: text/markdown` content negotiation, `1200×630` Open Graph card (`public/og-card.png`), JSON-LD `@graph` (`Organization`, `WebSite`, `SoftwareApplication`), semantic server-HTML fallback inside `<div id="root">`, and the header `🔗 Share / AI` (`<PageAxShareMenu />`) menu.
- **UX / Responsive (`render-check.mjs`):** Went from **1 error (`+37px` horizontal overflow at `768×1024`)** (`round-0`) to **0 errors, 0 warnings across all 4 viewports (`1440×900`, `768×1024`, `375×812`, `320×812`)** (`round-1`, exit code `0`), with a visible 5-second value-proposition eyebrow (`6-Book ChE Solver · 55+ Charts · 24 Plant Problems`), `🔧 Charts & Nomographs · 5 Labs ▾` cue, friendly Co-Pilot workbench titles (`Calibrated Nomographs & Charts (WB1)`), and explicit `:focus-visible` `2px solid var(--maize)` outlines.

## Scope and environment
- **Mode:** `--auto` (Review → Analyze → Propose → Define DONE → Implement `P1`–`P7` → Verify with `check-discovery-surfaces.mjs`, `render-check.mjs`, native vision, `tsc`, `vitest`, and `vite build`)
- **Focus:** `whole site` (`AppShell`, `WB1`–`WB6`, `AgentChatDrawer`, `PageAxShareMenu`, `index.html`, `public/*`, `src/server/api-server.ts`, `vite.config.ts`, `DESIGN.md`, `REVIEW.md`, `AGENTS.md`)
- **Dev server & production origin:** Temporary Vite server at `http://127.0.0.1:5173` mapped against `--site-origin https://chemeng.ai4u.now` (stopped cleanly after verification)
- **Base commit:** `cfb3964` on `main`
- **Checks that could not run:** None.

## Evidence: Baseline (`round-0`) vs. Post-Implementation (`round-1`)

### Viewport screenshots & layout diagnostics (`render-check.mjs`)

| Viewport | Baseline (`round-0`) | Post-Implementation (`round-1`) | Status |
|---|---|---|---|
| Desktop `1440×900` | `round-0/1440x900.png` (`0` errors; hidden `.brand-eyebrow`, raw `WB1-VISUAL-VERIFIER` greeting, no `Share / AI` menu) | `round-1/1440x900.png` (`0` errors, `0` warnings; `50px` single-line header with `6-Book ChE Solver · 55+ Charts · 24 Plant Problems`, `5 Labs ▾`, `🔗 Share / AI ▾`, and friendly `Calibrated Nomographs & Charts (WB1)` greeting) | **PASS** |
| Tablet `768×1024` | `round-0/768x1024.png` (**1 ERROR**: `horizontal-overflow` `+37px` wider than viewport) | `round-1/768x1024.png` (**`0` errors, `0` warnings**; clean stacked header at `768px` with `0px` horizontal overflow) | **PASS** |
| Mobile `375×812` | `round-0/375x812.png` (`0` errors, `0` warnings) | `round-1/375x812.png` (**`0` errors, `0` warnings**; all touch targets `≥ 44px`, `0px` overflow) | **PASS** |
| Reflow `320×812` | `round-0/320x812.png` (`0` errors, `0` warnings) | `round-1/320x812.png` (**`0` errors, `0` warnings**; clean 320px WCAG reflow) | **PASS** |

### Discovery-surface scan (`check-discovery-surfaces.mjs`)
- **Baseline (`round-0`):** Exit code `1` — `4 errors, 10 warnings, 2 info`.
- **Post-Implementation (`round-1`):** Exit code `0` — **`0 errors, 0 warnings, 1 info`** (`no training or user-fetch AI token is blocked site-wide`, matching owner decision to allow all AI bots).

## Scores (Baseline → Post-Implementation)

| Area | Baseline | Post (`round-1`) | Evidence |
|---|---|---|---|
| First impression | 1 / 3 | **3 / 3** | `round-1/1440x900.png`, `src/components/shell/app-shell.tsx:105`: Visible eyebrow `6-Book ChE Solver · 55+ Charts · 24 Plant Problems`, `🔧 Charts & Nomographs · 5 Labs ▾`, and friendly Co-Pilot greeting `Ready on Calibrated Nomographs & Charts (WB1)`. |
| Brand recall | 3 / 3 | **3 / 3** | Institutional Ivory (`#fbf6ec`), Sovereign Deep Navy (`#071a33`), Maize Gold (`#e8c547`), `Cormorant Garamond` + `Karla` + `JetBrains Mono`, and `public/og-card.png`. |
| Content punch | 2 / 3 | **3 / 3** | Action-oriented problem launchers (`🌱 L1 · 🔧 L2 · 🕵️ L3 · 🚨 L4 · 📚 Browse All 24 Problems`), trap presets, and `🔗 Share / AI` menu. |
| Clarity and hierarchy | 2 / 3 | **3 / 3** | 3-Zone Studio (`1 Bar · 1 Canvas · 1 Agent`) with `· 5 Labs ▾` cue and progressive-disclosure drawers. |
| Storytelling | 2 / 3 | **3 / 3** | `Observe Trap → Scrub Control → Verify Proof`, 3-stage White-Box KaTeX cards, and 1-click Markdown/AI sharing (`<PageAxShareMenu />`). |
| Knowledge and trust | 3 / 3 | **3 / 3** | Exact 6-book citations, explicit `psig` vs. `psia`, and `f_D = 4·f_F` guardrails across UI and `public/llms-full.txt`. |
| Motion | 3 / 3 | **3 / 3** | Framer spring pills (`500/60/1`), `opacity: 1` WAAPI safety, SVG Scrub Guard, and `@media (prefers-reduced-motion: reduce)`. |
| Responsive | 1 / 3 | **3 / 3** | `round-1/768x1024.png`, `round-1/375x812.png`, `round-1/320x812.png`: `0` errors and `0` warnings across all 4 viewports. |
| Accessibility | 2 / 3 | **3 / 3** | `src/styles/workbench-components.css:28`: Explicit `:focus-visible` `2px solid var(--maize)` outlines, `aria-live="polite"` toast in `PageAxShareMenu`, and `0` contrast warnings. |
| Performance feel | 2 / 3 | **3 / 3** | `index.html` includes pre-rendered semantic `<main>` summary inside `<div id="root">` for instant non-JS crawler indexing; 6-chunk Vite build completes in `1.47s`. |

## Proposals (All Implemented)

### P1 — Fix Tablet (`768px–1200px`) Header Horizontal Overflow & Mobile Touch Ergonomics (Must) — DONE
- **Files:** `src/styles/theme-tokens.css`, `src/styles/framer-motion-surfaces.css`
- **Verification:** `render-check.mjs` exits `0` with `0 errors` and `0 warnings` across `320×812`, `375×812`, `768×1024`, and `1440×900`.

### P2 — Add Complete Technical SEO, Open Graph (`1200×630`), JSON-LD & Server-HTML Fallback in `index.html` (Must) — DONE
- **Files:** `index.html`, `public/og-card.png`
- **Verification:** `check-discovery-surfaces.mjs` reports `0` findings on `meta-description`, `canonical`, `open-graph`, `twitter-card`, `json-ld`, `markdown-alternate`, and `server-render`.

### P3 — Serve `robots.txt` (Allow All AI Bots), `sitemap.xml`, `llms.txt`, `llms-full.txt`, and Markdown Twins (`/index.md` & `Accept: text/markdown`) (Must) — DONE
- **Files:** `public/robots.txt`, `public/sitemap.xml`, `public/llms.txt`, `public/llms-full.txt`, `public/index.md`, `public/index.html.md`, `src/server/api-server.ts`, `vite.config.ts`
- **Verification:** `check-discovery-surfaces.mjs http://127.0.0.1:5173 --site-origin https://chemeng.ai4u.now` exits `0` with `0 errors, 0 warnings`.

### P4 — Strengthen 5-Second First Impression & Replace Raw Internal IDs in Co-Pilot Greeting (Should) — DONE
- **Files:** `src/components/shell/app-shell.tsx`, `src/components/shell/agent-chat-drawer.tsx`, `src/styles/workbench-components.css`
- **Verification:** Confirmed visually in `round-1/1440x900.png` and `round-1/768x1024.png`.

### P5 — Add Page-Level AX Action Group (`<PageAxShareMenu />`) (Should) — DONE
- **Files:** `src/components/shell/page-ax-share-menu.tsx`, `src/components/shell/app-shell.tsx`, `src/styles/workbench-components.css`
- **Verification:** `🔗 Share / AI ▾` renders in `.shell-header > .wb-actions-row` (`155` LOC), starts clipboard write inside the click gesture (`ClipboardItem` + `writeText` fallback), announces via `aria-live="polite"`, and provides `View as Markdown` + `Open in ChatGPT / Claude / Perplexity`.

### P6 — Add Explicit `:focus-visible` Keyboard Rings & Create Root `DESIGN.md` + `REVIEW.md` + `AGENTS.md` Guidance (Should) — DONE
- **Files:** `src/styles/workbench-components.css`, `DESIGN.md`, `REVIEW.md`, `AGENTS.md`
- **Verification:** `:focus-visible` rule present in `src/styles/workbench-components.css:28`; `DESIGN.md`, `REVIEW.md`, and updated `AGENTS.md` written at repository root.

### P7 — Add `5 Labs` Subject Switcher Cue (Could) — DONE
- **Files:** `src/components/shell/app-shell.tsx`
- **Verification:** `toggle-lab-switcher-btn` displays `🔧 Charts & Nomographs · 5 Labs ▾` while preserving all existing test IDs (`61/61` Vitest tests pass).

## DONE contract

- [x] **1. Every Must and Should proposal meets its acceptance checks:** `P1`–`P7` implemented and verified.
- [x] **2. `check-discovery-surfaces.mjs` exits 0:** Exited `0` (`0 errors, 0 warnings, 1 info`) against `http://127.0.0.1:5173 --site-origin https://chemeng.ai4u.now`.
- [x] **3. Screenshots at `1440×900`, `768×1024`, and `375×812` (plus `320×812`):** Saved in `round-1/`; `render-check.mjs` exited `0` with `0 errors, 0 warnings`, confirmed via native vision review.
- [x] **4. No rubric area regressed; all areas score `≥ 2 / 3`:** All 10 rubric areas now score `3 / 3`.
- [x] **5. Keyboard and reduced-motion checks pass:** `:focus-visible` `2px solid var(--maize)` outlines and `@media (prefers-reduced-motion: reduce)` verified.
- [x] **6. Build, typecheck, tests & `< 200` LOC invariant pass:** `npm run typecheck` (`0` errors), `npm test` (`13/13` suites, `61/61` tests passed), `npm run build` (`1.47s`), and all touched source files strictly `< 200` LOC (`theme-tokens.css` `148` LOC, `workbench-components.css` `148` LOC, `framer-motion-surfaces.css` `166` LOC, `app-shell.tsx` `184` LOC, `agent-chat-drawer.tsx` `189` LOC, `page-ax-share-menu.tsx` `155` LOC, `api-server.ts` `167` LOC).
- [x] **7. `DESIGN.md`, `REVIEW.md`, and `AGENTS.md` updated:** Created `DESIGN.md` and `REVIEW.md`, and updated `AGENTS.md` with Invariant #7.
- [x] **8. Dev servers stopped:** Temporary Vite dev server stopped via `TaskStop`.

## Round log

| Round | Proposals done | Checks passing | Regressions fixed | Notes |
|---|---|---|---|---|
| `round-0` | Baseline audit | `61/61` Vitest | — | Found `768×1024` `+37px` header overflow (`1` error) and `4` errors / `10` warnings in `check-discovery-surfaces.mjs`. |
| `round-1` | `P1`, `P2`, `P3`, `P4`, `P5`, `P6`, `P7` | `check-discovery-surfaces` (`0` errors, `0` warnings), `render-check` (`0` errors, `0` warnings across 4 viewports), `tsc`, `61/61` Vitest, `vite build` | Refined `@media (max-width: 1200px)` header stack & `.studio-drawer-collapsed` clipping so `768×1024` and `375×812` have `0` errors and `0` warnings. | All 8 DONE contract items verified. |

## Unresolved questions
None — both owner decisions (allow all AI crawlers in `robots.txt` and proceed with full implementation) have been resolved and verified.
