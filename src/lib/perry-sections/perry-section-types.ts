// Canonical TypeScript contracts and SVG viewBox curve projection helpers for all 25 Perry's 9th Ed. sections.
import type { WhiteBoxStageEquation } from '../../actions/view-screen';
import { clampDomainValue, type ViewBoxRect } from '../svg-drag-math';

export type PerrySectionNumber =
  | 1 | 2 | 3 | 4 | 5
  | 6 | 7 | 8 | 9 | 10
  | 11 | 12 | 13 | 14 | 15
  | 16 | 17 | 18 | 19 | 20
  | 21 | 22 | 23 | 24 | 25;

export type PerryClusterId = 'cluster-a' | 'cluster-b' | 'cluster-c' | 'cluster-d' | 'cluster-e';

export interface PerryParamSpec {
  key: string;
  label: string;
  symbol: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  defaultVal: number;
  scale: 'linear' | 'log10';
}

export interface PerryCurvePoint {
  x: number;
  y: number;
  sx: number;
  sy: number;
}

export interface PerrySectionSolverResult {
  secNum: PerrySectionNumber;
  secTitle: string;
  clusterId: PerryClusterId;
  secPage: string;
  pdfPage1Based: number;
  verifyToken: string;
  citation: string;
  primaryVal: number;
  secondaryVal: number;
  responseVal: number;
  responseUnit: string;
  secondaryResponseLabel: string;
  secondaryResponseVal: string;
  statusBanner: string;
  isAlert: boolean;
  curvePoints: PerryCurvePoint[];
  secondaryCurvePoints?: PerryCurvePoint[];
  secondaryCurveLabel?: string;
  operatingPoint: PerryCurvePoint;
  readoutText: string;
  learnCallout: { title: string; plainEnglish: string; commonTrap: string };
  deepDiveWorkbench?: 'wb2-thermo-dippr' | 'wb3-hydraulics' | 'wb4-distillation' | 'wb6-kinetics-reactors';
  equations: WhiteBoxStageEquation[];
}

export interface PerrySectionDescriptor {
  secNum: PerrySectionNumber;
  secTitle: string;
  clusterId: PerryClusterId;
  secPage: string;
  pdfPage1Based: number;
  verifyToken: string;
  citation: string;
  xAxisLabel: string;
  yAxisLabel: string;
  primaryParam: PerryParamSpec;
  secondaryParam: PerryParamSpec;
  deepDiveWorkbench?: 'wb2-thermo-dippr' | 'wb3-hydraulics' | 'wb4-distillation' | 'wb6-kinetics-reactors';
  solve: (primaryVal: number, secondaryVal: number) => PerrySectionSolverResult;
  inverseSvgDrag: (u: number, v: number) => { primaryVal: number; secondaryVal: number };
}

export const PERRY_SECTION_VIEW_BOX: ViewBoxRect = {
  width: 520,
  height: 240,
  plotX: 56,
  plotY: 26,
  plotW: 432,
  plotH: 174,
};

function normCoord(val: number, min: number, max: number, scale: 'linear' | 'log10'): number {
  if (scale === 'log10') {
    const lMin = Math.log10(Math.max(min, 1e-12));
    const lMax = Math.log10(Math.max(max, 1e-11));
    const lVal = Math.log10(Math.max(val, 1e-12));
    return clampDomainValue((lVal - lMin) / Math.max(lMax - lMin, 1e-9), 0, 1);
  }
  return clampDomainValue((val - min) / Math.max(max - min, 1e-9), 0, 1);
}

/** Project domain arrays (xs, ys) and an operating point onto PERRY_SECTION_VIEW_BOX. */
export function buildSvgCurvePoints(
  xs: number[],
  ys: number[],
  xBounds: [number, number],
  yBounds: [number, number],
  xScale: 'linear' | 'log10' = 'linear',
  yScale: 'linear' | 'log10' = 'linear',
): PerryCurvePoint[] {
  return xs.map((x, idx) => {
    const y = ys[idx] ?? ys[0] ?? 0;
    const u = normCoord(x, xBounds[0], xBounds[1], xScale);
    const v = 1 - normCoord(y, yBounds[0], yBounds[1], yScale);
    return {
      x,
      y,
      sx: Number((PERRY_SECTION_VIEW_BOX.plotX + u * PERRY_SECTION_VIEW_BOX.plotW).toFixed(2)),
      sy: Number((PERRY_SECTION_VIEW_BOX.plotY + v * PERRY_SECTION_VIEW_BOX.plotH).toFixed(2)),
    };
  });
}
