// Types and taxonomy for the 24 Real-Life Chemical Engineering Problem Library
// across all 7 reference books (Fogler & LeBlanc 2e, Perry 9e, Fogler 7e, Crowl 4e, Seader 4e, BSL 2e, SVNAS 9e).
import type { WorkbenchId } from '../actions/view-screen';

export type EngineeringProgressionTier = 'L1' | 'L2' | 'L3' | 'L4';

export type EquipmentCategoryId =
  | 'pumps-piping'
  | 'valves-reliefs'
  | 'exchangers-boilers'
  | 'vessels-tanks'
  | 'columns-towers'
  | 'reactors-catalysts'
  | 'dryers-membranes'
  | 'special-systems';

export type SymptomCategoryId =
  | 'design-unit-trap'
  | 'cavitation-choking-flooding'
  | 'thermal-runaway-cold'
  | 'offspec-yield-purity'
  | 'safety-containment-breach';

export interface ProblemCaseEntry {
  problemId: string;
  number: number;
  title: string;
  tier: EngineeringProgressionTier;
  tierBadge: string;
  equipmentCategory: EquipmentCategoryId;
  equipmentTag: string;
  symptomCategory: SymptomCategoryId;
  workbenchId: WorkbenchId;
  subjectLabel: string;
  whyLearnSubject: string;
  timeHorizonBadge: string;
  rateOfChangeClue: string;
  sourceBookCitation: string;
  observationSummary: string;
  perceivedProblemTrap: string;
  realProblemDefined: string;
  ktIs: string;
  ktIsNot: string;
  governingLatex: string;
  governingEquationId: string;
  rootCauseClaim: string;
  decoyClaim1: string;
  decoyClaim2: string;
  solutionSummary: string;
  initialMutations: Record<string, number | string>;
  rescueMutations: Record<string, number | string>;
}

export const PROGRESSION_TIER_META: Readonly<Record<EngineeringProgressionTier, { label: string; shortBadge: string; description: string }>> = {
  L1: {
    label: '🌱 L1 · Unit & Concept Trap',
    shortBadge: '🌱 L1 Trap',
    description: 'Single equation + classic unit/datum trap (psig vs psia, Fanning f_F vs Darcy f_D = 4·f_F, °C vs K).',
  },
  L2: {
    label: '🔧 L2 · Equipment Bottleneck',
    shortBadge: '🔧 L2 Bottleneck',
    description: 'Single unit operation where two physical phenomena trade off (choked valve, HX temperature cross, azeotrope/LLE).',
  },
  L3: {
    label: '🕵️ L3 · Multi-Hypothesis Upset',
    shortBadge: '🕵️ L3 Troubleshooting',
    description: 'Real plant fault with Δt time clue and 2–3 plausible decoy causes that must be falsified (Rule #12).',
  },
  L4: {
    label: '🚨 L4 · Coupled Safety & Design',
    shortBadge: '🚨 L4 Safety/Design',
    description: 'High-consequence runaway, CSB disaster analysis, or open-ended multi-constraint process design.',
  },
};

export const EQUIPMENT_CATEGORY_META: Readonly<Record<EquipmentCategoryId, { label: string; icon: string }>> = {
  'pumps-piping': { label: 'Pumps & Piping (P-101 / L-101)', icon: '🔄' },
  'valves-reliefs': { label: 'Valves & Reliefs (FCV / PSV)', icon: '🎛️' },
  'exchangers-boilers': { label: 'Exchangers & Boilers (E-101)', icon: '🔥' },
  'vessels-tanks': { label: 'Flash Drums & Tanks (V-101 / TK)', icon: '💧' },
  'columns-towers': { label: 'Distillation & Absorbers (T-201)', icon: '🗼' },
  'reactors-catalysts': { label: 'Reactors & Catalysts (R-301 / PBR)', icon: '⚗️' },
  'dryers-membranes': { label: 'Cooling Towers & Membranes (CT / M)', icon: '🌬️' },
  'special-systems': { label: 'Electrolyzers, Fab & Chem-E-Car', icon: '⚡' },
};

export const SYMPTOM_CATEGORY_META: Readonly<Record<SymptomCategoryId, { label: string }>> = {
  'design-unit-trap': { label: '📐 Design / Audit Mismatch' },
  'cavitation-choking-flooding': { label: '🔊 Cavitation / Choking / Flooding' },
  'thermal-runaway-cold': { label: '🌡️ Thermal Anomaly / Runaway' },
  'offspec-yield-purity': { label: '📉 Off-Spec Purity / Low Yield' },
  'safety-containment-breach': { label: '☣️ Safety / Containment Breach' },
};
