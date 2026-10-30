// Deterministic Adaptive Recommendation Engine: ranks next best actions (live hazard remediation,
// weakest-concept mission, Socratic drills, and dynamic Co-Pilot starter prompts) from the
// student's Browser Scorecard (`student-adaptive-model.ts`) and live `<current-screen>` payload.
import type { ClientScreenState, WorkbenchId, WorkbenchLivePayload } from '../actions/view-screen';
import { GUIDED_MISSIONS, type GuidedMissionScenario } from '../components/shell/mission-scenarios';
import { detectLivePayloadTraps, getEffectiveScaffoldingLevel, getStudentProfile, MISSION_CONCEPT, type MisconceptionTrapId, type ScaffoldingLevel, type StudentProfileState } from './student-adaptive-model';

export interface AdaptiveRecommendation {
  id: string;
  kind: 'trap-remediation' | 'next-mission' | 'socratic-drill' | 'atlas-deep-dive';
  title: string; rationale: string; citation: string; targetWorkbench: WorkbenchId;
  missionId?: string; promptToAsk?: string; mutations?: Record<string, number | string>;
}

export interface RankedMissionStatus {
  mission: GuidedMissionScenario; solved: boolean; usedAutoFix: boolean;
  masteryScore: number; isRecommendedNext: boolean; reasonBadge: string;
}

export interface AdaptiveRecommendationBundle {
  primaryRecommendation: AdaptiveRecommendation; rankedMissions: RankedMissionStatus[];
  scaffoldingLevel: ScaffoldingLevel; detectedTraps: MisconceptionTrapId[];
}

const TRAP_REMEDIATION: Record<MisconceptionTrapId, Omit<AdaptiveRecommendation, 'id' | 'kind'>> = {
  fanning_4x_trap: {
    title: 'Fix 4× Darcy vs. Fanning Convention Trap',
    rationale: 'Your Fig. 6-9 reading (~0.018) is the Moody Darcy factor f_D = 4·f_F; Perry plots Fanning f_F (~0.0045).',
    citation: "[Perry's 9th Ed., Fig. 6-9, p. 6-10; BSL Ch. 6]",
    targetWorkbench: 'wb1-visual-verifier',
    missionId: 'mission-fanning-trap',
    promptToAsk: 'Why is Moody f_D = 4 × Fanning f_F on Perry Fig. 6-9?',
    mutations: { userReading: '0.0045' },
  },
  psig_psia_trap: {
    title: 'Convert Gauge Pressure (psig) to Absolute (psia)',
    rationale: 'Negative gauge suction pressure must be converted via psia = psig + 14.696 before evaluating NPSHa.',
    citation: "[Perry's 9th Ed., Sec. 10, p. 10-28]",
    targetWorkbench: 'wb3-hydraulics',
    missionId: 'mission-pump-npsha',
    promptToAsk: 'How does converting suction psig + 14.696 to psia prevent pump cavitation?',
    mutations: { pSuctionPsig: 15, flowGpm: 260, npshrM: 3 },
  },
  wilson_lle_trap: {
    title: 'Switch from Wilson to NRTL/UNIQUAC for LLE',
    rationale: 'Wilson local-composition G^E mathematically cannot predict two liquid phases (LLE split).',
    citation: "[Perry's 9th Ed., Sec. 4, p. 4-18; SVNA 9th Ed., Ch. 12]",
    targetWorkbench: 'wb2-thermo-dippr',
    promptToAsk: 'Why does the Wilson equation fail to predict liquid-liquid equilibrium (LLE)?',
  },
  npsha_cavitation_trap: {
    title: 'Rescue Pump P-101 Suction Cavitation (NPSHa < NPSHr)',
    rationale: 'Live suction head is below NPSHr + 1.0 m margin — raise suction pressure or pipe diameter.',
    citation: "[Perry's 9th Ed., Sec. 10, pp. 10-24..28]",
    targetWorkbench: 'wb3-hydraulics',
    missionId: 'mission-pump-npsha',
    promptToAsk: 'Give me a Socratic hint to rescue Pump P-101 cavitation without spoiling the numbers.',
    mutations: { flowGpm: 260, pSuctionPsig: 15, npshrM: 3 },
  },
  flooding_trap: {
    title: 'Relieve Distillation Column Entrainment Flooding',
    rationale: 'Vapor velocity exceeds Fair Souders-Brown flooding ceiling (>85% flood).',
    citation: "[Perry's 9th Ed., Fig. 14-32, p. 14-37; Seader Ch. 7]",
    targetWorkbench: 'wb4-distillation',
    missionId: 'mission-distillation',
    promptToAsk: 'How do reflux ratio R/R_min and column diameter D_c trade off to stop tray flooding?',
    mutations: { rMult: 1.3, colDiamM: 0.85 },
  },
  thiele_diffusion_trap: {
    title: 'Relieve Catalyst Pore-Diffusion Limitation (Thiele φ > 2)',
    rationale: 'High Thiele modulus φ starves the catalyst pellet interior and drops effectiveness η.',
    citation: "[Fogler 7th Ed., Ch. 15; BSL 2nd Ed., Ch. 18; Perry's Sec. 19]",
    targetWorkbench: 'wb6-kinetics-reactors',
    missionId: 'mission-kinetics-runaway',
    promptToAsk: 'How does reducing pellet size lower Thiele modulus φ and restore effectiveness η?',
    mutations: { thielePhi: 1.1 },
  },
  semenov_runaway_trap: {
    title: 'Stabilize Reactor Thermal Runaway (Semenov ψ > 0.368)',
    rationale: 'Semenov number ψ exceeds e⁻¹ ≈ 0.368 — heat generation overtakes coolant removal.',
    citation: "[Fogler 7th Ed., Ch. 12; Crowl & Louvar 4th Ed., Ch. 8]",
    targetWorkbench: 'wb6-kinetics-reactors',
    missionId: 'mission-kinetics-runaway',
    promptToAsk: 'Why is ψ_crit = 1/e ≈ 0.368 the Semenov thermal runaway boundary?',
    mutations: { conversionX: 0.8, thielePhi: 1.1, semenovPsi: 0.24 },
  },
};

export function buildAdaptiveRecommendations(
  profile: StudentProfileState = getStudentProfile(),
  screenState?: Pick<ClientScreenState, 'activeWorkbench' | 'payload'>,
): AdaptiveRecommendationBundle {
  const wb = ((screenState?.activeWorkbench ?? 'wb1-visual-verifier') as WorkbenchId);
  const payload = (screenState?.payload ?? {}) as WorkbenchLivePayload;
  const liveTraps = detectLivePayloadTraps(wb, payload);
  const detectedTraps = liveTraps.length > 0 ? liveTraps : profile.activeTraps;
  const scaffoldingLevel = getEffectiveScaffoldingLevel(profile, wb);

  // Score and rank missions: prioritize auto-fixed (needs retry), then unsolved with lowest mastery.
  const scored = GUIDED_MISSIONS.map((mission) => {
    const concept = MISSION_CONCEPT[mission.id] ?? 'chart-fanning-darcy';
    const masteryScore = profile.conceptMastery[concept] ?? 0.4;
    const solved = profile.solvedMissionIds.includes(mission.id);
    const usedAutoFix = profile.autoFixMissionIds.includes(mission.id);
    const urgency = (solved ? 0 : 100) + (usedAutoFix ? 60 : 0) + Math.round((1 - masteryScore) * 50);
    const reasonBadge = usedAutoFix
      ? '🔄 Retry without Auto-Fix'
      : !solved
        ? `⭐ Next up (${Math.round(masteryScore * 100)}% mastery)`
        : '✓ Mastered';
    return { mission, solved, usedAutoFix, masteryScore, urgency, reasonBadge };
  });

  const topMissionEntry = [...scored].sort((a, b) => b.urgency - a.urgency)[0];
  const rankedMissions: RankedMissionStatus[] = scored.map((entry) => ({
    mission: entry.mission,
    solved: entry.solved,
    usedAutoFix: entry.usedAutoFix,
    masteryScore: entry.masteryScore,
    isRecommendedNext: entry.mission.id === topMissionEntry.mission.id,
    reasonBadge: entry.reasonBadge,
  }));

  if (detectedTraps.length > 0) {
    const trap = detectedTraps[0];
    const spec = TRAP_REMEDIATION[trap];
    return {
      primaryRecommendation: { id: `rec-${trap}`, kind: 'trap-remediation', ...spec },
      rankedMissions,
      scaffoldingLevel,
      detectedTraps,
    };
  }

  const nextM = topMissionEntry.mission;
  const allSolved = scored.every((s) => s.solved && !s.usedAutoFix);
  const primaryRecommendation: AdaptiveRecommendation = allSolved
    ? {
        id: 'rec-atlas-synthesis',
        kind: 'atlas-deep-dive',
        title: '🏆 All Core Missions Solved — Explore 25-Section Perry Atlas',
        rationale: 'You mastered all 5 core missions! Stress-test multi-book cases in Sec. 11 LMTD & Sec. 23 API 520.',
        citation: "[Perry's 9th Ed., Sec. 11 & 23, pp. 11-6, 23-32]",
        targetWorkbench: 'wb5-handbook-atlas',
        promptToAsk: 'Challenge me with a Plant Mode trade-off between Sec 11 LMTD cross and Sec 23 relief sizing.',
      }
    : {
        id: `rec-${nextM.id}`,
        kind: 'next-mission',
        title: `Recommended Mission: ${nextM.buttonLabel}`,
        rationale: topMissionEntry.usedAutoFix
          ? 'You used Auto-Fix last time — solve it by scrubbing sliders yourself for full +35% mastery!'
          : `Focuses on your highest-priority concept (${Math.round(topMissionEntry.masteryScore * 100)}% mastery).`,
        citation: String(nextM.proofCard.data.citation ?? "[Perry's 9th Ed.]"),
        targetWorkbench: nextM.workbench,
        missionId: nextM.id,
        mutations: nextM.initialMutations,
      };

  return { primaryRecommendation, rankedMissions, scaffoldingLevel, detectedTraps };
}
