// Tactile scrubbable number input: pointer-drag scrubbing + keyboard entry + Point-and-Ask chip.
import React, { useRef } from 'react';
import { useAgentSelectable } from '../../hooks/use-agent-selectable';

export interface ScrubbableNumberInputProps {
  paramId: string;
  label: string;
  value: number;
  unit: string;
  min?: number;
  max?: number;
  step?: number;
  onChange: (next: number) => void;
}

export const ScrubbableNumberInput: React.FC<ScrubbableNumberInputProps> = ({
  paramId,
  label,
  value,
  unit,
  min,
  max,
  step = 1,
  onChange,
}) => {
  const dragStartRef = useRef<{ x: number; startValue: number } | null>(null);
  const selectable = useAgentSelectable('input', paramId, `${label} (${unit})`, {
    paramId,
    value,
    unit,
  });

  const clamp = (raw: number): number => {
    let v = raw;
    if (min !== undefined && v < min) v = min;
    if (max !== undefined && v > max) v = max;
    return Number(v.toFixed(6));
  };

  const onPointerDown = (e: React.PointerEvent<HTMLSpanElement>) => {
    dragStartRef.current = { x: e.clientX, startValue: value };
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* jsdom has no setPointerCapture */
    }
  };

  const onPointerMove = (e: React.PointerEvent<HTMLSpanElement>) => {
    if (!dragStartRef.current) return;
    const dx = e.clientX - dragStartRef.current.x;
    onChange(clamp(dragStartRef.current.startValue + Math.round(dx / 4) * step));
  };

  const onPointerUp = () => {
    dragStartRef.current = null;
  };

  return (
    <div
      className="scrubbable-input"
      data-testid={`scrub-${paramId}`}
      data-agent-select={selectable.selectableProps['data-agent-select']}
      data-agent-selected={selectable.selectableProps['data-agent-selected']}
    >
      <div className="scrubbable-header">
        <span
          className="scrubbable-handle"
          role="slider"
          aria-label={`Scrub ${label}`}
          aria-valuenow={value}
          aria-valuemin={min}
          aria-valuemax={max}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
        >
          ↔ {label}
        </span>
        <button
          type="button"
          className="scrubbable-chip-btn"
          aria-label={`Inspect ${label}`}
          onClick={selectable.toggleSelect}
        >
          {selectable.isSelected ? '✓ Selected' : '+ Ask'}
        </button>
      </div>
      <div className="scrubbable-row">
        {min !== undefined && max !== undefined && (
          <input
            type="range"
            className="scrubbable-slider"
            aria-label={`Slide ${label}`}
            min={min}
            max={max}
            step={step}
            value={Math.min(Math.max(value, min), max)}
            onChange={(e) => {
              const parsed = parseFloat(e.target.value);
              if (!Number.isNaN(parsed)) onChange(clamp(parsed));
            }}
          />
        )}
        <input
          aria-label={label}
          type="number"
          step={step}
          min={min}
          max={max}
          value={value}
          onChange={(e) => {
            const parsed = parseFloat(e.target.value);
            if (!Number.isNaN(parsed)) onChange(clamp(parsed));
          }}
        />
        <span className="scrubbable-unit mono">{unit}</span>
      </div>
    </div>
  );
};
