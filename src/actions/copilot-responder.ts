// Tier-1 deterministic ChE Tutor & Action Responder: intent-matched tutoring grounded in
// Perry's 9th Ed. with white-box rigor (psia = psig + 14.696; Darcy f_D = 4 · Fanning f_F).
// Additive (Validation Session 1): live `payload` in the request, natural-language What-If
// parsing via copilot-scenario-parser, and optional `actionMutations` in the response.
import { z } from 'zod';
import { agentNative, defineAction, type GenUiPayload } from './define-action';
import { parseCopilotScenario } from './copilot-scenario-parser';
import type { WorkbenchMutationCommand } from './view-screen';

export const CopilotRequestSchema = z.object({
  prompt: z.string().default(''),
  activeWorkbench: z.string().default('wb1-visual-verifier'),
  personaMode: z.enum(['learn', 'plant']).default('learn'),
  selectedChips: z.array(z.object({
    chipId: z.string(),
    label: z.string().optional(),
    kind: z.string().optional(),
    payload: z.record(z.unknown()).optional(),
  })).default([]),
  payload: z.record(z.unknown()).optional(),
});

export type CopilotRequest = z.infer<typeof CopilotRequestSchema>;

export interface CopilotResponse {
  reply: string;
  model: string;
  tier: 'tier1-deterministic' | 'tier2-gemini-4-argon-low';
  citations: string[];
  genUiCards: GenUiPayload[];
  actionMutations?: WorkbenchMutationCommand;
}

type Intent = 'wb2-thermo' | 'wb3-hydraulics' | 'wb4-distillation' | 'wb1-charts';

const INTENT_KEYWORDS: ReadonlyArray<[Intent, readonly string[]]> = [
  ['wb2-thermo', ['wb2', 'dippr', 'vapor', 'vapour', 'carlson', 'psig', 'psia', 'boiling', 'wilson', 'lle']],
  ['wb3-hydraulics', ['wb3', 'hydraulics', 'cavitation', 'npsha', 'npshr', 'valve', ' cv', 'cv ']],
  ['wb4-distillation', ['wb4', 'distillation', 'mccabe', 'flooding', 'r_min', 'n_min', 'reflux', 'fenske', 'underwood']],
];

function detectIntent(input: CopilotRequest): Intent {
  const hay = [input.prompt, input.activeWorkbench, ...input.selectedChips.flatMap((c) => [c.chipId, c.label ?? '', c.kind ?? ''])]
    .join(' ')
    .toLowerCase();
  for (const [intent, words] of INTENT_KEYWORDS) {
    if (words.some((w) => hay.includes(w))) return intent;
  }
  return 'wb1-charts';
}

function card(type: GenUiPayload['type'], title: string, data: Record<string, unknown>): GenUiPayload {
  return { type, title, data };
}

interface Tier1Knowledge {
  learn: string;
  plant: string;
  citations: string[];
  cards: GenUiPayload[];
}

function wb2Thermo(): Tier1Knowledge {
  const citation = "[Perry's 9th Ed., Table 2-8 (DIPPR Eq. 101), p. 2-53]";
  return {
    learn: 'Water boils at 100 °C = 373.15 K. DIPPR Eq. 101 (Perry Table 2-8 constants) gives P_vp = 101,325 Pa — the vapor pressure exactly balances 1 atm, the normal boiling point.\n1) Gauge pressure (psig) reads relative to the surrounding atmosphere; absolute (psia) reads from vacuum.\n2) Conversion: psia = psig + 14.696, so 101,325 Pa = 14.70 psia = 0.00 psig at this boiling point.\n3) Never use the Wilson equation for LLE: Wilson local-composition G^E always yields a single liquid phase, so it cannot predict a liquid split — use NRTL or UNIQUAC.',
    plant: 'Check: T = 373.15 K → P_vp(water) = 101,325 Pa = 14.70 psia = 0.00 psig (psia = psig + 14.696).\nMargin: rated design pressure must exceed P_vp at the maximum attainable process temperature.\nLLE: Wilson G^E cannot predict a liquid split — re-run the property package with NRTL/UNIQUAC.',
    citations: [citation],
    cards: [card('equation-proof-card', 'DIPPR Eq. 101 — Vapor-Pressure White-Box Proof', {
      symbolic_latex: 'P_{\\mathrm{vp}} = \\exp(C_1 + C_2/T + C_3 \\ln T + C_4 T^{C_5})',
      substituted_latex: 'T = 373.15\\text{ K (100}^\\circ\\text{C)}',
      result_latex: 'P_{\\mathrm{vp}} = 101{,}325\\text{ Pa} = 14.70\\text{ psia (0.00 psig)}',
      citation,
    })],
  };
}

function wb3Hydraulics(): Tier1Knowledge {
  const citation = "[Perry's 9th Ed., Eqs. 6-37..6-39, p. 6-11]";
  return {
    learn: '1) Perry publishes TWO friction factors: Fanning f_F and Darcy f_D — they differ by exactly 4.\n2) Head loss uses the Darcy factor: h_f = f_D (L/D) v²/(2g). Mixing conventions skews ΔP by 4×.\n3) Cavitation guard: NPSHa must exceed NPSHr with at least 1.0 m margin, or the pump flashes and cavitates.\n4) Valve Cv: convert units first, then size — a wrong Cv floods or starves the control loop.',
    plant: 'Check: f_D = 4·f_F (never mix conventions); h_f = f_D (L/D) v²/(2g) per Eqs. 6-37..6-39.\nMargin: require NPSHa ≥ NPSHr + 1.0 m at max flow and max process temperature.\nVerify valve Cv against the required Cv at the specified % opening before datasheet issue.',
    citations: [citation],
    cards: [
      card('equation-proof-card', 'Darcy vs Fanning — Head-Loss White-Box Proof', {
        symbolic_latex: 'f_D = 4 f_F, \\quad h_f = f_D \\frac{L}{D} \\frac{v^2}{2g}',
        substituted_latex: 'Re = \\frac{\\rho v D}{\\mu} \\Rightarrow \\text{select } f \\text{ from the Moody-style chart}',
        result_latex: 'NPSHa > NPSHr + 1.0\\text{ m} \\;\\Rightarrow\\; \\text{no cavitation}',
        citation,
      }),
      card('hydraulics-summary-card', '3-Case Pump & Valve Summary', {
        cavitation_status: 'SAFE — NPSHa > NPSHr + 1.0 m',
        is_choked: false,
      }),
    ],
  };
}

function wb4Distillation(): Tier1Knowledge {
  const citation = "[Perry's 9th Ed., Sec. 13, p. 13-36 & Fig. 14-32, p. 14-37]";
  return {
    learn: '1) N_min is Fenske at total reflux: the log of the separation ratio divided by the log of α_AB.\n2) R_min comes from Underwood, and it depends on the feed thermal quality q.\n3) q = 1 is saturated liquid, q = 0 is saturated vapor; q bends the q-line on McCabe-Thiele.\n4) Capacity ceiling: Fair’s entrainment flooding correlation (Perry Fig. 14-32) caps vapor velocity.',
    plant: 'Check: bound the design with N_min (Fenske, total reflux) and R_min (Underwood with feed quality q).\nMargin: operate at R ≈ 1.2–1.5 × R_min and keep vapor loading ≤ 80 % of Fair flooding (Fig. 14-32).',
    citations: [citation],
    cards: [card('equation-proof-card', 'Fenske N_min — Minimum-Stages White-Box Proof', {
      symbolic_latex: 'N_{\\min} = \\frac{\\ln[(x_D/(1-x_D))\\cdot((1-x_B)/x_B)]}{\\ln \\alpha_{AB}}',
      substituted_latex: 'q = 1 \\text{ (saturated liquid)} \\;|\\; q = 0 \\text{ (saturated vapor)}',
      result_latex: 'R_{\\text{actual}} \\approx 1.2\\text{–}1.5\\,R_{\\min} \\text{ (Underwood)}',
      citation,
    })],
  };
}

function wb1Charts(): Tier1Knowledge {
  const citation = "[Perry's 9th Ed., Fig. 6-9, p. 6-10]";
  return {
    learn: '1) Perry log-log friction charts: each decade is a fixed power of ten — count grid lines, then interpolate.\n2) Enter with Reynolds number on the x-axis and relative roughness ε/D to pick the curve family.\n3) The classic trap: Perry Fig. 6-9 plots the Fanning factor f_F, while many texts plot the Darcy factor f_D — they differ by 4×.\n4) If your ΔP is off by a factor of 4, you mixed the two conventions somewhere in the chain.',
    plant: 'Check: read f_F from Fig. 6-9 at the correct Re and ε/D (Fanning convention), then f_D = 4·f_F for h_f = f_D (L/D) v²/(2g).\nMargin: a 4× ΔP discrepancy means Fanning/Darcy mixing (f_D = 4·f_F) — re-derive before sign-off.',
    citations: [citation],
    cards: [card('equation-proof-card', 'Fig. 6-9 Chart-Reading White-Box Proof', {
      symbolic_latex: 'f_D = 4 f_F \\;\\text{— Fig. 6-9 plots } f_F',
      substituted_latex: 'Re = \\frac{\\rho v D}{\\mu}, \\quad \\frac{\\varepsilon}{D} \\text{ selects the curve}',
      result_latex: 'h_f = f_D \\frac{L}{D} \\frac{v^2}{2g} \\; (\\text{Darcy, not } f_F)',
      citation,
    })],
  };
}

const KNOWLEDGE: Record<Intent, () => Tier1Knowledge> = {
  'wb2-thermo': wb2Thermo,
  'wb3-hydraulics': wb3Hydraulics,
  'wb4-distillation': wb4Distillation,
  'wb1-charts': wb1Charts,
};

/** Deterministic Tier-1 responder: intent-matched tutoring + exact citations + GenUI cards. */
export function runCopilotResponder(input: unknown, options?: { emitUi?: boolean }): CopilotResponse {
  const parsed = CopilotRequestSchema.parse(input);
  const scenario = parseCopilotScenario(parsed.prompt, {
    activeWorkbench: parsed.activeWorkbench,
    personaMode: parsed.personaMode,
    payload: parsed.payload ?? {},
  });
  const { learn, plant, citations, cards } = KNOWLEDGE[detectIntent(parsed)]();
  const allCitations = [...citations, ...scenario.citations];
  const allCards = [...cards, ...scenario.cards];
  const tail = `Citations: ${allCitations.join(' | ')}`;
  const base = parsed.personaMode === 'learn'
    ? `🎓 Student Intuition:\n${learn}`
    : `🏭 EPC Verification:\n${plant}\nSynced with <current-screen workbench="${parsed.activeWorkbench}" personaMode="${parsed.personaMode}">`;
  const reply = scenario.liveReply ? `${scenario.liveReply}\n\n${base}\n\n${tail}` : `${base}\n\n${tail}`;
  if (options?.emitUi !== false) allCards.forEach((c) => agentNative.ui.output(c));
  return {
    reply,
    model: 'perry-tier1-deterministic',
    tier: 'tier1-deterministic',
    citations: allCitations,
    genUiCards: allCards,
    actionMutations: scenario.mutations,
  };
}

/** Browser helper: Tier-1 first (cards emitted locally), then enrich via POST /api/copilot. */
export async function askPerryCopilot(input: unknown): Promise<CopilotResponse> {
  const tier1 = await runCopilotResponder(input, { emitUi: true });
  if (import.meta.env?.MODE === 'test') return tier1;
  try {
    const res = await fetch('/api/copilot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    if (!res.ok) return tier1;
    const data = (await res.json()) as Partial<CopilotResponse> | null;
    if (!data || typeof data.reply !== 'string' || data.reply.length === 0) return tier1;
    return { ...tier1, ...data } as CopilotResponse;
  } catch {
    return tier1; // Offline plain-Node/tsx: relative fetch throws — deterministic Tier-1 stands.
  }
}

export const askPerryCopilotAction = defineAction({
  name: 'ask_perry_copilot',
  description: 'Deterministic ChE Tutor: Perry 9th Ed. citations, solver guidance, and inline GenUI proof cards.',
  schema: CopilotRequestSchema,
  handler(input) {
    return runCopilotResponder(input);
  },
});
