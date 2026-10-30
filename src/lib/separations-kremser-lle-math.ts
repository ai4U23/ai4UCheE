// Analytical math helpers for Subject 3 (WB4) interactive companion separation diagrams:
// 1. Kremser Absorption / Stripping Operating vs. Equilibrium Diagram & N_OG(A) Curve (Seader 4th Ed. Ch. 6 · Perry's Sec. 14)
// 2. Ternary Liquid-Liquid Extraction (LLE) Equilateral Triangular Phase Diagram & Adsorption Breakthrough C/C0(t/tau) (Seader Ch. 8 & 15 · Perry's Sec. 15 & 16)
import { clampDomainValue } from './svg-drag-math';

export interface KremserAbsorptionSolution {
  absorptionA: number;
  recoveryFrac: number;
  strippingS: number;
  nogStages: number;
  nTheoretical: number;
  isPinched: boolean;
  nogCurve: Array<{ aVal: number; nog: number }>;
  stairPoints: Array<{ xLiq: number; yVap: number }>;
}

/**
 * Evaluate Kremser-Souders-Brown Absorption & Stripping equations:
 * N_OG = ln(((1/(1-f_rec))*(1 - 1/A) + 1/A)) / ln(A) for A != 1, or f_rec/(1-f_rec) for A = 1
 * [Seader, Henley & Roper 4th Ed., Ch. 6, Eqs. 6-19..6-25 · Perry's 9th Ed., Fig. 14-15, p. 14-19].
 */
export function solveKremserAbsorption(rawA: number, rawRecovery: number): KremserAbsorptionSolution {
  const absorptionA = clampDomainValue(rawA, 0.55, 2.6, 0.05);
  const recoveryFrac = clampDomainValue(rawRecovery, 0.5, 0.995, 0.005);
  const strippingS = Number((1 / absorptionA).toFixed(3));

  const calcNog = (a: number, rec: number): number => {
    const invUnabs = 1 / Math.max(1 - rec, 0.002);
    if (Math.abs(a - 1.0) < 0.025) return Number(clampDomainValue(invUnabs - 1, 1, 35).toFixed(2));
    const arg = invUnabs * (1 - 1 / a) + 1 / a;
    if (arg <= 1.001) return 35.0;
    const n = Math.log(arg) / Math.log(a);
    return Number(clampDomainValue(n > 0 ? n : 35.0, 1.0, 35.0).toFixed(2));
  };

  const nogStages = calcNog(absorptionA, recoveryFrac);
  const nTheoretical = Number(clampDomainValue(nogStages * 0.92, 1.0, 35.0).toFixed(2));
  const isPinched = absorptionA < 1.0 || nogStages >= 24.0;

  const nogCurve: Array<{ aVal: number; nog: number }> = [];
  for (let i = 0; i <= 25; i += 1) {
    const aVal = 0.65 + (1.95 * i) / 25;
    nogCurve.push({ aVal: Number(aVal.toFixed(2)), nog: calcNog(aVal, recoveryFrac) });
  }

  // Generate operating line vs equilibrium line staircase in normalized (x, y)
  const stairPoints: Array<{ xLiq: number; yVap: number }> = [];
  const yIn = 1.0;
  const yOut = 1 - recoveryFrac;
  let yCurr = yOut;
  const steps = Math.min(Math.round(nogStages), 10);
  for (let s = 0; s < steps; s += 1) {
    const xOp = (yCurr - yOut) / Math.max(absorptionA * 1.15, 0.4);
    const xEq = Math.min(0.95, yCurr / 1.15);
    stairPoints.push({ xLiq: Number(xOp.toFixed(3)), yVap: Number(yCurr.toFixed(3)) });
    stairPoints.push({ xLiq: Number(xEq.toFixed(3)), yVap: Number(yCurr.toFixed(3)) });
    yCurr = Math.min(yIn, yOut + absorptionA * 1.15 * xEq);
  }

  return {
    absorptionA,
    recoveryFrac,
    strippingS,
    nogStages,
    nTheoretical,
    isPinched,
    nogCurve,
    stairPoints,
  };
}

export interface TernaryLleBreakthroughSolution {
  soluteFeedZ: number;
  peNumber: number;
  raffinateX: number;
  extractY: number;
  selectivityBeta: number;
  tBreakthroughRatio: number;
  lubFraction: number;
  binodalPts: Array<{ u: number; v: number }>;
  breakthroughPts: Array<{ tOverTau: number; cOverC0: number }>;
}

/**
 * Evaluate Ternary Liquid-Liquid Extraction (LLE) tie-line + fixed-bed adsorption breakthrough C/C0(t/tau)
 * [Seader 4th Ed., Ch. 8 & Ch. 15 · Perry's 9th Ed., Sec. 15 (p. 15-14) & Sec. 16 (p. 16-26)].
 */
export function solveTernaryLleAndBreakthrough(
  rawSoluteZ: number,
  rawPeNumber: number,
): TernaryLleBreakthroughSolution {
  const soluteFeedZ = clampDomainValue(rawSoluteZ, 0.08, 0.52, 0.01);
  const peNumber = clampDomainValue(rawPeNumber, 8, 120, 2);

  // Raffinate (carrier-rich) and Extract (solvent-rich) conjugate compositions beneath plait point (z_plait ~ 0.56)
  const raffinateX = Number((0.08 + 0.35 * soluteFeedZ).toFixed(3));
  const extractY = Number((0.88 - 0.38 * soluteFeedZ).toFixed(3));
  const selectivityBeta = Number(((1.65 * soluteFeedZ / Math.max(raffinateX, 0.02)) / 0.22).toFixed(2));

  // Rosen / Thomas sigmoidal adsorption wavefront C/C0(theta) = 1 / (1 + exp(-sqrt(Pe)*(theta - 1)))
  const rootPe = Math.sqrt(peNumber);
  const tBreakthroughRatio = Number(clampDomainValue(1 - 2.944 / rootPe, 0.25, 0.96).toFixed(3)); // 5% breakthrough
  const lubFraction = Number((1 - tBreakthroughRatio).toFixed(3));

  const binodalPts: Array<{ u: number; v: number }> = [];
  for (let i = 0; i <= 24; i += 1) {
    const u = 0.08 + (0.84 * i) / 24;
    const v = Math.max(0, 0.55 * (1 - Math.pow((u - 0.5) / 0.42, 2)));
    binodalPts.push({ u: Number(u.toFixed(3)), v: Number(v.toFixed(3)) });
  }

  const breakthroughPts: Array<{ tOverTau: number; cOverC0: number }> = [];
  for (let i = 0; i <= 30; i += 1) {
    const theta = 0.3 + (1.4 * i) / 30;
    const cOverC0 = 1 / (1 + Math.exp(-rootPe * (theta - 1.0)));
    breakthroughPts.push({ tOverTau: Number(theta.toFixed(3)), cOverC0: Number(cOverC0.toFixed(4)) });
  }

  return {
    soluteFeedZ,
    peNumber,
    raffinateX,
    extractY,
    selectivityBeta,
    tBreakthroughRatio,
    lubFraction,
    binodalPts,
    breakthroughPts,
  };
}
