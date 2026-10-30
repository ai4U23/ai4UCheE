// Contextual 1-click starter prompt catalog per workbench (WB1..WB6) + adaptive prompt selector.
import type { WorkbenchLivePayload } from '../../actions/view-screen';
import type { WorkbenchId } from '../../context/persona-theme-context';
import {
  detectLivePayloadTraps,
  getEffectiveScaffoldingLevel,
  type StudentProfileState,
} from '../../lib/student-adaptive-model';

/** 3 student/engineer starter prompts per workbench (Point-and-Ask on-ramps). */
const STARTER_PROMPTS: Record<WorkbenchId, readonly string[]> = {
  'wb1-visual-verifier': [
    'Why is Moody f_D = 4 × Fanning f_F?',
    'How do I read Fig. 6-9 at Re = 10⁵?',
    'Show the white-box Perry equation proof',
  ],
  'wb2-thermo-dippr': [
    'Why convert psig to psia first?',
    'Why does Wilson fail for LLE?',
    'Derive DIPPR Eq. 101 at 100 °C',
  ],
  'wb3-hydraulics': [
    'Is Pump P-101 safe from cavitation (NPSHa)?',
    'Check if the control valve is choked (ISA-75.01)',
    'Compare 70% / 100% / 120% flow cases',
  ],
  'wb4-distillation': [
    'How does reflux ratio R/R_min affect flooding?',
    'Explain the q-line slope for saturated liquid',
    'Walk through Fenske N_min & Underwood R_min',
  ],
  'wb6-kinetics-reactors': [
    'Why is CSTR volume larger than PFR on a Levenspiel plot (Fogler Ch. 2)?',
    'How does Thiele modulus φ limit catalyst effectiveness η (Fogler Ch. 15 / BSL Ch. 18)?',
    'Explain the Semenov thermal runaway limit ψ_crit = 1/e (Crowl & Louvar Ch. 8)',
  ],
  'wb5-handbook-atlas': [
    'Test Sec 11 LMTD temperature cross at P=0.72, R=1.6',
    'Check Sec 19 CSTR vs PFR & Semenov runaway criteria',
    'Check Sec 23 API 520 relief valve sizing at 150 psig',
  ],
};

/** Contextual 1-click starter prompts for the active workbench (adapts to student level & active traps). */
export function getStarterPromptsForWorkbench(
  workbench: WorkbenchId,
  profile?: StudentProfileState,
  payload?: WorkbenchLivePayload,
): readonly string[] {
  const base = STARTER_PROMPTS[workbench] ?? STARTER_PROMPTS['wb1-visual-verifier'];
  if (!profile) return base;
  const traps = payload ? detectLivePayloadTraps(workbench, payload) : profile.activeTraps;
  if (traps.includes('npsha_cavitation_trap') || traps.includes('psig_psia_trap')) {
    return ['🕵️ Socratic Hint: Why does -10 psig cause P-101 cavitation?', base[0], base[1]];
  }
  if (traps.includes('fanning_4x_trap')) {
    return ['🕵️ Socratic Hint: Why is my Fig. 6-9 reading 4× higher than Perry?', base[0], base[1]];
  }
  if (traps.includes('flooding_trap')) {
    return ['🕵️ Socratic Hint: Which knob lowers Fair % flood fastest?', base[0], base[1]];
  }
  if (traps.includes('semenov_runaway_trap') || traps.includes('thiele_diffusion_trap')) {
    return ['🕵️ Socratic Hint: How do I stabilize ψ ≤ 0.368 and Thiele φ ≤ 2?', base[0], base[1]];
  }
  const level = getEffectiveScaffoldingLevel(profile, workbench);
  if (level === 'challenge') {
    return [`🏆 Challenge: Stress-test ${workbench.toUpperCase()} design margins`, base[0], base[1]];
  }
  return base;
}

/** 1-tap "What-If" quick actions per workbench — dispatch mutation commands via the copilot. */
const QUICK_ACTIONS: Record<WorkbenchId, readonly string[]> = {
  'wb1-visual-verifier': ['⚡ Correct Chart Reading to Perry-Exact (0.0045)'],
  'wb2-thermo-dippr': ['⚡ Switch to Ethanol @ 351.5 K'],
  'wb3-hydraulics': ['⚡ Fix Cavitation (6 in pipe, 15 psig)'],
  'wb4-distillation': ['⚡ Stop Column Flooding (R = 1.3 × Rmin, D = 0.85 m)'],
  'wb6-kinetics-reactors': ['⚡ Rescue Reactor Runaway (X = 0.80, φ = 1.1, ψ = 0.24)'],
  'wb5-handbook-atlas': ['⚡ Check Sec 23 relief valve sizing at 150 psig'],
};

/** Contextual 1-tap What-If quick actions for the active workbench. */
export function getQuickActionsForWorkbench(workbench: WorkbenchId): readonly string[] {
  return QUICK_ACTIONS[workbench] ?? QUICK_ACTIONS['wb1-visual-verifier'];
}

/** Human-readable Point-and-Ask chip label; falls back to the raw chipId. */
export function formatChipDisplayLabel(label: string | undefined, chipId: string): string {
  return label || chipId;
}
