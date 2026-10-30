// Phase 15 Adaptive AI Tutoring, Per-Student Scorecard & Personalized Recommendation Suite:
// - Instant Browser Scorecard (`localStorage` + Student Name Switcher)
// - DIY slider solve (+0.35 mastery) vs. Auto-Fix (+0.12 assisted mastery) + Socratic Hint button
// - Debounced continuous slider trap detection (`settleMs = 600` guard against false-positive transient scrubs)
// - 3-tier AI Co-Pilot scaffolding (`guided` | `socratic` | `challenge`), live anomaly fallback, and `<student-profile>` XML
import React from 'react';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from '../App';
import { runCopilotResponder } from '../actions/copilot-responder';
import { agentNative } from '../actions/define-action';
import { dispatchWorkbenchMutation, getClientAppState } from '../actions/view-screen';
import { buildAdaptiveRecommendations } from '../lib/adaptive-recommendation-engine';
import {
  getStudentProfile,
  recordMissionOutcome,
  recordPayloadObservation,
  resetStudentProfile,
  setScaffoldingOverride,
  switchStudentProfile,
} from '../lib/student-adaptive-model';
import { callGeminiGateway } from '../server/copilot-route';

if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
}

beforeEach(() => {
  resetStudentProfile();
});

afterEach(() => {
  cleanup();
  agentNative.ui.clearHistory();
  resetStudentProfile();
});

describe('Phase 15 — Adaptive Student Scorecard, 3-Tier Socratic Co-Pilot & Recommendation Engine', () => {
  it('supports instant Student Name switching and independent scorecard persistence', () => {
    const alex = getStudentProfile();
    expect(alex.studentId).toBe('alex');
    recordMissionOutcome('mission-fanning-trap', false); // +0.35 -> 0.75 on chart-fanning-darcy
    expect(getStudentProfile().conceptMastery['chart-fanning-darcy']).toBe(0.75);

    const maya = switchStudentProfile('Maya (ChE Sr.)');
    expect(maya.studentId).toContain('maya');
    expect(maya.conceptMastery['chart-fanning-darcy']).toBe(0.4); // fresh profile for Maya

    const backToAlex = switchStudentProfile('alex');
    expect(backToAlex.conceptMastery['chart-fanning-darcy']).toBe(0.75);
    expect(backToAlex.solvedMissionIds).toContain('mission-fanning-trap');
  });

  it('awards +0.35 mastery for DIY solve vs. +0.12 for Auto-Fix and Debounces transient slider scrubs', () => {
    vi.useFakeTimers();
    try {
      // Transient scrub across unsafe -10 psig with settleMs = 600 should NOT log a trap immediately
      recordPayloadObservation(
        'wb3-hydraulics',
        { inputs: { pSuctionPsig: -10 }, metrics: { isCavitating: true } },
        600,
      );
      expect(getStudentProfile().trapCounts.npsha_cavitation_trap).toBe(0);

      // Before 600ms expires, student settles at safe +15 psig
      recordPayloadObservation(
        'wb3-hydraulics',
        { inputs: { pSuctionPsig: 15 }, metrics: { isCavitating: false } },
        600,
      );
      vi.advanceTimersByTime(650);
      expect(getStudentProfile().trapCounts.npsha_cavitation_trap).toBe(0);

      // Assisted Auto-Fix solve (+0.12) vs DIY solve (+0.35)
      recordMissionOutcome('mission-pump-npsha', true);
      expect(getStudentProfile().conceptMastery['hydraulics-npsha-choke']).toBe(0.52);
      expect(getStudentProfile().autoFixMissionIds).toContain('mission-pump-npsha');

      recordMissionOutcome('mission-boil-water', false);
      expect(getStudentProfile().conceptMastery['thermo-pressure-lle']).toBe(0.75);
      expect(getStudentProfile().autoFixMissionIds).not.toContain('mission-boil-water');
    } finally {
      vi.useRealTimers();
    }
  });

  it('adapts Tier-1 and Tier-2 Co-Pilot replies across Guided, Socratic, and Challenge modes with live anomaly diagnosis', async () => {
    const cavitatingPayload = {
      inputs: { flowGpm: 450, pSuctionPsig: -10, npshrM: 8 },
      metrics: { isCavitating: true, npshAvailableM: 4.18 },
    };

    const guidedRes = runCopilotResponder(
      {
        prompt: 'Help, what is wrong on my screen right now?',
        activeWorkbench: 'wb3-hydraulics',
        personaMode: 'learn',
        payload: cavitatingPayload,
        scaffoldingOverride: 'guided',
      },
      { emitUi: false },
    );
    expect(guidedRes.adaptiveMeta?.scaffoldingLevel).toBe('guided');
    expect(guidedRes.adaptiveMeta?.detectedTraps).toContain('npsha_cavitation_trap');
    expect(guidedRes.reply).toContain('Live Screen Trap Detected');
    expect(guidedRes.reply).toContain('Guided Step-by-Step');

    const socraticRes = runCopilotResponder(
      {
        prompt: 'Why is P-101 failing?',
        activeWorkbench: 'wb3-hydraulics',
        personaMode: 'learn',
        payload: cavitatingPayload,
        scaffoldingOverride: 'socratic',
      },
      { emitUi: false },
    );
    expect(socraticRes.adaptiveMeta?.scaffoldingLevel).toBe('socratic');
    expect(socraticRes.reply).toContain('Socratic Clue');
    expect(socraticRes.reply).toContain('14.696');

    const challengeGateway = await callGeminiGateway({
      prompt: 'Audit this hydraulic design',
      activeWorkbench: 'wb3-hydraulics',
      personaMode: 'learn',
      payload: cavitatingPayload,
      scaffoldingOverride: 'challenge',
    });
    expect(challengeGateway.adaptiveMeta?.scaffoldingLevel).toBe('challenge');
    expect(challengeGateway.adaptiveMeta?.studentProfileXml).toContain('scaffolding="challenge"');
    expect(challengeGateway.reply).toContain('Mastery Challenge');
  });

  it('renders AdaptiveRecommendationRail, Student Switcher, Socratic Hint button, and updates dynamic starter prompts', async () => {
    render(<App />);

    expect(screen.getByTestId('adaptive-recommendation-rail')).toBeTruthy();
    expect(screen.getByTestId('student-mastery-badge').textContent).toContain('Mastery: 40%');
    expect(screen.getAllByTestId('recommended-mission-badge').length).toBe(1);

    // Switch AI Coach mode to Socratic from the rail dropdown
    fireEvent.change(screen.getByTestId('scaffolding-level-select'), { target: { value: 'socratic' } });
    expect(getStudentProfile().scaffoldingOverride).toBe('socratic');

    // Launch pump cavitation mission -> verify Socratic Hint button & dynamic cavitation starter prompt
    fireEvent.click(screen.getByTestId('mission-pump-npsha'));
    await waitFor(() => {
      const metrics = getClientAppState().payload.metrics as Record<string, unknown>;
      expect(metrics.isCavitating).toBe(true);
    });
    expect(screen.getByTestId('mission-socratic-hint-btn')).toBeTruthy();
    fireEvent.click(screen.getByTestId('mission-socratic-hint-btn'));
    expect(screen.getAllByTestId('genui-equation-proof-card').length).toBeGreaterThanOrEqual(1);

    // Starter prompt 0 adapts to the live cavitation trap on WB3
    expect(screen.getByTestId('starter-prompt-0').textContent).toContain('Socratic Hint');

    // Solve manually via slider mutation -> mastery rises by +35%
    act(() => {
      setScaffoldingOverride('auto');
      dispatchWorkbenchMutation({
        targetWorkbench: 'wb3-hydraulics',
        params: { flowGpm: 260, pSuctionPsig: 15, npshrM: 3 },
      });
    });
    await waitFor(() => {
      expect(getStudentProfile().solvedMissionIds).toContain('mission-pump-npsha');
    });
    expect(getStudentProfile().conceptMastery['hydraulics-npsha-choke']).toBeGreaterThanOrEqual(0.75);
    const recs = buildAdaptiveRecommendations(getStudentProfile(), getClientAppState());
    expect(recs.primaryRecommendation.missionId).not.toBe('mission-pump-npsha');
  });
});
