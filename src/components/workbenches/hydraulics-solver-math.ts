// Pure WB3 solver math — extracted verbatim from hydraulics-workbench.tsx (shipped Swamee-Jain
// convention; do NOT swap for Churchill). Rigor: explicit psig→psia, Darcy f_D = 4·Fanning f_F.
// Citations: [Perry's 9th Ed., Fig. 6-9, p. 6-10; Eqs. 6-37..6-39, p. 6-11; Sec. 10, pp. 10-24..25].
import type { WhiteBoxStageEquation } from '../../actions/view-screen';

export const PIPE_D_INNER_M: Record<string, number> = {
  '2-40': 0.0525,
  '3-40': 0.07792,
  '4-40': 0.10226,
  '4-80': 0.09718,
  '6-40': 0.15406,
};

export interface HydraulicsInputs {
  flowGpm: number;
  npsInch: number;
  schedule: string;
  lengthM: number;
  pSuctionPsig: number;
  zSuctionM: number;
  npshrM: number;
  valveDpPsi: number;
}

export interface HydraulicsCase {
  qGpm: number;
  vel: number;
  re: number;
  fDarcy: number;
  fFanning: number;
  hfM: number;
  dpTotalKpa: number;
}

export interface HydraulicsMetrics {
  dInnerM: number;
  caseMin: HydraulicsCase;
  caseNorm: HydraulicsCase;
  caseRated: HydraulicsCase;
  pAbsPa: number;
  npshAvailableM: number;
  isCavitating: boolean;
  cvNormal: number;
  isChoked: boolean;
  dpMaxPsi: number;
}

const PSIA_PER_PSIG = 14.6959;
const PA_PER_PSIA = 6894.757;
const P_VAP_WATER_PA = 3169.0; // water vapor pressure at ~25 °C suction datum (shipped constant)
const HF_SUCTION_M = 0.8; // shipped fixed suction-line friction loss
const RHO_G = 998.2 * 9.80665;

export function solveHydraulics(
  inputs: HydraulicsInputs,
): HydraulicsMetrics & { equations: WhiteBoxStageEquation[] } {
  const dInnerM = PIPE_D_INNER_M[`${inputs.npsInch}-${inputs.schedule}`] ?? 0.10226;
  const computeCase = (mult: number): HydraulicsCase => {
    const qGpm = inputs.flowGpm * mult;
    const qM3s = qGpm * 6.30902e-5;
    const area = (Math.PI * dInnerM * dInnerM) / 4;
    const vel = qM3s / area;
    const re = (998.2 * vel * dInnerM) / 0.001;
    const fDarcy = 0.25 / Math.pow(Math.log10(0.000045 / (3.7 * dInnerM) + 5.74 / Math.pow(Math.max(re, 2100), 0.9)), 2);
    const fFanning = fDarcy / 4.0;
    const hfM = (fDarcy * (inputs.lengthM / dInnerM) + 4.5) * ((vel * vel) / (2 * 9.80665));
    const dpTotalKpa = (998.2 * 9.80665 * (hfM + 5.0)) / 1000.0;
    return { qGpm, vel, re, fDarcy, fFanning, hfM, dpTotalKpa };
  };
  const caseMin = computeCase(0.7);
  const caseNorm = computeCase(1.0);
  const caseRated = computeCase(1.2);
  const pAbsPa = (inputs.pSuctionPsig + PSIA_PER_PSIG) * PA_PER_PSIA;
  const npshAvailableM = (pAbsPa - P_VAP_WATER_PA) / RHO_G + inputs.zSuctionM - HF_SUCTION_M;
  const isCavitating = npshAvailableM < inputs.npshrM;
  const ff = 0.96 - 0.28 * Math.sqrt(P_VAP_WATER_PA / 22064000.0);
  const dpMaxPsi = 0.81 * (65 + PSIA_PER_PSIG - ff * 0.46);
  const isChoked = inputs.valveDpPsi >= dpMaxPsi;
  const cvNormal = inputs.flowGpm / Math.sqrt(Math.max(Math.min(inputs.valveDpPsi, dpMaxPsi), 0.1));
  const equations: WhiteBoxStageEquation[] = [
    {
      id: 'wb3-psig-psia',
      title: 'Gauge → Absolute Suction Pressure',
      citation: "[Perry's 9th Ed., Sec. 1 — Unit Conversion Factors and Symbols]",
      symbolicLatex: 'P_{\\mathrm{abs}} = P_{\\mathrm{psig}} + 14.696\\ \\mathrm{psia}',
      substitutedLatex: `P_{\\mathrm{abs}} = ${inputs.pSuctionPsig.toFixed(2)} + 14.696 = ${(pAbsPa / PA_PER_PSIA).toFixed(2)}\\ \\mathrm{psia}`,
      resultLatex: `P_{\\mathrm{abs}} = ${(pAbsPa / 1000).toFixed(1)}\\ \\mathrm{kPa}`,
      plainExplanation: 'Plant gauges read psig (relative to atmosphere); pump curves and NPSH need absolute pressure, so always add 14.696 psi first.',
    },
    {
      id: 'wb3-darcy-fanning-fd',
      title: 'Swamee-Jain Darcy Friction Factor (f_D = 4·f_F)',
      citation: "[Perry's 9th Ed., Fig. 6-9, p. 6-10; Eqs. 6-37..6-39, p. 6-11]",
      symbolicLatex: 'f_D = \\frac{0.25}{\\left[\\log_{10}\\!\\left(\\frac{\\varepsilon}{3.7D} + \\frac{5.74}{Re^{0.9}}\\right)\\right]^{2}}, \\quad f_D = 4 f_F',
      substitutedLatex: `Re = ${caseNorm.re.toExponential(2)}, \\ \\frac{\\varepsilon}{D} = ${(0.000045 / dInnerM).toExponential(1)}`,
      resultLatex: `f_F = ${caseNorm.fFanning.toFixed(5)}, \\quad f_D = ${caseNorm.fDarcy.toFixed(5)}`,
      plainExplanation: 'Perry Fig. 6-9 plots the Fanning factor; head loss h_f = f_D (L/D) v²/(2g) needs the Darcy factor — mixing them skews ΔP by 4×.',
    },
    {
      id: 'wb3-npsha',
      title: 'Available NPSH vs. Required NPSHr',
      citation: "[Perry's 9th Ed., Sec. 10, pp. 10-24..25 (unnumbered NPSH equations)]",
      symbolicLatex: '\\mathrm{NPSH}_A = \\frac{P_{\\mathrm{abs}} - P_{\\mathrm{vap}}}{\\rho g} + z_s - h_{f,s} \\ge \\mathrm{NPSH}_r',
      substitutedLatex: `\\frac{${(pAbsPa / 1000).toFixed(1)} - 3.17\\ \\mathrm{kPa}}{9.79\\ \\mathrm{kN/m^3}} + ${inputs.zSuctionM.toFixed(1)} - ${HF_SUCTION_M.toFixed(1)}\\ \\mathrm{m}`,
      resultLatex: `\\mathrm{NPSH}_A = ${npshAvailableM.toFixed(2)}\\ \\mathrm{m} \\;${isCavitating ? '<' : '\\ge'}\\; \\mathrm{NPSH}_r = ${inputs.npshrM.toFixed(1)}\\ \\mathrm{m}`,
      plainExplanation: 'If available NPSH drops below the pump requirement, liquid flashes to vapor at the impeller eye and collapses violently — cavitation.',
      warningText: isCavitating
        ? `CAVITATION: NPSH_A ${npshAvailableM.toFixed(2)} m < NPSH_r ${inputs.npshrM.toFixed(1)} m — raise suction pressure, lower flow, or increase static head.`
        : undefined,
    },
  ];
  return { dInnerM, caseMin, caseNorm, caseRated, pAbsPa, npshAvailableM, isCavitating, cvNormal, isChoked, dpMaxPsi, equations };
}
