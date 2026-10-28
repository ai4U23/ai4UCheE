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
  "You are Perry's Intelligent Workbench Co-Pilot on Chemie.ai4U.now. Enforce psig vs psia (+14.696 psia), " +
  "Fanning f_F vs Darcy f_D = 4*f_F, and cite [Perry's 9th Ed., Eq./Table/Fig., p. S-P]. " +
  'In learn mode, explain in clear student-friendly steps; in plant mode, give concise EPC engineering checks.';

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
    const userContent = [
      `<current-screen workbench="${parsed.activeWorkbench}" personaMode="${parsed.personaMode}">`,
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
