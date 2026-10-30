// Inverse hydraulics & Fair Souders-Brown C_sb(F_LV) curve geometry for WB4 Charts 10 & 11
// [Perry's 9th Ed., Fig. 14-32, p. 14-37 & Fig. 14-55, p. 14-57].
import { clampDomainValue, inverseLog10Map } from './svg-drag-math';

export const CYCLE_TRAY_SPACING: readonly number[] = [0.305, 0.457, 0.61];

/** Cycle tray spacing h_t across standard sieve tray spacings: 12" (0.305 m), 18" (0.457 m), 24" (0.610 m). */
export function nextTraySpacingM(current: number): number {
  const idx = CYCLE_TRAY_SPACING.findIndex((s) => Math.abs(s - current) < 0.02);
  return CYCLE_TRAY_SPACING[(idx + 1) % CYCLE_TRAY_SPACING.length];
}

/**
 * Inversely solve column diameter D_c [m] for a target % Flood:
 * Since superficial vapor velocity u_n is proportional to D_c^-2, D_c_next = D_c * sqrt(%Flood_cur / %Flood_target).
 */
export function solveColDiamFromTargetFloodPct(
  currentDiamM: number,
  currentFloodPct: number,
  targetFloodPct: number,
): number {
  const safeTarget = clampDomainValue(targetFloodPct, 20, 115);
  const ratio = Math.max(currentFloodPct, 5) / safeTarget;
  const rawDiam = currentDiamM * Math.sqrt(ratio);
  return Number(clampDomainValue(rawDiam, 0.5, 3.5, 0.05).toFixed(2));
}

/** Inversely solve Reflux Multiplier rMult = R/R_min when Shift-dragging the % Flood bar. */
export function solveRMultFromTargetFloodPct(
  currentRMult: number,
  currentFloodPct: number,
  targetFloodPct: number,
): number {
  const safeTarget = clampDomainValue(targetFloodPct, 20, 115);
  const scale = safeTarget / Math.max(currentFloodPct, 5);
  return Number(clampDomainValue(currentRMult * scale, 1.05, 4.5, 0.05).toFixed(2));
}

/** Map column diameter D_c in [0.5, 3.5] m to visual SVG shell width in [68, 124] px. */
export function colDiamMToShellWidth(diamM: number): number {
  const t = clampDomainValue((diamM - 0.5) / 3.0, 0, 1);
  return Number((68 + t * 56).toFixed(1));
}

/** Invert dragged right wall SVG x coordinate back to column diameter D_c in [0.5, 3.5] m. */
export function svgWallXToColDiamM(vx: number): number {
  // Center is x=82, so right wall is 82 + width/2 -> width = 2 * (vx - 82)
  const width = clampDomainValue(2 * (vx - 82), 68, 124);
  const t = (width - 68) / 56;
  return Number(clampDomainValue(0.5 + t * 3.0, 0.5, 3.5, 0.05).toFixed(2));
}

/** Build SVG polyline & operating marker for Fair's C_sb(F_LV) curve inside the 285x52 mini plot. */
export function buildFairCsbCurvePoints(traySpacingM: number, fLv: number, cSbMs: number) {
  const w = 285;
  const h = 48;
  const y0 = 112;
  const baseCoeff = 0.0105 + 0.1496 * Math.pow(traySpacingM, 0.755);
  const toX = (flvVal: number) => {
    const u = (Math.log10(clampDomainValue(flvVal, 0.01, 1.0)) - -2) / 2;
    return Number((u * w).toFixed(1));
  };
  const toY = (csbVal: number) => {
    const v = clampDomainValue((csbVal - 0.02) / 0.12, 0, 1);
    return Number((y0 + h - v * h).toFixed(1));
  };
  const pts: string[] = [];
  for (let i = 0; i <= 24; i += 1) {
    const flvVal = inverseLog10Map(i / 24, 0.01, 1.0);
    const csbVal = baseCoeff * Math.pow(10, -0.14 * Math.log10(Math.max(flvVal, 0.02)));
    pts.push(`${toX(flvVal)},${toY(csbVal)}`);
  }
  return {
    points: pts.join(' '),
    opX: toX(fLv),
    opY: toY(cSbMs),
  };
}
