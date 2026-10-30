// Analytical math helpers for Subject 1 (WB2) interactive companion charts (Part 2):
// 1. Rankine / Vapor-Compression Refrigeration T-S & P-H Cycle Dome (SVNAS 9th Ed. Ch. 8 & 9 · Perry's Sec. 4 & 24)
// 2. Chemical Reaction Equilibrium X_eq(T) with Adiabatic Operating Line (SVNAS 9th Ed. Ch. 14 · Fogler 7th Ed. Ch. 11)
import { clampDomainValue } from './svg-drag-math';

export interface RankineCycleSolution {
  etaIsentropic: number;
  pBoilerRatio: number;
  tBoilerK: number;
  tCondK: number;
  workIdealKjKg: number;
  workActualKjKg: number;
  qInKjKg: number;
  thermalEffCarnot: number;
  thermalEffActual: number;
  copRefrig: number;
  exitQualityX: number;
  isWetTurbineExhaust: boolean;
  domePts: Array<{ sKjKgK: number; tK: number }>;
  cyclePts: Array<{ sKjKgK: number; tK: number; label: string }>;
}

export interface RxnEquilibriumPoint {
  tK: number;
  xEq: number;
  xAdiabatic: number;
}

export interface RxnEquilibriumSolution {
  tInletK: number;
  deltaHrxnKjMol: number;
  kEqAtInlet: number;
  xEqAtInlet: number;
  tAdiabaticEqK: number;
  xAdiabaticEq: number;
  isExothermic: boolean;
  isEquilibriumPinched: boolean;
  curvePts: Array<{ tK: number; xEq: number; xAdiabatic: number }>;
}

/**
 * Evaluate SVNAS Ch. 8 & 9 Rankine Power / Vapor-Compression Cycle on a T-S saturation dome:
 * W_actual = eta_s * W_isentropic, eta_th = W_actual / Q_in, COP_R = T_C / (T_H - T_C) * eta_s
 * [SVNAS 9th Ed., Ch. 8 (pp. 285-305) & Ch. 9 (pp. 322-335); Perry's 9th Ed., Sec. 4 & 24].
 */
export function solveRankineCycleDome(
  rawEtaIsentropic: number,
  rawPBoilerRatio: number,
): RankineCycleSolution {
  const etaIsentropic = clampDomainValue(rawEtaIsentropic, 0.50, 0.98, 0.01);
  const pBoilerRatio = clampDomainValue(rawPBoilerRatio, 4.0, 120.0, 1.0);

  const tCondK = 315.0; // Condenser saturation temperature (K)
  const tBoilerK = Number(
    clampDomainValue(365 + 48 * Math.log10(pBoilerRatio), 390, 625).toFixed(1),
  );
  const thermalEffCarnot = Number(((tBoilerK - tCondK) / tBoilerK).toFixed(4));
  const qInKjKg = Number((1950 + 2.4 * (tBoilerK - 373.15)).toFixed(1));
  const workIdealKjKg = Number((qInKjKg * thermalEffCarnot * 0.78).toFixed(1));
  const workActualKjKg = Number((workIdealKjKg * etaIsentropic).toFixed(1));
  const thermalEffActual = Number((workActualKjKg / qInKjKg).toFixed(4));
  const copRefrig = Number(
    clampDomainValue((tCondK / Math.max(tBoilerK - tCondK, 25)) * etaIsentropic, 0.8, 8.5).toFixed(2),
  );

  // Isentropic expansion loses superheat at high boiler pressure; lower eta_s increases exit entropy and quality
  const sTurbIn = Number((7.22 - 0.55 * Math.log10(pBoilerRatio)).toFixed(3));
  const sTurbOut = Number((sTurbIn + (1 - etaIsentropic) * 0.95).toFixed(3));
  const sSatVapCond = 7.45;
  const sSatLiqCond = 1.35;
  const exitQualityX = Number(
    clampDomainValue((sTurbOut - sSatLiqCond) / (sSatVapCond - sSatLiqCond), 0.72, 1.05).toFixed(3),
  );
  const isWetTurbineExhaust = exitQualityX < 0.88;

  const domePts: Array<{ sKjKgK: number; tK: number }> = [];
  for (let i = 0; i <= 28; i += 1) {
    const u = i / 28;
    const sKjKgK = Number((1.1 + u * 6.7).toFixed(2));
    const tDome = 300 + 347 * Math.max(0, 1 - Math.pow((u - 0.48) / 0.52, 2));
    domePts.push({ sKjKgK, tK: Number(tDome.toFixed(1)) });
  }

  const cyclePts = [
    { sKjKgK: sSatLiqCond, tK: tCondK, label: '1 (Pump In)' },
    { sKjKgK: sSatLiqCond + 0.08, tK: tBoilerK, label: '2 (Boiler Sat Liq)' },
    { sKjKgK: sTurbIn, tK: Number((tBoilerK + 45).toFixed(1)), label: '3 (Turbine In)' },
    { sKjKgK: sTurbOut, tK: tCondK, label: '4 (Turbine Exhaust)' },
    { sKjKgK: sSatLiqCond, tK: tCondK, label: '1' },
  ];

  return {
    etaIsentropic,
    pBoilerRatio,
    tBoilerK,
    tCondK,
    workIdealKjKg,
    workActualKjKg,
    qInKjKg,
    thermalEffCarnot,
    thermalEffActual,
    copRefrig,
    exitQualityX,
    isWetTurbineExhaust,
    domePts,
    cyclePts,
  };
}

/**
 * Evaluate SVNAS Ch. 14 & Fogler Ch. 11 Van 't Hoff Chemical Reaction Equilibrium X_eq(T)
 * coupled with Adiabatic Energy Balance X_EB(T) = Cp*(T - T0)/(-dH_rxn)
 * [SVNAS 9th Ed., Ch. 14, Eq. 14.17; Fogler 7th Ed., Ch. 11, Eqs. 11-18..11-23].
 */
export function solveRxnEquilibriumCurve(
  rawTInletK: number,
  rawDeltaHrxnKjMol: number,
): RxnEquilibriumSolution {
  const tInletK = clampDomainValue(rawTInletK, 300, 560, 2);
  const deltaHrxnKjMol = clampDomainValue(rawDeltaHrxnKjMol, -95, 75, 5);
  const rGasKjMolK = 0.008314;
  const tRefK = 420.0;
  const cpKjMolK = 0.165; // Molar heat capacity (kJ/(mol·K))

  const evalKeq = (tK: number): number => {
    const lnK = (-deltaHrxnKjMol / rGasKjMolK) * (1 / tK - 1 / tRefK);
    return Math.exp(clampDomainValue(lnK, -8, 8));
  };
  const evalXeq = (tK: number): number => {
    const k = evalKeq(tK);
    return Number((k / (1 + k)).toFixed(4));
  };
  const evalXAdiabatic = (tK: number): number => {
    const denom = Math.abs(deltaHrxnKjMol) < 8 ? -35 : deltaHrxnKjMol;
    const raw = (cpKjMolK * (tK - tInletK)) / -denom;
    return Number(clampDomainValue(raw, 0, 1.05).toFixed(4));
  };

  const kEqAtInlet = Number(evalKeq(tInletK).toFixed(3));
  const xEqAtInlet = evalXeq(tInletK);
  const isExothermic = deltaHrxnKjMol < 0;

  const curvePts: Array<{ tK: number; xEq: number; xAdiabatic: number }> = [];
  let bestDiff = 999;
  let tAdiabaticEqK = tInletK;
  let xAdiabaticEq = xEqAtInlet;

  for (let i = 0; i <= 35; i += 1) {
    const tK = 300 + (320 * i) / 35;
    const xEq = evalXeq(tK);
    const xAdiabatic = evalXAdiabatic(tK);
    curvePts.push({ tK: Number(tK.toFixed(1)), xEq, xAdiabatic });
    const diff = Math.abs(xEq - xAdiabatic);
    if (xAdiabatic > 0.01 && xAdiabatic < 0.99 && diff < bestDiff) {
      bestDiff = diff;
      tAdiabaticEqK = Number(tK.toFixed(1));
      xAdiabaticEq = Number(((xEq + xAdiabatic) / 2).toFixed(3));
    }
  }

  const isEquilibriumPinched = isExothermic && xAdiabaticEq < 0.45;

  return {
    tInletK,
    deltaHrxnKjMol,
    kEqAtInlet,
    xEqAtInlet,
    tAdiabaticEqK,
    xAdiabaticEq,
    isExothermic,
    isEquilibriumPinched,
    curvePts,
  };
}
