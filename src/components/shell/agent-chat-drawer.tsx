// AgentChatDrawer: Point-and-Ask chip tray, live `<current-screen>` badge, and inline GenUI stream.
import React, { useEffect, useState } from 'react';
import { agentNative, type GenUiPayload } from '../../actions/define-action';
import { serializeCurrentScreenTag } from '../../actions/view-screen';
import { usePersonaTheme } from '../../context/persona-theme-context';

export interface AgentChatDrawerProps {
  renderInlineExtension?: (payload: GenUiPayload) => React.ReactNode;
  onOpenCalcSheet?: (data: Record<string, unknown>) => void;
}

function defaultInlineCard(payload: GenUiPayload, onOpen?: (d: Record<string, unknown>) => void) {
  return (
    <div key={payload.id} className="genui-card" data-testid={`genui-${payload.type}`}>
      <strong>{payload.title ?? payload.type}</strong>
      <pre className="mono">{JSON.stringify(payload.data, null, 2)}</pre>
      {payload.type === 'calc-sheet-card' && onOpen && (
        <button type="button" onClick={() => onOpen(payload.data)}>
          Open Print-to-PDF Sheet
        </button>
      )}
    </div>
  );
}

export const AgentChatDrawer: React.FC<AgentChatDrawerProps> = ({
  renderInlineExtension,
  onOpenCalcSheet,
}) => {
  const { activeWorkbench, personaMode, themeMode, selectedChips, removeChip, clearChips } =
    usePersonaTheme();
  const [prompt, setPrompt] = useState<string>('');
  const [messages, setMessages] = useState<Array<{ id: string; role: 'user' | 'agent'; text: string }>>([]);
  const [genUiCards, setGenUiCards] = useState<GenUiPayload[]>(() => agentNative.ui.getHistory());

  useEffect(() => {
    setGenUiCards(agentNative.ui.getHistory());
    return agentNative.ui.subscribe((card) => {
      setGenUiCards((prev) => [...prev, card]);
    });
  }, []);

  const currentScreenXml = serializeCurrentScreenTag({
    activeWorkbench,
    personaMode,
    themeMode,
    selectedChips: selectedChips.map((c) => c.chipId),
    payload: {},
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() && selectedChips.length === 0) return;
    const chipList = selectedChips.map((c) => c.chipId).join(', ');
    const text = chipList ? `[${chipList}] ${prompt}` : prompt;
    setMessages((prev) => [
      ...prev,
      { id: `u-${Date.now()}`, role: 'user', text },
      {
        id: `a-${Date.now()}`,
        role: 'agent',
        text: `Synced with <current-screen workbench="${activeWorkbench}" personaMode="${personaMode}"> (${selectedChips.length} chip(s)).`,
      },
    ]);
    setPrompt('');
  };

  return (
    <aside className="chat-drawer" aria-label="Agent Co-Pilot Drawer" data-testid="agent-chat-drawer">
      <header className="wb-toolbar">
        <strong>🤖 Perry&apos;s Agent Co-Pilot</strong>
        <span className="mono" data-testid="current-screen-badge" title={currentScreenXml}>
          &lt;current-screen workbench=&quot;{activeWorkbench}&quot; mode=&quot;{personaMode}&quot;&gt;
        </span>
      </header>

      <div className="chip-tray" data-testid="composer-chip-tray">
        {selectedChips.length === 0 ? (
          <span className="wb-subtitle">Click any equation, chart, pipe, or stage to attach a Point-and-Ask chip.</span>
        ) : (
          <>
            {selectedChips.map((chip) => (
              <span key={chip.chipId} className="composer-chip" data-testid={`chip-${chip.chipId}`}>
                <code>{chip.chipId}</code>
                <button
                  type="button"
                  aria-label={`Remove ${chip.chipId}`}
                  onClick={() => removeChip(chip.chipId)}
                >
                  ×
                </button>
              </span>
            ))}
            <button type="button" onClick={clearChips}>
              Clear all
            </button>
          </>
        )}
      </div>

      <div className="genui-stream" data-testid="genui-stream">
        {genUiCards.map((card) =>
          renderInlineExtension
            ? renderInlineExtension(card)
            : defaultInlineCard(card, onOpenCalcSheet),
        )}
      </div>

      <div className="chat-messages">
        {messages.map((m) => (
          <div key={m.id} className={`chat-msg chat-${m.role}`}>
            <strong>{m.role === 'user' ? 'You' : 'PerryAgent'}:</strong> {m.text}
          </div>
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
