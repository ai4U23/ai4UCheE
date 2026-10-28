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
│   ├── actions/                    # Zod-typed shared actions (define-action, view-screen, search-perry-pdf, query-dippr, run-hydraulics, run-distillation, generate-calc-sheet)
│   ├── components/
│   │   ├── gen-ui/                 # Inline generative UI card renderer (render-inline-extension.tsx)
│   │   ├── shell/                  # AppShell (motion/react layoutId) & AgentChatDrawer
│   │   ├── sketches/               # Parametric SVG diagrams (piping-pump-svg-sketch, mccabe-thiele-svg-canvas, column-flooding-svg-sketch)
│   │   ├── ui/                     # ScrubbableNumberInput
│   │   └── workbenches/            # WB1..WB4 + CalcSheetPreviewModal
│   ├── context/                    # PersonaThemeProvider (learn/plant + #FBF6EC paper / #071A33 blueprint)
│   ├── db/                         # Drizzle SQLite schema & idempotent client (screen_states, saved_calculations, pdf_anchors)
│   ├── hooks/                      # useAgentSelectable (agent-select:<kind>:<id> Point-and-Ask chips)
│   ├── server/                     # Express host API, SQLite persistence & sidecar proxy (api-server.ts)
│   ├── styles/                     # Dual Theme CSS variable tokens (theme-tokens.css, no Tailwind)
│   └── __tests__/                  # Vitest suites (phase3-shell.test.tsx, phase7-e2e.test.tsx — 9 tests)
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
