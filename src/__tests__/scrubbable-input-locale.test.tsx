// R5 OBS-1 regression: the scrubbable dial must render digits in the *app* locale (dot for EN,
// comma for VI) instead of the browser locale, accept both separators on entry, and keep the
// explicit spinbutton ARIA role that native type="number" used to provide.
import React from 'react';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { ScrubbableNumberInput } from '../components/ui/scrubbable-number-input';
import { PersonaThemeProvider } from '../context/persona-theme-context';
import { resetLocaleForTests, setActiveLocale } from '../lib/i18n/locale-types';

afterEach(() => {
  cleanup();
  resetLocaleForTests('en');
});

const renderDial = (onChange: (v: number) => void) =>
  render(
    <PersonaThemeProvider>
      <ScrubbableNumberInput
        paramId="dippr-temp-k"
        label="Temperature"
        value={373.15}
        unit="K"
        min={200}
        max={700}
        step={1}
        onChange={onChange}
      />
    </PersonaThemeProvider>,
  );

describe('ScrubbableNumberInput locale discipline (OBS-1 regression)', () => {
  it('renders dot decimals under the EN app locale with spinbutton semantics', () => {
    resetLocaleForTests('en');
    renderDial(() => {});
    const box = screen.getByRole('spinbutton', { name: 'Temperature' }) as HTMLInputElement;
    expect(box.value).toBe('373.15');
    expect(box.getAttribute('aria-valuenow')).toBe('373.15');
    expect(box.getAttribute('aria-valuetext')).toBe('373.15 K');
  });

  it('re-renders comma decimals when the app locale switches to VI', () => {
    resetLocaleForTests('en');
    renderDial(() => {});
    const box = screen.getByRole('spinbutton', { name: 'Temperature' }) as HTMLInputElement;
    expect(box.value).toBe('373.15');
    act(() => setActiveLocale('vi', { persist: false }));
    expect(box.value).toBe('373,15');
    act(() => setActiveLocale('en', { persist: false }));
    expect(box.value).toBe('373.15');
  });

  it('accepts comma decimal entry under EN (platform-tolerant) and emits the numeric value', () => {
    resetLocaleForTests('en');
    let next: number | null = null;
    renderDial((v) => {
      next = v;
    });
    const box = screen.getByRole('spinbutton', { name: 'Temperature' }) as HTMLInputElement;
    fireEvent.focus(box);
    fireEvent.change(box, { target: { value: '351,5' } });
    expect(next).toBeCloseTo(351.5, 6);
    fireEvent.change(box, { target: { value: '350.25' } });
    expect(next).toBeCloseTo(350.25, 6);
  });

  it('keeps garbage drafts editable without clobbering the committed value on blur', () => {
    resetLocaleForTests('en');
    renderDial(() => {});
    const box = screen.getByRole('spinbutton', { name: 'Temperature' }) as HTMLInputElement;
    fireEvent.focus(box);
    fireEvent.change(box, { target: { value: '35x' } });
    expect(box.value).toBe('35x');
    fireEvent.blur(box);
    expect(box.value).toBe('373.15');
  });
});
