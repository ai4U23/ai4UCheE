// Analytical math helpers for Subject 4 (WB6) interactive CRE & Reactor Safety companion diagrams:
// 1. Semenov Thermal Runaway S-Curve G(T) vs. R(T) (Fogler 7th Ed. Ch. 12, Eqs. 12-30..12-33, pp. 637-639 · Crowl & Louvar 4th Ed. Ch. 8)
// 2. Multiple Reactions Series/Parallel Selectivity C_A, C_B, C_C(tau) & Non-Ideal RTD Tanks-in-Series E(Theta; N) (Fogler Ch. 8 & Ch. 16-18)
// 3. Electrochemical Butler-Volmer / Tafel / Koutecky-Levich Polarization Curve i(eta) (Fogler Ch. 19, Eqs. 19-6..19-11, pp. 1007-1015)
import { clampDomainValue } from './svg-drag-math';

export interface SemenovThermalSolution {
  tcK: number;
  semenovPsi: number;
  slopeKappa: number;
  isRunaway: boolean;
  steadyStatesK: number[];
  curvePts: Array<{ tK: number; gHeat: number; rHeat: number }>;
}

/**
 * Evaluate Fogler Ch. 12 & Crowl & Louvar Ch. 8 CSTR Energy Balance:
 * G(T) = (-dH_rxn) * X_eq(T) = (-dH_rxn) * tau*k(T) / (1 + tau*k(T)), R(T) = Cp*(1+kappa)*(T - T_c).
 */
export function solveSemenovThermalCurve(rawTcK: number, rawPsi: number): SemenovThermalSolution {
  const tcK = clampDomainValue(rawTcK, 310, 420, 1);
  const semenovPsi = clampDomainValue(rawPsi, 0.05, 0.95, 0.01);
  const slopeKappa = Number((0.42 / Math.max(semenovPsi, 0.08)).toFixed(3));
  const isRunaway = semenovPsi > 1 / Math.E || tcK > 382;

  const evalG = (t: number): number => {
    const tauK = Math.exp((t - 395) / 18.5);
    return Number((tauK / (1 + tauK)).toFixed(4));
  };
  const evalR = (t: number): number => {
    const raw = ((t - tcK) / 140) * Math.min(Math.max(slopeKappa, 0.55), 2.4);
    return Number(clampDomainValue(raw, 0, 1.35).toFixed(4));
  };

  const curvePts: Array<{ tK: number; gHeat: number; rHeat: number }> = [];
  const steadyStatesK: number[] = [];
  let prevDiff = 0;
  for (let i = 0; i <= 40; i += 1) {
    const tK = 310 + (170 * i) / 40;
    const gHeat = evalG(tK);
    const rHeat = evalR(tK);
    curvePts.push({ tK: Number(tK.toFixed(1)), gHeat, rHeat });
    const diff = gHeat - rHeat;
    if (i > 0 && prevDiff * diff <= 0) {
      steadyStatesK.push(Number(tK.toFixed(1)));
    }
    prevDiff = diff;
  }

  return { tcK, semenovPsi, slopeKappa, isRunaway, steadyStatesK, curvePts };
}

export interface SeriesSelectivityRtdSolution {
  tauMin: number;
  tauOptMin: number;
  tanksN: number;
  caNorm: number;
  cbNorm: number;
  ccNorm: number;
  cbMaxNorm: number;
  selectivityBC: number;
  varianceSigma2: number;
  seriesPts: Array<{ tau: number; ca: number; cb: number; cc: number }>;
  rtdPts: Array<{ theta: number; eTheta: number }>;
}

/**
 * Evaluate Fogler Ch. 8 Series Reaction A ->(k1) B ->(k2) C in PFR/Batch + Ch. 16-18 Tanks-in-Series RTD E(Theta; N):
 * tau_opt = ln(k2/k1)/(k2 - k1), C_B/C_A0 = (k1/(k2-k1))*(exp(-k1*tau) - exp(-k2*tau)),
 * E(Theta) = N * (N*Theta)^(N-1) / (N-1)! * exp(-N*Theta).
 */
export function solveSeriesSelectivityAndRtd(rawTauMin: number, rawTanksN: number): SeriesSelectivityRtdSolution {
  const k1 = 0.45; // min^-1
  const k2 = 0.18; // min^-1
  const tauOptMin = Number((Math.log(k2 / k1) / (k2 - k1)).toFixed(2)); // ~3.39 min
  const tauMin = clampDomainValue(rawTauMin, 0.2, 12.0, 0.1);
  const tanksN = Math.round(clampDomainValue(rawTanksN, 1, 25, 1));

  const evalComp = (t: number) => {
    const ca = Math.exp(-k1 * t);
    const cb = (k1 / (k2 - k1)) * (Math.exp(-k1 * t) - Math.exp(-k2 * t));
    const cc = Math.max(0, 1 - ca - cb);
    return {
      ca: Number(ca.toFixed(4)),
      cb: Number(cb.toFixed(4)),
      cc: Number(cc.toFixed(4)),
    };
  };

  const op = evalComp(tauMin);
  const opt = evalComp(tauOptMin);
  const selectivityBC = Number((op.cb / Math.max(op.cc, 0.005)).toFixed(2));
  const varianceSigma2 = Number((1 / tanksN).toFixed(3));

  const seriesPts: Array<{ tau: number; ca: number; cb: number; cc: number }> = [];
  for (let i = 0; i <= 30; i += 1) {
    const tau = (12.0 * i) / 30;
    seriesPts.push({ tau: Number(tau.toFixed(2)), ...evalComp(tau) });
  }

  // Stirling-safe log-gamma approximation for (N-1)!
  let logFact = 0;
  for (let m = 2; m < tanksN; m += 1) logFact += Math.log(m);
  const rtdPts: Array<{ theta: number; eTheta: number }> = [];
  for (let i = 0; i <= 30; i += 1) {
    const theta = (2.5 * i) / 30;
    const eTheta =
      theta <= 0
        ? tanksN === 1
          ? 1.0
          : 0.0
        : Math.exp(
            Math.log(tanksN) +
              (tanksN - 1) * Math.log(tanksN * theta) -
              logFact -
              tanksN * theta,
          );
    rtdPts.push({ theta: Number(theta.toFixed(2)), eTheta: Number(Math.min(eTheta, 2.2).toFixed(4)) });
  }

  return {
    tauMin,
    tauOptMin,
    tanksN,
    caNorm: op.ca,
    cbNorm: op.cb,
    ccNorm: op.cc,
    cbMaxNorm: opt.cb,
    selectivityBC,
    varianceSigma2,
    seriesPts,
    rtdPts,
  };
}

export interface ButlerVolmerSolution {
  overpotentialV: number;
  iLimMaCm2: number;
  iKineticMaCm2: number;
  iActualMaCm2: number;
  massTransferLimited: boolean;
  curvePts: Array<{ etaV: number; iKin: number; iKl: number }>;
}

/**
 * Evaluate Fogler 7th Ed. Ch. 19 Electrochemical Catalysis Butler-Volmer & Koutecky-Levich Equation:
 * i_kin = i_0 * (exp(alpha_a*F*eta/(RT)) - exp(-alpha_c*F*eta/(RT))), 1/i = 1/i_kin + 1/i_L
 * [Fogler 7th Ed., Ch. 19, Eqs. 19-6..19-11, pp. 1007-1015].
 */
export function solveButlerVolmerCurve(rawEtaV: number, rawILimMaCm2: number): ButlerVolmerSolution {
  const overpotentialV = clampDomainValue(rawEtaV, -0.5, 0.8, 0.02);
  const iLimMaCm2 = clampDomainValue(rawILimMaCm2, 15, 160, 5);
  const i0 = 1.8; // Exchange current density (mA/cm^2)
  const fOverRt = 19.4; // alpha * F / (R*T) at 298 K with alpha = 0.5

  const evalAt = (eta: number) => {
    const iKin = i0 * (Math.exp(fOverRt * eta * 0.45) - Math.exp(-fOverRt * eta * 0.45));
    const sign = iKin >= 0 ? 1 : -1;
    const absKin = Math.abs(iKin);
    const absKl = (absKin * iLimMaCm2) / Math.max(absKin + iLimMaCm2, 1e-4);
    return {
      iKin: Number(clampDomainValue(iKin, -200, 200).toFixed(2)),
      iKl: Number((sign * absKl).toFixed(2)),
    };
  };

  const op = evalAt(overpotentialV);
  const massTransferLimited = Math.abs(op.iKl) >= 0.75 * iLimMaCm2;
  const curvePts: Array<{ etaV: number; iKin: number; iKl: number }> = [];
  for (let i = 0; i <= 32; i += 1) {
    const etaV = -0.5 + (1.3 * i) / 32;
    curvePts.push({ etaV: Number(etaV.toFixed(3)), ...evalAt(etaV) });
  }

  return {
    overpotentialV,
    iLimMaCm2,
    iKineticMaCm2: op.iKin,
    iActualMaCm2: op.iKl,
    massTransferLimited,
    curvePts,
  };
}
