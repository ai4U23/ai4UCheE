// Phase 14 Diagram Mode Switcher & 8 Advanced ChE Interactive Diagrams Suite:
// - Verifies WB2, WB3, WB4, WB6 DiagramModeBar default ('all') and mode pill filtering/restoration
// - Verifies WB2 Rankine / Vapor-Compression T-S Cycle Dome + Van 't Hoff Reaction Equilibrium X_eq(T)
// - Verifies WB3 Shell-and-Tube HX T-Q Cross (Bowman F_T) + Nukiyama Pool Boiling Curve q''(DeltaT_excess)
// - Verifies WB3 Crowl & Louvar Flammability Triangle (Fuel-O2-N2 LOC) + Pasquill-Gifford Plume Dispersion C(x)
// - Verifies WB4 Psychrometric Humidification Chart (T_db, T_wb, RH) + Membrane Gas Permeation Stage Cut theta
// - Verifies WB6 LHHW Dual-Site Catalytic Rate Roof & Decay a(t) + Monod Chemostat Bioreactor Washout Cliff D_wash
import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { App } from '../App';
import { solveHeatExchangerAndBoiling, solveProcessSafetyFlammabilityAndPlume } from '../lib/hydraulics-heat-safety-math';
import { solveLhhwAndBioreactor } from '../lib/kinetics-lhhw-bioreactor-math';
import { solvePsychrometricAndMembrane } from '../lib/separations-psychrometry-membrane-math';
import { solveRankineCycleDome, solveRxnEquilibriumCurve } from '../lib/thermo-cycles-rxn-eq-math';

afterEach(cleanup);

describe('Phase 14 — Diagram Mode Switcher & 8 Advanced Multi-Book Interactive Diagrams Suite', () => {
  it('Test 1 (Subject 1 WB2 — Diagram Mode Bar + Rankine T-S Dome & Van \'t Hoff Reaction Equilibrium): switches modes and scrubs both panels', () => {
    const cycWet = solveRankineCycleDome(0.62, 110);
    expect(cycWet.isWetTurbineExhaust).toBe(true);
    const cycDry = solveRankineCycleDome(0.95, 8);
    expect(cycDry.isWetTurbineExhaust).toBe(false);
    expect(cycDry.thermalEffActual).toBeLessThan(cycDry.thermalEffCarnot);

    const rxnExo = solveRxnEquilibriumCurve(420, -65);
    expect(rxnExo.isExothermic).toBe(true);
    const rxnEndo = solveRxnEquilibriumCurve(350, 55);
    expect(rxnEndo.isExothermic).toBe(false);
    expect(rxnEndo.curvePts[rxnEndo.curvePts.length - 1].xEq).toBeGreaterThan(rxnEndo.curvePts[0].xEq);

    render(<App />);
    fireEvent.click(screen.getByTestId('tab-wb2-thermo-dippr'));

    expect(screen.getByTestId('wb2-diagram-mode-bar')).toBeTruthy();
    expect(screen.getByTestId('wb2-vle-txy-svg')).toBeTruthy();
    expect(screen.getByTestId('wb2-rankine-rxn-svg')).toBeTruthy();

    // Switch to Cycles & Reaction Equilibrium only
    fireEvent.click(screen.getByTestId('wb2-mode-cycles-eq'));
    expect(screen.queryByTestId('wb2-vle-txy-svg')).toBeNull();
    expect(screen.getByTestId('wb2-rankine-rxn-svg')).toBeTruthy();

    // Scrub left panel (Rankine T-S dome) and right panel (Reaction X_eq(T))
    const rankineSvg = screen.getByTestId('wb2-rankine-rxn-svg');
    const readoutBeforeLeft = screen.getByTestId('wb2-rankine-rxn-readout').textContent;
    fireEvent.pointerDown(rankineSvg, { clientX: 120, clientY: 95 });
    fireEvent.pointerMove(rankineSvg, { clientX: 170, clientY: 60 });
    fireEvent.pointerUp(rankineSvg);
    const readoutAfterLeft = screen.getByTestId('wb2-rankine-rxn-readout').textContent;
    expect(readoutAfterLeft).not.toBe(readoutBeforeLeft);

    fireEvent.pointerDown(rankineSvg, { clientX: 410, clientY: 85 });
    fireEvent.pointerMove(rankineSvg, { clientX: 460, clientY: 55 });
    fireEvent.pointerCancel(rankineSvg);
    const readoutAfterRight = screen.getByTestId('wb2-rankine-rxn-readout').textContent;
    expect(readoutAfterRight).not.toBe(readoutAfterLeft);
    // Pointer move after pointerCancel should not mutate state
    fireEvent.pointerMove(rankineSvg, { clientX: 350, clientY: 160 });
    expect(screen.getByTestId('wb2-rankine-rxn-readout').textContent).toBe(readoutAfterRight);
    expect(readoutAfterRight).toContain('COP_R=');

    // Switch to Phase mode mid-flight and back to All
    fireEvent.pointerDown(rankineSvg, { clientX: 140, clientY: 80 });
    fireEvent.click(screen.getByTestId('wb2-mode-phase'));
    expect(screen.getByTestId('wb2-vle-txy-svg')).toBeTruthy();
    expect(screen.queryByTestId('wb2-rankine-rxn-svg')).toBeNull();
    fireEvent.click(screen.getByTestId('wb2-mode-all'));
    expect(screen.getByTestId('wb2-rankine-rxn-svg')).toBeTruthy();
  });

  it('Test 2 (Subject 2 WB3 — Diagram Mode Bar + Shell-Tube HX Cross/Nukiyama Boiling & Crowl-Louvar Safety): verifies F_T trap, CHF, LOC, and plume', () => {
    const hxOk = solveHeatExchangerAndBoiling(75, 18);
    expect(hxOk.hasTemperatureCross).toBe(false);
    expect(hxOk.isFtUnacceptable).toBe(false);
    expect(hxOk.boilingRegime).toBe('NUCLEATE_BOILING');

    const hxCross = solveHeatExchangerAndBoiling(128, 220);
    expect(hxCross.hasTemperatureCross).toBe(true);
    expect(hxCross.isFtUnacceptable).toBe(true);
    expect(hxCross.boilingRegime).toBe('FILM_BOILING_RADIATIVE');

    const flamExplosive = solveProcessSafetyFlammabilityAndPlume(9.5, 18.0, 200, 2.0);
    expect(flamExplosive.flammabilityZone).toBe('FLAMMABLE_EXPLOSIVE');
    expect(flamExplosive.exceedsErpg2).toBe(true);

    const flamInert = solveProcessSafetyFlammabilityAndPlume(9.5, 8.0, 1800, 9.0);
    expect(flamInert.flammabilityZone).toBe('INERTED_BELOW_LOC');
    expect(flamInert.exceedsErpg2).toBe(false);

    render(<App />);
    fireEvent.click(screen.getByTestId('tab-wb3-hydraulics'));

    expect(screen.getByTestId('wb3-diagram-mode-bar')).toBeTruthy();
    expect(screen.getByTestId('wb3-bsl-velocity-svg')).toBeTruthy();
    expect(screen.getByTestId('wb3-hx-boiling-svg')).toBeTruthy();
    expect(screen.getByTestId('wb3-safety-flam-plume-svg')).toBeTruthy();

    fireEvent.click(screen.getByTestId('wb3-mode-heat-boiling'));
    expect(screen.queryByTestId('wb3-bsl-velocity-svg')).toBeNull();
    expect(screen.getByTestId('wb3-hx-boiling-svg')).toBeTruthy();

    const hxSvg = screen.getByTestId('wb3-hx-boiling-svg');
    const hxBefore = screen.getByTestId('wb3-hx-boiling-readout').textContent;
    fireEvent.pointerDown(hxSvg, { clientX: 110, clientY: 60 });
    fireEvent.pointerMove(hxSvg, { clientX: 140, clientY: 45 });
    fireEvent.pointerUp(hxSvg);
    const hxAfterLeft = screen.getByTestId('wb3-hx-boiling-readout').textContent;
    expect(hxAfterLeft).not.toBe(hxBefore);
    fireEvent.pointerDown(hxSvg, { clientX: 430, clientY: 80 });
    fireEvent.pointerMove(hxSvg, { clientX: 495, clientY: 70 });
    fireEvent.pointerUp(hxSvg);
    const hxAfterRight = screen.getByTestId('wb3-hx-boiling-readout').textContent;
    expect(hxAfterRight).not.toBe(hxAfterLeft);
    expect(hxAfterRight).toContain('LMTD=');

    fireEvent.click(screen.getByTestId('wb3-mode-safety'));
    expect(screen.queryByTestId('wb3-hx-boiling-svg')).toBeNull();
    const safetySvg = screen.getByTestId('wb3-safety-flam-plume-svg');
    const safetyBefore = screen.getByTestId('wb3-safety-flam-plume-readout').textContent;
    fireEvent.pointerDown(safetySvg, { clientX: 140, clientY: 90 });
    fireEvent.pointerMove(safetySvg, { clientX: 190, clientY: 110 });
    fireEvent.pointerUp(safetySvg);
    const safetyAfterLeft = screen.getByTestId('wb3-safety-flam-plume-readout').textContent;
    expect(safetyAfterLeft).not.toBe(safetyBefore);
    fireEvent.pointerDown(safetySvg, { clientX: 420, clientY: 95 });
    fireEvent.pointerMove(safetySvg, { clientX: 480, clientY: 70 });
    fireEvent.pointerUp(safetySvg);
    const safetyAfterRight = screen.getByTestId('wb3-safety-flam-plume-readout').textContent;
    expect(safetyAfterRight).not.toBe(safetyAfterLeft);
    expect(safetyAfterRight).toContain('ERPG-2');
  });

  it('Test 3 (Subject 3 WB4 — Diagram Mode Bar + Psychrometric Chart & Membrane Gas Permeation): switches modes and scrubs T_db, RH, and stage cut θ', () => {
    const pmLowCut = solvePsychrometricAndMembrane(35, 60, 0.10, 6.0);
    const pmHighCut = solvePsychrometricAndMembrane(35, 60, 0.85, 14.0);
    expect(pmLowCut.tWetBulbC).toBeLessThan(pmLowCut.tDryBulbC);
    expect(pmLowCut.permeateYp).toBeGreaterThan(pmHighCut.permeateYp);
    expect(pmHighCut.isPressureRatioPinched).toBe(true);

    render(<App />);
    fireEvent.click(screen.getByTestId('tab-wb4-distillation'));

    expect(screen.getByTestId('wb4-diagram-mode-bar')).toBeTruthy();
    expect(screen.getByTestId('wb4-kremser-svg')).toBeTruthy();
    expect(screen.getByTestId('wb4-psychrometry-membrane-svg')).toBeTruthy();

    fireEvent.click(screen.getByTestId('wb4-mode-psychrometry-membrane'));
    expect(screen.queryByTestId('wb4-kremser-svg')).toBeNull();
    const pmSvg = screen.getByTestId('wb4-psychrometry-membrane-svg');
    const pmBefore = screen.getByTestId('wb4-psychrometry-membrane-readout').textContent;
    fireEvent.pointerDown(pmSvg, { clientX: 130, clientY: 85 });
    fireEvent.pointerMove(pmSvg, { clientX: 185, clientY: 60 });
    fireEvent.pointerUp(pmSvg);
    const pmAfterLeft = screen.getByTestId('wb4-psychrometry-membrane-readout').textContent;
    expect(pmAfterLeft).not.toBe(pmBefore);
    fireEvent.pointerDown(pmSvg, { clientX: 410, clientY: 90 });
    fireEvent.pointerMove(pmSvg, { clientX: 470, clientY: 55 });
    fireEvent.pointerUp(pmSvg);
    const pmAfterRight = screen.getByTestId('wb4-psychrometry-membrane-readout').textContent;
    expect(pmAfterRight).not.toBe(pmAfterLeft);
    expect(pmAfterRight).toContain('T_wb=');
  });

  it('Test 4 (Subject 4 WB6 — Diagram Mode Bar + LHHW Catalytic Rate Roof & Monod Chemostat Washout): verifies self-inhibition and washout cliff', () => {
    const lhhwPeak = solveLhhwAndBioreactor(2.86, 0, 0.35, 15);
    const lhhwInhibited = solveLhhwAndBioreactor(10.5, 72, 0.78, 15);
    expect(lhhwPeak.isSelfInhibitedRegime).toBe(false);
    expect(lhhwPeak.isWashedOut).toBe(false);
    expect(lhhwInhibited.isSelfInhibitedRegime).toBe(true);
    expect(lhhwInhibited.catalystActivityA).toBeLessThan(1.0);
    expect(lhhwInhibited.isWashedOut).toBe(true);
    expect(lhhwInhibited.cellBiomassCx).toBe(0);

    render(<App />);
    fireEvent.click(screen.getByTestId('tab-wb6-kinetics-reactors'));

    expect(screen.getByTestId('wb6-diagram-mode-bar')).toBeTruthy();
    expect(screen.getByTestId('wb6-semenov-svg')).toBeTruthy();
    expect(screen.getByTestId('wb6-lhhw-bioreactor-svg')).toBeTruthy();

    fireEvent.click(screen.getByTestId('wb6-mode-lhhw-bioreactor'));
    expect(screen.queryByTestId('wb6-semenov-svg')).toBeNull();
    const lhhwSvg = screen.getByTestId('wb6-lhhw-bioreactor-svg');
    const lhhwBefore = screen.getByTestId('wb6-lhhw-bioreactor-readout').textContent;
    fireEvent.pointerDown(lhhwSvg, { clientX: 140, clientY: 85 });
    fireEvent.pointerMove(lhhwSvg, { clientX: 210, clientY: 60 });
    fireEvent.pointerUp(lhhwSvg);
    const lhhwAfterLeft = screen.getByTestId('wb6-lhhw-bioreactor-readout').textContent;
    expect(lhhwAfterLeft).not.toBe(lhhwBefore);
    fireEvent.pointerDown(lhhwSvg, { clientX: 420, clientY: 80 });
    fireEvent.pointerMove(lhhwSvg, { clientX: 485, clientY: 65 });
    fireEvent.pointerUp(lhhwSvg);
    const lhhwAfterRight = screen.getByTestId('wb6-lhhw-bioreactor-readout').textContent;
    expect(lhhwAfterRight).not.toBe(lhhwAfterLeft);
    expect(lhhwAfterRight).toContain('D_wash=');
  });
});
