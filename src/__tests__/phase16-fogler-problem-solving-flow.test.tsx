// Phase 16 — Fogler & LeBlanc (2008) 6-Stage Real-Life Creative Problem-Solving Flow & AI Collaborator Suite.
// Verifies:
// 1. Problem-first app structure (`GuidedMissionBar` above `Engineering Subject Workbenches`) & "Why You Learn This Subject" across all 6 workbenches.
// 2. 6-Stage Fogler & LeBlanc walkthrough: 1. Problem Observation -> 2. Problem Definition (K-T IS/IS NOT) -> 3. Fundamental Theory -> 4. Applicable Handbook -> 5. Hypotheses (Prove/Disprove, Rule #12) -> 6. Actual Solution.
// 3. White-Box Equation Card Stage 3 Theory & Stage 4 Handbook confirmation button (`cite-theory-*`).
// 4. Interactive Hypothesis Prove/Disprove Studio + AI Agent collaboration (`collaborate-ai-hypothesis-btn`, `hyp-ask-agent-*`) + Senior QA/QC Calc Sheet audit section.
import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { App } from '../App';
import { askPerryCopilot } from '../actions/copilot-responder';
import { getClientAppState } from '../actions/view-screen';
import { buildLiveCalcSheet } from '../components/workbenches/calc-sheet-builder';
import { FOGLER_PROBLEM_CASES, getFoglerCaseForWorkbench } from '../lib/fogler-problem-solving-catalog';
import {
  evaluateHypothesisItem,
  evaluateSixStageProgress,
  recordHypothesisVerdict,
  resetProblemSolvingStore,
} from '../lib/hypothesis-verification-engine';
import { resetStudentProfile } from '../lib/student-adaptive-model';

describe('Phase 16 — Fogler & LeBlanc 6-Stage Real-Life Problem-Solving Flow & AI Agent Collaboration', () => {
  beforeEach(() => {
    resetStudentProfile('default-student');
    resetProblemSolvingStore();
  });

  it('Test 1 (Catalog & Problem-First Hierarchy): defines 6-stage Fogler cases for all 6 workbenches and renders Problem-First bar above Subject tabs', () => {
    const workbenches = [
      'wb1-visual-verifier',
      'wb2-thermo-dippr',
      'wb3-hydraulics',
      'wb4-distillation',
      'wb6-kinetics-reactors',
      'wb5-handbook-atlas',
    ] as const;

    for (const wb of workbenches) {
      const c = getFoglerCaseForWorkbench(wb);
      expect(c.workbenchId).toBe(wb);
      expect(c.whyLearnSubject).toMatch(/Why learn/i);
      expect(c.telemetryRows.length).toBeGreaterThanOrEqual(2);
      expect(c.ktDefinition.realProblemDefined.length).toBeGreaterThan(10);
      expect(c.hypotheses.some((h) => h.isRootCause)).toBe(true);
      expect(c.hypotheses.some((h) => !h.isRootCause)).toBe(true);
      expect(c.foglerBookCitation).toContain('Fogler & LeBlanc 2nd Ed.');
    }
    expect(Object.keys(FOGLER_PROBLEM_CASES)).toHaveLength(6);

    render(<App initialPersona="learn" />);
    const missionBar = screen.getByTestId('guided-mission-bar');
    const subjectTabs = screen.getByRole('tablist', { name: /Engineering Subject Workbenches/i });
    // Verify Problem-First DOM order: GuidedMissionBar precedes the 5 Subject tabs
    expect(missionBar.compareDocumentPosition(subjectTabs) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(missionBar.textContent).toContain('Start from a Real-Life Plant Problem (Fogler & LeBlanc 6-Stage Flow)');
  });

  it('Test 2 (6-Stage Stepper, Hypothesis Prove/Disprove & Rule #12 Falsification): walks through all 6 stages on Pump P-101 Cavitation & Boiler Feedwater Heater', async () => {
    render(<App initialPersona="learn" />);

    fireEvent.click(screen.getByTestId('mission-pump-npsha'));
    const banner = await screen.findByTestId('mission-checklist-banner');
    expect(banner.textContent).toContain('Stage 1 · Problem Observation');
    expect(banner.textContent).toContain('Stage 2 · Problem Definition (K-T IS / IS NOT & Real Problem)');
    expect(banner.textContent).toContain('Stage 3 · Fundamental Theory');
    expect(banner.textContent).toContain('Stage 4 · Applicable Handbook');
    expect(banner.textContent).toContain('Stage 5 · Hypotheses: Prove ✅ / Disprove ❌ (Rule #12)');
    expect(banner.textContent).toContain('Stage 6 · Actual Solution & Safe Operating Margin Verified');

    // Verify Hypothesis Studio renders K-T telemetry and Why Learn Subject
    expect(screen.getByTestId('why-learn-subject-banner').textContent).toContain('Why learn Fluid Mechanics & Transport');
    expect(screen.getByTestId('kt-problem-definition-box').textContent).toContain('Eliminate liquid flashing at the pump eye');

    // Test Rule #12: falsely proving decoy H1 triggers Rule #12 falsification alert
    fireEvent.click(screen.getByTestId('hyp-prove-wb3-h1'));
    expect(screen.getByTestId('hyp-verdict-wb3-h1').textContent).toContain('Rule #12 Check');

    // Now correctly disprove decoy H1, prove root-cause H2, and disprove Fogler Ch. 10 Boiler HX decoy H3
    fireEvent.click(screen.getByTestId('hyp-disprove-wb3-h1'));
    expect(screen.getByTestId('hyp-verdict-wb3-h1').textContent).toContain('DISPROVED ❌');

    fireEvent.click(screen.getByTestId('hyp-prove-wb3-h2'));
    expect(screen.getByTestId('hyp-verdict-wb3-h2').textContent).toContain('PROVED ✅');

    fireEvent.click(screen.getByTestId('hyp-disprove-wb3-h3'));
    expect(screen.getByTestId('hyp-verdict-wb3-h3').textContent).toContain('Fogler Ch. 10 p. 228');

    expect(screen.getByTestId('hypothesis-verified-badge').textContent).toContain('3/3');
  });

  it('Test 3 (WhiteBoxEquationCard Theory Citation & LearnModeCallout Studio): cites Stage 3 Theory directly from equation card and toggles studio in Learn Mode', () => {
    render(<App />);
    fireEvent.click(screen.getByTestId('persona-learn'));
    fireEvent.click(screen.getByTestId('tab-wb4-distillation'));

    // LearnModeCallout displays Why Learn Subject & opens 6-stage studio on click
    expect(screen.getByTestId('why-learn-callout-wb4').textContent).toContain('Why learn Separations (Subject 3)?');
    fireEvent.click(screen.getByTestId('open-6stage-board-wb4'));
    expect(screen.getByTestId('hypothesis-prove-disprove-board')).toBeTruthy();

    // Click "Cite as Stage 3 Theory & Handbook" on the Fenske white-box equation card
    const citeBtn = screen.getByTestId('cite-theory-wb4-fenske-underwood');
    fireEvent.click(citeBtn);
    expect(citeBtn.textContent).toContain('✓ Stage 3 Theory & Stage 4 Handbook Cited');

    const status = evaluateSixStageProgress('wb4-distillation');
    expect(status.stage3TheoryDone).toBe(true);
    expect(status.stage4HandbookDone).toBe(true);
  });

  it('Test 4 (AI Agent Hypothesis Collaboration & Senior QA/QC Calc Sheet Audit): collaborates with AI Agent to test hypotheses and exports 6-Stage Calc Sheet', async () => {
    render(<App initialPersona="learn" />);
    fireEvent.click(screen.getByTestId('mission-kinetics-runaway'));

    // Collaborate with AI Agent on Hypothesis H1 in WB6
    fireEvent.click(screen.getByTestId('hyp-ask-agent-wb6-h1'));
    await waitFor(() => {
      expect(screen.getByTestId('ai-collaborator-hypothesis-note').textContent).toContain(
        'Fogler & LeBlanc 6-Stage Collaborator',
      );
    });

    // Direct Co-Pilot call also includes Fogler & LeBlanc 6-Stage Collaborator line
    const copilotRes = await askPerryCopilot({
      prompt: 'Help me test our reactor runaway hypothesis',
      activeWorkbench: 'wb6-kinetics-reactors',
      personaMode: 'learn',
      selectedChips: [],
      payload: getClientAppState().payload,
    });
    expect(copilotRes.reply).toContain('Fogler & LeBlanc 6-Stage Collaborator');

    // Record verdicts and verify Senior QA/QC Calculation Sheet includes the 6-Stage Audit
    recordHypothesisVerdict('wb6-kinetics-reactors', 'wb6-h1', 'disproved');
    recordHypothesisVerdict('wb6-kinetics-reactors', 'wb6-h2', 'proved');
    expect(evaluateHypothesisItem('wb6-kinetics-reactors', 'wb6-h2').isCorrect).toBe(true);

    const sheet = buildLiveCalcSheet(getClientAppState());
    expect(sheet.markdownReport).toContain('## Fogler & LeBlanc 6-Stage Creative Problem-Solving & Hypothesis Audit');
    expect(sheet.markdownReport).toContain('Real Problem Defined');
    expect(sheet.markdownReport).toContain('ROOT CAUSE (Prove ✅)');
  });
});
