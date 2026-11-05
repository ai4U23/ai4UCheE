// PhaseDomainMatrix: fault map (lifecycle phase × cause domain) implementing the F′ spoiler gate
// (plan 261105-1411): cell counts ALWAYS visible; problem chips only for solved problems;
// local teacher-mode toggle reveals all. NOT a persona — plain local state.
import React, { useState } from 'react';
import type { LocaleCode } from '../../context/persona-theme-context';
import { getCurriculumCopy } from '../../lib/i18n/curriculum-copy';
import {
  CAUSE_DOMAIN_META, LIFECYCLE_PHASE_META, getPhaseDomainMatrix, getProblemTaxonomy,
  type CauseDomainId, type LifecyclePhaseId,
} from '../../lib/problem-taxonomy';
import { getProblemById } from '../../lib/problem-library-registry';

const PHASES: readonly LifecyclePhaseId[] = ['design-audit', 'operation'];
const DOMAINS: readonly CauseDomainId[] = ['process-limit', 'equipment', 'operating-conditions', 'catalyst', 'control', 'convention-procedure'];

export interface PhaseDomainMatrixProps {
  solvedProblemIds: readonly string[];
  onLaunchProblem?: (problemId: string) => void;
  locale: LocaleCode;
}

export const PhaseDomainMatrix: React.FC<PhaseDomainMatrixProps> = ({ solvedProblemIds, onLaunchProblem, locale }) => {
  const ts = getCurriculumCopy(locale);
  const [teacherMode, setTeacherMode] = useState<boolean>(false);
  const cells = getPhaseDomainMatrix();
  const cellFor = (phase: LifecyclePhaseId, domain: CauseDomainId) =>
    cells.find((c) => c.phase === phase && c.domain === domain);
  const controlTotal = cells.filter((c) => c.domain === 'control').reduce((n, c) => n + c.problemIds.length, 0);

  return (
    <section className="wb-panel" data-testid="phase-domain-matrix" style={{ padding: '0.55rem 0.65rem', marginTop: '0.5rem' }}>
      <div className="wb-toolbar" style={{ alignItems: 'center', gap: '0.5rem' }}>
        <strong style={{ fontSize: '0.8rem' }}>{ts.matrixTitle}</strong>
        <button
          type="button" data-testid="matrix-teacher-toggle"
          aria-pressed={teacherMode}
          onClick={() => setTeacherMode((v) => !v)}
          style={{ fontSize: '0.7rem' }}
        >
          {teacherMode ? '● ' : ''}{ts.matrixTeacherToggle}
        </button>
      </div>
      {teacherMode && (
        <div className="mono" data-testid="matrix-teacher-warning" style={{ fontSize: '11px', color: 'var(--status-warn)', margin: '0.3rem 0' }}>
          {ts.matrixTeacherWarning}
        </div>
      )}
      {/* R6 DEF-2: 7 fixed columns cram to ~35px below ~700px, spilling chips past
          the .wb-panel overflow-x:hidden clip. Scroll wrapper + 620px floor keeps
          every cell reachable (page-level overflow stays 0). */}
      <div style={{ overflowX: 'auto' }}>
        <table className="mono" style={{ width: '100%', minWidth: '620px', fontSize: '11px', tableLayout: 'fixed', wordBreak: 'break-word' }}>
          <thead>
            <tr>
              <th style={{ width: '16%' }} />
              {DOMAINS.map((d) => <th key={d}>{CAUSE_DOMAIN_META[d].label[locale]}</th>)}
            </tr>
          </thead>
          <tbody>
            {PHASES.map((phase) => (
              <tr key={phase}>
                <th style={{ textAlign: 'left' }}>{LIFECYCLE_PHASE_META[phase].label[locale]}</th>
                {DOMAINS.map((domain) => {
                  const cell = cellFor(phase, domain);
                  const ids = cell?.problemIds ?? [];
                  const visible = ids.filter((id) => teacherMode || solvedProblemIds.includes(id));
                  const lockedCount = ids.length - visible.length;
                  return (
                    <td key={domain} data-testid={`matrix-cell-${phase}-${domain}`} style={{ verticalAlign: 'top', padding: '3px' }}>
                      <span data-testid={`matrix-cell-count-${phase}-${domain}`} style={{ fontWeight: 600 }}>
                        {ids.length === 0 ? '—' : ids.length}
                      </span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px', marginTop: '2px' }}>
                        {visible.map((id) => {
                          const p = getProblemById(id);
                          const star = getProblemTaxonomy(id)?.caseStudy ? ' ★' : '';
                          return (
                            <button
                              key={id} type="button" data-testid={`matrix-chip-${id}`}
                              onClick={() => onLaunchProblem?.(id)}
                              style={{ fontSize: '10px', padding: '0 4px' }}
                              title={p ? `#${p.number} ${p.title}` : id}
                            >
                              #{p?.number ?? '?'}{star}
                            </button>
                          );
                        })}
                        {lockedCount > 0 && (
                          <span data-testid={`matrix-cell-locked-${phase}-${domain}`} style={{ fontSize: '10px', opacity: 0.8, wordBreak: 'break-word' }}>
                            🔒 {ts.matrixLockedChips(lockedCount)}
                          </span>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {controlTotal < 3 && (
        <div className="mono" data-testid="matrix-roadmap-note" style={{ fontSize: '11px', opacity: 0.85, marginTop: '0.35rem' }}>
          🗺️ {ts.matrixRoadmapNote}
        </div>
      )}
    </section>
  );
};
