// Fogler & LeBlanc (2008) *Strategies for Creative Problem Solving, 2nd Ed.* 6-Stage Real-Life
// Problem-Solving & Woods's Troubleshooting Catalog across all 6 Workbenches (WB1..WB6).
import type { WorkbenchId } from '../actions/view-screen';

export interface TelemetryComparisonRow { metric: string; normalVal: string; faultyVal: string; deltaNote: string; }
export interface KepnerTregoeDefinition { perceivedProblem: string; realProblemDefined: string; whatIs: string; whatIsNot: string; whenObserved: string; }
export interface WorkingHypothesisItem { id: string; claim: string; isRootCause: boolean; fitsObservation: 'YES' | 'NO'; mathVerification: string; agentPrompt: string; }
export interface FoglerProblemSolvingCase {
  caseId: string; workbenchId: WorkbenchId; missionId: string; plantIncidentTitle: string;
  whyLearnSubject: string; subjectName: string; observationSummary: string;
  telemetryRows: readonly TelemetryComparisonRow[]; ktDefinition: KepnerTregoeDefinition;
  fundamentalTheory: { equationId: string; equationTitle: string; symbolicLatex: string; governingTermsNote: string; };
  applicableHandbook: { primaryCitation: string; crossBookAnchors: readonly string[]; chartOrTableRef: string; };
  hypotheses: readonly WorkingHypothesisItem[]; actualSolutionSummary: string; foglerBookCitation: string;
}

export const FOGLER_PROBLEM_CASES: Readonly<Record<WorkbenchId, FoglerProblemSolvingCase>> = {
  'wb1-visual-verifier': {
    caseId: 'case-wb1-fanning-audit', workbenchId: 'wb1-visual-verifier', missionId: 'mission-fanning-trap',
    plantIncidentTitle: 'Pipeline ΔP Audit Is 400% Higher Than Field Transmitters',
    whyLearnSubject: 'Why learn Handbook Charts & Friction Conventions? Mixing up Moody Darcy f_D and Perry Fanning f_F = f_D/4 oversizes plant pumps by 400%.',
    subjectName: 'Cross-Subject Charts & Page Verifier (WB1)',
    observationSummary: 'Commissioning loop at Re = 5×10⁴ measures 18 kPa pressure drop, but the junior calculation predicts 72 kPa (4× error).',
    telemetryRows: [{ metric: 'Chart Friction Factor', normalVal: 'f_F = 0.0045', faultyVal: 'Entry = 0.0180', deltaNote: '4.0× higher than Perry Fig. 6-9' }, { metric: 'Line Pressure Drop ΔP', normalVal: '18.0 kPa', faultyVal: '72.0 kPa', deltaNote: '+300% pump head over-prediction' }],
    ktDefinition: {
      perceivedProblem: 'New stainless pipe loop is severely fouled or blocked on day 1.',
      realProblemDefined: 'Reconcile the 4× friction factor convention difference between Moody (f_D) and Perry Fig. 6-9 (f_F).',
      whatIs: '4× discrepancy in calculated ΔP vs. field transmitter at Re = 5×10⁴.',
      whatIsNot: 'Physical pipe blockage or laminar flow (Re = 50,000 >> 2,100).',
      whenObserved: 'Immediately during pre-startup design audit [Fogler & LeBlanc 2nd Ed., Ch. 4, p. 64].',
    },
    fundamentalTheory: { equationId: 'eq-6-38-fanning-darcy', equationTitle: 'Darcy-Weisbach vs. Fanning Wall Shear Balance',
      symbolicLatex: 'f_D = 4 \\cdot f_F, \\quad \\Delta P = f_D \\frac{L}{D}\\frac{\\rho v^2}{2} = 4 f_F \\frac{L}{D}\\frac{\\rho v^2}{2}',
      governingTermsNote: 'Wall shear τ_w defines Fanning f_F, whereas head loss defines Darcy f_D = 4·f_F.', },
    applicableHandbook: { primaryCitation: "[Perry's 9th Ed., Fig. 6-9, p. 6-10 & Eqs. 6-37..6-39, p. 6-11]",
      crossBookAnchors: ['BSL Transport 2nd Ed., Ch. 6 (f_F definition)', 'Fogler & LeBlanc 2nd Ed., Ch. 3 (Confirm Key Findings, p. 43)'],
      chartOrTableRef: "Perry's Fig. 6-9 (p. 6-10) Fanning Friction Nomograph", },
    hypotheses: [
      { id: 'wb1-h1', claim: 'H1: Pipe wall roughness ε/D corroded 10× overnight.', isRootCause: false, fitsObservation: 'NO', mathVerification: 'DISPROVED ❌ — K-T When/Where: Clean smooth pipe; even rough pipe rarely quadruples f at Re=5×10⁴.', agentPrompt: 'Test H1 with AI Agent: Can pipe roughness explain an exact 4.0× ΔP jump on brand-new tubing?' },
      { id: 'wb1-h2', claim: 'H2: Moody Darcy f_D (0.018) was entered into a Fanning f_F (0.0045) slot.', isRootCause: true, fitsObservation: 'YES', mathVerification: 'PROVED ✅ — 0.0180 / 0.0045 = 4.000 exactly (f_D = 4·f_F).', agentPrompt: 'Verify H2 with AI Agent: Show why Perry Fig. 6-9 reads f_F = 0.0045 while Moody reads f_D = 0.018.' },
      { id: 'wb1-h3', claim: 'H3: Flow transitioned into laminar regime (f = 16/Re).', isRootCause: false, fitsObservation: 'NO', mathVerification: 'DISPROVED ❌ — At Re = 5×10⁴, laminar 16/Re = 0.00032, which does not fit 0.018.', agentPrompt: 'Test H3 with AI Agent: Does laminar flow fit Re = 50,000?' },
    ],
    actualSolutionSummary: 'Scrub chart reading from 0.0180 to true Fanning f_F = 0.0045 (≤5% tolerance) and apply f_D = 4·f_F.',
    foglerBookCitation: '[Fogler & LeBlanc 2nd Ed., Ch. 3 & Ch. 4, pp. 43, 64–68]',
  },
  'wb2-thermo-dippr': {
    caseId: 'case-wb2-boil-flash', workbenchId: 'wb2-thermo-dippr', missionId: 'mission-boil-water',
    plantIncidentTitle: 'Atmospheric Reboiler / Condenser Fails Boiling Spec & Decanter Phase-Split',
    whyLearnSubject: 'Why learn Thermodynamics (Subject 1)? Without vapor-pressure laws (DIPPR Eq. 101), psig→psia conversion, and activity models (NRTL vs. Wilson), you cannot predict boiling, vacuum flashing, or liquid-liquid phase splits!',
    subjectName: 'Subject 1 · Thermodynamics & Phase Equilibria (WB2)',
    observationSummary: 'Vessel is loaded with subcooled ethanol @ 298 K (P_sat = 7.9 kPa) instead of boiling water at 100 °C (101.325 kPa = 14.696 psia = 0.00 psig).',
    telemetryRows: [{ metric: 'Process Fluid & Temp', normalVal: 'Water @ 373.15 K (100°C)', faultyVal: 'Ethanol @ 298.0 K (25°C)', deltaNote: 'Subcooled by 75 K below water NBP' }, { metric: 'Saturation Vapor Pressure', normalVal: '101.33 kPa (14.70 psia / 0 psig)', faultyVal: '7.89 kPa (1.14 psia / -13.55 psig)', deltaNote: 'P_sat << 1 atm (no boiling)' }],
    ktDefinition: {
      perceivedProblem: 'Steam coil is broken because the vessel gauge reads 0 psig and liquid is not boiling.',
      realProblemDefined: 'Match absolute saturation pressure P_vp(T) = 101.325 kPa (14.696 psia = 0 psig) for Water at 373.15 K.',
      whatIs: 'Subcooled fluid (P_vp = 7.9 kPa) below atmospheric pressure (101.325 kPa) + gauge/absolute confusion.',
      whatIsNot: 'Heat-exchanger tube rupture or superheated vapor lock.',
      whenObserved: 'During atmospheric boiling & LLE solvent-selection check [Fogler & LeBlanc 2nd Ed., Ch. 4, p. 54].',
    },
    fundamentalTheory: { equationId: 'dippr-eq-101', equationTitle: 'DIPPR Eq. 101 Saturation Vapor Pressure & Pressure Datum',
      symbolicLatex: 'P_{\\mathrm{vp}}(T) = \\exp(C_1 + C_2/T + C_3 \\ln T + C_4 T^{C_5}), \\quad P_{\\mathrm{psia}} = P_{\\mathrm{psig}} + 14.696',
      governingTermsNote: 'A liquid boils when P_vp(T) reaches surrounding absolute pressure P_abs (14.696 psia at 0 psig).', },
    applicableHandbook: { primaryCitation: "[Perry's 9th Ed., Table 2-8 (DIPPR Eq. 101), p. 2-53 & Sec. 4, p. 4-18]",
      crossBookAnchors: ['Smith, Van Ness & Abbott 9th Ed., Ch. 10 & 12 (VLE / LLE)', 'Carlson (1996) Property Decision Tree (NRTL vs. Wilson)'],
      chartOrTableRef: "Perry's Table 2-8 (p. 2-53) & Fig. 4-18 Lee-Kesler Z⁰", },
    hypotheses: [
      { id: 'wb2-h1', claim: 'H1: At 0 psig gauge pressure, absolute pressure is zero so any liquid boils at 25°C.', isRootCause: false, fitsObservation: 'NO', mathVerification: 'DISPROVED ❌ — 0 psig = +14.696 psia (101.325 kPa); ignoring +14.696 psi violates absolute thermo.', agentPrompt: 'Test H1 with AI Agent: Why does 0 psig equal 14.696 psia in DIPPR Eq. 101?' },
      { id: 'wb2-h2', claim: 'H2: Vessel contains Ethanol at 298 K (P_sat = 7.9 kPa) instead of Water at 373.15 K (P_sat = 101.3 kPa).', isRootCause: true, fitsObservation: 'YES', mathVerification: 'PROVED ✅ — Water at T = 373.15 K (100°C) yields P_vp = 101,325 Pa = 14.696 psia (0.00 psig).', agentPrompt: 'Verify H2 with AI Agent: Evaluate DIPPR Eq. 101 for Water at 373.15 K.' },
      { id: 'wb2-h3', claim: 'H3: Use the Wilson equation to predict two-liquid-phase (LLE) decantation.', isRootCause: false, fitsObservation: 'NO', mathVerification: 'DISPROVED ❌ — Wilson d²G^E/dx₁² cannot change sign for LLE; NRTL or UNIQUAC is required.', agentPrompt: 'Test H3 with AI Agent: Why does Wilson mathematically fail for LLE?' },
    ],
    actualSolutionSummary: 'Select Water and scrub T to 373.15 K (100 °C) so P_sat = 101.3 kPa (14.70 psia = 0.00 psig), and use NRTL/UNIQUAC for LLE.',
    foglerBookCitation: '[Fogler & LeBlanc 2nd Ed., Ch. 4 Present/Desired State, pp. 54–58]',
  },
  'wb3-hydraulics': {
    caseId: 'case-wb3-pump-and-heater', workbenchId: 'wb3-hydraulics', missionId: 'mission-pump-npsha',
    plantIncidentTitle: 'Pump P-101 Rattling Like Gravel (Plus Boiler Feedwater Heater 70°C → 42°C Drop)',
    whyLearnSubject: 'Why learn Fluid Mechanics & Transport (Subject 2)? Without Bernoulli/NPSHa head balances, pipe friction, and HX Q = UAΔT_lm, pumps shatter from cavitation and heat exchangers starve boilers!',
    subjectName: 'Subject 2 · Fluid Mechanics, Transport & Piping Hydraulics (WB3)',
    observationSummary: 'Pump P-101 vibrates violently at 450 gpm with -10 psig suction (NPSHa = 4.18 m < NPSHr = 8.0 m), alongside Fogler Ch. 10 Boiler Feedwater exit drop (70°C → 42°C).',
    telemetryRows: [{ metric: 'P-101 Suction & Flow', normalVal: '+15 psig @ 260 gpm', faultyVal: '-10 psig @ 450 gpm', deltaNote: 'Vacuum suction + 3× line friction h_f' }, { metric: 'Suction Head Margin', normalVal: 'NPSHa 21.8 m ≥ NPSHr 3.0 m', faultyVal: 'NPSHa 4.18 m < NPSHr 8.0 m', deltaNote: 'Deficit -3.82 m (Active Cavitation!)' }],
    ktDefinition: {
      perceivedProblem: 'Pump P-101 bearings or impeller blades are mechanically defective from the factory.',
      realProblemDefined: 'Eliminate liquid flashing at the pump eye by restoring NPSHa ≥ NPSHr + 1.0 m [Perry p. 10-28].',
      whatIs: 'Gravel-like implosion noise at P-101 suction eye when P_suc = -10 psig (4.70 psia) and Q = 450 gpm.',
      whatIsNot: 'Downstream control valve mechanical failure or electrical motor overload.',
      whenObserved: '3 hours after high-flow vacuum draw startup [Fogler & LeBlanc 2nd Ed., Ch. 10, pp. 222–228].',
    },
    fundamentalTheory: { equationId: 'wb3-npsha', equationTitle: 'Net Positive Suction Head Available (NPSHa) & HX Energy Balance',
      symbolicLatex: '\\mathrm{NPSH}_a = \\frac{(P_{\\mathrm{psig}}+14.696)\\cdot 6894.76 - P_{\\mathrm{vp}}}{\\rho g} + z_s - h_{f,s} \\ge \\mathrm{NPSH}_r + 1.0\\text{ m}',
      governingTermsNote: 'NPSHa rises with absolute suction pressure P_suc,abs and static head z_s, and falls with flow friction h_f,s ∝ Q².', },
    applicableHandbook: { primaryCitation: "[Perry's 9th Ed., Sec. 10, pp. 10-24..28 & Sec. 8, p. 8-71]",
      crossBookAnchors: ['BSL Transport 2nd Ed., Ch. 6 & 14 (Friction & Heat Transfer)', 'Fogler & LeBlanc 2nd Ed., Ch. 10 (Boiler Feedwater Heater, pp. 222–228)'],
      chartOrTableRef: "Perry's Table 10-22 (ASME B36.10M Pipe) & Fig. 6-9", },
    hypotheses: [
      { id: 'wb3-h1', claim: 'H1: Downstream control valve ΔP is choked, starving the upstream pump eye.', isRootCause: false, fitsObservation: 'NO', mathVerification: 'DISPROVED ❌ — K-T Where: Throttling downstream reduces Q and h_f,s, which INCREASES NPSHa.', agentPrompt: 'Test H1 with AI Agent: Does a choked downstream control valve lower or raise upstream NPSHa?' },
      { id: 'wb3-h2', claim: 'H2: Vacuum suction (-10 psig = 4.70 psia) + high flow (450 gpm) drops NPSHa (4.18 m) below NPSHr (8.0 m).', isRootCause: true, fitsObservation: 'YES', mathVerification: 'PROVED ✅ — Raising P_suc to +15 psig and moderating Q to 260 gpm restores NPSHa = 21.8 m >> NPSHr.', agentPrompt: 'Verify H2 with AI Agent: Walk through the exact NPSHa math at -10 psig vs +15 psig.' },
      { id: 'wb3-h3', claim: 'H3: In the Boiler Feedwater HX (70°C→42°C in 3 hrs), hard mineral scale fouled the tubes.', isRootCause: false, fitsObservation: 'NO', mathVerification: 'DISPROVED ❌ — Fogler Ch. 10 p. 228: Scale takes weeks; a 3-hr drop is noncondensable gas blanketing or flooded steam trap.', agentPrompt: 'Test H3 with AI Agent: Why does Fogler & LeBlanc Ch. 10 (p. 228) reject tube fouling for a 3-hour temperature drop?' },
    ],
    actualSolutionSummary: 'Scrub P_suc to +15 psig, flow Q to 260 gpm, and NPSHr to 3 m so NPSHa = 21.8 m ≥ 5.0 m (Cavitation cleared!).',
    foglerBookCitation: '[Fogler & LeBlanc 2nd Ed., Ch. 10 Woods Worksheet & K-T Analysis, pp. 215–228]',
  },
  'wb4-distillation': {
    caseId: 'case-wb4-column-flood', workbenchId: 'wb4-distillation', missionId: 'mission-distillation',
    plantIncidentTitle: 'Distillation Column T-201 ΔP Spikes & Overhead Product Purity Crashes',
    whyLearnSubject: 'Why learn Separations (Subject 3)? Equilibrium stages (McCabe-Thiele / Fenske) tell you how many trays you need, but Column Hydraulics (Fair Flooding) tells you when vapor blasts liquid up the column!',
    subjectName: 'Subject 3 · Separation Processes & Column Hydraulics (WB4)',
    observationSummary: 'Operator boosted reflux ratio R/R_min to 1.9 in a narrow 0.55 m column; tray flooding hit ~200% of Fair limit.',
    telemetryRows: [{ metric: 'Reflux Multiplier & Diameter', normalVal: 'R/R_min = 1.30, D_c = 0.85 m', faultyVal: 'R/R_min = 1.90, D_c = 0.55 m', deltaNote: 'High internal vapor traffic in narrow shell' }, { metric: 'Fair Souders-Brown Flooding', normalVal: '64.0% of Flood (<85% safe)', faultyVal: '199.8% of Flood (>100% jet flood)', deltaNote: 'Liquid entrained into overhead condenser' }],
    ktDefinition: {
      perceivedProblem: 'More reflux always increases purity x_D, so we should increase R/R_min even further to 2.5.',
      realProblemDefined: 'Reduce superficial vapor velocity u_v below 85% of Fair entrainment flooding velocity u_flood.',
      whatIs: 'Severe entrainment flooding (~200% of Fair limit) due to excessive V_rect = (R+1)D in a 0.55 m shell.',
      whatIsNot: 'Loss of relative volatility α_AB (still 2.45) or pinched minimum reflux (R > R_min).',
      whenObserved: 'Immediately after operator increased reflux ratio R/R_min to 1.9 [Fogler & LeBlanc 2nd Ed., Ch. 4, p. 65].',
    },
    fundamentalTheory: { equationId: 'wb4-fenske-underwood', equationTitle: 'Fenske-Underwood Stage Stepping & Fair Souders-Brown Flooding',
      symbolicLatex: 'u_{\\mathrm{flood}} = C_{\\mathrm{sb}}\\,\\left(\\frac{\\sigma}{20}\\right)^{0.2}\\sqrt{\\frac{\\rho_L - \\rho_V}{\\rho_V}}, \\quad u_v = \\frac{4 V_{\\mathrm{rect}}}{\\pi D_c^2 \\rho_V} < 0.85\\,u_{\\mathrm{flood}}',
      governingTermsNote: 'Rectifying vapor flow V_rect = (R+1)D scales linearly with reflux R, while velocity u_v scales inversely with D_c².', },
    applicableHandbook: { primaryCitation: "[Perry's 9th Ed., Sec. 13, p. 13-36 & Fig. 14-32 (Fair C_sb), p. 14-37]",
      crossBookAnchors: ['Seader, Henley & Roper 4th Ed., Ch. 7 & 9', 'Smith, Van Ness & Abbott 9th Ed., Ch. 10'],
      chartOrTableRef: "Perry's Fig. 14-32 (p. 14-37) Fair Entrainment Flooding & Fig. 14-55 Eckert GPDC", },
    hypotheses: [
      { id: 'wb4-h1', claim: 'H1: Relative volatility α_AB collapsed to 1.0 (azeotrope pinch).', isRootCause: false, fitsObservation: 'NO', mathVerification: 'DISPROVED ❌ — α_AB = 2.45 is unchanged; an azeotrope does not cause column ΔP hydraulic flooding.', agentPrompt: 'Test H1 with AI Agent: Does an azeotrope pinch cause hydraulic tray flooding at α = 2.45?' },
      { id: 'wb4-h2', claim: 'H2: High reflux (R/R_min = 1.9) in a narrow 0.55 m shell drives vapor velocity u_v to ~200% of Fair flood.', isRootCause: true, fitsObservation: 'YES', mathVerification: 'PROVED ✅ — Lowering R/R_min to 1.3 and widening D_c to 0.85 m cuts u_v to 64% of Fair flood.', agentPrompt: 'Verify H2 with AI Agent: Show how R/R_min and D_c² govern Fair flooding % in Perry Fig. 14-32.' },
      { id: 'wb4-h3', claim: 'H3: Increasing R/R_min from 1.9 to 3.0 will dry up the trays and stop flooding.', isRootCause: false, fitsObservation: 'NO', mathVerification: 'DISPROVED ❌ — Raising R increases both L and V_rect = (R+1)D, making flooding even worse!', agentPrompt: 'Test H3 with AI Agent: What happens to vapor boilup V_rect when reflux ratio R is increased?' },
    ],
    actualSolutionSummary: 'Scrub R/R_min to 1.3 and Column Diameter D_c to 0.85 m so Fair flooding drops from ~200% to 64% (<85% safe).',
    foglerBookCitation: '[Fogler & LeBlanc 2nd Ed., Ch. 4 Duncker Diagram & Ch. 10, pp. 56, 216]',
  },
  'wb6-kinetics-reactors': {
    caseId: 'case-wb6-reactor-runaway', workbenchId: 'wb6-kinetics-reactors', missionId: 'mission-kinetics-runaway',
    plantIncidentTitle: 'Exothermic Reactor R-301 Jacket Temperature Spirals While Core Catalyst Stalls',
    whyLearnSubject: 'Why learn Kinetics & Reactor Design (Subject 4)? Without Levenspiel sizing, Thiele pore diffusion (φ), and Semenov heat-balance stability (ψ ≤ 1/e), reactors either starve inside pellets or suffer thermal runaway!',
    subjectName: 'Subject 4 · Kinetics, Catalysis & Chemical Reactor Design (WB6)',
    observationSummary: 'Reactor runs at Semenov ψ = 0.52 > 0.368 (runaway!) while oversized catalyst pellets (Thiele φ = 5.5) drop internal effectiveness to η = 45%.',
    telemetryRows: [{ metric: 'Semenov Thermal Number ψ', normalVal: 'ψ = 0.24 ≤ 0.368 (Stable)', faultyVal: 'ψ = 0.52 > 0.368 (Runaway!)', deltaNote: 'Heat generation G(T) exceeds removal R(T)' }, { metric: 'Thiele Modulus φ & η_cat', normalVal: 'φ = 1.10 → η = 92.7%', faultyVal: 'φ = 5.50 → η = 45.4%', deltaNote: '55% of catalyst interior is reactant-starved' }],
    ktDefinition: {
      perceivedProblem: 'Catalyst is chemically poisoned, so we should raise reactor temperature T to boost conversion.',
      realProblemDefined: 'Simultaneously satisfy Semenov thermal stability (ψ ≤ 1/e ≈ 0.368) and internal pellet effectiveness (φ ≤ 2.0, η ≥ 0.75).',
      whatIs: 'Dual thermal runaway hazard (ψ = 0.52) and internal pore-diffusion limitation (φ = 5.5).',
      whatIsNot: 'Irreversible chemical poisoning of active sites or equilibrium reverse reaction.',
      whenObserved: 'During high-conversion exothermic run with large catalyst pellets [Fogler & LeBlanc 2nd Ed., Ch. 10, p. 229].',
    },
    fundamentalTheory: { equationId: 'wb6-thiele-ergun', equationTitle: 'Fogler Levenspiel Sizing, Thiele Effectiveness η(φ) & Semenov Runaway ψ',
      symbolicLatex: '\\eta = \\frac{3}{\\phi^2}(\\phi \\coth \\phi - 1), \\quad \\psi = \\frac{(-\\Delta H_{\\mathrm{rxn}}) r_0 V E}{U A R T_c^2} \\le e^{-1} \\approx 0.368',
      governingTermsNote: 'Smaller pellet radius R_p lowers Thiele φ ∝ R_p (raising η → 1), while higher cooling UA lowers Semenov ψ ≤ 0.368.', },
    applicableHandbook: { primaryCitation: "[Fogler 7th Ed., Ch. 2, 5, 12 & 15; Crowl & Louvar 4th Ed., Ch. 8; Perry's Sec. 19, p. 19-40]",
      crossBookAnchors: ['BSL Transport 2nd Ed., Ch. 18 (Porous Catalyst Diffusion)', 'Fogler & LeBlanc 2nd Ed., Ch. 10 (U. Michigan CSTR/PFR Lab, p. 229)'],
      chartOrTableRef: "Perry's Fig. 15-10 Thiele η(φ) & Fig. 23-42 Semenov ψ_crit", },
    hypotheses: [
      { id: 'wb6-h1', claim: 'H1: Raise reactor temperature T by 40 K to overcome low catalyst activity.', isRootCause: false, fitsObservation: 'NO', mathVerification: 'DISPROVED ❌ — Raising T exponentially increases k(T), worsening both Thiele φ and Semenov runaway ψ > 0.368!', agentPrompt: 'Test H1 with AI Agent: Why does raising temperature T make both Thiele diffusion and Semenov runaway worse?' },
      { id: 'wb6-h2', claim: 'H2: Oversized pellets cause pore diffusion starvation (φ = 5.5) while insufficient cooling drives Semenov ψ = 0.52 > 0.368.', isRootCause: true, fitsObservation: 'YES', mathVerification: 'PROVED ✅ — Reducing φ to 1.1 restores η = 92.7%, and lowering ψ to 0.24 stabilizes heat removal.', agentPrompt: 'Verify H2 with AI Agent: Derive Thiele η at φ = 1.1 and Semenov stability at ψ = 0.24.' },
      { id: 'wb6-h3', claim: 'H3: Packed-bed Ergun pressure drop uses the exact same equation as open-pipe Fanning f_F.', isRootCause: false, fitsObservation: 'NO', mathVerification: 'DISPROVED ❌ — Ergun combines Blake-Kozeny (150/Re_p) + Burke-Plummer (1.75) across void fraction ε.', agentPrompt: 'Test H3 with AI Agent: Contrast packed-bed Ergun friction with open-pipe Fanning f_F.' },
    ],
    actualSolutionSummary: 'Scrub Thiele φ to 1.1 (η = 92.7%), Semenov ψ to 0.24 (≤0.368), and target conversion X to 0.80.',
    foglerBookCitation: '[Fogler & LeBlanc 2nd Ed., Ch. 10 Rule #12 & U. Michigan Reactor Lab, pp. 214, 229]',
  },
  'wb5-handbook-atlas': {
    caseId: 'case-wb5-atlas-synthesis', workbenchId: 'wb5-handbook-atlas', missionId: 'mission-fanning-trap',
    plantIncidentTitle: 'Multi-Unit Plant Turnaround: HX Temperature Cross (Sec 11) & Relief Sizing (Sec 23)',
    whyLearnSubject: 'Why learn the 6-Book & 25-Section Atlas (Subject 5)? Real plant troubleshooting spans heat transfer, relief safety, economics, and materials—requiring verified handbook lookups across all 25 Perry sections.',
    subjectName: 'Subject 5 · 6-Book & 25-Section ChE Atlas (WB5)',
    observationSummary: 'Shell-and-tube exchanger exhibits a temperature cross (Bowman F_T < 0.75) while downstream API 520 relief valve requires gauge-to-absolute (psig + 14.696) verification.',
    telemetryRows: [{ metric: 'Sec 11 LMTD Correction F_T', normalVal: 'F_T = 0.88 ≥ 0.75 (1-2 HX)', faultyVal: 'F_T = 0.62 < 0.75 (Cross Trap)', deltaNote: 'Requires 2-4 shell pass or lower R, P' }, { metric: 'Sec 23 API 520 Relief P_1', normalVal: '164.7 psia (150 psig + 14.696)', faultyVal: '150.0 psig used as psia', deltaNote: '9% relief orifice undersizing error' }],
    ktDefinition: {
      perceivedProblem: 'Add more surface area A to a 1-shell-pass exchanger operating in steep temperature cross.',
      realProblemDefined: 'Maintain Bowman F_T ≥ 0.75 (Sec 11) and convert psig → psia in API 520 relief sizing (Sec 23).',
      whatIs: 'Thermodynamic temperature cross on 1-2 HX + gauge pressure datum trap on relief valve.',
      whatIsNot: 'Fouled tube bundle or leaking relief valve spring.',
      whenObserved: 'During multi-book EPC plant design review [Fogler & LeBlanc 2nd Ed., Ch. 7, p. 145].',
    },
    fundamentalTheory: { equationId: 'atlas-sec-11', equationTitle: 'Bowman LMTD Correction Factor F_T (Sec 11) & API 520 Critical Flow (Sec 23)',
      symbolicLatex: 'Q = U A F_T \\Delta T_{\\mathrm{lm}}, \\quad F_T \\ge 0.75; \\quad P_1 = P_{\\mathrm{set,psig}} \\times 1.10 + 14.696\\text{ psia}',
      governingTermsNote: 'When F_T drops below 0.75, a 1-2 exchanger cannot economically overcome a temperature cross.', },
    applicableHandbook: { primaryCitation: "[Perry's 9th Ed., Sec. 11, Eq. 11-9, p. 11-6 & Sec. 23, Eq. 23-12, p. 23-32]",
      crossBookAnchors: ['Crowl & Louvar 4th Ed., Ch. 9 (Relief Sizing)', 'BSL Transport 2nd Ed., Ch. 14'],
      chartOrTableRef: "Perry's Sec 1–25 Atlas & Back-of-Book Index (pp. 2244–2274)", },
    hypotheses: [
      { id: 'wb5-h1', claim: 'H1: Doubling tube area A fixes a 1-2 heat exchanger where Bowman F_T has collapsed to 0.55.', isRootCause: false, fitsObservation: 'NO', mathVerification: 'DISPROVED ❌ — In the steep F_T cliff (<0.75), internal back-mixing transfers heat the wrong way; add shell passes instead.', agentPrompt: 'Test H1 with AI Agent: Why does Perry Sec 11 forbid 1-2 exchangers when Bowman F_T < 0.75?' },
      { id: 'wb5-h2', claim: 'H2: Switch to multi-shell passes (F_T ≥ 0.75) and convert relief set pressure via psia = psig + 14.696.', isRootCause: true, fitsObservation: 'YES', mathVerification: 'PROVED ✅ — Satisfies both Perry Sec 11 F_T ≥ 0.75 and Sec 23 API 520 absolute choking pressure.', agentPrompt: 'Verify H2 with AI Agent: Show the Sec 11 F_T and Sec 23 API 520 psia calculations.' },
    ],
    actualSolutionSummary: 'Keep Bowman F_T ≥ 0.75 in Sec 11 and always add 14.696 psi when converting psig to psia in Sec 23.',
    foglerBookCitation: '[Fogler & LeBlanc 2nd Ed., Ch. 7 Decision Analysis & Ch. 9 Safety, pp. 145, 203]',
  },
};

export function getFoglerCaseForWorkbench(wb: WorkbenchId): FoglerProblemSolvingCase {
  return FOGLER_PROBLEM_CASES[wb] ?? FOGLER_PROBLEM_CASES['wb1-visual-verifier'];
}
