// R4 T4b + T6 + T8 + DEF-2 regression — launch Problem #2 (ethanol trap),
// verify mission banner + trap note + co-pilot chip, run the deterministic
// Auto-Fix rescue, and pin the mission-active layout at all 4 viewports.
// DEF-2 (2026-11-04): default-state overflow checks missed a flex collapse —
// geometry assertions here are the regression pin for the ea7e58 fix.
import { expect, test } from '@playwright/test';
import { launchProblem2, overflowX, rectsOf, VIEWPORTS } from './helpers';

test.beforeEach(async ({ page }) => {
  await launchProblem2(page);
});

test('T6 — mission banner shows the designed-trap warning', async ({ page }) => {
  await expect(page.getByTestId('mission-checklist-banner')).toBeVisible();
  await expect(page.getByTestId('mission-trap-note')).toContainText(/deliberately off-spec/i);
});

test('T8 — mission context chip auto-attaches to the co-pilot composer', async ({ page }) => {
  const tray = page.getByTestId('composer-chip-tray');
  await expect(tray).toBeVisible();
  await expect(tray).toContainText('V-101');
});

test('T4b — Auto-Fix rescue lands the deterministic water@373.15 K result', async ({ page }) => {
  await page.getByTestId('mission-autofix-btn').click();
  const result = page.getByTestId('dippr-vp-result');
  await expect(result).toContainText('Result at T = 373.15 K: 101,261 Pa', { timeout: 15_000 });
  await expect(result).toContainText('14.69 psia');
  await expect(page.getByTestId('student-mastery-badge')).toContainText(/%/);
});

test('DEF-2 regression — mission-active layout holds at all 4 viewports', async ({ page }) => {
  for (const [w, h] of VIEWPORTS) {
    await page.setViewportSize({ width: w, height: h });
    await page.waitForTimeout(350);

    const g = await rectsOf(page, {
      title: '.mission-banner-head strong',
      trap: '[data-testid="mission-trap-note"]',
    });
    // Title keeps a readable width floor (was 70px one-word-per-line in DEF-2)
    expect(g.title?.w ?? 0, `mission title width @${w}`).toBeGreaterThanOrEqual(w >= 768 ? 240 : 120);
    // Trap pill stays inside the viewport (right edge was 1506 > 1440 in DEF-2)
    expect(g.trap?.right ?? 9999, `trap right edge @${w}`).toBeLessThanOrEqual(w);
    expect(await overflowX(page), `overflowX @${w}`).toBeLessThanOrEqual(0);
  }
});
