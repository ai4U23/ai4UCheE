// Pure inverse math & composition-ordering bounds for Chart 9 (5-handle McCabe-Thiele y-x canvas).
// Enforces 0.005 <= x_B <= z_F - 0.04 < z_F + 0.04 <= x_D <= 0.995 and ROL y-intercept inversion.
import { clampDomainValue } from './svg-drag-math';

export type ActiveMtHandle = 'q' | 'xd' | 'zf' | 'xb' | 'rol' | null;

/**
 * Clamp a dragged diagonal composition handle ('xd' | 'zf' | 'xb') so the three compositions
 * never cross and always maintain at least a 0.04 mol/mol separation margin.
 */
export function clampMcCabeComposition(
  target: 'xd' | 'zf' | 'xb',
  rawX: number,
  current: { xd: number; xf: number; xb: number },
): number {
  if (target === 'xb') {
    const maxXb = Math.min(0.25, current.xf - 0.04);
    return Number(clampDomainValue(rawX, 0.005, Math.max(0.01, maxXb), 0.005).toFixed(3));
  }
  if (target === 'zf') {
    const minZf = Math.max(0.1, current.xb + 0.04);
    const maxZf = Math.min(0.9, current.xd - 0.04);
    return Number(clampDomainValue(rawX, minZf, Math.max(minZf, maxZf), 0.01).toFixed(2));
  }
  // target === 'xd'
  const minXd = Math.max(0.7, current.xf + 0.04);
  return Number(clampDomainValue(rawX, minXd, 0.995, 0.005).toFixed(3));
}

/** Invert horizontal normalized plot coordinate normX in [0, 1] into feed thermal quality q in [-0.3, 1.4]. */
export function solveQFromSvgNorm(xf: number, normX: number): number {
  const rawQ = 1.0 + (xf - normX) * 2.5;
  return Number(clampDomainValue(rawQ, -0.3, 1.4, 0.02).toFixed(2));
}

/**
 * Invert Rectifying Operating Line (ROL) y-intercept y_int = x_D / (R_op + 1)
 * into reflux multiplier rMult = R_op / R_min in [1.05, 4.5].
 */
export function solveRMultFromInterceptNormY(
  xd: number,
  rMin: number,
  normY: number,
): number {
  const safeYInt = clampDomainValue(normY, 0.04, Math.max(xd - 0.04, 0.1));
  const rOp = xd / safeYInt - 1.0;
  const rawMult = rOp / Math.max(rMin, 0.05);
  return Number(clampDomainValue(rawMult, 1.05, 4.5, 0.05).toFixed(2));
}
