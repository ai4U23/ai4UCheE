// Phase 7 End-to-End Integration Suite:
// - Switching across WB1..WB4 updates <current-screen> via writeClientAppState
// - Clicking selectable equations/equipment attaches agent-select:<kind>:<id> chips
// - Calling agentNative.ui.output({ type: 'calc-sheet-card', ... }) mounts inline GenUI card
// - Compiling a Senior-Engineer Calculation Sheet populates QA/QC header and persists to SQLite saved_calculations.
import fs from 'node:fs';
import path from 'node:path';
import React from 'react';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { App } from '../App';
import { agentNative } from '../actions/define-action';
import { generateCalcSheetAction, setCalcSheetPersister } from '../actions/generate-calc-sheet';
import { getClientAppState, serializeCurrentScreenTag } from '../actions/view-screen';
import { closeDb, getConn } from '../db/client';
import { createApiServer } from '../server/api-server';

if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
}

let apiApp: ReturnType<typeof createApiServer>;

beforeAll(() => {
  apiApp = createApiServer(':memory:');
});

afterEach(() => {
  cleanup();
  agentNative.ui.clearHistory();
});

afterAll(() => {
  setCalcSheetPersister(null);
  closeDb();
});

describe('Phase 7 — End-to-End Workbench Integration, GenUI & SQLite Calc Sheet Export', () => {
  it('switches across WB1, WB2, WB3, and WB4 and syncs <current-screen>', () => {
    render(<App />);

    expect(screen.getByTestId('wb1-visual-verifier')).toBeTruthy();
    expect(getClientAppState().activeWorkbench).toBe('wb1-visual-verifier');

    fireEvent.click(screen.getByTestId('tab-wb2-thermo-dippr'));
    expect(screen.getByTestId('wb2-thermo-dippr')).toBeTruthy();
    expect(serializeCurrentScreenTag()).toContain('workbench="wb2-thermo-dippr"');

    fireEvent.click(screen.getByTestId('tab-wb3-hydraulics'));
    expect(screen.getByTestId('wb3-hydraulics')).toBeTruthy();
    expect(serializeCurrentScreenTag()).toContain('workbench="wb3-hydraulics"');

    fireEvent.click(screen.getByTestId('tab-wb4-distillation'));
    expect(screen.getByTestId('wb4-distillation')).toBeTruthy();
    expect(serializeCurrentScreenTag()).toContain('workbench="wb4-distillation"');
  });

  it('attaches agent-select:<kind>:<id> chips when clicking equations or equipment nodes', () => {
    render(<App />);

    fireEvent.click(screen.getByTestId('tab-wb3-hydraulics'));
    fireEvent.click(screen.getByTestId('darcy-fanning-banner'));
    expect(serializeCurrentScreenTag()).toContain('agent-select:equation:eq-6-38-fanning-darcy');

    fireEvent.click(screen.getByTestId('sketch-pump-node'));
    expect(serializeCurrentScreenTag()).toContain('agent-select:equipment:pump-P101');
  });

  it('mounts inline generative UI cards when agentNative.ui.output() is invoked', () => {
    render(<App />);

    act(() => {
      agentNative.ui.output({
        type: 'calc-sheet-card',
        title: 'Inline QA/QC Sheet Card',
        data: { equipmentTag: 'P-101A/B', revision: 'Rev 0 — Issued for Review' },
      });
    });

    expect(screen.getByTestId('genui-calc-sheet-card')).toBeTruthy();
    expect(screen.getByText(/Inline QA\/QC Sheet Card/)).toBeTruthy();
  });

  it('compiles a Senior-Engineer Calculation Sheet, renders QA/QC header, and saves to SQLite saved_calculations', async () => {
    render(<App />);

    fireEvent.click(screen.getByTestId('export-calc-sheet-btn'));
    expect(screen.getByTestId('calc-sheet-modal')).toBeTruthy();

    fireEvent.change(screen.getByLabelText('Equipment Tag'), { target: { value: 'T-201-DIST' } });
    fireEvent.click(screen.getByTestId('compile-calc-sheet-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('compiled-calc-sheet-output')).toBeTruthy();
    });

    expect(screen.getByTestId('calc-sheet-summary').textContent).toContain('T-201-DIST');
    expect(screen.getByTestId('genui-calc-sheet-card')).toBeTruthy();

    const rows = getConn()
      .prepare('SELECT equipment_tag, revision FROM saved_calculations WHERE equipment_tag = ?')
      .all('T-201-DIST') as Array<{ equipment_tag: string; revision: string }>;
    expect(rows.length).toBeGreaterThanOrEqual(1);
    expect(rows[0].revision).toContain('Rev 0');
  });

  it('converts WB2 temperature units (degC -> K) and pressure units (psig vs psia) and exposes WB1 crop trigger', async () => {
    render(<App />);
    expect(screen.getByTestId('load-pdf-crop-btn')).toBeTruthy();

    fireEvent.click(screen.getByTestId('tab-wb2-thermo-dippr'));
    fireEvent.change(screen.getByLabelText('Temperature unit'), { target: { value: 'degC' } });
    fireEvent.change(screen.getByLabelText('Temperature'), { target: { value: '100' } });
    fireEvent.change(screen.getByLabelText('Pressure unit'), { target: { value: 'psig' } });

    const vpText = screen.getByTestId('dippr-vp-result').textContent ?? '';
    expect(vpText).toContain('373.15 K');
    expect(vpText).toContain('101,325 Pa'); // 1 atm reference line — DIPPR 101 gives 101,261 Pa (0.06% correlation vs experimental)
    expect(vpText).toContain('-0.01 psig (14.69 psia)'); // true DIPPR 101 (Table 2-8, p. 2-53) supersedes the old anchored-correlation values

    let out: unknown;
    await act(async () => {
      out = await generateCalcSheetAction.run({ equipment_tag: 'E-102-HEX' });
    });
    expect((out as { record: { equipmentTag: string } }).record.equipmentTag).toBe('E-102-HEX');
  });

  it('disables Express x-powered-by header and enforces minmax(0, 1fr) mobile grid guards', () => {
    expect(apiApp.get('x-powered-by')).toBe(false);
    const themeCss = fs.readFileSync(path.resolve(__dirname, '../styles/theme-tokens.css'), 'utf8');
    expect(themeCss.indexOf('.wb-split')).toBeLessThan(themeCss.indexOf('.shell-workspace'));
    expect(themeCss).toContain('grid-template-columns: minmax(0, 1fr)');
    expect(themeCss).toContain('.app-shell > :not(.shell-header)');
  });
});
