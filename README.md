# ai4UCheE — Perry's Intelligent Workbench

Bi-directional agent-native chemical engineering workbench grounded in *Perry's Chemical Engineers' Handbook, 9th Edition*.

## Overview
`ai4UCheE` is the Chemical Engineering AI vertical within the ai4u ecosystem (`ai4U23`), designed for both **chemical engineering students (`🎓 Learn Mode`)** and **plant/process engineers (`🏭 Plant Mode`)**. It pairs an interactive React 19 + `motion/react` user interface with a deterministic Python ChE & PDF extraction sidecar (`FastAPI` + `PyMuPDF` + `chemicals` + `fluids` + `ht` + `thermo` + `CoolProp` + `pint` + `handcalcs`).

## Ecosystem Registry
- Governed under `control-plane (repo ai4u)`
- Registry entry: `repos.yaml` -> `verticals.ai4UCheE`
- Remote: `https://github.com/ai4U23/ai4UCheE.git`

## Core Workbenches
1. **WB1: Visual Crop & Chart Verifier** — 25-section page indexing, composite table header/row cropper, calibrated SVG crosshair, and DeepTutor chart-reading practice.
2. **WB2: DIPPR Thermophysical Properties & Carlson Advisor** — Exact DIPPR equations, pint field-unit normalization, and thermodynamic method selection.
3. **WB3: Hydraulics, Pump NPSHa & Valve Cv** — Commercial pipe sizing (Sch 40/80), 3-case flow matrix, pump NPSHa vs NPSHr, and ISA-75.01 choked-flow checks.
4. **WB4: Distillation & Column Hydraulics** — Bi-directional McCabe-Thiele canvas, Souders-Brown flooding velocity, and tray/packing pressure drop.
5. **WB5: EPC Calculation Sheet Exporter** — White-box calculation sheets with KaTeX proofs, document control metadata, and printable QA/QC format.

## Documentation
- [Project Overview (PDR)](file:///Users/nad/ai4u/ai4UCheE/docs/project-overview-pdr.md)
- [System Architecture](file:///Users/nad/ai4u/ai4UCheE/docs/system-architecture.md)
- [Code Standards](file:///Users/nad/ai4u/ai4UCheE/docs/code-standards.md)
- [Codebase Summary](file:///Users/nad/ai4u/ai4UCheE/docs/codebase-summary.md)
- [Design Guidelines](file:///Users/nad/ai4u/ai4UCheE/docs/design-guidelines.md)
- [Deployment Guide](file:///Users/nad/ai4u/ai4UCheE/docs/deployment-guide.md)
- [Project Roadmap](file:///Users/nad/ai4u/ai4UCheE/docs/project-roadmap.md)
