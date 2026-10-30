// Default inline GenUI card renderer for the AgentChatDrawer stream (JSON payload preview
// with an optional "Open Print-to-PDF Sheet" action for calc-sheet cards).
import React from 'react';
import type { GenUiPayload } from '../../actions/define-action';

export interface GenUiDefaultCardProps {
  payload: GenUiPayload;
  onOpen?: (d: Record<string, unknown>) => void;
}

export function GenUiDefaultCard({ payload, onOpen }: GenUiDefaultCardProps) {
  return (
    <div className="genui-card" data-testid={`genui-${payload.type}`}>
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
