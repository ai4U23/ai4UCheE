// Deterministic Chemical Engineering Error-Signature Detector, K-T Temporal Rate-of-Change (Δt)
// Metadata, & Prof. H. Scott Fogler ICG-Style Detective Completion Seal Generator.
// Inspired by Khan Academy's `Perseus` numeric-signature grader, PetroSkills OTS temporal alarms,
// and University of Michigan CRE Interactive Computer Games (Fogler & LeBlanc, 2008).
import type { WorkbenchId, WorkbenchLivePayload } from '../actions/view-screen';
import { getFoglerCaseForWorkbench } from './fogler-problem-solving-catalog';
import { evaluateSixStageProgress } from './hypothesis-verification-engine';
import { getStudentProfile, type StudentProfileState } from './student-adaptive-model';

export type CheErrorSignatureKind =
  | 'fanning_darcy_4x' | 'psig_psia_datum' | 'celsius_kelvin_offset' | 'ln_log10_factor'
  | 'hydraulic_cavitation_deficit' | 'column_flooding_excess' | 'runaway_or_pore_diffusion';

export interface CheErrorSignatureMatch {
  kind: CheErrorSignatureKind;
  badgeTitle: string;
  plainExplanation: string;
  mathSignature: string;
  citation: string;
}

export interface TemporalFaultClue {
  workbenchId: WorkbenchId;
  timeHorizonBadge: string;
  rateOfChangeClue: string;
  falsifiesDecoyId: string;
  falsifiesReason: string;
}

export const TEMPORAL_FAULT_CLUES: Readonly<Record<WorkbenchId, TemporalFaultClue>> = {
  'wb1-visual-verifier': {
    workbenchId: 'wb1-visual-verifier',
    timeHorizonBadge: '⏱️ Δt = 0 hr (Instantaneous Day-1 Design Audit)',
    rateOfChangeClue: 'Discrepancy appeared at t = 0 before fluid ever corroded or scaled the pipe.',
    falsifiesDecoyId: 'wb1-h1',
    falsifiesReason: 'Ruling out H1: Pipe wall corrosion/scaling takes weeks, whereas an exact 4.00× jump on Day 1 is a Darcy f_D vs. Fanning f_F convention error.',
  },
  'wb2-thermo-dippr': {
    workbenchId: 'wb2-thermo-dippr',
    timeHorizonBadge: '⏱️ Δt = Steady-State Subcooled Startup (25 °C vs 100 °C)',
    rateOfChangeClue: 'Gauge reads 0.0 psig continuously while vessel sits at 298 K (P_sat = 7.9 kPa << 101.3 kPa).',
    falsifiesDecoyId: 'wb2-h1',
    falsifiesReason: 'Ruling out H1: 0 psig is NOT 0 psia vacuum—it is 14.696 psia (101.325 kPa) atmospheric pressure.',
  },
  'wb3-hydraulics': {
    workbenchId: 'wb3-hydraulics',
    timeHorizonBadge: '⏱️ Δt = 3 Hours (Rapid Upset vs. 6-Week Scaling)',
    rateOfChangeClue: 'Pump cavitation & Boiler Feedwater Heater exit drop (70 °C → 42 °C) developed in just 3 hours.',
    falsifiesDecoyId: 'wb3-h3',
    falsifiesReason: 'Ruling out H3 [Fogler Ch. 10, p. 228]: Hard mineral scale takes weeks to build up; a 3-hour drop points to vacuum suction / gas blanketing / flooded steam trap.',
  },
  'wb4-distillation': {
    workbenchId: 'wb4-distillation',
    timeHorizonBadge: '⏱️ Δt = 8 Minutes After Reflux Step-Change',
    rateOfChangeClue: 'Column ΔP spiked immediately after operator raised R/R_min from 1.3 to 1.9 in a 0.55 m shell.',
    falsifiesDecoyId: 'wb4-h1',
    falsifiesReason: 'Ruling out H1/H3: Relative volatility α = 2.45 did not vanish; boosting reflux R increased vapor boilup V_rect = (R+1)D past 85% Fair flooding.',
  },
  'wb6-kinetics-reactors': {
    workbenchId: 'wb6-kinetics-reactors',
    timeHorizonBadge: '⏱️ Δt = Exponential Thermal Spike (Semenov ψ > 0.368)',
    rateOfChangeClue: 'Jacket temperature accelerates exponentially while core pellet effectiveness stalls at η = 45.4%.',
    falsifiesDecoyId: 'wb6-h1',
    falsifiesReason: 'Ruling out H1: Irreversible catalyst poisoning causes a gradual activity decay, whereas oversized pellets (φ = 5.5) + ψ = 0.52 > 1/e trigger immediate pore starvation and runaway.',
  },
  'wb5-handbook-atlas': {
    workbenchId: 'wb5-handbook-atlas',
    timeHorizonBadge: '⏱️ Δt = Pre-Commissioning Design Review (Sec 11 & Sec 23)',
    rateOfChangeClue: '1-2 Exchanger exhibits a steady temperature cross (Bowman F_T = 0.62 < 0.75) alongside a 150 psig relief valve spec.',
    falsifiesDecoyId: 'wb5-h1',
    falsifiesReason: 'Ruling out H1: Fouling is not why F_T < 0.75; internal shell back-mixing requires 2+ shell passes, and API 520 requires psia = psig + 14.696.',
  },
};

/** Inspect a numeric reading against an exact target for classic ChE ratio/offset mistakes (Khan Perseus style). */
export function detectNumericErrorSignature(userVal: number, exactVal: number): CheErrorSignatureMatch | null {
  if (!Number.isFinite(userVal) || !Number.isFinite(exactVal) || exactVal === 0) return null;
  if (Math.abs(userVal - exactVal) / Math.abs(exactVal) <= 0.05) return null;
  const ratio = userVal / exactVal;
  const diff = userVal - exactVal;

  if (ratio > 3.6 && ratio < 4.4) {
    return {
      kind: 'fanning_darcy_4x', badgeTitle: '🔍 4.0× Darcy vs. Fanning Signature Detected',
      plainExplanation: `Your number (${userVal}) is ~4× the Perry Fanning value (${exactVal}). You read or applied Moody's Darcy friction factor f_D = 4·f_F instead of Fanning f_F!`,
      mathSignature: 'f_D / f_F = 4.000', citation: "[Perry's 9th Ed., Fig. 6-9, p. 6-10 & Eqs. 6-37..6-39, p. 6-11]",
    };
  }
  if (Math.abs(Math.abs(diff) - 14.696) < 1.2 || Math.abs(Math.abs(diff) - 101.325) < 4.0) {
    return {
      kind: 'psig_psia_datum', badgeTitle: '🔍 Gauge vs. Absolute Pressure (+14.7 psi) Trap Detected',
      plainExplanation: `Your value differs by ~1 atm (14.696 psi / 101.325 kPa). Always convert gauge pressure (psig) to absolute pressure (psia = psig + 14.696) before using thermodynamic or NPSHa equations!`,
      mathSignature: 'P_psia = P_psig + 14.696', citation: "[Perry's 9th Ed., Sec. 1 & Table 2-8, p. 2-53]",
    };
  }
  if (Math.abs(Math.abs(diff) - 273.15) < 5.0) {
    return {
      kind: 'celsius_kelvin_offset', badgeTitle: '🔍 Celsius (°C) vs. Absolute Kelvin (K) Offset Detected',
      plainExplanation: `Your value is off by ~273.15. DIPPR Eq. 101 and Arrhenius rate laws require absolute temperature T [K] = T [°C] + 273.15!`,
      mathSignature: 'T(K) = T(°C) + 273.15', citation: "[Perry's 9th Ed., Table 2-8, p. 2-53; Fogler 7th Ed., Ch. 3]",
    };
  }
  if (Math.abs(ratio - Math.LN10) < 0.18 || Math.abs(1 / ratio - Math.LN10) < 0.18) {
    return {
      kind: 'ln_log10_factor', badgeTitle: '🔍 Natural Log (ln) vs. Base-10 Log (log₁₀) 2.303× Trap Detected',
      plainExplanation: `Your value is off by a factor of ln(10) ≈ 2.3026. Check whether the correlation uses natural log (ln, DIPPR Eq. 101) vs. common log (log₁₀, Antoine)!`,
      mathSignature: 'ln(x) = 2.3026 · log₁₀(x)', citation: "[Perry's 9th Ed., Table 2-8, p. 2-53]",
    };
  }
  return null;
}

/** Inspect live workbench payload to explain *why* the current plant number or reading is wrong. */
export function detectLiveWorkbenchErrorSignature(
  wb: WorkbenchId,
  payload?: WorkbenchLivePayload,
): CheErrorSignatureMatch | null {
  const inputs = (payload?.inputs ?? {}) as Record<string, unknown>;
  if (wb === 'wb1-visual-verifier') {
    return detectNumericErrorSignature(Number(inputs.userReading ?? 0.018), Number(inputs.exactValue ?? 0.0045));
  }
  if (wb === 'wb2-thermo-dippr') {
    const tempK = Number(inputs.tempK ?? 373.15);
    if (tempK < 350) {
      return {
        kind: 'psig_psia_datum', badgeTitle: '🔍 Subcooled Liquid & 0 psig = 14.696 psia Trap Active',
        plainExplanation: `At T = ${tempK.toFixed(1)} K (${(tempK - 273.15).toFixed(1)} °C), P_sat is well below atmospheric pressure (101.325 kPa = 14.696 psia = 0.00 psig). Scrub T to 373.15 K (100 °C) for water to boil at 0 psig!`,
        mathSignature: 'P_vp(373.15 K) = 101.325 kPa = 14.696 psia (0 psig)', citation: "[Perry's 9th Ed., Table 2-8, p. 2-53]",
      };
    }
  }
  if (wb === 'wb3-hydraulics') {
    const pSuc = Number(inputs.pSuctionPsig ?? 2);
    const flow = Number(inputs.flowGpm ?? 250);
    if (pSuc < 0 || flow > 380) {
      return {
        kind: 'hydraulic_cavitation_deficit', badgeTitle: '🔍 Vacuum Suction & Frictional Q² Cavitation Trap Active',
        plainExplanation: `Suction pressure is ${pSuc} psig (${(pSuc + 14.696).toFixed(2)} psia) at Q = ${flow} gpm. Because line friction h_f scales with Q², NPSHa drops below NPSHr!`,
        mathSignature: 'P_abs = P_psig + 14.696 psia; h_f ∝ Q²', citation: "[Perry's 9th Ed., Sec. 10, pp. 10-24..28]",
      };
    }
  }
  if (wb === 'wb4-distillation') {
    const rMult = Number(inputs.rMult ?? 1.3);
    const colD = Number(inputs.colDiamM ?? 0.85);
    if (rMult > 1.65 || colD < 0.65) {
      return {
        kind: 'column_flooding_excess', badgeTitle: '🔍 High Reflux Boilup (V = (R+1)D) & Narrow Column Trap Active',
        plainExplanation: `R/R_min = ${rMult.toFixed(2)} in a D_c = ${colD.toFixed(2)} m shell drives superficial vapor velocity u_v ∝ V/D_c² above 85% of Fair flooding!`,
        mathSignature: 'u_v = 4·(R+1)D / (π·D_c²·ρ_V) < 0.85·u_flood', citation: "[Perry's 9th Ed., Fig. 14-32, p. 14-37]",
      };
    }
  }
  if (wb === 'wb6-kinetics-reactors') {
    const phi = Number(inputs.thielePhi ?? 1.4);
    const psi = Number(inputs.semenovPsi ?? 0.28);
    if (phi > 2.5 || psi > 0.368) {
      return {
        kind: 'runaway_or_pore_diffusion', badgeTitle: '🔍 Dual Semenov Runaway (ψ > 0.368) & Thiele Pore Starvation (φ > 2) Trap',
        plainExplanation: `Thiele φ = ${phi.toFixed(2)} starves the pellet interior while Semenov ψ = ${psi.toFixed(2)} exceeds 1/e ≈ 0.368. Lower φ ≤ 1.5 and ψ ≤ 0.30!`,
        mathSignature: 'ψ ≤ 1/e ≈ 0.368 & φ ≤ 2.0', citation: "[Fogler 7th Ed., Ch. 12 & 15; Crowl & Louvar Ch. 8]",
      };
    }
  }
  return null;
}

/** Compute Prof. Fogler's ICG-style Detective Completion Stamp (deterministic verification code). */
export function buildFoglerDetectiveStamp(
  wb: WorkbenchId,
  profile: StudentProfileState = getStudentProfile(),
  solved: boolean = false,
): { code: string; tierLabel: string; isGoldDiy: boolean } {
  const spec = getFoglerCaseForWorkbench(wb);
  const stage = evaluateSixStageProgress(wb, { solved });
  const diySolved = (profile.solvedMissionIds ?? []).includes(spec.missionId) && !(profile.autoFixMissionIds ?? []).includes(spec.missionId);
  const allHypCorrect = stage.correctHypothesisCount === stage.totalHypothesisCount;
  const isGoldDiy = (diySolved || solved) && allHypCorrect;

  const rawKey = `${profile.studentName}|${wb}|${stage.correctHypothesisCount}/${stage.totalHypothesisCount}|${isGoldDiy ? 'DIY' : 'ASSIST'}`;
  let hash = 2166136261;
  for (let i = 0; i < rawKey.length; i += 1) {
    hash ^= rawKey.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  const hex = (hash >>> 0).toString(16).toUpperCase().padStart(8, '0').slice(0, 6);
  const wbShort = wb.split('-')[0].toUpperCase();
  const modeTag = isGoldDiy ? 'DIY' : stage.correctHypothesisCount > 0 ? 'HYP' : 'INIT';
  const code = `FOG-${wbShort}-${modeTag}-${hex}`;
  const tierLabel = isGoldDiy
    ? `🏅 Gold Detective Stamp (${code}) — DIY Solved + ${stage.correctHypothesisCount}/${stage.totalHypothesisCount} Hypotheses`
    : `🕵️ Detective Stamp: ${code} (${stage.correctHypothesisCount}/${stage.totalHypothesisCount} Hypotheses · ${diySolved ? 'DIY' : 'In Progress'})`;

  return { code, tierLabel, isGoldDiy };
}
