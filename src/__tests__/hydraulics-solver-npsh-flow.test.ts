// Regression test for R5 finding DEF-1: NPSHa must respond to Flow Q (h_f,s ∝ Q^1.8,
// calibrated 0.8 m at the 250 gpm duty point, matching hydraulics-curve-svg-math npshaAtQ).
import { describe, expect, it } from 'vitest';
import { solveHydraulics } from '../components/workbenches/hydraulics-solver-math';

const BASE = { npsInch: 4, schedule: '40', lengthM: 100, pSuctionPsig: 2, zSuctionM: 2, npshrM: 3, valveDpPsi: 30 };

describe('WB3 NPSHa flow response (DEF-1 regression)', () => {
  it('preserves the shipped duty-point value at 250 gpm (NPSHa = 12.64 m, h_f,s = 0.8 m)', () => {
    const s = solveHydraulics({ ...BASE, flowGpm: 250 });
    expect(s.npshAvailableM).toBeCloseTo(12.64, 2);
    const sub = s.equations.find((e) => e.id === 'wb3-npsha')?.substitutedLatex ?? '';
    expect(sub).toContain('- 0.8\\ \\mathrm{m}');
    expect(s.isCavitating).toBe(false);
  });

  it('drops NPSHa as flow rises and raises it as flow falls (monotonic, h_f,s visible in substitution)', () => {
    const low = solveHydraulics({ ...BASE, flowGpm: 100 });
    const duty = solveHydraulics({ ...BASE, flowGpm: 250 });
    const high = solveHydraulics({ ...BASE, flowGpm: 400 });
    expect(high.npshAvailableM).toBeLessThan(duty.npshAvailableM);
    expect(duty.npshAvailableM).toBeLessThan(low.npshAvailableM);
    // h_f,s at 400 gpm ≈ 0.8 × (400/250)^1.8 ≈ 1.86 m — card no longer static (was 0.8 at every Q).
    const subHigh = high.equations.find((e) => e.id === 'wb3-npsha')?.substitutedLatex ?? '';
    expect(subHigh).toContain('- 1.9\\ \\mathrm{m}');
    expect(high.npshAvailableM).toBeCloseTo(12.64 - (1.86 - 0.8), 1);
  });

  it('keeps the NPSHa mission cavitating at its preset (450 gpm, −10 psig, NPSHr 8 m)', () => {
    const s = solveHydraulics({ ...BASE, lengthM: 100, flowGpm: 450, pSuctionPsig: -10, npshrM: 8 });
    expect(s.isCavitating).toBe(true);
    expect(s.npshAvailableM).toBeLessThan(8);
  });

  it('keeps the rescue parameters passing the mission predicate (260 gpm, 15 psig, NPSHr 3 m, NPSHa ≥ 5 m)', () => {
    const s = solveHydraulics({ ...BASE, flowGpm: 260, pSuctionPsig: 15, npshrM: 3 });
    expect(s.isCavitating).toBe(false);
    expect(s.npshAvailableM).toBeGreaterThanOrEqual(5);
  });
});
