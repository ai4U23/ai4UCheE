// GuidedMissionBar: 5 one-click student missions below the nav — switches to 🎓 Learn Mode,
// selects the target workbench, attaches the mission's Point-and-Ask chip, emits an instant
// `equation-proof-card`, presets the trap scenario via the mutation bus, tracks DIY (+35%) vs
// Auto-Fix (+12%) mastery in `student-adaptive-model.ts`, and mounts `AdaptiveRecommendationRail`.
import React, { useEffect, useRef, useState } from 'react';
import { agentNative } from '../../actions/define-action';
import { dispatchWorkbenchMutation, getClientAppState, subscribeClientAppState, type WorkbenchLivePayload } from '../../actions/view-screen';
import { usePersonaTheme } from '../../context/persona-theme-context';
import { buildAdaptiveRecommendations } from '../../lib/adaptive-recommendation-engine';
import { getStudentProfile, recordMissionOutcome, recordPayloadObservation, subscribeStudentProfile, type StudentProfileState } from '../../lib/student-adaptive-model';
import { autoCompleteProblemStagesForRescue, markProblemDefinitionReviewed } from '../../lib/hypothesis-verification-engine';
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
  const { activeWorkbench, setPersonaMode, setActiveWorkbench, clearChips, toggleChip } = usePersonaTheme();

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
    else window.setTimeout(dispatch, 80);
  };

  const runMission = (mission: GuidedMissionScenario, params: Record<string, number | string>) => {
    usedAutoFixRef.current = false;
    solvedRecordedRef.current = null;
    setPersonaMode('learn');
    setActiveWorkbench(mission.workbench);
    markProblemDefinitionReviewed(mission.workbench);
    clearChips();
    toggleChip(mission.chip);
    agentNative.ui.output(mission.proofCard);
    setActiveMission(mission);
    applyMutations(mission, params);
  };

  const handleAutoFix = (mission: GuidedMissionScenario) => {
    usedAutoFixRef.current = true;
    solvedRecordedRef.current = mission.id;
    recordMissionOutcome(mission.id, true);
    autoCompleteProblemStagesForRescue(mission.workbench);
    applyMutations(mission, mission.rescueMutations);
    agentNative.ui.output({
      type: 'equation-proof-card',
      title: `Auto-Fix Applied (+12% Assisted Mastery) — ${mission.buttonLabel}`,
      data: {
        symbolic_latex: Object.entries(mission.rescueMutations).map(([k, v]) => `${k} = ${v}`).join(',\\; '),
        substituted_latex: '\\text{Rescue applied — retry scrubbing sliders yourself for full +35\\% mastery}',
        result_latex: '\\text{Ask the Co-Pilot why this operating point is safe}',
        citation: "[Perry's 9th Ed., Sec. 10, pp. 10-24..25]",
      },
    });
  };

  const handleSocraticHint = (mission: GuidedMissionScenario) => {
    agentNative.ui.output({
      type: 'equation-proof-card',
      title: `💡 Socratic Clue — ${mission.buttonLabel}`,
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
    const mission = problemEntryToMissionScenario(entry);
    runMission(mission, mission.initialMutations);
  };

  const bundle = buildAdaptiveRecommendations(profile, {
    activeWorkbench,
    payload: getClientAppState().payload,
  });

  return (
    <>
      <div className="mission-bar" data-testid="guided-mission-bar">
        {!collapsed && (
          <>
            <span className="mission-pill">🚨 Step 1 · Start from a Real-Life Plant Problem (Fogler &amp; LeBlanc 6-Stage Flow)</span>
            <button
              type="button"
              data-testid="toggle-problem-library-btn"
              onClick={() => setLibraryOpen(!libraryOpen)}
            >
              📚 Browse All {ALL_24_REAL_LIFE_PROBLEMS.length} Problems (🌱 L1 · 🔧 L2 · 🕵️ L3 · 🚨 L4)
            </button>
            <div className={showScorecardDrawer ? 'wb-actions-row' : 'studio-drawer-collapsed'}>
              {bundle.rankedMissions.map(({ mission, solved, isRecommendedNext, reasonBadge }) => (
                <button
                  key={mission.id}
                  type="button"
                  data-testid={mission.id}
                  title={reasonBadge}
                  onClick={() => { resetActiveProblems(); runMission(mission, mission.initialMutations); }}
                >
                  {solved ? '✓ ' : ''}
                  {mission.buttonLabel}
                  {isRecommendedNext && (
                    <span data-testid="recommended-mission-badge" style={{ marginLeft: '0.3rem' }}>
                      ⭐
                    </span>
                  )}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setShowScorecardDrawer(!showScorecardDrawer)}
              title="Toggle Quick Missions & Student Progress Drawer"
            >
              {showScorecardDrawer ? '▾ Less' : '⚙️ Quick Missions & Coach'}
            </button>
          </>
        )}
        <button
          type="button"
          data-testid="toggle-mission-bar"
          aria-label={collapsed ? 'Show guided mission bar' : 'Hide guided mission bar'}
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? '▸ Show Missions' : '▾ Hide'}
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
          <MissionChecklistBanner
            mission={activeMission}
            onAutoFix={handleAutoFix}
            onSocraticHint={handleSocraticHint}
            onDismiss={() => setActiveMission(null)}
          />
        </>
      )}
    </>
  );
};
