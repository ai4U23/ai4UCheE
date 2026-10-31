// Compact bilingual Locale Switcher Pill (`EN` / `VI`) for the Top Studio Bar (< 200 LOC).
import React from 'react';
import { motion } from 'motion/react';
import { usePersonaTheme } from '../../context/persona-theme-context';
import { FRAMER_LAYOUT_SPRING } from '../../lib/framer-motion-tokens';
import type { LocaleCode } from '../../lib/i18n/locale-types';

const LOCALE_OPTIONS: ReadonlyArray<{ code: LocaleCode; label: string; title: string }> = [
  { code: 'en', label: 'EN', title: 'Switch interface to English (EN)' },
  { code: 'vi', label: 'VI', title: 'Chuyển giao diện sang Tiếng Việt (VI)' },
];

export const LocaleSwitcherPill: React.FC = () => {
  const { locale, setLocale } = usePersonaTheme();

  return (
    <div
      className="wb-actions-row locale-pill-group"
      role="group"
      aria-label="Language Switcher"
      data-testid="locale-toggle"
    >
      {LOCALE_OPTIONS.map((opt) => {
        const active = locale === opt.code;
        return (
          <button
            key={opt.code}
            type="button"
            aria-pressed={active}
            data-testid={`locale-${opt.code}`}
            className={`persona-btn ${active ? 'active' : ''}`}
            title={opt.title}
            onClick={() => setLocale(opt.code)}
          >
            {active && (
              <motion.span
                layoutId="active-locale-pill"
                className="motion-pill framer-pill-glow"
                transition={FRAMER_LAYOUT_SPRING}
              />
            )}
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
};
