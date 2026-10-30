// Pure TypeScript Kinetics, Catalysis & Reactor Design Solver (Subject 5 / WB6).
// Blends Fogler 7th Ed. (Ch. 1–18), Perry's 9th Ed. (Sec. 7 & 19),
// Bird-Stewart-Lightfoot 2nd Ed. (Ch. 6 & 18), and Crowl & Louvar 4th Ed. (Ch. 8).
import type { WhiteBoxStageEquation } from '../../actions/view-screen';
import { clampDomainValue, type ViewBoxRect } from '../../lib/svg-drag-math';

export interface KineticsReactorInputs {
  conversionX: number; // [0.05, 0.96]
  tempK: number; // [300, 750] K
  pInletPsig: number; // [-10, 500] psig -> converted to psia = psig + 14.696
  epsilonA: number; // [-0.5, 1.5] gas-phase molar expansion factor
  alphaErgun: number; // [0.0, 0.04] PBR Ergun pressure-drop parameter
  thielePhi: number; // [0.1, 15.0] spherical catalyst Thiele modulus
  semenovPsi: number; // [0.05, 0.95] Semenov dimensionless heat-release number
}

export interface LevenspielCurvePoint {
  x: number;
  invRa: number; // FA0 / (-rA) [m^3]
  pRatioY: number; // P / P0 Ergun pressure ratio
  sx: number;
  sy: number;
}

export interface KineticsReactorSolution {
  conversionX: number;
  tempK: number;
  tempC: number;
  pInletPsig: number;
  pInletPsia: number;
  pInletKpa: number;
  pExitPsia: number;
  pExitPsig: number;
  epsilonA: number;
  alphaErgun: number;
  yPressureRatio: number;
  kRateSInv: number;
  daCstr: number;
  daPfrErgun: number;
  vRatioCstrPfr: number;
  fErgun: number;
  fFanningEquiv: number;
  fDarcyEquiv: number;
  thielePhi: number;
  effectivenessEta: number;
  semenovPsi: number;
  semenovPsiCrit: number;
  isRunaway: boolean;
  isDiffusionLimited: boolean;
  curvePoints: LevenspielCurvePoint[];
  operatingPoint: LevenspielCurvePoint;
  equations: WhiteBoxStageEquation[];
}

export const LEVENSPIEL_VIEW_BOX: ViewBoxRect = {
  width: 520,
  height: 240,
  plotX: 56,
  plotY: 24,
  plotW: 432,
  plotH: 176,
};

const PATM_PSIA = 14.6959;
const PSI_TO_PA = 6894.757;
const R_GAS = 8.31446;

export function solveKineticsReactor(raw: KineticsReactorInputs): KineticsReactorSolution {
  const conversionX = clampDomainValue(raw.conversionX, 0.05, 0.96);
  const tempK = clampDomainValue(raw.tempK, 300, 750);
  const pInletPsig = clampDomainValue(raw.pInletPsig, -10, 500);
  const epsilonA = clampDomainValue(raw.epsilonA, -0.5, 1.5);
  const alphaErgun = clampDomainValue(raw.alphaErgun, 0, 0.04);
  const thielePhi = clampDomainValue(raw.thielePhi, 0.1, 15.0);
  const semenovPsi = clampDomainValue(raw.semenovPsi, 0.05, 0.95);

  // 1. Explicit psig -> psia conversion (AGENTS.md Invariant #5)
  const pInletPsia = pInletPsig + PATM_PSIA;
  const pInletKpa = (pInletPsia * PSI_TO_PA) / 1000;

  // 2. Arrhenius rate constant k(T) [Fogler 7th Ed., Ch. 3, Eq. 3-20]
  const kRateSInv = 0.12 * Math.exp((-42000 / R_GAS) * (1 / tempK - 1 / 350));

  // 3. Ergun PBR pressure ratio y = P / P0 = sqrt(1 - alpha * W_norm) [Fogler Ch. 5, Eq. 5-22]
  const yPressureRatio = Math.max(0.35, Math.sqrt(Math.max(0.1225, 1 - alphaErgun * 20 * conversionX)));
  const pExitPsia = pInletPsia * yPressureRatio;
  const pExitPsig = pExitPsia - PATM_PSIA;

  // 4. First-order catalytic gas-phase CSTR & PFR Damkohler space-time [Fogler Ch. 2, 4 & 15]
  // Effective reaction rate -r_A,eff = eta(phi) * k(T) * C_A0 * (1 - X) * y / (1 + eps_A * X)
  const effectivenessEta = (3 / (thielePhi * thielePhi)) * (thielePhi / Math.tanh(thielePhi) - 1);
  const isDiffusionLimited = effectivenessEta < 0.5;
  const kEffNorm = Math.max(0.05, (kRateSInv / 0.85) * Math.max(0.18, effectivenessEta));
  const denomX = Math.max(1e-4, 1 - conversionX);
  const daCstr = (conversionX * (1 + epsilonA * conversionX)) / (kEffNorm * denomX * yPressureRatio);
  const daPfrIso = ((1 + epsilonA) * Math.log(1 / denomX) - epsilonA * conversionX) / kEffNorm;
  const daPfrErgun = daPfrIso / yPressureRatio;
  const vRatioCstrPfr = daCstr / Math.max(daPfrErgun, 1e-6);

  // 5. Ergun packed-bed friction vs. Fanning f_F and Darcy f_D = 4*f_F [BSL Ch. 6; Perry Sec. 6]
  const reParticle = 180;
  const voidFraction = 0.4;
  const fErgun = (150 * (1 - voidFraction)) / reParticle + 1.75;
  const fFanningEquiv = 0.0791 / Math.pow(reParticle, 0.25);
  const fDarcyEquiv = 4 * fFanningEquiv;

  // 7. Semenov thermal runaway criterion psi > 1/e ≈ 0.368 [Fogler Ch. 12–13; Crowl & Louvar Ch. 8]
  const semenovPsiCrit = 1 / Math.E;
  const isRunaway = semenovPsi > semenovPsiCrit;

  // 8. Sample Levenspiel reciprocal-rate curve F_A0 / (-r_A,eff)(X) across X in [0.02, 0.95]
  // Fixed reference ceiling (kRef = 0.40) so vertical drag (phi -> eta) and T visibly move the curve!
  const refCeiling = 28;
  const xs = Array.from({ length: 25 }, (_, i) => Number((0.02 + (i / 24) * 0.93).toFixed(3)));
  const curvePoints: LevenspielCurvePoint[] = xs.map((x) => {
    const yP = Math.max(0.35, Math.sqrt(Math.max(0.1225, 1 - alphaErgun * 20 * x)));
    const invRa = (1 + epsilonA * x) / (kEffNorm * Math.max(0.03, 1 - x) * yP);
    const u = clampDomainValue(x / 0.98, 0, 1);
    const v = 1 - clampDomainValue(invRa / refCeiling, 0.03, 0.97);
    return {
      x,
      invRa: Number(invRa.toFixed(3)),
      pRatioY: Number(yP.toFixed(3)),
      sx: Number((LEVENSPIEL_VIEW_BOX.plotX + u * LEVENSPIEL_VIEW_BOX.plotW).toFixed(2)),
      sy: Number((LEVENSPIEL_VIEW_BOX.plotY + v * LEVENSPIEL_VIEW_BOX.plotH).toFixed(2)),
    };
  });

  const opInvRa = (1 + epsilonA * conversionX) / (kEffNorm * denomX * yPressureRatio);
  const opU = clampDomainValue(conversionX / 0.98, 0, 1);
  const opV = 1 - clampDomainValue(opInvRa / refCeiling, 0.03, 0.97);
  const operatingPoint: LevenspielCurvePoint = {
    x: conversionX,
    invRa: Number(opInvRa.toFixed(3)),
    pRatioY: Number(yPressureRatio.toFixed(3)),
    sx: Number((LEVENSPIEL_VIEW_BOX.plotX + opU * LEVENSPIEL_VIEW_BOX.plotW).toFixed(2)),
    sy: Number((LEVENSPIEL_VIEW_BOX.plotY + opV * LEVENSPIEL_VIEW_BOX.plotH).toFixed(2)),
  };

  const equations: WhiteBoxStageEquation[] = [
    {
      id: 'wb6-levenspiel-cstr-pfr',
      title: 'Fogler Ch. 2 & 5 · Levenspiel CSTR/PFR Sizing & Ergun Gas-Phase Expansion',
      citation: "[Fogler 7th Ed., Ch. 2 Eqs. 2-13..17 & Ch. 5 Eq. 5-22; Perry's 9th Ed., Sec. 19, p. 19-6]",
      symbolicLatex: '\\frac{V_{\\mathrm{CSTR}}}{V_{\\mathrm{PFR}}} = \\frac{X(1+\\varepsilon_A X)/[(1-X)y]}{\\int_0^X \\frac{1+\\varepsilon_A x}{(1-x)y}\\,dx}, \\quad P_{\\mathrm{abs}} = P_{\\mathrm{psig}} + 14.696\\text{ psia}',
      substitutedLatex: `X = ${conversionX.toFixed(2)}, \\; \\varepsilon_A = ${epsilonA.toFixed(2)}, \\; P_{\\mathrm{in,abs}} = ${pInletPsig.toFixed(1)} + 14.696 = ${pInletPsia.toFixed(2)}\\text{ psia}, \\; y = P/P_0 = ${yPressureRatio.toFixed(3)}`,
      resultLatex: `\\mathrm{Da}_{\\mathrm{CSTR}} = ${daCstr.toFixed(2)}, \\; \\mathrm{Da}_{\\mathrm{PFR}} = ${daPfrErgun.toFixed(2)} \\Rightarrow V_{\\mathrm{CSTR}}/V_{\\mathrm{PFR}} = ${vRatioCstrPfr.toFixed(2)}\\times`,
      plainExplanation: 'On a Levenspiel plot of F_A0/(-r_A) vs. X, CSTR volume is the rectangle of height F_A0/(-r_A)(X) and width X, whereas PFR volume is the shaded integral area under the curve.',
      warningText: 'Always convert inlet gauge pressure psig to absolute psia (+14.696) before computing gas-phase concentration C_A0 = y_A0 P_abs / (R T) and Ergun pressure ratio y = P/P_0.',
    },
    {
      id: 'wb6-thiele-ergun',
      title: 'Fogler Ch. 15 & BSL Ch. 6/18 · Thiele Catalyst Effectiveness η & Ergun vs. Darcy/Fanning Friction',
      citation: "[Fogler 7th Ed., Ch. 15 Eq. 15-23; BSL Transport Phenomena 2nd Ed., Ch. 6 & 18; Perry's 9th Ed., Sec. 6, p. 6-10 & Sec. 7, p. 7-18]",
      symbolicLatex: '\\eta_{\\mathrm{cat}} = \\frac{3}{\\phi^2}(\\phi \\coth \\phi - 1), \\quad f_{\\mathrm{Ergun}} = \\frac{150(1-\\varepsilon)}{\\mathrm{Re}_p} + 1.75, \\quad f_D = 4 f_F',
      substitutedLatex: `\\phi = ${thielePhi.toFixed(2)}, \\; \\mathrm{Re}_p = ${reParticle}, \\; f_F = ${fFanningEquiv.toFixed(5)} \\Rightarrow f_D = 4 \\times ${fFanningEquiv.toFixed(5)} = ${fDarcyEquiv.toFixed(5)}`,
      resultLatex: `\\eta_{\\mathrm{cat}} = ${effectivenessEta.toFixed(3)} \\; (${(effectivenessEta * 100).toFixed(1)}\\% \\text{ effectiveness}), \\quad f_{\\mathrm{Ergun}} = ${fErgun.toFixed(3)}`,
      plainExplanation: 'When the Thiele modulus φ > 2, reactant molecules react near the outer rim of the catalyst pellet before they can diffuse into the core, dropping effectiveness η below 50%.',
      warningText: 'Never confuse open-pipe Fanning f_F / Darcy f_D = 4·f_F with the packed-bed Ergun friction factor f_Ergun = 150(1-ε)/Re_p + 1.75.',
    },
    {
      id: 'wb6-semenov-runaway',
      title: 'Fogler Ch. 12–13 & Crowl & Louvar Ch. 8 · Semenov Nonisothermal Runaway Criterion',
      citation: "[Fogler 7th Ed., Ch. 12–13; Crowl & Louvar 4th Ed., Ch. 8; Perry's 9th Ed., Sec. 19, p. 19-40]",
      symbolicLatex: '\\psi = \\frac{(-\\Delta H_{\\mathrm{rxn}}) k(T_c) C_{A0} V E_a}{U A R T_c^2} \\le \\psi_{\\mathrm{crit}} = \\frac{1}{e} \\approx 0.3679',
      substitutedLatex: `\\psi = ${semenovPsi.toFixed(3)} \\; \\text{vs.} \\; \\psi_{\\mathrm{crit}} = 0.3679 \\; (T = ${tempK.toFixed(1)}\\text{ K}, \\; k = ${kRateSInv.toFixed(3)}\\text{ s}^{-1})`,
      resultLatex: isRunaway
        ? `\\psi = ${semenovPsi.toFixed(3)} > 0.368 \\Rightarrow \\text{SEMENOV THERMAL RUNAWAY HAZARD}`
        : `\\psi = ${semenovPsi.toFixed(3)} \\le 0.368 \\Rightarrow \\text{STABLE THERMAL OPERATING ENVELOPE}`,
      plainExplanation: 'Semenov balances exponential Arrhenius heat generation against linear jacket heat removal. Above ψ = 1/e ≈ 0.368, heat generation tangentially exceeds cooling and the reactor runs away.',
      warningText: 'If ψ exceeds 0.368, increase jacket heat-transfer area UA, lower coolant temperature T_c, or dilute feed concentration C_A0 immediately (Crowl & Louvar Ch. 8).',
    },
  ];

  return {
    conversionX, tempK, tempC: tempK - 273.15, pInletPsig, pInletPsia, pInletKpa,
    pExitPsia, pExitPsig, epsilonA, alphaErgun, yPressureRatio, kRateSInv, daCstr, daPfrErgun, vRatioCstrPfr,
    fErgun, fFanningEquiv, fDarcyEquiv, thielePhi, effectivenessEta, semenovPsi,
    semenovPsiCrit, isRunaway, isDiffusionLimited, curvePoints, operatingPoint, equations,
  };
}

/** Inverse SVG drag mapping on the Levenspiel canvas: horizontal u -> X, vertical v -> Thiele phi. */
export function inverseLevenspielSvgDrag(u: number, v: number): { conversionX: number; thielePhi: number } {
  const conversionX = Number((0.08 + clampDomainValue(u, 0, 1) * 0.86).toFixed(2));
  const thielePhi = Number((0.2 + clampDomainValue(1 - v, 0, 1) * 9.8).toFixed(2));
  return { conversionX, thielePhi };
}
