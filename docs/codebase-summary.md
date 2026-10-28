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
│   │   ├── sketches/               # Parametric SVG diagrams (piping-pump-svg-sketch, mccabe-thiele-svg-canvas, column-flooding-svg-sketch)
│   │   ├── ui/                     # ScrubbableNumberInput, KaTeXBlock (real katex.renderToString), LearnModeCallout
│   │   └── workbenches/            # WB1..WB4 + VisualVerifierTutorCard, CarlsonAdvisorCard + CalcSheetPreviewModal
│   ├── context/                    # PersonaThemeProvider (learn/plant + #FBF6EC paper / #071A33 blueprint)
│   ├── db/                         # Drizzle SQLite schema & idempotent client (screen_states, saved_calculations, pdf_anchors)
│   ├── hooks/                      # useAgentSelectable (agent-select:<kind>:<id> Point-and-Ask chips)
│   ├── server/                     # Express host API, SQLite persistence, sidecar proxy (api-server.ts) & Two-Tier copilot-route.ts (POST /api/copilot)
│   ├── styles/                     # Dual Theme CSS variable tokens — theme-tokens.css + workbench-components.css (no Tailwind, each < 200 LOC)
│   └── __tests__/                  # Vitest suites (phase3-shell.test.tsx, phase7-e2e.test.tsx, phase8-ux-copilot.test.tsx — 13 tests)
└── services/
    └── perry-engine/               # Python 3.12 FastAPI + PyMuPDF + ChEDL/CoolProp/SciPy/Pint sidecar (:8001)
        ├── main.py                 # FastAPI entrypoint mounting pdf, thermo, hydraulics, distillation, export routers
        ├── core/                   # unit_registry.py (psig/psia guardrail) & handcalcs_katex.py (3-stage AST->KaTeX)
        ├── pdf/                    # section_map.py, index_search.py, crop_engine.py, figure_detector.py
        ├── solvers/                # dippr_coeffs.py, thermo_dippr.py, carlson_tree.py, hydraulics_pipe.py, hydraulics_pump_valve.py, distillation_mccabe.py, distillation_hydraulics.py, calc_sheet_exporter.py
        ├── routers/                # pdf_router.py, thermo_router.py, hydraulics_router.py, distillation_router.py, export_router.py
        └── tests/                  # Pytest suites (test_phase1_core..test_phase7_export — 40 tests)
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

## `<200` LOC Modularity Gate (AGENTS.md Invariant #2)
Every `.ts`, `.tsx`, `.css` file in `src/` and every `.py` file in `services/perry-engine/` (`.venv` excluded) is mechanically verified `< 200` lines via the phase-05 walk (`ALL_SRC_UNDER_200_OK`); the largest files sit at ≤ 195 lines after the subcomponent extractions above.
