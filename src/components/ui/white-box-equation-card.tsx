// 3-Stage White-Box KaTeX equation card: Stage 1 Symbolic → Stage 2 Live Substitution →
// Stage 3 Evaluated Result, with an exact [Perry's 9th Ed., ...] citation badge, a 1-click
// Stage 3 Fundamental Theory & Stage 4 Handbook confirmation trigger, and Learn-Mode intuition.
import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { getClientAppState, type WhiteBoxStageEquation, type WorkbenchId } from '../../actions/view-screen';
import type { PersonaMode } from '../../context/persona-theme-context';
import { FRAMER_BOUNCE_SPRING, getFramerStaggerTransition } from '../../lib/framer-motion-tokens';
import {
  getWorkbenchProblemProgress,
  markHandbookReviewed,
  markTheoryReviewed,
  subscribeProblemSolvingStore,
} from '../../lib/hypothesis-verification-engine';
import { KaTeXBlock } from './katex-block';

export interface WhiteBoxEquationCardProps {
  equation: WhiteBoxStageEquation;
  personaMode?: PersonaMode;
  /** Optional legacy KaTeX testids to preserve (symbolic, substituted, result). */
  katexTestIds?: { symbolic?: string; substituted?: string; result?: string };
}

export const WhiteBoxEquationCard: React.FC<WhiteBoxEquationCardProps> = ({ equation, personaMode, katexTestIds }) => {
  const [, setTick] = useState<number>(0);
  useEffect(() => subscribeProblemSolvingStore(() => setTick((t) => t + 1)), []);

  const activeWb = (getClientAppState().activeWorkbench || 'wb1-visual-verifier') as WorkbenchId;
  const cited = getWorkbenchProblemProgress(activeWb).citedEquationIds.includes(equation.id);

  const handleCiteTheory = () => {
    const wb = (getClientAppState().activeWorkbench || 'wb1-visual-verifier') as WorkbenchId;
    markTheoryReviewed(wb, equation.id);
    markHandbookReviewed(wb);
  };

  return (
    <motion.div
      className="white-box-eq-card"
      data-testid={`white-box-eq-${equation.id}`}
      initial={{ opacity: 1, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={FRAMER_BOUNCE_SPRING}
    >
      <header className="white-box-eq-header">
        <strong>{equation.title}</strong>
        <div className="wb-actions-row">
          <button
            type="button"
            data-testid={`cite-theory-${equation.id}`}
            onClick={handleCiteTheory}
            style={{ fontSize: '0.72rem', padding: '0.18rem 0.45rem' }}
            title="Confirm Stage 3 Fundamental Theory & Stage 4 Applicable Handbook in the Fogler & LeBlanc 6-Stage Flow"
          >
            {cited ? '✓ Stage 3 Theory & Stage 4 Handbook Cited' : '📐 Cite as Stage 3 Theory & Handbook'}
          </button>
          <span className="white-box-citation-badge">{equation.citation}</span>
        </div>
      </header>
      <div className="white-box-stage-grid">
        <motion.div
          className="white-box-stage-pill"
          data-testid={`eq-stage-symbolic-${equation.id}`}
          initial={{ opacity: 1, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={getFramerStaggerTransition(0)}
        >
          <span className="white-box-stage-label">1 · SYMBOLIC</span>
          <KaTeXBlock latex={equation.symbolicLatex} testId={katexTestIds?.symbolic} />
        </motion.div>
        <motion.div
          className="white-box-stage-pill"
          data-testid={`eq-stage-substituted-${equation.id}`}
          initial={{ opacity: 1, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={getFramerStaggerTransition(1)}
        >
          <span className="white-box-stage-label">2 · LIVE SUBSTITUTION</span>
          <KaTeXBlock latex={equation.substitutedLatex} testId={katexTestIds?.substituted} />
        </motion.div>
        <motion.div
          className="white-box-stage-pill"
          data-testid={`eq-stage-result-${equation.id}`}
          initial={{ opacity: 1, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={getFramerStaggerTransition(2)}
        >
          <span className="white-box-stage-label">3 · EVALUATED RESULT</span>
          <KaTeXBlock latex={equation.resultLatex} testId={katexTestIds?.result} />
        </motion.div>
      </div>
      {personaMode === 'learn' && equation.plainExplanation && (
        <p className="white-box-plain-note">💡 {equation.plainExplanation}</p>
      )}
      {equation.warningText && <p className="white-box-warning-note">⚠️ {equation.warningText}</p>}
    </motion.div>
  );
};
