// Tactile scrubbable number input: pointer-drag scrubbing + keyboard entry + Point-and-Ask chip.
// Locale discipline (R5 OBS-1): native <input type="number"> renders digits in the *browser*
// locale (e.g. "373,15" on a vi browser under the EN UI), which clashed with dot-decimal result
// cards. We now render a locale-controlled text field (app locale via getActiveLocale), accept
// both "." and "," on entry, and keep the explicit spinbutton ARIA role so screen readers and
// role-based locators see the same semantics as before.
import React, { useEffect, useReducer, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { useAgentSelectable } from '../../hooks/use-agent-selectable';
import { FRAMER_BOUNCE_SPRING } from '../../lib/framer-motion-tokens';
import { getActiveLocale, subscribeLocale } from '../../lib/i18n/locale-types';
import { getUiSubcomponentCopy } from '../../lib/i18n/vi-ui-subcomponents';

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

const decimalSeparatorFor = (locale: string): string => (locale === 'vi' ? ',' : '.');
const formatForLocale = (v: number, locale: string): string => String(v).replace('.', decimalSeparatorFor(locale));
const parseLooseDecimal = (raw: string): number | null => {
  const normalized = raw.trim().replace(/,/g, '.');
  if (normalized === '' || normalized === '.' || normalized === '-.') return null;
  if (!/^-?\d*\.?\d*$/.test(normalized)) return null;
  const parsed = parseFloat(normalized);
  return Number.isNaN(parsed) ? null : parsed;
};

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
  const [draft, setDraft] = useState<string | null>(null);
  const [, bumpLocaleTick] = useReducer((c: number) => c + 1, 0);
  useEffect(() => subscribeLocale(() => bumpLocaleTick()), []);
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

  const locale = getActiveLocale();
  const displayValue = draft ?? formatForLocale(value, locale);
  const valuetext = `${formatForLocale(value, locale)} ${unit}`;

  return (
    <motion.div
      className="scrubbable-input"
      data-testid={`scrub-${paramId}`}
      data-agent-select={selectable.selectableProps['data-agent-select']}
      data-agent-selected={selectable.selectableProps['data-agent-selected']}
      transition={FRAMER_BOUNCE_SPRING}
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
          {selectable.isSelected ? getUiSubcomponentCopy().scrubSelected : getUiSubcomponentCopy().scrubAsk}
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
          type="text"
          inputMode="decimal"
          role="spinbutton"
          aria-valuenow={value}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuetext={valuetext}
          value={displayValue}
          onFocus={(e) => setDraft(e.currentTarget.value)}
          onChange={(e) => {
            const raw = e.currentTarget.value;
            setDraft(raw);
            const parsed = parseLooseDecimal(raw);
            if (parsed !== null) onChange(clamp(parsed));
          }}
          onBlur={() => setDraft(null)}
        />
        <span className="scrubbable-unit mono">{unit}</span>
      </div>
    </motion.div>
  );
};
