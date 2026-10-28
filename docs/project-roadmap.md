# Project Roadmap — ai4UCheE

## 7-Phase Execution Plan

The project executes along the 7 phases established in [`plans/261027-2242-perrys-intelligent-workbench/plan.md`](file:///Users/nad/ai4u/ai4UCheE/plans/261027-2242-perrys-intelligent-workbench/plan.md):

- [ ] **Phase 1: Workspace Foundation & Sidecar Bootstrap**
  - Project monorepo scaffolding
  - Python FastAPI sidecar bootstrap with `pint`, `handcalcs`, `PyMuPDF`
  - Health check and unit registry smoke tests

- [ ] **Phase 2: 25-Section Indexer, Visual Crop & Chart Verifier (WB1)**
  - PyMuPDF 25-section page indexer and anchor resolver
  - High-DPI table header + row composite cropper
  - Interactive SVG crosshair and chart-reading tutor

- [ ] **Phase 3: Agent-Native Core Shell & Design System**
  - React 19 + `motion/react` AppShell
  - Dual Theme (Paper vs. Blueprint)
  - `useAgentSelectable` point-and-ask context integration

- [ ] **Phase 4: DIPPR Property Engine & Carlson Advisor (WB2)**
  - 5-parameter DIPPR equations with validity bounds
  - Pint mixed-unit normalization
  - Carlson property method selection decision tree

- [ ] **Phase 5: Hydraulics, Pump NPSHa & Valve Cv (WB3)**
  - ASME B36.10M commercial pipe schedule database (Sch 40/80)
  - 3-Case operating matrix (70% / 100% / 120%)
  - Pump NPSHa vs NPSHr margin checker
  - ISA-75.01 control valve sizing and choked-flow warning

- [ ] **Phase 6: Distillation & Column Hydraulics (WB4)**
  - Bi-directional McCabe-Thiele canvas
  - Souders-Brown flooding velocity and column diameter sizing
  - Packed and tray hydraulic pressure drops

- [ ] **Phase 7: Senior Calculation Sheet Exporter & E2E Verification**
  - Printable QA/QC calculation sheets with KaTeX proofs
  - Markdown/LaTeX export notes
  - End-to-end verification across all workbenches
