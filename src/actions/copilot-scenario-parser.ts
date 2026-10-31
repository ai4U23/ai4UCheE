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
import { solveKineticsReactor, type KineticsReactorInputs } from '../components/workbenches/kinetics-solver-math';
import { buildAtlasScenarioDetails, extractAtlasScenario } from '../lib/perry-sections/perry-atlas-copilot-router';

export interface ParsedCopilotScenario {
  mutations?: WorkbenchMutationCommand;
  liveReply: string;
  citations: string[];
  cards: GenUiPayload[];
}

type Params = Record<string, number | string>;

const CAVITATION_RESCUE: Params = { flowGpm: 260, pSuctionPsig: 15, npshrM: 3 };
const FLOODING_RESCUE: Params = { rMult: 1.3, colDiamM: 0.85 };
const RUNAWAY_RESCUE: Params = { conversionX: 0.80, thielePhi: 1.1, semenovPsi: 0.24 };
const num = (s: string, re: RegExp): number | undefined => re.exec(s)?.[1] !== undefined ? Number(re.exec(s)![1]) : undefined;

const QUESTION_OPENER_RE = /^\s*(?:🕵️\s*Socratic\s*Hint:|🤝\s*AI\s*Agent:|(?:test|verify)\s+h\d\s+with\s+ai\s+agent:|why\b|how\b|explain\b|derive\b|walk\s+(?:me|through)\b|compare\b|is\s+pump\b|help\b|audit\b|what\s+(?:is|are|does|causes)\b)/i;
const MUTATION_OPENER_RE = /^\s*(?:⚡\s*)?(?:what\s+if|suppose|set|change|switch|try|fix|stop|prevent|rescue|correct|check\s+sec|test\s+sec)/i;

/** Guard against conceptual/Socratic questions accidentally mutating live workbench dials. */
export function isConceptualQuestion(prompt: string): boolean {
  if (MUTATION_OPENER_RE.test(prompt)) return false;
  if (QUESTION_OPENER_RE.test(prompt)) return true;
  return /\?\s*$/.test(prompt);
}

function extract(prompt: string): Array<{ wb: WorkbenchId; params: Params; note: string }> {
  const out: Array<{ wb: WorkbenchId; params: Params; note: string }> = [];
  const cav = /(?:fix|stop|prevent|solve)\s+cavitation/i.test(prompt);
  const flood = /(?:fix|stop|prevent)\s+(?:column\s+)?flooding/i.test(prompt);
  const runawayRescue = /(?:rescue|fix|stop|prevent)\s+(?:reactor\s+)?runaway/i.test(prompt);
  const convX = num(prompt, /\b(?:conversion|X)\s*(?:=|to|of)\s*(0\.\d+)/i);
  const thielePhi = num(prompt, /(?:thiele|φ|phi)\s*(?:=|to|of)\s*(\d+(?:\.\d+)?)/i);
  const semenovPsi = num(prompt, /(?:semenov|ψ|psi)\s*(?:=|to|of)\s*(0\.\d+)/i);
  if (runawayRescue || (convX !== undefined && !/\bsec(?:tion)?\b/i.test(prompt)) || thielePhi !== undefined || semenovPsi !== undefined) {
    const params: Params = {
      ...(runawayRescue ? RUNAWAY_RESCUE : {}),
      ...(convX !== undefined ? { conversionX: convX } : {}),
      ...(thielePhi !== undefined ? { thielePhi } : {}),
      ...(semenovPsi !== undefined ? { semenovPsi } : {}),
    };
    if (Object.keys(params).length) out.push({ wb: 'wb6-kinetics-reactors', params, note: runawayRescue ? 'reactor runaway rescue' : 'Fogler kinetics & reactor What-If' });
  }
  const gpm = num(prompt, /\b(\d+(?:\.\d+)?)\s*gpm\b/i);
  const npsMatch = /\b(\d+(?:\.\d+)?)\s*(?:inch|in\s+pipe|")\b|(?:diameter|nps|pipe)\s*(?:to|=|of)?\s*(\d+(?:\.\d+)?)\s*in\b/i.exec(prompt);
  const nps = npsMatch ? Number(npsMatch[1] ?? npsMatch[2]) : undefined;
  const psig = num(prompt, /\b(-?\d+(?:\.\d+)?)\s*psig\b/i);
  if (cav || gpm !== undefined || nps !== undefined || (psig !== undefined && !/\bsec(?:tion)?\.?\s*\d/i.test(prompt))) {
    const params: Params = { ...(cav ? CAVITATION_RESCUE : {}), ...(gpm !== undefined ? { flowGpm: gpm } : {}), ...(nps !== undefined ? { npsInch: nps } : {}), ...(psig !== undefined ? { pSuctionPsig: psig } : {}) };
    if (Object.keys(params).length) out.push({ wb: 'wb3-hydraulics', params, note: cav ? 'cavitation rescue' : 'hydraulic What-If' });
  }
  const compound = /\b(water|ethanol|benzene|toluene|acetone)\b/i.exec(prompt)?.[1]?.toLowerCase();
  const tempK = num(prompt, /\b(\d{3}(?:\.\d+)?)\s*K\b/i);
  if (compound || tempK !== undefined) {
    out.push({ wb: 'wb2-thermo-dippr', params: { ...(compound ? { compound } : {}), ...(tempK !== undefined ? { tempK } : {}) }, note: 'vapor-pressure What-If' });
  }
  const rMult = num(prompt, /\b(?:reflux(?:\s+ratio)?|R)\s*(?:to|=|of)\s*(\d+(?:\.\d+)?)/i);
  const alpha = num(prompt, /\balpha\s*(?:to|=|of)\s*(\d+(?:\.\d+)?)/i);
  if (flood || rMult !== undefined || alpha !== undefined) {
    const params: Params = { ...(flood ? FLOODING_RESCUE : {}), ...(rMult !== undefined ? { rMult } : {}), ...(alpha !== undefined ? { alpha } : {}) };
    if (Object.keys(params).length) out.push({ wb: 'wb4-distillation', params, note: flood ? 'flooding rescue' : 'distillation What-If' });
  }
  const reading = /(?:(?:set|change|correct)\s+(?:chart\s+)?reading[^0-9]*|(?:reading|fanning)\s*(?:to|=|of)\s*)(0\.\d+|\d+(?:\.\d+)?)(?![x×\d])/i.exec(prompt)?.[1];
  if (reading !== undefined) out.push({ wb: 'wb1-visual-verifier', params: { userReading: reading }, note: 'chart-reading check' });
  return out;
}

function diagnose(wb: WorkbenchId, payload: { inputs?: Params; metrics?: Params }): string {
  const live = (payload.inputs ?? {}) as Record<string, unknown>;
  const n = (k: string, d: number): number => Number(live[k] ?? d);
  if (wb === 'wb6-kinetics-reactors') {
    const input: KineticsReactorInputs = {
      conversionX: n('conversionX', 0.8), tempK: n('tempK', 450), pInletPsig: n('pInletPsig', 45),
      epsilonA: n('epsilonA', 0.25), alphaErgun: n('alphaErgun', 0.015), thielePhi: n('thielePhi', 1.4),
      semenovPsi: n('semenovPsi', 0.28),
    };
    const s = solveKineticsReactor(input);
    return `Live WB6 check: X=${s.conversionX.toFixed(2)} @ P_abs=${s.pInletPsia.toFixed(2)} psia → V_CSTR/V_PFR=${s.vRatioCstrPfr.toFixed(2)}×, Thiele η=${(s.effectivenessEta * 100).toFixed(1)}%, Semenov ψ=${s.semenovPsi.toFixed(3)} (${s.isRunaway ? 'RUNAWAY' : 'STABLE'}).`;
  }
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
  'wb3-hydraulics': ["[Perry's 9th Ed., Sec. 10, pp. 10-24..25; BSL Transport Phenomena 2nd Ed., Ch. 6]", "[Perry's 9th Ed., Eqs. 6-37..6-39, p. 6-11]"],
  'wb2-thermo-dippr': ["[Perry's 9th Ed., Table 2-8, p. 2-53; Smith, Van Ness & Abbott 9th Ed., Ch. 10 & 12]", "[Perry's 9th Ed., Table 2-69, p. 2-120]"],
  'wb4-distillation': ["[Perry's 9th Ed., Sec. 13, p. 13-36; Seader, Henley & Roper 4th Ed., Ch. 7 & 9]", "[Perry's 9th Ed., Fig. 14-32, p. 14-37]"],
  'wb6-kinetics-reactors': ["[Fogler 7th Ed., Ch. 2, 5, 12, 15; Perry's 9th Ed., Sec. 7 & 19, p. 19-6]", "[BSL Transport 2nd Ed., Ch. 18; Crowl & Louvar 4th Ed., Ch. 8]"],
  'wb1-visual-verifier': ["[Perry's 9th Ed., Fig. 6-9, p. 6-10; BSL Transport 2nd Ed., Ch. 6]"],
  'wb5-handbook-atlas': ["[Perry's 9th Ed., Sec. 1–25, pp. 1-4..25-3; 6-Book Blended Corpus]"],
};

/** Parse a What-If prompt against live screen state; returns mutations + live-grounded narration. */
export function parseCopilotScenario(prompt: string, state: CopilotScreenState): ParsedCopilotScenario {
  if (isConceptualQuestion(prompt)) return { liveReply: '', citations: [], cards: [] };
  const hasExplicitSec = /\bsec(?:tion)?\.?\s*\d{1,2}\b/i.test(prompt);
  const found = extract(prompt);
  const atlasMatch = (hasExplicitSec || (found.length === 0 && state.activeWorkbench === 'wb5-handbook-atlas')) ? extractAtlasScenario(prompt) : null;
  if (atlasMatch) {
    const details = buildAtlasScenarioDetails(atlasMatch.secNum, Number(atlasMatch.params.primaryVal), Number(atlasMatch.params.secondaryVal));
    const mutations: WorkbenchMutationCommand = { targetWorkbench: 'wb5-handbook-atlas', params: atlasMatch.params, reason: atlasMatch.note };
    return {
      mutations,
      liveReply: `⚡ What-If parsed (${atlasMatch.note}): ${Object.entries(atlasMatch.params).map(([k, v]) => `${k}=${v}`).join(', ')} → dispatching to wb5-handbook-atlas.\n${details.diagnosis}`,
      citations: [details.citation],
      cards: [details.card],
    };
  }
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
