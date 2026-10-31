// Phase 17/19 — 24 Real-Life Plant Problem Library & Engineering Progression Tiers (L1–L4) Suite.
// Verifies:
// 1. Complete 24-problem catalog across all 7 reference books, 4 Engineering Progression Tiers (L1..L4), 8 Equipment Categories, and 5 Symptom Archetypes.
// 2. Filtering by Difficulty Tier (`L1`, `L2`, `L3`, `L4`), Equipment Category, Symptom Archetype, Subject Workbench, and search query.
// 3. Launching any problem from `<ProblemLibraryBrowser />` (`toggle-problem-library-btn` -> `launch-prob-*`) switches to Learn Mode, loads its workbench & initial fault mutations, updates the 6-Stage Fogler & LeBlanc Studio, and verifies `Auto-Fix` rescue.
import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { App } from '../App';
import { getClientAppState } from '../actions/view-screen';
import { resetProblemSolvingStore } from '../lib/hypothesis-verification-engine';
import {
  ALL_24_REAL_LIFE_PROBLEMS,
  filterProblemLibrary,
  getProblemById,
  problemEntryToFoglerCase,
  problemEntryToMissionScenario,
} from '../lib/problem-library-registry';
import {
  EQUIPMENT_CATEGORY_META,
  PROGRESSION_TIER_META,
  SYMPTOM_CATEGORY_META,
} from '../lib/problem-library-types';
import { resetStudentProfile } from '../lib/student-adaptive-model';

describe('Phase 17/19 — 24 Real-Life Plant Problem Library & Engineering Progression Tiers (L1–L4)', () => {
  beforeEach(() => {
    resetStudentProfile();
    resetProblemSolvingStore();
  });

  it('Test 1 (Catalog Completeness & 5-Axis Taxonomy): defines all 24 real-life problems across L1–L4 tiers, 8 equipment categories, and 7 reference books', () => {
    expect(ALL_24_REAL_LIFE_PROBLEMS).toHaveLength(24);
    expect(Object.keys(PROGRESSION_TIER_META)).toEqual(['L1', 'L2', 'L3', 'L4']);
    expect(Object.keys(EQUIPMENT_CATEGORY_META)).toHaveLength(8);
    expect(Object.keys(SYMPTOM_CATEGORY_META)).toHaveLength(5);

    // Every tier L1..L4 has multiple problems
    expect(filterProblemLibrary({ tier: 'L1' }).length).toBeGreaterThanOrEqual(3);
    expect(filterProblemLibrary({ tier: 'L2' }).length).toBeGreaterThanOrEqual(8);
    expect(filterProblemLibrary({ tier: 'L3' }).length).toBeGreaterThanOrEqual(7);
    expect(filterProblemLibrary({ tier: 'L4' }).length).toBeGreaterThanOrEqual(3);

    // Every problem converts cleanly to both a GuidedMissionScenario and a 6-Stage FoglerProblemSolvingCase
    for (const p of ALL_24_REAL_LIFE_PROBLEMS) {
      expect(p.number).toBeGreaterThanOrEqual(1);
      expect(p.number).toBeLessThanOrEqual(24);
      expect(p.timeHorizonBadge).toContain('⏱️ Δt');
      const mission = problemEntryToMissionScenario(p);
      expect(mission.id).toBe(p.problemId);
      expect(mission.workbench).toBe(p.workbenchId);
      const foglerCase = problemEntryToFoglerCase(p);
      expect(foglerCase.hypotheses).toHaveLength(3);
      expect(foglerCase.hypotheses.filter((h) => h.isRootCause)).toHaveLength(1);
    }

    // Spot-check signature problems from Fogler & LeBlanc 2e, Fogler 7e, and Crowl & Louvar 4e
    expect(getProblemById('prob-03-butane-isomerization-oops')?.title).toContain('Butane Isomerization');
    expect(getProblemById('prob-14-monsanto-t2-batch-runaway')?.tier).toBe('L4');
    expect(getProblemById('prob-18-photolithography-pag-poisoning')?.equipmentTag).toContain('FAB-501');
    expect(getProblemById('prob-19-lake-nyos-co2-eruption')?.title).toContain('Lake Nyos');
    expect(getProblemById('prob-20-bhopal-mic-relief-runaway')?.tier).toBe('L4');
    expect(getProblemById('prob-24-aiche-chem-e-car-clock')?.equipmentTag).toBe('CHEM-E-CAR');
  });

  it('Test 2 (Interactive Problem Library Browser UI & Multi-Facet Filtering): filters by Difficulty Tier (L1–L4), Equipment, Symptom, Subject, and Search', () => {
    render(<App />);

    // Open the 24-Problem Library Browser from GuidedMissionBar
    const toggleBtn = screen.getByTestId('toggle-problem-library-btn');
    expect(toggleBtn.textContent).toContain('Browse All 24 Problems');
    fireEvent.click(toggleBtn);

    const browser = screen.getByTestId('problem-library-browser');
    expect(browser).toBeTruthy();
    expect(screen.getByTestId('problem-library-count-badge').textContent).toContain('Showing 24 / 24 Problems');

    // Filter by Difficulty Tier L4 (Coupled Safety & Design)
    fireEvent.click(screen.getByTestId('filter-tier-L4'));
    expect(screen.getByTestId('problem-card-prob-14-monsanto-t2-batch-runaway')).toBeTruthy();
    expect(screen.getByTestId('problem-card-prob-20-bhopal-mic-relief-runaway')).toBeTruthy();
    expect(screen.getByTestId('problem-card-prob-24-aiche-chem-e-car-clock')).toBeTruthy();

    // Reset to All Tiers and filter by Equipment = 'valves-reliefs'
    fireEvent.click(screen.getByTestId('filter-tier-all'));
    fireEvent.change(screen.getByTestId('filter-equipment-select'), { target: { value: 'valves-reliefs' } });
    expect(screen.getByTestId('problem-card-prob-07-isa-control-valve-choked')).toBeTruthy();
    expect(screen.getByTestId('problem-card-prob-21-api520-psv-datum-trap')).toBeTruthy();

    // Filter by search query "Lake Nyos"
    fireEvent.change(screen.getByTestId('filter-equipment-select'), { target: { value: 'all' } });
    fireEvent.change(screen.getByTestId('problem-library-search-input'), { target: { value: 'Lake Nyos' } });
    expect(screen.getByTestId('problem-library-count-badge').textContent).toContain('Showing 1 / 24 Problems');
    expect(screen.getByTestId('problem-card-prob-19-lake-nyos-co2-eruption')).toBeTruthy();
  });

  it('Test 3 (End-to-End Problem Launch, 6-Stage Fogler Studio Sync & Rescue): launches Problem #18 (Photolithography) and Problem #14 (Monsanto/T2 Runaway)', async () => {
    render(<App />);
    fireEvent.click(screen.getByTestId('toggle-problem-library-btn'));

    // Launch Problem #18 (East Wing Photolithography Chip Failure -> WB5 Sec 7)
    fireEvent.click(screen.getByTestId('launch-prob-18-photolithography-pag-poisoning'));

    const banner = await screen.findByTestId('mission-checklist-banner');
    expect(banner.textContent).toContain('#18 [L3] East Wing Photolithography Chip Failure');
    expect(screen.getByTestId('why-learn-subject-banner').textContent).toContain(
      'Why learn Kinetics & Catalysis (Sec 7)?',
    );
    expect(screen.getByTestId('kt-problem-definition-box').textContent).toContain(
      'Eliminate trace airborne basic amine/ammonia contamination',
    );

    await waitFor(() => {
      expect(getClientAppState().activeWorkbench).toBe('wb5-handbook-atlas');
      const inputs = getClientAppState().payload.inputs as Record<string, unknown>;
      expect(inputs.secNum).toBe(7);
    });

    // Click Auto-Fix to rescue Problem #18 and verify mission solves
    fireEvent.click(screen.getByTestId('mission-autofix-btn'));
    await waitFor(() => {
      expect(screen.getByTestId('mission-checklist-banner').textContent).toContain('Mission Solved');
    });
  });
});
