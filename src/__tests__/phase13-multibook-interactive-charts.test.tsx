// Phase 13 Multi-Book Interactive Charts & Nomographs Expansion Suite:
// - Verifies WB1's 10 calibrated multi-book nomographs/charts across all 6 books ('6-10', '14-37', '14-57',
//   '2-53', '19-6', '6-52', '4-18', '15-10', '14-15', '23-42') and pointer scrubbing
// - Verifies Subject 1 (WB2) Binary Non-Ideal VLE T-x-y / y-x Azeotrope Explorer & Peng-Robinson Cubic EOS Z(P_r, T_r)
// - Verifies Subject 2 (WB3) BSL Non-Newtonian Pipe Velocity Profile + Boundary Layer & ISA-75.01 Control Valve Choked Flow
// - Verifies Subject 3 (WB4) Kremser Absorption N_OG(A) Diagram & Ternary LLE Tie-Line + Adsorption Breakthrough C/C0(t/tau)
// - Verifies Subject 4 (WB6) Semenov Thermal Runaway G(T)/R(T) S-Curve, Series Selectivity / RTD E(Theta; N), & Butler-Volmer i(eta)
import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { App } from '../App';
import { PRESET_ANCHORS } from '../lib/perry-figure-chart-meta';
import { samplePerryCurveAtPct } from '../lib/perry-figure-curve-sampler';
import { solveBinaryVleLens, solvePengRobinsonEos } from '../lib/thermo-vle-eos-math';
import { solveBslVelocityAndBoundaryLayer, solveIsaValveChokedCurve } from '../lib/hydraulics-transport-math';
import { solveKremserAbsorption, solveTernaryLleAndBreakthrough } from '../lib/separations-kremser-lle-math';
import {
  solveButlerVolmerCurve,
  solveSemenovThermalCurve,
  solveSeriesSelectivityAndRtd,
} from '../lib/kinetics-safety-electro-math';

afterEach(() => {
  cleanup();
});

describe('Phase 13 — Multi-Book Interactive Charts & Diagrams Expansion Suite', () => {
  it('Test 1 (WB1 10 Calibrated Multi-Book Nomographs): verifies all 10 presets and scrubs every curve', () => {
    expect(PRESET_ANCHORS.length).toBe(10);
    expect(PRESET_ANCHORS.map((p) => p.secPage)).toEqual([
      '6-10',
      '14-37',
      '14-57',
      '2-53',
      '19-6',
      '6-52',
      '4-18',
      '15-10',
      '14-15',
      '23-42',
    ]);

    render(<App />);
    for (const preset of PRESET_ANCHORS) {
      const btn = screen.getByTestId(`wb1-preset-${preset.secPage}`);
      fireEvent.click(btn);
      const svg = screen.getByTestId('perry-svg-interactive-surface');
      fireEvent.pointerDown(svg, { clientX: 265, clientY: 120 });
      fireEvent.pointerMove(svg, { clientX: 310, clientY: 135 });
      fireEvent.pointerUp(svg);
      const sample = samplePerryCurveAtPct(preset.secPage, 50, 50);
      expect(sample.citation.length).toBeGreaterThan(5);
      expect(screen.getByTestId('wb1-hover-readout').textContent).toBeTruthy();
    }
  });

  it('Test 2 (Subject 1 WB2 — Binary Non-Ideal VLE T-x-y/y-x & Peng-Robinson Cubic EOS): scrubs both diagrams and checks edge cases', () => {
    const zeo = solveBinaryVleLens(0.5, 0.2);
    expect(zeo.hasAzeotrope).toBe(false);
    const azeoPos = solveBinaryVleLens(0.6, 1.6);
    expect(azeoPos.hasAzeotrope).toBe(true);
    expect(azeoPos.xAzeo).not.toBeNull();
    const azeoNeg = solveBinaryVleLens(0.2, -1.2);
    expect(azeoNeg.hasAzeotrope).toBe(true);
    expect(azeoNeg.op.tDewK).toBeGreaterThanOrEqual(azeoNeg.op.tBubbleK);

    const sub = solvePengRobinsonEos(0.5, 0.85);
    expect(sub.regime).toBe('SUBCRITICAL_2PHASE');
    const sup = solvePengRobinsonEos(2.5, 1.35);
    expect(sup.regime).toBe('SUPERCRITICAL_FLUID');

    render(<App />);
    fireEvent.click(screen.getByTestId('tab-wb2-thermo-dippr'));

    const vleSvg = screen.getByTestId('wb2-vle-txy-svg');
    fireEvent.pointerDown(vleSvg, { clientX: 140, clientY: 80 });
    fireEvent.pointerMove(vleSvg, { clientX: 180, clientY: 60 });
    fireEvent.pointerUp(vleSvg);
    fireEvent.pointerDown(vleSvg, { clientX: 410, clientY: 70 });
    fireEvent.pointerMove(vleSvg, { clientX: 440, clientY: 50 });
    fireEvent.pointerUp(vleSvg);
    expect(screen.getByTestId('wb2-vle-readout').textContent).toContain('γ₁=');

    const eosSvg = screen.getByTestId('wb2-pr-eos-svg');
    fireEvent.pointerDown(eosSvg, { clientX: 150, clientY: 95 });
    fireEvent.pointerMove(eosSvg, { clientX: 410, clientY: 75 });
    fireEvent.pointerUp(eosSvg);
    expect(screen.getByTestId('wb2-pr-eos-readout').textContent).toContain('Z=');
  });

  it('Test 3 (Subject 2 WB3 — BSL Pipe Velocity/Boundary Layer & ISA-75.01 Choked Valve): scrubs rheology, Prandtl, and choked ΔP', () => {
    const pseudo = solveBslVelocityAndBoundaryLayer(0.45, 7.0);
    expect(pseudo.rheologyLabel).toBe('SHEAR_THINNING_PSEUDOPLASTIC');
    const newton = solveBslVelocityAndBoundaryLayer(1.0, 1.0);
    expect(newton.rheologyLabel).toBe('NEWTONIAN_PARABOLIC');
    expect(newton.vAvgOverVmax).toBeCloseTo(0.5, 3);
    const dilatant = solveBslVelocityAndBoundaryLayer(1.5, 25.0);
    expect(dilatant.rheologyLabel).toBe('SHEAR_THICKENING_DILATANT');

    const subValve = solveIsaValveChokedCurve(20, 2.0, 95);
    expect(subValve.isChoked).toBe(false);
    const chokedValve = solveIsaValveChokedCurve(80, 2.0, 95);
    expect(chokedValve.isChoked).toBe(true);
    expect(chokedValve.qActualGpm).toBeCloseTo(chokedValve.qChokedMaxGpm, 1);

    render(<App />);
    fireEvent.click(screen.getByTestId('tab-wb3-hydraulics'));

    const bslSvg = screen.getByTestId('wb3-bsl-velocity-svg');
    fireEvent.pointerDown(bslSvg, { clientX: 120, clientY: 90 });
    fireEvent.pointerMove(bslSvg, { clientX: 400, clientY: 70 });
    fireEvent.pointerUp(bslSvg);
    expect(screen.getByTestId('wb3-bsl-velocity-readout').textContent).toContain('δ_T/δ_v=');

    const isaSvg = screen.getByTestId('wb3-isa-valve-svg');
    fireEvent.pointerDown(screen.getByTestId('wb3-isa-choked-handle'), { clientX: 480, clientY: 80 });
    fireEvent.pointerMove(isaSvg, { clientX: 510, clientY: 80 });
    fireEvent.pointerUp(isaSvg);
    fireEvent.click(screen.getByTestId('wb3-isa-choked-snap'));
    expect(screen.getByTestId('wb3-isa-valve-readout').textContent).toContain('CHOKED PLATEAU');
  });

  it('Test 4 (Subject 3 WB4 — Kremser Absorption N_OG(A) & Ternary LLE + Adsorption Breakthrough): scrubs A, recovery, tie-line, and Pe', () => {
    const pinched = solveKremserAbsorption(0.75, 0.95);
    expect(pinched.isPinched).toBe(true);
    const singularA1 = solveKremserAbsorption(1.0, 0.95);
    expect(singularA1.nogStages).toBeCloseTo(19.0, 1);
    const opt = solveKremserAbsorption(1.4, 0.95);
    expect(opt.isPinched).toBe(false);
    expect(opt.nogStages).toBeLessThan(10);

    const lle = solveTernaryLleAndBreakthrough(0.3, 60);
    expect(lle.selectivityBeta).toBeGreaterThan(1.5);
    expect(lle.tBreakthroughRatio).toBeGreaterThan(0.5);

    render(<App />);
    fireEvent.click(screen.getByTestId('tab-wb4-distillation'));

    const kremserSvg = screen.getByTestId('wb4-kremser-svg');
    fireEvent.pointerDown(kremserSvg, { clientX: 140, clientY: 90 });
    fireEvent.pointerMove(kremserSvg, { clientX: 430, clientY: 75 });
    fireEvent.pointerUp(kremserSvg);
    expect(screen.getByTestId('wb4-kremser-readout').textContent).toContain('N_OG=');

    const lleSvg = screen.getByTestId('wb4-lle-ads-svg');
    fireEvent.pointerDown(lleSvg, { clientX: 140, clientY: 110 });
    fireEvent.pointerMove(lleSvg, { clientX: 420, clientY: 85 });
    fireEvent.pointerUp(lleSvg);
    expect(screen.getByTestId('wb4-lle-ads-readout').textContent).toContain('t_b/τ=');
  });

  it('Test 5 (Subject 4 WB6 — Semenov G(T)/R(T), Series Selectivity/RTD E(Θ; N) & Butler-Volmer i(η)): scrubs all 3 CRE diagrams', () => {
    const semSafe = solveSemenovThermalCurve(335, 0.24);
    expect(semSafe.isRunaway).toBe(false);
    const semHot = solveSemenovThermalCurve(395, 0.55);
    expect(semHot.isRunaway).toBe(true);

    const rtd1 = solveSeriesSelectivityAndRtd(3.39, 1);
    const rtd25 = solveSeriesSelectivityAndRtd(3.39, 25);
    expect(rtd1.varianceSigma2).toBe(1.0);
    expect(rtd25.varianceSigma2).toBe(0.04);
    expect(rtd25.cbNorm).toBeCloseTo(rtd25.cbMaxNorm, 3);

    const bv = solveButlerVolmerCurve(0.65, 60);
    expect(bv.massTransferLimited).toBe(true);

    render(<App />);
    fireEvent.click(screen.getByTestId('tab-wb6-kinetics-reactors'));

    const semSvg = screen.getByTestId('wb6-semenov-svg');
    fireEvent.pointerDown(semSvg, { clientX: 250, clientY: 95 });
    fireEvent.pointerMove(semSvg, { clientX: 340, clientY: 60 });
    fireEvent.pointerUp(semSvg);
    expect(screen.getByTestId('wb6-semenov-readout').textContent).toContain('ψ=');

    const serSvg = screen.getByTestId('wb6-series-rtd-svg');
    fireEvent.pointerDown(serSvg, { clientX: 110, clientY: 85 });
    fireEvent.pointerMove(serSvg, { clientX: 420, clientY: 65 });
    fireEvent.pointerUp(serSvg);
    expect(screen.getByTestId('wb6-series-rtd-readout').textContent).toContain('C_B/C_A0=');

    const bvSvg = screen.getByTestId('wb6-butler-volmer-svg');
    fireEvent.pointerDown(bvSvg, { clientX: 380, clientY: 75 });
    fireEvent.pointerMove(bvSvg, { clientX: 460, clientY: 65 });
    fireEvent.pointerUp(bvSvg);
    expect(screen.getByTestId('wb6-butler-volmer-readout').textContent).toContain('mA/cm²');
  });
});
