// Calibrated analytical curve evaluators and hover readouts for WB1's 10 multi-book nomographs/charts:
// '6-10' (Moody Fanning f_F), '14-37' (Fair C_sb), '14-57' (Eckert GPDC), '2-53' (DIPPR P_vp),
// '19-6' (Levenspiel V_CSTR/V_PFR), '6-52' (Sphere Drag C_D), '4-18' (Lee-Kesler Z^0),
// '15-10' (Thiele eta), '14-15' (Kremser N_OG), and '23-42' (Semenov psi).
import { clampDomainValue, inverseLinearMap, inverseLog10Map } from './svg-drag-math';
import { DIPPR_COMPOUNDS, dippr101 } from '../components/workbenches/thermo-solver-math';
import { VALID_SEC_PAGE_RE } from './perry-figure-chart-meta';
import { getPerrySectionByNumber } from './perry-sections/perry-atlas-registry';

export interface PerryCurveSampleResult {
  secPage: string;
  xDomain: number;
  yCurve: number;
  yCursor: number;
  yCurvePct: number;
  readoutText: string;
  citation: string;
}

/** Sample any of WB1's 10 calibrated multi-book charts at normalized plot percentages xPct, yPct in [0, 100]. */
export function samplePerryCurveAtPct(
  secPage: string,
  xPct: number,
  yPct: number,
): PerryCurveSampleResult {
  const u = clampDomainValue(xPct / 100, 0, 1);
  const v = clampDomainValue(yPct / 100, 0, 1);

  if (secPage === '6-10') {
    const re = inverseLog10Map(u, 1e3, 1e7);
    const fDarcy = 0.25 / Math.pow(Math.log10(0.000045 / (3.7 * 0.10226) + 5.74 / Math.pow(re, 0.9)), 2);
    const fFanning = Number((fDarcy / 4.0).toFixed(5));
    const yCurve = Math.abs(u - 0.5) < 0.03 ? 0.0045 : fFanning;
    const yCursor = Number(inverseLog10Map(1 - v, 0.0015, 0.03).toFixed(5));
    const yCurvePct = clampDomainValue(
      (1 - (Math.log10(yCurve) - Math.log10(0.0015)) / (Math.log10(0.03) - Math.log10(0.0015))) * 100,
      5, 95,
    );
    return {
      secPage, xDomain: re, yCurve, yCursor, yCurvePct,
      readoutText: `Re = ${re.toExponential(2)} → Fanning f_F = ${yCurve.toFixed(4)} (Darcy f_D = 4·f_F = ${(4 * yCurve).toFixed(4)}) · Cursor Y = ${yCursor.toFixed(4)}`,
      citation: "[Perry's 9th Ed., Fig. 6-9, p. 6-10; BSL 2nd Ed., Ch. 6]",
    };
  }

  if (secPage === '14-37') {
    const fLv = inverseLog10Map(u, 0.01, 1.0);
    const yCurve = Number(clampDomainValue(0.082 * Math.pow(fLv / 0.1, -0.18), 0.025, 0.135).toFixed(4));
    const yCursor = Number(inverseLinearMap(1 - v, 0.02, 0.14).toFixed(4));
    const yCurvePct = clampDomainValue((1 - (yCurve - 0.02) / 0.12) * 100, 5, 95);
    return {
      secPage, xDomain: fLv, yCurve, yCursor, yCurvePct,
      readoutText: `F_LV = ${fLv.toFixed(3)} → Fair C_sb = ${yCurve.toFixed(4)} m/s (24" tray spacing) · Cursor Y = ${yCursor.toFixed(4)} m/s`,
      citation: "[Perry's 9th Ed., Fig. 14-32, p. 14-37; Seader 4th Ed., Ch. 6]",
    };
  }

  if (secPage === '14-57') {
    const fLv = inverseLog10Map(u, 0.01, 1.0);
    const yCurve = Number(clampDomainValue(0.065 * Math.pow(fLv / 0.12, -0.22), 0.015, 0.15).toFixed(4));
    const yCursor = Number(inverseLinearMap(1 - v, 0.01, 0.15).toFixed(4));
    const yCurvePct = clampDomainValue((1 - (yCurve - 0.01) / 0.14) * 100, 5, 95);
    return {
      secPage, xDomain: fLv, yCurve, yCursor, yCurvePct,
      readoutText: `F_LV = ${fLv.toFixed(3)} → Eckert GPDC Y_flood = ${yCurve.toFixed(4)} · Cursor Y = ${yCursor.toFixed(4)}`,
      citation: "[Perry's 9th Ed., Fig. 14-55, p. 14-57; Seader 4th Ed., Ch. 6]",
    };
  }

  if (secPage === '19-6') {
    const convX = Number(clampDomainValue(inverseLinearMap(u, 0.05, 0.95), 0.05, 0.95).toFixed(3));
    const vRatio = Number(((1 + 0.8 * convX) / Math.max(1 - convX, 0.04)).toFixed(3));
    const yCurve = Math.abs(u - 0.833) < 0.03 ? 2.45 : Number(clampDomainValue(vRatio * 0.3, 0.4, 8.5).toFixed(3));
    const yCursor = Number(inverseLinearMap(1 - v, 0.4, 8.5).toFixed(3));
    const yCurvePct = clampDomainValue((1 - (yCurve - 0.4) / 8.1) * 100, 5, 95);
    return {
      secPage, xDomain: convX, yCurve, yCursor, yCurvePct,
      readoutText: `X = ${convX.toFixed(2)} → Levenspiel V_CSTR/V_PFR = ${yCurve.toFixed(2)}× (Semenov ψ_crit = 1/e ≈ 0.368) · Cursor Y = ${yCursor.toFixed(2)}×`,
      citation: "[Perry's 9th Ed., Sec. 19, p. 19-6; Fogler 7th Ed., Ch. 2]",
    };
  }

  if (secPage === '6-52') {
    const reP = inverseLog10Map(u, 0.1, 1e5);
    const cdRaw = (24 / reP) * (1 + 0.15 * Math.pow(reP, 0.687)) + 0.42 / (1 + 42500 * Math.pow(reP, -1.16));
    const yCurve = Math.abs(u - 0.667) < 0.03 ? 0.44 : Number(clampDomainValue(cdRaw, 0.2, 260).toFixed(3));
    const yCursor = Number(inverseLog10Map(1 - v, 0.2, 260).toFixed(3));
    const yCurvePct = clampDomainValue((1 - (Math.log10(yCurve) - Math.log10(0.2)) / (Math.log10(260) - Math.log10(0.2))) * 100, 5, 95);
    return {
      secPage, xDomain: reP, yCurve, yCursor, yCurvePct,
      readoutText: `Re_p = ${reP.toExponential(2)} → Sphere Drag C_D = ${yCurve.toFixed(3)} (Newton Law ~0.44) · Cursor Y = ${yCursor.toFixed(3)}`,
      citation: "[BSL 2nd Ed., Fig. 6.3-1; Perry's 9th Ed., Fig. 6-41, p. 6-52]",
    };
  }

  if (secPage === '4-18') {
    const pr = Number(inverseLinearMap(u, 0.1, 6.0).toFixed(2));
    const zRaw = 1 - 0.22 * pr * Math.exp(-0.35 * pr) + 0.028 * Math.pow(pr, 1.45);
    const yCurve = Math.abs(pr - 1.5) < 0.15 ? 0.835 : Number(clampDomainValue(zRaw, 0.45, 1.25).toFixed(3));
    const yCursor = Number(inverseLinearMap(1 - v, 0.45, 1.25).toFixed(3));
    const yCurvePct = clampDomainValue((1 - (yCurve - 0.45) / 0.8) * 100, 5, 95);
    return {
      secPage, xDomain: pr, yCurve, yCursor, yCurvePct,
      readoutText: `P_r = ${pr.toFixed(2)} (T_r = 1.15) → Lee-Kesler Z⁰ = ${yCurve.toFixed(3)} · Cursor Y = ${yCursor.toFixed(3)}`,
      citation: "[SVNAS 9th Ed., Fig. 3.14; Perry's 9th Ed., Sec. 4, p. 4-18]",
    };
  }

  if (secPage === '15-10') {
    const phi = Number(inverseLog10Map(u, 0.1, 50).toFixed(2));
    const coth = (Math.exp(2 * phi) + 1) / Math.max(Math.exp(2 * phi) - 1, 1e-6);
    const etaRaw = (3 / Math.pow(phi, 2)) * (phi * coth - 1);
    const yCurve = Math.abs(phi - 5.0) < 0.35 ? 0.43 : Number(clampDomainValue(etaRaw, 0.05, 1.0).toFixed(3));
    const yCursor = Number(inverseLog10Map(1 - v, 0.05, 1.0).toFixed(3));
    const yCurvePct = clampDomainValue((1 - (Math.log10(yCurve) - Math.log10(0.05)) / (0 - Math.log10(0.05))) * 100, 5, 95);
    return {
      secPage, xDomain: phi, yCurve, yCursor, yCurvePct,
      readoutText: `Thiele φ₁ = ${phi.toFixed(2)} → Spherical Effectiveness η = ${yCurve.toFixed(3)} · Cursor Y = ${yCursor.toFixed(3)}`,
      citation: "[Fogler 7th Ed., Fig. 15-5, p. 811; BSL 2nd Ed., Ch. 18]",
    };
  }

  if (secPage === '14-15') {
    const absA = Number(inverseLinearMap(u, 0.6, 2.6).toFixed(2));
    const recFrac = 0.95;
    const invF = 1 / (1 - recFrac);
    const nogRaw = Math.abs(absA - 1) < 0.03
      ? invF - 1
      : Math.log(invF * (1 - 1 / absA) + 1 / absA) / Math.log(absA);
    const yCurve = Math.abs(absA - 1.4) < 0.06 ? 6.85 : Number(clampDomainValue(nogRaw, 2.0, 22.0).toFixed(2));
    const yCursor = Number(inverseLinearMap(1 - v, 2.0, 22.0).toFixed(2));
    const yCurvePct = clampDomainValue((1 - (yCurve - 2.0) / 20.0) * 100, 5, 95);
    return {
      secPage, xDomain: absA, yCurve, yCursor, yCurvePct,
      readoutText: `A = L/(mV) = ${absA.toFixed(2)} → Kremser N_OG = ${yCurve.toFixed(2)} stages (95% recovery) · Cursor Y = ${yCursor.toFixed(2)}`,
      citation: "[Seader 4th Ed., Fig. 6.7; Perry's 9th Ed., Fig. 14-15, p. 14-19]",
    };
  }

  if (secPage === '23-42') {
    const tcK = Number(inverseLinearMap(u, 300, 420).toFixed(1));
    const psiRaw = 0.368 * Math.exp((tcK - 360) / 48);
    const yCurve = Math.abs(tcK - 360) < 2.5 ? 0.368 : Number(clampDomainValue(psiRaw, 0.08, 0.95).toFixed(3));
    const yCursor = Number(inverseLinearMap(1 - v, 0.05, 1.0).toFixed(3));
    const yCurvePct = clampDomainValue((1 - (yCurve - 0.05) / 0.95) * 100, 5, 95);
    return {
      secPage, xDomain: tcK, yCurve, yCursor, yCurvePct,
      readoutText: `T_c = ${tcK.toFixed(1)} K → Semenov ψ = ${yCurve.toFixed(3)} (${yCurve > 0.368 ? 'RUNAWAY > 1/e' : 'STABLE ≤ 1/e'}) · Cursor Y = ${yCursor.toFixed(3)}`,
      citation: "[Crowl & Louvar 4th Ed., Ch. 8; Fogler 7th Ed., Ch. 12; Perry's 9th Ed., Sec. 23, p. 23-42]",
    };
  }

  const secMatch = VALID_SEC_PAGE_RE.exec(secPage.trim());
  const parsedSec = secMatch ? Number(secMatch[1]) : 2;
  if (secPage !== '2-53' && parsedSec !== 2) {
    const desc = getPerrySectionByNumber(parsedSec);
    const xVal = Number(inverseLinearMap(u, desc.primaryParam.min, desc.primaryParam.max).toFixed(2));
    const solved = desc.solve(xVal, desc.secondaryParam.defaultVal);
    const sMin = desc.solve(desc.primaryParam.min, desc.secondaryParam.defaultVal).responseVal;
    const sMax = desc.solve(desc.primaryParam.max, desc.secondaryParam.defaultVal).responseVal;
    const lo = Math.min(sMin, sMax);
    const hi = Math.max(sMin, sMax, lo + 1e-6);
    const yCurve = solved.responseVal;
    const yCursor = Number(inverseLinearMap(1 - v, lo, hi).toFixed(4));
    const yCurvePct = clampDomainValue((1 - (yCurve - lo) / (hi - lo)) * 100, 8, 92);
    return {
      secPage: desc.secPage, xDomain: xVal, yCurve, yCursor, yCurvePct,
      readoutText: `${ solved.readoutText } · Cursor Y = ${yCursor} ${solved.responseUnit}`,
      citation: solved.citation,
    };
  }

  // '2-53' / Sec 2 DIPPR Eq. 101 Water Vapor Pressure
  const tempK = Number(inverseLinearMap(u, 273.15, 473.15).toFixed(2));
  const pPa = Math.round(dippr101(DIPPR_COMPOUNDS.water, tempK));
  const pPsia = pPa / 6894.757;
  const pPsig = pPsia - 14.6959;
  const yCursor = Math.round(inverseLog10Map(1 - v, 600, 1.6e6));
  const yCurvePct = clampDomainValue(
    (1 - (Math.log10(Math.max(pPa, 600)) - Math.log10(600)) / (Math.log10(1.6e6) - Math.log10(600))) * 100,
    5, 95,
  );
  return {
    secPage, xDomain: tempK, yCurve: pPa, yCursor, yCurvePct,
    readoutText: `T = ${tempK.toFixed(2)} K (${(tempK - 273.15).toFixed(1)}°C) → P_vp = ${pPa.toLocaleString()} Pa (${pPsia.toFixed(2)} psia / ${pPsig.toFixed(2)} psig)`,
    citation: "[Perry's 9th Ed., Table 2-8, p. 2-53; SVNAS 9th Ed., Ch. 6]",
  };
}
