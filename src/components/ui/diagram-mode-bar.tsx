// Shared Diagram Mode pill switcher for subject workbenches (WB2, WB3, WB4, WB6).
// Defaults to 'all' so every interactive chart renders on initial mount while letting
// students and engineers filter to a focused diagram group with one click.
import React from 'react';

export interface DiagramModeOption<M extends string = string> {
  id: M;
  label: string;
  testId: string;
}

export interface DiagramModeBarProps<M extends string = string> {
  testId: string;
  activeMode: M;
  options: ReadonlyArray<DiagramModeOption<M>>;
  onSelectMode: (mode: M) => void;
}

export function DiagramModeBar<M extends string = string>({
  testId,
  activeMode,
  options,
  onSelectMode,
}: DiagramModeBarProps<M>): React.ReactElement {
  return (
    <div
      className="wb-panel"
      data-testid={testId}
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.45rem',
        padding: '0.45rem 0.7rem',
        marginBottom: '0.55rem',
      }}
    >
      <span className="mono" style={{ fontSize: '0.78rem', fontWeight: 700 }}>
        🎛️ Diagram Mode:
      </span>
      <div className="wb-actions-row" role="tablist" aria-label="Interactive Diagram Mode">
        {options.map((opt) => {
          const isActive = opt.id === activeMode;
          return (
            <button
              key={opt.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              data-testid={opt.testId}
              onClick={() => onSelectMode(opt.id)}
              style={{
                fontWeight: isActive ? 700 : 500,
                borderColor: isActive ? 'var(--accent-primary)' : undefined,
                background: isActive ? 'rgba(2, 132, 199, 0.14)' : undefined,
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
