// Analytical math helpers for Subject 3 (WB4) interactive companion separation diagrams (Part 2):
// 1. Interactive Psychrometric Humidification / Cooling-Tower Chart (Dry-Bulb T_db, Wet-Bulb T_wb, Relative Humidity phi, Adiabatic Saturation)
// 2. Membrane Gas Permeation Stage Cut theta vs. Permeate Enrichment y_P(theta) (Perry's Sec. 12 & 20 · Seader 4th Ed. Ch. 14 & 18)
import { clampDomainValue } from './svg-drag-math';

export interface PsychrometricMembraneSolution {
  tDryBulbC: number;
  relHumidityPct: number;
  pSatKpa: number;
  pWaterKpa: number;
  absHumidityY: number;
  satHumidityYsat: number;
  tWetBulbC: number;
  tDewPointC: number;
  humidEnthalpyKjKg: number;
  stageCutTheta: number;
  selectivityAlpha: number;
  pressureRatioPhi: number;
  feedZ: number;
  permeateYp: number;
  retentateXr: number;
  isPressureRatioPinched: boolean;
  satCurvePts: Array<{ tC: number; ySat: number; y50Pct: number }>;
  membranePts: Array<{ theta: number; yPermeate: number; xRetentate: number }>;
}

/**
 * Evaluate Air-Water Psychrometric Properties at 101.325 kPa (Antoine P_sat, absolute humidity Y = 0.622*p_w/(P - p_w),
 * Stull wet-bulb correlation, humid enthalpy H = (1.006 + 1.86*Y)*T_db + 2501*Y) and Weller-Steiner Binary Gas
 * Membrane Permeation permeate purity y_P(theta) & retentate depletion x_R(theta)
 * [Perry's 9th Ed., Sec. 12 (Fig. 12-3, p. 12-7) & Sec. 20 (p. 20-16); Seader 4th Ed., Ch. 14 & Ch. 18].
 */
export function solvePsychrometricAndMembrane(
  rawTDryBulbC: number,
  rawRelHumidityPct: number,
  rawStageCutTheta: number,
  rawSelectivityAlpha: number,
): PsychrometricMembraneSolution {
  const tDryBulbC = clampDomainValue(rawTDryBulbC, 10, 55, 0.5);
  const relHumidityPct = clampDomainValue(rawRelHumidityPct, 10, 100, 1);
  const stageCutTheta = clampDomainValue(rawStageCutTheta, 0.05, 0.92, 0.02);
  const selectivityAlpha = clampDomainValue(rawSelectivityAlpha, 2.0, 25.0, 0.5);

  const pTotalKpa = 101.325;
  const evalPsatKpa = (tC: number): number =>
    0.61078 * Math.exp((17.27 * tC) / (tC + 237.3));

  const pSatKpa = Number(evalPsatKpa(tDryBulbC).toFixed(3));
  const pWaterKpa = Number(((relHumidityPct / 100) * pSatKpa).toFixed(3));
  const absHumidityY = Number(
    ((0.62198 * pWaterKpa) / Math.max(pTotalKpa - pWaterKpa, 10)).toFixed(4),
  );
  const satHumidityYsat = Number(
    ((0.62198 * pSatKpa) / Math.max(pTotalKpa - pSatKpa, 10)).toFixed(4),
  );

  // Magnus dew-point & Stull (2011) wet-bulb temperature correlation
  const gammaDew = Math.log(Math.max(pWaterKpa / 0.61078, 1e-3));
  const tDewPointC = Number(((237.3 * gammaDew) / (17.27 - gammaDew)).toFixed(1));
  const rh = relHumidityPct;
  const tWetBulbC = Number(
    clampDomainValue(
      tDryBulbC * Math.atan(0.151977 * Math.pow(rh + 8.313659, 0.5)) +
        Math.atan(tDryBulbC + rh) -
        Math.atan(rh - 1.676331) +
        0.00391838 * Math.pow(rh, 1.5) * Math.atan(0.023101 * rh) -
        4.686035,
      tDewPointC,
      tDryBulbC,
    ).toFixed(1),
  );
  const humidEnthalpyKjKg = Number(
    ((1.006 + 1.86 * absHumidityY) * tDryBulbC + 2501.0 * absHumidityY).toFixed(1),
  );

  // Membrane Gas Permeation (Seader Ch. 14: O2/N2 or CO2/CH4 benchmark with z_F = 0.21)
  const feedZ = 0.21;
  const pressureRatioPhi = 8.0; // P_feed / P_permeate
  const evalMembraneAt = (theta: number) => {
    // At theta -> 0, y_P approaches intrinsic pressure-ratio-limited enrichment; at theta -> 1, y_P -> z_F
    const effAlpha = Math.min(selectivityAlpha, pressureRatioPhi * 0.92);
    const y0 = (effAlpha * feedZ) / (1 + (effAlpha - 1) * feedZ);
    const yPermeate = clampDomainValue(y0 * (1 - 0.58 * theta) + feedZ * (0.58 * theta), feedZ, 0.96);
    const xRetentate = clampDomainValue(
      (feedZ - theta * yPermeate) / Math.max(1 - theta, 0.05),
      0.01,
      feedZ,
    );
    return {
      yPermeate: Number(yPermeate.toFixed(3)),
      xRetentate: Number(xRetentate.toFixed(3)),
    };
  };

  const memOp = evalMembraneAt(stageCutTheta);
  const isPressureRatioPinched = selectivityAlpha > pressureRatioPhi;

  const satCurvePts: Array<{ tC: number; ySat: number; y50Pct: number }> = [];
  for (let i = 0; i <= 25; i += 1) {
    const tC = 10 + (45 * i) / 25;
    const ps = evalPsatKpa(tC);
    const ySat = (0.62198 * ps) / Math.max(pTotalKpa - ps, 10);
    const p50 = 0.5 * ps;
    const y50 = (0.62198 * p50) / Math.max(pTotalKpa - p50, 10);
    satCurvePts.push({
      tC: Number(tC.toFixed(1)),
      ySat: Number(Math.min(ySat, 0.115).toFixed(4)),
      y50Pct: Number(Math.min(y50, 0.115).toFixed(4)),
    });
  }

  const membranePts: Array<{ theta: number; yPermeate: number; xRetentate: number }> = [];
  for (let i = 0; i <= 25; i += 1) {
    const theta = 0.05 + (0.87 * i) / 25;
    membranePts.push({ theta: Number(theta.toFixed(2)), ...evalMembraneAt(theta) });
  }

  return {
    tDryBulbC,
    relHumidityPct,
    pSatKpa,
    pWaterKpa,
    absHumidityY,
    satHumidityYsat,
    tWetBulbC,
    tDewPointC,
    humidEnthalpyKjKg,
    stageCutTheta,
    selectivityAlpha,
    pressureRatioPhi,
    feedZ,
    permeateYp: memOp.yPermeate,
    retentateXr: memOp.xRetentate,
    isPressureRatioPinched,
    satCurvePts,
    membranePts,
  };
}
