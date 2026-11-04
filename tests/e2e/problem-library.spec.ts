// R4 T4a — Problem Library: 24 problems, tier counts 3+10+8+3, L2 filter narrows
// the grid and the count badge to 10 / 24.
import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/app', { waitUntil: 'domcontentloaded' });
  await page.getByTestId('toggle-problem-library-btn').click();
  await expect(page.getByTestId('problem-library-browser')).toBeVisible();
});

test('T4a — library holds all 24 problems across 4 tiers', async ({ page }) => {
  const badge = page.getByTestId('problem-library-count-badge');
  await expect(badge).toContainText('24');

  const cards = page.locator('[data-testid^="problem-card-"]');
  expect(await cards.count()).toBe(24);
});

test('T4a — tier pills advertise 3 / 10 / 8 / 3', async ({ page }) => {
  for (const [tier, count] of [
    ['L1', '(3)'],
    ['L2', '(10)'],
    ['L3', '(8)'],
    ['L4', '(3)'],
  ] as const) {
    await expect(page.getByTestId(`filter-tier-${tier}`)).toContainText(count);
  }
});

test('T4a — L2 filter narrows to 10 / 24 problems', async ({ page }) => {
  await page.getByTestId('filter-tier-L2').click();
  const badge = page.getByTestId('problem-library-count-badge');
  await expect(badge).toContainText('Showing 10 / 24');

  await page.getByTestId('filter-tier-all').click();
  await expect(badge).toContainText('Showing 24 / 24');
});
