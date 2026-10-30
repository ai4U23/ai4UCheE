// Phase 8 End-to-End UX & Co-Pilot Integration Suite:
// - Real KaTeX math (.katex) mounts inside katex-dippr-101/106 (WB2), katex-darcy-fanning (WB3), katex-fenske (WB4)
// - Guided Mission clicks switch to 🎓 Learn Mode, attach mission Point-and-Ask chips, and emit GenUI proof cards
// - Point-and-Ask chips show human-readable labels; 1-click starter prompts return Perry-cited agent replies
// - callGeminiGateway (POST /api/copilot) serves gemini-4-argon-low @ gateway.ai4u.now with Tier-1 deterministic fallback
import React from 'react';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { App } from '../App';
import { agentNative } from '../actions/define-action';
import { AppShell } from '../components/shell/app-shell';
import { ScrubbableNumberInput } from '../components/ui/scrubbable-number-input';
import { PersonaThemeProvider } from '../context/persona-theme-context';
import { callGeminiGateway } from '../server/copilot-route';

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

describe('Phase 8 — Sovereign Academic-Tactile UX & Two-Tier gemini-4-argon-low Co-Pilot', () => {
  it('mounts real KaTeX math (.katex) across WB2 DIPPR Eq. 101/106, WB3 Darcy-Fanning, and WB4 Fenske', () => {
    render(<App />);

    fireEvent.click(screen.getByTestId('tab-wb2-thermo-dippr'));
    expect(screen.getByTestId('wb2-thermo-dippr')).toBeTruthy();
    expect(screen.getByTestId('katex-dippr-101').querySelector('.katex')).toBeTruthy();
    expect(screen.getByTestId('katex-dippr-106').querySelector('.katex')).toBeTruthy();
    expect(screen.getByTestId('dippr-vp-result')).toBeTruthy();

    fireEvent.click(screen.getByTestId('tab-wb3-hydraulics'));
    expect(screen.getByTestId('darcy-fanning-banner').querySelector('.katex')).toBeTruthy();
    expect(screen.getByTestId('katex-darcy-fanning').querySelector('.katex')).toBeTruthy();

    fireEvent.click(screen.getByTestId('tab-wb4-distillation'));
    expect(screen.getByTestId('katex-fenske').querySelector('.katex')).toBeTruthy();
  });

  it('guided mission clicks switch to 🎓 Learn Mode, attach mission chips, and emit inline GenUI proof cards', async () => {
    render(<App />);

    expect(screen.queryByTestId('learn-callout-wb1')).toBeNull(); // 🏭 Plant Mode default: callouts hidden

    await act(async () => {
      fireEvent.click(screen.getByTestId('mission-fanning-trap'));
    });
    expect(screen.getByTestId('learn-callout-wb1')).toBeTruthy();
    expect(screen.getByTestId('chip-agent-select:figure:perry-crop')).toBeTruthy();
    expect(screen.getByTestId('composer-chip-tray').textContent).toContain("Perry's 6-10 visual crop");
    expect(screen.getAllByTestId('genui-equation-proof-card').length).toBeGreaterThan(0);

    await act(async () => {
      fireEvent.click(screen.getByTestId('mission-pump-npsha'));
    });
    expect(screen.getByTestId('learn-callout-wb3')).toBeTruthy();
    expect(screen.getByTestId('chip-agent-select:equipment:pump-P101')).toBeTruthy();
    expect(screen.getByTestId('composer-chip-tray').textContent).toContain('Centrifugal Pump P-101');
    expect(screen.getAllByTestId('genui-equation-proof-card').length).toBeGreaterThanOrEqual(2);
  });

  it('shows human-readable Point-and-Ask chip labels and 1-click starter prompts yield Perry-cited replies', async () => {
    render(
      <PersonaThemeProvider>
        <ScrubbableNumberInput
          paramId="flow-gpm"
          label="Volumetric Flow"
          value={250}
          unit="gpm"
          onChange={() => {}}
        />
        <AppShell />
      </PersonaThemeProvider>,
    );

    fireEvent.click(screen.getByLabelText('Inspect Volumetric Flow'));
    const chip = screen.getByTestId('chip-agent-select:input:flow-gpm');
    expect(chip.querySelector('.composer-chip-label')?.textContent).toContain('Volumetric Flow (gpm)');

    expect(screen.getByTestId('copilot-starter-prompts')).toBeTruthy();
    expect(screen.getAllByTestId(/starter-prompt-/).length).toBe(3);

    await act(async () => {
      fireEvent.click(screen.getByTestId('starter-prompt-0'));
    });
    await waitFor(() => {
      expect(screen.getAllByTestId('copilot-agent-message').length).toBeGreaterThan(0);
    });
    expect(screen.getAllByTestId('copilot-agent-message')[0].textContent).toContain("Perry's 9th Ed.");
    expect(screen.getByTestId('copilot-model-badge').textContent).toContain('gemini-4-argon-low');
  });

  it('callGeminiGateway serves model gemini-4-argon-low @ gateway.ai4u.now with deterministic Tier-1 fallback', async () => {
    const res = await callGeminiGateway({
      prompt: 'Why does Wilson fail for LLE?',
      activeWorkbench: 'wb2-thermo-dippr',
      personaMode: 'learn',
      selectedChips: [],
    });

    expect(res.model).toBe('gemini-4-argon-low');
    expect(res.gatewayUrl).toBe('https://gateway.ai4u.now');
    expect(res.reply).toContain('Wilson');
    expect(res.reply).toContain("Perry's 9th Ed.");
    expect(res.genUiCards.length).toBeGreaterThanOrEqual(1);
  });

  it('chip-tray Clear all empties every Point-and-Ask chip (mission chips included)', async () => {
    render(<App />);

    await act(async () => {
      fireEvent.click(screen.getByTestId('mission-fanning-trap'));
    });
    expect(screen.getByTestId('chip-agent-select:figure:perry-crop')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Clear all' }));
    expect(screen.queryByTestId('chip-agent-select:figure:perry-crop')).toBeNull();
    expect(screen.getByTestId('composer-chip-tray').textContent).toContain('Click any equation');
  });

  it('Live-Sync badge <current-screen> XML follows the payload bus (no stale WB1 payload on WB2)', async () => {
    render(<App />);

    fireEvent.click(screen.getByTestId('tab-wb2-thermo-dippr'));
    await act(async () => {}); // flush context write + WB2 payload sync effects

    const xml = screen.getByTestId('current-screen-badge').getAttribute('title') ?? '';
    expect(xml).toContain('workbench="wb2-thermo-dippr"');
    expect(xml).toContain('WB2 DIPPR');
  });

  it('WB2 temperature input shows a human unit symbol (°C), not the raw enum (degC)', () => {
    render(<App />);

    fireEvent.click(screen.getByTestId('tab-wb2-thermo-dippr'));
    fireEvent.change(screen.getByLabelText('Temperature unit'), { target: { value: 'degC' } });

    const unitLabel = screen
      .getByTestId('scrub-dippr-temp-k')
      .querySelector('.scrubbable-unit')?.textContent;
    expect(unitLabel).toBe('°C');
  });
});
