// AgentChatDrawer: Point-and-Ask chip tray, live `<current-screen>` badge, starter prompts,
// What-If quick actions, inline GenUI stream, and copilot `actionMutations` → slider scrubbing.
import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { agentNative, type GenUiPayload } from '../../actions/define-action';
import { askPerryCopilot } from '../../actions/copilot-responder';
import {
  dispatchWorkbenchMutation,
  getClientAppState,
  serializeCurrentScreenTag,
  subscribeClientAppState,
} from '../../actions/view-screen';
import { usePersonaTheme } from '../../context/persona-theme-context';
import { FRAMER_BOUNCE_SPRING } from '../../lib/framer-motion-tokens';
import { getStudentProfile, subscribeStudentProfile, type StudentProfileState } from '../../lib/student-adaptive-model';
import { SwarmPulseDot } from '../ui/framer-motion-primitives';
import { getQuickActionsForWorkbench, getStarterPromptsForWorkbench } from './copilot-prompts';
import { GenUiDefaultCard } from './genui-default-card';

export interface AgentChatDrawerProps {
  renderInlineExtension?: (payload: GenUiPayload) => React.ReactNode;
  onOpenCalcSheet?: (data: Record<string, unknown>) => void;
}

export const AgentChatDrawer: React.FC<AgentChatDrawerProps> = ({ renderInlineExtension, onOpenCalcSheet }) => {
  const { activeWorkbench, setActiveWorkbench, personaMode, themeMode, selectedChips, removeChip, clearChips } = usePersonaTheme();
  const [prompt, setPrompt] = useState<string>('');
  const [messages, setMessages] = useState<
    Array<{ id: string; role: 'user' | 'agent'; text: string; appliedMutations?: Record<string, number | string> }>
  >([]);
  const [genUiCards, setGenUiCards] = useState<GenUiPayload[]>(() => agentNative.ui.getHistory());
  const [livePayload, setLivePayload] = useState<Record<string, unknown>>(() => getClientAppState().payload);
  const [studentProfile, setStudentProfile] = useState<StudentProfileState>(() => getStudentProfile());

  useEffect(() => {
    setGenUiCards(agentNative.ui.getHistory());
    return agentNative.ui.subscribe((card) => setGenUiCards((prev) => [...prev, card]));
  }, []);

  useEffect(() => subscribeClientAppState((s) => setLivePayload(s.payload)), []);
  useEffect(() => subscribeStudentProfile((p) => setStudentProfile({ ...p })), []);

  const currentScreenXml = serializeCurrentScreenTag({
    activeWorkbench,
    personaMode,
    themeMode,
    selectedChips: selectedChips.map((c) => c.chipId),
    payload: livePayload,
  });

  const submitQuestion = async (rawPrompt: string) => {
    const chipList = selectedChips.map((c) => c.label || c.chipId).join(', ');
    const text = chipList ? `[${chipList}] ${rawPrompt}` : rawPrompt;
    setPrompt('');
    setMessages((prev) => [...prev, { id: `u-${Date.now()}`, role: 'user', text }]);
    const response = await askPerryCopilot({
      prompt: rawPrompt,
      activeWorkbench,
      personaMode,
      selectedChips,
      payload: getClientAppState().payload,
    });
    const appliedMutations = response.actionMutations?.params;
    if (response.actionMutations) {
      const cmd = response.actionMutations;
      dispatchWorkbenchMutation(cmd);
      if (cmd.targetWorkbench && cmd.targetWorkbench !== activeWorkbench) {
        setActiveWorkbench(cmd.targetWorkbench);
      }
    }
    setMessages((prev) => [...prev, { id: `a-${Date.now()}`, role: 'agent', text: response.reply, appliedMutations }]);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() && selectedChips.length === 0) return;
    void submitQuestion(prompt);
  };

  return (
    <aside className="chat-drawer" aria-label="Agent Co-Pilot Drawer" data-testid="agent-chat-drawer">
      <header className="wb-toolbar">
        <strong>🤖 Perry&apos;s Agent Co-Pilot</strong>
        <span className="dof-badge" data-testid="copilot-model-badge">
          <SwarmPulseDot tone="gold" />⚡ gemini-4-argon-low · gateway.ai4u.now
        </span>
        <span className="mono screen-sync-pill" data-testid="current-screen-badge" title={currentScreenXml}>
          <SwarmPulseDot tone="emerald" />Live Sync: {activeWorkbench.toUpperCase()} ({personaMode.toUpperCase()})
        </span>
      </header>

      <div className="chip-tray" data-testid="composer-chip-tray">
        {selectedChips.length === 0 ? (
          <span className="wb-subtitle">Click any equation, chart, pipe, or stage to attach a Point-and-Ask chip.</span>
        ) : (
          <>
            {selectedChips.map((chip) => (
              <motion.span
                key={chip.chipId}
                className="composer-chip"
                data-testid={`chip-${chip.chipId}`}
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={FRAMER_BOUNCE_SPRING}
              >
                <strong className="composer-chip-label" title={chip.chipId}>{chip.label || chip.chipId}</strong>
                <button type="button" aria-label={`Remove ${chip.chipId}`} onClick={() => removeChip(chip.chipId)}>×</button>
              </motion.span>
            ))}
            <button type="button" onClick={clearChips}>Clear all</button>
          </>
        )}
      </div>

      <div className="genui-stream" data-testid="genui-stream">
        {genUiCards.slice(-2).map((card) =>
          renderInlineExtension ? renderInlineExtension(card) : <GenUiDefaultCard key={card.id} payload={card} onOpen={onOpenCalcSheet} />,
        )}
      </div>

      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="chat-msg chat-agent">
            <strong>PerryAgent:</strong> Ready to coach <strong>{activeWorkbench.toUpperCase()}</strong> in{' '}
            <strong>{personaMode === 'learn' ? '🎓 Learn Mode' : '🏭 Plant Mode'}</strong>. Click a starter question
            below or any equation/equipment on the left to inspect its step-by-step Perry derivation.
          </div>
        )}
        {messages.map((m) => (
          <motion.div
            key={m.id}
            className={`chat-msg chat-${m.role}`}
            data-testid={m.role === 'agent' ? 'copilot-agent-message' : undefined}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={FRAMER_BOUNCE_SPRING}
          >
            <strong>{m.role === 'user' ? 'You' : 'PerryAgent'}:</strong> {m.text}
            {m.appliedMutations && (
              <span className="copilot-mutation-pill" data-testid="copilot-mutation-pill">
                ⚡ Applied to Workbench: {Object.entries(m.appliedMutations).map(([k, v]) => `${k}=${v}`).join(', ')}
              </span>
            )}
          </motion.div>
        ))}
      </div>

      <div className="starter-prompts" data-testid="copilot-quick-actions">
        {getQuickActionsForWorkbench(activeWorkbench).map((action, idx) => (
          <button key={action} type="button" data-testid={`copilot-quick-action-${idx}`} onClick={() => void submitQuestion(action)}>
            {action}
          </button>
        ))}
      </div>

      <div className="starter-prompts" data-testid="copilot-starter-prompts">
        {getStarterPromptsForWorkbench(activeWorkbench, studentProfile, livePayload).map((starter, idx) => (
          <button key={starter} type="button" data-testid={`starter-prompt-${idx}`} onClick={() => void submitQuestion(starter)}>
            {starter}
          </button>
        ))}
      </div>

      <form onSubmit={handleSend} className="wb-actions-row">
        <input
          aria-label="Ask Perry's Agent"
          placeholder="Ask about this equation, chart, or operating case..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <button type="submit">Send</button>
      </form>
    </aside>
  );
};
