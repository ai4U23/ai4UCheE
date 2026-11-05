// R4 T3 + T10 — /app default state (Year 2 Thermo · Learn persona), Learn↔Plant
// toggle effects, and the DEFAULT-state overflow sweep at all 4 viewports.
// (Mission-active overflow lives in mission-solve.spec.ts — R4's lesson is that
// both states must be checked independently.)
import { expect, test } from '@playwright/test';
import { expectNoOverflowAtAllViewports, rectsOf } from './helpers';

test.beforeEach(async ({ page }) => {
  await page.goto('/app', { waitUntil: 'domcontentloaded' });
  await expect(page.getByTestId('app-shell')).toBeVisible();
});

test('T3 — default is Learn persona on Year 2 Thermo (WB2)', async ({ page }) => {
  await expect(page.getByTestId('persona-learn')).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByTestId('tab-wb2-thermo-dippr')).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByTestId('curriculum-stage-badge')).toBeVisible();
  await expect(page.getByTestId('curriculum-stage-badge')).toContainText('Year 2');
});

test('T3 — Plant persona hides curriculum card; Learn restores it', async ({ page }) => {
  await page.getByTestId('persona-plant').click();
  await expect(page.getByTestId('persona-plant')).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByTestId('persona-learn')).toHaveAttribute('aria-selected', 'false');
  await expect(page.getByTestId('curriculum-stage-badge')).toBeHidden();

  await page.getByTestId('persona-learn').click();
  await expect(page.getByTestId('curriculum-stage-badge')).toBeVisible();
});

test('T10 — default state: zero horizontal overflow at 4 viewports', async ({ page }) => {
  await expectNoOverflowAtAllViewports(page);
});

// DEF-1 regression (R6, 607f4f4): page-overflow checks cannot see INTRA-header
// collisions — the mission bar once spilled ±150px over the brand cluster and
// the EN/VI chips at 1280/1440 while page overflowX stayed 0. Assert the three
// header grid zones never intersect pairwise, at the widths where the 1-row
// posture is attempted (below 1560 the header stacks; same invariant holds).
test('T10b — DEF-1 regression: header zones pairwise disjoint at 1280/1440/1680', async ({ page }) => {
  const widths = [[1280, 900], [1440, 900], [1680, 900]] as const;
  for (const [w, h] of widths) {
    await page.setViewportSize({ width: w, height: h });
    await page.waitForTimeout(350);
    const zones = await rectsOf(page, {
      brand: '.shell-header > .brand-identity',
      mission: '.shell-header > [data-testid="guided-mission-bar"]',
      actions: '.shell-header > .wb-actions-row',
    });
    for (const [a, b] of [['brand', 'mission'], ['mission', 'actions'], ['brand', 'actions']] as const) {
      const ra = zones[a];
      const rb = zones[b];
      expect(ra, `${a} measured @${w}`).not.toBeNull();
      expect(rb, `${b} measured @${w}`).not.toBeNull();
      if (!ra || !rb) continue;
      const gap = 1; // subpixel tolerance
      const xOverlap = Math.min(ra.right, rb.right) - Math.max(ra.x, rb.x);
      const yOverlap = Math.min(ra.y + ra.h, rb.y + rb.h) - Math.max(ra.y, rb.y);
      const intersecting = xOverlap > gap && yOverlap > gap;
      expect(
        intersecting,
        `${a}×${b} rects intersect @${w} (${xOverlap}px × ${yOverlap}px)`
      ).toBe(false);
    }
  }
});
