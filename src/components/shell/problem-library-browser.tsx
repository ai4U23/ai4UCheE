// ProblemLibraryBrowser: Filterable 24-Problem Multi-Book Real-Life Plant Problem Hub.
// Primary filter bar uses Engineering Progression Tiers (🌱 L1 · 🔧 L2 · 🕵️ L3 · 🚨 L4),
// plus secondary filters for Equipment Tag, Symptom Archetype, Subject Workbench, and search.
import React, { useState } from 'react';
import type { WorkbenchId } from '../../actions/view-screen';
import { getActiveLocale } from '../../lib/i18n/locale-types';
import { CURRICULUM_PROGRESSION_MAP } from '../../lib/curriculum-progression-map';
import { TRUST_BOUNDARY_COPY } from '../../lib/trust-boundary-copy';
import { VI_PROBLEMS_AND_FOGLER_MAP } from '../../lib/i18n/vi-problems-and-fogler-phrases';
import { getTroubleshootingCopy } from '../../lib/i18n/vi-troubleshooting-copy';
import { ALL_24_REAL_LIFE_PROBLEMS, filterProblemLibrary } from '../../lib/problem-library-registry';
import {
  EQUIPMENT_CATEGORY_META, SYMPTOM_CATEGORY_META,
  type EngineeringProgressionTier, type EquipmentCategoryId, type ProblemCaseEntry, type SymptomCategoryId,
} from '../../lib/problem-library-types';
import { MotionPillButton } from '../ui/framer-motion-primitives';

export interface ProblemLibraryBrowserProps {
  activeProblemId?: string;
  solvedProblemIds: readonly string[];
  onSelectProblem: (problem: ProblemCaseEntry) => void;
  onClose?: () => void;
}

const TIERS: readonly EngineeringProgressionTier[] = ['L1', 'L2', 'L3', 'L4'];

export const ProblemLibraryBrowser: React.FC<ProblemLibraryBrowserProps> = ({
  activeProblemId,
  solvedProblemIds,
  onSelectProblem,
  onClose,
}) => {
  const [tierFilter, setTierFilter] = useState<EngineeringProgressionTier | 'all'>('all');
  const [equipFilter, setEquipFilter] = useState<EquipmentCategoryId | 'all'>('all');
  const [symptomFilter, setSymptomFilter] = useState<SymptomCategoryId | 'all'>('all');
  const [wbFilter, setWbFilter] = useState<WorkbenchId | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const ts = getTroubleshootingCopy();
  const isVi = getActiveLocale() === 'vi';
  const tr = (s: string) => (isVi ? (VI_PROBLEMS_AND_FOGLER_MAP[s] ?? s) : s);

  const filtered = filterProblemLibrary({
    tier: tierFilter, equipment: equipFilter, symptom: symptomFilter, workbench: wbFilter, searchQuery,
  });
  const tierCount = (t: EngineeringProgressionTier) => ALL_24_REAL_LIFE_PROBLEMS.filter((p) => p.tier === t).length;

  return (
    <section
      className="wb-panel"
      data-testid="problem-library-browser"
      aria-label="24 Real-Life Plant Problem Library across 7 Reference Books"
      style={{ margin: '0.45rem 1rem', padding: '0.75rem 0.95rem' }}
    >
      <div className="wb-toolbar" style={{ marginBottom: '0.5rem' }}>
        <div>
          <strong>{ts.libHeader}</strong>
          <div className="wb-subtitle">{ts.libSubtitle}</div>
          <div className="mono" style={{ fontSize: '11px', opacity: 0.85 }} data-testid="corpus-provenance-notice">
            {TRUST_BOUNDARY_COPY[isVi ? 'vi' : 'en'].corpusProvenanceNotice}
          </div>
        </div>
        {onClose && (
          <button type="button" data-testid="close-problem-library-btn" onClick={onClose}>{ts.libCloseBtn}</button>
        )}
      </div>

      {/* Primary Filter Bar: Engineering Progression Difficulty Tiers (L1..L4) */}
      <div className="wb-actions-row" data-testid="problem-tier-filter-bar" style={{ flexWrap: 'wrap', marginBottom: '0.45rem' }}>
        <MotionPillButton layoutId="prob-tier-pill" isActive={tierFilter === 'all'} testId="filter-tier-all" onClick={() => setTierFilter('all')}>
          {ts.libAllTiers(ALL_24_REAL_LIFE_PROBLEMS.length)}
        </MotionPillButton>
        {TIERS.map((t) => (
          <MotionPillButton key={t} layoutId="prob-tier-pill" isActive={tierFilter === t} testId={`filter-tier-${t}`} onClick={() => setTierFilter(t)}>
            {ts.libTierLabel(t)} ({tierCount(t)})
          </MotionPillButton>
        ))}
      </div>

      {/* Secondary Facets: Equipment, Symptom, Subject Workbench, & Search */}
      <div className="wb-actions-row" style={{ flexWrap: 'wrap', marginBottom: '0.55rem', fontSize: '0.76rem' }}>
        <label className="mono">
          {ts.libEquipLabel}
          <select aria-label="Filter by Equipment Category" data-testid="filter-equipment-select" value={equipFilter} onChange={(e) => setEquipFilter(e.target.value as EquipmentCategoryId | 'all')}>
            <option value="all">{ts.libAllEquipOpt}</option>
            {(Object.keys(EQUIPMENT_CATEGORY_META) as EquipmentCategoryId[]).map((k) => (
              <option key={k} value={k}>{ts.libEquipOpt(k)}</option>
            ))}
          </select>
        </label>

        <label className="mono">
          {ts.libSymptomLabel}
          <select aria-label="Filter by Symptom Archetype" data-testid="filter-symptom-select" value={symptomFilter} onChange={(e) => setSymptomFilter(e.target.value as SymptomCategoryId | 'all')}>
            <option value="all">{ts.libAllSymptomOpt}</option>
            {(Object.keys(SYMPTOM_CATEGORY_META) as SymptomCategoryId[]).map((k) => (
              <option key={k} value={k}>{ts.libSymptomOpt(k)}</option>
            ))}
          </select>
        </label>

        <label className="mono">
          {ts.libSubjectLabel}
          <select aria-label="Filter by Subject Workbench" data-testid="filter-subject-select" value={wbFilter} onChange={(e) => setWbFilter(e.target.value as WorkbenchId | 'all')}>
            <option value="all">{ts.libAllSubjectsOpt}</option>
            <option value="wb2-thermo-dippr">{tr('Subject 1 · Thermodynamics (WB2)')}</option>
            <option value="wb3-hydraulics">{tr('Subject 2 · Fluid & Transport (WB3)')}</option>
            <option value="wb4-distillation">{tr('Subject 3 · Separations (WB4)')}</option>
            <option value="wb6-kinetics-reactors">{tr('Subject 4 · Kinetics & Reactors (WB6)')}</option>
            <option value="wb5-handbook-atlas">{tr('Subject 5 · 25-Sec Atlas & Safety (WB5)')}</option>
            <option value="wb1-visual-verifier">{tr('Charts & Nomograph Verifier (WB1)')}</option>
          </select>
        </label>

        <input
          type="search" aria-label="Search 24 real-life problems" data-testid="problem-library-search-input"
          placeholder={ts.libSearchPlaceholder} value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ padding: '0.22rem 0.5rem', fontSize: '0.76rem', minWidth: '185px' }}
        />

        <span className="mono" data-testid="problem-library-count-badge">
          {ts.libCountBadge(filtered.length, ALL_24_REAL_LIFE_PROBLEMS.length)}
        </span>
      </div>

      {/* Problem Cards Grid */}
      <div
        data-testid="problem-library-grid"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '0.55rem', maxHeight: '340px', overflowY: 'auto' }}
      >
        {filtered.map((p) => {
          const isSolved = solvedProblemIds.includes(p.problemId);
          const isSelected = activeProblemId === p.problemId;
          return (
            <div
              key={p.problemId} data-testid={`problem-card-${p.problemId}`} className="wb-panel"
              style={{ padding: '0.55rem 0.65rem', border: isSelected ? '2px solid var(--accent-primary)' : undefined }}
            >
              <div className="mono" style={{ fontSize: '12px', display: 'flex', justifyContent: 'space-between', gap: '6px' }}>
                <span><strong>#{p.number}</strong> · {tr(p.tierBadge)}</span>
                <span><code>{p.equipmentTag}</code></span>
              </div>
              <div style={{ fontSize: '13px', fontWeight: 600, margin: '4px 0' }}>
                {isSolved ? '✓ ' : ''}{tr(p.title)}
              </div>
              <div className="mono" style={{ fontSize: '11px', opacity: 0.9, marginBottom: '4px' }}>
                {CURRICULUM_PROGRESSION_MAP[p.workbenchId]?.yearBadge[isVi ? 'vi' : 'en']} · {p.timeHorizonBadge} · <span>{tr(p.subjectLabel)}</span>
              </div>
              <div style={{ fontSize: '0.75rem', marginBottom: '0.35rem' }}>{tr(p.observationSummary)}</div>
              <div className="wb-actions-row" style={{ justifyContent: 'space-between' }}>
                <code style={{ fontSize: '0.68rem' }}>{p.sourceBookCitation.slice(0, 42)}…</code>
                <button type="button" data-testid={`launch-${p.problemId}`} onClick={() => onSelectProblem(p)}>
                  {ts.libSolveBtn(p.number)}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
