// Phase 12 Subject-First 6-Textbook Corpus & WB6 Kinetics/Reactor Design E2E Verification Suite:
// - Verifies all 6 textbooks (Perry 9th Ed., Fogler 7th Ed. EPUB, BSL 2nd Ed., Smith-Van Ness-Abbott 9th Ed.,
//   Seader 4th Ed., Crowl & Louvar 4th Ed.) are registered and blended by Subject across WB1..WB6
// - Verifies WB6 Kinetics & Reactor Design solver (Levenspiel CSTR/PFR, Ergun PBR y=P/P0, Thiele eta, Semenov psi)
// - Verifies explicit psig -> psia (+14.696) and Fanning f_F vs Darcy f_D = 4*f_F vs Ergun friction invariants
// - Verifies Mission 5 (mission-kinetics-runaway) trap -> auto-fix rescue loop
// - Verifies Copilot natural-language What-If mutation to WB6 and Senior QA/QC Calc Sheet export
import React from 'react';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { App } from '../App';
import { agentNative } from '../actions/define-action';
import { getClientAppState } from '../actions/view-screen';
import { solveKineticsReactor } from '../components/workbenches/kinetics-solver-math';
import { SUBJECT_WORKBENCH_BLENDS, TEXTBOOK_CORPUS_CATALOG } from '../lib/textbook-corpus-registry';

if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
}

afterEach(() => {
  cleanup();
  agentNative.ui.clearHistory();
});

describe('Phase 12 — Subject-First 6-Textbook Blending & WB6 Kinetics/Reactor Design Suite', () => {
  it('Test 1 (6-Textbook Corpus & Subject-First Blending): registers all 6 books and blends them across all 6 subject workbenches', () => {
    expect(TEXTBOOK_CORPUS_CATALOG.length).toBe(6);
    expect(TEXTBOOK_CORPUS_CATALOG.map((b) => b.bookId)).toEqual([
      'perry-9e',
      'fogler-7e',
      'bsl-2e',
      'svna-9e',
      'seader-4e',
      'crowl-4e',
    ]);
    expect(Object.keys(SUBJECT_WORKBENCH_BLENDS)).toEqual([
      'wb1-visual-verifier',
      'wb2-thermo-dippr',
      'wb3-hydraulics',
      'wb4-distillation',
      'wb6-kinetics-reactors',
      'wb5-handbook-atlas',
    ]);

    const solved = solveKineticsReactor({
      conversionX: 0.80,
      tempK: 450,
      pInletPsig: 45,
      epsilonA: 0.25,
      alphaErgun: 0.015,
      thielePhi: 1.4,
      semenovPsi: 0.28,
    });
    expect(solved.pInletPsia).toBeCloseTo(59.6959, 3);
    expect(solved.fDarcyEquiv).toBeCloseTo(4 * solved.fFanningEquiv, 5);
    expect(solved.vRatioCstrPfr).toBeGreaterThan(2.0);
    expect(solved.effectivenessEta).toBeGreaterThan(0.5);
    expect(solved.isRunaway).toBe(false);
    expect(solved.equations.length).toBe(3);
    const solvedHot = solveKineticsReactor({
      conversionX: 0.80,
      tempK: 520,
      pInletPsig: 45,
      epsilonA: 0.25,
      alphaErgun: 0.015,
      thielePhi: 1.4,
      semenovPsi: 0.28,
    });
    expect(solvedHot.kRateSInv).toBeGreaterThan(solved.kRateSInv);
    expect(solvedHot.daCstr).toBeLessThan(solved.daCstr);
    expect(solvedHot.daPfrErgun).toBeLessThan(solved.daPfrErgun);
    expect(solvedHot.curvePoints.some((pt, i) => pt.sy !== solved.curvePoints[i]?.sy)).toBe(true);

    render(<App />);
    const subjectNav = screen.getByRole('tablist', { name: /Engineering Subject Workbenches/i });
    const subjectTabs = subjectNav.querySelectorAll('button[role="tab"]');
    expect(subjectTabs.length).toBe(5);
    expect(Array.from(subjectTabs).map((b) => b.getAttribute('data-testid'))).toEqual([
      'tab-wb2-thermo-dippr',
      'tab-wb3-hydraulics',
      'tab-wb4-distillation',
      'tab-wb6-kinetics-reactors',
      'tab-wb5-handbook-atlas',
    ]);

    // Switch to Separations & Distillation, then click the cross-subject Charts & Page Verifier tool in the header
    fireEvent.click(screen.getByTestId('tab-wb4-distillation'));
    expect(getClientAppState().activeWorkbench).toBe('wb4-distillation');
    fireEvent.click(screen.getByTestId('tab-wb1-visual-verifier'));
    expect(getClientAppState().activeWorkbench).toBe('wb1-visual-verifier');
    expect((getClientAppState().payload.inputs as Record<string, unknown>).secPage).toBe('14-37');
    expect((screen.getByLabelText('Section selector') as HTMLSelectElement).value).toBe('14');

    // Clicking the cross-subject tool again returns to Separations & Distillation
    fireEvent.click(screen.getByTestId('tab-wb1-visual-verifier'));
    expect(getClientAppState().activeWorkbench).toBe('wb4-distillation');

    // Switch to Kinetics & Reactor Design, then open Charts & Page Verifier -> pre-syncs to '19-6' (Sec 19)
    fireEvent.click(screen.getByTestId('tab-wb6-kinetics-reactors'));
    fireEvent.click(screen.getByTestId('tab-wb1-visual-verifier'));
    expect((getClientAppState().payload.inputs as Record<string, unknown>).secPage).toBe('19-6');
    expect((screen.getByLabelText('Section selector') as HTMLSelectElement).value).toBe('19');
    fireEvent.click(screen.getByTestId('tab-wb1-visual-verifier'));
    expect(getClientAppState().activeWorkbench).toBe('wb6-kinetics-reactors');
  });

  it('Test 2 (WB6 Kinetics & Reactor Design UI, Levenspiel SVG Scrubbing, Traps & KaTeX): switches to WB6, triggers traps, and scrubs Levenspiel plot', () => {
    render(<App />);
    fireEvent.click(screen.getByTestId('tab-wb6-kinetics-reactors'));
    expect(screen.getByTestId('wb6-kinetics-reactors')).toBeTruthy();
    expect(screen.getByTestId('wb6-blended-sources-badge').textContent).toContain('Fogler 7th Ed.');

    // Verify 3-stage KaTeX equations mount inside WB6
    expect(screen.getByTestId('eq-stage-symbolic-wb6-levenspiel-cstr-pfr').querySelector('.katex')).toBeTruthy();
    expect(screen.getByTestId('eq-stage-symbolic-wb6-thiele-ergun').querySelector('.katex')).toBeTruthy();
    expect(screen.getByTestId('eq-stage-symbolic-wb6-semenov-runaway').querySelector('.katex')).toBeTruthy();

    // Trigger Semenov Thermal Runaway trap
    fireEvent.click(screen.getByTestId('wb6-trap-runaway'));
    expect(screen.getByTestId('wb6-status-banner').textContent).toContain('SEMENOV RUNAWAY HAZARD');

    // Trigger Thiele Pore-Diffusion trap
    fireEvent.click(screen.getByTestId('wb6-trap-thiele'));
    expect(screen.getByTestId('wb6-status-banner').textContent).toContain('PORE DIFFUSION LIMITED');

    // Rescue safe design
    fireEvent.click(screen.getByTestId('wb6-rescue-safe'));
    expect(screen.getByTestId('wb6-status-banner').textContent).toContain('STABLE REACTOR OPERATION');

    // Scrub interactive Levenspiel SVG canvas
    const svg = screen.getByTestId('levenspiel-reactor-svg');
    fireEvent.pointerDown(screen.getByTestId('levenspiel-operating-handle'), { clientX: 320, clientY: 90 });
    fireEvent.pointerMove(svg, { clientX: 380, clientY: 110 });
    fireEvent.pointerUp(svg);
    expect(screen.getByTestId('levenspiel-hover-readout').textContent).toContain('V_CSTR/V_PFR=');
  });

  it('Test 3 (Guided Mission 5 — mission-kinetics-runaway): presets Fogler runaway/diffusion trap and auto-completes on rescue', async () => {
    render(<App />);
    fireEvent.click(screen.getByTestId('mission-kinetics-runaway'));

    await waitFor(() => {
      expect(getClientAppState().activeWorkbench).toBe('wb6-kinetics-reactors');
      const metrics = getClientAppState().payload.metrics as Record<string, unknown>;
      expect(metrics.isRunaway).toBe(true);
    });

    fireEvent.click(screen.getByTestId('mission-autofix-btn'));
    await waitFor(() => {
      const metrics = getClientAppState().payload.metrics as Record<string, unknown>;
      expect(metrics.isRunaway).toBe(false);
      expect(metrics.isDiffusionLimited).toBe(false);
      expect(screen.getByTestId('mission-checklist-banner').textContent).toContain('Mission Solved');
    });
  });

  it('Test 4 (Copilot What-If, WB5 6-Book Corpus Filter & Senior QA/QC Calc Sheet for WB6): dispatches Fogler reactor mutation, filters 6-book corpus, and compiles Calc Sheet', async () => {
    render(<App />);
    fireEvent.change(screen.getByLabelText("Ask ChemEng's Agent"), {
      target: { value: 'Rescue reactor runaway with Fogler X=0.80 and Thiele phi=1.1' },
    });
    fireEvent.click(screen.getByText('Send'));

    await waitFor(() => {
      expect(getClientAppState().activeWorkbench).toBe('wb6-kinetics-reactors');
      const inputs = getClientAppState().payload.inputs as Record<string, unknown>;
      expect(inputs.conversionX).toBe(0.8);
      expect(inputs.thielePhi).toBe(1.1);
    });

    fireEvent.click(screen.getByTestId('export-calc-sheet-btn'));
    const modalText = screen.getByTestId('calc-sheet-modal').textContent ?? '';
    expect(modalText).toContain('Fogler 7th Ed.');
    expect(modalText).toContain('V_CSTR / V_PFR');
    expect(modalText).toContain('psia = psig + 14.696');
    fireEvent.keyDown(window, { key: 'Escape' });

    // Switch to WB5 and verify 6-Book Corpus Filter & multi-book search hits
    fireEvent.click(screen.getByTestId('tab-wb5-handbook-atlas'));
    const filterSelect = screen.getByTestId('corpus-book-filter') as HTMLSelectElement;
    expect(filterSelect.options.length).toBe(7); // All 6 Textbooks + 6 individual books
    fireEvent.change(filterSelect, { target: { value: 'fogler-7e' } });
    fireEvent.change(screen.getByTestId('perry-index-search-input'), { target: { value: 'Levenspiel' } });
    fireEvent.click(screen.getByTestId('perry-index-search-btn'));
    await waitFor(
      () => {
        const hits = screen.getAllByTestId('multi-book-corpus-hit');
        expect(hits.length).toBeGreaterThan(0);
        expect(hits[0].textContent).toContain('Fogler 7th Ed.');
      },
      { timeout: 4000 },
    );
  });
});
