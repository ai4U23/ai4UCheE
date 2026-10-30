// Parametric SVG geometry & inverse pointer math for WB3 Charts 7 (PFD schematic) and 8 (Pump/System/NPSHa curve).
// Enforces explicit psig -> psia (+14.696 psia) and Darcy f_D = 4*f_F [Perry's 9th Ed., Eqs. 6-37..6-39, p. 6-11].
import { clampDomainValue } from './svg-drag-math';

export const CYCLE_NPS_ORDER: readonly number[] = [2, 3, 4, 6];

/** Cycle Nominal Pipe Size (NPS) through standard sizes [2, 3, 4, 6]. */
export function nextNpsInch(current: number): number {
  const idx = CYCLE_NPS_ORDER.indexOf(current);
  return CYCLE_NPS_ORDER[(idx + 1) % CYCLE_NPS_ORDER.length];
}

/** Map suction static head zSuctionM in [-5, 20] m to V-101 vessel SVG y in [152, 48]. */
export function zSuctionMToSvgY(zM: number): number {
  const t = clampDomainValue((zM - -5) / 25, 0, 1);
  return Number((152 - t * 104).toFixed(1));
}

/** Invert V-101 vessel SVG y in [48, 152] back to zSuctionM in [-5, 20] m. */
export function svgYToZSuctionM(vy: number): number {
  const t = clampDomainValue((152 - vy) / 104, 0, 1);
  return clampDomainValue(-5 + t * 25, -5, 20, 0.5);
}

/** Map control valve pressure drop valveDpPsi in [2, 90] psi to actuator stem SVG y in [112, 74]. */
export function valveDpPsiToSvgY(dpPsi: number): number {
  const t = clampDomainValue((dpPsi - 2) / 88, 0, 1);
  return Number((112 - t * 38).toFixed(1));
}

/** Invert actuator stem SVG y in [74, 112] back to valveDpPsi in [2, 90] psi. */
export function svgYToValveDpPsi(vy: number): number {
  const t = clampDomainValue((112 - vy) / 38, 0, 1);
  return clampDomainValue(2 + t * 88, 2, 90, 2);
}

export interface HydraulicsCurveParams {
  flowGpm: number;
  dInnerM: number;
  lengthM: number;
  zSuctionM: number;
  pSuctionPsig: number;
  npshrM: number;
  valveDpPsi?: number;
}

export function buildHydraulicsCurveGeometry(params: HydraulicsCurveParams) {
  const { flowGpm, dInnerM, lengthM, zSuctionM, pSuctionPsig, npshrM, valveDpPsi = 30 } = params;
  const qMin = 20;
  const qMax = 600;
  const plotX = 44;
  const plotW = 252;
  const plotY = 22;
  const plotH = 126;
  const hMaxM = 80;

  const toX = (q: number) => plotX + clampDomainValue((q - qMin) / (qMax - qMin), 0, 1) * plotW;
  const toY = (hM: number) => plotY + (1 - clampDomainValue(hM / hMaxM, 0, 1)) * plotH;

  const pAbsPa = (pSuctionPsig + 14.6959) * 6894.757;
  const baseNpshM = (pAbsPa - 3169.0) / (998.2 * 9.80665) + zSuctionM;
  const valveHeadAtRefM = (valveDpPsi * 6894.757) / (998.2 * 9.80665);

  const headSysAtQ = (qGpm: number): number => {
    const qM3s = qGpm * 6.30902e-5;
    const area = (Math.PI * dInnerM * dInnerM) / 4;
    const vel = qM3s / Math.max(area, 1e-4);
    const re = (998.2 * vel * dInnerM) / 0.001;
    const fDarcy = 0.25 / Math.pow(Math.log10(0.000045 / (3.7 * dInnerM) + 5.74 / Math.pow(Math.max(re, 2100), 0.9)), 2);
    const hfM = (fDarcy * (lengthM / dInnerM) + 4.5) * ((vel * vel) / (2 * 9.80665));
    const hValveM = valveHeadAtRefM * Math.pow(qGpm / 250, 2);
    return Math.max(0, -zSuctionM) + hfM + hValveM + 5.0;
  };

  const headPumpAtQ = (qGpm: number): number => Math.max(52 - 0.00011 * qGpm * qGpm, 4);
  const npshaAtQ = (qGpm: number): number => Math.max(baseNpshM - 0.8 * Math.pow(qGpm / 250, 1.8), 0.2);

  const pumpPts: string[] = [];
  const sysPts: string[] = [];
  const npshPts: string[] = [];
  for (let i = 0; i <= 30; i += 1) {
    const q = qMin + ((qMax - qMin) * i) / 30;
    pumpPts.push(`${toX(q).toFixed(1)},${toY(headPumpAtQ(q)).toFixed(1)}`);
    sysPts.push(`${toX(q).toFixed(1)},${toY(headSysAtQ(q)).toFixed(1)}`);
    npshPts.push(`${toX(q).toFixed(1)},${toY(npshaAtQ(q) * 3.0).toFixed(1)}`);
  }

  const markerFor = (q: number) => ({
    q,
    x: Number(toX(q).toFixed(1)),
    ySys: Number(toY(headSysAtQ(q)).toFixed(1)),
    hSysM: Number(headSysAtQ(q).toFixed(2)),
    npshaM: Number(npshaAtQ(q).toFixed(2)),
  });

  const svgXToFlowGpm = (vx: number): number => {
    const u = clampDomainValue((vx - plotX) / plotW, 0, 1);
    return clampDomainValue(qMin + u * (qMax - qMin), qMin, qMax, 5);
  };

  return {
    pumpHeadPoints: pumpPts.join(' '),
    sysHeadPoints: sysPts.join(' '),
    npshaPoints: npshPts.join(' '),
    npshrY: Number(toY(npshrM * 3.0).toFixed(1)),
    case70: markerFor(0.7 * flowGpm),
    case100: markerFor(flowGpm),
    case120: markerFor(1.2 * flowGpm),
    svgXToFlowGpm,
  };
}
