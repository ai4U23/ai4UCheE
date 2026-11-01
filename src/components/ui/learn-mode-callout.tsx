// LearnModeCallout: plain-English student intuition banner rendered only in 🎓 Learn Mode
// (hidden in 🏭 Plant Mode so senior engineers keep a compact workspace).
// Injects curriculum year progression (Year 2–4), prerequisites, 5-step causal story chain,
// Fogler & LeBlanc (2008) 6-Stage "Why You Have to Learn This Subject", and 1-click Studio toggle.
import React, { useState } from 'react';
import type { WorkbenchId } from '../../actions/view-screen';
import { usePersonaTheme } from '../../context/persona-theme-context';
import { CURRICULUM_PROGRESSION_MAP } from '../../lib/curriculum-progression-map';
import { getFoglerCaseForWorkbench } from '../../lib/fogler-problem-solving-catalog';
import { markProblemDefinitionReviewed } from '../../lib/hypothesis-verification-engine';
import { localizeFoglerSpec } from '../../lib/i18n/vi-troubleshooting-copy';
import { getUiSubcomponentCopy } from '../../lib/i18n/vi-ui-subcomponents';
import { HypothesisTroubleshootingBoard } from '../shell/hypothesis-troubleshooting-board';
import { FramerEntranceStage } from './framer-motion-primitives';

const SUFFIX_TO_WORKBENCH: Readonly<Record<string, WorkbenchId>> = {
  wb1: 'wb1-visual-verifier',
  wb2: 'wb2-thermo-dippr',
  wb3: 'wb3-hydraulics',
  wb4: 'wb4-distillation',
  wb5: 'wb5-handbook-atlas',
  wb6: 'wb6-kinetics-reactors',
};

export interface LearnModeCalloutProps {
  /** Workbench suffix for the data-testid, e.g. 'wb1' -> `learn-callout-wb1`. */
  workbenchId: string;
  title: string;
  plainEnglish: string;
  commonTrap: string;
  perryAnchor: string;
}

export const LearnModeCallout: React.FC<LearnModeCalloutProps> = ({
  workbenchId,
  title,
  plainEnglish,
  commonTrap,
  perryAnchor,
}) => {
  const { personaMode, locale } = usePersonaTheme();
  const [showStudio, setShowStudio] = useState<boolean>(false);
  const [expanded, setExpanded] = useState<boolean>(false);
  if (personaMode !== 'learn') return null;

  const fullWb = SUFFIX_TO_WORKBENCH[workbenchId] ?? 'wb1-visual-verifier';
  const spec = localizeFoglerSpec(getFoglerCaseForWorkbench(fullWb), locale);
  const curriculum = CURRICULUM_PROGRESSION_MAP[fullWb];
  const chain = curriculum.causalChain[locale];
  const ui = getUiSubcomponentCopy(locale);

  return (
    <FramerEntranceStage className="learn-callout" testId={`learn-callout-${workbenchId}`}>
      <div className="wb-toolbar" style={{ marginBottom: '4px' }}>
        <div>
          <span
            className="wb-chip"
            data-testid="curriculum-stage-badge"
            style={{ fontSize: '11px', marginRight: '6px', fontWeight: 700 }}
          >
            {curriculum.yearBadge[locale]}
          </span>
          <strong>{title}</strong>
          <span className="mono" style={{ fontSize: '11px', marginLeft: '8px', opacity: 0.82 }}>
            {curriculum.prerequisites[locale]}
          </span>
        </div>
        <div className="wb-actions-row">
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            style={{ fontSize: '12px', padding: '4px 8px' }}
          >
            {ui.calloutFieldNotesBtn(expanded)}
          </button>
          <button
            type="button"
            data-testid={`open-6stage-board-${workbenchId}`}
            onClick={() => {
              markProblemDefinitionReviewed(fullWb);
              setShowStudio(!showStudio);
            }}
          >
            {ui.calloutOpenStudioBtn(showStudio)}
          </button>
        </div>
      </div>
      <p data-testid={`why-learn-callout-${workbenchId}`} style={{ fontSize: '12px', margin: '4px 0' }}>
        <strong>{spec.whyLearnSubject}</strong> · <strong>{spec.plantIncidentTitle}:</strong> {spec.ktDefinition.realProblemDefined}
      </p>
      <p
        data-testid={`causal-story-chain-${workbenchId}`}
        className="mono"
        style={{ fontSize: '11px', margin: '4px 0', opacity: 0.9 }}
      >
        <strong>1.</strong> {chain.symptom} → <strong>2.</strong> {chain.subject} → <strong>3.</strong> {chain.equation} → <strong>4.</strong> {chain.lab} → <strong>5.</strong> {chain.result}
      </p>
      <div className={expanded ? '' : 'studio-drawer-collapsed'}>
        <p>{plainEnglish}</p>
        <p>{ui.calloutWatchOutPrefix} {commonTrap}</p>
        {curriculum.jargonGlosses.map((g) => (
          <p key={g.term} style={{ fontSize: '11.5px', margin: '2px 0' }}>
            <strong>{g.term}:</strong> {locale === 'vi' ? g.plainVietnamese : g.plainEnglish}
          </p>
        ))}
        <code>{perryAnchor} · {spec.foglerBookCitation}</code>
      </div>
      {showStudio && <HypothesisTroubleshootingBoard workbenchId={fullWb} />}
    </FramerEntranceStage>
  );
};
