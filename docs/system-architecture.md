# System Architecture — ai4UCheE

## Architecture Overview

```mermaid
flowchart TB
    subgraph Client["Frontend: React 19 + motion/react (Port 5173)"]
        Shell["AppShell & Mode Header (Learn vs Plant Mode)"]
        Select["Point-and-Ask Hook (useAgentSelectable)"]
        GenUI["Inline Generative UI (agentNative.ui.output)"]
        WB1["WB1: Sec 1-25 Visual Crop & Chart Verifier"]
        WB2["WB2: Sec 1,2,4 DIPPR & Carlson Tree"]
        WB3["WB3: Sec 6,8,10 Hydraulics, Pump NPSHa & Cv"]
        WB4["WB4: Sec 13,14 McCabe-Thiele & Flooding"]
        WB5["WB5: Calc Sheet Exporter (HTML/PDF & LaTeX)"]
    end

    subgraph HostAPI["Agent Runtime & Action Layer (Port 3000)"]
        Actions["Zod-Typed Actions (defineAction)"]
        StateStore[("Local SQLite / State Cache")]
    end

    subgraph Sidecar["Python ChE & PDF Sidecar (Port 8001)"]
        FastAPI["FastAPI App (services/perry-engine)"]
        PDFEng["PyMuPDF (fitz) 25-Section Indexer & Cropper"]
        Units["Pint Unit Registry + Normalizer"]
        Handcalcs["3-Stage White-Box AST Renderer"]
        Solvers["Deterministic Solvers (chemicals, fluids, CoolProp, SciPy)"]
    end

    PDF[("Perry's 9th Ed. PDF<br/>(Gitignored, 2,274 Pages)")]

    Shell --> WB1 & WB2 & WB3 & WB4 & WB5
    WB1 & WB2 & WB3 & WB4 & WB5 --> Select & GenUI
    Client <-->|"JSON / SSE"| Actions
    Actions <--> StateStore
    Actions <-->|"REST (HTTP 127.0.0.1:8001)"| FastAPI
    FastAPI --> PDFEng & Units & Handcalcs & Solvers
    PDFEng -->|"fitz high-DPI crop"| PDF
```

## Core Subsystems
1. **Agent-Native Host**: Bridges the interactive web UI and LLM agent using typed schema actions and live UI state synchronization.
2. **Deterministic ChE Solvers**: Replaces LLM numerical calculations with verified open-source engineering packages.
3. **PyMuPDF Document Resolver**: Extracts exact section pages, tables, figures, and empirical equations to ground answers in Perry's handbook text.
4. **White-Box Proof Generator**: Generates transparent mathematical derivations with unit cancellations for engineering review.
