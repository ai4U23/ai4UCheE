# Project Overview (PDR) — ai4UCheE

## Purpose
`ai4UCheE` (ChemEng's Intelligent Workbench) is an agent-native chemical engineering calculation and learning workspace within the ai4u ecosystem (`ai4U23`). It transforms *Perry's Chemical Engineers' Handbook, 9th Edition* (2,274 pages across 25 sections) from a passive reference volume into an interactive, verifiable engineering partner.

The platform bridges two distinct personas:
1. **Chemical Engineering Students (`🎓 Learn Mode`)**: Pedagogical guidance, first-principles derivations, deep tutoring on charts and nomographs (such as Fanning vs. Darcy friction factors), and unit-conversion guardrails.
2. **Plant and Process Engineers (`🏭 Plant Mode`)**: Fast 3-case engineering runs (70% turndown, 100% normal, 120% design/relief), commercial pipe schedule tables (ASME B36.10M), pump NPSHa calculations, ISA-75.01 control valve sizing, and print-ready EPC calculation notes.

## Key Objectives & Success Metrics
- **White-Box Calculations**: Every calculation exposes a 3-stage trace (`Symbolic → Substituted w/ Units → Evaluated Result`) backed by verbatim citations (`[Perry's 9th Ed., Eq. X-Y, p. S-P]`).
- **Deterministic ChE Solvers**: Property calculations (DIPPR 101/106, CoolProp, SciPy) and hydraulic models run inside a validated Python sidecar with zero LLM arithmetic hallucination.
- **Visual Grounding**: High-DPI page crops and table extracts provide instant proof of source figures and empirical parameters.
- **Bi-Directional Agent Context**: The AI agent and engineer interact seamlessly via typed actions (`defineAction`) and selectable UI components (`useAgentSelectable`).
- **Strict Modularity**: Zero source files exceed 200 lines of code.

## Key References
- Implementation Plan: [`plans/261027-2242-perrys-intelligent-workbench/plan.md`](file:///Users/nad/ai4u/ai4UCheE/plans/261027-2242-perrys-intelligent-workbench/plan.md)
- System Architecture: [`docs/system-architecture.md`](file:///Users/nad/ai4u/ai4UCheE/docs/system-architecture.md)
