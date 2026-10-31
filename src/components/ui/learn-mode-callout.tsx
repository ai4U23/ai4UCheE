// LearnModeCallout: plain-English student intuition banner rendered only in 🎓 Learn Mode
// (hidden in 🏭 Plant Mode so senior engineers keep a compact workspace).
// Injects the Fogler & LeBlanc (2008) 6-Stage "Why You Have to Learn This Subject" + Real Plant
// Problem Observation/Definition + 1-click toggle for the interactive Hypothesis Prove/Disprove Studio.
import React, { useState } from 'react';
import type { WorkbenchId } from '../../actions/view-screen';
import { usePersonaTheme } from '../../context/persona-theme-context';
import { getFoglerCaseForWorkbench } from '../../lib/fogler-problem-solving-catalog';
import { markProblemDefinitionReviewed } from '../../lib/hypothesis-verification-engine';
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
  const { personaMode } = usePersonaTheme();
  const [showStudio, setShowStudio] = useState<boolean>(false);
  if (personaMode !== 'learn') return null;

  const fullWb = SUFFIX_TO_WORKBENCH[workbenchId] ?? 'wb1-visual-verifier';
  const spec = getFoglerCaseForWorkbench(fullWb);

  return (
    <FramerEntranceStage className="learn-callout" testId={`learn-callout-${workbenchId}`}>
      <div className="wb-toolbar" style={{ marginBottom: '0.25rem' }}>
        <strong>🎓 Student Guide: {title}</strong>
        <button
          type="button"
          data-testid={`open-6stage-board-${workbenchId}`}
          onClick={() => {
            markProblemDefinitionReviewed(fullWb);
            setShowStudio(!showStudio);
          }}
        >
          {showStudio ? '▾ Hide 6-Stage Problem & Hypothesis Studio' : '🔬 Open 6-Stage Problem & Hypothesis Studio'}
        </button>
      </div>
      <p data-testid={`why-learn-callout-${workbenchId}`}>
        <strong>🎯 {spec.whyLearnSubject}</strong>
      </p>
      <p>
        🚨 <strong>Real Plant Problem ({spec.plantIncidentTitle}):</strong> {spec.ktDefinition.realProblemDefined}
      </p>
      <p>{plainEnglish}</p>
      <p>⚠️ Watch out: {commonTrap}</p>
      <code>{perryAnchor} · {spec.foglerBookCitation}</code>
      {showStudio && <HypothesisTroubleshootingBoard workbenchId={fullWb} />}
    </FramerEntranceStage>
  );
};
