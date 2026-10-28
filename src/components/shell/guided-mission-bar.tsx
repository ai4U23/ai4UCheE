// GuidedMissionBar: 4 one-click student missions below the nav — switches to 🎓 Learn Mode,
// selects the target workbench, attaches the mission's Point-and-Ask chip, and emits an
// instant `equation-proof-card` into the Co-Pilot drawer's GenUI stream. Collapsible.
import React, { useState } from 'react';
import { agentNative, type GenUiPayload } from '../../actions/define-action';
import {
  usePersonaTheme,
  type SelectedChip,
  type WorkbenchId,
} from '../../context/persona-theme-context';

export interface StudentMission {
  id: string;
  workbench: WorkbenchId;
  buttonLabel: string;
  chip: Omit<SelectedChip, 'chipId'>;
  proofCard: GenUiPayload;
}

export const STUDENT_MISSIONS: ReadonlyArray<StudentMission> = [
  {
    id: 'mission-fanning-trap',
    workbench: 'wb1-visual-verifier',
    buttonLabel: '🔍 Catch the 4× Friction Trap',
    chip: { kind: 'figure', id: 'perry-crop', label: "Perry's 6-10 visual crop", payload: { secPage: '6-10', exactValue: 0.0045 } },
    proofCard: {
      type: 'equation-proof-card',
      title: 'Mission 1 — Moody Darcy vs. Perry Fanning Factor',
      data: {
        symbolic_latex: 'f_D = 4 \\cdot f_F',
        substituted_latex: 'f_D = 4 \\times 0.0045',
        result_latex: 'f_D = 0.0180',
        citation: "[Perry's 9th Ed., Fig. 6-9, p. 6-10]",
      },
    },
  },
  {
    id: 'mission-boil-water',
    workbench: 'wb2-thermo-dippr',
    buttonLabel: '💧 Boil Water at 100°C (psig vs psia)',
    chip: { kind: 'equation', id: 'dippr-eq-101', label: 'DIPPR Eq. 101 Vapor Pressure (Water (H₂O))', payload: { compound: 'water', tempK: 373.15 } },
    proofCard: {
      type: 'equation-proof-card',
      title: 'Mission 2 — DIPPR Eq. 101 Boiling Vapor Pressure',
      data: {
        symbolic_latex: 'P_{\\mathrm{vp}} = \\exp(C_1 + C_2/T + C_3 \\ln T + C_4 T^{C_5})',
        substituted_latex: 'T = 373.15\\text{ K (100}^\\circ\\text{C)}',
        result_latex: 'P_{\\mathrm{vp}} = 101{,}325\\text{ Pa (14.70 psia / 0.00 psig)}',
        citation: "[Perry's 9th Ed., Table 2-8, p. 2-53]",
      },
    },
  },
  {
    id: 'mission-pump-npsha',
    workbench: 'wb3-hydraulics',
    buttonLabel: '⚙️ Check Pump Cavitation (NPSHa)',
    chip: { kind: 'equipment', id: 'pump-P101', label: 'Centrifugal Pump P-101 (NPSHa vs NPSHr)', payload: { tag: 'P-101' } },
    proofCard: {
      type: 'equation-proof-card',
      title: 'Mission 3 — Pump Suction Cavitation Guardrail',
      data: {
        symbolic_latex: '\\mathrm{NPSH}_a = \\frac{P_{\\mathrm{suc,abs}} - P_{\\mathrm{vp}}}{\\rho g} + z_s - h_{f,s}',
        substituted_latex: '\\mathrm{NPSH}_a - \\mathrm{NPSH}_r \\ge 1.0\\text{ m}',
        result_latex: '\\text{SAFE (No Impeller Cavitation)}',
        citation: "[Perry's 9th Ed., Sec. 10, p. 10-28]",
      },
    },
  },
  {
    id: 'mission-distillation',
    workbench: 'wb4-distillation',
    buttonLabel: '🗼 Stage a Binary Distillation Column',
    chip: { kind: 'equation', id: 'eq-13-fenske', label: 'Fenske N_min & Underwood R_min (Perry Sec 13, p. 13-36)', payload: { alpha: 2.45 } },
    proofCard: {
      type: 'equation-proof-card',
      title: 'Mission 4 — Fenske Minimum Stages & Fair Flooding',
      data: {
        symbolic_latex: 'N_{\\min} = \\frac{\\ln[(x_D/(1-x_D))\\cdot((1-x_B)/x_B)]}{\\ln \\alpha_{AB}}',
        substituted_latex: '\\alpha_{AB} = 2.45, \\; R / R_{\\min} = 1.25',
        result_latex: '\\text{Active Tray Deck}<85\\%\\text{ Flood}',
        citation: "[Perry's 9th Ed., Sec. 13, p. 13-36 & Fig. 14-32, p. 14-37]",
      },
    },
  },
];

export const GuidedMissionBar: React.FC = () => {
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const { setPersonaMode, setActiveWorkbench, clearChips, toggleChip } = usePersonaTheme();

  const runMission = (mission: StudentMission) => {
    setPersonaMode('learn');
    setActiveWorkbench(mission.workbench);
    clearChips();
    toggleChip(mission.chip);
    agentNative.ui.output(mission.proofCard);
  };

  return (
    <div className="mission-bar" data-testid="guided-mission-bar">
      {!collapsed && (
        <>
          <span className="mission-pill">🧭 Guided Student Missions — 1-click start</span>
          {STUDENT_MISSIONS.map((mission) => (
            <button key={mission.id} type="button" data-testid={mission.id} onClick={() => runMission(mission)}>
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
  );
};
