// Point-and-Ask hook: attaches `agent-select:<kind>:<id>` chips to the chat composer.
import type React from 'react';
import { usePersonaTheme } from '../context/persona-theme-context';

export interface SelectableResult {
  chipId: string;
  isSelected: boolean;
  toggleSelect: () => void;
  selectableProps: {
    'data-agent-select': string;
    'data-agent-selected': 'true' | 'false';
    onClick?: (e: React.MouseEvent) => void;
    title: string;
  };
}

export function useAgentSelectable(
  kind: string,
  id: string,
  label: string,
  payload?: Record<string, unknown>,
  options: { clickMode?: 'direct' | 'alt' } = {},
): SelectableResult {
  const { selectedChips, toggleChip } = usePersonaTheme();
  const chipId = `agent-select:${kind}:${id}`;
  const isSelected = selectedChips.some((c) => c.chipId === chipId);

  const toggleSelect = () => toggleChip({ kind, id, label, payload });

  const handleClick = (e: React.MouseEvent) => {
    if (options.clickMode === 'alt' && !e.altKey) return;
    e.stopPropagation();
    toggleSelect();
  };

  return {
    chipId,
    isSelected,
    toggleSelect,
    selectableProps: {
      'data-agent-select': `${kind}:${id}`,
      'data-agent-selected': isSelected ? 'true' : 'false',
      onClick: handleClick,
      title: `Point-and-Ask: ${label} (${chipId})`,
    },
  };
}
