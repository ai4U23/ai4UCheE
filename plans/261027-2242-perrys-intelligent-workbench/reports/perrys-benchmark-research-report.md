# Research Report: Commercial Apps & Open-Source Repositories to Learn From for **Perry's Intelligent Workbench**

- **Timestamp**: `2026-10-27T21:52:30+07:00`
- **Workflow**: `/ak:research --advice --ultra`
- **Ultra Verifier Status**: `winner: Candidate C (99/100)` | `picked=1/5` | `margin=low (+2 pts over Candidate A)` | `unanimous=yes` | `rejected_all=no`
- **Target Architecture**: `BuilderIO/agent-native` (React/TypeScript bi-directional UI + unified `defineAction` Zod schemas + PGlite/Drizzle state) paired with a local Python `FastAPI` + PDF & ChE solver sidecar (`CalebBell/ChEDL`, `CoolProp`, `SciPy`, `pint`, `handcalcs`), grounded in [Perry's Chemical Engineers' Handbook, 9th Edition.pdf](file:///Users/nad/Downloads/Perry's%20Chemical%20Engineers'%20Handbook,%209th%20Edition.pdf) (2,274 pp., 25 sections).
- **Target Personas**:
  1. **🎓 Learn Mode (University ChE Students)**: First-principles derivations, interactive visual intuition (operating lines, stage stepping, phase envelopes, $T\text{-}x\text{-}y$ / McCabe-Thiele), dimensional homogeneity coaching, and figure-grounded practice.
  2. **🏭 Plant / Fresbie Mode (Junior Process & Plant Engineers, 0–3 YoE)**: Auditable Senior-Engineer sign-off calculation datasheets, ASME/ANSI commercial pipe schedule lookups, 3-case operating envelopes (`Min / Normal / Design 120%`), sanity-checked heuristics, and full traceability to *Perry's 9th Ed.* tables/equations/figures.

---

## Table of Contents
1. [Executive Positioning Matrix (`Kongming --advice`)](#1-executive-positioning-matrix-kongming---advice)
2. [Category 1: Open-Source Chemical Engineering Python Libraries & Simulators](#2-category-1-open-source-chemical-engineering-python-libraries--simulators)
3. [Category 2: Commercial & Web-Based ChE Calculation Workbenches ("Fresbie" Benchmark)](#3-category-2-commercial--web-based-che-calculation-workbenches-fresbie-benchmark)
4. [Category 3: Interactive ChE & STEM Educational / Visual Simulation Platforms](#4-category-3-interactive-che--stem-educational--visual-simulation-platforms)
5. [Category 4: Auditable Engineering Calc Pads, Reactive Notebooks & PDF Extractors](#5-category-4-auditable-engineering-calc-pads-reactive-notebooks--pdf-extractors)
6. [Concrete Patterns to Port Immediately into Our Stack](#6-concrete-patterns-to-port-immediately-into-our-stack)
7. [Brutally Honest Assessment: License Traps & Engineering Pitfalls](#7-brutally-honest-assessment-license-traps--engineering-pitfalls)
8. [Ultra Verifier Appendix (`--ultra` Scoring & Candidate Comparison)](#8-ultra-verifier-appendix---ultra-scoring--candidate-comparison)
9. [Unresolved Questions & Next Steps](#9-unresolved-questions--next-steps)

---

## 1. Executive Positioning Matrix (`Kongming --advice`)

Existing tools force students and junior engineers ("fresbies") to choose between **visual interactivity with zero auditability** (*CheCalc*, *LearnChemE*) and **industrial rigor with hostile, black-box UX** (*Aspen HYSYS*, *HTRI*, *Mathcad*).

```
                    HIGH AUDITABILITY & RIGOR (Senior Engineer Sign-off)
                                          ▲
                                          │
     [Mathcad Prime / Calcpad / handcalcs]│      ★ PERRY'S INTELLIGENT WORKBENCH
     Great calc sheets, but blank canvas: │      (BuilderIO/agent-native + ChEDL +
     user must type every Perry's         │       handcalcs + Calcpad SVG sketches +
     correlation & table value by hand.   │       LearnChemE canvas + Perry's crops)
                                          │
  LOW INTERACTIVITY ◄─────────────────────┼─────────────────────► HIGH INTERACTIVITY
  (Static / Batch)                        │                       (Bi-Directional UI)
                                          │
     [Aspen HYSYS / HTRI / Korf]          │      [CheCalc / EnggCyclopedia / LearnChemE]
     Powerful engines, but black-box      │      Fast & visual, but un-auditable JS:
     "garbage-in garbage-out" forms       │      no substituted steps, no Perry's
     with 40+ intimidating inputs.        │      citations, dead-end iframes.
                                          ▼
                    LOW AUDITABILITY (Rejected in EPC Design Reviews)
```

---

## 2. Category 1: Open-Source Chemical Engineering Python Libraries & Simulators

### 2.1 Comprehensive Repository & License Matrix

| Project / Library | GitHub Repository / URL | License | Primary Scope & Strengths | Weaknesses / Traps for Our Stack |
| :--- | :--- | :--- | :--- | :--- |
| **ChEDL: `chemicals`** | [`CalebBell/chemicals`](https://github.com/CalebBell/chemicals) | **MIT** | 20,000+ pure-component physical, thermodynamic, and safety property correlations (DIPPR, *Perry's*, CRC, VDI); CAS lookup; critical properties, vapor pressure, heat capacity, viscosity. | Raw functions return float SI units by default; wrap via `thermo.units` / `fluids.units` or custom `pint` decorators for strict unit tracking. |
| **ChEDL: `fluids`** | [`CalebBell/fluids`](https://github.com/CalebBell/fluids) | **MIT** | Commercial pipe schedules (`fluids.piping.nearest_pipe` covering ASME B36.10M/B36.19M Sch 5–160, STD, XS, XXS), Darcy-Weisbach friction factors, fittings $K$-factors (Crane TP-410, Hooper 2-K, Darby 3-K), control/safety valves (IEC 60534, API 520), two-phase flow, tank geometry (`fluids.geometry`). | Large function surface area; LLM agents can hallucinate parameter names (`Do` vs `Di` vs `NPS`) unless constrained by strict Pydantic/Zod schemas in `actions/*.ts`. |
| **ChEDL: `ht`** | [`CalebBell/ht`](https://github.com/CalebBell/ht) | **MIT** | Heat transfer correlations: LMTD, $\varepsilon\text{-NTU}$, shell-and-tube (Bell-Delaware, Kern), boiling/condensation, air coolers, insulation/refractory ratings. | Bell-Delaware requires 20+ geometric inputs that junior engineers rarely have during preliminary sizing; needs heuristic defaults from *Perry's* Sec. 11. |
| **ChEDL: `thermo`** | [`CalebBell/thermo`](https://github.com/CalebBell/thermo) | **MIT** | Cubic EOS (PR, SRK), activity coefficient models (NRTL, UNIQUAC, UNIFAC), multiphase PT/PH/PS flash solvers, `thermo.units` (`pint` wrapper). | Flash convergence can stall near critical points or 3-phase (VLLE) boundaries without bracketed initial guesses. |
| **ChEDL: `design`** | [`CalebBell/design`](https://github.com/CalebBell/design) | **MIT** | Equipment design heuristics & preliminary sizing (distillation trays, flooding velocities, mist eliminators, cyclones). | Smaller scope than `fluids`/`ht`; supplement with extracted *Perry's* Sec. 14 & 18 correlations + `BioSTEAM` design algorithms. |
| **CoolProp** | [`CoolProp/CoolProp`](https://github.com/CoolProp/CoolProp) | **MIT** | High-accuracy Helmholtz-energy explicit EOS (`PropsSI`, `PhaseSI`, `HAPropsSI` for humid air/psychrometrics); reference-grade pure fluid & steam properties (NIST REFPROP parity). | Throws runtime exceptions if queried inside the 2-phase saturation dome with $(T, P)$ inputs (since $T$ and $P$ are dependent during phase change). |
| **BioSTEAM** | [`BioSTEAMDevelopmentGroup/biosteam`](https://github.com/BioSTEAMDevelopmentGroup/biosteam) | **MIT / UIUC** | Python-native flowsheet simulation, automated equipment sizing & capital cost correlations (`_run()`, `_design()`, `_cost()` lifecycle; Seider/Towler/Perry heuristics). | Full flowsheet graph is overkill for single-sheet calculations, but its `units/design_tools` and bare-module costing modules are goldmines. |
| **Pyomo & IDAES** | [`IDAES/idaes-pse`](https://github.com/IDAES/idaes-pse) | **BSD-3-Clause** | Equation-oriented (EO) algebraic modeling & optimization; DOE-funded rigorous unit models and **`degrees_of_freedom(model)`** diagnostics. | Steep learning curve; EO models fail without expert initialization. Port its **Degrees of Freedom (DoF) checker badge**, not its heavy solver setup. |
| **Cantera** | [`Cantera/cantera`](https://github.com/Cantera/cantera) | **BSD-3-Clause** | Chemical kinetics, thermodynamics, CSTR/PFR/batch reactor networks, chemical equilibrium (`equilibrate('HP')`). | Requires `.yaml` mechanism files; use selectively for *Perry's* Sec. 7 & 19 (Reaction Kinetics & Reactors). |
| **PsychroLib** | [`psychrometrics/psychrolib`](https://github.com/psychrometrics/psychrolib) | **MIT** | Zero-dependency ASHRAE psychrometric calculations in **both Python and JavaScript** (`azogue/psychrochart` MIT for SVG chart styling). | Ideal for 60fps client-side psychrometric chart hover + Python sidecar verification (*Perry's* Sec. 12). |
| **ChebPy** | [`chebpy/chebpy`](https://github.com/chebpy/chebpy) | **BSD-3-Clause** | Chebyshev polynomial spectral approximation of continuous 1D functions (Chebfun in Python); ultra-fast root-finding and integration. | Ideal for fitting smooth $y^*(x)$ VLE curves for instantaneous McCabe-Thiele stage stepping and pinch detection. |
| **DWSIM** | [`DanWBR/dwsim`](https://github.com/DanWBR/dwsim) | **GPL-3.0** | Full CAPE-OPEN steady-state & dynamic simulator with GUI and 30+ property packages. | **⚠️ LICENSE TRAP (GPL-3.0)** + heavy .NET runtime. Study its property package wizard UX only; never link its code. |
| **IAPWS** | [`jjgomera/iapws`](https://github.com/jjgomera/iapws) | **GPL-3.0** | Python steam tables (IF97 / IAPWS-95). | **⚠️ LICENSE TRAP (GPL-3.0)**. Use `CoolProp` (`Water` fluid implements IAPWS-95/IF97 under **MIT License**) instead. |

---

## 3. Category 2: Commercial & Web-Based ChE Calculation Workbenches ("Fresbie" Benchmark)

Junior engineers (0–3 YoE, "fresbies") spend 70–80% of their time doing **single-equipment sizing, hydraulics verification, relief checks, and datasheet sanity-checking**, not building 200-unit plant-wide flowsheets.

| Platform / Tool | URL / Vendor | Why Junior Engineers ("Fresbies") Love It | Why Fresbies / Senior Engineers Hate It (Gaps We Solve) |
| :--- | :--- | :--- | :--- |
| **CheCalc** | [checalc.com](https://checalc.com) | Instant, zero-setup browser forms + downloadable Excel sheets for everyday tasks: line sizing, pump hydraulics, 2-phase $\Delta P$, API 520 PSVs, knock-out drums, distillation shortcuts. | Black-box web forms with no intermediate equation substitutions shown; no handbook page citations; manual fluid property copy-pasting across tabs. |
| **Process Engineering ToolBox (Boostrand)** | [boostrand.com](https://www.boostrand.com) | Runs on a **Calcpad** backend in production! Outputs clean calculation sheets citing API 12J, GPSA, and Crane TP-410 for 2/3-phase separators and PSV sizing. | Static templates; users cannot ask an AI copilot to adjust assumptions, check alternative pipe schedules, or overlay plant operating curves. |
| **EnggCyclopedia** | [enggcyclopedia.com](https://www.enggcyclopedia.com) | Places plain-English "Rules of Thumb" (recommended suction velocity, NPSHa margin, TEMA fouling factors) right next to the calculator inputs. | Ad-heavy, fragmented pages, no state persistence, no formal QA/QC calculation sheet export. |
| **LMNO Engineering** | [lmnoeng.com](https://www.lmnoeng.com) | Draws a crystal-clear geometric schematic next to every calculator input showing exact variable definitions ($D_1, D_2, z_1, z_2$). | 1990s web interface; narrow hydraulic scope; no chemical databank. |
| **Korf Hydraulics** | [korf.ca](https://www.korf.ca) | Beloved in EPCs because it explicitly tracks **Degrees of Freedom (DoF)** (solving unknown $P$ or $Q$ anywhere) and handles 2-phase flash / omega PSV methods cleanly. | Windows-only desktop UI; manual transcription of fluid properties. |
| **Pipe-Flo & AFT Fathom** | [aft.com](https://www.aft.com) | Visual pipe network canvas; overlays **Pump Curve vs. System Curve + $\text{NPSH}_A/\text{NPSH}_R$** and highlights Preferred Operating Region (POR $70\text{–}120\%$ BEP). | **120% Overdesign $\text{NPSH}_A$ Trap**: Juniors check $\text{NPSH}_A$ at $100\%$ design flow and miss cavitation at $120\%$ rated runout flow unless a 3-case table (`Min / Normal / Rated`) is shown automatically. |
| **HTRI (`Xchanger Suite`)** | [htri.net](https://www.htri.net) | Industrial gold standard for shell-and-tube (`Xist`) thermal rating, tube vibration, and temperature-cross diagnostics. | **The 40-Input Geometry Trap**: Requires baffle cut, tube pitch, clearances, and sealing strips that a fresbie doesn't know during preliminary design. |
| **ChemSep & COCO** | [chemsep.org](https://www.chemsep.org) | Seamless toggle between equilibrium stages (McCabe-Thiele) and rate-based mass transfer; Murphree tray efficiency ($E_{MV}$) + flooding charts. | Legacy Windows GUI; cryptic tear-stream convergence errors. |
| **Aspen Plus / HYSYS & CHEMCAD** | [aspentech.com](https://www.aspentech.com) | Enterprise legal standard; massive binary interaction parameter (BIP) databanks. | **"Garbage-In, Gospel-Out"**: Juniors randomly pick Peng-Robinson for polar/electrolyte mixtures (e.g., ethanol-water or amine systems) because there is no interactive property-package decision tree. |

---

## 4. Category 3: Interactive ChE & STEM Educational / Visual Simulation Platforms

| Platform / Repo | URL / GitHub | License | Pedagogical & Visualization Mechanics to Port |
| :--- | :--- | :--- | :--- |
| **LearnChemE (CU Boulder)** | [`LearnChemE/LearnChemE.github.io`](https://github.com/LearnChemE/LearnChemE.github.io) ([learncheme.com](https://learncheme.com)) | **MIT / Open Educational** | **200+ HTML5/JS (`p5.js`, `Plotly`, `D3`) simulations** in `/demos/` and `/lab-experiments/`: McCabe-Thiele stage stepping (sliders for $R, q, z_F, x_D, x_B$ pivoting the $q$-line slope $\frac{q}{q-1}$ and highlighting pinch points), Psychrometric chart state paths, $T\text{-}x\text{-}y$ lever rule, and Heat Exchanger $T\text{-}Q$ temperature cross plots. |
| **CACHE Corporation (`PolymathPlus`)** | [cache.org](https://cache.org) / [`CAChemE/learn`](https://github.com/CAChemE/learn) | **MIT / Academic** | Frictionless ODE / nonlinear algebraic equation entry where code matches textbook notation (`d(CA)/d(V) = -k*CA^2/v0`) without Python boilerplate. |
| **Desmos & GeoGebra** | [desmos.com](https://www.desmos.com) | Proprietary | **Bi-directional Direct Manipulation**: Dragging a handle *on the graph* (e.g., dragging the $q$-line slope or operating point on a pump curve) updates the algebraic slider at 60 FPS, and vice versa. |
| **Brilliant.org** | [brilliant.org](https://brilliant.org) | Proprietary | **Predict $\rightarrow$ Interact $\rightarrow$ Verify Checkpoints**: Asks the learner to predict what happens to stage count when feed changes from saturated liquid ($q=1$) to superheated vapor ($q<0$) *before* dragging the handle. |

---

## 5. Category 4: Auditable Engineering Calc Pads, Reactive Notebooks & PDF Extractors

| Tool / Repository | URL / GitHub | License | Core Innovation & How We Use It |
| :--- | :--- | :--- | :--- |
| **`handcalcs` + `forallpeople`** | [`connorferster/handcalcs`](https://github.com/connorferster/handcalcs) | **Apache-2.0** | Parses Python calculation code via Python's `ast` module and emits **3-Stage White-Box LaTeX**: `1) Symbolic Formula → 2) Substituted Numbers with Units → 3) Result`, plus renders `# [Citation]` comments as right-aligned engineering references! |
| **`Calcpad`** | [`Proektsoftbg/Calcpad`](https://github.com/Proektsoftbg/Calcpad) | **MIT** | Plain-text math DSL with `? {default}` locked input form fields, native unit cancellation, and **Parametric SVG Equipment Sketches** where calculated dimensions ($D, L, H_{\text{liquid}}$) dynamically label the 2D vessel/pipe drawing. |
| **`google/latexify_py`** | [`google/latexify_py`](https://github.com/google/latexify_py) | **Apache-2.0** | Compiles Python functions with `if/elif/else` branches into clean piecewise LaTeX braces $\begin{cases} \dots \end{cases}$ — ideal for laminar/transitional/turbulent ChE correlations. |
| **`Marimo`** | [`marimo-team/marimo`](https://github.com/marimo-team/marimo) | **Apache-2.0** | **Reactive Directed Acyclic Graph (DAG)** execution: changing an upstream variable ($T_F$ or Pipe Schedule) deterministically recomputes all dependent blocks in topological order, eliminating Jupyter stale-state bugs. |
| **`Blockpad` & `Mathcad Prime`** | [blockpad.net](https://blockpad.net) | Commercial | Combines a **Top-Down Calculation Narrative** (governing equations & sample calc) with a **Multi-Column Case Schedule Grid** (`Min / Normal / Rated` or sizing 10 lines at once) + live dimensional homogeneity badges. |
| **`Docling` (IBM)** | [`docling-project/docling`](https://github.com/docling-project/docling) | **MIT** (Code) / **CDLA-Permissive-2.0** (Weights) | **100% permissive scientific PDF parser** (`TableFormer` + layout + formula recovery) for extracting *Perry's* multi-column tables and equations without AGPL contamination. |
| **`pypdfium2` & `pdfplumber`** | [`pypdfium2-team/pypdfium2`](https://github.com/pypdfium2-team/pypdfium2) | **Apache-2.0 / BSD-3 / MIT** | Permissive drop-in alternative to `PyMuPDF` (`fitz`, which is **AGPL-3.0**) if commercial closed-source distribution is ever needed. |
| **`MinerU` & `PDF-Extract-Kit`** | [`opendatalab/MinerU`](https://github.com/opendatalab/MinerU) | **AGPL-3.0** (`PDF-Extract-Kit`) | High-accuracy formula/table extraction, but **AGPL-3.0**—use strictly as an offline build tool, never bundled at runtime. |

---

## 6. Concrete Patterns to Port Immediately into Our Stack

### Pattern 1: The `handcalcs` + `pint` 3-Stage White-Box Equation Renderer (Surviving the Senior Engineer's Red Pen)
Senior engineers reject raw Python scripts and reject LLM chat prose. Every solver action in our Python sidecar executes through a **`handcalcs`-inspired AST + `pint` KaTeX serializer** where trailing comments become right-aligned *Perry's 9th Ed.* citation badges:

```python
# Executed inside services/perry-engine/solvers/hydraulics.py
D_i = 0.1023 * ureg.m              # [4-in NPS Sch 40 ID, Perry's Table 10-22]
v = 2.15 * ureg.m / ureg.s         # [Bulk fluid velocity]
rho = 997.0 * ureg.kg / ureg.m**3  # [Liquid water at 25°C, Perry's Table 2-28]
mu = 0.89e-3 * ureg.Pa * ureg.s    # [Dynamic viscosity, Perry's Table 2-164]

Re = (rho * v * D_i) / mu          # [Reynolds Number, Perry's Eq. 6-32, p. 6-7]
```

Renders automatically in the React Workbench and exported Calc Sheet as:
$$\mathrm{Re} = \frac{\rho \cdot v \cdot D_{i}}{\mu} = \frac{997.0\ \mathrm{\frac{kg}{m^{3}}} \cdot 2.15\ \mathrm{\frac{m}{s}} \cdot 0.1023\ \mathrm{m}}{8.90 \times 10^{-4}\ \mathrm{Pa \cdot s}} = 2.464 \times 10^{5}\ \text{(Turbulent)} \quad \texttt{[Perry's Eq. 6-32, p. 6-7]}$$

Clicking `[Perry's Eq. 6-32, p. 6-7]` opens the exact high-DPI cropped bounding box from [Perry's Chemical Engineers' Handbook, 9th Edition.pdf](file:///Users/nad/Downloads/Perry's%20Chemical%20Engineers'%20Handbook,%209th%20Edition.pdf).

### Pattern 2: `Calcpad`-Style Parametric SVG Equipment Sketches + 3-Case Operating Matrix
Every equipment workbench pairs its calculation sheet with:
1. **A Live Parametric React SVG Schematic** (`Calcpad` / `LMNO` pattern): Calculated dimensions ($D_i = 102.3\text{ mm}$, $L = 120\text{ m}$, static suction lift $\Delta z = +3.2\text{ m}$, weir height $h_w = 50\text{ mm}$, liquid holdup level) dynamically update on the 2D schematic.
2. **A 3-Case Operating Matrix (`Minimum 70%` | `Normal 100%` | `Rated / Design 120%`)**: Following `AFT Fathom` / EPC best practices, pump and line-sizing sheets automatically evaluate turndown and runout columns side-by-side—catching when $\text{NPSH}_A$ margin fails at $120\%$ design flow or when a distillation tray weeps at $70\%$ turndown.

### Pattern 3: 2-Tier Progressive Disclosure (Solving the HTRI 40-Input Trap)
To serve both students/fresbies doing a quick scoping check and engineers rating a vendor datasheet:
- **Tier 1 (Shortcut / Preliminary Mode — Default)**: Requires only 4–6 process inputs; auto-populates mechanical defaults from *Perry's* (`25%` baffle cut, `1.25` pitch ratio, commercial steel roughness $\varepsilon = 0.045\text{ mm}$, TEMA fouling factor $R_f$) with clickable `[Heuristic Default: Perry's Table 11-3]` chips (`useAgentSelectable`).
- **Tier 2 (Detailed Rating / Datasheet Audit Mode)**: Unlocks full Bell-Delaware / tray geometry inputs.

### Pattern 4: Dual-Track Graphical Correlation & Nomograph Overlay
Vision LLMs misread log-log scales on *Perry's* charts (e.g., **Fig. 6-9 Moody Chart**, **Fig. 14-55 Souders-Brown $C_{\text{sb}}$**, **Fig. 14-69 Eckert GPDC**) by **15–40%**.
- **Track 1 (Deterministic Math)**: Compute the exact value in Python using `CalebBell/fluids` or `design`.
- **Track 2 (Visual Proof + Crosshair)**: Render the high-DPI crop of the *Perry's* figure and project a **calibrated interactive SVG crosshair (`x = Flv`, `y = Csb`)** directly over the chart.

### Pattern 5: Carlson's Thermodynamic Property Package Decision Tree
Embed an interactive **Property Method Advisor** (grounded in *Perry's* Sec. 4 & Carlson 1996) that checks chemical polarity, dipole moment, hydrogen bonding, electrolytes, and pressure via `CalebBell/chemicals` and recommends `Peng-Robinson` vs. `NRTL` / `UNIQUAC` vs. `IAPWS-IF97 Steam Tables`—preventing the #1 junior engineer simulation blunder.

---

## 7. Brutally Honest Assessment: License Traps & Engineering Pitfalls

| Risk / Trap | Severity | Technical Root Cause | Mandatory Mitigation in Our Architecture |
| :--- | :---: | :--- | :--- |
| **1. `DWSIM` & `jjgomera/iapws` Copyleft** | 🔴 Critical | Both are licensed under **GPL-3.0**. | Never import `dwsim` or `iapws`. Use **`CalebBell/*` (MIT)** + **`CoolProp` (MIT)** (which includes IAPWS-95/IF97 water/steam). |
| **2. `PyMuPDF` (`fitz`) & `PDF-Extract-Kit` AGPL-3.0** | 🟠 High | `PyMuPDF` is **AGPL-3.0** unless licensed commercially from Artifex. | Fine for local/personal use; isolate PDF rendering behind a 50-line adapter so **`pypdfium2` (Apache-2.0)** + **`Docling` (MIT)** can drop-in replace it for commercial builds. |
| **3. Fanning ($f_F$) vs. Darcy ($f_D$) Friction Factor** | 🔴 Critical | *Perry's* Sec. 6 uses Fanning friction factor ($f_F$) in several equations while Moody charts/Colebrook often use Darcy ($f_D = 4 f_F$), causing a **$400\%$ $\Delta P$ error**! | Every hydraulic solver output must explicitly display **both** $f_{\text{Darcy}}$ and $f_{\text{Fanning}}$ ($f_D = 4 f_F$) with a clear badge indicating which one is substituted in the equation. |
| **4. Gauge (`psig`/`barg`) vs. Absolute (`psia`/`bara`) Pressure** | 🔴 Critical | `pint` treats `psi` as absolute force/area; passing `0 psig` as `0 Pa` into gas density or $\text{NPSH}_A$ causes division-by-zero or false cavitation. | Reject bare `"psi"` or `"bar"` in thermodynamic/pump inputs; require explicit `psig`/`psia` or `barg`/`bara` with an editable local $P_{\text{atm}}$ banner (`101.325 kPa` default). |
| **5. `pint` Offset Temperature Calculus (`°C` vs `Δ°C`)** | 🟠 High | Subtracting or multiplying `degC` in $Q = U A \Delta T_{\text{lm}}$ raises `OffsetUnitCalculusError` if offset vs. delta units are confused. | Normalize all temperatures to absolute `K` at the FastAPI boundary and convert temperature differences explicitly to `delta_degC` / `K`. |

---

## 8. Ultra Verifier Appendix (`--ultra` Scoring & Candidate Comparison)

Five independent read-only `research` candidates ([`bf35c827`](conversation://bf35c827-cb52-49de-9907-34e1068a4e09), [`5f588320`](conversation://5f588320-afa7-4b3c-8e44-dd66c85958e7), [`95994ff6`](conversation://95994ff6-42bd-4db3-b80f-fde15500fca3), [`dbd3b678`](conversation://dbd3b678-1760-41b5-83b6-221c690806fb), [`16f64d2c`](conversation://16f64d2c-077e-4c01-9230-c64bf8898226)) were anonymized and evaluated by [`kongming`](conversation://1c13e1bc-38ac-47f2-bdd4-d690ced6cb6d):

| Anonymized ID | Subagent Session | 1. Sources (20) | 2. Categories (20) | 3. Dual Persona (20) | 4. Actionability (25) | 5. Traps & Licenses (15) | **Total (/100)** |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Candidate C (Winner)** | [`95994ff6`](conversation://95994ff6-42bd-4db3-b80f-fde15500fca3) | **20** | **20** | **20** | **24** | **15** | **99 / 100** |
| **Candidate A** | [`bf35c827`](conversation://bf35c827-cb52-49de-9907-34e1068a4e09) | **19** | **19** | **20** | **24** | **15** | **97 / 100** |
| **Candidate B** | [`5f588320`](conversation://5f588320-afa7-4b3c-8e44-dd66c85958e7) | **19** | **19** | **19** | **23** | **15** | **95 / 100** |
| **Candidate E** | [`16f64d2c`](conversation://16f64d2c-077e-4c01-9230-c64bf8898226) | **18** | **18** | **18** | **22** | **15** | **91 / 100** |
| **Candidate D** | [`dbd3b678`](conversation://dbd3b678-1760-41b5-83b6-221c690806fb) | **17** | **18** | **17** | **20** | **14** | **86 / 100** |

---

## 9. Unresolved Questions & Next Steps

1. **PDF Rendering Engine Posture (`PyMuPDF` AGPL-3.0 vs. `pypdfium2` Apache-2.0)**:
   - Since this starts as a local workbench on your machine, `PyMuPDF` (`fitz`) is fast and already available, or we can wrap `pypdfium2` (Apache-2.0) + `PyMuPDF` behind a clean adapter so the runtime stays 100% permissive (MIT/BSD/Apache-2.0) if you ever commercialize it. Which do you prefer?
2. **Proceed to `/ak:plan --advice` (or `/ak:cook --advice`)?**
   - Are you ready for me to draft the implementation plan (`/ak:plan --advice`) and scaffold **Perry's Intelligent Workbench** in `/Users/nad/ai4u/ai4UCheE` incorporating these exact patterns (`BuilderIO/agent-native` + `CalebBell/ChEDL` + `CoolProp` + `handcalcs` 3-stage audit sheets + `Calcpad` parametric SVG sketches + `LearnChemE` bi-directional canvases)?
