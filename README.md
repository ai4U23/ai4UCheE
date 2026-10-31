# ai4UCheE — ChemEng's Intelligent Workbench

Bi-directional agent-native chemical engineering workbench organized by **Chemical Engineering Subject**, blending **6 canonical reference textbooks**:
- *Perry's Chemical Engineers' Handbook, 9th Edition* (Green & Southard, 2019 — PDF)
- *Elements of Chemical Reaction Engineering, 7th Edition* (Fogler, Goldsmith & Nikolla, 2025 — EPUB)
- *Transport Phenomena, Revised 2nd Edition* (Bird, Stewart & Lightfoot, 2006 — PDF)
- *Introduction to Chemical Engineering Thermodynamics, 9th Edition* (Smith, Van Ness, Abbott & Swihart, 2021 — PDF)
- *Separation Process Principles, 4th Edition* (Seader, Henley & Roper, 2016 — PDF)
- *Chemical Process Safety: Fundamentals with Applications, 4th Edition* (Crowl & Louvar, 2019 — PDF)

## Overview
`ai4UCheE` is the Chemical Engineering AI vertical within the ai4u ecosystem (`ai4U23`), designed for both **chemical engineering students (`🎓 Learn Mode`)** and **plant/process engineers (`🏭 Plant Mode`)**. It pairs an interactive React 19 + `motion/react` user interface with a deterministic Python ChE & PDF/EPUB extraction sidecar (`FastAPI` + `PyMuPDF` + `chemicals` + `fluids` + `ht` + `thermo` + `CoolProp` + `pint` + `handcalcs`).

## Ecosystem Registry
- Governed under `control-plane (repo ai4u)`
- Registry entry: `repos.yaml` -> `verticals.ai4UCheE`
- Remote: `https://github.com/ai4U23/ai4UCheE.git`
- Live URL: [https://chemeng.ai4u.now](https://chemeng.ai4u.now) (Tailnet: [http://chemeng](http://chemeng) / `100.64.56.26`; legacy alias `chemie.ai4u.now` still resolves)

## Subject-First Workbenches & Cross-Subject Utility Tools
1. **Subject 1 (`WB2`): Thermodynamics, Phase Equilibria & DIPPR** — Exact DIPPR Eq. 101/106 correlations, pint field-unit normalization (`psig` ↔ `psia`), Carlson property-package decision tree, interactive **Diagram Mode Bar (`wb2-diagram-mode-bar`)**, **Binary Non-Ideal VLE $T\text{-}x\text{-}y$ / $y\text{-}x$ Phase Lens & Azeotrope Explorer**, **Peng-Robinson Cubic EOS $Z(P_r, T_r)$ & $P_r\text{-}V_r$ Isotherm Dome**, and **Rankine / Vapor-Compression $T\text{-}S$ Cycle Dome + Van 't Hoff Reaction Equilibrium $X_{\text{eq}}(T)$ with Adiabatic Line** (*Perry's* + *Smith-Van Ness-Abbott* + *Fogler* + *Seader*).
2. **Subject 2 (`WB3`): Fluid Mechanics, Transport & Piping Hydraulics** — Commercial pipe sizing (Sch 40/80), explicit $f_D = 4 f_F$ guardrail, 3-case flow matrix, pump $\text{NPSH}_A$ vs $\text{NPSH}_R$, interactive **Diagram Mode Bar (`wb3-diagram-mode-bar`)**, **BSL Non-Newtonian Pipe Velocity Profile $v_z(r)/v_{\max}$ + Boundary Layer $\delta_v, \delta_T, \delta_c$ Sketch**, **ISA-75.01 Control Valve Choked Flow $Q(\sqrt{\Delta P})$ & Flashing Curve**, **Shell-and-Tube Heat Exchanger $T\text{-}Q$ Temperature Cross (Bowman $F_T$) + Nukiyama Pool Boiling Curve $q''(\Delta T_{\text{excess}})$**, and **Crowl & Louvar Ternary Flammability Triangle ($\text{Fuel–O}_2\text{–N}_2$ LOC) + Pasquill-Gifford Plume Dispersion $C(x)$** (*BSL Transport* + *Perry's* + *Crowl & Louvar*).
3. **Subject 3 (`WB4`): Separation Processes, McCabe-Thiele & Column Hydraulics** — Bi-directional 5-handle McCabe-Thiele canvas, Fenske-Underwood-Gilliland shortcuts, Fair's Souders-Brown flooding velocity, Eckert GPDC, interactive **Diagram Mode Bar (`wb4-diagram-mode-bar`)**, **Kremser Absorption / Stripping Diagram & $N_{OG}(A)$ Curve**, **Ternary Liquid-Liquid Extraction (LLE) Equilateral Triangle & Adsorption Breakthrough $C/C_0(t/\tau)$ Wavefront**, and **Psychrometric Humidification Chart ($T_{db}, T_{wb}, \phi$) + Membrane Gas Permeation Stage Cut $\theta$ vs. Enrichment $y_P(\theta)$** (*Seader, Henley & Roper* + *Perry's* + *SVNA*).
4. **Subject 4 (`WB6`): Kinetics, Catalysis & Chemical Reactor Design** — Interactive Levenspiel CSTR rectangle vs. PFR integral plot, PBR Ergun pressure drop ($y = P/P_0$), spherical catalyst Thiele modulus $\phi$ & internal effectiveness $\eta$, interactive **Diagram Mode Bar (`wb6-diagram-mode-bar`)**, **Semenov Thermal Runaway S-Curve ($G(T)$ vs. $R(T)$)**, **Multiple Reactions Series/Parallel Selectivity $C_A, C_B, C_C(\tau)$ & Non-Ideal RTD Tanks-in-Series $E(\Theta; N)$**, **Langmuir-Hinshelwood (LHHW) Dual-Site Catalytic Rate Roof $-r'_A(P_A)$ & Decay $a(t)$ + Monod Chemostat Bioreactor Productivity $D\cdot C_X(D)$ with Washout Cliff $D_{\text{wash}}$**, and **Electrochemical Butler-Volmer / Koutecký-Levich Polarization Curve $i(\eta)$** (*Fogler 7th Ed.* + *Perry's Sec 7/19/20* + *BSL Ch. 18* + *Crowl & Louvar Ch. 8*).
5. **Subject 5 (`WB5`): 6-Book Chemical Engineering Corpus & 25-Section Atlas** — All 25 *Perry's* sections (`Sec 1–25`) with interactive SVG solvers, Back-of-Book Index (`pp. 2244–2274`), and cross-textbook search across all 6 reference books.
6. **Cross-Subject Utility Tool (`WB1`): Charts, Nomographs & Page Verifier** — Header utility tool accessible from any subject (auto-syncing the chart relevant to the active subject) featuring **10 calibrated multi-book nomographs/charts** across all 6 textbooks (`6-10` Moody $f_F$, `14-37` Fair $C_{sb}$, `14-57` Eckert GPDC, `2-53` DIPPR $P_{\text{vp}}$, `19-6` Levenspiel $V_{\text{CSTR}}/V_{\text{PFR}}$, `6-52` Sphere Drag $C_D(\text{Re}_p)$, `4-18` Lee-Kesler $Z^0(P_r, T_r)$, `15-10` Thiele $\eta(\phi_1)$, `14-15` Kremser $N_{OG}(A)$, `23-42` Semenov $\psi(T_c)$), composite table header/row cropping, and DeepTutor chart-reading practice.
7. **Senior EPC QA/QC Calculation Sheet Exporter** — White-box calculation sheets with 3-stage KaTeX proofs, document control metadata, and printable QA/QC format across all workbenches.

## Documentation
- [Project Overview (PDR)](file:///Users/nad/ai4u/ai4UCheE/docs/project-overview-pdr.md)
- [System Architecture](file:///Users/nad/ai4u/ai4UCheE/docs/system-architecture.md)
- [Code Standards](file:///Users/nad/ai4u/ai4UCheE/docs/code-standards.md)
- [Codebase Summary](file:///Users/nad/ai4u/ai4UCheE/docs/codebase-summary.md)
- [Design Guidelines](file:///Users/nad/ai4u/ai4UCheE/docs/design-guidelines.md)
- [Deployment Guide](file:///Users/nad/ai4u/ai4UCheE/docs/deployment-guide.md)
- [Project Roadmap](file:///Users/nad/ai4u/ai4UCheE/docs/project-roadmap.md)
