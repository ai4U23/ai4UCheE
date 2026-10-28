# Codebase Summary — ai4UCheE

## Directory Layout

```
ai4UCheE/
├── .gitignore                      # Ignore rules for PDF binaries, env secrets, and build caches
├── AGENTS.md                       # Invariants and repository governance rules
├── README.md                       # Entrypoint documentation
├── docs/                           # Ecosystem documentation suite
│   ├── project-overview-pdr.md
│   ├── code-standards.md
│   ├── codebase-summary.md
│   ├── design-guidelines.md
│   ├── deployment-guide.md
│   ├── system-architecture.md
│   └── project-roadmap.md
├── plans/                          # Execution plans & master blueprints
│   ├── 261027-2242-perrys-intelligent-workbench/
│   │   ├── plan.md                 # Master 7-phase implementation blueprint
│   │   ├── phase-01-start.md
│   │   ├── phase-02-pdf-visual-crop-and-chart-verifier.md
│   │   ├── phase-03-agent-native-shell-and-framer-motion-ui.md
│   │   ├── phase-04-dippr-thermo-pint-and-property-advisor.md
│   │   ├── phase-05-hydraulics-pipe-pump-npsha-and-valve-cv.md
│   │   ├── phase-06-distillation-mccabe-thiele-and-flooding.md
│   │   ├── phase-07-calc-sheet-exporter-inline-ui-and-e2e.md
│   │   └── reports/
│   ├── journals/                   # Session journals and decision logs
│   └── reports/                    # Benchmark and research reports
├── apps/                           # Web application workspace (React 19 + motion/react)
└── services/                       # Backend services and Python engine sidecar
    └── perry-engine/               # FastAPI + PyMuPDF + ChEDL calculation engine
```

## Workspaces & Components
- **Frontend App (`apps/web`)**: React 19, Tailwind CSS, `motion/react`, `BuilderIO/agent-native` client integration.
- **Sidecar (`services/perry-engine`)**: FastAPI service running on port 8001 providing DIPPR property evaluations, hydraulic sizing, and PyMuPDF high-DPI document crops.
