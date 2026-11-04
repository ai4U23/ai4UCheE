// R4 T9 — Calc Sheet modal (open → compile → close) and the Page AX Share menu.
// Deliberately DOM-only: the SQLite export path needs the API server and stays
// out of this suite (run it via E2E_WITH_API manually if ever needed).
import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/app', { waitUntil: 'domcontentloaded' });
  await expect(page.getByTestId('app-shell')).toBeVisible();
});

test('T9 — calc sheet modal opens, compiles and closes', async ({ page }) => {
  await page.getByTestId('export-calc-sheet-btn').click();
  await expect(page.getByTestId('compile-calc-sheet-btn')).toBeVisible();

  await page.getByTestId('compile-calc-sheet-btn').click();
  await expect(page.getByTestId('compiled-calc-sheet-output')).toBeVisible({ timeout: 15_000 });

  await page.getByTestId('close-calc-sheet-modal').click();
  await expect(page.getByTestId('compile-calc-sheet-btn')).toBeHidden();
});

test('T9 — share menu exposes copy + AI-assist actions', async ({ page }) => {
  await page.getByTestId('toggle-ax-share-btn').click();
  await expect(page.getByTestId('page-ax-share-menu')).toBeVisible();
  await expect(page.getByTestId('ax-copy-markdown-btn')).toBeVisible();
  await expect(page.getByTestId('ax-copy-url-btn')).toBeVisible();
  await expect(page.getByTestId('ax-open-chatgpt-link')).toBeVisible();
  await expect(page.getByTestId('ax-view-markdown-link')).toBeVisible();
});
