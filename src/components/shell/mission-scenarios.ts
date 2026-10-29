// Guided mission scenarios: 4 existing mission ids (load-bearing in phase8 tests) extended with
// dramatic trap presets + rescue mutations + a live `checkSolved` probe on the payload bus.
// Trap/rescue values are verified against the shipped solver formulas (see Validation Session 1):
// - wb3: pSuctionPsig -10 psig & NPSHr 8 m → NPSH_A ≈ 4.18 m < 8 m (cavitating); rescue 15 psig/3 m → ≈ 21.8 m.
// - wb4: rMult 1.9 & D 0.55 m → ≈ 200% of Fair flood; rescue 1.3 & 0.85 m → ≈ 64%.
// - wb2: ethanol @ 298 K → P_sat ≈ 7.9 kPa; rescue water @ 373.15 K → ≈ 101.3 kPa (1 atm).
import type { GenUiPayload } from '../../actions/define-action';
import type { WorkbenchId, WorkbenchLivePayload } from '../../actions/view-screen';
import type { SelectedChip } from '../../context/persona-theme-context';

export interface GuidedMissionScenario {
  id: string;
  workbench: WorkbenchId;
  buttonLabel: string;
  chip: Omit<SelectedChip, 'chipId'>;
  proofCard: GenUiPayload;
  initialMutations: Record<string, number | string>;
  rescueMutations: Record<string, number | string>;
  checkSolved: (payload: WorkbenchLivePayload) => boolean;
}

export const GUIDED_MISSIONS: ReadonlyArray<GuidedMissionScenario> = [
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
    initialMutations: { userReading: '0.018' },
    rescueMutations: { userReading: '0.0045' },
    checkSolved: (payload) => {
      const reading = Number(payload.inputs?.userReading);
      const exact = Number(payload.inputs?.exactValue);
      return exact !== 0 && Math.abs(reading - exact) / exact < 0.05;
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
    initialMutations: { compound: 'ethanol', tempK: 298 },
    rescueMutations: { compound: 'water', tempK: 373.15 },
    checkSolved: (payload) => Math.abs(Number(payload.metrics?.pSatKpa) - 101.325) < 5,
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
    initialMutations: { flowGpm: 450, pSuctionPsig: -10, npshrM: 8 },
    rescueMutations: { flowGpm: 260, pSuctionPsig: 15, npshrM: 3 },
    checkSolved: (payload) =>
      payload.metrics?.isCavitating === false && Number(payload.metrics?.npshAvailableM) >= 5.0,
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
    initialMutations: { rMult: 1.9, colDiamM: 0.55 },
    rescueMutations: { rMult: 1.3, colDiamM: 0.85 },
    checkSolved: (payload) => payload.metrics?.isFlooding === false,
  },
];

export function getMissionById(id: string): GuidedMissionScenario | undefined {
  return GUIDED_MISSIONS.find((m) => m.id === id);
}
