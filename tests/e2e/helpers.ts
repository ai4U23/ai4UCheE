// Shared E2E helpers — encodes the browser quirks learned in rounds R1–R4:
//  • Geometry truth = evaluate + getBoundingClientRect, batched in one round-trip
//    (never trust DOM dumps / tiled screenshots for rect claims).
//  • No smooth-scroll assumptions anywhere (repo lesson 2026-10-31: rAF stalls
//    in occluded panes; showcase pinned to scroll-behavior auto in ea7e58).
//  • Overflow must be checked in BOTH default and mission-active app states —
//    the default-only check is exactly what let DEF-2 slip through in R4.
import { expect, type Page } from '@playwright/test';

export const VIEWPORTS: Array<[number, number]> = [
  [1440, 900], // desktop
  [768, 1024], // tablet
  [375, 812], // mobile
  [320, 812], // mobile reflow floor
];

export type Rect = { x: number; y: number; w: number; h: number; right: number };
export type Geometry = Record<string, Rect | null>;

/** Batch-measure element rects inside the page (one evaluate round-trip). */
export function rectsOf(page: Page, map: Record<string, string>): Promise<Geometry> {
  return page.evaluate((entries) => {
    const out: Geometry = {};
    for (const [key, selector] of Object.entries(entries)) {
      const el = document.querySelector(selector);
      const r = el?.getBoundingClientRect();
      out[key] = r
        ? {
            x: Math.round(r.x),
            y: Math.round(r.y),
            w: Math.round(r.width),
            h: Math.round(r.height),
            right: Math.round(r.right),
          }
        : null;
    }
    return out;
  }, map);
}

/** Horizontal overflow in px (0 = none). Negative = scrollbar-gutter slack. */
export function overflowX(page: Page): Promise<number> {
  return page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
}

/** Sweep all 4 canonical viewports; assert zero horizontal overflow each time. */
export async function expectNoOverflowAtAllViewports(page: Page, settleMs = 350) {
  for (const [w, h] of VIEWPORTS) {
    await page.setViewportSize({ width: w, height: h });
    await page.waitForTimeout(settleMs);
    const overflow = await overflowX(page);
    expect(overflow, `overflowX @${w}x${h}`).toBeLessThanOrEqual(0);
  }
}

/** R4 T4b launch path (proved deterministic): /app → library → Solve Problem #2. */
export async function launchProblem2(page: Page) {
  await page.goto('/app', { waitUntil: 'domcontentloaded' });
  await page.getByTestId('toggle-problem-library-btn').click();
  // Exact testid, NOT accessible-name — "Solve Problem #2" substring-matches #20–#24.
  await page.getByTestId('launch-prob-02-subcooled-jacket-boil').click();
  await expect(page.getByTestId('mission-checklist-banner')).toBeVisible();
  await page.waitForTimeout(300); // co-pilot chip attach lands right after the banner
}

/** Subject tabs live behind the Labs dropdown — open it before clicking tab-*. */
export async function openLabsDrawer(page: Page) {
  const toggle = page.getByTestId('toggle-lab-switcher-btn');
  await toggle.click();
  await expect(page.getByRole('tablist', { name: 'Engineering Subject Workbenches' })).toBeVisible();
}

/** Toggle app locale via the shell pill; returns the now-active locale code. */
export async function toggleLocale(page: Page): Promise<'en' | 'vi'> {
  const stored = await page.evaluate(() => localStorage.getItem('ai4uchee_locale'));
  const target = stored === 'vi' ? 'en' : 'vi';
  await page.getByTestId('locale-toggle').getByText(target.toUpperCase(), { exact: true }).click();
  await page.waitForTimeout(250); // vi-dom-translator sweeps async
  return target;
}
