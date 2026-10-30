# Codebase Summary — ai4UCheE

## Directory Layout

```
ai4UCheE/
├── .gitignore                      # Ignore rules for PDF binaries, SQLite runtime DBs, env secrets, and build caches
├── AGENTS.md                       # Invariants and repository governance rules (<200 LOC per file)
├── README.md                       # Entrypoint documentation
├── package.json                    # React 19 + Vite 6 + Vitest 3 + motion/react + Drizzle/better-sqlite3
├── src/                            # Agent-native React 19 frontend & Express host API
│   ├── App.tsx                     # Root workbench & modal orchestrator
│   ├── main.tsx                    # Browser entrypoint
│   ├── actions/                    # Zod-typed shared actions (define-action, view-screen, search-perry-pdf, query-dippr, run-hydraulics, run-distillation, generate-calc-sheet, copilot-responder)
│   ├── components/
│   │   ├── gen-ui/                 # Inline generative UI card renderer (render-inline-extension.tsx — KaTeX equation-proof / hydraulics-summary / calc-sheet cards)
│   │   ├── shell/                  # AppShell (motion/react layoutId), GuidedMissionBar, AgentChatDrawer & copilot-prompts.ts starter catalog
│   │   ├── sketches/               # Parametric SVG diagrams (piping-pump, pump-system-curve, mccabe-thiele + handles, column-flooding, dippr-phase-envelope, levenspiel-reactor, perry-section-interactive-svg, + Phase 13/14 multi-book companion diagrams)
│   │   ├── ui/                     # ScrubbableNumberInput, KaTeXBlock, WhiteBoxEquationCard, LearnModeCallout, DiagramModeBar
│   │   └── workbenches/            # WB1..WB6 workbenches + diagram-gallery subcomponents + solver-math modules + VisualVerifierTutorCard, CarlsonAdvisorCard, PerryAtlasPdfExplorer, CalcSheetPreviewModal
│   ├── lib/                        # svg-drag-math, textbook-corpus-registry, perry-figure-curve-sampler, hydraulics/mccabe/flooding/thermo/kinetics math, perry-sections/ (25-section solvers & router)
│   ├── context/                    # PersonaThemeProvider (learn/plant + #FBF6EC paper / #071A33 blueprint)
│   ├── db/                         # Drizzle SQLite schema & idempotent client (screen_states, saved_calculations, pdf_anchors)
│   ├── hooks/                      # useAgentSelectable & useWorkbenchMutations
│   ├── server/                     # Express host API, SQLite persistence, sidecar proxy (api-server.ts) & Two-Tier copilot-route.ts (POST /api/copilot)
│   ├── styles/                     # Dual Theme CSS variable tokens — theme-tokens.css + workbench-components.css (no Tailwind, each < 200 LOC)
│   └── __tests__/                  # Vitest suites (phase3, phase7..phase14 — 45 tests across 9 suites)
└── services/
    └── perry-engine/               # Python 3.12 FastAPI + PyMuPDF + EPUB + ChEDL/CoolProp/SciPy/Pint sidecar (:8001)
        ├── main.py                 # FastAPI entrypoint mounting pdf, thermo, hydraulics, distillation, kinetics, export routers
        ├── core/                   # unit_registry.py (psig/psia guardrail) & handcalcs_katex.py (3-stage AST->KaTeX)
        ├── pdf/                    # section_map.py, index_search.py, crop_engine.py, figure_detector.py, textbook_corpus.py (6-book PDF/EPUB indexer)
        ├── solvers/                # dippr_coeffs.py, thermo_dippr.py, carlson_tree.py, hydraulics_pipe.py, hydraulics_pump_valve.py, distillation_mccabe.py, distillation_hydraulics.py, kinetics_reactors.py, calc_sheet_exporter.py
        ├── routers/                # pdf_router.py, thermo_router.py, hydraulics_router.py, distillation_router.py, kinetics_router.py, export_router.py
        └── tests/                  # Pytest suites (test_edge_validation, test_phase1..test_phase8_kinetics_corpus — 46 tests across 8 suites)
```

## Workspaces & Components
- **Frontend Host (`src/`)**: React 19, plain CSS-variable Dual Theme tokens (`#FBF6EC` Ivory Paper vs. `#071A33` Dark Navy Blueprint), `motion/react`, `BuilderIO/agent-native` bi-directional `<current-screen>` sync, `useAgentSelectable`, and inline generative UI.
- **Sidecar (`services/perry-engine`)**: FastAPI service on port 8001 providing verified *Perry's 9th Ed.* `Sec-Page` resolution, high-DPI crops with display-space rotation handling, DIPPR correlations (`Tables 2-8, 2-69, 2-32`), Carlson's advisor, `ASME B36.10M` hydraulics (`Table 10-22`, `Fig. 6-9`), pump $\text{NPSH}_A$ (`p. 10-24`), ISA-75.01 valve $C_v$ (`Eqs. 8-77..8-81, p. 8-71`), McCabe-Thiele + Fair's tray flooding (`Fig. 14-32, p. 14-37`) + Eckert GPDC (`Fig. 14-55, p. 14-57`), and Senior-Engineer QA/QC Calculation Sheet compilation.

## UX & Co-Pilot Module Inventory (2026-10-29)
- `src/actions/copilot-responder.ts` — Tier-1 deterministic ChE Tutor: intent-matched tutoring, Perry's 9th Ed. citations, GenUI proof cards, `askPerryCopilot` browser helper.
- `src/server/copilot-route.ts` — Two-Tier `POST /api/copilot` + `GET /api/copilot/status`: `gateway.ai4u.now` (`gemini-4-argon-low`, 4500 ms timeout) with guaranteed Tier-1 fallback.
- `src/components/shell/copilot-prompts.ts` — 3 contextual 1-click starter prompts per workbench + human chip label formatter.
- `src/components/shell/guided-mission-bar.tsx` — 4 one-click student missions (Learn Mode + workbench + chip + instant proof card) with collapse toggle.
- `src/components/ui/katex-block.tsx` — safe `katex.renderToString` wrapper (`throwOnError: false`).
- `src/components/ui/learn-mode-callout.tsx` — plain-English student intuition banner (`personaMode === 'learn'` only).
- `src/components/workbenches/visual-verifier-tutor-card.tsx` — extracted WB1 DeepTutor chart-reading challenge & Fanning 4× coaching.
- `src/components/workbenches/carlson-advisor-card.tsx` — extracted Carlson (1996) / Perry Sec 4 property-method decision tree.
- `src/styles/workbench-components.css` — tactile component stylesheet (`theme-tokens.css` retains tokens + `@import`).
- `src/__tests__/phase8-ux-copilot.test.tsx` — E2E UX & Co-Pilot suite (KaTeX, missions, chip labels, starter prompts, gateway route).

## Interactive Intelligence Modules (Phase 9, 2026-10-30)
- `src/actions/view-screen.ts` — bi-directional bus: `WorkbenchLivePayload`/`WorkbenchMutationCommand` types, `syncWorkbenchPayload` (per-workbench snapshots), `dispatchWorkbenchMutation`/`subscribeWorkbenchMutation`, structured `<payload live="true">` XML.
- `src/hooks/use-workbench-mutations.ts` — one-line workbench subscription to targeted mutation commands.
- `src/components/ui/white-box-equation-card.tsx` — 3-stage white-box KaTeX card (`eq-stage-symbolic/substituted/result-*`, citation badge, learn-mode note) with legacy-`testId` passthrough.
- `src/components/workbenches/hydraulics-solver-math.ts` — pure WB3 solver (Swamee-Jain `f_D = 4·f_F`, explicit `psig → psia`, NPSH_A, 3-stage builders).
- `src/components/workbenches/thermo-solver-math.ts` — true DIPPR Eq. 101/106 A–E coefficients ported from `services/perry-engine/solvers/dippr_coeffs.py` (Table 2-8, p. 2-53 / Table 2-69, p. 2-120).
- `src/components/workbenches/distillation-solver-math.ts` — pure WB4 solver (Fenske/Underwood, Fair Souders-Brown flooding %, 3-stage builders).
- `src/components/sketches/dippr-phase-envelope-svg.tsx` — interactive log-scaled `P_sat(T)` envelope with 1 atm reference, critical point, live crosshair + phase badge.
- `src/components/shell/mission-scenarios.ts` — the 4 mission ids extended with solver-verified trap/rescue mutations + `checkSolved` payload probes.
- `src/components/shell/mission-checklist-banner.tsx` — live 3-step rescue walkthrough + `mission-autofix-btn`.
- `src/actions/copilot-scenario-parser.ts` — deterministic natural-language What-If parser returning `actionMutations` + live solver-grounded diagnostics.
- `src/components/workbenches/calc-sheet-builder.ts` — live QA/QC sheet compiler feeding the existing `generateCalcSheetAction` flow (`inputs_summary`/`equations`) + Markdown export.
- `src/__tests__/phase9-interactive-intelligence.test.tsx` — 6-test E2E interactive suite (19 total across 4 suites).

## All-12 Interactive Charts & Inverse SVG Math Modules (Phase 10, 2026-10-30)
- `src/lib/svg-drag-math.ts` — shared JSDOM-compatible SVG coordinate projection (`clientPointToViewBox`), linear/log10 inverse mappers, and `safeSetPointerCapture`.
- `src/lib/perry-figure-curve-sampler.ts` — analytical forward/inverse curve evaluators and citation-grounded hover readouts for WB1 Charts 1–4 (`6-10` Moody Fanning $f_F$ & Darcy $f_D=4f_F$, `14-37` Fair $C_{sb}$, `14-57` Eckert GPDC $Y_{\text{flood}}$, `2-53` DIPPR Water $P_{\text{vp}}$).
- `src/lib/hydraulics-curve-svg-math.ts` & `src/components/sketches/pump-system-curve-svg.tsx` — extracted WB3 Chart 8 ($H_{\text{pump}}(Q)$ vs. $H_{\text{sys}}(Q)$ + $\text{NPSH}_A(Q)$ vs. $\text{NPSH}_R$ + `70%/100%/120%` markers + draggable `wb3-duty-point-handle`) and inverse PFD vessel level / pipe NPS / valve $\Delta P$ solvers for Chart 7.
- `src/lib/mccabe-thiele-svg-handles.ts` & `src/components/sketches/mccabe-thiele-handles-overlay.tsx` — 5-handle McCabe-Thiele overlay (`q-line-handle`, `mt-xd-handle`, `mt-zf-handle`, `mt-xb-handle`, `mt-rol-handle`) with non-crossing composition bounds and ROL y-intercept reflux solver (Chart 9).
- `src/lib/column-flooding-inverse-math.ts` — inverse column diameter $D_c$ and reflux solver for `T-201` wall drag, interactive sieve trays `1..5` (Chart 10), and Fair's $C_{sb}(F_{LV})$ curve + draggable `% Flood` window bar (Chart 11).
- `src/components/gen-ui/render-inline-extension.tsx` — embeds Chart 12 (`genui-interactive-sparkline` / `genui-sparkline-handle`) dispatching live `dispatchWorkbenchMutation` updates from inside Copilot cards.
- `src/__tests__/phase10-all12-interactive-charts.test.tsx` — 5-test E2E suite verifying pointer scrubbing, handle dragging, and landmark snapping across all 12 charts (**28 total tests across 5 suites**).

## Whole 25-Section Perry's 9th Ed. Interactive Atlas & Index Modules (Phase 11, 2026-10-30)
- `src/lib/perry-sections/perry-section-types.ts` — shared TypeScript contract (`PerrySectionDescriptor`, `PerrySectionSolverResult`, `buildSvgCurvePoints`, `PERRY_SECTION_VIEW_BOX`).
- `src/lib/perry-sections/sec-01-05-solvers.ts` — Cluster A (`Sec 1` Unit Conversions `psig <-> psia`, `Sec 2` DIPPR Vapor Pressure, `Sec 3` Damped Newton-Raphson, `Sec 4` Peng-Robinson EOS $Z(P_r, T_r)$, `Sec 5` Dittus-Boelter $\text{Nu}$).
- `src/lib/perry-sections/sec-06-10-solvers.ts` — Cluster B (`Sec 6` Fluid/Particle Dynamics $f_D = 4 f_F$, `Sec 7` Arrhenius Kinetics, `Sec 8` IMC/Ziegler-Nichols Process Control, `Sec 9` Six-Tenths & CEPCI Process Economics, `Sec 10` Fluid Transport $\text{NPSH}_A$ with `psig -> psia`).
- `src/lib/perry-sections/sec-11-15-solvers.ts` — Cluster C (`Sec 11` Shell-and-Tube LMTD Bowman $F_T < 0.75$ cross trap, `Sec 12` Psychrometry & Solids Drying, `Sec 13` Fenske-Underwood-Gilliland Distillation, `Sec 14` Fair Flooding & Kremser $N_{OG}$, `Sec 15` Kremser Liquid-Liquid Extraction).
- `src/lib/perry-sections/sec-16-20-solvers.ts` — Cluster D (`Sec 16` Langmuir Adsorption & Collins LUB, `Sec 17` Ergun Packed/Fluidized Bed $u_{mf}$ & Cyclone $d_{pc}$, `Sec 18` Ruth Constant-$\Delta P$ Cake Filtration, `Sec 19` Levenspiel CSTR vs. PFR & Semenov Runaway $\psi > 1/e$, `Sec 20` Monod Chemostat Washout & OTR).
- `src/lib/perry-sections/sec-21-25-solvers.ts` — Cluster E (`Sec 21` Bond Work Index Comminution, `Sec 22` Streeter-Phelps Dissolved Oxygen Sag, `Sec 23` API 520 Relief Valve Sizing with mandatory `psig -> psia`, `Sec 24` Carnot/Rankine Efficiency & Exergy, `Sec 25` Faraday Corrosion Rate `mpy` & Alloy PREN).
- `src/lib/perry-sections/perry-atlas-registry.ts` & `src/lib/perry-sections/perry-atlas-copilot-router.ts` — 25-section master registry (`ALL_25_PERRY_SECTIONS`), QA/QC Calc Sheet builder (`buildAtlasCalcSheetSection`), and 25-section natural-language Copilot What-If router.
- `src/components/sketches/perry-section-interactive-svg.tsx`, `src/components/workbenches/perry-atlas-pdf-explorer.tsx`, & `src/components/workbenches/handbook-atlas-workbench.tsx` — `WB5: 25-Section Perry Atlas` workbench UI, universal bi-directional SVG chart, and Back-of-Book Index (`pp. 2244–2274`) search + PDF cropper.
- `src/__tests__/phase11-whole-perry-handbook.test.tsx` — 4-test E2E suite verifying all 25 section descriptors, ChE invariants, SVG pointer scrubbing, Index `S-P` chip jumping, Copilot What-If routing, and QA/QC Calc Sheets.

## Subject-First 6-Textbook Corpus & WB6 Kinetics/Reactor Design Modules (Phase 12, 2026-10-30)
- `services/perry-engine/pdf/textbook_corpus.py` — 6-textbook corpus catalog (`perry-9e`, `fogler-7e`, `bsl-2e`, `svna-9e`, `seader-4e`, `crowl-4e`), Fogler 7th Ed. EPUB XHTML chapter search (`search_fogler_epub`), and PyMuPDF TOC search (`search_pdf_textbook_toc`).
- `services/perry-engine/solvers/kinetics_reactors.py` & `services/perry-engine/routers/kinetics_router.py` — FastAPI `/api/v1/kinetics/solve`, `/api/v1/textbooks/catalog`, and `/api/v1/textbooks/search` endpoints plus `services/perry-engine/tests/test_phase8_kinetics_corpus.py`.
- `src/lib/textbook-corpus-registry.ts` — Subject-First 6-textbook metadata (`TEXTBOOK_CORPUS_CATALOG`) and per-workbench cross-book blend mapping (`SUBJECT_WORKBENCH_BLENDS`).
- `src/components/shell/app-shell.tsx` — 5 pure Chemical Engineering subject tabs in the main navigation bar (`Thermodynamics & Phase`, `Fluid & Transport Hydraulics`, `Separations & Distillation`, `Kinetics & Reactor Design`, `6-Book & 25-Sec ChE Atlas`) plus the header utility tool button (`📐 Charts & Page Verifier`, `data-testid="tab-wb1-visual-verifier"`) that pre-selects the chart relevant to the active subject and toggles back on second click.
- `src/components/workbenches/kinetics-solver-math.ts`, `src/components/sketches/levenspiel-reactor-svg-canvas.tsx`, & `src/components/workbenches/kinetics-reactor-workbench.tsx` — `Subject 4: Kinetics & Reactor Design` workbench blending Fogler 7th Ed. (Levenspiel CSTR/PFR sizing, Ergun PBR pressure drop $y = P/P_0$, Thiele catalyst effectiveness $\eta(\phi)$) with BSL Transport Ch. 18, Crowl & Louvar Ch. 8 Semenov thermal runaway ($\psi \le 1/e$), and Perry's Sec 7 & 19.
- `src/__tests__/phase12-subject-first-corpus.test.tsx` — 4-test E2E suite verifying 5 pure ChE subject tabs + cross-subject Charts & Page Verifier tool, 6-textbook Subject-First blending, WB6 Levenspiel SVG scrubbing, Mission 5 (`mission-kinetics-runaway`), Copilot What-If mutations, and Senior QA/QC Calc Sheet export.

## Multi-Book Interactive Charts & 10-Nomograph Expansion (Phase 13, 2026-10-30)
- `src/lib/perry-figure-chart-meta.ts` & `src/lib/perry-figure-curve-sampler.ts` — 10 calibrated multi-book nomographs/charts across all 6 books (`6-10`, `14-37`, `14-57`, `2-53`, `19-6`, `6-52` Sphere Drag $C_D(\text{Re}_p)$, `4-18` Lee-Kesler $Z^0(P_r, T_r)$, `15-10` Thiele $\eta(\phi_1)$, `14-15` Kremser $N_{OG}(A)$, `23-42` Semenov $\psi(T_c)$).
- `src/lib/thermo-vle-eos-math.ts`, `src/components/sketches/binary-vle-txy-svg.tsx`, & `src/components/sketches/peng-robinson-eos-svg.tsx` — Subject 1 (`WB2`) Binary Non-Ideal VLE $T\text{-}x\text{-}y$ / $y\text{-}x$ Azeotrope Explorer (*SVNAS Ch. 10 & 12*) and Peng-Robinson Cubic EOS $Z(P_r, T_r)$ & $P_r\text{-}V_r$ Dome (*SVNAS Ch. 3 · Perry's Sec. 4*).
- `src/lib/hydraulics-transport-math.ts`, `src/components/sketches/bsl-pipe-velocity-boundary-svg.tsx`, & `src/components/sketches/isa-control-valve-choked-svg.tsx` — Subject 2 (`WB3`) BSL Power-Law Pipe Velocity Profile $v_z(r)/v_{\max}$ + Boundary Layer $\delta_v, \delta_T, \delta_c$ (*BSL Ch. 2, 8, 10, 18*) and ISA-75.01 Control Valve Choked Flow $Q(\sqrt{\Delta P})$ Curve (*Perry's Sec. 8, p. 8-71 · Crowl Ch. 9*).
- `src/lib/separations-kremser-lle-math.ts`, `src/components/sketches/kremser-absorption-svg.tsx`, & `src/components/sketches/ternary-lle-breakthrough-svg.tsx` — Subject 3 (`WB4`) Kremser Absorption Operating/Equilibrium & $N_{OG}(A)$ Chart (*Seader Ch. 6 · Perry's Fig. 14-15*) and Ternary LLE Equilateral Triangle + Adsorption Breakthrough $C/C_0(t/\tau)$ (*Seader Ch. 8 & 15 · Perry's Sec. 15 & 16*).
- `src/lib/kinetics-safety-electro-math.ts`, `src/components/sketches/semenov-thermal-runaway-svg.tsx`, `src/components/sketches/series-selectivity-rtd-svg.tsx`, & `src/components/sketches/butler-volmer-polarization-svg.tsx` — Subject 4 (`WB6`) Semenov $G(T)$ vs. $R(T)$ Runaway S-Curve (*Fogler Ch. 12 · Crowl Ch. 8*), Series Reaction Selectivity $C_A, C_B, C_C(\tau)$ & RTD Tanks-in-Series $E(\Theta; N)$ (*Fogler Ch. 8 & Ch. 16–18*), and Electrochemical Butler-Volmer / Koutecký-Levich Polarization Curve $i(\eta)$ (*Fogler Ch. 19*).
- `src/__tests__/phase13-multibook-interactive-charts.test.tsx` — 5-test E2E suite verifying all 10 WB1 presets and all 9 new Subject 1–4 interactive SVG diagrams (**41/41 Vitest tests across 8 suites + 46/46 Pytest tests**).

## Diagram Mode Switcher & 8 Advanced ChE Diagrams (Phase 14, 2026-10-30)
- `src/components/ui/diagram-mode-bar.tsx` — shared `<DiagramModeBar />` pill switcher (`wb2-diagram-mode-bar`, `wb3-diagram-mode-bar`, `wb4-diagram-mode-bar`, `wb6-diagram-mode-bar`) defaulting to `'all'` so all charts mount simultaneously for zero regression while allowing 1-click focus on any diagram group.
- `src/lib/thermo-cycles-rxn-eq-math.ts`, `src/components/sketches/rankine-rxn-equilibrium-svg.tsx`, & `src/components/workbenches/thermo-diagram-gallery.tsx` — Subject 1 (`WB2`) Rankine / Vapor-Compression $T\text{-}S$ Cycle Dome + Van 't Hoff Reaction Equilibrium $X_{\text{eq}}(T)$ with Adiabatic Operating Line (*SVNAS Ch. 8, 9, 14 · Fogler Ch. 11 · Perry's Sec. 4 & 24*).
- `src/lib/hydraulics-heat-safety-math.ts`, `src/components/sketches/heat-exchanger-boiling-svg.tsx`, `src/components/sketches/process-safety-flammability-plume-svg.tsx`, & `src/components/workbenches/hydraulics-diagram-gallery.tsx` — Subject 2 (`WB3`) Shell-and-Tube Heat Exchanger $T\text{-}Q$ Temperature Cross (Bowman $F_T < 0.75$ trap) + Nukiyama Pool Boiling Curve $q''(\Delta T_{\text{excess}})$ (*BSL Ch. 10, 12, 14 · Perry's Sec. 5 & 11*) and Crowl & Louvar Ternary Flammability Triangle ($\text{Fuel–O}_2\text{–N}_2$ LOC) + Pasquill-Gifford Plume Dispersion $C(x)$ (*Crowl & Louvar Ch. 5 & 6 · Perry's Sec. 23*).
- `src/lib/separations-psychrometry-membrane-math.ts`, `src/components/sketches/psychrometric-membrane-svg.tsx`, & `src/components/workbenches/distillation-diagram-gallery.tsx` — Subject 3 (`WB4`) Psychrometric Humidification / Cooling-Tower Chart ($T_{db}, T_{wb}, \phi$, adiabatic saturation) + Membrane Gas Permeation Stage Cut $\theta$ vs. Enrichment $y_P(\theta)$ (*Perry's Sec. 12 & 20 · Seader Ch. 14 & 18*).
- `src/lib/kinetics-lhhw-bioreactor-math.ts`, `src/components/sketches/lhhw-bioreactor-svg.tsx`, & `src/components/workbenches/kinetics-diagram-gallery.tsx` — Subject 4 (`WB6`) Langmuir-Hinshelwood (LHHW) Dual-Site Catalytic Rate Roof $-r'_A(P_A)$ & Sintering Decay $a(t)$ + Monod Chemostat Bioreactor Productivity $D\cdot C_X(D)$ with Washout Cliff $D_{\text{wash}}$ (*Fogler 7th Ed. Ch. 9 & 10 · Perry's Sec. 7, 19, 20*).
- `src/__tests__/phase14-diagram-switcher-and-advanced-charts.test.tsx` — 4-test E2E suite verifying all 4 Diagram Mode switchers and dual-panel scrubbing across all 8 new diagrams (**45/45 Vitest tests across 9 suites + 46/46 Pytest tests**).

## Framer "Luxurious Three" Motion & Surface Choreography (Phase 15, 2026-10-30)
- `src/lib/framer-motion-tokens.ts` — exact Framer MCP (`bPWSkk20pwfxzXmKGtRh`) easing curves (`[0.22, 1, 0.36, 1]`, `0.65s`), layout spring (`500/60/1`), bounce spring (`0.4s, bounce 0.2`), `60ms` stagger helper, and `1.4s` mirror Swarm Pulse loop.
- `src/components/ui/framer-motion-primitives.tsx` — enter-only `<FramerEntranceStage />` (zero exit hold for `0ms` synchronous Vitest unmounts), `<SwarmPulseDot />`, `<MotionPillButton />`, and `<FramerModalShell />`.
- `src/styles/framer-motion-surfaces.css` — dual-theme radial spotlights, `.framer-pill-glow`, `.swarm-pulse-dot` beacons, SVG handle drop-shadow halos (preserving the SVG Scrub Guard), and `@media (prefers-reduced-motion: reduce)`.
- `src/__tests__/phase15-framer-luxurious-motion.test.tsx` — 3-test E2E suite verifying Framer token fidelity, Swarm Pulse beacons, synchronous stage unmounts, and ubiquitous `MotionPillButton` / `FramerModalShell` choreography (**48/48 Vitest tests across 10 suites + 46/46 Pytest tests**).

## `<200` LOC Modularity Gate (AGENTS.md Invariant #2)
Every `.ts`, `.tsx`, `.css` file in `src/` and every `.py` file in `services/perry-engine/` (`.venv` excluded) is mechanically verified `< 200` lines (`ALL_SRC_UNDER_200_OK`); the largest file sits at 199 lines.
