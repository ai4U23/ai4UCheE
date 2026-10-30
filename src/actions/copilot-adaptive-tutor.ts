// Adaptive Pedagogical Co-Pilot Tutor (`guided` | `socratic` | `challenge`) & Live Anomaly Fallback.
// Extracted from `copilot-responder.ts` to keep all action files strictly `< 200` LOC while providing:
// 1) 3-tier scaffolding coaching (`guided` worked recipe, `socratic` diagnostic hint, `challenge` EPC trade-off),
// 2) Live screen anomaly fallback (`diagnoseLiveScreenAnomalies`) when a student asks "Help, what's wrong?",
// 3) Compact `<student-profile>` XML injection for `gateway.ai4u.now` (`gemini-4-argon-low`).
import type { WorkbenchId, WorkbenchLivePayload } from './view-screen';
import {
  buildAdaptiveRecommendations,
  type AdaptiveRecommendation,
} from '../lib/adaptive-recommendation-engine';
import {
  detectLivePayloadTraps,
  getEffectiveScaffoldingLevel,
  getStudentProfile,
  recordPayloadObservation,
  serializeStudentProfileXml,
  type MisconceptionTrapId,
  type ScaffoldingLevel,
  type StudentProfileState,
} from '../lib/student-adaptive-model';

export interface AdaptiveCopilotMeta {
  studentName: string;
  scaffoldingLevel: ScaffoldingLevel;
  detectedTraps: MisconceptionTrapId[];
  nextRecommendation: AdaptiveRecommendation;
  studentProfileXml: string;
}

const SOCRATIC_HINTS: Record<WorkbenchId, string> = {
  'wb1-visual-verifier':
    '🕵️ Socratic Clue (Perry Fig. 6-9, p. 6-10): Compare your reading against the y-axis label — does Perry plot Fanning f_F or Moody Darcy f_D = 4·f_F? What factor separates 0.0180 from 0.0045?',
  'wb2-thermo-dippr':
    '🕵️ Socratic Clue (Perry Table 2-8, p. 2-53 & SVNA Ch. 12): Before checking boiling, convert gauge pressure via psia = psig + 14.696. At 373.15 K (100 °C), what is P_vp(water) in psia vs. psig?',
  'wb3-hydraulics':
    '🕵️ Socratic Clue (Perry Sec. 10, p. 10-28): Look at the NPSHa numerator (P_suc,abs - P_vp)/(ρg). When pSuctionPsig < 0, what happens to P_suc,abs = psig + 14.696 psia and the 1.0 m cavitation margin?',
  'wb4-distillation':
    '🕵️ Socratic Clue (Perry Sec. 13, p. 13-36 & Fig. 14-32): If vapor velocity exceeds 85% of Fair flooding, which two knobs reduce superficial vapor velocity u_v without sacrificing distillate purity x_D?',
  'wb6-kinetics-reactors':
    '🕵️ Socratic Clue (Fogler 7th Ed., Ch. 12 & 15; Crowl Ch. 8): Check your two dimensionless guards — is Thiele modulus φ ≤ 2 (so pellet effectiveness η ≥ 0.75) and is Semenov ψ ≤ 1/e ≈ 0.368?',
  'wb5-handbook-atlas':
    '🕵️ Socratic Clue (Perry Sec. 1–25): Inspect the active section citation and check whether gauge-to-absolute (+14.696 psia) or thermal cross (F_T ≥ 0.75) bounds your operating point.',
};

const CHALLENGE_PROBES: Record<WorkbenchId, string> = {
  'wb1-visual-verifier':
    '🏆 Mastery Challenge (BSL Ch. 6 & Perry p. 6-10): In fully rough turbulent flow (Re > 10⁶), why does f_F become independent of Re while ΔP still scales with v²?',
  'wb2-thermo-dippr':
    '🏆 Mastery Challenge (SVNA Ch. 12 & Perry Sec. 4): Why does Wilson G^E fail mathematically for liquid-liquid phase splitting (LLE), requiring NRTL (α_12) or UNIQUAC instead?',
  'wb3-hydraulics':
    '🏆 Mastery Challenge (Perry Sec. 8 & 10): Upsizing suction pipe from 4" to 6" raises NPSHa, but how does the reduced line ΔP shift the control valve pressure drop ratio and ISA-75.01 choked flow margin?',
  'wb4-distillation':
    '🏆 Mastery Challenge (Seader Ch. 7 & 9): Lowering R/R_min from 1.9 to 1.3 stops tray flooding, but how does it change theoretical stage count N (Gilliland) and reboiler/condenser duty?',
  'wb6-kinetics-reactors':
    '🏆 Mastery Challenge (Fogler Ch. 5 & 15): Crushing catalyst pellets into smaller particles lowers Thiele φ (raising η → 1), but what penalty does the Ergun equation exact on packed-bed pressure drop y = P/P_0?',
  'wb5-handbook-atlas':
    '🏆 Mastery Challenge (Perry Sec. 11 & 23): Synthesize heat-exchanger temperature cross (Bowman F_T < 0.75) with downstream API 520 blocked-outlet relief sizing.',
};

/** Inspect live screen payload when a student asks a generic "what's wrong / help / hint" query. */
export function diagnoseLiveScreenAnomalies(
  workbench: WorkbenchId,
  payload: WorkbenchLivePayload,
  traps: MisconceptionTrapId[],
): string {
  if (traps.length === 0) return '';
  const rec = buildAdaptiveRecommendations(getStudentProfile(), { activeWorkbench: workbench, payload }).primaryRecommendation;
  return `🚨 Live Screen Trap Detected (${traps.join(', ')}): ${rec.title} — ${rec.rationale} ${rec.citation}`;
}

/** Compose adaptive coaching text + metadata for both Tier-1 and Tier-2 Co-Pilot paths. */
export function buildAdaptiveCopilotCoaching(input: {
  prompt: string;
  activeWorkbench: string;
  personaMode: 'learn' | 'plant';
  payload?: Record<string, unknown>;
  scaffoldingOverride?: ScaffoldingLevel;
  studentProfile?: Partial<StudentProfileState>;
}): { coachingBlock: string; meta: AdaptiveCopilotMeta } {
  const wb = (input.activeWorkbench || 'wb1-visual-verifier') as WorkbenchId;
  const livePayload = (input.payload ?? {}) as WorkbenchLivePayload;
  const observedProfile = Object.keys(livePayload.inputs ?? {}).length > 0
    ? recordPayloadObservation(wb, livePayload, 0)
    : getStudentProfile();
  const profile: StudentProfileState = {
    ...observedProfile,
    ...(input.studentProfile ?? {}),
    scaffoldingOverride: input.scaffoldingOverride ?? input.studentProfile?.scaffoldingOverride ?? observedProfile.scaffoldingOverride,
  };
  const level = getEffectiveScaffoldingLevel(profile, wb);
  const traps = detectLivePayloadTraps(wb, livePayload);
  const bundle = buildAdaptiveRecommendations(profile, { activeWorkbench: wb, payload: livePayload });
  const anomalyLine = diagnoseLiveScreenAnomalies(wb, livePayload, bundle.detectedTraps);

  const tierBlock =
    level === 'socratic'
      ? SOCRATIC_HINTS[wb] ?? SOCRATIC_HINTS['wb1-visual-verifier']
      : level === 'challenge'
        ? CHALLENGE_PROBES[wb] ?? CHALLENGE_PROBES['wb1-visual-verifier']
        : `🌱 Guided Step-by-Step (${profile.studentName}): Follow the numbered derivation below, or click "${bundle.primaryRecommendation.title}" to practice this concept.`;

  const recLine = `🧭 Next Recommended Step: ${bundle.primaryRecommendation.title} — ${bundle.primaryRecommendation.rationale}`;
  const coachingBlock = [anomalyLine, tierBlock, recLine].filter(Boolean).join('\n');

  return {
    coachingBlock,
    meta: {
      studentName: profile.studentName,
      scaffoldingLevel: level,
      detectedTraps: traps.length > 0 ? traps : bundle.detectedTraps,
      nextRecommendation: bundle.primaryRecommendation,
      studentProfileXml: serializeStudentProfileXml(profile, wb),
    },
  };
}
