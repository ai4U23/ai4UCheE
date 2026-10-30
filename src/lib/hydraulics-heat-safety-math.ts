// Analytical math helpers for Subject 2 (WB3) interactive heat transfer & process safety diagrams:
// 1. Shell-and-Tube Heat Exchanger T-Q Temperature Cross & Bowman F_T + Nukiyama Pool Boiling Curve (BSL Ch. 10, 12, 14 · Perry's Sec. 5 & 11)
// 2. Crowl & Louvar Process Safety: Ternary Flammability Triangle (Fuel-O2-N2 LOC) & Pasquill-Gifford Downwind Plume C(x) (Crowl & Louvar 4th Ed. Ch. 5 & 6 · Perry's Sec. 23)
import { clampDomainValue } from './svg-drag-math';

export interface HeatExchangerBoilingSolution {
  tColdOutC: number;
  deltaTExcessC: number;
  tHotInC: number;
  tHotOutC: number;
  tColdInC: number;
  lmtdCounterC: number;
  rRatio: number;
  pEffectiveness: number;
  bowmanFt: number;
  hasTemperatureCross: boolean;
  isFtUnacceptable: boolean;
  qFluxWm2: number;
  boilingRegime: 'NATURAL_CONVECTION' | 'NUCLEATE_BOILING' | 'TRANSITION_UNSTABLE' | 'FILM_BOILING_RADIATIVE';
  isNearChfBurnout: boolean;
  hxProfilePts: Array<{ qNorm: number; tHotC: number; tColdC: number }>;
  nukiyamaPts: Array<{ dTeC: number; log10Q: number }>;
}

/**
 * Evaluate Shell-and-Tube 1-2 Heat Exchanger T-Q profile + Bowman-Mueller-Nagle F_T correction factor
 * and Nukiyama Water Pool Boiling curve q''(DeltaT_excess) at 1 atm (Rohsenow nucleate, Zuber CHF ~1.16e6 W/m^2,
 * Berenson Leidenfrost ~120 C) [BSL 2nd Ed. Ch. 10, 12, 14 · Perry's 9th Ed., Sec. 5 & Sec. 11, Fig. 11-3].
 */
export function solveHeatExchangerAndBoiling(
  rawTColdOutC: number,
  rawDeltaTExcessC: number,
): HeatExchangerBoilingSolution {
  const tHotInC = 160;
  const tHotOutC = 92;
  const tColdInC = 30;
  const tColdOutC = clampDomainValue(rawTColdOutC, 50, 138, 1);
  const deltaTExcessC = clampDomainValue(rawDeltaTExcessC, 1.5, 450, 1);

  const dt1 = Math.max(4, tHotInC - tColdOutC);
  const dt2 = Math.max(4, tHotOutC - tColdInC);
  const lmtdCounterC = Number(
    (Math.abs(dt1 - dt2) < 0.5 ? dt1 : (dt1 - dt2) / Math.log(dt1 / dt2)).toFixed(2),
  );
  const rRatio = Number(((tHotInC - tHotOutC) / Math.max(tColdOutC - tColdInC, 1)).toFixed(3));
  const pEffectiveness = Number(((tColdOutC - tColdInC) / (tHotInC - tColdInC)).toFixed(3));
  const hasTemperatureCross = tColdOutC > tHotOutC;

  // Calibrated 1-shell, 2-tube pass Bowman F_T factor dropping sharply when T_c,out crosses T_h,out
  const crossExcess = Math.max(0, tColdOutC - (tHotOutC - 8));
  const bowmanFt = Number(clampDomainValue(0.985 - 0.0085 * crossExcess - 0.00018 * crossExcess * crossExcess, 0.42, 0.99).toFixed(3));
  const isFtUnacceptable = bowmanFt < 0.75;

  const evalNukiyamaFlux = (dTe: number): number => {
    if (dTe <= 5) {
      return 1200 * Math.pow(dTe, 1.25); // Natural convection
    }
    if (dTe <= 30) {
      // Nucleate boiling Rohsenow ~ dTe^3 up to Zuber CHF ~1.16e6 W/m^2 at dTe = 30 C
      const u = (dTe - 5) / 25;
      return 9000 * Math.pow(1 + u * 4.05, 3);
    }
    if (dTe <= 120) {
      // Unstable transition boiling down to Leidenfrost point (~3.2e4 W/m^2 at 120 C)
      const u = (dTe - 30) / 90;
      return 1.16e6 * Math.pow(0.0276, u);
    }
    // Stable film boiling (Bromley + radiation)
    return 3.2e4 * Math.pow(dTe / 120, 1.38);
  };

  const qFluxWm2 = Number(evalNukiyamaFlux(deltaTExcessC).toFixed(0));
  const boilingRegime: HeatExchangerBoilingSolution['boilingRegime'] =
    deltaTExcessC <= 5
      ? 'NATURAL_CONVECTION'
      : deltaTExcessC <= 30
        ? 'NUCLEATE_BOILING'
        : deltaTExcessC <= 120
          ? 'TRANSITION_UNSTABLE'
          : 'FILM_BOILING_RADIATIVE';
  const isNearChfBurnout = deltaTExcessC >= 24 && deltaTExcessC <= 125;

  const hxProfilePts: Array<{ qNorm: number; tHotC: number; tColdC: number }> = [];
  for (let i = 0; i <= 20; i += 1) {
    const qNorm = Number((i / 20).toFixed(2));
    const tHotC = Number((tHotInC - qNorm * (tHotInC - tHotOutC)).toFixed(1));
    const tColdC = Number((tColdOutC - qNorm * (tColdOutC - tColdInC)).toFixed(1));
    hxProfilePts.push({ qNorm, tHotC, tColdC });
  }

  const nukiyamaPts: Array<{ dTeC: number; log10Q: number }> = [];
  for (let i = 0; i <= 32; i += 1) {
    const logDte = Math.log10(1.5) + (i / 32) * (Math.log10(450) - Math.log10(1.5));
    const dTeC = Number(Math.pow(10, logDte).toFixed(2));
    const log10Q = Number(Math.log10(evalNukiyamaFlux(dTeC)).toFixed(3));
    nukiyamaPts.push({ dTeC, log10Q });
  }

  return {
    tColdOutC, deltaTExcessC, tHotInC, tHotOutC, tColdInC, lmtdCounterC, rRatio, pEffectiveness,
    bowmanFt, hasTemperatureCross, isFtUnacceptable, qFluxWm2, boilingRegime, isNearChfBurnout,
    hxProfilePts, nukiyamaPts,
  };
}

export interface ProcessSafetyFlammabilityPlumeSolution {
  fuelMolPct: number;
  o2MolPct: number;
  n2MolPct: number;
  locO2Pct: number;
  lflFuelPct: number;
  uflFuelPct: number;
  flammabilityZone: 'FLAMMABLE_EXPLOSIVE' | 'INERTED_BELOW_LOC' | 'FUEL_LEAN_SAFE' | 'FUEL_RICH_NEEDS_PURGE';
  downwindDistM: number;
  windSpeedMs: number;
  sigmaYM: number;
  sigmaZM: number;
  centerlineConcPpm: number;
  erpg2ThresholdPpm: number;
  exceedsErpg2: boolean;
  plumePts: Array<{ xM: number; concPpm: number }>;
}

/**
 * Evaluate Crowl & Louvar 4th Ed. Ch. 6 Flammability Diagram (Methane/Hydrocarbon-O2-N2 LOC = 12% O2, LFL = 5%, UFL = 15%)
 * and Ch. 5 Pasquill-Gifford Downwind Gaussian Plume Dispersion C(x,0,0) = Q_m / (pi * u * sigma_y * sigma_z) * exp(-H^2/(2*sigma_z^2))
 * [Crowl & Louvar 4th Ed., Ch. 5 (pp. 188-206) & Ch. 6 (pp. 255-275); Perry's 9th Ed., Sec. 23].
 */
export function solveProcessSafetyFlammabilityAndPlume(
  rawFuelMolPct: number,
  rawO2MolPct: number,
  rawDownwindDistM: number,
  rawWindSpeedMs: number,
): ProcessSafetyFlammabilityPlumeSolution {
  const fuelMolPct = clampDomainValue(rawFuelMolPct, 0.5, 45.0, 0.5);
  const maxO2 = Math.max(1.0, 99.0 - fuelMolPct);
  const o2MolPct = clampDomainValue(rawO2MolPct, 1.0, Math.min(21.0, maxO2), 0.5);
  const n2MolPct = Number(Math.max(0, 100 - fuelMolPct - o2MolPct).toFixed(1));

  const locO2Pct = 12.0;
  const lflFuelPct = 5.0;
  const uflFuelPct = 15.0 + (21.0 - o2MolPct) * -0.45; // Upper flammability narrows toward LOC nose

  const flammabilityZone: ProcessSafetyFlammabilityPlumeSolution['flammabilityZone'] =
    o2MolPct < locO2Pct
      ? 'INERTED_BELOW_LOC'
      : fuelMolPct < lflFuelPct
        ? 'FUEL_LEAN_SAFE'
        : fuelMolPct <= Math.max(lflFuelPct + 1.5, uflFuelPct)
          ? 'FLAMMABLE_EXPLOSIVE'
          : 'FUEL_RICH_NEEDS_PURGE';

  const downwindDistM = clampDomainValue(rawDownwindDistM, 50, 2000, 25);
  const windSpeedMs = clampDomainValue(rawWindSpeedMs, 1.0, 12.0, 0.5);
  const qReleaseGps = 110.0; // Continuous toxic/flammable vapor release (g/s)
  const stackHeightM = 4.0; // Effective release height H (m) with ground reflection
  const erpg2ThresholdPpm = 50.0;

  const evalPlumePpm = (xM: number) => {
    const sigmaY = 0.08 * xM * Math.pow(1 + 0.0001 * xM, -0.5);
    const sigmaZ = 0.06 * xM * Math.pow(1 + 0.0015 * xM, -0.5);
    const cGramM3 =
      ((2 * qReleaseGps) / (Math.PI * windSpeedMs * sigmaY * sigmaZ)) *
      Math.exp(-(stackHeightM * stackHeightM) / (2 * sigmaZ * sigmaZ));
    const concPpm = Number(clampDomainValue(cGramM3 * 719, 0.1, 1200).toFixed(1));
    return { sigmaY: Number(sigmaY.toFixed(2)), sigmaZ: Number(sigmaZ.toFixed(2)), concPpm };
  };

  const op = evalPlumePpm(downwindDistM);
  const plumePts: Array<{ xM: number; concPpm: number }> = [];
  for (let i = 0; i <= 30; i += 1) {
    const xM = 50 + (1950 * i) / 30;
    plumePts.push({ xM: Number(xM.toFixed(0)), concPpm: evalPlumePpm(xM).concPpm });
  }

  return {
    fuelMolPct, o2MolPct, n2MolPct, locO2Pct, lflFuelPct,
    uflFuelPct: Number(Math.max(lflFuelPct, uflFuelPct).toFixed(1)),
    flammabilityZone, downwindDistM, windSpeedMs, sigmaYM: op.sigmaY, sigmaZM: op.sigmaZ,
    centerlineConcPpm: op.concPpm, erpg2ThresholdPpm, exceedsErpg2: op.concPpm >= erpg2ThresholdPpm, plumePts,
  };
}
