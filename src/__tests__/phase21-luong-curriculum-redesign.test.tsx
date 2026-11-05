// Phase 21 — Lương Curriculum Redesign (plan 261105-1411): tier rubric panel, problem taxonomy,
// causal hypothesis tree (A2 pre-authored consequences + wordlist rule), phase×domain matrix (F′ gate),
// and 6-topic lab sessions. Test files are exempt from the 199-LOC ceiling (precedent: phase19 = 237).
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { App } from '../App';
import { getClientAppState } from '../actions/view-screen';
import { resetProblemSolvingStore } from '../lib/hypothesis-verification-engine';
import { resetStudentProfile } from '../lib/student-adaptive-model';
import { getCurriculumCopy } from '../lib/i18n/curriculum-copy';
import { resetActiveProblems } from '../lib/problem-library-registry';

beforeEach(() => {
  resetStudentProfile();
  resetProblemSolvingStore();
  resetActiveProblems();
});

describe('Phase 21 — Tier Rubric Panel (plan phase 1)', () => {
  it('rubric collapses by default, expands, and shows all four tier descriptions', () => {
    render(<App />);
    expect(screen.queryByTestId('tier-rubric-panel')).toBeNull();
    fireEvent.click(screen.getByTestId('toggle-problem-library-btn'));
    fireEvent.click(screen.getByTestId('tier-rubric-toggle'));
    expect(screen.getByTestId('tier-rubric-panel')).toBeTruthy();
    for (const t of ['L1', 'L2', 'L3', 'L4'] as const) {
      expect(screen.getByTestId(`tier-rubric-desc-${t}`)).toBeTruthy();
    }
  });

  it('rubric shows the 4-axis table headers', () => {
    render(<App />);
    fireEvent.click(screen.getByTestId('toggle-problem-library-btn'));
    fireEvent.click(screen.getByTestId('tier-rubric-toggle'));
    const panel = screen.getByTestId('tier-rubric-panel');
    expect(panel.textContent).toContain(getCurriculumCopy('en').rubricAxisFalsify);
    expect(panel.textContent).toContain(getCurriculumCopy('en').rubricSubtitle);
  });

  it('rubric renders Vietnamese copy under VI locale', () => {
    render(<App />);
    fireEvent.click(screen.getByTestId('locale-vi'));
    fireEvent.click(screen.getByTestId('toggle-problem-library-btn'));
    fireEvent.click(screen.getByTestId('tier-rubric-toggle'));
    expect(screen.getByTestId('tier-rubric-panel').textContent).toContain('Nguyên tắc phân chia 4 mức');
  });
});

// ————— Phase 2: taxonomy (plan phase-02) —————
import { ALL_24_REAL_LIFE_PROBLEMS } from '../lib/problem-library-registry';
import {
  CAUSE_DOMAIN_META, COURSE_TOPIC_META, COURSE_TOPIC_ORDER,
  LIFECYCLE_PHASE_META, PROBLEM_TAXONOMY,
} from '../lib/problem-taxonomy';

describe('Phase 21 — Problem Taxonomy (plan phase 2)', () => {
  it('every problem has exactly one taxonomy row', () => {
    for (const p of ALL_24_REAL_LIFE_PROBLEMS) {
      expect(PROBLEM_TAXONOMY[p.problemId]).toBeDefined();
    }
    expect(Object.keys(PROBLEM_TAXONOMY).length).toBe(ALL_24_REAL_LIFE_PROBLEMS.length);
  });

  it('session totals match the locked audit table', () => {
    const byTopic: Record<string, number> = {};
    for (const id of Object.keys(PROBLEM_TAXONOMY)) {
      const t = PROBLEM_TAXONOMY[id].courseTopic;
      byTopic[t] = (byTopic[t] ?? 0) + 1;
    }
    expect(byTopic).toEqual({ thermo: 5, fluids: 3, 'heat-transfer': 2, separations: 3, reaction: 8, 'design-control-safety': 3 });
    expect(Object.values(byTopic).reduce((a, b) => a + b, 0)).toBe(ALL_24_REAL_LIFE_PROBLEMS.length);
  });

  it('phase and domain totals match', () => {
    const byPhase: Record<string, number> = {};
    const byDomain: Record<string, number> = {};
    for (const id of Object.keys(PROBLEM_TAXONOMY)) {
      const t = PROBLEM_TAXONOMY[id];
      byPhase[t.lifecyclePhase] = (byPhase[t.lifecyclePhase] ?? 0) + 1;
      byDomain[t.causeDomain] = (byDomain[t.causeDomain] ?? 0) + 1;
    }
    expect(byPhase).toEqual({ 'design-audit': 6, operation: 18 });
    expect(byDomain).toEqual({ 'process-limit': 5, equipment: 3, 'operating-conditions': 7, catalyst: 2, control: 1, 'convention-procedure': 6 });
  });

  it('case-study badges are exactly three and control domain roadmap cell is prob-07', () => {
    const caseStudies = Object.keys(PROBLEM_TAXONOMY).filter((id) => PROBLEM_TAXONOMY[id].caseStudy).sort();
    expect(caseStudies).toEqual(['prob-19-lake-nyos-co2-eruption', 'prob-22-dispersion-pasquill-plume', 'prob-24-aiche-chem-e-car-clock']);
    expect(PROBLEM_TAXONOMY['prob-07-isa-control-valve-choked'].causeDomain).toBe('control');
  });

  it('meta labels are bilingual (en + vi non-empty) for every enum', () => {
    for (const meta of [...Object.values(COURSE_TOPIC_META), ...Object.values(CAUSE_DOMAIN_META), ...Object.values(LIFECYCLE_PHASE_META)]) {
      for (const labels of Object.values(meta)) {
        expect((labels as Record<string, string>).en.length).toBeGreaterThan(0);
        expect((labels as Record<string, string>).vi.length).toBeGreaterThan(0);
      }
    }
    expect(COURSE_TOPIC_ORDER).toHaveLength(6);
  });
});

// ————— Phase 3: causal tree + A2 consequence rule (plan phase-03) —————
import { FOGLER_PROBLEM_CASES } from '../lib/fogler-problem-solving-catalog';
import {
  getHypothesisConsequence, FLAGSHIP_CONSEQUENCES,
} from '../lib/hypothesis-consequence-copy';
import { PROBLEM_CONSEQUENCES_A } from '../lib/problem-consequence-copy-a';
import { PROBLEM_CONSEQUENCES_B } from '../lib/problem-consequence-copy-b';
import { problemEntryToFoglerCase } from '../lib/problem-library-registry';
import { CausalHypothesisTree } from '../components/shell/causal-hypothesis-tree';
import { CausalMiniMap } from '../components/shell/causal-mini-map';
import { recordHypothesisVerdict } from '../lib/hypothesis-verification-engine';
import { getActiveLocale, type LocaleCode } from '../lib/i18n/locale-types';

const FORBIDDEN_TOKENS = ['PROVED', 'DISPROVED', '✅', '❌', 'Rule #12', 'root cause', 'nguyên nhân gốc', 'đúng rồi', 'sai rồi'];
const ALL_CONSEQUENCE_MAPS = [FLAGSHIP_CONSEQUENCES, PROBLEM_CONSEQUENCES_A, PROBLEM_CONSEQUENCES_B];

describe('Phase 21 — Causal tree consequence copy (plan phase 3)', () => {
  it('consequence coverage is complete for flagship cases and all 24 problems', () => {
    for (const spec of Object.values(FOGLER_PROBLEM_CASES)) {
      for (const h of spec.hypotheses) {
        const c = getHypothesisConsequence(spec.caseId, h.id);
        expect(c, `${spec.caseId}:${h.id}`).toBeDefined();
        expect(c!.en.length).toBeGreaterThan(0);
        expect(c!.vi.length).toBeGreaterThan(0);
      }
    }
    for (const p of ALL_24_REAL_LIFE_PROBLEMS) {
      const spec = problemEntryToFoglerCase(p);
      for (const h of spec.hypotheses) {
        const c = getHypothesisConsequence(spec.caseId, h.id);
        expect(c, `${spec.caseId}:${h.id}`).toBeDefined();
        expect(c!.en.length).toBeGreaterThan(0);
        expect(c!.vi.length).toBeGreaterThan(0);
      }
    }
  });

  it('A2 wordlist rule: no verdict keywords in any consequence string (both locales)', () => {
    for (const map of ALL_CONSEQUENCE_MAPS) {
      for (const [key, c] of Object.entries(map)) {
        const blob = `${key}|${c.en}|${c.vi}`.toLowerCase();
        for (const tok of FORBIDDEN_TOKENS) {
          expect(blob.includes(tok.toLowerCase()), `${key} contains "${tok}"`).toBe(false);
        }
      }
    }
  });

  it('tree preserves stage-5 testids and shows A2 consequences BEFORE any verdict', () => {
    const spec = FOGLER_PROBLEM_CASES['wb1-visual-verifier'];
    const noop = () => undefined;
    render(<CausalHypothesisTree spec={spec} workbenchId="wb1-visual-verifier" locale="en" onVerdict={noop} onAskAgent={noop} />);
    expect(screen.getByTestId('tree-root-symptom')).toBeTruthy();
    for (const h of spec.hypotheses) {
      expect(screen.getByTestId(`hypothesis-card-${h.id}`)).toBeTruthy();
      expect(screen.getByTestId(`hyp-prove-${h.id}`)).toBeTruthy();
      expect(screen.getByTestId(`hyp-disprove-${h.id}`)).toBeTruthy();
      expect(screen.getByTestId(`hyp-ask-agent-${h.id}`)).toBeTruthy();
      expect(screen.getByTestId(`hyp-verdict-${h.id}`)).toBeTruthy();
      // A2 lock: consequence text is visible pre-verdict, non-empty
      expect(screen.getByTestId(`tree-consequence-${h.id}`).textContent!.length).toBeGreaterThan(10);
    }
  });

  it('prune on disprove: branch gets line-through + pruned label, verdict reveals', () => {
    const spec = FOGLER_PROBLEM_CASES['wb1-visual-verifier'];
    const noop = () => undefined;
    const { rerender } = render(<CausalHypothesisTree spec={spec} workbenchId="wb1-visual-verifier" locale="en" onVerdict={noop} onAskAgent={noop} />);
    fireEvent.click(screen.getByTestId('hyp-disprove-wb1-h1'));
    recordHypothesisVerdict('wb1-visual-verifier', 'wb1-h1', 'disproved');
    rerender(<CausalHypothesisTree spec={spec} workbenchId="wb1-visual-verifier" locale="en" onVerdict={noop} onAskAgent={noop} />);
    const card = screen.getByTestId('hypothesis-card-wb1-h1');
    expect(card.style.textDecoration).toBe('line-through');
    expect(card.textContent).toContain('pruned');
  });

  it('mini-map renders and localizes to Vietnamese', () => {
    const spec = FOGLER_PROBLEM_CASES['wb1-visual-verifier'];
    const { rerender } = render(<CausalMiniMap spec={spec} workbenchId="wb1-visual-verifier" locale={'en' as LocaleCode} />);
    expect(screen.getByTestId('tree-minimap')).toBeTruthy();
    expect(screen.getByTestId('tree-minimap-wb1-h1')).toBeTruthy();
    rerender(<CausalMiniMap spec={spec} workbenchId="wb1-visual-verifier" locale={'vi' as LocaleCode} />);
    expect(screen.getByTestId('tree-minimap').textContent).toContain('TRIỆU CHỨNG');
  });
});

// ————— Phase 4: F′ matrix + lab sessions (plan phase-04) —————
describe('Phase 21 — Phase×Domain Matrix & Lab Sessions (plan phase 4)', () => {
  it('matrix counts visible, chips gated on solved (F′)', () => {
    render(<App />);
    fireEvent.click(screen.getByTestId('toggle-problem-library-btn'));
    expect(screen.getByTestId('matrix-cell-count-operation-control').textContent).toBe('1');
    // Zero solved → NO chips anywhere, locked line on the control cell
    expect(screen.queryAllByTestId(/^matrix-chip-/).length
      + document.querySelectorAll('[data-testid^="matrix-chip-"]').length).toBe(0);
    expect(screen.getByTestId('matrix-cell-locked-operation-control')).toBeTruthy();
    expect(screen.getByTestId('matrix-roadmap-note')).toBeTruthy();
  });

  it('teacher mode reveals all 24 chips with the warning line', () => {
    render(<App />);
    fireEvent.click(screen.getByTestId('toggle-problem-library-btn'));
    fireEvent.click(screen.getByTestId('matrix-teacher-toggle'));
    expect(screen.getByTestId('matrix-teacher-warning')).toBeTruthy();
    expect(document.querySelectorAll('[data-testid^="matrix-chip-"]').length).toBe(24);
  });

  it('teacher-mode chip launches its problem', () => {
    render(<App />);
    fireEvent.click(screen.getByTestId('toggle-problem-library-btn'));
    fireEvent.click(screen.getByTestId('matrix-teacher-toggle'));
    fireEvent.click(screen.getByTestId('matrix-chip-prob-14-monsanto-t2-batch-runaway'));
    expect(getClientAppState().payload).toBeTruthy();
  });

  it('sessions view: 6 blocks, membership counts, every problem exactly once, soft tier order', () => {
    render(<App />);
    fireEvent.click(screen.getByTestId('toggle-problem-library-btn'));
    expect(screen.queryByTestId('lab-session-view')).toBeNull();
    fireEvent.click(screen.getByTestId('view-toggle-sessions'));
    expect(screen.getByTestId('lab-session-view')).toBeTruthy();
    const blocks = document.querySelectorAll('[data-testid^="session-block-"]');
    expect(blocks.length).toBe(6);
    expect(screen.getByTestId('session-block-heat-transfer').querySelectorAll('[data-testid^="session-problem-"]').length).toBe(2);
    expect(screen.getByTestId('session-block-reaction').querySelectorAll('[data-testid^="session-problem-"]').length).toBe(8);
    // Every one of the 24 problems appears exactly once across blocks
    const allRows = document.querySelectorAll('[data-testid^="session-problem-"]');
    expect(allRows.length).toBe(24);
    const ids = new Set(Array.from(allRows).map((el) => (el as HTMLElement).dataset.testid!.replace('session-problem-', '')));
    expect(ids.size).toBe(24);
    // Soft L1→L4 order inside the reaction block: tier badges non-decreasing down the rows
    const tierRank: Record<string, number> = { L1: 1, L2: 2, L3: 3, L4: 4 };
    const rows = Array.from(screen.getByTestId('session-block-reaction').querySelectorAll('[data-testid^="session-problem-"]'));
    const ranks = rows.map((el) => {
      const m = (el as HTMLElement).textContent!.match(/L(\d)/);
      return m ? tierRank[`L${m[1]}`] : 0;
    });
    for (let i = 1; i < ranks.length; i++) expect(ranks[i]).toBeGreaterThanOrEqual(ranks[i - 1]);
    // Global numbering kept and facet row hidden in sessions view
    expect(screen.getByTestId('session-problem-prob-01-fanning-darcy-audit').textContent).toContain('#1');
    expect(screen.queryByTestId('filter-equipment-select')).toBeNull();
    // Back to library: facets return
    fireEvent.click(screen.getByTestId('view-toggle-library'));
    expect(screen.getByTestId('filter-equipment-select')).toBeTruthy();
    expect(screen.getByTestId('problem-library-grid')).toBeTruthy();
  });

  it('VI locale renders matrix title and session toggle', () => {
    render(<App />);
    fireEvent.click(screen.getByTestId('locale-vi'));
    fireEvent.click(screen.getByTestId('toggle-problem-library-btn'));
    expect(screen.getByTestId('phase-domain-matrix').textContent).toContain('Bản đồ Sự cố');
    expect(screen.getByTestId('view-toggle-sessions').textContent).toContain('Buổi thực hành');
    fireEvent.click(screen.getByTestId('view-toggle-sessions'));
    expect(screen.getByTestId('lab-session-view').textContent).toContain('Tiên quyết:');
  });
});
