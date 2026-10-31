# ai4UCheE — ChemEng's Intelligent Workbench

Canonical URL: https://chemeng.ai4u.now/
Last Updated: 2026-10-31

`ai4UCheE` (`https://chemeng.ai4u.now`) is a bi-directional agent-native chemical engineering workbench organized by **Chemical Engineering Subject**, blending **6 canonical reference textbooks** for both **chemical engineering students (`🎓 Learn Mode`)** and **plant/process engineers (`🏭 Plant Mode`)**.

## 6 Canonical Reference Textbooks
1. *Perry's Chemical Engineers' Handbook, 9th Edition* (Green & Southard, 2019)
2. *Elements of Chemical Reaction Engineering, 7th Edition* (Fogler, Goldsmith & Nikolla, 2025)
3. *Transport Phenomena, Revised 2nd Edition* (Bird, Stewart & Lightfoot, 2006)
4. *Introduction to Chemical Engineering Thermodynamics, 9th Edition* (Smith, Van Ness, Abbott & Swihart, 2021)
5. *Separation Process Principles, 4th Edition* (Seader, Henley & Roper, 2016)
6. *Chemical Process Safety: Fundamentals with Applications, 4th Edition* (Crowl & Louvar, 2019)

## 5 Subject Workbenches & Cross-Subject Tools
- **Subject 1 (`WB2` — Thermodynamics, Phase Equilibria & DIPPR):** Exact DIPPR Eq. 101 vapor pressure & Eq. 106 heat of vaporization (`T_r^C5`), explicit `psig` vs. `psia` (+14.696 psi) conversion, Carlson property-package decision tree (`NRTL`, `UNIQUAC`, `Peng-Robinson`, `NRTL-HOC`), Binary Non-Ideal VLE `T-x-y`/`y-x` Phase Lens, Peng-Robinson Cubic EOS `Z(P_r, T_r)`, Rankine `T-S` Cycle Dome, and Van 't Hoff reaction equilibrium `X_eq(T)` `[Perry's 9th Ed., Table 2-8, p. 2-53 & Table 2-69, p. 2-120]`.
- **Subject 2 (`WB3` — Fluid Mechanics, Transport & Piping Hydraulics):** Commercial pipe sizing (Sch 40/80), explicit Darcy vs. Fanning friction factor guardrail (`f_D = 4 * f_F`), 3-case EPC datasheet matrix (`70% / 100% / 120%`), pump cavitation check (`NPSH_A` vs. `NPSH_R`), BSL non-Newtonian power-law velocity profile, ISA-75.01 choked control valve curve, Shell-and-Tube HX `T-Q` temperature cross (`Bowman F_T`), Nukiyama pool boiling curve, and Crowl & Louvar flammability triangle (`LOC`) `[Perry's 9th Ed., Eqs. 6-37..6-39, p. 6-11 & Sec. 8, p. 8-71]`.
- **Subject 3 (`WB4` — Separation Processes, McCabe-Thiele & Column Hydraulics):** Bi-directional 5-handle McCabe-Thiele stage stepping, Fenske `N_min`, Underwood `R_min`, Gilliland correlation, Fair's Souders-Brown flooding velocity (`C_sb`), Eckert GPDC packed column pressure drop, Kremser absorption/stripping `N_OG(A)`, Ternary LLE & adsorption breakthrough, psychrometric chart, and membrane gas permeation `[Perry's 9th Ed., Sec. 13, p. 13-36 & Fig. 14-32, p. 14-37]`.
- **Subject 4 (`WB6` — Kinetics, Catalysis & Chemical Reactor Design):** Interactive Levenspiel CSTR rectangle vs. PFR integral plot, PBR Ergun pressure drop (`y = P/P_0`), spherical catalyst Thiele modulus `phi` & internal effectiveness `eta`, Semenov thermal runaway `G(T)` vs. `R(T)` (`psi_crit = 1/e ≈ 0.368`), series/parallel selectivity & Tanks-in-Series RTD, LHHW catalytic rate roof, Monod chemostat washout, and Butler-Volmer polarization `[Fogler 7th Ed., Ch. 2, 5, 12, 15; Perry's 9th Ed., Sec. 7 & 19]`.
- **Subject 5 (`WB5` — 6-Book Corpus & 25-Section Perry's Atlas):** Interactive domain solvers across all 25 sections of *Perry's 9th Edition* (`Sec 1–25`), Back-of-Book Index (`pp. 2244–2274`), and cross-textbook search.
- **Cross-Subject Utility (`WB1` — Calibrated Nomographs & Chart Verifier):** 10 calibrated multi-book nomographs (`6-10` Moody `f_F`, `14-37` Fair `C_sb`, `14-57` Eckert GPDC, `2-53` DIPPR `P_vp`, `19-6` Levenspiel `V_CSTR/V_PFR`, `6-52` Sphere Drag `C_D`, `4-18` Lee-Kesler `Z^0`, `15-10` Thiele `eta`, `14-15` Kremser `N_OG`, `23-42` Semenov `psi`) with high-DPI PDF page crop verification.
- **24 Real-Life Plant Problems (`🌱 L1 · 🔧 L2 · 🕵️ L3 · 🚨 L4`):** Fogler & LeBlanc 6-stage troubleshooting workflow with hypothesis testing and Socratic AI Co-Pilot coaching.

## Agent & API Endpoints
- `GET /api/screen-state`: Returns current workbench state (`activeWorkbench`, `personaMode`, `selectedChips`, `payload`) and `<current-screen>` XML tag.
- `POST /api/copilot`: Natural-language ChE Co-Pilot with bi-directional `actionMutations` slider scrubbing.
- `POST /api/actions/:actionName`: Invokes registered deterministic ChE actions (`generate_calc_sheet`, `crop_perry_page`, `search_perry_pdf`).
