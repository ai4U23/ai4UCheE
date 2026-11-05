// LabSessionView: "Buổi thực hành" — the same 24 problems grouped into 6 theory-course sessions
// (decision H=6, plan 261105-1411), soft L1→L4 ordering inside (J), global numbering kept (I).
import React from 'react';
import type { LocaleCode } from '../../context/persona-theme-context';
import { getCurriculumCopy } from '../../lib/i18n/curriculum-copy';
import {
  COURSE_TOPIC_META, COURSE_TOPIC_ORDER, getProblemTaxonomy,
} from '../../lib/problem-taxonomy';
import { ALL_24_REAL_LIFE_PROBLEMS } from '../../lib/problem-library-registry';
import { PROGRESSION_TIER_META, type EngineeringProgressionTier, type ProblemCaseEntry } from '../../lib/problem-library-types';

export interface LabSessionViewProps {
  solvedProblemIds: readonly string[];
  onSelectProblem: (p: ProblemCaseEntry) => void;
  locale: LocaleCode;
}

const TIER_ORDER: Record<EngineeringProgressionTier, number> = { L1: 1, L2: 2, L3: 3, L4: 4 };

export const LabSessionView: React.FC<LabSessionViewProps> = ({ solvedProblemIds, onSelectProblem, locale }) => {
  const ts = getCurriculumCopy(locale);
  return (
    <div data-testid="lab-session-view" style={{ maxHeight: '340px', overflowY: 'auto' }}>
      {COURSE_TOPIC_ORDER.map((topic, idx) => {
        const meta = COURSE_TOPIC_META[topic];
        const problems = ALL_24_REAL_LIFE_PROBLEMS
          .filter((p) => getProblemTaxonomy(p.problemId)?.courseTopic === topic)
          .sort((a, b) => (TIER_ORDER[a.tier] - TIER_ORDER[b.tier]) || (a.number - b.number));
        return (
          <section key={topic} className="wb-panel" data-testid={`session-block-${topic}`} style={{ padding: '0.5rem 0.65rem', marginBottom: '0.5rem' }}>
            <div className="mono" style={{ fontSize: '11px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              <strong>BUỔI {idx + 1} · {meta.yearBadge[locale]} · {meta.label[locale]}</strong>
            </div>
            <div className="mono" style={{ fontSize: '10.5px', opacity: 0.9, margin: '2px 0' }}>
              {ts.sessionPrereqLabel} {meta.prerequisites[locale]} · {ts.sessionOutcomeLabel} {meta.learningOutcome[locale]}
            </div>
            <div className="mono" style={{ fontSize: '10.5px', opacity: 0.85, marginBottom: '0.3rem' }}>
              ▸ {ts.sessionOrderHint}
            </div>
            {problems.map((p) => {
              const solved = solvedProblemIds.includes(p.problemId);
              const star = getProblemTaxonomy(p.problemId)?.caseStudy ? ' ★' : '';
              return (
                <div
                  key={p.problemId} data-testid={`session-problem-${p.problemId}`}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '2px 0', fontSize: '0.76rem' }}
                >
                  <span className="mono" style={{ minWidth: '88px' }}>#{p.number} · {PROGRESSION_TIER_META[p.tier].shortBadge}</span>
                  <span style={{ flex: 1 }}>{solved ? '✓ ' : ''}{p.title}{star}</span>
                  <button type="button" data-testid={`session-launch-${p.problemId}`} onClick={() => onSelectProblem(p)} style={{ fontSize: '0.68rem' }}>
                    ▶
                  </button>
                </div>
              );
            })}
          </section>
        );
      })}
    </div>
  );
};
