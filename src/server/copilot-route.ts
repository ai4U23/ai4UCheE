// Tier-2 gateway route: POST /api/copilot → gateway.ai4u.now (gemini-4-argon-low, 4.5 s timeout)
// with a guaranteed deterministic Tier-1 fallback (zero-key, Vitest, or upstream error).
import type { Express, Request, Response } from 'express';
import {
  CopilotRequestSchema,
  runCopilotResponder,
  type CopilotRequest,
  type CopilotResponse,
} from '../actions/copilot-responder';

export const GATEWAY_DEFAULT_URL = 'https://gateway.ai4u.now';
export const GATEWAY_DEFAULT_MODEL = 'gemini-4-argon-low';

const baseUrl = (process.env.GATEWAY_URL || GATEWAY_DEFAULT_URL).replace(/\/+$/, '');
const apiKey = process.env.GATEWAY_API_KEY; // # guard:allow-env-credential (server-only)
const model = process.env.GATEWAY_MODEL || GATEWAY_DEFAULT_MODEL;

const SYSTEM_PROMPT =
  "You are ChemEng's Intelligent Workbench Co-Pilot on Chemie.ai4U.now. Enforce psig vs psia (+14.696 psia), " +
  "Fanning f_F vs Darcy f_D = 4*f_F, and cite [Perry's 9th Ed., Eq./Table/Fig., p. S-P]. " +
  'Adapt pedagogy to <student-profile scaffolding="guided|socratic|challenge">: in guided mode give step-by-step ' +
  'derivations; in socratic mode ask a diagnostic question + clue first; in challenge mode pose EPC margin trade-offs. ' +
  'When the user asks to change parameters or fix a hazard, end the reply with one JSON line: ' +
  '{"actionMutations": {"targetWorkbench": "<wb1-visual-verifier|wb2-thermo-dippr|wb3-hydraulics|wb4-distillation|wb6-kinetics-reactors|wb5-handbook-atlas>", "params": {"<stateKey>": <number|string>}}}.';

/** Extract the LLM's trailing {"actionMutations": ...} proposal, if any (defensive parse). */
function extractActionMutations(text: string): Record<string, unknown> | undefined {
  const match = /\{"actionMutations"[\s\S]*\}\s*$/.exec(text);
  if (!match) return undefined;
  try {
    const obj = JSON.parse(match[0]) as { actionMutations?: Record<string, unknown> };
    const m = obj.actionMutations;
    if (m && typeof m === 'object' && m.params && typeof m.params === 'object') return m;
  } catch {
    /* malformed JSON → deterministic Tier-1 mutations stand */
  }
  return undefined;
}

function tier2Eligible(): boolean {
  return Boolean(apiKey) && !(process.env.VITEST && process.env.GATEWAY_LIVE_TEST !== '1');
}

async function postChatCompletion(userContent: string): Promise<string | null> {
  try {
    const res = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      signal: AbortSignal.timeout(4500),
      body: JSON.stringify({
        model,
        temperature: 0.2,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userContent },
        ],
      }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    return data.choices?.[0]?.message?.content ?? null;
  } catch {
    return null; // Timeout / network / parse error → deterministic Tier-1 fallback.
  }
}

export async function callGeminiGateway(
  raw: unknown,
): Promise<CopilotResponse & { ok: true; gatewayUrl: string }> {
  const parsed = CopilotRequestSchema.parse(raw) as CopilotRequest;
  const tier1 = await runCopilotResponder(parsed, { emitUi: false });
  if (tier2Eligible()) {
    const chips = parsed.selectedChips.map((c) => c.label ?? c.chipId).join(', ') || 'none';
    const live = (parsed.payload ?? {}) as { inputs?: unknown; metrics?: unknown; summary?: unknown };
    const userContent = [
      `<current-screen workbench="${parsed.activeWorkbench}" personaMode="${parsed.personaMode}">`,
      tier1.adaptiveMeta?.studentProfileXml ?? '<student-profile scaffolding="guided" />',
      live.summary ? `Live summary: ${String(live.summary)}` : 'Live summary: (payload empty — scrub a control to ground the copilot)',
      `Live inputs: ${JSON.stringify(live.inputs ?? {})}`,
      `Live metrics: ${JSON.stringify(live.metrics ?? {})}`,
      `Selected chips: ${chips}`,
      `Tier-1 deterministic baseline: ${tier1.reply}`,
      `User prompt: ${parsed.prompt}`,
    ].join('\n');
    const llmText = await postChatCompletion(userContent);
    if (llmText) {
      return {
        ok: true,
        reply: llmText,
        model,
        gatewayUrl: baseUrl,
        tier: 'tier2-gemini-4-argon-low',
        citations: tier1.citations,
        genUiCards: tier1.genUiCards,
        actionMutations: (extractActionMutations(llmText) as typeof tier1.actionMutations) ?? tier1.actionMutations,
        adaptiveMeta: tier1.adaptiveMeta,
      };
    }
  }
  return { ok: true, ...tier1, model, gatewayUrl: baseUrl };
}

export function registerCopilotRoute(app: Express): void {
  app.post('/api/copilot', async (req: Request, res: Response): Promise<void> => {
    try {
      res.json(await callGeminiGateway(req.body ?? {}));
    } catch (err) {
      res.status(400).json({ ok: false, error: (err as Error).message });
    }
  });
  app.get('/api/copilot/status', (_req: Request, res: Response): void => {
    res.json({ ok: true, gatewayUrl: baseUrl, model, tier2: tier2Eligible() });
  });
}
