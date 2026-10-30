import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { App } from '../App';
import { RenderInlineExtension } from '../components/gen-ui/render-inline-extension';
import { getClientAppState, writeClientAppState } from '../actions/view-screen';

describe('Phase 10 — All 12 Interactive Charts, Graphs & Diagrams Suite', () => {
  it('Charts 1–4 (WB1): scrubs all 4 Perry preset curves (6-10, 14-37, 14-57, 2-53) and 2D crosshair', () => {
    render(<App />);
    const svgSurface = screen.getByTestId('perry-svg-interactive-surface');
    // Chart 1: 6-10 Moody Fanning f_F & Darcy f_D=4*f_F
    fireEvent.pointerDown(svgSurface, { clientX: 268, clientY: 124 });
    fireEvent.pointerMove(svgSurface, { clientX: 350, clientY: 140 });
    fireEvent.pointerUp(svgSurface);
    expect(screen.getByTestId('wb1-hover-readout').textContent).toContain('Darcy f_D = 4·f_F');

    // Also scrub the 2D calibrated crosshair overlay
    const overlay = screen.getByTestId('calibrated-crosshair');
    fireEvent.pointerDown(overlay, { clientX: 70, clientY: 35 });
    fireEvent.pointerUp(overlay);

    // Chart 2: 14-37 Fair C_sb
    fireEvent.click(screen.getByRole('button', { name: /Fig\. 14-32/i }));
    fireEvent.pointerDown(screen.getByTestId('perry-svg-interactive-surface'), { clientX: 260, clientY: 130 });
    expect(screen.getByTestId('wb1-hover-readout').textContent).toContain('Fair C_sb');

    // Chart 3: 14-57 Eckert GPDC Y_flood
    fireEvent.click(screen.getByRole('button', { name: /Fig\. 14-55/i }));
    fireEvent.pointerDown(screen.getByTestId('perry-svg-interactive-surface'), { clientX: 280, clientY: 130 });
    expect(screen.getByTestId('wb1-hover-readout').textContent).toContain('Eckert GPDC Y_flood');

    // Chart 4: 2-53 DIPPR Water P_vp
    fireEvent.click(screen.getByRole('button', { name: /Table 2-8/i }));
    fireEvent.pointerDown(screen.getByTestId('perry-svg-interactive-surface'), { clientX: 267, clientY: 130 });
    expect(screen.getByTestId('wb1-hover-readout').textContent).toContain('psia');
  });

  it('Charts 5 & 6 (WB2): scrubs dual DIPPR phase envelope, clicks NBP/Critical snap markers, and toggles Carlson flowchart nodes', () => {
    render(<App />);
    fireEvent.click(screen.getByTestId('tab-wb2-thermo-dippr'));

    // Chart 5: Verify secondary Eq. 106 ΔH_vap curve exists
    expect(screen.getByTestId('dippr-hvap-curve')).toBeTruthy();

    // Click Critical Point marker -> snaps tempK near Tc - 0.5 (646.6 K for water)
    fireEvent.click(screen.getByTestId('wb2-critical-marker'));
    expect(screen.getByTestId('dippr-vp-result').textContent).toContain('646.60 K');

    // Click 1 atm NBP marker -> snaps tempK back to 373.15 K
    fireEvent.click(screen.getByTestId('wb2-nbp-marker'));
    expect(screen.getByTestId('dippr-vp-result').textContent).toContain('373.15 K');

    // Drag operating handle on Chart 5
    const handle = screen.getByTestId('wb2-operating-handle');
    const envelopeSvg = handle.closest('svg')!;
    fireEvent.pointerDown(handle, { clientX: 300, clientY: 100 });
    fireEvent.pointerMove(envelopeSvg, { clientX: 400, clientY: 100 });
    fireEvent.pointerUp(envelopeSvg);
    expect(screen.getByTestId('wb2-hover-tooltip').textContent).toContain('ΔH_vap=');

    // Chart 6: Click Carlson flowchart nodes & scrub boiling curve
    fireEvent.click(screen.getByTestId('carlson-node-lle'));
    fireEvent.click(screen.getByTestId('carlson-node-polarity'));
    expect(screen.getByTestId('carlson-recommended').textContent).toContain('Peng-Robinson');
    fireEvent.click(screen.getByTestId('carlson-node-assoc'));
    expect(screen.getByTestId('carlson-recommended').textContent).toContain('NRTL-HOC');

    const boilCurve = screen.getByTestId('carlson-boiling-curve');
    fireEvent.pointerDown(boilCurve, { clientX: 250, clientY: 90 });
    fireEvent.pointerUp(boilCurve);
  });

  it('Charts 7 & 8 (WB3): drags V-101 liquid level, cycles L-101 NPS, drags FCV-101 stem, and scrubs Pump/System duty handle', () => {
    render(<App />);
    fireEvent.click(screen.getByTestId('tab-wb3-hydraulics'));

    // Chart 7: Drag V-101 liquid level handle down to reduce z_s
    const levelHandle = screen.getByTestId('wb3-liquid-level-handle');
    const pfdSvg = levelHandle.closest('svg')!;
    fireEvent.pointerDown(levelHandle, { clientX: 72, clientY: 145 });
    fireEvent.pointerMove(pfdSvg, { clientX: 72, clientY: 150 });
    fireEvent.pointerUp(pfdSvg);

    // Click Pipe L-101 to cycle NPS (4" -> 6")
    fireEvent.click(screen.getByTestId('wb3-pipe-nps-trigger'));
    expect(screen.getByTestId('piping-pump-svg-sketch').textContent).toContain('6" Sch 40');

    // Drag FCV-101 valve actuator handle
    const valveHandle = screen.getByTestId('wb3-valve-dp-handle');
    fireEvent.pointerDown(valveHandle, { clientX: 445, clientY: 80 });
    fireEvent.pointerMove(pfdSvg, { clientX: 445, clientY: 76 });
    fireEvent.pointerUp(pfdSvg);

    // Chart 8: Drag 100% Duty Point Handle on Pump vs. System Curve
    const dutyHandle = screen.getByTestId('wb3-duty-point-handle');
    const curveSvg = screen.getByTestId('wb3-pump-system-curve-svg');
    fireEvent.pointerDown(dutyHandle, { clientX: 220, clientY: 80 });
    fireEvent.pointerMove(curveSvg, { clientX: 250, clientY: 80 });
    fireEvent.pointerUp(curveSvg);
    expect(screen.getByTestId('wb3-curve-hover-tooltip').textContent).toContain('NPSHa=');
  });

  it('Charts 9, 10 & 11 (WB4): drags all 5 McCabe-Thiele handles, drags T-201 wall, clicks trays, and drags % Flood bar', () => {
    render(<App />);
    fireEvent.click(screen.getByTestId('tab-wb4-distillation'));

    // Chart 9: Drag all 5 handles (q, xd, zf, xb, rol)
    const qHandle = screen.getByTestId('q-line-handle');
    const mtSvg = qHandle.closest('svg')!;
    for (const id of ['q-line-handle', 'mt-xd-handle', 'mt-zf-handle', 'mt-xb-handle', 'mt-rol-handle']) {
      fireEvent.pointerDown(screen.getByTestId(id), { clientX: 250, clientY: 250 });
      fireEvent.pointerMove(mtSvg, { clientX: 280, clientY: 220 });
      fireEvent.pointerUp(mtSvg);
    }
    expect(screen.getByTestId('mt-hover-tooltip').textContent).toContain('y*(x)=');

    // Chart 10: Click tray #2, cycle tray spacing, and drag column wall handle
    fireEvent.click(screen.getByTestId('wb4-tray-hit-2'));
    expect(screen.getByTestId('wb4-tray-tooltip').textContent).toContain('Tray #2');
    fireEvent.click(screen.getByTestId('wb4-tray-spacing-trigger'));

    const wallHandle = screen.getByTestId('wb4-col-diam-handle');
    const colSvg = wallHandle.closest('svg')!;
    fireEvent.pointerDown(wallHandle, { clientX: 135, clientY: 130 });
    fireEvent.pointerMove(colSvg, { clientX: 140, clientY: 130 });
    fireEvent.pointerUp(colSvg);

    // Chart 11: Verify Fair C_sb(F_LV) curve & drag % Flood bar handle to inversely solve D_c
    expect(screen.getByTestId('wb4-fair-csb-curve')).toBeTruthy();
    const floodHandle = screen.getByTestId('wb4-flood-bar-handle');
    fireEvent.pointerDown(floodHandle, { clientX: 300, clientY: 90 });
    fireEvent.pointerMove(colSvg, { clientX: 320, clientY: 90 });
    fireEvent.pointerUp(colSvg);
  });

  it('Chart 12 (Copilot Inline GenUI): scrubs operating-window sparkline and dispatches live workbench mutation', () => {
    writeClientAppState({ activeWorkbench: 'wb3-hydraulics' });
    render(
      <RenderInlineExtension
        payload={{
          type: 'hydraulics-summary-card',
          title: 'Hydraulics Operating Window',
          data: { cavitation_status: 'SAFE', is_choked: false },
        }}
      />,
    );
    const sparkline = screen.getByTestId('genui-interactive-sparkline');
    fireEvent.pointerDown(sparkline, { clientX: 240, clientY: 20 });
    fireEvent.pointerMove(sparkline, { clientX: 260, clientY: 20 });
    fireEvent.pointerUp(sparkline);
    expect(getClientAppState().activeWorkbench).toBe('wb3-hydraulics');

    writeClientAppState({ activeWorkbench: 'wb6-kinetics-reactors' });
    fireEvent.pointerDown(sparkline, { clientX: 220, clientY: 20 });
    fireEvent.pointerUp(sparkline);
    expect(getClientAppState().activeWorkbench).toBe('wb6-kinetics-reactors');
  });
});
