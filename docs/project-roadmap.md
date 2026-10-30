# Project Roadmap — ai4UCheE

## 7-Phase Execution Plan (V1 Completed)

All 7 phases of [`plans/261027-2242-perrys-intelligent-workbench/plan.md`](file:///Users/nad/ai4u/ai4UCheE/plans/261027-2242-perrys-intelligent-workbench/plan.md) are implemented, verified, and committed on branch `feat/perrys-agent-workbench-v1`:

- [x] **Phase 1: Workspace Foundation & Sidecar Bootstrap** (`813d773`)
  - Repo-root React 19 + Vite 6 + Vitest 3 + Drizzle/SQLite scaffolding
  - Python 3.12 FastAPI sidecar with `pint` (`psig`/`psia` datum guardrail) and 3-Stage White-Box `handcalcs` AST-to-KaTeX renderer
  - 11/11 `test_phase1_core.py` tests passing

- [x] **Phase 2: 25-Section Indexer, Visual Crop & Chart Verifier (WB1)** (`b0402c6`)
  - TOC-ordered 25-Section + Index (`pp. 2244–2274`) `Sec-Page` resolver and `verify_page_contains` citation primitive
  - Display-space rotation-safe (`page.rotation`) composite table header + row cropper & vector figure detector
  - Interactive SVG crosshair and `DeepTutor` chart-reading verifier with `fanning_darcy_4x_detected` coaching (12/12 `test_phase2_pdf.py` tests passing)

- [x] **Phase 3: Agent-Native Core Shell & Design System** (`90e064e`)
  - React 19 + `motion/react` `AppShell` with `layoutId` shared-layout morphing
  - Dual Theme (`☀️ EPC Paper #FAF8F5` vs. `🌙 Control Room Blueprint #0B101B`)
  - `<current-screen>` bi-directional state sync and `useAgentSelectable` Point-and-Ask chips (4/4 `phase3-shell.test.tsx` tests passing)

- [x] **Phase 4: DIPPR Property Engine & Carlson Advisor (WB2)** (`743c172`)
  - 5-parameter DIPPR Eq. 101 (`Table 2-8, p. 2-53`), Eq. 106 with $T_r^{C_5}$ (`Table 2-69, p. 2-120`), and Eq. 105 (`Table 2-32, p. 2-93`) with validity bounds and `CoolProp` reference fallback
  - Carlson's (1996) / Perry's Sec 4 (`pp. 4-4, 4-12, 4-18`) property method decision tree with LLE `Wilson` trap and carboxylic acid `NRTL-HOC` warnings (6/6 `test_phase4_thermo.py` tests passing)

- [x] **Phase 5: Hydraulics, Pump NPSHa & Valve Cv (WB3)** (`8ac5c9e`)
  - `ASME B36.10M` commercial pipe sizing (`Table 10-22, p. 10-70`), explicit Darcy $f_D = 4 f_F$ guardrail (`Fig. 6-9, p. 6-10` & `Eqs. 6-37..6-39, p. 6-11`), and 3-Case (`70%/100%/120%`) matrix
  - Pump $\text{NPSH}_A$ cavitation checker (`p. 10-24`, `1.35×` rule) and ISA-75.01 control valve $C_v$ with explicit $F_F$ and choked-flow $\Delta P_{\max}$ (`Eqs. 8-77..8-81, p. 8-71`) + parametric SVG sketch (5/5 `test_phase5_hydraulics.py` tests passing)

- [x] **Phase 6: Distillation & Column Hydraulics (WB4)** (`c6c9820`)
  - Bi-directional McCabe-Thiele SVG canvas with draggable $q$-line handle and Fenske-Underwood-Gilliland shortcut (`Sec. 13, pp. 13-14, 13-25, 13-36`)
  - Fair's entrainment flooding $C_{sb}$ (`Fig. 14-32, p. 14-37`) and Eckert GPDC packed-column pressure drop (`Fig. 14-55, p. 14-57` & `Table 14-13, p. 14-58`) (4/4 `test_phase6_distillation.py` tests passing)

- [x] **Phase 7: Senior Calculation Sheet Exporter & E2E Verification**
  - Printable EPC QA/QC Calculation Sheet compiler (`@media print` HTML + Markdown/LaTeX) (`2/2 test_phase7_export.py` tests passing)
  - Inline generative UI cards (`RenderInlineExtension`) and SQLite `saved_calculations` persistence (4/4 `phase7-e2e.test.tsx` tests passing)
  - Strict `< 200` LOC modularity gate verified across all 38 `.py`, `.ts`, and `.tsx` source files (`ALL_PHASES_AND_LINE_LIMITS_OK`)

## Student-Intuitive UX Overhaul & `gemini-4-argon-low` AI Co-Pilot (Completed 2026-10-29)

All 5 phases of [`plans/261028-1420-chemie-ux-and-gemini-copilot/plan.md`](file:///Users/nad/ai4u/ai4UCheE/plans/261028-1420-chemie-ux-and-gemini-copilot/plan.md) are implemented, verified, and docs-synced:

- [x] **Phase 01: Sovereign CSS Split & Real KaTeX Math** — two-file CSS architecture (`theme-tokens.css` + `workbench-components.css`, cascade-pinned `.shell-workspace` after `.wb-split`), `<KaTeXBlock />` across WB2–WB4 and GenUI proof cards, `.modal-backdrop` overlay
- [x] **Phase 02: Guided Student Missions & Learn UX** — `<GuidedMissionBar />` (4 one-click missions + instant proof cards), approachable tab titles, `<LearnModeCallout />` across WB1–WB4
- [x] **Phase 03: Two-Tier AI Co-Pilot (`gateway.ai4u.now`)** — `POST /api/copilot` (`model: gemini-4-argon-low`, 4.5 s timeout) with the deterministic Tier-1 ChE Tutor fallback (`copilot-responder.ts`), `.env.example` contract, vite `/api` dev proxy
- [x] **Phase 04: Point-and-Ask Drawer & Inline GenUI** — human-readable `chip.label` badges, 1-click starter prompts (`copilot-prompts.ts`), KaTeX `equation-proof-card` GenUI stream
- [x] **Phase 05: E2E Verification & Docs Sync** — `phase8-ux-copilot.test.tsx` (4 tests; 13 total passing), repository-wide `< 200` LOC gate over `src/` + `services/perry-engine` (`ALL_SRC_UNDER_200_OK`, `.venv` excluded), clean `npm run build`, and this `./docs/` sync

## Interactive UX, Self-Guided Missions & Bi-Directional Copilot (Completed 2026-10-30)

All 5 phases of [`plans/261029-2335-chemie-interactive-ux-and-live-copilot/plan.md`](file:///Users/nad/ai4u/ai4UCheE/plans/261029-2335-chemie-interactive-ux-and-live-copilot/plan.md) are implemented, verified, and docs-synced (validated via `ak:plan --advice validate`, 2026-10-30):

- [x] **Phase 01: Bi-Directional `<current-screen>` State Bus & 3-Stage White-Box KaTeX** — `syncWorkbenchPayload`/`dispatchWorkbenchMutation` pub/sub in `view-screen.ts`, structured `<payload live="true">` XML, `<WhiteBoxEquationCard />` (Symbolic → Live Substitution → Evaluated Result + citation badge)
- [x] **Phase 02: Interactive SVG Workbenches, Solver Math Extraction & Self-Guided Rescue Missions** — pure `hydraulics/thermo/distillation-solver-math.ts` extractions (shipped formulas preserved; WB2 upgraded to true DIPPR Eq. 101/106 A–E from the PDF-verified sidecar coefficients), interactive `<DipprPhaseEnvelopeSvg />`, all WB1–WB4 wired to the payload/mutation bus, mission ids preserved with solver-verified trap/rescue values + `<MissionChecklistBanner />`
- [x] **Phase 03: Bi-Directional `gemini-4-argon-low` Copilot & Natural-Language Slider Control** — additive two-tier upgrade (`payload` in `CopilotRequestSchema`, `actionMutations?` in `CopilotResponse`), deterministic `copilot-scenario-parser.ts` What-If engine, Tier-2 payload grounding + defensive LLM mutation extraction, drawer mutation pills + 1-tap quick actions
- [x] **Phase 04: Live Multi-Workbench QA/QC Calculation Sheet Builder & Exporter** — `calc-sheet-builder.ts` compiling live inputs/3-stage equations/safety audits into the existing `generateCalcSheetAction` flow, live rows + safety badge + Copy-Markdown in the modal
- [x] **Phase 05: Phase 9 E2E Verification, Visual Audit, LOC Gate & Docs Sync** — `phase9-interactive-intelligence.test.tsx` (6 tests; **19 total across 4 suites**), `render-check.mjs` **0 errors / 0 warnings** across 375×812 / 768×1024 / 1440×900, clean `npm run build`, `< 200` LOC gate clean, and this `./docs/` sync

## All 12 Interactive Charts, Graphs & Diagrams Overhaul (Completed 2026-10-30)

All 5 phases of [`plans/261030-0945-all-12-interactive-charts-and-diagrams/plan.md`](file:///Users/nad/ai4u/ai4UCheE/plans/261030-0945-all-12-interactive-charts-and-diagrams/plan.md) are implemented, verified, and docs-synced:

- [x] **Phase 01: Shared SVG Pointer Math & `WB1` Calibrated Perry Curves + 2D Crosshair (Charts 1–4)** — `svg-drag-math.ts`, `perry-figure-curve-sampler.ts`, interactive pointer scrubbing across `6-10`, `14-37`, `14-57`, `2-53`, and `calibrated-crosshair`
- [x] **Phase 02: `WB2` Dual-Curve DIPPR Phase Envelope & Interactive Carlson Decision Flowchart (Charts 5 & 6)** — dual Eq. 101 $P^{\text{sat}}(T)$ & Eq. 106 $\Delta H_{\text{vap}}(T_r)$ envelope, clickable $1\text{ atm}$ NBP & $T_c$ snap markers, clickable Carlson SVG flowchart nodes (`carlson-node-polarity`, `carlson-node-lle`, `carlson-node-assoc`) & scrubbable boiling curve
- [x] **Phase 03: `WB3` Interactive PFD Schematic & Extracted Pump/System/$\text{NPSH}_A$ Curve Chart (Charts 7 & 8)** — `hydraulics-curve-svg-math.ts`, `pump-system-curve-svg.tsx`, draggable `V-101` liquid level, clickable `L-101` NPS cycler, draggable `FCV-101` actuator, and draggable `100%` duty-point handle on `wb3-pump-system-curve-svg`
- [x] **Phase 04: `WB4` 5-Handle McCabe-Thiele Canvas, Interactive Column `T-201` & Fair Flooding Curve (Charts 9–11)** — `mccabe-thiele-svg-handles.ts`, `mccabe-thiele-handles-overlay.tsx` (`q-line-handle`, `mt-xd-handle`, `mt-zf-handle`, `mt-xb-handle`, `mt-rol-handle`), `column-flooding-inverse-math.ts`, draggable `T-201` column shell wall, clickable trays `1..5`, Fair $C_{sb}(F_{LV})$ curve, and inverse-solving `% Flood` bar handle
- [x] **Phase 05: Copilot Inline GenUI Sparkline Scrubber (Chart 12), Full 12-Chart Test Suite, Visual Audit & Docs Sync** — `genui-interactive-sparkline` in `render-inline-extension.tsx`, `phase10-all12-interactive-charts.test.tsx` (**28/28 tests passing across 5 suites**), `< 200` LOC gate verified across all source files, and `./docs/` synchronized

## Whole 25-Section *Perry's 9th Edition* + Back-of-Book Index (`pp. 2244–2274`) Expansion (Completed 2026-10-30)

All 5 phases of [`plans/261030-1020-whole-perry-25-section-handbook-atlas/plan.md`](file:///Users/nad/ai4u/ai4UCheE/plans/261030-1020-whole-perry-25-section-handbook-atlas/plan.md) are implemented, verified, and docs-synced:

- [x] **Phase 01: Foundation — `WB5` 25-Section Perry Atlas Shell, PDF Index (`pp. 2244–2274`) Explorer, Bi-Directional SVG Curve Engine & Cluster A (`Sec 1–5`) Solvers** — `perry-section-types.ts`, `sec-01-05-solvers.ts`, `perry-section-interactive-svg.tsx`, `perry-atlas-pdf-explorer.tsx`, `handbook-atlas-workbench.tsx`, and `GET /api/v1/pdf/sections`
- [x] **Phase 02: Cluster B (`Sec 6–10`) Solvers** — `sec-06-10-solvers.ts` (`Sec 6` Fluid/Particle Dynamics $f_D=4f_F$, `Sec 7` Arrhenius Kinetics, `Sec 8` Process Control IMC/ZN, `Sec 9` Process Economics Six-Tenths & NPV, `Sec 10` Fluid Transport $\text{NPSH}_A$ `psig -> psia`)
- [x] **Phase 03: Cluster C (`Sec 11–15`) Solvers** — `sec-11-15-solvers.ts` (`Sec 11` Shell-and-Tube LMTD Bowman $F_T < 0.75$ cross trap, `Sec 12` Psychrometry & Solids Drying, `Sec 13` Fenske-Underwood-Gilliland Distillation, `Sec 14` Fair Flooding & Kremser $N_{OG}$, `Sec 15` Kremser Liquid-Liquid Extraction)
- [x] **Phase 04: Cluster D (`Sec 16–20`) Solvers** — `sec-16-20-solvers.ts` (`Sec 16` Langmuir Adsorption & Collins LUB, `Sec 17` Gas-Solid Ergun/Fluidization $u_{mf}$ & Cyclone $d_{pc}$, `Sec 18` Ruth Cake Filtration, `Sec 19` Levenspiel CSTR/PFR & Semenov Runaway $\psi > 1/e$, `Sec 20` Monod Chemostat Washout & OTR)
- [x] **Phase 05: Cluster E (`Sec 21–25`), 25-Section Master Registry, Copilot What-If Router, Guided Trap Presets, QA/QC Calc Sheet & Full 25-Section E2E Suite** — `sec-21-25-solvers.ts`, `perry-atlas-registry.ts`, `perry-atlas-copilot-router.ts`, `phase11-whole-perry-handbook.test.tsx` (**32/32 Vitest tests across 6 suites + 43/43 Pytest tests**), `< 200` LOC gate verified across all source files, and `./docs/` synchronized

## Subject-First 6-Textbook Corpus Blending & `WB6` Kinetics/Reactor Design (Completed 2026-10-30)

- [x] **6-Book Reference Corpus Indexing & Gitignore Protection** — `.gitignore` updated (`*.pdf`, `*.epub`, `*.mobi`, `*.djvu`); `services/perry-engine/pdf/textbook_corpus.py` indexes *Perry's 9th Ed.* (PDF), *Fogler 7th Ed.* (EPUB `OEBPS/ch01..ch19.xhtml`), *Bird-Stewart-Lightfoot 2nd Ed.* (PDF), *Smith-Van Ness-Abbott 9th Ed.* (PDF), *Seader-Henley-Roper 4th Ed.* (PDF), and *Crowl & Louvar 4th Ed.* (PDF)
- [x] **5 Pure ChE Subject Tabs & Cross-Subject Charts Verifier Tool** — Top navigation bar (`src/components/shell/app-shell.tsx`) contains only the 5 pure Chemical Engineering subjects (`Thermodynamics & Phase`, `Fluid & Transport Hydraulics`, `Separations & Distillation`, `Kinetics & Reactor Design`, `6-Book & 25-Sec ChE Atlas`), while `📐 Charts & Page Verifier` (`wb1-visual-verifier`) sits in the header utility group as a cross-subject tool that auto-syncs the chart relevant to the active subject (`2-53` for Thermo, `6-10` for Hydraulics, `14-37` for Separations, `19-6` for Kinetics/Reactors) and toggles back to the subject on second click
- [x] **`WB6` (Subject 4) Kinetics, Catalysis & Chemical Reactor Design Workbench** — `kinetics-solver-math.ts`, `levenspiel-reactor-svg-canvas.tsx`, `kinetics-reactor-workbench.tsx`, and `/api/v1/kinetics/solve` blending Fogler Ch. 2/5/12/15, BSL Ch. 6/18, Crowl & Louvar Ch. 8, and Perry's Sec 7/19 with interactive Levenspiel CSTR/PFR sizing, Ergun PBR pressure drop ($y = P/P_0$), Thiele effectiveness $\eta(\phi)$, Semenov runaway ($\psi \le 1/e$), Mission 5 (`mission-kinetics-runaway`), Copilot What-If parsing, and QA/QC Calc Sheet export (**36/36 Vitest tests across 7 suites + 46/46 Pytest tests**)

## Multi-Book Interactive Charts & 10-Nomograph Expansion (Phase 13, Completed 2026-10-30)

- [x] **Cross-Subject Utility (`WB1` — `📐 Charts & Page Verifier`) Expanded to 10 Multi-Book Nomographs** — `perry-figure-chart-meta.ts` and `perry-figure-curve-sampler.ts` cover `6-10` Moody $f_F(\text{Re})$, `14-37` Fair $C_{sb}(F_{LV})$, `14-57` Eckert GPDC, `2-53` DIPPR $P_{\text{vp}}(T)$, `19-6` Levenspiel $V_{\text{CSTR}}/V_{\text{PFR}}(X)$, `6-52` Sphere Drag $C_D(\text{Re}_p)$, `4-18` Lee-Kesler $Z^0(P_r, T_r)$, `15-10` Thiele $\eta(\phi_1)$, `14-15` Kremser $N_{OG}(A)$, and `23-42` Semenov $\psi(T_c)$
- [x] **Subject 1 (`WB2`) Companion Diagrams** — Binary Non-Ideal VLE $T\text{-}x\text{-}y$ / $y\text{-}x$ Phase Lens & Azeotrope Explorer (`binary-vle-txy-svg.tsx`) and Peng-Robinson Cubic EOS $Z(P_r, T_r)$ & $P_r\text{-}V_r$ Dome (`peng-robinson-eos-svg.tsx`)
- [x] **Subject 2 (`WB3`) Companion Diagrams** — BSL Non-Newtonian Pipe Velocity Profile $v_z(r)/v_{\max}$ + Boundary Layer $\delta_v, \delta_T, \delta_c$ (`bsl-pipe-velocity-boundary-svg.tsx`) and ISA-75.01 Control Valve Choked Flow $Q(\sqrt{\Delta P})$ Curve (`isa-control-valve-choked-svg.tsx`)
- [x] **Subject 3 (`WB4`) Companion Diagrams** — Kremser Absorption Operating/Equilibrium & $N_{OG}(A)$ Chart (`kremser-absorption-svg.tsx`) and Ternary LLE Equilateral Triangle + Adsorption Breakthrough $C/C_0(t/\tau)$ (`ternary-lle-breakthrough-svg.tsx`)
- [x] **Subject 4 (`WB6`) Companion Diagrams** — Semenov $G(T)$ vs. $R(T)$ Thermal Runaway S-Curve (`semenov-thermal-runaway-svg.tsx`), Series Selectivity $C_A, C_B, C_C(\tau)$ & RTD Tanks-in-Series $E(\Theta; N)$ (`series-selectivity-rtd-svg.tsx`), and Electrochemical Butler-Volmer / Koutecký-Levich Polarization Curve $i(\eta)$ (`butler-volmer-polarization-svg.tsx`) (**41/41 Vitest tests across 8 suites + 46/46 Pytest tests**, all source files `< 200` LOC)

## Diagram Mode Switcher & 8 Advanced ChE Interactive Diagrams (Phase 14, Completed 2026-10-30)

- [x] **Quality + Switching via `<DiagramModeBar />` (`wb2-diagram-mode-bar`, `wb3-diagram-mode-bar`, `wb4-diagram-mode-bar`, `wb6-diagram-mode-bar`)** — Defaults to `'all'` so all existing E2E tests mount and query every chart simultaneously, while clicking any mode pill filters to a focused diagram pair
- [x] **Subject 1 (`WB2`) Rankine / Vapor-Compression $T\text{-}S$ Cycle Dome & Van 't Hoff Reaction Equilibrium $X_{\text{eq}}(T)$** — `thermo-cycles-rxn-eq-math.ts`, `rankine-rxn-equilibrium-svg.tsx`, and `thermo-diagram-gallery.tsx`
- [x] **Subject 2 (`WB3`) Shell-and-Tube HX $T\text{-}Q$ Cross (Bowman $F_T$) + Nukiyama Boiling & Crowl-Louvar Flammability LOC + Plume Dispersion** — `hydraulics-heat-safety-math.ts`, `heat-exchanger-boiling-svg.tsx`, `process-safety-flammability-plume-svg.tsx`, and `hydraulics-diagram-gallery.tsx`
- [x] **Subject 3 (`WB4`) Psychrometric Humidification Chart ($T_{db}, T_{wb}, \phi$) & Membrane Gas Permeation Stage Cut $\theta$** — `separations-psychrometry-membrane-math.ts`, `psychrometric-membrane-svg.tsx`, and `distillation-diagram-gallery.tsx`
- [x] **Subject 4 (`WB6`) LHHW Dual-Site Catalytic Rate Roof & Decay $a(t)$ + Monod Chemostat Bioreactor Washout Cliff $D_{\text{wash}}$** — `kinetics-lhhw-bioreactor-math.ts`, `lhhw-bioreactor-svg.tsx`, `kinetics-diagram-gallery.tsx`, and `phase14-diagram-switcher-and-advanced-charts.test.tsx` (**45/45 Vitest tests across 9 suites + 46/46 Pytest tests**, all source files `< 200` LOC)

## Framer "Luxurious Three" Motion & Surface Choreography (Phase 15, Completed 2026-10-30)

- [x] **Framer MCP (`bPWSkk20pwfxzXmKGtRh`) Motion Tokens, Primitives & Dual-Theme Spotlights** — `src/lib/framer-motion-tokens.ts`, `src/components/ui/framer-motion-primitives.tsx`, and `src/styles/framer-motion-surfaces.css` implementing Framer's `[0.22, 1, 0.36, 1]` `0.65s` entrance cascade, `500/60/1` shared-layout spring (`MotionPillButton`), `0.4s/0.2` bounce spring (`WhiteBoxEquationCard`, `MissionChecklistBanner`, `FramerModalShell`), and `1.4s` mirror `SwarmPulseDot` telemetry beacons
- [x] **Ubiquitous Shared-Layout Pill Morphing & Synchronous Unmount Choreography** — Wired across `App.tsx`, `AppShell`, `AgentChatDrawer`, `DiagramModeBar` (`WB2`, `WB3`, `WB4`, `WB6`), `Thermo/Hydraulics/Distillation/KineticsDiagramGallery`, `VisualVerifierWorkbench` (`WB1` 10-chart presets), `HandbookAtlasWorkbench` (`WB5` clusters & 25 sections), and `CalcSheetPreviewModal`, verified by `phase15-framer-luxurious-motion.test.tsx` (**48/48 Vitest tests across 10 suites + 46/46 Pytest tests**, all source files `< 200` LOC)

## Adaptive Student Scorecard, 3-Tier Socratic Co-Pilot & Personalized Recommendation Engine (Phase 16, Completed 2026-10-30)

- [x] **Instant Browser Scorecard (`localStorage` + Student Name Switcher)** — `src/lib/student-adaptive-model.ts` tracks 6 ChE concept mastery domains, 7 misconception trap counters (`fanning_4x_trap`, `psig_psia_trap`, `wilson_lle_trap`, `npsha_cavitation_trap`, `flooding_trap`, `thiele_diffusion_trap`, `semenov_runaway_trap`), settled-state debounce guard (`settleMs = 600`), DIY slider solve (`+0.35`) vs. Auto-Fix (`+0.12`) mastery weighting, and instant Student Name switching (`Alex`, `Maya`, `+ New Student…`)
- [x] **3-Tier Socratic AI Co-Pilot & Live Anomaly Diagnosis** — `src/actions/copilot-adaptive-tutor.ts`, `src/actions/copilot-responder.ts`, and `src/server/copilot-route.ts` inject `<student-profile>` XML and adapt responses across `guided` (step-by-step), `socratic` (diagnostic clue + question), and `challenge` (EPC sensitivity trade-off) with live screen anomaly detection (`diagnoseLiveScreenAnomalies`)
- [x] **Personalized Recommendation Engine & UI Rail** — `src/lib/adaptive-recommendation-engine.ts`, `src/components/shell/adaptive-recommendation-rail.tsx`, `src/components/shell/guided-mission-bar.tsx`, `src/components/shell/mission-checklist-banner.tsx` (`💡 Socratic Hint` button), and `src/components/shell/copilot-prompts.ts`, verified by `phase15-adaptive-student-copilot.test.tsx` (**52/52 Vitest tests across 11 suites + 46/46 Pytest tests**, all source files `< 200` LOC)
