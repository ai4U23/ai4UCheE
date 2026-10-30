// Phase 11 Whole Perry's 9th Ed. 25-Section Handbook Atlas + Back-of-Book Index E2E Verification Suite.
import React from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { App } from '../App';
import { agentNative } from '../actions/define-action';
import { getClientAppState } from '../actions/view-screen';
import { ALL_25_PERRY_SECTIONS, getPerrySectionByNumber } from '../lib/perry-sections/perry-atlas-registry';

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

describe("Phase 11 — Whole Perry's 9th Edition 25-Section Handbook Atlas & Back-of-Book Index Suite", () => {
  it('Test 1 (All 25 Section Descriptors & ChE Invariants): validates Sec 1..25 forward solvers, 3-stage equations, citations, psig->psia, f_D=4f_F, and inverseSvgDrag', () => {
    expect(ALL_25_PERRY_SECTIONS.length).toBe(25);
    expect(ALL_25_PERRY_SECTIONS.map((d) => d.secNum)).toEqual(Array.from({ length: 25 }, (_, i) => i + 1));

    for (const desc of ALL_25_PERRY_SECTIONS) {
      const solved = desc.solve(desc.primaryParam.defaultVal, desc.secondaryParam.defaultVal);
      expect(solved.secNum).toBe(desc.secNum);
      expect(Number.isFinite(solved.responseVal)).toBe(true);
      expect(solved.citation).toMatch(/\[Perry's 9th Ed\.,/);
      expect(solved.equations.length).toBeGreaterThanOrEqual(1);
      expect(solved.equations[0].symbolicLatex.length).toBeGreaterThan(3);
      expect(solved.equations[0].substitutedLatex.length).toBeGreaterThan(3);
      expect(solved.equations[0].resultLatex.length).toBeGreaterThan(3);
      expect(solved.curvePoints.length).toBeGreaterThanOrEqual(10);

      // Verify inverse SVG drag mapping returns in-bounds finite coordinates and visibly moves both the operating handle & curve/secondary curve across all 25 sections
      const invA = desc.inverseSvgDrag(0.25, 0.75);
      const invB = desc.inverseSvgDrag(0.8, 0.2);
      expect(invA.primaryVal).toBeGreaterThanOrEqual(desc.primaryParam.min);
      expect(invA.primaryVal).toBeLessThanOrEqual(desc.primaryParam.max);
      expect(invA.secondaryVal).toBeGreaterThanOrEqual(desc.secondaryParam.min);
      expect(invA.secondaryVal).toBeLessThanOrEqual(desc.secondaryParam.max);
      expect(invB.primaryVal).not.toBe(invA.primaryVal);
      expect(invB.secondaryVal).not.toBe(invA.secondaryVal);

      const solvedA = desc.solve(invA.primaryVal, invA.secondaryVal);
      const solvedB = desc.solve(invB.primaryVal, invB.secondaryVal);
      expect(solvedA.operatingPoint.sx).not.toBe(solvedB.operatingPoint.sx);
      const curveMoved =
        solvedA.curvePoints.some((pt, idx) => pt.sy !== solvedB.curvePoints[idx]?.sy) ||
        (solvedA.secondaryCurvePoints?.some((pt, idx) => pt.sy !== solvedB.secondaryCurvePoints?.[idx]?.sy) ?? false);
      expect(curveMoved, `Sec ${desc.secNum} curve did not move`).toBe(true);
    }

    // Mandatory AGENTS.md #5 Invariant 1: Explicit psig vs. psia in Sec 1, 2, 4, 10, 23
    for (const secNo of [1, 2, 4, 10, 23]) {
      const s = getPerrySectionByNumber(secNo).solve(
        getPerrySectionByNumber(secNo).primaryParam.defaultVal,
        getPerrySectionByNumber(secNo).secondaryParam.defaultVal,
      );
      const blob = `${s.readoutText} ${s.secondaryResponseVal} ${s.equations[0].symbolicLatex} ${s.equations[0].resultLatex}`;
      expect(blob.toLowerCase()).toContain('psia');
    }

    // Mandatory AGENTS.md #5 Invariant 2: Fanning f_F vs. Darcy f_D = 4 f_F in Sec 6
    const sec6 = getPerrySectionByNumber(6).solve(100000, 0.00045);
    expect(sec6.secondaryResponseVal).toContain('4 ×');
    expect(sec6.equations[0].symbolicLatex).toContain('f_D = 4 f_F');

    // Sec 11 Bowman LMTD temperature-cross trap (F_T < 0.75 at P=0.72, R=1.6)
    const sec11Trap = getPerrySectionByNumber(11).solve(0.72, 1.6);
    expect(sec11Trap.responseVal).toBeLessThan(0.75);
    expect(sec11Trap.isAlert).toBe(true);

    // Sec 19 Semenov thermal runaway trap (psi > 1/e ≈ 0.368)
    const sec19Trap = getPerrySectionByNumber(19).solve(0.88, 0.52);
    expect(sec19Trap.isAlert).toBe(true);
    expect(sec19Trap.statusBanner).toContain('RUNAWAY');
  });

  it('Test 2 (WB5 25-Section Perry Atlas UI, Section Switching, Guided Traps & Bi-Directional SVG Scrubbing): switches clusters, triggers traps, and scrubs SVG handle', () => {
    render(<App />);
    fireEvent.click(screen.getByTestId('tab-wb5-handbook-atlas'));
    expect(screen.getByTestId('wb5-handbook-atlas')).toBeTruthy();

    // All 25 section pills should be rendered
    for (let s = 1; s <= 25; s += 1) {
      expect(screen.getByTestId(`atlas-sec-pill-${s}`)).toBeTruthy();
    }

    // Trigger Guided Trap Presets for Sec 11, Sec 19, and Sec 23
    fireEvent.click(screen.getByTestId('atlas-trap-sec11-ft'));
    expect(screen.getByTestId('atlas-status-banner').textContent).toContain('TEMPERATURE CROSS TRAP');

    fireEvent.click(screen.getByTestId('atlas-trap-sec19-runaway'));
    expect(screen.getByTestId('atlas-status-banner').textContent).toContain('SEMENOV THERMAL RUNAWAY');

    fireEvent.click(screen.getByTestId('atlas-trap-sec23-psv'));
    expect(screen.getByTestId('atlas-status-banner').textContent).toContain('14.696');

    // Switch to Sec 25 Materials & Corrosion and scrub the interactive SVG handle
    fireEvent.click(screen.getByTestId('atlas-sec-pill-25'));
    const svgSurface = screen.getByTestId('perry-sec-25-svg');
    fireEvent.pointerDown(screen.getByTestId('perry-sec-drag-handle'), { clientX: 380, clientY: 80 });
    fireEvent.pointerMove(svgSurface, { clientX: 420, clientY: 60 });
    fireEvent.pointerUp(svgSurface);
    expect(screen.getByTestId('perry-sec-hover-readout').textContent).toContain('mpy');
  });

  it('Test 3 (Back-of-Book Index Search pp. 2244–2274 & Sec-Page Jump): searches Index and clicks an extracted S-P reference chip to jump WB5 section', async () => {
    render(<App />);
    fireEvent.click(screen.getByTestId('tab-wb5-handbook-atlas'));

    const searchInput = screen.getByTestId('perry-index-search-input');
    fireEvent.change(searchInput, { target: { value: 'relief' } });
    fireEvent.click(screen.getByTestId('perry-index-search-btn'));

    const chipSec23 = await waitFor(() => {
      const el =
        screen.queryByTestId('index-ref-chip-23-57') ??
        screen.queryByTestId('index-ref-chip-23-30');
      expect(el).toBeTruthy();
      return el!;
    });
    fireEvent.click(chipSec23);

    await waitFor(() => {
      const inputs = getClientAppState().payload.inputs as Record<string, unknown>;
      expect(inputs.secNum).toBe(23);
    });
  });

  it('Test 4 (25-Section Copilot What-If Mutation & Senior EPC Calc Sheet): mutates WB5 via natural-language prompt and exports Sec 23 QA/QC Calc Sheet', async () => {
    render(<App />);

    fireEvent.change(screen.getByLabelText("Ask Perry's Agent"), {
      target: { value: 'Check Sec 23 relief valve sizing at 150 psig' },
    });
    fireEvent.click(screen.getByText('Send'));

    await waitFor(() => {
      expect(getClientAppState().activeWorkbench).toBe('wb5-handbook-atlas');
      const inputs = getClientAppState().payload.inputs as Record<string, unknown>;
      expect(inputs.secNum).toBe(23);
      expect(inputs.primaryVal).toBe(150);
    });

    // Open Senior EPC QA/QC Calculation Sheet Modal for active WB5 Sec 23
    fireEvent.click(screen.getByTestId('export-calc-sheet-btn'));
    const modalText = screen.getByTestId('calc-sheet-modal').textContent ?? '';
    expect(modalText).toContain('API 520 Critical Gas Relief');
    expect(modalText).toContain("[Perry's 9th Ed., Sec. 23, p. 23-30]");
    expect(modalText).toContain('179.70 psia');
  });
});
