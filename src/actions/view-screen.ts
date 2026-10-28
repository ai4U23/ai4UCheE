// Bi-directional `<current-screen>` state serializer & viewScreenAction.
import { z } from 'zod';
import { defineAction } from './define-action';

export interface ClientScreenState {
  id?: string;
  activeWorkbench: string;
  personaMode: 'learn' | 'plant';
  themeMode: 'paper' | 'blueprint';
  selectedChips: string[];
  payload: Record<string, unknown>;
  updatedAt?: number;
}

type ScreenListener = (state: ClientScreenState) => void;

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

/** Mutate the shared screen state and notify subscribers. */
export function writeClientAppState(update: Partial<ClientScreenState>): ClientScreenState {
  currentState = {
    ...currentState,
    ...update,
    selectedChips: update.selectedChips ?? currentState.selectedChips,
    payload: update.payload ? { ...currentState.payload, ...update.payload } : currentState.payload,
    updatedAt: Date.now(),
  };
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

function escapeAttr(val: string): string {
  return val.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

/** Format the live UI state as a structured `<current-screen>` XML block for agent prompts. */
export function serializeCurrentScreenTag(state: ClientScreenState = currentState): string {
  const chipsXml = state.selectedChips
    .map((c) => `    <chip id="${escapeAttr(c)}" />`)
    .join('\n');
  const payloadJson = JSON.stringify(state.payload ?? {});
  return [
    `<current-screen workbench="${escapeAttr(state.activeWorkbench)}" personaMode="${escapeAttr(state.personaMode)}" themeMode="${escapeAttr(state.themeMode)}">`,
    '  <selected-chips>',
    chipsXml || '    <!-- none -->',
    '  </selected-chips>',
    `  <payload>${payloadJson}</payload>`,
    '</current-screen>',
  ].join('\n');
}

export const viewScreenAction = defineAction({
  name: 'view-screen',
  description: 'Read or bi-directionally mutate the active workbench, persona, theme, or calculation parameters.',
  schema: z.object({
    activeWorkbench: z.string().optional(),
    personaMode: z.enum(['learn', 'plant']).optional(),
    themeMode: z.enum(['paper', 'blueprint']).optional(),
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
