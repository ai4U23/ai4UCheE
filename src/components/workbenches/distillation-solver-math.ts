// Pure WB4 solver math — extracted verbatim from distillation-workbench.tsx (Fenske-Underwood
// pinch shortcuts + Fair Souders-Brown entrainment flooding + Eckert packing ΔP).
// Citations: [Perry's 9th Ed., Sec. 13, p. 13-36; Fig. 14-32, p. 14-37; Table 14-13, p. 14-58].
import type { WhiteBoxStageEquation } from '../../actions/view-screen';

export interface DistillationInputs {
  alpha: number;
  xf: number;
  xd: number;
  xb: number;
  q: number;
  rMult: number;
  traySpacingM: number;
  colDiamM: number;
}

export interface DistillationMetrics {
  yPinch: number;
  rMin: number;
  rOp: number;
  nMin: number;
  totalStages: number;
  feedStage: number;
  distillateKmolHr: number;
  vRectKmolHr: number;
  lRectKmolHr: number;
  fLv: number;
  cSbMs: number;
  uFloodMs: number;
  uActualMs: number;
  floodPercent: number;
  isFlooding: boolean;
  dpPackingMmH2oM: number;
}

export function solveDistillation(
  inputs: DistillationInputs,
): DistillationMetrics & { equations: WhiteBoxStageEquation[] } {
  const yPinch = (inputs.alpha * inputs.xf) / (1 + (inputs.alpha - 1) * inputs.xf);
  const rMin = Math.max((inputs.xd - yPinch) / Math.max(yPinch - inputs.xf, 0.02), 0.1);
  const rOp = inputs.rMult * rMin;
  const nMin = Math.log((inputs.xd * (1 - inputs.xb)) / Math.max(inputs.xb * (1 - inputs.xd), 1e-6)) / Math.log(Math.max(inputs.alpha, 1.05));
  const totalStages = Math.max(Math.round(nMin * 2.1), 6);
  const feedStage = Math.max(Math.round(totalStages * 0.5), 2);
  const distillateKmolHr = 100 * ((inputs.xf - inputs.xb) / Math.max(inputs.xd - inputs.xb, 0.05));
  const vRectKmolHr = (rOp + 1) * distillateKmolHr;
  const lRectKmolHr = rOp * distillateKmolHr;
  const fLv = (lRectKmolHr / Math.max(vRectKmolHr, 1)) * Math.sqrt(2.85 / 815.0);
  const cSbMs = (0.0105 + 0.1496 * Math.pow(inputs.traySpacingM, 0.755)) * Math.pow(10, -0.14 * Math.log10(Math.max(fLv, 0.02)));
  const uFloodMs = cSbMs * Math.pow(21.0 / 20.0, 0.2) * Math.sqrt((815 - 2.85) / 2.85);
  const qVaporM3s = (vRectKmolHr * 82.0) / 3600 / 2.85;
  const aNet = ((Math.PI * inputs.colDiamM * inputs.colDiamM) / 4) * 0.88;
  const uActualMs = qVaporM3s / Math.max(aNet, 0.05);
  const floodPercent = (uActualMs / Math.max(uFloodMs, 0.05)) * 100;
  const dpPackingMmH2oM = 42.0 * Math.pow(uActualMs / 1.1, 1.85);
  const isFlooding = floodPercent >= 85;
  const equations: WhiteBoxStageEquation[] = [
    {
      id: 'wb4-fenske-underwood',
      title: 'Fenske N_min & Operating Reflux (R = R/R_min · R_min)',
      citation: "[Perry's 9th Ed., Sec. 13, p. 13-36]",
      symbolicLatex: 'N_{\\min} = \\frac{\\ln\\!\\left[\\frac{x_D}{1-x_D}\\cdot\\frac{1-x_B}{x_B}\\right]}{\\ln \\alpha_{AB}}, \\quad R = \\left(\\frac{R}{R_{\\min}}\\right) R_{\\min}',
      substitutedLatex: `\\alpha = ${inputs.alpha.toFixed(2)}, \\; x_D = ${inputs.xd.toFixed(2)}, \\; x_B = ${inputs.xb.toFixed(3)}, \\; R/R_{\\min} = ${inputs.rMult.toFixed(2)}`,
      resultLatex: `N_{\\min} = ${nMin.toFixed(2)}, \\quad R_{\\min} = ${rMin.toFixed(3)}, \\quad R = ${rOp.toFixed(3)}`,
      plainExplanation: 'Fenske counts the minimum stages at total reflux; operating at 1.2–1.5 × R_min buys feasibility without boiling up excessive vapor.',
    },
    {
      id: 'wb4-fair-flooding',
      title: "Fair's Entrainment Flooding (Souders-Brown)",
      citation: "[Perry's 9th Ed., Fig. 14-32, p. 14-37]",
      symbolicLatex: 'C_{SB} = f(h_T, F_{LV}), \\quad u_{flood} = C_{SB}\\sqrt{\\frac{\\rho_L - \\rho_V}{\\rho_V}}, \\quad \\%flood = \\frac{u_{actual}}{u_{flood}} \\times 100',
      substitutedLatex: `F_{LV} = ${fLv.toFixed(3)}, \\; D_c = ${inputs.colDiamM.toFixed(2)}\\ \\mathrm{m}, \\; V = ${vRectKmolHr.toFixed(0)}\\ \\mathrm{kmol/h}`,
      resultLatex: `\\%flood = ${floodPercent.toFixed(1)}\\% \\;${isFlooding ? '\\ge 85\\% \\Rightarrow \\text{FLOODING}' : '< 85\\% \\Rightarrow \\text{OK}'}`,
      plainExplanation: 'Operating above ~85% of the entrainment flood velocity blows liquid up into the tray above and collapses separation efficiency.',
      warningText: isFlooding
        ? `FLOODING at ${floodPercent.toFixed(1)}% — increase column diameter or cut reflux/vapor load.`
        : undefined,
    },
  ];
  return { yPinch, rMin, rOp, nMin, totalStages, feedStage, distillateKmolHr, vRectKmolHr, lRectKmolHr, fLv, cSbMs, uFloodMs, uActualMs, floodPercent, isFlooding, dpPackingMmH2oM, equations };
}
