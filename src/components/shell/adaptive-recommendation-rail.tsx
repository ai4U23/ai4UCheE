// AdaptiveRecommendationRail: Instant Browser Scorecard (with Student Name switcher),
// Scaffolding Mode selector (`Auto | Guided | Socratic | Challenge`), Hypothesis Prove/Disprove
// tally badge, active trap alert, and 1-click Personalized Next Action button.
import React, { useEffect, useState } from 'react';
import {
  dispatchWorkbenchMutation,
  getClientAppState,
  subscribeClientAppState,
  type WorkbenchId,
} from '../../actions/view-screen';
import { usePersonaTheme } from '../../context/persona-theme-context';
import {
  buildAdaptiveRecommendations,
  type AdaptiveRecommendation,
} from '../../lib/adaptive-recommendation-engine';
import { buildFoglerDetectiveStamp } from '../../lib/che-error-signature-detector';
import {
  evaluateSixStageProgress,
  resetProblemSolvingStore,
  subscribeProblemSolvingStore,
} from '../../lib/hypothesis-verification-engine';
import { getTroubleshootingCopy } from '../../lib/i18n/vi-troubleshooting-copy';
import {
  getAverageMastery,
  getStudentProfile,
  listStudentProfiles,
  resetStudentProfile,
  setScaffoldingOverride,
  subscribeStudentProfile,
  switchStudentProfile,
  type ScaffoldingLevel,
  type StudentProfileState,
} from '../../lib/student-adaptive-model';

export interface AdaptiveRecommendationRailProps {
  onRunRecommendedMission?: (missionId: string) => void;
}

export const AdaptiveRecommendationRail: React.FC<AdaptiveRecommendationRailProps> = ({
  onRunRecommendedMission,
}) => {
  const { activeWorkbench, setActiveWorkbench, setPersonaMode, locale } = usePersonaTheme();
  const ts = getTroubleshootingCopy(locale);
  const [profile, setProfile] = useState<StudentProfileState>(() => getStudentProfile());
  const [, setHypTick] = useState<number>(0);
  const [screenPayload, setScreenPayload] = useState<Record<string, unknown>>(
    () => getClientAppState().payload,
  );
  const [addingStudent, setAddingStudent] = useState<boolean>(false);
  const [customName, setCustomName] = useState<string>('');

  useEffect(() => subscribeStudentProfile((p) => setProfile({ ...p })), []);
  useEffect(() => subscribeClientAppState((s) => setScreenPayload(s.payload)), []);
  useEffect(() => subscribeProblemSolvingStore(() => setHypTick((t) => t + 1)), []);

  const bundle = buildAdaptiveRecommendations(profile, {
    activeWorkbench,
    payload: screenPayload,
  });
  const stageStatus = evaluateSixStageProgress(activeWorkbench);
  const avgPct = Math.round(getAverageMastery(profile) * 100);
  const students = listStudentProfiles();
  const rec = bundle.primaryRecommendation;

  const handleApplyRecommendation = (item: AdaptiveRecommendation) => {
    if (item.missionId && onRunRecommendedMission) {
      onRunRecommendedMission(item.missionId);
      return;
    }
    setPersonaMode('learn');
    if (item.targetWorkbench !== activeWorkbench) {
      setActiveWorkbench(item.targetWorkbench as WorkbenchId);
    }
    if (item.mutations) {
      dispatchWorkbenchMutation({
        targetWorkbench: item.targetWorkbench,
        params: item.mutations,
        reason: item.id,
      });
    }
  };

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;
    switchStudentProfile(customName.trim());
    setCustomName('');
    setAddingStudent(false);
  };

  return (
    <div
      className="mission-bar"
      data-testid="adaptive-recommendation-rail"
      aria-label="Student Scorecard and Personalized Recommendations"
    >
      <label className="mono" style={{ fontSize: '0.76rem' }}>
        {ts.railStudentLabel}
        <select
          aria-label="Select Student Scorecard"
          data-testid="student-switcher-select"
          value={profile.studentId}
          onChange={(e) => {
            if (e.target.value === '__new__') setAddingStudent(true);
            else switchStudentProfile(e.target.value);
          }}
        >
          {students.map((s) => (
            <option key={s.studentId} value={s.studentId}>{s.studentName}</option>
          ))}
          <option value="__new__">{ts.railNewStudentOpt}</option>
        </select>
      </label>

      {addingStudent && (
        <form onSubmit={handleAddStudent} style={{ display: 'inline-flex', gap: '0.3rem' }}>
          <input
            aria-label="New Student Name"
            data-testid="new-student-input"
            placeholder="Student name..."
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            style={{ width: '110px', fontSize: '0.75rem', padding: '0.2rem 0.45rem' }}
          />
          <button type="submit" data-testid="save-student-btn">{ts.railSaveBtn}</button>
        </form>
      )}

      <span className="mission-pill" data-testid="student-mastery-badge">
        {ts.railMasteryBadge(avgPct, profile.solvedMissionIds.length)}
      </span>

      <span className="mission-pill" data-testid="hypothesis-verified-badge" title="Fogler & LeBlanc Rule #12 Hypotheses Proved/Disproved">
        {ts.railHypothesesBadge(stageStatus.correctHypothesisCount, stageStatus.totalHypothesisCount)}
      </span>

      <span className="mission-pill" data-testid="rail-detective-stamp" title={buildFoglerDetectiveStamp(activeWorkbench, profile).tierLabel}>
        {buildFoglerDetectiveStamp(activeWorkbench, profile).code}
      </span>

      <label className="mono" style={{ fontSize: '0.76rem' }}>
        {ts.railCoachLabel}
        <select
          aria-label="Select AI Scaffolding Level"
          data-testid="scaffolding-level-select"
          value={profile.scaffoldingOverride}
          onChange={(e) => setScaffoldingOverride(e.target.value as ScaffoldingLevel | 'auto')}
        >
          <option value="auto">{ts.railAutoOpt(bundle.scaffoldingLevel.toUpperCase())}</option>
          <option value="guided">{ts.railGuidedOpt}</option>
          <option value="socratic">{ts.railSocraticOpt}</option>
          <option value="challenge">{ts.railChallengeOpt}</option>
        </select>
      </label>

      {bundle.detectedTraps.length > 0 && (
        <span className="wb-verdict fail" data-testid="active-trap-badge" style={{ margin: 0, padding: '0.2rem 0.55rem', fontSize: '0.74rem' }}>
          {ts.railTrapPrefix} {bundle.detectedTraps[0].replace(/_/g, ' ')}
        </span>
      )}

      <button
        type="button"
        data-testid="adaptive-next-action-btn"
        onClick={() => handleApplyRecommendation(rec)}
        title={`${rec.rationale} ${rec.citation}`}
      >
        {ts.railNextStepPrefix} {rec.title}
      </button>

      <button
        type="button"
        data-testid="reset-student-profile-btn"
        onClick={() => {
          resetStudentProfile();
          resetProblemSolvingStore();
        }}
        title="Reset current student scorecard and hypothesis log"
      >
        {ts.railResetBtn}
      </button>
    </div>
  );
};
