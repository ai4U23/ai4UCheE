// Phase 9 Interactive-Intelligence E2E suite: proves the 5 previously-broken interactive loops
// now work end-to-end — live <current-screen> payload bus, 3-stage white-box KaTeX substitution,
// mission trap → auto-fix, DIPPR phase envelope, copilot What-If mutations, live QA/QC sheet.
import React from 'react';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { App } from '../App';
import { agentNative } from '../actions/define-action';
import {
  dispatchWorkbenchMutation,
  getClientAppState,
  serializeCurrentScreenTag,
} from '../actions/view-screen';

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

describe('Phase 9 — Interactive Intelligence: Bi-Directional Bus, White-Box Cards, Missions, Copilot & QA/QC Sheet', () => {
  it('syncs live WB3 parameters into <current-screen> payload inputs and XML (not {})', () => {
    render(<App />);
    fireEvent.click(screen.getByTestId('tab-wb3-hydraulics'));

    const inputs = getClientAppState().payload.inputs as Record<string, unknown>;
    expect(inputs.flowGpm).toBe(250);
    expect(inputs.npsInch).toBe(4);
    expect(inputs.pSuctionPsig).toBe(2);
    const metrics = getClientAppState().payload.metrics as Record<string, unknown>;
    expect(metrics.npshAvailableM).toBeTypeOf('number');
    expect(serializeCurrentScreenTag()).toContain('npshAvailableM');
  });

  it('updates 3-stage white-box substitution live when a mutation scrubs WB3 parameters', () => {
    render(<App />);
    fireEvent.click(screen.getByTestId('tab-wb3-hydraulics'));

    expect(screen.getByTestId('eq-stage-symbolic-wb3-npsha')).toBeTruthy();
    const before = screen.getByTestId('eq-stage-substituted-wb3-npsha').textContent ?? '';
    expect(screen.getByTestId('eq-stage-result-wb3-npsha')).toBeTruthy();

    act(() => {
      dispatchWorkbenchMutation({ targetWorkbench: 'wb3-hydraulics', params: { pSuctionPsig: 20 } });
    });
    const after = screen.getByTestId('eq-stage-substituted-wb3-npsha').textContent ?? '';
    expect(after).not.toBe(before);
    expect(after).toContain('239.2'); // 20 psig + 14.696 psia = 34.70 psia = 239.2 kPa substituted live
  });

  it('mission-pump-npsha presets the cavitation trap and auto-completes on rescue', async () => {
    render(<App />);
    fireEvent.click(screen.getByTestId('mission-pump-npsha'));

    await waitFor(() => {
      const metrics = getClientAppState().payload.metrics as Record<string, unknown>;
      expect(metrics.isCavitating).toBe(true);
    });
    expect(screen.getByTestId('mission-checklist-banner')).toBeTruthy();

    fireEvent.click(screen.getByTestId('mission-autofix-btn'));
    await waitFor(() => {
      const metrics = getClientAppState().payload.metrics as Record<string, unknown>;
      expect(metrics.isCavitating).toBe(false);
      expect(Number(metrics.npshAvailableM)).toBeGreaterThanOrEqual(5);
    });
    await waitFor(() => {
      expect(screen.getByTestId('mission-checklist-banner').textContent).toContain('Mission Solved');
    });
  });

  it('WB2 renders the interactive DIPPR phase envelope and compound mutations reach the payload', () => {
    render(<App />);
    fireEvent.click(screen.getByTestId('tab-wb2-thermo-dippr'));

    expect(screen.getByTestId('dippr-phase-envelope-svg')).toBeTruthy();
    expect(screen.getByTestId('dippr-phase-badge').textContent).toContain('Table 2-8, p. 2-53');

    act(() => {
      dispatchWorkbenchMutation({ targetWorkbench: 'wb2-thermo-dippr', params: { compound: 'ethanol' } });
    });
    expect((getClientAppState().payload.inputs as Record<string, unknown>).compound).toBe('ethanol');
  });

  it('copilot natural-language What-If scrubs WB3 sliders and renders the mutation pill', async () => {
    render(<App />);
    fireEvent.click(screen.getByTestId('tab-wb3-hydraulics'));

    fireEvent.change(screen.getByLabelText("Ask ChemEng's Agent"), {
      target: { value: 'Set pipe diameter to 6 in and suction pressure to 15 psig to stop cavitation' },
    });
    fireEvent.click(screen.getByText('Send'));

    await waitFor(() => {
      expect(screen.getByTestId('copilot-mutation-pill')).toBeTruthy();
    });
    await waitFor(() => {
      const inputs = getClientAppState().payload.inputs as Record<string, unknown>;
      expect(inputs.npsInch).toBe(6);
      expect(inputs.pSuctionPsig).toBe(15);
    });
  });

  it('live QA/QC CalcSheetPreviewModal reflects the scrubbed WB3 parameters and Perry citations', () => {
    render(<App />);
    fireEvent.click(screen.getByTestId('tab-wb3-hydraulics'));
    act(() => {
      dispatchWorkbenchMutation({ targetWorkbench: 'wb3-hydraulics', params: { flowGpm: 415 } });
    });
    fireEvent.click(screen.getByTestId('export-calc-sheet-btn'));

    const sheetText = screen.getByTestId('calc-sheet-modal').textContent ?? '';
    expect(sheetText).toContain('415');
    expect(sheetText).toContain("[Perry's 9th Ed., Sec. 10, pp. 10-24..25");
    expect(screen.getByTestId('copy-calc-sheet-md')).toBeTruthy();
  });
});
