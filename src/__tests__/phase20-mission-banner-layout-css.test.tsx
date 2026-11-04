// Phase 20 — R4 GUI-round regression pins (report plans/reports/browser-qa-r4/R4-report.md):
// DEF-2 mission-banner-head flex collapse (title squeezed to 70px, trap pill overflow x=1506)
// and OBS-1 showcase smooth-scroll (rAF stall in embedded panes; cf. 2026-10-31 behavior:'auto' lesson).
// CSS/layout cannot be computed in jsdom, so these are file-contract pins (same style as the
// c43beca vi-dom-translator liveness pin).
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const css = readFileSync(join(process.cwd(), 'src/styles/workbench-components.css'), 'utf8');
const showcase = readFileSync(join(process.cwd(), 'public/showcase.html'), 'utf8');
const showoffMirror = readFileSync(join(process.cwd(), 'assets/showoff/ai4uchee-homepage/index.html'), 'utf8');

describe('Phase 20 — mission banner layout & showcase scroll contracts', () => {
  it('mission-banner-head wraps and gives the title a 240px flex floor (DEF-2)', () => {
    const head = css.match(/\.mission-banner-head \{[^}]*\}/);
    expect(head).not.toBeNull();
    expect(head?.[0]).toContain('flex-wrap: wrap');
    const titleFloor = css.match(/\.mission-banner-head strong \{[^}]*\}/);
    expect(titleFloor).not.toBeNull();
    expect(titleFloor?.[0]).toContain('flex: 1 1 240px');
    expect(titleFloor?.[0]).toContain('min-width: 240px');
  });

  it('mission-pill may wrap long trap/nudge copy instead of overflowing (DEF-2)', () => {
    const pill = css.match(/\.mission-pill \{[^}]*\}/);
    expect(pill).not.toBeNull();
    expect(pill?.[0]).toContain('white-space: normal');
    expect(pill?.[0]).toContain('overflow-wrap: break-word');
    expect(pill?.[0]).toContain('max-width: 100%');
    expect(pill?.[0]).not.toContain('white-space: nowrap');
  });

  it('showcase html uses scroll-behavior auto outside the reduced-motion override (OBS-1)', () => {
    for (const [name, html] of [['showcase', showcase], ['showoff mirror', showoffMirror]] as const) {
      const htmlRule = html.match(/html \{ scroll-behavior: [a-z]+;[^}]*\}/);
      expect(htmlRule, name).not.toBeNull();
      expect(htmlRule?.[0]).toContain('scroll-behavior: auto');
      expect(htmlRule?.[0]).not.toContain('scroll-behavior: smooth');
    }
    // reduced-motion override stays intact
    expect(showcase).toContain('scroll-behavior: auto !important');
  });
});
