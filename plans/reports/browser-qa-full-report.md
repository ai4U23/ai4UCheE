# Full-Site `/ak-web-testing` & `/browser` Verification Report (`ai4UCheE`)

**Date:** 2026-11-01
**Target:** `ai4UCheE` — ChemEng's Intelligent Workbench (`/`, `/showcase.html`, `/app`)
**Skills & Subagents:** `ak-web-testing`, `agent-browser` (`v0.29.1`), and two parallel `browser` subagents (`87226910-dda8-4812-bab2-a941c1125f90` & `a23fd267-5fe6-4f05-9eaa-9be5be13bc04`)

---

## 1. Executive Summary & Test Matrix

| Gate / Layer | Tool / Runner | Result | Details |
|---|---|---|---|
| **TypeScript Typecheck** | `npm run typecheck` (`tsc --noEmit`) | **PASS (`0 errors`)** | Fixed stale `p.targetWorkbench` -> `p.workbenchId` property lookup in `src/components/shell/problem-library-browser.tsx:147`. |
| **Frontend Unit & E2E (Vitest)** | `npx vitest run` | **PASS (`15/15 files, 68/68 tests`)** | Covers Phases 3, 7–19 (Shell, 6 Workbenches, 28 SVG diagrams, 24 Problems, Remotion Guide, EN/VI Locale). |
| **Python Sidecar (`perry-engine`)** | `pytest -q` | **PASS (`46/46 tests`)** | DIPPR 101/106, Hydraulics, McCabe-Thiele/FUG/Fair, Kinetics, 3-stage KaTeX, and PyMuPDF crop/index. |
| **Production Build** | `npm run build` (`vite build`) | **PASS (`2.14s`)** | 6 code-split vendor/solver chunks (`vendor-react`, `vendor-katex`, `vendor-motion-ui`, `perry-atlas-solvers`, `che-interactive-sketches`). |
| **4-Viewport Visual Gate (`/app` & `/`)** | `render-check.mjs` (`320×812`, `375×812`, `768×1024`, `1440×900`) | **PASS (`0 errors`)** | Zero horizontal overflow across all 4 viewports on both `/` (`showcase.html`) and `/app`. |
| **AX / SEO / GEO Discovery Gate** | `check-discovery-surfaces.mjs` | **PASS (`0 errors, 0 warnings`)** | Verified `robots.txt`, `sitemap.xml`, `llms.txt`, `llms-full.txt`, `index.md`, `Accept: text/markdown` negotiation, JSON-LD, and Open Graph. |
| **Core Web Vitals (`/app`)** | `agent-browser vitals` | **PASS** | `TTFB: 1 ms`, `FCP: 868 ms`, `LCP: 1340 ms`, `CLS: 0.03`. |
| **Live Browser E2E (`Parts A–D`)** | `browser` subagents (`1440×900`) | **PASS (`115/115 HTTP 200/304, 0 console errors`)** | Every page, persona, locale, modal, problem workflow, 6 workbenches, 28 SVG diagrams, and AI Co-Pilot tested live. |

---

## 2. Bug Found & Fixed During Verification

- **`src/components/shell/problem-library-browser.tsx:147` (`TS2339` / `TS7053`)**:
  - **Root Cause:** `CURRICULUM_PROGRESSION_MAP[p.targetWorkbench]` referenced a non-existent property `targetWorkbench` on `ProblemCaseEntry` (whose canonical field in `src/lib/problem-library-types.ts` is `workbenchId`), causing `tsc --noEmit` to fail and leaving the curriculum year badge (`Year 2–4`) blank inside problem cards.
  - **Fix:** Updated line 147 to `CURRICULUM_PROGRESSION_MAP[p.workbenchId]?.yearBadge[isVi ? 'vi' : 'en']`. Verified `tsc --noEmit` exits `0` and curriculum year badges render on all 24 problem cards.

---

## 3. Feature-by-Feature Browser Verification

### Part A: Showcase (`/`) & Global Top Studio Bar (`AppShell` on `/app`)
1. **Showcase Landing Page (`/` & `/showcase.html`)**:
   - Verified hero (`ai4UCheE — ChemEng's Intelligent Workbench`), 5-Step Learning Path, 3-Zone Studio Architecture, 15-Second Video Overview, 5 Subject Labs + 6 Reference Books cards, 24 Plant Problems matrix, 3-Stage White-Box Proofs, and EPC Calc Sheet CTA.
   - Tested `EN` <-> `VI` switcher on Showcase (`"ai4UCheE — Bàn làm việc Kỹ thuật Hóa học Thông minh"`, `"MỞ PHÒNG THÍ NGHIỆM"`) and `Launch Live Workbench (/app)` navigation.
2. **Persona & Locale Switchers (`/app`)**:
   - Toggled `🎓 Learn` (`persona-learn`) <-> `🏭 Plant` (`persona-plant`), confirming `LearnModeCallout` (curriculum badge, prerequisites, 5-step breadcrumb) shows in `Learn` and hides in `Plant`.
   - Toggled `EN` <-> `VI` (`LocaleSwitcherPill`), confirming `<html lang="vi">`, Vietnamese workbench titles, equation headers, and AI Co-Pilot responses.
3. **24-Problem Library (`ProblemLibraryBrowser`) & 6-Stage Troubleshooting (`HypothesisTroubleshootingBoard`)**:
   - Tested `L1 (3)`, `L2 (10)`, `L3 (8)`, `L4 (3)` tier filters, Equipment family filter (8 categories), Failure symptom filter (5 archetypes), Subject filter, and text search (`"Cavitation"` -> Problem `#6`).
   - Launched Problem `#6` (*[L3] Pump P-101 Cavitation & Boiler Feedwater Heater Cold Exit*): completed Stages 1–4, disproved decoys `H1` & `H3`, proved root cause `H2` (`Hypotheses: 3/3`), and executed `Auto-Fix & Ask Copilot` -> `Mission Solved` (`☑ Stages 1–6`, `Safe: NPSHa (21.8 m) ≥ NPSHr (3.0 m)`, Student Mastery `40% -> 42%`).
4. **Modals & Share Menu**:
   - `🎬 Guide` (`ShowcaseVideoModal`): Verified HTML5 video player (`ai4uchee-guide.mp4`, EN/VI `.vtt` tracks) and 4 chapter cards.
   - `📄 Calc Sheet` (`CalcSheetPreviewModal`): Verified EPC metadata, 3-stage KaTeX proofs, `Compile & Save QA/QC Calc Sheet` (`POST /api/v1/export/calc-sheet` `200 OK`), and SQLite persistence (`GET/DELETE /api/saved-calculations` `200 OK`).
   - `🔗 Share / AI` (`PageAxShareMenu`): Verified `Copy Page (Markdown)` (`GET /index.md` `200 OK`), `View as Markdown`, `Copy Canonical URL`, and ChatGPT/Claude/Perplexity deep links.

### Part B: Cross-Subject Utility (`WB1`) & Subject 1 (`WB2`: Thermodynamics & DIPPR)
1. **`WB1` — Charts, Nomographs & Page Verifier (`tab-wb1-visual-verifier`)**:
   - Tested `VisualVerifierTutorCard` on `6-10` (*Moody Fanning Friction Factor*): reading `0.018` vs exact `0.0045` triggered `🔍 4.0× Darcy vs. Fanning Signature Detected (f_D / f_F = 4.000)`.
   - Clicked `Load High-DPI Crop` (`POST /api/v1/pdf/crop` `200 OK`) and verified calibrated 2D SVG crosshair overlay on the real PDF crop.
   - Verified all 10 calibrated multi-book charts (`6-10`, `14-37`, `14-57`, `2-53`, `19-6`, `6-52`, `4-18`, `15-10`, `14-15`, `23-42`).
2. **`WB2` — Subject 1: Thermodynamics, Phase Equilibria & DIPPR (`tab-wb2-thermo-dippr`)**:
   - Tested all 5 DIPPR fluids (`Water`, `Benzene`, `Toluene`, `Acetone`, `Ethanol`) and `psig` <-> `psia` datum guardrail (`Benzene @ 373.15 K`: `179,894 Pa = 11.40 psig (26.09 psia)`, $\Delta H_{\text{vap}} = 30.15\text{ MJ/kmol}$).
   - Verified 3-stage KaTeX proofs (`DIPPR Eq. 101` & `Eq. 106`) and `CarlsonAdvisorCard` (`NRTL or UNIQUAC` recommendation + `LLE Trap: Never use Wilson for Liquid-Liquid Equilibrium`).
   - Tested all 4 diagram modes: **DIPPR Phase Envelope**, **Binary Non-Ideal VLE ($T$-$x$-$y$ / $y$-$x$ Azeotrope Explorer)**, **Peng-Robinson Cubic EOS ($Z(P_r, T_r)$ & $P$-$V$ Dome)**, and **Rankine $T$-$S$ Cycle + Van 't Hoff $X_{\text{eq}}(T)$**.

### Part C: Subject 2 (`WB3`: Fluid & Transport) & Subject 3 (`WB4`: Separations)
1. **`WB3` — Subject 2: Fluid Mechanics, Transport & Piping Hydraulics (`tab-wb3-hydraulics`)**:
   - Verified `f_D = 4·f_F` guardrail (`f_F = 0.00466`, `f_D = 0.01865`), 3-Case Flow Table (`70% / 100% / 120%`), and cavitation trap (`-12 psig` -> `Cavitating: NPSHa (2.8 m) < NPSHr (3.0 m)`).
   - Tested all 5 diagram suites: **Piping P&ID + Pump/System Curve**, **BSL Non-Newtonian Pipe Velocity Profile & Boundary Layer**, **ISA-75.01 Control Valve Choked Flow**, **Shell-and-Tube HX $T$-$Q$ Temperature Cross (Bowman $F_T$) & Nukiyama Boiling Curve**, and **Crowl & Louvar Ternary Flammability Triangle (LOC) & Pasquill-Gifford Plume Dispersion**.
2. **`WB4` — Subject 3: Separation Processes, McCabe-Thiele & Column Hydraulics (`tab-wb4-distillation`)**:
   - Verified interactive 5-handle McCabe-Thiele staircase (`N = 14 stages -> 6 stages` upon mutating $\alpha, z_F, x_D, q, R/R_{\min}$), Fenske-Underwood-Gilliland proofs, and Fair Souders-Brown flooding (`64.3% -> 26.8% of Fair flood`).
   - Tested all 4 diagram suites: **McCabe-Thiele + Fair Flooding Sketch**, **Kremser Absorption $N_{OG}(A)$**, **Ternary LLE Equilateral Triangle & Adsorption Breakthrough**, and **Psychrometric Humidification Chart & Membrane Gas Permeation Stage Cut $\theta$**.

### Part D: Subject 4 (`WB6`: Kinetics), Subject 5 (`WB5`: 6-Book Atlas) & Sticky AI Co-Pilot
1. **`WB6` — Subject 4: Kinetics, Catalysis & Chemical Reactor Design (`tab-wb6-kinetics-reactors`)**:
   - Verified Levenspiel $-1/r_A$ vs $X$ plot (`Da_CSTR = 1.77` vs `Da_PFR = 0.67`, `V_CSTR/V_PFR = 2.65×`), Ergun pressure drop (`P/P₀ = 0.872`), Thiele effectiveness (`η = 89.0%`), and Semenov criticality (`ψ = 0.280`).
   - Tested all 5 diagram suites: **Levenspiel + PBR Ergun/Thiele**, **Semenov Thermal Runaway S-Curve**, **Multiple Reactions Series/Parallel Selectivity & Non-Ideal RTD $E(\Theta; N)$**, **LHHW Catalytic Rate Roof & Monod Chemostat Washout Cliff**, and **Butler-Volmer / Koutecký-Levich Polarization Curve $i(\eta)$**.
2. **`WB5` — Subject 5: 6-Book Corpus & 25-Section Atlas (`tab-wb5-handbook-atlas`)**:
   - Tested Domain Clusters (`A`–`E`), interactive section solvers (`Sec 1`, `Sec 6`, `Sec 10`, `Sec 14`, `Sec 19`, `Sec 23` API 520 Relief Valve Sizing, `Sec 25`), 6-Book Corpus filter, Back-of-Book Index search (`pp. 2244–2274`), and live PDF page crop (`Sec-Page 23-30` -> `Verified PDF p. 2085`).
3. **Sticky AI Co-Pilot (`AgentChatDrawer`)**:
   - Verified `<current-screen>` sync pill, Student Switcher (`Alex` <-> `Maya`), `AdaptiveRecommendationRail`, Socratic Hint button, Point-and-Ask (`+ Ask`) chip (`Normal Flow Q (gpm)`), 1-Tap What-If action (`Fix Cavitation`), and natural-language What-If composer (`"Set flowrate to 180 gpm"` -> `POST /api/copilot` `200 OK` -> bi-directionally mutated `WB3` flowrate dial to `180 gpm` and rendered inline GenUI proof card).

---

## 4. Visual Evidence Index (`plans/reports/browser-qa/`)
- `01-showcase-vi.png` — Showcase landing page in Vietnamese (`VI`)
- `02-showcase-en.png` — Showcase landing page in English (`EN`)
- `03-app-initial-learn-en.png` — `/app` Top Studio Bar & `Learn` persona (`LearnModeCallout` visible)
- `04-app-persona-plant.png` — `/app` `Plant` persona (`LearnModeCallout` hidden)
- `05-app-locale-vi.png` — `/app` in Vietnamese (`<html lang="vi">`)
- `06-problem-library-browser.png` — 24-Problem Library Browser & filters
- `07-problem-6-launched.png` — Problem #6 active with 6-Stage Troubleshooting Board
- `08-problem-6-solved-end-to-end.png` — Problem #6 `Mission Solved` (`Stages 1–6` checked)
- `09-showcase-video-modal.png` — `ShowcaseVideoModal` (`🎬 Guide`)
- `10-calc-sheet-compiled.png` — `CalcSheetPreviewModal` (`📄 Calc Sheet`) compiled preview
- `11-share-ai-menu.png` — `PageAxShareMenu` (`🔗 Share / AI`)
- `12-wb1-chart-6-10-high-dpi-crop.png` — `WB1` Fig. 6-9 with 4× trap detection & High-DPI PDF crop
- `13-wb1-all-10-charts-23-42.png` — `WB1` all 10 calibrated multi-book charts (`23-42` Semenov)
- `14-wb2-benzene-psig-all-diagrams.png` — `WB2` Benzene (`psig` datum), DIPPR proofs & Carlson Advisor
- `15-wb2-ethanol-full-canvas.png` — `WB2` full canvas with Binary VLE, Peng-Robinson & Rankine $T$-$S$
- `16-wb3-hydraulics-default.png` — `WB3` Piping & Pump Hydraulics baseline
- `17-wb3-math-proofs.png` — `WB3` 3-stage KaTeX proofs drawer
- `18-wb3-cavitation-trap.png` — `WB3` Cavitation Trap (`NPSHa = 2.8 m < NPSHr = 3.0 m` at `-12 psig`)
- `19-wb3-extended-diagrams.png` — `WB3` BSL Velocity, ISA-75.01 Choked Valve, HX $T$-$Q$ Cross & Safety Plume
- `20-wb4-distillation-default.png` — `WB4` McCabe-Thiele & Fair Column Flooding baseline
- `21-wb4-extended-diagrams.png` — `WB4` Kremser, Ternary LLE/Adsorption & Psychrometric/Membrane
- `22-wb6-kinetics-default.png` — `WB6` Levenspiel CSTR/PFR, Ergun & Thiele baseline
- `23-wb6-extended-diagrams.png` — `WB6` Semenov S-Curve, Selectivity/RTD, LHHW/Monod & Butler-Volmer
- `24-wb5-atlas-sec1.png` — `WB5` 6-Book Corpus & 25-Section Atlas (`Sec 1` solver)
- `25-wb5-sec23-pdf-crop.png` — `WB5` `Sec 23` API 520 solver + Index search + PDF p. 2085 crop
- `26-copilot-whatif-mutation.png` — Sticky AI Co-Pilot Point-and-Ask chip + `"Set flowrate to 180 gpm"` mutation

## Unresolved Questions
- None.
