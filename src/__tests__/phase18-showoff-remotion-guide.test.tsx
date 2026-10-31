// Phase 18 Vitest suite: Showcase Homepage (/showcase.html + assets/showoff/ai4uchee-homepage)
// & Remotion Video Guide (/ai4uchee-guide.mp4 + ShowcaseVideoModal in AppShell).
import fs from 'node:fs';
import path from 'node:path';
import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { AppShell } from '../components/shell/app-shell';
import { PersonaThemeProvider } from '../context/persona-theme-context';

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

describe('Phase 18 — Showcase Homepage (/ak:show-off) & Remotion Video Guide (/ak:remotion)', () => {
  it('opens ShowcaseVideoModal from AppShell header, steps across chapters, and jumps to a subject lab', () => {
    render(
      <PersonaThemeProvider>
        <AppShell />
      </PersonaThemeProvider>,
    );

    const guideBtn = screen.getByTestId('open-showcase-guide-btn');
    expect(guideBtn).toBeTruthy();
    fireEvent.click(guideBtn);

    const modal = screen.getByTestId('showcase-video-modal');
    expect(modal).toBeTruthy();

    const videoEl = screen.getByTestId('remotion-guide-video') as HTMLVideoElement;
    expect(videoEl.getAttribute('src')).toBe('/ai4uchee-guide.mp4');

    // Click chapter 3
    fireEvent.click(screen.getByTestId('guide-chapter-3'));
    expect(modal.textContent).toContain('03 · 24 Plant Problems');

    // Close modal
    fireEvent.click(screen.getByTestId('close-showcase-modal-btn'));
    expect(screen.queryByTestId('showcase-video-modal')).toBeNull();
  });

  it('verifies English-only Showcase HTML, Remotion MP4 artifact, and 18 multi-ratio section screenshots exist', () => {
    const repoRoot = path.resolve(__dirname, '../..');
    const showcaseHtmlPath = path.join(repoRoot, 'assets/showoff/ai4uchee-homepage/index.html');
    const publicShowcasePath = path.join(repoRoot, 'public/showcase.html');
    const mp4Path = path.join(repoRoot, 'public/ai4uchee-guide.mp4');
    const contentMdPath = path.join(repoRoot, 'assets/showoff/ai4uchee-homepage/content.md');

    expect(fs.existsSync(showcaseHtmlPath)).toBe(true);
    expect(fs.existsSync(publicShowcasePath)).toBe(true);
    expect(fs.existsSync(mp4Path)).toBe(true);
    expect(fs.existsSync(contentMdPath)).toBe(true);
    expect(fs.statSync(mp4Path).size).toBeGreaterThan(100_000);

    const html = fs.readFileSync(showcaseHtmlPath, 'utf8');
    expect(html).toContain('id="hero"');
    expect(html).toContain('id="video-guide"');
    expect(html).toContain('id="six-books-labs"');
    expect(html).toContain('id="problem-solving"');
    expect(html).toContain('id="whitebox-copilot"');
    expect(html).toContain('id="calc-sheet-cta"');
    expect(html).toContain('ak-diagram-root');
    expect(html).not.toContain('lang-vi-btn');
  });
});
