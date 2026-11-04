// R4 T3 + T10 — /app default state (Year 2 Thermo · Learn persona), Learn↔Plant
// toggle effects, and the DEFAULT-state overflow sweep at all 4 viewports.
// (Mission-active overflow lives in mission-solve.spec.ts — R4's lesson is that
// both states must be checked independently.)
import { expect, test } from '@playwright/test';
import { expectNoOverflowAtAllViewports } from './helpers';

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
