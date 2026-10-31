// HypothesisTroubleshootingBoard: Interactive 6-Stage Fogler & LeBlanc (2008) Creative Problem-Solving
// & Woods's Worksheet Studio with 1-click AI Agent Collaboration on every stage and hypothesis.
import React, { useEffect, useState } from 'react';
import { agentNative } from '../../actions/define-action';
import { askPerryCopilot } from '../../actions/copilot-responder';
import { getClientAppState, type WorkbenchId } from '../../actions/view-screen';
import { usePersonaTheme } from '../../context/persona-theme-context';
import { getFoglerCaseForWorkbench } from '../../lib/fogler-problem-solving-catalog';
import {
  evaluateHypothesisItem,
  evaluateSixStageProgress,
  markHandbookReviewed,
  markProblemDefinitionReviewed,
  markTheoryReviewed,
  recordHypothesisVerdict,
  subscribeProblemSolvingStore,
  type HypothesisUserVerdict,
} from '../../lib/hypothesis-verification-engine';
import { KaTeXBlock } from '../ui/katex-block';

export interface HypothesisTroubleshootingBoardProps {
  workbenchId: WorkbenchId;
  compactByDefault?: boolean;
}

export const HypothesisTroubleshootingBoard: React.FC<HypothesisTroubleshootingBoardProps> = ({
  workbenchId,
  compactByDefault = false,
}) => {
  const { personaMode, selectedChips, toggleChip } = usePersonaTheme();
  const [, setTick] = useState<number>(0);
  const [expanded, setExpanded] = useState<boolean>(!compactByDefault);
  const [agentReplySnippet, setAgentReplySnippet] = useState<string>('');

  useEffect(() => subscribeProblemSolvingStore(() => setTick((t) => t + 1)), []);

  const spec = getFoglerCaseForWorkbench(workbenchId);
  const stageStatus = evaluateSixStageProgress(workbenchId, {
    selectedChipIds: selectedChips.map((c) => c.chipId),
  });

  const handleVerdictClick = (hypId: string, verdict: HypothesisUserVerdict) => {
    const res = recordHypothesisVerdict(workbenchId, hypId, verdict);
    agentNative.ui.output({
      type: 'equation-proof-card',
      title: `🔬 Hypothesis ${verdict.toUpperCase()} (${spec.subjectName})`,
      data: {
        symbolic_latex: spec.fundamentalTheory.symbolicLatex,
        substituted_latex: `\\text{${res.isCorrect ? 'Matches Observation & Theory' : 'Rule \\#12 Falsification Alert'}}`,
        result_latex: `\\text{${res.isCorrect ? 'VERIFIED' : 'RE-CHECK DATA'}}`,
        citation: `${spec.applicableHandbook.primaryCitation} · ${spec.foglerBookCitation}`,
      },
    });
  };

  const handleCollaborateWithAgent = async (promptText: string) => {
    markProblemDefinitionReviewed(workbenchId);
    markTheoryReviewed(workbenchId, spec.fundamentalTheory.equationId);
    markHandbookReviewed(workbenchId);
    const res = await askPerryCopilot({
      prompt: promptText,
      activeWorkbench: workbenchId,
      personaMode,
      selectedChips,
      payload: getClientAppState().payload,
    });
    setAgentReplySnippet(res.reply);
  };

  const handleInspectTheoryAndHandbook = () => {
    markProblemDefinitionReviewed(workbenchId);
    markTheoryReviewed(workbenchId, spec.fundamentalTheory.equationId);
    markHandbookReviewed(workbenchId);
    toggleChip({
      kind: 'equation',
      id: spec.fundamentalTheory.equationId,
      label: `${spec.fundamentalTheory.equationTitle} (${spec.applicableHandbook.primaryCitation})`,
      payload: { workbenchId, caseId: spec.caseId },
    });
  };

  return (
    <section
      className="wb-panel"
      data-testid="hypothesis-prove-disprove-board"
      aria-label="Fogler and LeBlanc 6-Stage Creative Problem-Solving Studio"
      style={{ marginTop: '0.45rem', padding: '0.65rem 0.85rem' }}
    >
      <div className="wb-toolbar" style={{ marginBottom: expanded ? '0.45rem' : 0 }}>
        <div>
          <strong data-testid="why-learn-subject-banner">🎯 {spec.whyLearnSubject}</strong>
          <div className="wb-subtitle">
            <span>🚨 Real Plant Problem: <strong>{spec.plantIncidentTitle}</strong></span> · <code>{spec.foglerBookCitation}</code>
          </div>
        </div>
        <div className="wb-actions-row">
          <button
            type="button"
            data-testid="collaborate-ai-hypothesis-btn"
            onClick={() => void handleCollaborateWithAgent(stageStatus.activeCollaboratorPrompt)}
          >
            {stageStatus.activeCollaboratorPrompt}
          </button>
          <button type="button" data-testid="toggle-hypothesis-board-btn" onClick={() => setExpanded(!expanded)}>
            {expanded ? '▾ Compact 6-Stage Board' : '▸ Expand 6-Stage Board'}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="wb-split" style={{ gap: '0.75rem' }}>
          <div data-testid="kt-fault-telemetry-card">
            <div className="mono" style={{ fontSize: '0.78rem', marginBottom: '0.35rem' }}>
              <strong>1. Problem Observation (Normal vs. Faulty Plant Telemetry):</strong> {spec.observationSummary}
            </div>
            <table className="mono" style={{ width: '100%', fontSize: '0.76rem', marginBottom: '0.45rem' }}>
              <thead><tr><th>Telemetry</th><th>Normal Baseline</th><th>Faulty Plant Reading</th><th>Physical Delta</th></tr></thead>
              <tbody>
                {spec.telemetryRows.map((r) => (
                  <tr key={r.metric}><td>{r.metric}</td><td>{r.normalVal}</td><td><strong>{r.faultyVal}</strong></td><td>{r.deltaNote}</td></tr>
                ))}
              </tbody>
            </table>

            <div className="mono" style={{ fontSize: '0.76rem', marginBottom: '0.45rem' }} data-testid="kt-problem-definition-box">
              <strong>2. Problem Definition (K-T IS / IS NOT &amp; Restatement):</strong>
              <div>• <em>Perceived Trap:</em> &ldquo;{spec.ktDefinition.perceivedProblem}&rdquo;</div>
              <div>• <em>Real Problem Defined:</em> <strong>{spec.ktDefinition.realProblemDefined}</strong></div>
              <div>• <em>K-T IS:</em> {spec.ktDefinition.whatIs} | <em>IS NOT:</em> {spec.ktDefinition.whatIsNot}</div>
            </div>

            <div className="mono" style={{ fontSize: '0.76rem' }} data-testid="theory-handbook-bridge-box">
              <strong>3. Fundamental Theory &amp; 4. Applicable Handbook:</strong>
              <KaTeXBlock latex={spec.fundamentalTheory.symbolicLatex} />
              <div>• <em>Governing Terms:</em> {spec.fundamentalTheory.governingTermsNote}</div>
              <div>• <em>Applicable Handbook:</em> <code>{spec.applicableHandbook.primaryCitation}</code> ({spec.applicableHandbook.chartOrTableRef})</div>
              <button type="button" data-testid="stage-review-theory-btn" onClick={handleInspectTheoryAndHandbook} style={{ marginTop: '0.3rem' }}>
                📐 Confirm Theory &amp; Handbook Anchor ({stageStatus.stage3TheoryDone ? '✓ Reviewed' : 'Mark Reviewed'})
              </button>
            </div>
          </div>

          <div>
            <div className="mono" style={{ fontSize: '0.78rem', marginBottom: '0.35rem' }}>
              <strong>5. Draft &amp; Prove/Disprove Hypotheses (&ldquo;Does It Fit the Observation?&rdquo; — Rule #12):</strong>
            </div>
            {spec.hypotheses.map((h) => {
              const evalState = evaluateHypothesisItem(workbenchId, h.id);
              return (
                <div key={h.id} data-testid={`hypothesis-card-${h.id}`} className="wb-panel" style={{ padding: '0.45rem 0.6rem', marginBottom: '0.35rem' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>{h.claim}</div>
                  <div className="wb-actions-row" style={{ marginTop: '0.25rem' }}>
                    <button type="button" data-testid={`hyp-prove-${h.id}`} onClick={() => handleVerdictClick(h.id, 'proved')}>
                      {evalState.userVerdict === 'proved' ? '● ' : ''}Prove ✅
                    </button>
                    <button type="button" data-testid={`hyp-disprove-${h.id}`} onClick={() => handleVerdictClick(h.id, 'disproved')}>
                      {evalState.userVerdict === 'disproved' ? '● ' : ''}Disprove ❌
                    </button>
                    <button type="button" data-testid={`hyp-ask-agent-${h.id}`} onClick={() => void handleCollaborateWithAgent(h.agentPrompt)}>
                      🤖 Ask AI Agent to Test
                    </button>
                  </div>
                  <div className="mono" data-testid={`hyp-verdict-${h.id}`} style={{ fontSize: '0.74rem', marginTop: '0.25rem' }}>
                    {evalState.feedbackText}
                  </div>
                </div>
              );
            })}
            <div className="mono" style={{ fontSize: '0.75rem' }} data-testid="stage6-solution-prescription">
              <strong>6. Actual Solution Prescription:</strong> {spec.actualSolutionSummary}
            </div>
            {agentReplySnippet && (
              <div className="mono" data-testid="ai-collaborator-hypothesis-note" style={{ fontSize: '0.75rem', marginTop: '0.35rem' }}>
                <strong>🤖 AI Problem-Solving Collaborator:</strong> {agentReplySnippet}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
