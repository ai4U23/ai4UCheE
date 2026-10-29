// Deterministic natural-language "What-If" parser: extracts workbench mutations from student
// prompts, computes live before/after engineering diagnostics from the <current-screen> payload
// via the pure solver modules, and narrates with exact [Perry's 9th Ed., ...] citations.
import type { GenUiPayload } from './define-action';
import type { ClientScreenState, WorkbenchId, WorkbenchMutationCommand } from './view-screen';

/** Parser input is the structural subset of ClientScreenState the copilot request carries. */
export type CopilotScreenState = Pick<ClientScreenState, 'activeWorkbench' | 'personaMode' | 'payload'>;
import { solveHydraulics, type HydraulicsInputs } from '../components/workbenches/hydraulics-solver-math';
import { solveThermo } from '../components/workbenches/thermo-solver-math';
import { solveDistillation, type DistillationInputs } from '../components/workbenches/distillation-solver-math';

export interface ParsedCopilotScenario {
  mutations?: WorkbenchMutationCommand;
  liveReply: string;
  citations: string[];
  cards: GenUiPayload[];
}

type Params = Record<string, number | string>;

const CAVITATION_RESCUE: Params = { flowGpm: 260, pSuctionPsig: 15, npshrM: 3 };
const FLOODING_RESCUE: Params = { rMult: 1.3, colDiamM: 0.85 };
const num = (s: string, re: RegExp): number | undefined => re.exec(s)?.[1] !== undefined ? Number(re.exec(s)![1]) : undefined;

function extract(prompt: string): Array<{ wb: WorkbenchId; params: Params; note: string }> {
  const out: Array<{ wb: WorkbenchId; params: Params; note: string }> = [];
  const cav = /(?:fix|stop|prevent|solve)\s+cavitation/i.test(prompt);
  const flood = /(?:fix|stop|prevent)\s+flooding/i.test(prompt);
  const gpm = num(prompt, /\b(\d+(?:\.\d+)?)\s*gpm\b/i);
  const nps = num(prompt, /\b(\d+(?:\.\d+)?)\s*(?:in|inch|")\b/i);
  const psig = num(prompt, /\b(-?\d+(?:\.\d+)?)\s*psig\b/i);
  if (cav || gpm !== undefined || nps !== undefined || psig !== undefined) {
    const params: Params = { ...(cav ? CAVITATION_RESCUE : {}), ...(gpm !== undefined ? { flowGpm: gpm } : {}), ...(nps !== undefined ? { npsInch: nps } : {}), ...(psig !== undefined ? { pSuctionPsig: psig } : {}) };
    if (Object.keys(params).length) out.push({ wb: 'wb3-hydraulics', params, note: cav ? 'cavitation rescue' : 'hydraulic What-If' });
  }
  const compound = /\b(water|ethanol|benzene|toluene|acetone)\b/i.exec(prompt)?.[1]?.toLowerCase();
  const tempK = num(prompt, /\b(\d{3}(?:\.\d+)?)\s*K\b/i);
  if (compound || tempK !== undefined) {
    out.push({ wb: 'wb2-thermo-dippr', params: { ...(compound ? { compound } : {}), ...(tempK !== undefined ? { tempK } : {}) }, note: 'vapor-pressure What-If' });
  }
  const rMult = num(prompt, /\breflux(?:\s+ratio)?\s*(?:to|=|of)?\s*(\d+(?:\.\d+)?)/i);
  const alpha = num(prompt, /\balpha\s*(?:to|=|of)?\s*(\d+(?:\.\d+)?)/i);
  if (flood || rMult !== undefined || alpha !== undefined) {
    const params: Params = { ...(flood ? FLOODING_RESCUE : {}), ...(rMult !== undefined ? { rMult } : {}), ...(alpha !== undefined ? { alpha } : {}) };
    if (Object.keys(params).length) out.push({ wb: 'wb4-distillation', params, note: flood ? 'flooding rescue' : 'distillation What-If' });
  }
  const reading = /(?:reading|fanning)\s*(?:to|=|of)?\s*(\d(?:\.\d+)?)/i.exec(prompt)?.[1];
  if (reading !== undefined) out.push({ wb: 'wb1-visual-verifier', params: { userReading: reading }, note: 'chart-reading check' });
  return out;
}

function diagnose(wb: WorkbenchId, payload: { inputs?: Params; metrics?: Params }): string {
  const live = (payload.inputs ?? {}) as Record<string, unknown>;
  const n = (k: string, d: number): number => Number(live[k] ?? d);
  if (wb === 'wb3-hydraulics') {
    const input: HydraulicsInputs = {
      flowGpm: n('flowGpm', 250), npsInch: n('npsInch', 4), schedule: String(live.schedule ?? '40'),
      lengthM: n('lengthM', 100), pSuctionPsig: n('pSuctionPsig', 2), zSuctionM: n('zSuctionM', 2),
      npshrM: n('npshrM', 3), valveDpPsi: n('valveDpPsi', 30),
    };
    const s = solveHydraulics(input);
    return `Live WB3 check: ${input.flowGpm} gpm in ${input.npsInch}" Sch ${input.schedule} at ${input.pSuctionPsig} psig suction → NPSH_A = ${s.npshAvailableM.toFixed(2)} m vs NPSH_r ${input.npshrM.toFixed(1)} m — ${s.isCavitating ? 'CAVITATING' : 'SAFE'} (Re ${s.caseNorm.re.toExponential(2)}, f_D ${s.caseNorm.fDarcy.toFixed(4)} = 4·f_F).`;
  }
  if (wb === 'wb2-thermo-dippr') {
    const s = solveThermo({ compound: String(live.compound ?? 'water'), tempK: n('tempK', 373.15) });
    return `Live WB2 check: ${s.label} @ ${n('tempK', 373.15).toFixed(2)} K → P_sat = ${Math.round(s.pSatPa).toLocaleString('en-US')} Pa (${s.pSatKpa.toFixed(2)} kPa) via DIPPR Eq. 101 A–E.`;
  }
  if (wb === 'wb4-distillation') {
    const input: DistillationInputs = {
      alpha: n('alpha', 2.45), xf: n('xf', 0.5), xd: n('xd', 0.95), xb: n('xb', 0.05), q: n('q', 1),
      rMult: n('rMult', 1.3), traySpacingM: n('traySpacingM', 0.61), colDiamM: n('colDiamM', 0.85),
    };
    const s = solveDistillation(input);
    return `Live WB4 check: R/R_min ${input.rMult.toFixed(2)}, D_c ${input.colDiamM.toFixed(2)} m → R_min ${s.rMin.toFixed(3)}, N_min ${s.nMin.toFixed(2)}, ${s.floodPercent.toFixed(1)}% of Fair flood — ${s.isFlooding ? 'FLOODING' : 'OK'}.`;
  }
  return 'Live WB1 check: enter your Fig. 6-9 reading to compare against the Perry-exact crosshair value (f_D = 4·f_F).';
}

const CITATIONS: Record<WorkbenchId, string[]> = {
  'wb3-hydraulics': ["[Perry's 9th Ed., Sec. 10, pp. 10-24..25 (unnumbered NPSH equations)]", "[Perry's 9th Ed., Eqs. 6-37..6-39, p. 6-11]"],
  'wb2-thermo-dippr': ["[Perry's 9th Ed., Table 2-8, p. 2-53]", "[Perry's 9th Ed., Table 2-69, p. 2-120]"],
  'wb4-distillation': ["[Perry's 9th Ed., Sec. 13, p. 13-36]", "[Perry's 9th Ed., Fig. 14-32, p. 14-37]"],
  'wb1-visual-verifier': ["[Perry's 9th Ed., Fig. 6-9, p. 6-10]"],
};

/** Parse a What-If prompt against live screen state; returns mutations + live-grounded narration. */
export function parseCopilotScenario(prompt: string, state: CopilotScreenState): ParsedCopilotScenario {
  const found = extract(prompt);
  if (found.length === 0) return { liveReply: '', citations: [], cards: [] };
  const payload = (state.payload ?? {}) as { inputs?: Params; metrics?: Params };
  const hasLivePayload = Boolean(payload.inputs && Object.keys(payload.inputs).length);
  const preferred =
    found.find((f) => f.wb === state.activeWorkbench) ??
    found.slice().sort((a, b) => Object.keys(b.params).length - Object.keys(a.params).length)[0];
  const mutations: WorkbenchMutationCommand = { targetWorkbench: preferred.wb, params: preferred.params, reason: preferred.note };
  const diagnosis = hasLivePayload
    ? diagnose(preferred.wb, payload)
    : 'Load the workbench (scrub any control) and ask again for a live before/after diagnosis.';
  const card: GenUiPayload = {
    type: 'equation-proof-card',
    title: `What-If — ${preferred.note}`,
    data: {
      symbolic_latex: Object.entries(preferred.params).map(([k, v]) => `${k} := ${v}`).join(',\\; '),
      substituted_latex: `\\text{${preferred.wb}}`,
      result_latex: '\\text{live diagnosis appended below}',
      citation: CITATIONS[preferred.wb][0],
    },
  };
  return {
    mutations,
    liveReply: `⚡ What-If parsed (${preferred.note}): ${Object.entries(preferred.params).map(([k, v]) => `${k}=${v}`).join(', ')} → dispatching to ${preferred.wb}.\n${diagnosis}`,
    citations: CITATIONS[preferred.wb],
    cards: [card],
  };
}
