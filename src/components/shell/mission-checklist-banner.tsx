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
  resetProblemSolvingStore,
  subscribeProblemSolvingStore,
} from '../../lib/hypothesis-verification-engine';
import { MISSION_BUTTON_LABELS_VI } from '../../lib/i18n/vi-shell-dictionary';
import { getTroubleshootingCopy } from '../../lib/i18n/vi-troubleshooting-copy';
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
  const { selectedChips, locale } = usePersonaTheme();
  const ts = getTroubleshootingCopy(locale);
  const [, setStoreTick] = useState<number>(0);
  const [trapObserved, setTrapObserved] = useState<boolean>(false);
  const [payload, setPayload] = useState<WorkbenchLivePayload>(
    () => getClientAppState().payload as WorkbenchLivePayload,
  );
  useEffect(() => subscribeClientAppState((s) => setPayload(s.payload as WorkbenchLivePayload)), []);
  useEffect(() => subscribeProblemSolvingStore(() => setStoreTick((t) => t + 1)), []);
  useEffect(() => setTrapObserved(false), [mission?.id]);

  if (!mission) return null;
  const inputs = (payload.inputs ?? {}) as Record<string, unknown>;
  const trapLoaded = Object.keys(mission.initialMutations).length > 0;
  const rawCheckSolved = mission.checkSolved(payload);
  if (!rawCheckSolved && !trapObserved) setTrapObserved(true);
  const scrubbed = Object.entries(mission.initialMutations).some(([key, val]) => inputs[key] !== val);
  const solved = trapObserved && rawCheckSolved;
  const stageStatus = evaluateSixStageProgress(mission.workbench, {
    trapLoaded,
    solved,
    selectedChipIds: selectedChips.map((c) => c.chipId),
  });

  const steps: Array<{ label: string; done: boolean }> = [
    { label: ts.missionSteps[0], done: stageStatus.stage1ObservationDone },
    { label: ts.missionSteps[1], done: stageStatus.stage2DefinitionDone },
    { label: ts.missionSteps[2], done: stageStatus.stage3TheoryDone },
    { label: ts.missionSteps[3], done: stageStatus.stage4HandbookDone },
    { label: ts.missionSteps[4], done: stageStatus.stage5HypothesesDone },
    { label: ts.missionSteps[5], done: (scrubbed && solved) || stageStatus.stage6SolutionDone },
  ];
  const missionTitle = locale === 'vi' ? (MISSION_BUTTON_LABELS_VI[mission.id] ?? mission.buttonLabel) : mission.buttonLabel;

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
          {solved ? ts.missionSolvedTitle : ts.missionActiveTitle} — {missionTitle} {ts.missionFlowSuffix}
        </strong>
        <span className="mission-pill mono" data-testid="mission-preset-point-formula" style={{ fontSize: '0.7rem' }}>
          {locale === 'vi'
            ? 'Ca mẫu đã nạp (Bước 1) · Tự giải thanh trượt: +35 đ · Auto-Fix: +12 đ (localStorage)'
            : 'Worked Case Loaded (Stage 1 Observed) · DIY slider solve: +35 pts · Auto-Fix: +12 pts (localStorage)'}
        </span>
        <span className="mission-pill mono" data-testid="mission-trap-note" style={{ fontSize: '0.7rem' }}>
          {locale === 'vi'
            ? '⚠️ Ca mẫu có thể bị cố tình đặt lệch thông số — quan sát & kiểm chứng trước khi giải (Quy tắc #12 Fogler)'
            : '⚠️ The loaded preset may be deliberately off-spec — observe & verify before solving (Fogler Rule #12)'}
        </span>
        <button
          type="button"
          data-testid="reset-mission-clean-btn"
          onClick={() => resetProblemSolvingStore()}
          title="Reset Stages 2–6 to a clean unchecked start"
        >
          {locale === 'vi' ? '↺ Đặt lại Ca' : '↺ Reset Case'}
        </button>
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
        <div className="wb-actions-row" style={{ marginBottom: '0.35rem', flexWrap: 'wrap' }}>
          {onSocraticHint && (
            <button type="button" data-testid="mission-socratic-hint-btn" onClick={() => onSocraticHint(mission)}>
              {ts.missionSocraticBtn}
            </button>
          )}
          <button type="button" data-testid="mission-autofix-btn" onClick={() => onAutoFix(mission)}>
            {ts.missionAutofixPrefix} ({Object.entries(mission.rescueMutations).map(([k, v]) => `${k}=${v}`).join(', ')})
          </button>
          {!stageStatus.stage5HypothesesDone && (
            <span className="mission-pill mono" data-testid="autofix-soft-nudge-banner" style={{ fontSize: '0.73rem' }}>
              {ts.missionDetectiveNudge}
            </span>
          )}
        </div>
      )}
      <HypothesisTroubleshootingBoard workbenchId={mission.workbench} />
    </motion.div>
  );
};
