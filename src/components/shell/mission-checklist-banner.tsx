// MissionChecklistBanner: live 6-Stage Fogler & LeBlanc (2008) Creative Problem-Solving walkthrough
// (1. Problem Observation -> 2. Problem Definition K-T -> 3. Fundamental Theory -> 4. Applicable Handbook ->
// 5. Hypotheses: Prove/Disprove -> 6. Actual Solution & Safe Operating Margin Verified) + AI Collaborator.
import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  getClientAppState,
  subscribeClientAppState,
  type WorkbenchLivePayload,
} from '../../actions/view-screen';
import { usePersonaTheme } from '../../context/persona-theme-context';
import { FRAMER_BOUNCE_SPRING } from '../../lib/framer-motion-tokens';
import {
  evaluateSixStageProgress,
  subscribeProblemSolvingStore,
} from '../../lib/hypothesis-verification-engine';
import { SwarmPulseDot } from '../ui/framer-motion-primitives';
import { HypothesisTroubleshootingBoard } from './hypothesis-troubleshooting-board';
import type { GuidedMissionScenario } from './mission-scenarios';

export interface MissionChecklistBannerProps {
  mission: GuidedMissionScenario | null;
  onAutoFix: (mission: GuidedMissionScenario) => void;
  onSocraticHint?: (mission: GuidedMissionScenario) => void;
  onDismiss: () => void;
}

export const MissionChecklistBanner: React.FC<MissionChecklistBannerProps> = ({
  mission,
  onAutoFix,
  onSocraticHint,
  onDismiss,
}) => {
  const { selectedChips } = usePersonaTheme();
  const [, setStoreTick] = useState<number>(0);
  const [payload, setPayload] = useState<WorkbenchLivePayload>(
    () => getClientAppState().payload as WorkbenchLivePayload,
  );
  useEffect(() => subscribeClientAppState((s) => setPayload(s.payload as WorkbenchLivePayload)), []);
  useEffect(() => subscribeProblemSolvingStore(() => setStoreTick((t) => t + 1)), []);

  if (!mission) return null;
  const inputs = (payload.inputs ?? {}) as Record<string, unknown>;
  const trapLoaded = Object.keys(mission.initialMutations).length > 0;
  const scrubbed = Object.entries(mission.initialMutations).some(([key, val]) => inputs[key] !== val);
  const solved = mission.checkSolved(payload);
  const stageStatus = evaluateSixStageProgress(mission.workbench, {
    trapLoaded,
    solved,
    selectedChipIds: selectedChips.map((c) => c.chipId),
  });

  const steps: Array<{ label: string; done: boolean }> = [
    { label: 'Stage 1 · Problem Observation (Normal vs. Faulty Plant Data)', done: stageStatus.stage1ObservationDone },
    { label: 'Stage 2 · Problem Definition (K-T IS / IS NOT & Real Problem)', done: stageStatus.stage2DefinitionDone },
    { label: 'Stage 3 · Fundamental Theory (Why You Learn This Subject)', done: stageStatus.stage3TheoryDone },
    { label: 'Stage 4 · Applicable Handbook (Perry & 6-Book Anchor)', done: stageStatus.stage4HandbookDone },
    { label: 'Stage 5 · Hypotheses: Prove ✅ / Disprove ❌ (Rule #12)', done: stageStatus.stage5HypothesesDone },
    { label: 'Stage 6 · Actual Solution & Safe Operating Margin Verified', done: (scrubbed && solved) || stageStatus.stage6SolutionDone },
  ];

  return (
    <motion.div
      className="mission-banner"
      data-testid="mission-checklist-banner"
      initial={{ opacity: 1, y: 12, scale: 0.99 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={FRAMER_BOUNCE_SPRING}
    >
      <div className="mission-banner-head">
        <strong>
          <SwarmPulseDot tone={solved ? 'emerald' : 'gold'} />
          {solved ? '🏆 Mission Solved' : '🧭 Mission Active'} — {mission.buttonLabel} (Fogler &amp; LeBlanc 6-Stage Flow)
        </strong>
        <button type="button" onClick={onDismiss} aria-label="Dismiss mission">✕</button>
      </div>
      <ol className="mission-steps" data-testid="fogler-6stage-stepper">
        {steps.map((s) => (
          <motion.li
            key={s.label}
            className={s.done ? 'mission-step done' : 'mission-step'}
            initial={{ opacity: 1, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={FRAMER_BOUNCE_SPRING}
          >
            {s.done ? '☑' : '☐'} {s.label}
          </motion.li>
        ))}
      </ol>
      {!solved && (
        <div className="wb-actions-row" style={{ marginBottom: '0.35rem' }}>
          {onSocraticHint && (
            <button type="button" data-testid="mission-socratic-hint-btn" onClick={() => onSocraticHint(mission)}>
              💡 Socratic Hint (Keep Full +35% Mastery)
            </button>
          )}
          <button type="button" data-testid="mission-autofix-btn" onClick={() => onAutoFix(mission)}>
            ⚡ Auto-Fix &amp; Ask Copilot ({Object.entries(mission.rescueMutations).map(([k, v]) => `${k}=${v}`).join(', ')})
          </button>
        </div>
      )}
      <HypothesisTroubleshootingBoard workbenchId={mission.workbench} />
    </motion.div>
  );
};
