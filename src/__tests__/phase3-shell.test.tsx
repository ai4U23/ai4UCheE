// Phase 3 Vitest suite: Dual-Lens toggle, Theme toggle (#FBF6EC vs #071A33), ai4U logo,
// useAgentSelectable chip attachment (`agent-select:`), and `<current-screen>` sync.
import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { getClientAppState, serializeCurrentScreenTag } from '../actions/view-screen';
import { AppShell } from '../components/shell/app-shell';
import { ScrubbableNumberInput } from '../components/ui/scrubbable-number-input';
import { PersonaThemeProvider } from '../context/persona-theme-context';

// Guard ResizeObserver for motion/react layout measurements in jsdom.
if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
}

afterEach(() => {
  cleanup();
});

describe('Phase 3 — Agent-Native Shell, Dual-Lens & Point-and-Ask', () => {
  it('toggles Dual-Lens between Plant and Learn modes and syncs <current-screen>', () => {
    render(
      <PersonaThemeProvider initialPersona="plant" initialTheme="paper">
        <AppShell />
      </PersonaThemeProvider>,
    );

    expect(document.documentElement.getAttribute('data-persona')).toBe('plant');
    fireEvent.click(screen.getByTestId('persona-learn'));
    expect(document.documentElement.getAttribute('data-persona')).toBe('learn');
    expect(getClientAppState().personaMode).toBe('learn');
    expect(serializeCurrentScreenTag()).toContain('personaMode="learn"');
  });

  it('locks theme to Institutional Ivory (#FBF6EC paper) without a dark-mode toggle and renders ai4U logo', () => {
    render(
      <PersonaThemeProvider>
        <AppShell />
      </PersonaThemeProvider>,
    );

    const logo = screen.getByTestId('ai4u-logo') as HTMLImageElement;
    expect(logo).toBeTruthy();
    expect(logo.getAttribute('src')).toBe('/ai4u-logo.png');

    expect(document.documentElement.getAttribute('data-theme')).toBe('paper');
    expect(screen.queryByTestId('theme-toggle')).toBeNull();
    expect(serializeCurrentScreenTag()).toContain('themeMode="paper"');
  });

  it('attaches agent-select:<kind>:<id> chips via useAgentSelectable and ScrubbableNumberInput', () => {
    let val = 250;
    render(
      <PersonaThemeProvider>
        <ScrubbableNumberInput
          paramId="flow-gpm"
          label="Volumetric Flow"
          value={val}
          unit="gpm"
          step={5}
          onChange={(next) => {
            val = next;
          }}
        />
        <AppShell />
      </PersonaThemeProvider>,
    );

    fireEvent.click(screen.getByLabelText('Inspect Volumetric Flow'));
    expect(screen.getByTestId('chip-agent-select:input:flow-gpm')).toBeTruthy();
    expect(serializeCurrentScreenTag()).toContain('agent-select:input:flow-gpm');

    // Also click the WB1 figure stage to attach figure:perry-crop
    const figStage = document.querySelector('[data-agent-select="figure:perry-crop"]')!;
    fireEvent.click(figStage);
    expect(serializeCurrentScreenTag()).toContain('agent-select:figure:perry-crop');
  });

  it('switches across WB1..WB4 tabs and updates <current-screen> workbench attribute', () => {
    render(
      <PersonaThemeProvider>
        <AppShell />
      </PersonaThemeProvider>,
    );

    fireEvent.click(screen.getByTestId('tab-wb3-hydraulics'));
    expect(getClientAppState().activeWorkbench).toBe('wb3-hydraulics');
    expect(serializeCurrentScreenTag()).toContain('workbench="wb3-hydraulics"');
  });
});
