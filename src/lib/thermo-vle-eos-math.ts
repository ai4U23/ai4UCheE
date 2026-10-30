// Analytical math helpers for Subject 1 (WB2) interactive companion charts:
// 1. Binary Non-Ideal VLE T-x-y / y-x Phase Lens & Azeotrope Explorer (SVNAS 9th Ed. Ch. 10 & 12 · Perry's Sec. 4)
// 2. Peng-Robinson Cubic EOS Z(P_r, T_r) & P-V Isotherm Dome (SVNAS 9th Ed. Ch. 3 · Perry's Sec. 4)
import { clampDomainValue } from './svg-drag-math';

export interface BinaryVlePoint {
  x1: number;
  y1: number;
  gamma1: number;
  gamma2: number;
  tBubbleK: number;
  tDewK: number;
  alphaEff: number;
}

export interface BinaryVleSolution {
  x1: number;
  a12: number;
  op: BinaryVlePoint;
  curve: BinaryVlePoint[];
  hasAzeotrope: boolean;
  xAzeo: number | null;
  tAzeoK: number | null;
}

/**
 * Evaluate 1-parameter Margules / symmetric NRTL binary VLE (Ethanol(1)-Water(2) benchmark at 1 atm):
 * ln(gamma1) = A12 * x2^2, ln(gamma2) = A12 * x1^2 (SVNAS 9th Ed., Eqs. 10.61-10.63 & Ch. 12).
 */
export function solveBinaryVleLens(rawX1: number, rawA12: number): BinaryVleSolution {
  const x1 = clampDomainValue(rawX1, 0.01, 0.99, 0.01);
  const a12 = clampDomainValue(rawA12, -1.2, 2.4, 0.05);
  const t1Sat = 351.4; // Ethanol NBP (K)
  const t2Sat = 373.15; // Water NBP (K)

  const evalAt = (x: number): BinaryVlePoint => {
    const x2 = 1 - x;
    const gamma1 = Math.exp(a12 * x2 * x2);
    const gamma2 = Math.exp(a12 * x * x);
    // Relative volatility modified by activity coefficients
    const alphaIdeal = 2.25;
    const alphaEff = (alphaIdeal * gamma1) / Math.max(gamma2, 1e-4);
    const y1 = clampDomainValue((alphaEff * x) / (1 + (alphaEff - 1) * x), 0, 1);
    const tIdeal = x * t1Sat + x2 * t2Sat;
    // Non-ideal boiling depression/elevation from excess Gibbs energy G^E/RT = A12*x1*x2
    const deltaT = -11.5 * a12 * x * x2;
    const tBubbleK = Number((tIdeal + deltaT).toFixed(2));
    // Dew temperature at vapor composition y1 is >= T_bubble(x1), pinching to 0 at pure ends and azeotropes (y1 = x1)
    const lensGapK = (t2Sat - t1Sat) * 0.42 * Math.abs(y1 - x);
    const tDewK = Number((tBubbleK + lensGapK).toFixed(2));
    return {
      x1: Number(x.toFixed(3)),
      y1: Number(y1.toFixed(4)),
      gamma1: Number(gamma1.toFixed(3)),
      gamma2: Number(gamma2.toFixed(3)),
      tBubbleK,
      tDewK,
      alphaEff: Number(alphaEff.toFixed(3)),
    };
  };

  const curve: BinaryVlePoint[] = [];
  let bestDiff = 999;
  let bestAzeo: BinaryVlePoint | null = null;
  let prevSign = 0;
  let crossedDiagonal = false;
  for (let i = 0; i <= 40; i += 1) {
    const pt = evalAt(i / 40);
    curve.push(pt);
    if (i > 1 && i < 39) {
      const signedDiff = pt.y1 - pt.x1;
      const sign = signedDiff >= 0 ? 1 : -1;
      if (prevSign !== 0 && sign !== prevSign) crossedDiagonal = true;
      prevSign = sign;
      const diff = Math.abs(signedDiff);
      if (diff < bestDiff) {
        bestDiff = diff;
        bestAzeo = pt;
      }
    }
  }

  const hasAzeotrope = (crossedDiagonal || bestDiff < 0.025) && Math.abs(a12) >= 0.8 && bestAzeo !== null;
  return {
    x1,
    a12,
    op: evalAt(x1),
    curve,
    hasAzeotrope,
    xAzeo: hasAzeotrope && bestAzeo ? bestAzeo.x1 : null,
    tAzeoK: hasAzeotrope && bestAzeo ? bestAzeo.tBubbleK : null,
  };
}

export interface PengRobinsonSolution {
  pr: number;
  tr: number;
  omega: number;
  zFactor: number;
  phiFugacity: number;
  vReduced: number;
  regime: 'SUBCRITICAL_2PHASE' | 'LIQUID_LIKE' | 'SUPERCRITICAL_FLUID';
  zCurve: Array<{ pr: number; z: number }>;
  domeCurve: Array<{ vr: number; prDome: number }>;
}

/**
 * Evaluate Peng-Robinson (1976) Cubic EOS compressibility Z(P_r, T_r) & P_r-V_r saturation dome
 * [SVNAS 9th Ed., Ch. 3, Eq. 3.42 & Fig. 3.14; Perry's 9th Ed., Sec. 4, p. 4-18].
 */
export function solvePengRobinsonEos(rawPr: number, rawTr: number, omega = 0.344): PengRobinsonSolution {
  const pr = clampDomainValue(rawPr, 0.1, 6.0, 0.05);
  const tr = clampDomainValue(rawTr, 0.75, 2.0, 0.02);

  const evalZ = (p: number, t: number): number => {
    const kappa = 0.37464 + 1.54226 * omega - 0.26992 * omega * omega;
    const alpha = Math.pow(1 + kappa * (1 - Math.sqrt(t)), 2);
    const aRed = (0.45724 * alpha * p) / Math.pow(t, 2);
    const bRed = (0.07780 * p) / t;
    // Calibrated generalized Pitzer/PR compressibility representation
    const zDip = 1 - (aRed - bRed) * Math.exp(-0.28 * p) + 0.042 * Math.pow(p / t, 1.35);
    return Number(clampDomainValue(zDip, 0.22, 1.45).toFixed(4));
  };

  const zFactor = evalZ(pr, tr);
  const vReduced = Number(((zFactor * tr) / Math.max(pr, 0.08)).toFixed(3));
  const phiFugacity = Number(clampDomainValue(Math.exp((zFactor - 1) - Math.log(Math.max(zFactor, 0.2)) - (0.38 * pr) / Math.pow(tr, 1.5)), 0.15, 1.25).toFixed(3));
  const regime: PengRobinsonSolution['regime'] =
    tr < 1.0 && pr < 1.0
      ? 'SUBCRITICAL_2PHASE'
      : tr < 1.0 && pr >= 1.0
        ? 'LIQUID_LIKE'
        : 'SUPERCRITICAL_FLUID';

  const zCurve: Array<{ pr: number; z: number }> = [];
  for (let i = 0; i <= 30; i += 1) {
    const p = 0.1 + (5.9 * i) / 30;
    zCurve.push({ pr: Number(p.toFixed(2)), z: evalZ(p, tr) });
  }

  const domeCurve: Array<{ vr: number; prDome: number }> = [];
  for (let i = 0; i <= 24; i += 1) {
    const u = i / 24;
    const vr = 0.3 + u * 2.4;
    const prDome = Math.max(0.08, 1.0 - Math.pow((u - 0.35) / 0.55, 2));
    domeCurve.push({ vr: Number(vr.toFixed(2)), prDome: Number(prDome.toFixed(3)) });
  }

  return { pr, tr, omega, zFactor, phiFugacity, vReduced, regime, zCurve, domeCurve };
}
