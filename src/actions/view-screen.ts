// Bi-directional `<current-screen>` state serializer, live workbench payload bus & mutation pub/sub.
import { z } from 'zod';
import { defineAction } from './define-action';

/** Long workbench ids — mirrors `persona-theme-context` `WorkbenchId` (structurally identical). */
export type WorkbenchId =
  | 'wb1-visual-verifier'
  | 'wb2-thermo-dippr'
  | 'wb3-hydraulics'
  | 'wb4-distillation'
  | 'wb6-kinetics-reactors'
  | 'wb5-handbook-atlas';

/** One 3-stage white-box derivation (Symbolic → Live Substitution → Evaluated Result). */
export interface WhiteBoxStageEquation {
  id: string;
  title: string;
  citation: string;
  symbolicLatex: string;
  substitutedLatex: string;
  resultLatex: string;
  plainExplanation?: string;
  warningText?: string;
}

/** Live snapshot a workbench publishes into the `<current-screen>` payload bus. */
export interface WorkbenchLivePayload {
  summary?: string;
  inputs?: Record<string, number | string | boolean>;
  metrics?: Record<string, number | string | boolean>;
  equations?: WhiteBoxStageEquation[];
  statusBanner?: string;
  [key: string]: unknown;
}

/** Parameter mutation dispatched by Guided Missions or the Co-Pilot (`actionMutations`). */
export interface WorkbenchMutationCommand {
  targetWorkbench?: WorkbenchId;
  params: Record<string, number | string>;
  reason?: string;
}

export interface ClientScreenState {
  id?: string;
  activeWorkbench: string;
  personaMode: 'learn' | 'plant';
  themeMode: 'paper';
  selectedChips: string[];
  payload: Record<string, unknown>;
  updatedAt?: number;
}

type ScreenListener = (state: ClientScreenState) => void;
type MutationListener = (command: WorkbenchMutationCommand) => void;

let currentState: ClientScreenState = {
  id: 'default-screen',
  activeWorkbench: 'wb1-visual-verifier',
  personaMode: 'plant',
  themeMode: 'paper',
  selectedChips: [],
  payload: {},
  updatedAt: Date.now(),
};

const listeners = new Set<ScreenListener>();
const mutationListeners = new Set<MutationListener>();
const workbenchPayloads = new Map<WorkbenchId, WorkbenchLivePayload>();
const pendingMutations = new Map<WorkbenchId, WorkbenchMutationCommand>();

/** Mutate the shared screen state and notify subscribers. */
export function writeClientAppState(update: Partial<ClientScreenState>): ClientScreenState {
  const switching =
    update.activeWorkbench !== undefined && update.activeWorkbench !== currentState.activeWorkbench;
  currentState = {
    ...currentState,
    ...update,
    selectedChips: update.selectedChips ?? currentState.selectedChips,
    payload: update.payload ? { ...currentState.payload, ...update.payload } : currentState.payload,
    updatedAt: Date.now(),
  };
  if (switching && !update.payload) {
    currentState = {
      ...currentState,
      payload: { ...(workbenchPayloads.get(update.activeWorkbench as WorkbenchId) ?? {}) },
    };
  }
  listeners.forEach((fn) => fn(currentState));
  return currentState;
}

export function getClientAppState(): ClientScreenState {
  return currentState;
}

export function subscribeClientAppState(fn: ScreenListener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** Publish a workbench's live snapshot: always cached; exposed in `payload` when it is active. */
export function syncWorkbenchPayload(workbench: WorkbenchId, payload: WorkbenchLivePayload): void {
  workbenchPayloads.set(workbench, payload);
  if (currentState.activeWorkbench !== workbench) return;
  currentState = { ...currentState, payload: { ...payload }, updatedAt: Date.now() };
  listeners.forEach((fn) => fn(currentState));
}

/** Broadcast a parameter mutation to every subscribed workbench (or queue if target not yet mounted). */
export function dispatchWorkbenchMutation(command: WorkbenchMutationCommand): void {
  if (command.targetWorkbench) {
    pendingMutations.set(command.targetWorkbench, command);
  }
  mutationListeners.forEach((fn) => fn(command));
}

export function consumePendingMutation(workbench: WorkbenchId): WorkbenchMutationCommand | undefined {
  const cmd = pendingMutations.get(workbench);
  if (cmd) pendingMutations.delete(workbench);
  return cmd;
}

export function subscribeWorkbenchMutation(fn: MutationListener): () => void {
  mutationListeners.add(fn);
  return () => mutationListeners.delete(fn);
}

function escapeAttr(val: string): string {
  return val.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

/** Format the live UI state as a structured `<current-screen>` XML block for agent prompts. */
export function serializeCurrentScreenTag(state: ClientScreenState = currentState): string {
  const chipsXml = state.selectedChips
    .map((c) => `    <chip id="${escapeAttr(c)}" />`)
    .join('\n');
  const payload = (state.payload ?? {}) as WorkbenchLivePayload;
  const payloadXml =
    payload.inputs || payload.metrics
      ? [
          '  <payload live="true">',
          `    <summary>${escapeAttr(String(payload.summary ?? ''))}</summary>`,
          `    <inputs>${JSON.stringify(payload.inputs ?? {})}</inputs>`,
          `    <metrics>${JSON.stringify(payload.metrics ?? {})}</metrics>`,
          `    <equations>${JSON.stringify((payload.equations ?? []).map((e) => ({ id: e.id, citation: e.citation })))}</equations>`,
          `    ${`<raw>${JSON.stringify(payload)}</raw>`}`,
          '  </payload>',
        ].join('\n')
      : `  <payload>${JSON.stringify(payload)}</payload>`;
  return [
    `<current-screen workbench="${escapeAttr(state.activeWorkbench)}" personaMode="${escapeAttr(state.personaMode)}" themeMode="${escapeAttr(state.themeMode)}">`,
    '  <selected-chips>',
    chipsXml || '    <!-- none -->',
    '  </selected-chips>',
    payloadXml,
    '</current-screen>',
  ].join('\n');
}

export const viewScreenAction = defineAction({
  name: 'view-screen',
  description: 'Read or bi-directionally mutate the active workbench, persona, theme, or calculation parameters.',
  schema: z.object({
    activeWorkbench: z.string().optional(),
    personaMode: z.enum(['learn', 'plant']).optional(),
    themeMode: z.literal('paper').optional(),
    selectedChips: z.array(z.string()).optional(),
    payload: z.record(z.unknown()).optional(),
  }),
  handler(input) {
    const hasMutation = Object.values(input).some((v) => v !== undefined);
    const next = hasMutation ? writeClientAppState(input) : getClientAppState();
    return {
      state: next,
      xml: serializeCurrentScreenTag(next),
    };
  },
});
