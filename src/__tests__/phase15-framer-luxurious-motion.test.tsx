// Phase 15 — Framer "Luxurious Three" (bPWSkk20pwfxzXmKGtRh) Motion & Surface Choreography E2E Suite (< 200 LOC).
// Verifies:
// 1. Exact Framer MCP motion token exports (FRAMER_ENTRANCE_EASE, FRAMER_LAYOUT_SPRING, FRAMER_BOUNCE_SPRING, FRAMER_SWARM_PULSE_TRANSITION).
// 2. Ubiquitous shared-layout pill morphing (`layoutId` / `.framer-pill-glow`) across DiagramModeBar, WB1 presets, and WB5 clusters/sections.
// 3. Swarm Pulse (`swarm-pulse-dot`) live telemetry beacons in AppShell, AgentChatDrawer, HandbookAtlasWorkbench, MissionChecklistBanner, and CalcSheetPreviewModal.
// 4. Synchronous DOM unmount on workbench & diagram mode switching (enter-only FramerEntranceStage).
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { App } from '../App';
import {
  FRAMER_BOUNCE_SPRING,
  FRAMER_ENTRANCE_EASE,
  FRAMER_ENTRANCE_TRANSITION,
  FRAMER_LAYOUT_SPRING,
  FRAMER_SWARM_PULSE_TRANSITION,
  getFramerStaggerTransition,
} from '../lib/framer-motion-tokens';

afterEach(() => {
  cleanup();
});

describe('Phase 15 — Framer "Luxurious Three" Motion & Surface Choreography', () => {
  it('Test 1 (Framer MCP Token Fidelity): exports exact easing curves, 500/60/1 layout spring, 0.4s/0.2 bounce spring, and 1.4s mirror Swarm Pulse', () => {
    expect(FRAMER_ENTRANCE_EASE).toEqual([0.22, 1, 0.36, 1]);
    expect(FRAMER_ENTRANCE_TRANSITION).toMatchObject({
      type: 'tween',
      ease: [0.22, 1, 0.36, 1],
      duration: 0.65,
    });
    expect(FRAMER_LAYOUT_SPRING).toEqual({
      type: 'spring',
      stiffness: 500,
      damping: 60,
      mass: 1,
    });
    expect(FRAMER_BOUNCE_SPRING).toEqual({
      type: 'spring',
      duration: 0.4,
      bounce: 0.2,
    });
    expect(FRAMER_SWARM_PULSE_TRANSITION).toEqual({
      duration: 1.4,
      repeat: Infinity,
      repeatType: 'mirror',
      ease: [0.42, 0, 0.58, 1],
    });
    expect(getFramerStaggerTransition(0).delay).toBe(0);
    expect(getFramerStaggerTransition(1).delay).toBe(0.06);
    expect(getFramerStaggerTransition(2).delay).toBe(0.12);
  });

  it('Test 2 (Swarm Pulse Telemetry & Stage Entrances): renders SwarmPulseDot beacons and enter-only FramerEntranceStage with synchronous unmounts', () => {
    render(<App />);

    // Default workbench is wb1-visual-verifier wrapped in FramerEntranceStage
    expect(screen.getByTestId('stage-wb1-visual-verifier')).toBeTruthy();

    // SwarmPulseDot rendered in header dof-badge and Co-Pilot drawer badges
    const pulseDots = screen.getAllByTestId('swarm-pulse-dot');
    expect(pulseDots.length).toBeGreaterThanOrEqual(3);

    // Switch to WB2 Thermo: stage-wb1-visual-verifier unmounts synchronously (0ms exit hold) and stage-wb2-thermo-dippr mounts
    fireEvent.click(screen.getByTestId('tab-wb2-thermo-dippr'));
    expect(screen.queryByTestId('stage-wb1-visual-verifier')).toBeNull();
    expect(screen.getByTestId('stage-wb2-thermo-dippr')).toBeTruthy();

    // Switch WB2 diagram mode to Cycles & Equilibrium: VLE chart unmounts synchronously
    fireEvent.click(screen.getByTestId('wb2-mode-cycles-eq'));
    expect(screen.queryByTestId('wb2-vle-txy-svg')).toBeNull();
    expect(screen.getByTestId('wb2-rankine-rxn-svg')).toBeTruthy();
  });

  it('Test 3 (Ubiquitous MotionPillButton & FramerModalShell): renders shared-layout pills across WB1 presets, WB5 clusters/sections, and animates CalcSheetPreviewModal', () => {
    render(<App />);

    // Default WB1 Visual Verifier utility is active on initial mount
    expect(screen.getByTestId('stage-wb1-visual-verifier')).toBeTruthy();
    const presetBtn = screen.getByTestId('wb1-preset-6-10');
    expect(presetBtn.className).toContain('active');
    expect(presetBtn.querySelector('.framer-pill-glow')).toBeTruthy();

    // Switch to WB5 25-Section Atlas and verify cluster + section shared-layout pills
    fireEvent.click(screen.getByTestId('tab-wb5-handbook-atlas'));
    const clusterAll = screen.getByTestId('atlas-cluster-all');
    expect(clusterAll.className).toContain('active');
    expect(clusterAll.querySelector('.framer-pill-glow')).toBeTruthy();

    const sec11Pill = screen.getByTestId('atlas-sec-pill-11');
    fireEvent.click(sec11Pill);
    expect(sec11Pill.className).toContain('active');
    expect(sec11Pill.querySelector('.framer-pill-glow')).toBeTruthy();

    // Open Senior Calc Sheet Modal (FramerModalShell + SwarmPulseDot inside safety badge) and close synchronously
    fireEvent.click(screen.getByTestId('export-calc-sheet-btn'));
    const modal = screen.getByTestId('calc-sheet-modal');
    expect(modal).toBeTruthy();
    const safetyBadge = screen.getByTestId('calc-sheet-safety-badge');
    expect(safetyBadge.querySelector('.swarm-pulse-dot')).toBeTruthy();

    fireEvent.click(screen.getByTestId('close-calc-sheet-modal'));
    expect(screen.queryByTestId('calc-sheet-modal')).toBeNull();
  });
});
