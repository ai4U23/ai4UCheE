// GuidedMissionBar: 4 one-click student missions below the nav — switches to 🎓 Learn Mode,
// selects the target workbench, attaches the mission's Point-and-Ask chip, emits an instant
// `equation-proof-card` into the Co-Pilot drawer's GenUI stream, presets the dramatic trap
// scenario onto the workbench via the mutation bus, and mounts the live MissionChecklistBanner.
import React, { useState } from 'react';
import { agentNative } from '../../actions/define-action';
import { dispatchWorkbenchMutation } from '../../actions/view-screen';
import { GUIDED_MISSIONS, type GuidedMissionScenario } from './mission-scenarios';
import { MissionChecklistBanner } from './mission-checklist-banner';
import { usePersonaTheme } from '../../context/persona-theme-context';

export const GuidedMissionBar: React.FC = () => {
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [activeMission, setActiveMission] = useState<GuidedMissionScenario | null>(null);
  const { setPersonaMode, setActiveWorkbench, clearChips, toggleChip } = usePersonaTheme();

  const applyMutations = (mission: GuidedMissionScenario, params: Record<string, number | string>) => {
    // When switching tabs the target workbench mounts after this click — defer the dispatch so
    // its mutation subscription is live before the trap values arrive.
    const dispatch = () =>
      dispatchWorkbenchMutation({ targetWorkbench: mission.workbench, params, reason: mission.id });
    if (typeof window === 'undefined') {
      dispatch();
    } else {
      window.setTimeout(dispatch, 80);
    }
  };

  const runMission = (mission: GuidedMissionScenario, params: Record<string, number | string>) => {
    setPersonaMode('learn');
    setActiveWorkbench(mission.workbench);
    clearChips();
    toggleChip(mission.chip);
    agentNative.ui.output(mission.proofCard);
    setActiveMission(mission);
    applyMutations(mission, params);
  };

  const handleAutoFix = (mission: GuidedMissionScenario) => {
    applyMutations(mission, mission.rescueMutations);
    agentNative.ui.output({
      type: 'equation-proof-card',
      title: `Auto-Fix Applied — ${mission.buttonLabel}`,
      data: {
        symbolic_latex: Object.entries(mission.rescueMutations).map(([k, v]) => `${k} = ${v}`).join(',\\; '),
        substituted_latex: '\\text{rescue mutations dispatched to the workbench}',
        result_latex: '\\text{Ask the Co-Pilot why this operating point is safe}',
        citation: "[Perry's 9th Ed., Sec. 10, pp. 10-24..25]",
      },
    });
  };

  return (
    <>
      <div className="mission-bar" data-testid="guided-mission-bar">
        {!collapsed && (
          <>
            <span className="mission-pill">🧭 Guided Student Missions — 1-click start</span>
            {GUIDED_MISSIONS.map((mission) => (
              <button
                key={mission.id}
                type="button"
                data-testid={mission.id}
                onClick={() => runMission(mission, mission.initialMutations)}
              >
                {mission.buttonLabel}
              </button>
            ))}
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
        <MissionChecklistBanner
          mission={activeMission}
          onAutoFix={handleAutoFix}
          onDismiss={() => setActiveMission(null)}
        />
      )}
    </>
  );
};
