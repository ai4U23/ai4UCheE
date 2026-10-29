// 3-Stage White-Box KaTeX equation card: Stage 1 Symbolic → Stage 2 Live Substitution →
// Stage 3 Evaluated Result, with an exact [Perry's 9th Ed., ...] citation badge and an
// optional learn-mode intuition callout. Updates live on every slider scrub.
import React from 'react';
import type { WhiteBoxStageEquation } from '../../actions/view-screen';
import type { PersonaMode } from '../../context/persona-theme-context';
import { KaTeXBlock } from './katex-block';

export interface WhiteBoxEquationCardProps {
  equation: WhiteBoxStageEquation;
  personaMode?: PersonaMode;
  /** Optional legacy KaTeX testids to preserve (symbolic, substituted, result). */
  katexTestIds?: { symbolic?: string; substituted?: string; result?: string };
}

export const WhiteBoxEquationCard: React.FC<WhiteBoxEquationCardProps> = ({ equation, personaMode, katexTestIds }) => (
  <div className="white-box-eq-card" data-testid={`white-box-eq-${equation.id}`}>
    <header className="white-box-eq-header">
      <strong>{equation.title}</strong>
      <span className="white-box-citation-badge">{equation.citation}</span>
    </header>
    <div className="white-box-stage-grid">
      <div className="white-box-stage-pill" data-testid={`eq-stage-symbolic-${equation.id}`}>
        <span className="white-box-stage-label">1 · SYMBOLIC</span>
        <KaTeXBlock latex={equation.symbolicLatex} testId={katexTestIds?.symbolic} />
      </div>
      <div className="white-box-stage-pill" data-testid={`eq-stage-substituted-${equation.id}`}>
        <span className="white-box-stage-label">2 · LIVE SUBSTITUTION</span>
        <KaTeXBlock latex={equation.substitutedLatex} testId={katexTestIds?.substituted} />
      </div>
      <div className="white-box-stage-pill" data-testid={`eq-stage-result-${equation.id}`}>
        <span className="white-box-stage-label">3 · EVALUATED RESULT</span>
        <KaTeXBlock latex={equation.resultLatex} testId={katexTestIds?.result} />
      </div>
    </div>
    {personaMode === 'learn' && equation.plainExplanation && (
      <p className="white-box-plain-note">💡 {equation.plainExplanation}</p>
    )}
    {equation.warningText && <p className="white-box-warning-note">⚠️ {equation.warningText}</p>}
  </div>
);
