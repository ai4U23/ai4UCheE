# Project Overview (PDR) — ai4UCheE

## Purpose
`ai4UCheE` (ChemEng's Intelligent Workbench) is an agent-native chemical engineering calculation and learning workspace within the ai4u ecosystem (`ai4U23`). Organized by **Chemical Engineering Subject**, it blends **6 canonical reference textbooks** into an interactive, verifiable engineering partner:
- *Perry's Chemical Engineers' Handbook, 9th Edition* (Green & Southard, 2019 — 2,274-page PDF across 25 sections + Index)
- *Elements of Chemical Reaction Engineering, 7th Edition* (Fogler, Goldsmith & Nikolla, 2025 — EPUB, 19 chapters + 10 appendices)
- *Transport Phenomena, Revised 2nd Edition* (Bird, Stewart & Lightfoot, 2006 — PDF)
- *Introduction to Chemical Engineering Thermodynamics, 9th Edition* (Smith, Van Ness, Abbott & Swihart, 2021 — PDF)
- *Separation Process Principles, 4th Edition* (Seader, Henley & Roper, 2016 — PDF)
- *Chemical Process Safety: Fundamentals with Applications, 4th Edition* (Crowl & Louvar, 2019 — PDF)

The platform bridges two distinct personas across **5 pure Chemical Engineering subject tabs** (`Thermodynamics & Phase`, `Fluid & Transport Hydraulics`, `Separations & Distillation`, `Kinetics & Reactor Design`, `6-Book & 25-Sec ChE Atlas`) plus a cross-subject header utility tool (`📐 Charts & Page Verifier`):
1. **Chemical Engineering Students (`🎓 Learn Mode`)**: Pedagogical guidance, first-principles derivations, 5 guided rescue missions, deep tutoring on charts and nomographs (such as Fanning vs. Darcy friction factors, Levenspiel CSTR/PFR sizing, and Thiele catalyst effectiveness), and unit-conversion guardrails.
2. **Plant and Process Engineers (`🏭 Plant Mode`)**: Fast 3-case engineering runs (70% turndown, 100% normal, 120% design/relief), commercial pipe schedule tables (ASME B36.10M), pump $\text{NPSH}_A$ calculations, ISA-75.01 control valve sizing, Semenov thermal runaway & API 520 relief checks, and print-ready EPC QA/QC calculation notes.

## Key Objectives & Success Metrics
- **White-Box Calculations**: Every calculation exposes a 3-stage trace (`Symbolic → Substituted w/ Units → Evaluated Result`) backed by verbatim citations (`[Perry's 9th Ed., Eq. X-Y, p. S-P]`, `[Fogler 7th Ed., Ch. X]`, `[BSL 2nd Ed., Ch. X]`, etc.).
- **Deterministic ChE Solvers**: Property calculations (DIPPR 101/106, CoolProp, SciPy), hydraulics, separations, kinetics/reactors, and all 25 Perry section models run inside validated Python/TypeScript solvers with zero LLM arithmetic hallucination.
- **Visual Grounding**: High-DPI page crops, table extracts, and bi-directionally interactive SVG charts provide instant proof of source figures and empirical parameters.
- **Bi-Directional Agent Context**: The AI agent and engineer interact seamlessly via typed actions (`defineAction`), `<current-screen>` live payload sync, natural-language What-If mutations, and selectable UI components (`useAgentSelectable`).
- **Strict Modularity**: Zero source files exceed 200 lines of code.

## Key References
- Implementation Plans: [`plans/261027-2242-perrys-intelligent-workbench/plan.md`](file:///Users/nad/ai4u/ai4UCheE/plans/261027-2242-perrys-intelligent-workbench/plan.md), [`plans/261030-0945-all-12-interactive-charts-and-diagrams/plan.md`](file:///Users/nad/ai4u/ai4UCheE/plans/261030-0945-all-12-interactive-charts-and-diagrams/plan.md), [`plans/261030-1020-whole-perry-25-section-handbook-atlas/plan.md`](file:///Users/nad/ai4u/ai4UCheE/plans/261030-1020-whole-perry-25-section-handbook-atlas/plan.md)
- System Architecture: [`docs/system-architecture.md`](file:///Users/nad/ai4u/ai4UCheE/docs/system-architecture.md)
