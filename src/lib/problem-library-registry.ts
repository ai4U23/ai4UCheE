// Master registry & converter for the 24 Real-Life Chemical Engineering Problem Library.
// Converts any `ProblemCaseEntry` into a runnable `GuidedMissionScenario` and `FoglerProblemSolvingCase`,
// and tracks the currently selected problem so the 6-Stage Fogler & LeBlanc Studio dynamically reflects it.
import type { WorkbenchId, WorkbenchLivePayload } from '../actions/view-screen';
import type { GuidedMissionScenario } from '../components/shell/mission-scenarios';
import type { FoglerProblemSolvingCase } from './fogler-problem-solving-catalog';
import { PROBLEM_LIBRARY_PART_A } from './problem-library-catalog-a';
import { PROBLEM_LIBRARY_PART_B } from './problem-library-catalog-b';
import { PROBLEM_LIBRARY_PART_C } from './problem-library-catalog-c';
import type {
  EngineeringProgressionTier,
  EquipmentCategoryId,
  ProblemCaseEntry,
  SymptomCategoryId,
} from './problem-library-types';

export const ALL_24_REAL_LIFE_PROBLEMS: ReadonlyArray<ProblemCaseEntry> = [
  ...PROBLEM_LIBRARY_PART_A,
  ...PROBLEM_LIBRARY_PART_B,
  ...PROBLEM_LIBRARY_PART_C,
];

let activeProblemByWorkbench: Partial<Record<WorkbenchId, ProblemCaseEntry>> = {};

export function setActiveProblemForWorkbench(entry: ProblemCaseEntry): void {
  activeProblemByWorkbench = { ...activeProblemByWorkbench, [entry.workbenchId]: entry };
}

export function getActiveProblemForWorkbench(wb: WorkbenchId): ProblemCaseEntry | undefined {
  return activeProblemByWorkbench[wb];
}

export function resetActiveProblems(): void {
  activeProblemByWorkbench = {};
}

export function getProblemById(problemId: string): ProblemCaseEntry | undefined {
  return ALL_24_REAL_LIFE_PROBLEMS.find((p) => p.problemId === problemId);
}

export function filterProblemLibrary(filters: {
  tier?: EngineeringProgressionTier | 'all';
  equipment?: EquipmentCategoryId | 'all';
  symptom?: SymptomCategoryId | 'all';
  workbench?: WorkbenchId | 'all';
  searchQuery?: string;
}): ReadonlyArray<ProblemCaseEntry> {
  const q = (filters.searchQuery ?? '').trim().toLowerCase();
  return ALL_24_REAL_LIFE_PROBLEMS.filter((p) => {
    if (filters.tier && filters.tier !== 'all' && p.tier !== filters.tier) return false;
    if (filters.equipment && filters.equipment !== 'all' && p.equipmentCategory !== filters.equipment) return false;
    if (filters.symptom && filters.symptom !== 'all' && p.symptomCategory !== filters.symptom) return false;
    if (filters.workbench && filters.workbench !== 'all' && p.workbenchId !== filters.workbench) return false;
    if (q) {
      const hay = `${p.title} ${p.equipmentTag} ${p.subjectLabel} ${p.sourceBookCitation} ${p.observationSummary}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

/** Check if a live workbench payload satisfies the rescue conditions of a `ProblemCaseEntry`. */
export function isProblemCaseSolved(entry: ProblemCaseEntry, payload: WorkbenchLivePayload): boolean {
  const metrics = (payload.metrics ?? {}) as Record<string, unknown>;
  const inputs = (payload.inputs ?? {}) as Record<string, unknown>;
  if (entry.workbenchId === 'wb1-visual-verifier') {
    const reading = Number(inputs.userReading);
    const exact = Number(inputs.exactValue);
    return exact !== 0 && Math.abs(reading - exact) / Math.abs(exact) <= 0.05;
  }
  if (entry.workbenchId === 'wb2-thermo-dippr') {
    return Math.abs(Number(metrics.pSatKpa) - 101.325) < 6;
  }
  if (entry.workbenchId === 'wb3-hydraulics') {
    return metrics.isCavitating === false && Number(metrics.npshAvailableM) >= 5.0;
  }
  if (entry.workbenchId === 'wb4-distillation') {
    return metrics.isFlooding === false;
  }
  if (entry.workbenchId === 'wb6-kinetics-reactors') {
    return metrics.isRunaway === false && metrics.isDiffusionLimited === false && Number(metrics.effectivenessEta) >= 0.75;
  }
  if (entry.workbenchId === 'wb5-handbook-atlas') {
    return metrics.isAlert === false;
  }
  return false;
}

/** Convert a `ProblemCaseEntry` into a `GuidedMissionScenario` compatible with `GuidedMissionBar` and `MissionChecklistBanner`. */
export function problemEntryToMissionScenario(entry: ProblemCaseEntry): GuidedMissionScenario {
  return {
    id: entry.problemId,
    workbench: entry.workbenchId,
    buttonLabel: `#${entry.number} [${entry.tier}] ${entry.title}`,
    chip: {
      kind: 'equation',
      id: entry.governingEquationId,
      label: `${entry.equipmentTag} · ${entry.title}`,
      payload: { problemId: entry.problemId, tier: entry.tier, equipmentTag: entry.equipmentTag },
    },
    proofCard: {
      type: 'equation-proof-card',
      title: `Problem #${entry.number} (${entry.tierBadge}) — ${entry.title}`,
      data: {
        symbolic_latex: entry.governingLatex,
        substituted_latex: `\\text{Equipment: ${entry.equipmentTag} · } ${entry.timeHorizonBadge}`,
        result_latex: `\\text{Goal: ${entry.realProblemDefined.slice(0, 68)}}`,
        citation: entry.sourceBookCitation,
      },
    },
    initialMutations: entry.initialMutations,
    rescueMutations: entry.rescueMutations,
    checkSolved: (payload) => isProblemCaseSolved(entry, payload),
  };
}

/** Convert a `ProblemCaseEntry` into a `FoglerProblemSolvingCase` for the 6-Stage Studio. */
export function problemEntryToFoglerCase(entry: ProblemCaseEntry): FoglerProblemSolvingCase {
  const wbPrefix = entry.workbenchId.split('-')[0];
  return {
    caseId: entry.problemId,
    workbenchId: entry.workbenchId,
    missionId: entry.problemId,
    plantIncidentTitle: `#${entry.number} [${entry.tierBadge} · ${entry.equipmentTag}] ${entry.title}`,
    whyLearnSubject: `Why learn ${entry.subjectLabel}? ${entry.whyLearnSubject}`,
    subjectName: `${entry.subjectLabel} (${entry.equipmentTag})`,
    observationSummary: entry.observationSummary,
    telemetryRows: [
      {
        metric: `${entry.equipmentTag} Operating State`,
        normalVal: Object.entries(entry.rescueMutations).map(([k, v]) => `${k}=${v}`).join(', '),
        faultyVal: Object.entries(entry.initialMutations).map(([k, v]) => `${k}=${v}`).join(', '),
        deltaNote: entry.timeHorizonBadge,
      },
      {
        metric: 'Rate-of-Change Clue (Δt)',
        normalVal: 'Steady Safe Margin',
        faultyVal: entry.rateOfChangeClue,
        deltaNote: entry.sourceBookCitation,
      },
    ],
    ktDefinition: {
      perceivedProblem: entry.perceivedProblemTrap,
      realProblemDefined: entry.realProblemDefined,
      whatIs: entry.ktIs,
      whatIsNot: entry.ktIsNot,
      whenObserved: `${entry.timeHorizonBadge} — ${entry.rateOfChangeClue}`,
    },
    fundamentalTheory: {
      equationId: entry.governingEquationId,
      equationTitle: `${entry.subjectLabel} Governing Balance`,
      symbolicLatex: entry.governingLatex,
      governingTermsNote: entry.whyLearnSubject,
    },
    applicableHandbook: {
      primaryCitation: entry.sourceBookCitation,
      crossBookAnchors: [entry.sourceBookCitation, '[Fogler & LeBlanc 2nd Ed., Ch. 4 & Ch. 10]'],
      chartOrTableRef: `${entry.equipmentTag} (${entry.workbenchId.toUpperCase()})`,
    },
    hypotheses: [
      {
        id: `${wbPrefix}-h1`,
        claim: entry.decoyClaim1,
        isRootCause: false,
        fitsObservation: 'NO',
        mathVerification: `DISPROVED ❌ — Violates observation (${entry.ktIsNot}).`,
        agentPrompt: `Test ${entry.decoyClaim1} with AI Agent on ${entry.equipmentTag}`,
      },
      {
        id: `${wbPrefix}-h2`,
        claim: entry.rootCauseClaim,
        isRootCause: true,
        fitsObservation: 'YES',
        mathVerification: `PROVED ✅ — Matches telemetry & equation (${entry.solutionSummary}).`,
        agentPrompt: `Verify root cause ${entry.rootCauseClaim} with AI Agent`,
      },
      {
        id: `${wbPrefix}-h3`,
        claim: entry.decoyClaim2,
        isRootCause: false,
        fitsObservation: 'NO',
        mathVerification: `DISPROVED ❌ — Contradicts ${entry.timeHorizonBadge} and governing law.`,
        agentPrompt: `Test ${entry.decoyClaim2} with AI Agent`,
      },
    ],
    actualSolutionSummary: entry.solutionSummary,
    foglerBookCitation: entry.sourceBookCitation,
  };
}
