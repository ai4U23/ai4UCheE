// LearnModeCallout: plain-English student intuition banner rendered only in 🎓 Learn Mode
// (hidden in 🏭 Plant Mode so senior engineers keep a compact workspace).
import React from 'react';
import { usePersonaTheme } from '../../context/persona-theme-context';
import { FramerEntranceStage } from './framer-motion-primitives';

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
  if (personaMode !== 'learn') return null;
  return (
    <FramerEntranceStage className="learn-callout" testId={`learn-callout-${workbenchId}`}>
      <strong>🎓 Student Guide: {title}</strong>
      <p>{plainEnglish}</p>
      <p>⚠️ Watch out: {commonTrap}</p>
      <code>{perryAnchor}</code>
    </FramerEntranceStage>
  );
};
