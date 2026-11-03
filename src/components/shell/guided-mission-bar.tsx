// GuidedMissionBar: 5 one-click student missions below the nav — switches to 🎓 Learn Mode,
// selects the target workbench, attaches the mission's Point-and-Ask chip, emits an instant
// `equation-proof-card`, presets the trap scenario via the mutation bus, tracks DIY (+35%) vs
// Auto-Fix (+12%) mastery in `student-adaptive-model.ts`, and mounts `AdaptiveRecommendationRail`.
import React, { useEffect, useRef, useState } from 'react';
import { agentNative } from '../../actions/define-action';
import { dispatchWorkbenchMutation, getClientAppState, subscribeClientAppState, type WorkbenchLivePayload } from '../../actions/view-screen';
import { usePersonaTheme } from '../../context/persona-theme-context';
import { buildAdaptiveRecommendations } from '../../lib/adaptive-recommendation-engine';
import { getShellCopy, MISSION_BUTTON_LABELS_VI } from '../../lib/i18n/vi-shell-dictionary';
import { getStudentProfile, recordMissionOutcome, recordPayloadObservation, subscribeStudentProfile, type StudentProfileState } from '../../lib/student-adaptive-model';
import { autoCompleteProblemStagesForRescue, resetProblemSolvingStore } from '../../lib/hypothesis-verification-engine';
import { ALL_24_REAL_LIFE_PROBLEMS, problemEntryToMissionScenario, resetActiveProblems, setActiveProblemForWorkbench } from '../../lib/problem-library-registry';
import type { ProblemCaseEntry } from '../../lib/problem-library-types';
import { AdaptiveRecommendationRail } from './adaptive-recommendation-rail';
import { MissionChecklistBanner } from './mission-checklist-banner';
import { getMissionById, type GuidedMissionScenario } from './mission-scenarios';
import { ProblemLibraryBrowser } from './problem-library-browser';

export const GuidedMissionBar: React.FC = () => {
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [libraryOpen, setLibraryOpen] = useState<boolean>(false);
  const [showScorecardDrawer, setShowScorecardDrawer] = useState<boolean>(false);
  const [activeMission, setActiveMission] = useState<GuidedMissionScenario | null>(null);
  const [profile, setProfile] = useState<StudentProfileState>(() => getStudentProfile());
  const usedAutoFixRef = useRef<boolean>(false);
  const solvedRecordedRef = useRef<string | null>(null);
  const { activeWorkbench, locale, setPersonaMode, setActiveWorkbench, clearChips, toggleChip } = usePersonaTheme();
  const t = getShellCopy(locale);

  useEffect(() => subscribeStudentProfile((p) => setProfile({ ...p })), []);

  // Observe live payload transitions: debounce continuous slider trap checks (600ms) and record DIY mission solves.
  useEffect(() => {
    let trapSeen = false;
    return subscribeClientAppState((state) => {
      const payload = (state.payload ?? {}) as WorkbenchLivePayload;
      recordPayloadObservation(state.activeWorkbench as GuidedMissionScenario['workbench'], payload, 600);
      if (activeMission && state.activeWorkbench === activeMission.workbench) {
        if (!activeMission.checkSolved(payload)) trapSeen = true;
        else if (trapSeen && solvedRecordedRef.current !== activeMission.id && !usedAutoFixRef.current) {
          solvedRecordedRef.current = activeMission.id;
          recordMissionOutcome(activeMission.id, false);
        }
      }
    });
  }, [activeMission]);

  const applyMutations = (mission: GuidedMissionScenario, params: Record<string, number | string>) => {
    const dispatch = () => dispatchWorkbenchMutation({ targetWorkbench: mission.workbench, params, reason: mission.id });
    if (typeof window === 'undefined') dispatch();
    else window.setTimeout(dispatch, 20);
  };

  const runMission = (mission: GuidedMissionScenario, params: Record<string, number | string>) => {
    usedAutoFixRef.current = false;
    solvedRecordedRef.current = null;
    setPersonaMode('learn');
    setActiveWorkbench(mission.workbench);
    clearChips();
    toggleChip(mission.chip);
    agentNative.ui.output(mission.proofCard);
    setActiveMission(mission);
    applyMutations(mission, params);
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const sp = new URLSearchParams(window.location.search);
    const missionParam = sp.get('mission');
    const problemParam = sp.get('problem');
    if (missionParam) {
      const m = getMissionById(missionParam);
      if (m) runMission(m, m.initialMutations);
    } else if (problemParam) {
      const p = ALL_24_REAL_LIFE_PROBLEMS.find((x) => x.problemId === problemParam || String(x.number) === problemParam);
      if (p) { setActiveProblemForWorkbench(p); const m = problemEntryToMissionScenario(p); runMission(m, m.initialMutations); }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAutoFix = (mission: GuidedMissionScenario) => {
    usedAutoFixRef.current = true;
    solvedRecordedRef.current = mission.id;
    recordMissionOutcome(mission.id, true);
    autoCompleteProblemStagesForRescue(mission.workbench);
    applyMutations(mission, mission.rescueMutations);
    agentNative.ui.output({
      type: 'equation-proof-card',
      title: `Auto-Fix Applied (+12 pts Assisted Practice Score) — ${mission.buttonLabel}`,
      data: {
        symbolic_latex: Object.entries(mission.rescueMutations).map(([k, v]) => `${k} = ${v}`).join(',\\; '),
        substituted_latex: '\\text{Rescue applied — retry scrubbing sliders yourself for full +35 pts practice score}',
        result_latex: '\\text{Ask the Co-Pilot why this operating point is safe}',
        citation: "[Perry's 9th Ed., Sec. 10, pp. 10-24..25]",
      },
    });
  };

  const handleSocraticHint = (mission: GuidedMissionScenario) => {
    agentNative.ui.output({
      type: 'equation-proof-card',
      title: `Socratic Clue — ${mission.buttonLabel}`,
      data: {
        symbolic_latex: String(mission.proofCard.data.symbolic_latex ?? ''),
        substituted_latex: '\\text{Clue: inspect the governing physical term before changing sliders}',
        result_latex: `\\text{Target zone: } ${Object.keys(mission.rescueMutations).join(', ')}`,
        citation: String(mission.proofCard.data.citation ?? "[Perry's 9th Ed.]"),
      },
    });
  };

  const handleSelectLibraryProblem = (entry: ProblemCaseEntry) => {
    setActiveProblemForWorkbench(entry);
    setLibraryOpen(false);
    const mission = problemEntryToMissionScenario(entry);
    runMission(mission, mission.initialMutations);
  };

  const bundle = buildAdaptiveRecommendations(profile, { activeWorkbench, payload: getClientAppState().payload });

  return (
    <>
      <div className="mission-bar" data-testid="guided-mission-bar">
        {!collapsed && (
          <>
            <span className="studio-drawer-collapsed">{t.missionLeadText}</span>
            <button
              type="button" data-testid="toggle-problem-library-btn" onClick={() => setLibraryOpen(!libraryOpen)}
              title="Browse all 24 Real-Life Plant Problems across 🌱 L1 · 🔧 L2 · 🕵️ L3 · 🚨 L4"
            >
              {t.browseProblemsBtn(ALL_24_REAL_LIFE_PROBLEMS.length)}
            </button>
            <div className={showScorecardDrawer ? 'studio-quick-missions-popover' : 'studio-drawer-collapsed'}>
              {bundle.rankedMissions.map(({ mission, solved, isRecommendedNext, reasonBadge }) => (
                <button
                  key={mission.id} type="button" data-testid={mission.id} title={reasonBadge}
                  onClick={() => { resetActiveProblems(); setShowScorecardDrawer(false); runMission(mission, mission.initialMutations); }}
                >
                  {solved ? '✓ ' : ''}
                  {locale === 'vi' ? (MISSION_BUTTON_LABELS_VI[mission.id] ?? mission.buttonLabel) : mission.buttonLabel}
                  {isRecommendedNext && (
                    <span data-testid="recommended-mission-badge" className="mono" style={{ marginLeft: '4px', fontSize: '11px' }}>[Next]</span>
                  )}
                </button>
              ))}
            </div>
            <button type="button" onClick={() => setShowScorecardDrawer(!showScorecardDrawer)} title="Toggle Quick Missions & Student Progress Drawer">
              {t.coachBtn(showScorecardDrawer)}
            </button>
          </>
        )}
        <button
          type="button" className="studio-drawer-collapsed" data-testid="toggle-mission-bar"
          aria-label={t.missionsToggleAria(collapsed)} onClick={() => setCollapsed(!collapsed)}
        >
          {t.missionsToggleBtn(collapsed)}
        </button>
      </div>
      {!collapsed && (
        <>
          {libraryOpen && (
            <ProblemLibraryBrowser
              activeProblemId={activeMission?.id}
              solvedProblemIds={profile.solvedMissionIds}
              onSelectProblem={handleSelectLibraryProblem}
              onClose={() => setLibraryOpen(false)}
            />
          )}
          <div className={showScorecardDrawer ? '' : 'studio-drawer-collapsed'}>
            <AdaptiveRecommendationRail
              onRunRecommendedMission={(id) => {
                const target = getMissionById(id);
                if (target) runMission(target, target.initialMutations);
              }}
            />
          </div>
          {activeMission && (
            <div className="studio-floating-mission-wrap">
              <MissionChecklistBanner
                mission={activeMission}
                onAutoFix={handleAutoFix}
                onSocraticHint={handleSocraticHint}
                onDismiss={() => setActiveMission(null)}
              />
            </div>
          )}
        </>
      )}
    </>
  );
};
