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
