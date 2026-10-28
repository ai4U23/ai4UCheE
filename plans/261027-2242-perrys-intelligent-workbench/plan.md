---
title: "Perry's Intelligent Workbench (perrys-agent-workbench) — V1 Implementation Plan"
description: "Complete 7-phase architectural & execution handover blueprint for an agent-native chemical engineering workbench combining BuilderIO/agent-native React 19 + motion/react UI with a local FastAPI + PyMuPDF + ChEDL/CoolProp/handcalcs Python sidecar grounded in Perry's 9th Ed."
status: pending
priority: P1
effort: 28h
issue: null
branch: feat/perrys-agent-workbench-v1
tags: [feature, frontend, backend, api, database, che-engineering, agent-native]
blockedBy: []
blocks: []
created: 2026-10-27
---

# Perry's Intelligent Workbench (`perrys-agent-workbench`) — V1 Master Plan (`--advice --ultra`)

> [!IMPORTANT]
> **Handover-Ready Contract (`--advice`)**: This plan is authored under `kongming` advisory supervision for direct execution by a downstream executor model (`/ak:cook --advice`). Each of the **7 separate phase files** (`phase-01-start.md` through `phase-07-calc-sheet-exporter-inline-ui-and-e2e.md`) decomposes its work into self-contained numbered tasks (`Goal`, `Target files and symbols`, `Steps`, `Success criteria`, and a decidable mechanical `Verify` comparison command) and ends with the mandatory literal `## Failure Protocol` block. **Every code file created or modified MUST stay strictly `< 200` lines of code** (modularized with kebab-case descriptive filenames).

## Overview

Build **Perry's Intelligent Workbench** (`/Users/nad/ai4u/ai4UCheE`), a bi-directional agent-native web application that turns *Perry's Chemical Engineers' Handbook, 9th Edition* (`/Users/nad/ai4u/ai4UCheE/Perry's Chemical Engineers' Handbook, 9th Edition.pdf`, 215 MB, 2,274 pages, 25 sections + Index) into a unified cognitive workspace for both **chemical engineering students (`🎓 Learn Mode`)** and **0–3 YoE fresh-grad plant/process engineers (`🏭 Plant Mode`)**.

## Goals

| # | Goal | Priority |
|---|---|---|
| 1 | **Bi-Directional Agent-Native Host (`BuilderIO/agent-native` + `motion/react`)**: Unify React 19 UI and agent via shared Zod-typed actions (`defineAction`), `<current-screen>` live sync (`writeClientAppState`), `useAgentSelectable` Point-and-Ask context chips (`agent-select:<kind>:<id>`), inline generative UI (`agentNative.ui.output()`), `layoutId` shared-layout morphing between `Learn` and `Plant` modes, scrubbable number inputs, and Dual Theme (`☀️ EPC Calc-Pad Paper #FAF8F5` vs. `🌙 Control Room Blueprint #0B101B`). | P1 |
| 2 | **Deterministic Python ChE & PDF Sidecar (`services/perry-engine/`)**: Run `FastAPI` + `PyMuPDF` (`fitz`) + `chemicals` + `fluids` + `ht` + `thermo` + `CoolProp` + `SciPy` + `pint` + a 3-Stage `handcalcs` AST-to-KaTeX White-Box Renderer (`Symbolic → Substituted w/ Units → Result + # [Perry's 9th Ed., Eq. X-Y, p. S-P]`). | P1 |
| 3 | **4 V1 Engineering Workbenches (`WB1–WB4`)**: Deliver **WB1** (25-Section `Sec-Page` Visual Verifier, Composite Table Header+Row Cropper, Calibrated SVG Crosshair, & `DeepTutor` Chart-Reading Practice with $4\times$ Fanning/Darcy coaching), **WB2** (Sec 1, 2 & 4 DIPPR exact $T^{C_5}$ Engine, `pint` Field-Unit Normalizer, & Carlson's Property Method Decision Tree), **WB3** (Sec 6, 8 & 10 Commercial Pipe `Sch 40/80` Sizing, 3-Case `70%/100%/120%` Matrix, Pump $\text{NPSH}_A$ vs. $\text{NPSH}_R$, & ISA-75.01 Control Valve $C_v$ Choked-Flow Check + Parametric SVG Sketch), and **WB4** (Sec 13 & 14 Bi-Directional McCabe-Thiele Canvas + Souders-Brown $C_{\text{sb}}$ & Eckert GPDC Flooding Hydraulics). | P1 |
| 4 | **Senior-Engineer QA/QC Calculation Sheet Exporter**: Compile any calculation into both a **Print-to-PDF EPC Calculation Sheet (`HTML` with `@media print`)** and a **Markdown / LaTeX Calculation Note** with QA/QC Document Control Header, 3-stage white-box equations, 3-Case table, and embedded *Perry's 9th Ed.* proof crops. | P1 |

## Architecture & Dependency Graph

```mermaid
flowchart TB
    subgraph Client["Primary Host: React 19 + Vite + Tailwind + motion/react (Port 5173)"]
        Shell["AppShell & Dual-Lens Header<br/>(personaMode: 'learn' | 'plant'<br/>Theme: #FAF8F5 Paper vs #0B101B Blueprint)"]
        Sync["Bi-Directional State Sync<br/>(&lt;current-screen&gt; + writeClientAppState)"]
        Select["Point-and-Ask Hook<br/>(useAgentSelectable -> agent-select:kind:id)"]
        GenUI["Inline Generative UI<br/>(render-inline-extension + agentNative.ui.output)"]
        WB1["Workbench 1: Sec 1-25 Visual Crop & Chart Verifier"]
        WB2["Workbench 2: Sec 1,2,4 DIPPR & Carlson Tree"]
        WB3["Workbench 3: Sec 6,8,10 Hydraulics, Pump NPSHa & Cv"]
        WB4["Workbench 4: Sec 13,14 McCabe-Thiele & Flooding"]
        WB5["Calc Sheet Exporter (HTML/Print-to-PDF & LaTeX)"]
    end

    subgraph HostAPI["Nitro / Express API & Agent Runtime (Port 3000)"]
        Actions["Zod-Typed Shared Actions (defineAction)<br/>actions/view-screen.ts | query-dippr.ts | run-hydraulics.ts<br/>run-distillation.ts | generate-calc-sheet.ts"]
        DB[("SQLite + Drizzle ORM<br/>db/schema.ts (saved_calcs, screen_state, pdf_anchors)")]
    end

    subgraph Sidecar["Python ChE & PDF Engine Sidecar (127.0.0.1:8001)"]
        FastAPI["FastAPI Server (services/perry-engine/main.py)"]
        Units["Pint Unit Registry + Field-Unit Normalizer<br/>(psig->psia, gpm, lb/hr, cP, ft)"]
        Handcalcs["3-Stage White-Box Renderer (handcalcs AST -> KaTeX)<br/>Symbolic -> Substituted w/ Units -> Result + Citation"]
        PDFEng["PyMuPDF (fitz) 25-Section Indexer & Cropper<br/>Sec-Page Resolver + Composite Table Crop + SVG Crosshair"]
        Solvers["Deterministic Solvers (chemicals, fluids, ht, thermo, CoolProp, SciPy)<br/>DIPPR T^C5 | B36.10M + Darcy/Fanning | McCabe-Thiele + Souders-Brown"]
    end

    PDF[("Perry's 9th Ed. PDF<br/>/Users/nad/Downloads/...pdf<br/>215 MB, 2,274 Pages")]

    Shell --> WB1 & WB2 & WB3 & WB4 & WB5
    WB1 & WB2 & WB3 & WB4 & WB5 --> Select & Sync & GenUI
    Client <-->|"HTTP / SSE"| Actions
    Actions <--> DB
    Actions <-->|"JSON REST (127.0.0.1:8001)"| FastAPI
    FastAPI --> Units & Handcalcs & PDFEng & Solvers
    PDFEng -->|"fitz open & high-DPI pixmap"| PDF
```

## Phases

| # | Phase | Status |
|---|-------|--------|
| 1 | [Phase 1: Workspace Foundation, Monorepo Scaffolding & Python PerryEngine Sidecar Bootstrap](./phase-01-start.md) | Pending |
| 2 | [Phase 2: Perry's 9th Ed. 25-Section Indexer, PyMuPDF Visual Crop Engine & Dual-Track Chart Verifier (WB1)](./phase-02-pdf-visual-crop-and-chart-verifier.md) | Pending |
| 3 | [Phase 3: BuilderIO/agent-native Core Shell, Dual-Lens UI, useAgentSelectable & motion/react Design System](./phase-03-agent-native-shell-and-framer-motion-ui.md) | Pending |
| 4 | [Phase 4: Sec 1, 2 & 4 DIPPR Thermophysical Property Engine, Mixed Field-Unit Normalizer & Carlson's Property Advisor (WB2)](./phase-04-dippr-thermo-pint-and-property-advisor.md) | Pending |
| 5 | [Phase 5: Sec 6, 8 & 10 Fluid Hydraulics, Commercial Pipe Sizing, Pump NPSHa & Control Valve Cv Workbench (WB3)](./phase-05-hydraulics-pipe-pump-npsha-and-valve-cv.md) | Pending |
| 6 | [Phase 6: Sec 13 & 14 Distillation Workbench: Bi-Directional McCabe-Thiele Canvas + Tray/Packing Flooding Hydraulics (WB4)](./phase-06-distillation-mccabe-thiele-and-flooding.md) | Pending |
| 7 | [Phase 7: Senior-Engineer Calculation Sheet Exporter, Inline Generative UI Cards & End-to-End Verification](./phase-07-calc-sheet-exporter-inline-ui-and-e2e.md) | Pending |

## Ultra Verifier & Red-Team Summary (`--ultra --advice`)

- **Ultra Best-of-5 Selection**: `winner: Candidate A (99/100)`, `picked=1/5`, `margin=low (+2 pts over Candidate E)`, `unanimous=yes`, `rejected_all=no`, with surgical merges from Candidate D (composite table header + row cropper and `fanning_darcy_4x_detected` coaching diagnostic), Candidate B (explicit ISA liquid critical pressure ratio factor $F_F = 0.96 - 0.28\sqrt{P_v / P_c}$ step in 3-stage `handcalcs`), and Candidate E (`< 200` LOC automated modularity gate).
- **Engineered Safety Guardrails**:
  1. **Darcy vs. Fanning ($f_D = 4 f_F$)**: Perry's Fig. 6-9 plots Fanning $f_F$; Phase 2 & Phase 5 explicitly surface both $f_F$ and $f_D = 4 f_F$ and detect $4\times$ student reading mistakes.
  2. **Gauge vs. Absolute Pressure (`psig` vs. `psia`)**: Phase 1 & Phase 5 reject bare `"psi"` and log explicit $P_{\text{abs}} = P_{\text{gauge}} + P_{\text{atm}}$ conversions in Stage 2 of the `handcalcs` trace.
  3. **DIPPR $T^{C_5}$ & Validity Bounds**: Phase 4 evaluates full 5-parameter DIPPR Eq. 101 & Eq. 106 ($C_2 + C_3 T_r + C_4 T_r^2 + C_5 T_r^3$) and enforces $[T_{\min}, T_{\max}]$ bounds with `CoolProp` reference fallback.
  4. **Carlson LLE & Dimerization Traps**: Phase 4 warns against using `Wilson` for Liquid-Liquid Equilibrium (LLE) and mandates `NRTL-HOC` (Hayden-O'Connell) for carboxylic acid vapor-phase dimerization.

## Success Criteria

- [ ] All 7 phase files pass `ak plan validate` and execute cleanly under `/ak:cook --advice`.
- [ ] Python sidecar `pytest` suite (`test_phase1` through `test_phase7`) exits `0` with 100% pass rate against the 2,274-page *Perry's 9th Ed.* PDF.
- [ ] Frontend `vitest` suite and `vite build` exit `0` with full `<current-screen>`, `useAgentSelectable`, and `agentNative.ui.output()` verification.
- [ ] Zero `.ts`, `.tsx`, or `.py` source files exceed 200 lines of code.

<!-- slug: perrys-intelligent-workbench -->
