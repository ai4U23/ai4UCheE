// MissionChecklistBanner: live 3-step rescue walkthrough (Observe Trap → Scrub Control → Verify
// Proof) fed by the <current-screen> payload bus, with a one-click "Auto-Fix & Ask Copilot" CTA.
import React, { useEffect, useState } from 'react';
import {
  getClientAppState,
  subscribeClientAppState,
  type WorkbenchLivePayload,
} from '../../actions/view-screen';
import type { GuidedMissionScenario } from './mission-scenarios';

export interface MissionChecklistBannerProps {
  mission: GuidedMissionScenario | null;
  onAutoFix: (mission: GuidedMissionScenario) => void;
  onDismiss: () => void;
}

export const MissionChecklistBanner: React.FC<MissionChecklistBannerProps> = ({ mission, onAutoFix, onDismiss }) => {
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
    <div className="mission-banner" data-testid="mission-checklist-banner">
      <div className="mission-banner-head">
        <strong>{solved ? '🏆 Mission Solved' : '🧭 Mission Active'} — {mission.buttonLabel}</strong>
        <button type="button" onClick={onDismiss} aria-label="Dismiss mission">✕</button>
      </div>
      <ol className="mission-steps">
        {steps.map((s) => (
          <li key={s.label} className={s.done ? 'mission-step done' : 'mission-step'}>
            {s.done ? '☑' : '☐'} {s.label}
          </li>
        ))}
      </ol>
      {!solved && (
        <button type="button" data-testid="mission-autofix-btn" onClick={() => onAutoFix(mission)}>
          ⚡ Auto-Fix &amp; Ask Copilot ({Object.entries(mission.rescueMutations).map(([k, v]) => `${k}=${v}`).join(', ')})
        </button>
      )}
    </div>
  );
};
