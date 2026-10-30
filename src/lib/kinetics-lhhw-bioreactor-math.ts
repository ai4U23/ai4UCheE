// Analytical math helpers for Subject 4 (WB6) interactive CRE & Bioreactor companion diagrams (Part 2):
// 1. Langmuir-Hinshelwood (LHHW) Dual-Site Catalytic Rate Roof -r'_A(P_A) with Catalyst Decay a(t) (Fogler 7th Ed. Ch. 10)
// 2. Bioreactor Monod Chemostat Productivity D*C_X(D) with Washout Cliff D_wash (Fogler 7th Ed. Ch. 9 · Perry's Sec. 19 & 20)
import { clampDomainValue } from './svg-drag-math';

export interface LhhwBioreactorSolution {
  pReactantBar: number;
  catalystTimeHr: number;
  kAdsA: number;
  pOptBar: number;
  catalystActivityA: number;
  rateFreshMolKgS: number;
  rateDecayedMolKgS: number;
  isSelfInhibitedRegime: boolean;
  dilutionRateHr: number;
  feedSubstrateGPerL: number;
  muMaxHr: number;
  ksGPerL: number;
  dOptHr: number;
  dWashoutHr: number;
  effluentSubstrateS: number;
  cellBiomassCx: number;
  productivityDCx: number;
  isWashedOut: boolean;
  lhhwPts: Array<{ pBar: number; rFresh: number; rDecayed: number }>;
  chemostatPts: Array<{ dHr: number; cxGPerL: number; prodGLHr: number }>;
}

/**
 * Evaluate Fogler Ch. 10 Dual-Site Langmuir-Hinshelwood-Hougen-Watson (LHHW) Catalytic Rate Roof:
 * -r'_A(P_A, t) = a(t) * k * K_A * P_A / (1 + K_A * P_A)^2, with maximum at P_A,opt = 1/K_A and 2nd-order sintering decay
 * a(t) = 1 / (1 + k_d * t), plus Fogler Ch. 9 Monod Chemostat Bioreactor:
 * S(D) = K_s * D / (mu_max - D), C_X(D) = Y_X/S * (S_0 - S(D)), Productivity = D * C_X(D)
 * [Fogler 7th Ed., Ch. 9 (pp. 445-472) & Ch. 10 (pp. 512-565); Perry's 9th Ed., Sec. 7 & 19].
 */
export function solveLhhwAndBioreactor(
  rawPReactantBar: number,
  rawCatalystTimeHr: number,
  rawDilutionRateHr: number,
  rawFeedSubstrateGPerL: number,
): LhhwBioreactorSolution {
  const pReactantBar = clampDomainValue(rawPReactantBar, 0.2, 12.0, 0.2);
  const catalystTimeHr = clampDomainValue(rawCatalystTimeHr, 0, 120, 2);
  const dilutionRateHr = clampDomainValue(rawDilutionRateHr, 0.04, 0.85, 0.02);
  const feedSubstrateGPerL = clampDomainValue(rawFeedSubstrateGPerL, 4.0, 30.0, 1.0);

  // LHHW dual-site surface reaction (A·S + S -> products): peak at P_A = 1 / K_A
  const kAdsA = 0.35; // bar^-1 -> P_opt = 2.86 bar
  const pOptBar = Number((1 / kAdsA).toFixed(2));
  const kIntrinsic = 14.0;
  const kDecay = 0.012; // hr^-1 sintering/coking constant
  const catalystActivityA = Number((1 / (1 + kDecay * catalystTimeHr)).toFixed(3));

  const evalLhhwFresh = (pBar: number): number =>
    (kIntrinsic * kAdsA * pBar) / Math.pow(1 + kAdsA * pBar, 2);

  const rateFreshMolKgS = Number(evalLhhwFresh(pReactantBar).toFixed(3));
  const rateDecayedMolKgS = Number((rateFreshMolKgS * catalystActivityA).toFixed(3));
  const isSelfInhibitedRegime = pReactantBar > pOptBar * 1.15;

  // Monod Chemostat Bioreactor (Fogler Ch. 9)
  const muMaxHr = 0.65; // hr^-1
  const ksGPerL = 1.2; // g/L
  const yieldYxs = 0.50; // g cell / g substrate
  const dWashoutHr = Number(
    ((muMaxHr * feedSubstrateGPerL) / (ksGPerL + feedSubstrateGPerL)).toFixed(3),
  );
  const dOptHr = Number(
    (muMaxHr * (1 - Math.sqrt(ksGPerL / (ksGPerL + feedSubstrateGPerL)))).toFixed(3),
  );

  const evalChemostat = (dHr: number) => {
    if (dHr >= dWashoutHr || dHr >= muMaxHr - 0.005) {
      return { sEff: feedSubstrateGPerL, cx: 0, prod: 0 };
    }
    const sEff = Math.min(feedSubstrateGPerL, (ksGPerL * dHr) / Math.max(muMaxHr - dHr, 0.005));
    const cx = Math.max(0, yieldYxs * (feedSubstrateGPerL - sEff));
    const prod = dHr * cx;
    return {
      sEff: Number(sEff.toFixed(2)),
      cx: Number(cx.toFixed(2)),
      prod: Number(prod.toFixed(3)),
    };
  };

  const bioOp = evalChemostat(dilutionRateHr);
  const isWashedOut = dilutionRateHr >= dWashoutHr;

  const lhhwPts: Array<{ pBar: number; rFresh: number; rDecayed: number }> = [];
  for (let i = 0; i <= 30; i += 1) {
    const pBar = 0.2 + (11.8 * i) / 30;
    const rf = evalLhhwFresh(pBar);
    lhhwPts.push({
      pBar: Number(pBar.toFixed(2)),
      rFresh: Number(rf.toFixed(3)),
      rDecayed: Number((rf * catalystActivityA).toFixed(3)),
    });
  }

  const chemostatPts: Array<{ dHr: number; cxGPerL: number; prodGLHr: number }> = [];
  for (let i = 0; i <= 32; i += 1) {
    const dHr = 0.02 + (0.83 * i) / 32;
    const pt = evalChemostat(dHr);
    chemostatPts.push({
      dHr: Number(dHr.toFixed(3)),
      cxGPerL: pt.cx,
      prodGLHr: pt.prod,
    });
  }

  return {
    pReactantBar,
    catalystTimeHr,
    kAdsA,
    pOptBar,
    catalystActivityA,
    rateFreshMolKgS,
    rateDecayedMolKgS,
    isSelfInhibitedRegime,
    dilutionRateHr,
    feedSubstrateGPerL,
    muMaxHr,
    ksGPerL,
    dOptHr,
    dWashoutHr,
    effluentSubstrateS: bioOp.sEff,
    cellBiomassCx: bioOp.cx,
    productivityDCx: bioOp.prod,
    isWashedOut,
    lhhwPts,
    chemostatPts,
  };
}
