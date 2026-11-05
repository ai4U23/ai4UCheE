// TierRubricPanel: explicit 4-level division principle (Lương ask 3a) — surfaces
// PROGRESSION_TIER_META verbatim plus the 4-axis comparison table. Plan 261105-1411 phase 1.
import React, { useState } from 'react';
import { usePersonaTheme, type LocaleCode } from '../../context/persona-theme-context';
import { getCurriculumCopy } from '../../lib/i18n/curriculum-copy';
import { PROGRESSION_TIER_META, type EngineeringProgressionTier } from '../../lib/problem-library-types';

const RUBRIC_AXES: Readonly<Record<EngineeringProgressionTier, readonly string[]>> = {
  L1: ['1 (single equation)', '—', '—', 'convention trap (psig/psia, f_D = 4·f_F)'],
  L2: ['2 (trade-off)', '~1', 'limited', 'single unit'],
  L3: ['2–3 + decoys', '≥ 2', '✔ defining clue', 'whole unit'],
  L4: ['many, coupled', 'many', '✔', 'runaway / CSB / multi-constraint open design'],
};

const TIERS: readonly EngineeringProgressionTier[] = ['L1', 'L2', 'L3', 'L4'];

export const TierRubricPanel: React.FC = () => {
  const { locale } = usePersonaTheme();
  const ts = getCurriculumCopy(locale as LocaleCode);
  const [open, setOpen] = useState<boolean>(false);

  return (
    <div style={{ marginBottom: '0.45rem' }}>
      <button type="button" data-testid="tier-rubric-toggle" onClick={() => setOpen((v) => !v)}>
        {ts.rubricExpandBtn}
      </button>
      {open && (
        <section className="wb-panel" data-testid="tier-rubric-panel" style={{ padding: '0.55rem 0.65rem', marginTop: '0.35rem' }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>{ts.rubricTitle}</div>
          <div className="mono" style={{ fontSize: '0.74rem', opacity: 0.9, marginBottom: '0.4rem' }}>{ts.rubricSubtitle}</div>
          <table className="mono" style={{ width: '100%', fontSize: '11px', marginBottom: '0.45rem' }}>
            <thead>
              <tr>
                <th>{ts.rubricAxisPhenomena}</th><th>{ts.rubricAxisFalsify}</th>
                <th>{ts.rubricAxisDt}</th><th>{ts.rubricAxisConsequence}</th>
              </tr>
            </thead>
            <tbody>
              {TIERS.map((t) => (
                <tr key={t}>
                  <td><strong>{PROGRESSION_TIER_META[t].shortBadge}</strong> {RUBRIC_AXES[t][0]}</td>
                  <td>{RUBRIC_AXES[t][1]}</td>
                  <td>{RUBRIC_AXES[t][2]}</td>
                  <td>{RUBRIC_AXES[t][3]}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {TIERS.map((t) => (
            <div key={t} className="mono" data-testid={`tier-rubric-desc-${t}`} style={{ fontSize: '11px', marginBottom: '2px' }}>
              {PROGRESSION_TIER_META[t].label} — {PROGRESSION_TIER_META[t].description}
            </div>
          ))}
        </section>
      )}
    </div>
  );
};
