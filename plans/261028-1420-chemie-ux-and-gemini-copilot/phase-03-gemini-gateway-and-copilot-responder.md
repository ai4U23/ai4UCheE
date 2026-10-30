---
title: "Phase 03 — Two-Tier AI Co-Pilot: gateway.ai4u.now (gemini-4-argon-low) + Deterministic Tier-1 ChE Tutor"
description: "Implement the Tier-1 deterministic ChE Tutor & Action Responder (copilot-responder.ts) and the Tier-2 gateway.ai4u.now (gemini-4-argon-low) server route (POST /api/copilot in copilot-route.ts)."
status: completed
priority: P1
effort: 2.5h
branch: main
tags: [gemini-4-argon-low, gateway-ai4u-now, copilot, genui, phase-03]
created: 2026-10-28
---

# Phase 03 — Two-Tier AI Co-Pilot: `gateway.ai4u.now` (`gemini-4-argon-low`) + Deterministic Tier-1 ChE Tutor

- **Parent Plan:** [`plan.md`](./plan.md)
- **Phase Status:** Pending
- **Effort:** 2.5h
- **Depends On:** [`phase-02-student-guided-missions-and-learn-ux.md`](./phase-02-student-guided-missions-and-learn-ux.md)
<!-- Updated: Validation Session 1 - Task 3.2 adds vite.config.ts /api dev proxy step + file row (timeout kept at 4500 ms) -->

## Goal

Replace the echo stub with a real, two-tier AI Co-Pilot architecture that:
1. Provides a deterministic **Tier-1 ChE Tutor & Action Responder** (`src/actions/copilot-responder.ts`) capable of inspecting `<current-screen>`, attached Point-and-Ask chips, and user questions, executing registered deterministic solvers (DIPPR Eq. 101/106, Hydraulics 3-case + NPSHa, Distillation McCabe-Thiele/Flooding, Calc Sheet generator), emitting inline `GenUiPayload` cards (`equation-proof-card`, `hydraulics-summary-card`, `calc-sheet-card`), and returning persona-aware explanations (`🎓 Learn Mode` step-by-step intuition vs `🏭 Plant Mode` concise EPC verification) with exact Perry's 9th Ed. citations.
2. Exposes **`POST /api/copilot`** (`src/server/copilot-route.ts` wired into `src/server/api-server.ts`) that calls **`https://gateway.ai4u.now/v1/chat/completions`** with model **`gemini-4-argon-low`** (`process.env.GATEWAY_MODEL || 'gemini-4-argon-low'`, `process.env.GATEWAY_URL || 'https://gateway.ai4u.now'`, server-only `process.env.GATEWAY_API_KEY`, `AbortSignal.timeout(4500)`), and automatically falls back to Tier-1 `runCopilotResponder` when `GATEWAY_API_KEY` is absent, during offline Vitest runs (`process.env.VITEST && process.env.GATEWAY_LIVE_TEST !== '1'`), or on upstream timeout/error.

## Files to Create or Modify

| File Path | Action | Current LOC | Target LOC | Purpose |
| :--- | :--- | :---: | :---: | :--- |
| `src/actions/copilot-responder.ts` | Create | 0 | ~160 | Tier-1 deterministic ChE Tutor & Action Responder (`runCopilotResponder`, `askPerryCopilot`, `askPerryCopilotAction`) |
| `src/actions/index.ts` | Modify | 9 | ~12 | Re-export `./copilot-responder` so `ask_perry_copilot` is registered in `ActionRegistry` |
| `src/server/copilot-route.ts` | Create | 0 | ~145 | Express `registerCopilotRoute(app)` (`POST /api/copilot` + `GET /api/copilot/status`) calling `gateway.ai4u.now` (`gemini-4-argon-low`) with Tier-1 fallback |
| `src/server/api-server.ts` | Modify | 137 | ~148 | Wire `registerCopilotRoute(app)` before static catch-all |
| `.env.example` | Create | 0 | ~18 | Document `GATEWAY_URL=https://gateway.ai4u.now`, `GATEWAY_API_KEY=` (`# guard:allow-env-credential`), `GATEWAY_MODEL=gemini-4-argon-low`, and `PERRY_SIDECAR_URL=http://127.0.0.1:8001` |
| `vite.config.ts` | Modify | 22 | ~26 | Add `server.proxy['/api'] → http://127.0.0.1:3000` so `npm run dev` reaches the Express host and Tier-2 works locally (Validation Session 1) |

---

## Tasks & Steps (`--advice` Handover Contract)

### Task 3.1 — Create Tier-1 Deterministic ChE Tutor & Action Responder (`src/actions/copilot-responder.ts`)
- **Goal:** Build a Zod-validated action `askPerryCopilotAction` (`runCopilotResponder` + client helper `askPerryCopilot`) that answers student and plant-engineer questions deterministically, executes ChE calculations, and emits inline `GenUiPayload` cards.
- **Target files and symbols:**
  - `src/actions/copilot-responder.ts` (`CopilotRequestSchema`, `CopilotResponse`, `runCopilotResponder`, `askPerryCopilot`, `askPerryCopilotAction`)
  - `src/actions/index.ts` (re-export `./copilot-responder`)
- **Steps:**
  1. Create `src/actions/copilot-responder.ts` with `CopilotRequestSchema`:
     ```ts
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
     });
     ```
  2. Implement `runCopilotResponder(input, options?: { emitUi?: boolean })` returning `{ reply: string; model: string; tier: 'tier1-deterministic' | 'tier2-gemini-4-argon-low'; citations: string[]; genUiCards: GenUiPayload[] }`:
     - Detect intent from `prompt`, `selectedChips`, and `activeWorkbench`:
       - **WB2 / DIPPR / Vapor Pressure / Carlson / psig vs psia:** Compute water/fluid boiling & vapor pressure, explain gauge (`psig`) vs absolute (`psia = psig + 14.696`), explain why `Wilson` fails for LLE, and build an `equation-proof-card` (`symbolic_latex: "P_{\\mathrm{vp}} = \\exp(C_1 + C_2/T + C_3 \\ln T + C_4 T^{C_5})"`, `substituted_latex: "T = 373.15\\text{ K (100}^\\circ\\text{C)}"`, `result_latex: "P_{\\mathrm{vp}} = 101{,}325\\text{ Pa} = 14.70\\text{ psia (0.00 psig)}"`, `citation: "[Perry's 9th Ed., Table 2-8 (DIPPR Eq. 101), p. 2-53]"`).
       - **WB3 / Hydraulics / Cavitation / NPSHa / Valve Cv:** Explain Darcy `f_D = 4·f_F` and pump cavitation (`NPSHa > NPSHr + 1.0 m`), and build an `equation-proof-card` (`symbolic_latex: "f_D = 4 f_F, \\quad h_f = f_D \\frac{L}{D} \\frac{v^2}{2g}"`, `citation: "[Perry's 9th Ed., Eqs. 6-37..6-39, p. 6-11]"`) or `hydraulics-summary-card`.
       - **WB4 / Distillation / McCabe-Thiele / Flooding:** Explain `R_min`, `N_min`, feed thermal quality `q`, and Fair's entrainment flooding (`Fig. 14-32`), and build an `equation-proof-card` (`symbolic_latex: "N_{\\min} = \\frac{\\ln[(x_D/(1-x_D))\\cdot((1-x_B)/x_B)]}{\\ln \\alpha_{AB}}"`, `citation: "[Perry's 9th Ed., Sec. 13, p. 13-36 & Fig. 14-32, p. 14-37]"`).
       - **WB1 / Fanning vs Darcy / Chart Reading (default):** Explain how to read Perry log-log charts and the `4×` Fanning vs. Darcy trap on Fig. 6-9 (`[Perry's 9th Ed., Fig. 6-9, p. 6-10]`), and build an `equation-proof-card`.
     - Tailor tone to `personaMode`: when `learn`, prepend `"🎓 Student Intuition:"` with step-by-step plain English; when `plant`, prepend `"🏭 EPC Verification:"` with operating margins, and include `Synced with <current-screen workbench="${activeWorkbench}" personaMode="${personaMode}">` at the end of `reply`.
     - When `options?.emitUi !== false`, emit each card in `genUiCards` via `agentNative.ui.output(card)`.
  3. Implement `askPerryCopilot(input)` for browser callers: first compute `tier1 = await runCopilotResponder(input, { emitUi: true })`; if not running inside `import.meta.env?.MODE === 'test'`, attempt `fetch('/api/copilot', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input) })` and return the server's enriched response when `res.ok`, falling back to `tier1` if offline.
  4. Register `askPerryCopilotAction = defineAction({ name: 'ask_perry_copilot', ... })` and export it from `src/actions/index.ts`. Keep `src/actions/copilot-responder.ts` `< 175` LOC.
- **Success criteria:** `askPerryCopilotAction.run({ prompt: 'Explain DIPPR 101 boiling', activeWorkbench: 'wb2-thermo-dippr', personaMode: 'learn' })` returns a non-empty `reply` citing Perry and emits at least 1 `GenUiPayload` card.
- **Verify:** `npx tsx -e "import { askPerryCopilotAction } from './src/actions/copilot-responder'; askPerryCopilotAction.run({ prompt: 'Explain DIPPR 101 boiling', activeWorkbench: 'wb2-thermo-dippr', personaMode: 'learn' }).then(r => { if (!r.reply.includes('Perry') || r.genUiCards.length === 0) process.exit(1); console.log('TIER1_OK'); });"` exits 0 and prints `TIER1_OK`.

### Task 3.2 — Create `src/server/copilot-route.ts` (`POST /api/copilot` with `gateway.ai4u.now` `gemini-4-argon-low`)
- **Goal:** Implement the server-side `POST /api/copilot` endpoint that routes prompts to `https://gateway.ai4u.now/v1/chat/completions` using model `gemini-4-argon-low` and falls back cleanly to `runCopilotResponder`.
- **Target files and symbols:**
  - `src/server/copilot-route.ts` (`GATEWAY_DEFAULT_URL`, `GATEWAY_DEFAULT_MODEL`, `callGeminiGateway`, `registerCopilotRoute`)
  - `src/server/api-server.ts` (`createApiServer`)
  - `.env.example`
- **Steps:**
  1. Create `src/server/copilot-route.ts` (keep `< 155` LOC):
     - Define constants:
       ```ts
       export const GATEWAY_DEFAULT_URL = 'https://gateway.ai4u.now';
       export const GATEWAY_DEFAULT_MODEL = 'gemini-4-argon-low';
       ```
     - Read environment variables server-side:
       ```ts
       const baseUrl = (process.env.GATEWAY_URL || GATEWAY_DEFAULT_URL).replace(/\/+$/, '');
       const apiKey = process.env.GATEWAY_API_KEY; // # guard:allow-env-credential
       const model = process.env.GATEWAY_MODEL || GATEWAY_DEFAULT_MODEL;
       ```
     - Always run `const tier1 = await runCopilotResponder(parsed, { emitUi: false });` first so deterministic `genUiCards` and baseline citations are guaranteed.
     - If `apiKey` is present and `!(process.env.VITEST && process.env.GATEWAY_LIVE_TEST !== '1')`, send `POST ${baseUrl}/v1/chat/completions` with headers `{ 'Content-Type': 'application/json', Authorization: \`Bearer \${apiKey}\` }`, `signal: AbortSignal.timeout(4500)`, and body:
       ```json
       {
         "model": "gemini-4-argon-low",
         "temperature": 0.2,
         "messages": [
           {
             "role": "system",
             "content": "You are Perry's Intelligent Workbench Co-Pilot on Chemie.ai4U.now. Enforce psig vs psia (+14.696 psia), Fanning f_F vs Darcy f_D = 4*f_F, and cite [Perry's 9th Ed., Eq./Table/Fig., p. S-P]. In learn mode, explain in clear student-friendly steps; in plant mode, give concise EPC engineering checks."
           },
           {
             "role": "user",
             "content": "<current-screen> + chips + tier1 deterministic context + user prompt"
           }
         ]
       }
       ```
     - If the gateway responds 200 with `choices[0].message.content`, return `{ ok: true, reply: llmText, model, gatewayUrl: baseUrl, tier: 'tier2-gemini-4-argon-low', citations: tier1.citations, genUiCards: tier1.genUiCards }`.
     - Otherwise (no key, test mode, or gateway error/timeout), return `{ ok: true, ...tier1, model, gatewayUrl: baseUrl }`.
  2. Wire `registerCopilotRoute(app);` in `src/server/api-server.ts` right after `/api/actions/:actionName`.
  3. Create `.env.example` documenting `GATEWAY_URL=https://gateway.ai4u.now`, `GATEWAY_API_KEY= # guard:allow-env-credential`, `GATEWAY_MODEL=gemini-4-argon-low`, and `PERRY_SIDECAR_URL=http://127.0.0.1:8001` with zero real secrets.
  4. **Dev proxy (Validation Session 1):** in `vite.config.ts`, extend the existing `server` block to `server: { port: 5173, strictPort: false, proxy: { '/api': 'http://127.0.0.1:3000' } }` so `npm run dev` browser calls to `/api/copilot` reach the Express host (`npm run server`, default `PORT=3000`) instead of 404-ing back to Tier-1. Production (Express serves `dist/`) is unaffected.
- **Success criteria:** `POST /api/copilot` is registered on `createApiServer`, defaults to `https://gateway.ai4u.now` and `gemini-4-argon-low`, and returns deterministic replies + `genUiCards` in zero-key/Vitest environments while keeping `copilot-route.ts` and `api-server.ts` `< 160` LOC. `vite.config.ts` proxies `/api` to `http://127.0.0.1:3000`.
- **Verify:** `npx tsx -e "import { GATEWAY_DEFAULT_URL, GATEWAY_DEFAULT_MODEL, callGeminiGateway } from './src/server/copilot-route'; if (GATEWAY_DEFAULT_URL !== 'https://gateway.ai4u.now' || GATEWAY_DEFAULT_MODEL !== 'gemini-4-argon-low') process.exit(1); callGeminiGateway({ prompt: 'Why never use Wilson for LLE?', activeWorkbench: 'wb2-thermo-dippr', personaMode: 'learn', selectedChips: [] }).then(r => { if (!r.reply.includes('Wilson')) process.exit(1); console.log('GATEWAY_CONFIG_OK'); });"` exits 0 and prints `GATEWAY_CONFIG_OK`, and `grep -q "'/api': 'http://127.0.0.1:3000'" vite.config.ts`.

---

## Failure Protocol
If any Verify step does not meet its stated pass condition, STOP this phase.
Do not improvise a fix, retry blindly, or reason around the failure.
Spawn the `kongming` subagent for next-step counsel and pass:
- the phase and task id,
- what you attempted (the steps you ran),
- the exact command and its full output,
- the pass condition it failed to meet.
Apply kongming's guidance, then re-run the Verify step.
If `kongming` cannot be spawned in this environment, STOP and report the same
failure evidence to the user. Never continue by self-reasoning.
