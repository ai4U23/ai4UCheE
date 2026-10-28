// BuilderIO/agent-native action registry + inline generative UI emitter.
import type { z } from 'zod';

export interface ActionDefinition<TSchema extends z.ZodTypeAny = z.ZodTypeAny, TResult = unknown> {
  name: string;
  description: string;
  schema: TSchema;
  handler: (input: z.infer<TSchema>) => Promise<TResult> | TResult;
}

export interface GenUiPayload {
  id?: string;
  type: 'equation-proof-card' | 'hydraulics-summary-card' | 'calc-sheet-card';
  title?: string;
  data: Record<string, unknown>;
}

type UiSubscriber = (payload: GenUiPayload) => void;
const uiSubscribers = new Set<UiSubscriber>();
const emittedHistory: GenUiPayload[] = [];

export const ActionRegistry = new Map<string, ActionDefinition>();

/** Register a Zod-validated shared action callable by both UI and agent. */
export function defineAction<TSchema extends z.ZodTypeAny, TResult>(
  def: ActionDefinition<TSchema, TResult>,
): ActionDefinition<TSchema, TResult> & { run: (raw: unknown) => Promise<TResult> } {
  const wrapped = {
    ...def,
    async run(raw: unknown): Promise<TResult> {
      const parsed = def.schema.parse(raw);
      return await def.handler(parsed);
    },
  };
  ActionRegistry.set(def.name, wrapped as ActionDefinition);
  return wrapped;
}

/** agentNative runtime surface — emits inline generative UI cards to the chat drawer. */
export const agentNative = {
  ui: {
    output(payload: GenUiPayload): GenUiPayload {
      const stamped: GenUiPayload = {
        ...payload,
        id: payload.id ?? `genui-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      };
      emittedHistory.push(stamped);
      uiSubscribers.forEach((fn) => fn(stamped));
      return stamped;
    },
    subscribe(fn: UiSubscriber): () => void {
      uiSubscribers.add(fn);
      return () => uiSubscribers.delete(fn);
    },
    getHistory(): GenUiPayload[] {
      return [...emittedHistory];
    },
    clearHistory(): void {
      emittedHistory.length = 0;
    },
  },
};
