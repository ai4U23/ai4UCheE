# ai4UCheE — ChemEng's Intelligent Workbench (Showcase & User Guide)

> **Live Studio:** [https://chemeng.ai4u.now](https://chemeng.ai4u.now) · **Repository:** [github.com/ai4U23/ai4UCheE](https://github.com/ai4U23/ai4UCheE)

---

## Section 1 — Hero: The Sovereign 6-Book Chemical Engineering Studio (`#hero`)

**Where 6 Canonical Chemical Engineering Textbooks Meet an Agent-Native Interactive Studio.**
`ai4UCheE` (*ChemEng's Intelligent Workbench*) is a bi-directional, white-box chemical engineering solver and Socratic learning studio built around the **3-Zone AI-Native Studio ("1 Bar · 1 Canvas · 1 Agent")** paradigm:
- **6 Canonical Textbooks Indexed:** *Perry's Chemical Engineers' Handbook (9th Ed.)*, *Fogler's Elements of Chemical Reaction Engineering (7th Ed.)*, *Bird-Stewart-Lightfoot Transport Phenomena (2nd Ed.)*, *Smith-Van Ness-Abbott Thermodynamics (9th Ed.)*, *Seader Separation Process Principles (4th Ed.)*, and *Crowl & Louvar Chemical Process Safety (4th Ed.)*.
- **55+ Interactive SVG Nomographs & Diagrams:** Drag operating points directly on McCabe-Thiele $y\text{-}x$ diagrams, pump-system $\text{NPSH}_A$ curves, Levenspiel CSTR/PFR plots, DIPPR vapor-pressure envelopes, and Semenov thermal runaway S-curves.
- **24 Real-Life Plant Troubleshooting Problems:** Structured around Fogler & LeBlanc's 6-Stage Creative Problem-Solving Methodology across 4 progression tiers (`🌱 L1` to `🚨 L4`).

---

## Section 2 — Remotion Video Guide: Master the Workbench in 5 Chapters (`#video-guide`)

Watch our programmatic **Remotion Video Guide** (`1920×1080`, `30 fps`, frame-accurate React composition) to learn the 5-step workflow:
1. **00:00–00:03 · Orient in the 3-Zone Studio:** Top Studio Masthead (`Zone 1`), Interactive SVG Canvas & 34px Scrubbable Dials (`Zone 2`), and Sticky AI Co-Pilot Inspector (`Zone 3`).
2. **00:03–00:06 · Choose Your Persona & Subject Lab:** Toggle between `🎓 Learn Mode` (Socratic hints, first-principles derivations) and `🏭 Plant Mode` (3-case 70%/100%/120% EPC matrices) across 5 Subject Labs + the `📐 Charts` utility verifier.
3. **00:06–00:09 · Launch a Real-Life Plant Problem:** Pick from 24 plant upsets (`🌱 L1` Unit Traps to `🚨 L4` Coupled Runaway Hazards) and follow the 6-Stage Fogler & LeBlanc detective board.
4. **00:09–00:12 · Scrub SVG Handles & Inspect 3-Stage Proofs:** Drag canvas handles or scrub number dials while watching `Symbolic → Substituted w/ Units → Evaluated Result` KaTeX proofs and guardrails (`psig` vs. `psia`, $f_D = 4 f_F$).
5. **00:12–00:15 · Collaborate with AI Co-Pilot & Export QA/QC Calc Sheets:** Attach `+ Ask` context chips, run natural-language What-If mutations, and export print-ready Senior EPC QA/QC Calculation Sheets.

---

## Section 3 — 5 Subject Workbenches + Cross-Subject Charts & 25-Section Atlas (`#six-books-labs`)

Every chemical engineering discipline is unified under deterministic Python (`FastAPI` + `PyMuPDF` + `CoolProp` + `SciPy` + `Pint`) and TypeScript solvers:
- **Subject 1 (`WB2`) · Thermodynamics, Phase Equilibria & DIPPR:** Exact DIPPR Eq. 101/106 vapor pressure & $\Delta H_{\text{vap}}$, Carlson (1996) property package decision tree, Binary Non-Ideal VLE $T\text{-}x\text{-}y$ Azeotrope Lens, Peng-Robinson EOS $Z(P_r, T_r)$ dome, and Rankine/Van 't Hoff equilibrium cycles `[Perry's 9th Ed., Table 2-8, p. 2-53; SVNA 9th Ed., Ch. 3 & 10]`.
- **Subject 2 (`WB3`) · Fluid Mechanics, Transport & Piping Hydraulics:** ASME B36.10M Sch 40/80 pipe sizing, explicit $f_D = 4 f_F$ guardrail, 3-case pump $\text{NPSH}_A$ vs. $\text{NPSH}_R$, BSL Non-Newtonian velocity profiles, ISA-75.01 choked control valves, Bowman $F_T$ heat-exchanger cross, and Crowl flammability triangles `[Perry's 9th Ed., Fig. 6-9, p. 6-10 & p. 10-28; BSL 2nd Ed., Ch. 2]`.
- **Subject 3 (`WB4`) · Separation Processes, McCabe-Thiele & Column Hydraulics:** 5-handle bi-directional McCabe-Thiele stage stepping, Fenske-Underwood-Gilliland shortcuts, Fair's Souders-Brown flooding ($C_{sb}$), Eckert GPDC, Kremser absorption $N_{OG}$, Ternary LLE, and Psychrometric/Membrane charts `[Seader 4th Ed., Ch. 6–8; Perry's 9th Ed., Fig. 14-32, p. 14-37]`.
- **Subject 4 (`WB6`) · Kinetics, Catalysis & Chemical Reactor Design:** Levenspiel CSTR vs. PFR sizing, Ergun PBR pressure drop ($y = P/P_0$), spherical catalyst Thiele modulus $\phi$ & effectiveness $\eta$, Semenov thermal runaway ($\psi \le e^{-1}$), LHHW rate roofs, Monod bioreactor washout, and Butler-Volmer electrocatalysis `[Fogler 7th Ed., Ch. 2, 5, 12, 15; Crowl & Louvar 4th Ed., Ch. 8]`.
- **Subject 5 (`WB5`) + Utility (`WB1`) · 25-Section Perry Atlas & 10 Calibrated Nomographs:** Interactive solvers for all 25 sections of *Perry's 9th Ed.*, Back-of-Book Index (`pp. 2244–2274`), and 10 high-DPI calibrated nomographs with DeepTutor chart-reading verification.

---

## Section 4 — Problem-First Learning: 6-Stage Fogler & LeBlanc Troubleshooting (`#problem-solving`)

Rather than memorizing disconnected formulas, `ai4UCheE` puts **24 Real-Life Plant Problems** in the top mission bar (`🌱 L1 Unit/Concept Trap` → `🔧 L2 Equipment Bottleneck` → `🕵️ L3 Multi-Hypothesis Upset` → `🚨 L4 Coupled Safety/Design`). Every problem guides the engineer through **Fogler & LeBlanc's 6-Stage Creative Problem-Solving Flow**:
1. **Stage 1 · Problem Observation:** Compare Normal vs. Faulty plant telemetry and `⏱️ Δt` temporal fault clues.
2. **Stage 2 · Problem Definition (Kepner-Tregoe IS / IS NOT):** Distinguish perceived symptoms from the real root physical problem.
3. **Stage 3 · Fundamental Theory:** Verify governing conservation laws and dimensionless groups.
4. **Stage 4 · Applicable Handbook:** Inspect verbatim *Perry's 9th Ed.* tables, correlations, and high-DPI figure crops.
5. **Stage 5 · Hypotheses Prove ✅ / Disprove ❌ (Rule #12):** Test 3 competing hypotheses—enforcing Fogler's Rule #12 (*"seek to reject as well as to accept"*).
6. **Stage 6 · Actual Solution & Detective Stamp:** Scrub sliders or click `Auto-Fix` to restore safe plant margins and earn a deterministic `FOG-WB*-DIY-XXXXXX` completion stamp.

---

## Section 5 — Engineering Rigor, Error-Signature Guardrails & Bi-Directional AI Co-Pilot (`#whitebox-copilot`)

Zero black-box LLM arithmetic. Every calculation and AI interaction obeys strict engineering guardrails:
- **3-Stage White-Box KaTeX Proofs:** Every card renders `STAGE 1 · SYMBOLIC EQUATION`, `STAGE 2 · SUBSTITUTED WITH UNITS`, and `STAGE 3 · EVALUATED RESULT` alongside an exact textbook citation badge.
- **Deterministic ChE Error-Signature Detector:** Automatically catches the 4 classic chemical engineering traps in real time:
  1. **Darcy vs. Fanning $4\times$ Factor:** Enforces $f_D = 4 f_F$ `[Perry's 9th Ed., Eq. 6-38, p. 6-9]`.
  2. **Gauge vs. Absolute Pressure ($\pm 14.696\text{ psi}$ / $101.325\text{ kPa}$):** Prevents negative-pressure flashing bugs (`psig` vs. `psia`).
  3. **Celsius vs. Kelvin ($\pm 273.15$):** Protects Arrhenius $\exp(-E_a/RT)$ and DIPPR $\ln T$ terms.
  4. **Natural vs. Base-10 Logarithm ($\ln 10 \approx 2.303\times$):** Guards Fenske $N_{\min}$ and Antoine equations.
- **Bi-Directional `<current-screen>` AI Co-Pilot:** Click any `+ Ask` chip on an equation, pump node, or slider to attach typed context (`agent-select:<kind>:<id>`), or type *"Set flow to 260 gpm and suction pressure to 15 psig"* to mutate workbench sliders directly.

---

## Section 6 — Senior EPC QA/QC Calculation Sheets & Instant Studio Launch (`#calc-sheet-cta`)

Bridge classroom mastery and industrial plant delivery in one click:
- **Print-Ready Senior EPC QA/QC Calculation Sheets:** Compile equipment tags (`P-101A/B`, `T-201-DIST`, `R-401-PBR`), revision metadata (`Rev 0 — Issued for Review`), 3-case operating matrices, 3-stage KaTeX derivations, 6-Stage Fogler Root-Cause Audits, and SQLite persistence (`saved_calculations`).
- **AI & Search Discovery Ready (`AX / GEO`):** Full Markdown twins (`/index.md`, `/llms.txt`, `/llms-full.txt`) and `<PageAxShareMenu />` (`🔗 Share / AI`) for 1-click sharing to ChatGPT, Claude, or Perplexity.

---

## References & Canonical Citations
1. Green, D. W., & Southard, M. Z. (Eds.). (2019). *Perry's Chemical Engineers' Handbook* (9th ed.). McGraw-Hill Education. [https://www.accessengineeringlibrary.com/content/book/9780071834087](https://www.accessengineeringlibrary.com/content/book/9780071834087)
2. Fogler, H. S., Goldsmith, B. R., Nikolla, E., & Singh, N. (2025). *Elements of Chemical Reaction Engineering* (7th ed.). Pearson. [https://www.pearson.com/en-us/subject-catalog/p/elements-of-chemical-reaction-engineering/P200000010287](https://www.pearson.com/en-us/subject-catalog/p/elements-of-chemical-reaction-engineering/P200000010287)
3. Fogler, H. S., & LeBlanc, S. E. (2008). *Strategies for Creative Problem Solving* (2nd ed.). Prentice Hall. [https://umich.edu/~scps/](https://umich.edu/~scps/)
4. Bird, R. B., Stewart, W. E., & Lightfoot, E. N. (2006). *Transport Phenomena* (Revised 2nd ed.). John Wiley & Sons. [https://www.wiley.com/en-us/Transport+Phenomena%2C+Revised+2nd+Edition-p-9780470115398](https://www.wiley.com/en-us/Transport+Phenomena%2C+Revised+2nd+Edition-p-9780470115398)
5. Smith, J. M., Van Ness, H. C., Abbott, M. M., & Swihart, M. T. (2021). *Introduction to Chemical Engineering Thermodynamics* (9th ed.). McGraw-Hill Education. [https://www.mheducation.com/highered/product/introduction-chemical-engineering-thermodynamics-smith-van-ness/M9781260729276.html](https://www.mheducation.com/highered/product/introduction-chemical-engineering-thermodynamics-smith-van-ness/M9781260729276.html)
6. Seader, J. D., Henley, E. J., & Roper, D. K. (2016). *Separation Process Principles with Applications Using Process Simulators* (4th ed.). John Wiley & Sons. [https://www.wiley.com/en-us/Separation+Process+Principles+with+Applications+Using+Process+Simulators%2C+4th+Edition-p-9781119141327](https://www.wiley.com/en-us/Separation+Process+Principles+with+Applications+Using+Process+Simulators%2C+4th+Edition-p-9781119141327)
7. Crowl, D. A., & Louvar, J. F. (2019). *Chemical Process Safety: Fundamentals with Applications* (4th ed.). Pearson. [https://www.pearson.com/en-us/subject-catalog/p/chemical-process-safety-fundamentals-with-applications/P200000009457](https://www.pearson.com/en-us/subject-catalog/p/chemical-process-safety-fundamentals-with-applications/P200000009457)
8. Live Production Deployment — *ai4UCheE: ChemEng's Intelligent Workbench*. [https://chemeng.ai4u.now](https://chemeng.ai4u.now)
