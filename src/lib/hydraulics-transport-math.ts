// Analytical math helpers for Subject 2 (WB3) interactive companion transport/hydraulics diagrams:
// 1. BSL Non-Newtonian & Laminar/Turbulent Pipe Velocity Profile v_z(r)/v_max + Boundary Layer (BSL 2nd Ed. Ch. 2, 8, 10, 18)
// 2. ISA-75.01 Control Valve Choked Flow m_dot(sqrt(dP)) & Flashing Curve (Perry's Sec. 8, p. 8-71 · Crowl & Louvar Ch. 9)
import { clampDomainValue } from './svg-drag-math';

export interface BslPipeProfileSolution {
  powerLawN: number;
  prandtlPr: number;
  schmidtSc: number;
  reynolds: number;
  vAvgOverVmax: number;
  rheologyLabel: 'SHEAR_THINNING_PSEUDOPLASTIC' | 'NEWTONIAN_PARABOLIC' | 'SHEAR_THICKENING_DILATANT';
  deltaRatioThermal: number;
  deltaRatioMass: number;
  profilePts: Array<{ rOverR: number; vOverVmax: number; vTurbulent: number }>;
}

/**
 * Evaluate BSL Ch. 2 & Ch. 8 Power-Law Non-Newtonian velocity profile in a circular tube:
 * v_z(r)/v_max = 1 - (r/R)^((n+1)/n), with <v_z>/v_max = (n+1)/(3n+1),
 * plus Prandtl/Schmidt boundary-layer thickness ratios delta_T/delta_v = Pr^(-1/3), delta_c/delta_v = Sc^(-1/3).
 */
export function solveBslVelocityAndBoundaryLayer(
  rawN: number,
  rawPr: number,
  reynolds = 1.2e5,
  rawSc = 620,
): BslPipeProfileSolution {
  const powerLawN = clampDomainValue(rawN, 0.25, 1.85, 0.05);
  const prandtlPr = clampDomainValue(rawPr, 0.7, 50.0, 0.2);
  const schmidtSc = clampDomainValue(rawSc, 1.0, 1500.0, 10);

  const exponent = (powerLawN + 1) / powerLawN;
  const vAvgOverVmax = Number(((powerLawN + 1) / (3 * powerLawN + 1)).toFixed(3));
  const rheologyLabel: BslPipeProfileSolution['rheologyLabel'] =
    powerLawN < 0.93
      ? 'SHEAR_THINNING_PSEUDOPLASTIC'
      : powerLawN <= 1.07
        ? 'NEWTONIAN_PARABOLIC'
        : 'SHEAR_THICKENING_DILATANT';

  const deltaRatioThermal = Number(Math.pow(prandtlPr, -1 / 3).toFixed(3));
  const deltaRatioMass = Number(Math.pow(schmidtSc, -1 / 3).toFixed(3));

  const profilePts: Array<{ rOverR: number; vOverVmax: number; vTurbulent: number }> = [];
  for (let i = -20; i <= 20; i += 1) {
    const rSigned = i / 20;
    const rAbs = Math.abs(rSigned);
    const vOverVmax = Number(Math.max(0, 1 - Math.pow(rAbs, exponent)).toFixed(4));
    const vTurbulent = Number(Math.max(0, Math.pow(1 - rAbs, 1 / 7)).toFixed(4));
    profilePts.push({ rOverR: Number(rSigned.toFixed(2)), vOverVmax, vTurbulent });
  }

  return {
    powerLawN,
    prandtlPr,
    schmidtSc,
    reynolds,
    vAvgOverVmax,
    rheologyLabel,
    deltaRatioThermal,
    deltaRatioMass,
    profilePts,
  };
}

export interface IsaChokedValveSolution {
  valveDpPsi: number;
  p1Psia: number;
  p2Psia: number;
  pvPsia: number;
  ffFactor: number;
  flFactor: number;
  dpChokedPsi: number;
  dpEffPsi: number;
  qActualGpm: number;
  qChokedMaxGpm: number;
  isChoked: boolean;
  isFlashing: boolean;
  curvePts: Array<{ dpPsi: number; sqrtDp: number; qGpm: number; qIdealGpm: number }>;
}

/**
 * Evaluate ISA-75.01 / IEC 60534 liquid control valve choked flow & flashing curve:
 * dP_choked = F_L^2 * (P_1 - F_F * P_v), Q = C_v * sqrt(min(dP, dP_choked) / G_f)
 * [Perry's 9th Ed., Eqs. 8-77..8-81, p. 8-71 · Crowl & Louvar 4th Ed., Ch. 9].
 */
export function solveIsaValveChokedCurve(
  rawDpPsi: number,
  pSuctionPsig = 2.0,
  cvRated = 95.0,
  flFactor = 0.85,
): IsaChokedValveSolution {
  const valveDpPsi = clampDomainValue(rawDpPsi, 2, 90, 1);
  // Valve upstream absolute pressure P1 includes pump boost (~55 psi above suction)
  const p1Psia = Number((pSuctionPsig + 14.6959 + 55.0).toFixed(2));
  const pvPsia = 0.4596; // Water @ 298 K (3169 Pa)
  const pcPsia = 3200.1; // Water critical pressure
  const ffFactor = Number((0.96 - 0.28 * Math.sqrt(pvPsia / pcPsia)).toFixed(4));
  const dpChokedPsi = Number(Math.max(4.0, flFactor * flFactor * (p1Psia - ffFactor * pvPsia)).toFixed(2));
  const dpEffPsi = Math.min(valveDpPsi, dpChokedPsi);
  const p2Psia = Number((p1Psia - valveDpPsi).toFixed(2));

  const qActualGpm = Number((cvRated * Math.sqrt(dpEffPsi)).toFixed(1));
  const qChokedMaxGpm = Number((cvRated * Math.sqrt(dpChokedPsi)).toFixed(1));
  const isChoked = valveDpPsi >= dpChokedPsi;
  const isFlashing = p2Psia <= pvPsia;

  const curvePts: Array<{ dpPsi: number; sqrtDp: number; qGpm: number; qIdealGpm: number }> = [];
  for (let i = 0; i <= 30; i += 1) {
    const dp = 2 + (88 * i) / 30;
    const sqrtDp = Number(Math.sqrt(dp).toFixed(3));
    const qIdealGpm = Number((cvRated * sqrtDp).toFixed(1));
    const qGpm = Number((cvRated * Math.sqrt(Math.min(dp, dpChokedPsi))).toFixed(1));
    curvePts.push({ dpPsi: Number(dp.toFixed(1)), sqrtDp, qGpm, qIdealGpm });
  }

  return {
    valveDpPsi,
    p1Psia,
    p2Psia,
    pvPsia,
    ffFactor,
    flFactor,
    dpChokedPsi,
    dpEffPsi,
    qActualGpm,
    qChokedMaxGpm,
    isChoked,
    isFlashing,
    curvePts,
  };
}
