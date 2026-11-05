// CausalMiniMap: one-line diagnostic mini-map visible from Stage 1 (decision B, plan 261105-1411).
// 🔴 TRIỆU CHỨNG → [H? ⬜/❎/✅]… → 🎯 gốc → ✅ đã giải. Solved derived from per-hypothesis verdicts
// (stage6SolutionDone is permanently false today — the board never passes `solved`).
import React from 'react';
import type { WorkbenchId } from '../../actions/view-screen';
import type { LocaleCode } from '../../context/persona-theme-context';
import { getCurriculumCopy } from '../../lib/i18n/curriculum-copy';
import { evaluateHypothesisItem } from '../../lib/hypothesis-verification-engine';
import type { FoglerProblemSolvingCase } from '../../lib/fogler-problem-solving-catalog';

export interface CausalMiniMapProps {
  spec: FoglerProblemSolvingCase;
  workbenchId: WorkbenchId;
  locale: LocaleCode;
}

export const CausalMiniMap: React.FC<CausalMiniMapProps> = ({ spec, workbenchId, locale }) => {
  const ts = getCurriculumCopy(locale);
  const states = spec.hypotheses.map((h) => evaluateHypothesisItem(workbenchId, h.id));
  const rootIdx = spec.hypotheses.findIndex((h) => h.isRootCause);
  const rootCleared = rootIdx >= 0 && states[rootIdx].isCorrect && states[rootIdx].userVerdict !== undefined;
  const allVerdicted = states.every((s) => s.userVerdict !== undefined);
  return (
    <div className="mono" data-testid="tree-minimap" aria-label="Causal diagnostic mini-map" style={{ fontSize: '11px', display: 'flex', flexWrap: 'wrap', gap: '4px', alignItems: 'center', marginBottom: '0.35rem' }}>
      <span>🔴 {ts.treeRootSymptomLabel}</span>
      <span>→</span>
      {spec.hypotheses.map((h, i) => (
        <span key={h.id} data-testid={`tree-minimap-${h.id}`} style={{ border: '1px solid var(--border-grid)', padding: '0 4px', borderRadius: '6px' }}>
          {`H${i + 1} ${states[i].userVerdict === undefined ? '⬜' : states[i].userVerdict === 'disproved' ? '❎' : states[i].isCorrect ? '✅' : '⚠️'}`}
        </span>
      ))}
      <span>→</span>
      <span style={{ opacity: rootCleared ? 1 : 0.4 }}>{ts.treeMiniMapRoot}</span>
      <span>→</span>
      <span style={{ opacity: allVerdicted && rootCleared ? 1 : 0.4 }}>{ts.treeMiniMapSolved}</span>
    </div>
  );
};
