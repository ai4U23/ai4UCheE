// Fogler & LeBlanc (2008) 6-Stage Creative Problem-Solving & Root-Cause Hypothesis Falsification
// section generator for the Senior QA/QC Calculation Sheet (`calc-sheet-builder.ts`).
import type { WorkbenchId } from '../../actions/view-screen';
import { getFoglerCaseForWorkbench } from '../../lib/fogler-problem-solving-catalog';
import { evaluateHypothesisItem, evaluateSixStageProgress } from '../../lib/hypothesis-verification-engine';

export function buildFoglerTroubleshootingMarkdownSection(wb: WorkbenchId, solved: boolean): string {
  const spec = getFoglerCaseForWorkbench(wb);
  const stageStatus = evaluateSixStageProgress(wb, { solved });
  const hypLines = spec.hypotheses.map((h) => {
    const ev = evaluateHypothesisItem(wb, h.id);
    const expectedTag = h.isRootCause ? 'ROOT CAUSE (Prove ✅)' : 'DECOY TRAP (Disprove ❌)';
    const userTag = ev.userVerdict ? `Student Verdict: ${ev.userVerdict.toUpperCase()}` : 'Untested';
    return `- **${h.claim}** [${expectedTag} · Fits Data: ${h.fitsObservation} · ${userTag}] — ${h.mathVerification}`;
  });

  return [
    '## Fogler & LeBlanc 6-Stage Creative Problem-Solving & Hypothesis Audit',
    `- **Why Learn Subject**: ${spec.whyLearnSubject}`,
    `- **1. Problem Observation (Normal vs. Faulty)**: ${spec.observationSummary}`,
    `- **2. Problem Definition (K-T IS / IS NOT)**: Perceived: "${spec.ktDefinition.perceivedProblem}" → **Real Problem Defined**: ${spec.ktDefinition.realProblemDefined} (IS: ${spec.ktDefinition.whatIs} | IS NOT: ${spec.ktDefinition.whatIsNot})`,
    `- **3. Fundamental Theory**: ${spec.fundamentalTheory.equationTitle} — \\(${spec.fundamentalTheory.symbolicLatex}\\) (${spec.fundamentalTheory.governingTermsNote})`,
    `- **4. Applicable Handbook**: ${spec.applicableHandbook.primaryCitation} · ${spec.applicableHandbook.chartOrTableRef}`,
    `- **5. Hypotheses: Prove / Disprove (Rule #12 — ${stageStatus.correctHypothesisCount}/${stageStatus.totalHypothesisCount} Verified)**:`,
    ...hypLines,
    `- **6. Actual Solution & Verification**: ${spec.actualSolutionSummary} (${spec.foglerBookCitation})`,
  ].join('\n');
}
