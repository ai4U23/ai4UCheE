// MissionChecklistBanner: live 3-step rescue walkthrough (Observe Trap → Scrub Control → Verify
// Proof) fed by the <current-screen> payload bus, with a one-click "Auto-Fix & Ask Copilot" CTA.
import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  getClientAppState,
  subscribeClientAppState,
  type WorkbenchLivePayload,
} from '../../actions/view-screen';
import { FRAMER_BOUNCE_SPRING } from '../../lib/framer-motion-tokens';
import { SwarmPulseDot } from '../ui/framer-motion-primitives';
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
  const [payload, setPayload] = useState<WorkbenchLivePayload>(
    () => getClientAppState().payload as WorkbenchLivePayload,
  );
  useEffect(() => subscribeClientAppState((s) => setPayload(s.payload as WorkbenchLivePayload)), []);

  if (!mission) return null;
  const inputs = (payload.inputs ?? {}) as Record<string, unknown>;
  const trapLoaded = Object.keys(mission.initialMutations).length > 0;
  const scrubbed = Object.entries(mission.initialMutations).some(([key, val]) => inputs[key] !== val);
  const solved = mission.checkSolved(payload);
  const steps: Array<{ label: string; done: boolean }> = [
    { label: 'Step 1 · Observe Trap Loaded', done: trapLoaded },
    { label: 'Step 2 · Scrub Control to Safety', done: scrubbed && solved },
    { label: 'Step 3 · Safe Operating Margin Verified', done: solved },
  ];

  return (
    <motion.div
      className="mission-banner"
      data-testid="mission-checklist-banner"
      initial={{ opacity: 0, y: 12, scale: 0.99 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={FRAMER_BOUNCE_SPRING}
    >
      <div className="mission-banner-head">
        <strong>
          <SwarmPulseDot tone={solved ? 'emerald' : 'gold'} />
          {solved ? '🏆 Mission Solved' : '🧭 Mission Active'} — {mission.buttonLabel}
        </strong>
        <button type="button" onClick={onDismiss} aria-label="Dismiss mission">✕</button>
      </div>
      <ol className="mission-steps">
        {steps.map((s) => (
          <motion.li
            key={s.label}
            className={s.done ? 'mission-step done' : 'mission-step'}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={FRAMER_BOUNCE_SPRING}
          >
            {s.done ? '☑' : '☐'} {s.label}
          </motion.li>
        ))}
      </ol>
      {!solved && (
        <>
          {onSocraticHint && (
            <button type="button" data-testid="mission-socratic-hint-btn" onClick={() => onSocraticHint(mission)}>
              💡 Socratic Hint (Keep Full +35% Mastery)
            </button>
          )}
          <button type="button" data-testid="mission-autofix-btn" onClick={() => onAutoFix(mission)}>
            ⚡ Auto-Fix &amp; Ask Copilot ({Object.entries(mission.rescueMutations).map(([k, v]) => `${k}=${v}`).join(', ')})
          </button>
        </>
      )}
    </motion.div>
  );
};
