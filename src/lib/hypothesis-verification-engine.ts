// Reactive 6-Stage Fogler & LeBlanc (2008) Creative Problem-Solving & Hypothesis Verification Store.
// Stages: 1. Problem Observation -> 2. Problem Definition (K-T IS/IS NOT) -> 3. Fundamental Theory ->
// 4. Applicable Handbook -> 5. Hypotheses: Prove / Disprove (Rule #12) -> 6. Actual Solution.
import type { WorkbenchId } from '../actions/view-screen';
import { FOGLER_PROBLEM_CASES, getFoglerCaseForWorkbench } from './fogler-problem-solving-catalog';

export type HypothesisUserVerdict = 'proved' | 'disproved';

export interface WorkbenchProblemProgress {
  workbenchId: WorkbenchId;
  definitionReviewed: boolean;
  theoryReviewed: boolean;
  handbookReviewed: boolean;
  citedEquationIds: string[];
  hypothesisVerdicts: Record<string, HypothesisUserVerdict>;
}

export interface EvaluatedHypothesisStatus {
  id: string;
  userVerdict?: HypothesisUserVerdict;
  isCorrect: boolean;
  feedbackText: string;
}

export interface SixStageStatusSummary {
  stage1ObservationDone: boolean;
  stage2DefinitionDone: boolean;
  stage3TheoryDone: boolean;
  stage4HandbookDone: boolean;
  stage5HypothesesDone: boolean;
  stage6SolutionDone: boolean;
  correctHypothesisCount: number;
  totalHypothesisCount: number;
  verifiedWorkbenchCount: number;
  activeCollaboratorPrompt: string;
}

const ALL_WORKBENCHES: readonly WorkbenchId[] = [
  'wb1-visual-verifier', 'wb2-thermo-dippr', 'wb3-hydraulics',
  'wb4-distillation', 'wb6-kinetics-reactors', 'wb5-handbook-atlas',
];

function createInitialStore(): Record<WorkbenchId, WorkbenchProblemProgress> {
  const map = {} as Record<WorkbenchId, WorkbenchProblemProgress>;
  for (const wb of ALL_WORKBENCHES) {
    map[wb] = {
      workbenchId: wb, definitionReviewed: false, theoryReviewed: false,
      handbookReviewed: false, citedEquationIds: [], hypothesisVerdicts: {},
    };
  }
  return map;
}

let store: Record<WorkbenchId, WorkbenchProblemProgress> = createInitialStore();
const listeners = new Set<() => void>();
const notify = (): void => listeners.forEach((fn) => fn());

export function subscribeProblemSolvingStore(listener: () => void): () => void {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

export function getWorkbenchProblemProgress(wb: WorkbenchId): WorkbenchProblemProgress {
  return store[wb] ?? store['wb1-visual-verifier'];
}

export function markProblemDefinitionReviewed(wb: WorkbenchId): void {
  const cur = getWorkbenchProblemProgress(wb);
  store = { ...store, [wb]: { ...cur, definitionReviewed: true } };
  notify();
}

export function markTheoryReviewed(wb: WorkbenchId, equationId?: string): void {
  const cur = getWorkbenchProblemProgress(wb);
  const nextEqs = equationId && !cur.citedEquationIds.includes(equationId)
    ? [...cur.citedEquationIds, equationId]
    : cur.citedEquationIds;
  store = {
    ...store,
    [wb]: { ...cur, definitionReviewed: true, theoryReviewed: true, citedEquationIds: nextEqs },
  };
  notify();
}

export function markHandbookReviewed(wb: WorkbenchId): void {
  const cur = getWorkbenchProblemProgress(wb);
  store = { ...store, [wb]: { ...cur, definitionReviewed: true, handbookReviewed: true } };
  notify();
}

export function recordHypothesisVerdict(
  wb: WorkbenchId,
  hypothesisId: string,
  verdict: HypothesisUserVerdict,
): EvaluatedHypothesisStatus {
  const cur = getWorkbenchProblemProgress(wb);
  store = {
    ...store,
    [wb]: {
      ...cur, definitionReviewed: true, theoryReviewed: true, handbookReviewed: true,
      hypothesisVerdicts: { ...cur.hypothesisVerdicts, [hypothesisId]: verdict },
    },
  };
  notify();
  return evaluateHypothesisItem(wb, hypothesisId);
}

export function autoCompleteProblemStagesForRescue(wb: WorkbenchId): void {
  const spec = getFoglerCaseForWorkbench(wb);
  const verdicts: Record<string, HypothesisUserVerdict> = {};
  for (const h of spec.hypotheses) verdicts[h.id] = h.isRootCause ? 'proved' : 'disproved';
  store = {
    ...store,
    [wb]: {
      workbenchId: wb, definitionReviewed: true, theoryReviewed: true, handbookReviewed: true,
      citedEquationIds: [spec.fundamentalTheory.equationId], hypothesisVerdicts: verdicts,
    },
  };
  notify();
}

export function resetProblemSolvingStore(): void {
  store = createInitialStore();
  notify();
}

export function evaluateHypothesisItem(wb: WorkbenchId, hypothesisId: string): EvaluatedHypothesisStatus {
  const spec = getFoglerCaseForWorkbench(wb);
  const cur = getWorkbenchProblemProgress(wb);
  const h = spec.hypotheses.find((item) => item.id === hypothesisId) ?? spec.hypotheses[0];
  const userVerdict = cur.hypothesisVerdicts[h.id];
  if (!userVerdict) {
    return { id: h.id, isCorrect: false, feedbackText: 'Untested — click Prove ✅ or Disprove ❌ or ask the AI Agent.' };
  }
  const expected: HypothesisUserVerdict = h.isRootCause ? 'proved' : 'disproved';
  const isCorrect = userVerdict === expected;
  const feedbackText = isCorrect
    ? h.mathVerification
    : `⚠️ Fogler Rule #12 Check: Re-examine the data & equation! ${h.mathVerification}`;
  return { id: h.id, userVerdict, isCorrect, feedbackText };
}

export function evaluateSixStageProgress(
  wb: WorkbenchId,
  options: { trapLoaded?: boolean; solved?: boolean; selectedChipIds?: readonly string[] } = {},
): SixStageStatusSummary {
  const spec = getFoglerCaseForWorkbench(wb);
  const cur = getWorkbenchProblemProgress(wb);
  const hasEquationChip = (options.selectedChipIds ?? []).some((c) => c.includes('equation') || c.includes('figure'));
  const evaluated = spec.hypotheses.map((h) => evaluateHypothesisItem(wb, h.id));
  const correctHypothesisCount = evaluated.filter((e) => e.isCorrect).length;
  const rootCauseProved = spec.hypotheses.filter((h) => h.isRootCause).every((h) => cur.hypothesisVerdicts[h.id] === 'proved');
  const decoysDisproved = spec.hypotheses.filter((h) => !h.isRootCause).some((h) => cur.hypothesisVerdicts[h.id] === 'disproved');

  const stage1ObservationDone = options.trapLoaded ?? true;
  const stage2DefinitionDone = cur.definitionReviewed || cur.theoryReviewed || Boolean(options.solved);
  const stage3TheoryDone = cur.theoryReviewed || hasEquationChip || Boolean(options.solved);
  const stage4HandbookDone = cur.handbookReviewed || cur.theoryReviewed || hasEquationChip || Boolean(options.solved);
  const stage5HypothesesDone = (rootCauseProved && decoysDisproved) || Boolean(options.solved);
  const stage6SolutionDone = Boolean(options.solved);

  const verifiedWorkbenchCount = ALL_WORKBENCHES.filter((w) => {
    const c = FOGLER_PROBLEM_CASES[w];
    return c.hypotheses.every((h) => store[w].hypothesisVerdicts[h.id] === (h.isRootCause ? 'proved' : 'disproved'));
  }).length;

  const untested = spec.hypotheses.find((h) => !cur.hypothesisVerdicts[h.id]) ?? spec.hypotheses[0];
  const activeCollaboratorPrompt = !stage3TheoryDone
    ? `🤝 AI Agent: Explain how ${spec.fundamentalTheory.equationTitle} governs "${spec.plantIncidentTitle}"`
    : !stage5HypothesesDone
      ? untested.agentPrompt
      : `🤝 AI Agent: Verify our 6-stage Fogler & LeBlanc solution for ${spec.subjectName}`;

  return {
    stage1ObservationDone, stage2DefinitionDone, stage3TheoryDone,
    stage4HandbookDone, stage5HypothesesDone, stage6SolutionDone,
    correctHypothesisCount, totalHypothesisCount: spec.hypotheses.length,
    verifiedWorkbenchCount, activeCollaboratorPrompt,
  };
}
