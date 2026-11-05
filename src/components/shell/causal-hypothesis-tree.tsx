// CausalHypothesisTree: Stage-5 vertical causal tree (plan 261105-1411, decisions A2+B) —
// symptom root → hypothesis branches (claim + pre-authored consequence prediction) →
// verdict buttons → engine-gated reveal → static prune styling. Keeps the board's legacy testids.
import React from 'react';
import type { WorkbenchId } from '../../actions/view-screen';
import type { LocaleCode } from '../../context/persona-theme-context';
import { getCurriculumCopy } from '../../lib/i18n/curriculum-copy';
import { getTroubleshootingCopy } from '../../lib/i18n/vi-troubleshooting-copy';
import { evaluateHypothesisItem } from '../../lib/hypothesis-verification-engine';
import { getHypothesisConsequence } from '../../lib/hypothesis-consequence-copy';
import type { FoglerProblemSolvingCase } from '../../lib/fogler-problem-solving-catalog';

export interface CausalHypothesisTreeProps {
  spec: FoglerProblemSolvingCase;
  workbenchId: WorkbenchId;
  locale: LocaleCode;
  onVerdict: (hypId: string, verdict: 'proved' | 'disproved') => void;
  onAskAgent: (prompt: string) => void;
}

export const CausalHypothesisTree: React.FC<CausalHypothesisTreeProps> = ({
  spec, workbenchId, locale, onVerdict, onAskAgent,
}) => {
  const ts = getCurriculumCopy(locale);
  const btns = getTroubleshootingCopy(locale);
  return (
    <div data-testid="causal-hypothesis-tree" style={{ borderLeft: '2px solid var(--border-grid)', paddingLeft: '0.55rem' }}>
      <div className="mono" data-testid="tree-root-symptom" style={{ fontSize: '0.78rem', marginBottom: '0.45rem' }}>
        🔴 <strong>{ts.treeRootSymptomLabel}:</strong> {spec.observationSummary}
      </div>
      {spec.hypotheses.map((h) => {
        const evalState = evaluateHypothesisItem(workbenchId, h.id);
        const pruned = evalState.userVerdict === 'disproved';
        const consequence = getHypothesisConsequence(spec.caseId, h.id);
        return (
          <div
            key={h.id}
            data-testid={`hypothesis-card-${h.id}`}
            className="wb-panel"
            style={{
              padding: '0.45rem 0.6rem', marginBottom: '0.35rem', marginLeft: '0.75rem',
              opacity: pruned ? 0.45 : 1, textDecoration: pruned ? 'line-through' : 'none',
            }}
          >
            <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>
              ├─ {h.claim}{pruned ? ` · ${ts.treePrunedLabel} ❎` : ''}
            </div>
            {consequence && (
              <div className="mono" data-testid={`tree-consequence-${h.id}`} style={{ fontSize: '0.72rem', marginTop: '0.2rem', opacity: 0.92 }}>
                {ts.treeConsequenceLabel} {consequence[locale]}
              </div>
            )}
            <div className="wb-actions-row" style={{ marginTop: '0.25rem' }}>
              <button type="button" data-testid={`hyp-prove-${h.id}`} onClick={() => onVerdict(h.id, 'proved')}>
                {evalState.userVerdict === 'proved' ? '● ' : ''}{btns.boardProveBtn}
              </button>
              <button type="button" data-testid={`hyp-disprove-${h.id}`} onClick={() => onVerdict(h.id, 'disproved')}>
                {evalState.userVerdict === 'disproved' ? '● ' : ''}{btns.boardDisproveBtn}
              </button>
              <button type="button" data-testid={`hyp-ask-agent-${h.id}`} onClick={() => onAskAgent(h.agentPrompt)}>
                {btns.boardAskAgentBtn}
              </button>
            </div>
            <div className="mono" data-testid={`hyp-verdict-${h.id}`} style={{ fontSize: '0.74rem', marginTop: '0.25rem' }}>
              {evalState.feedbackText}
            </div>
          </div>
        );
      })}
    </div>
  );
};
