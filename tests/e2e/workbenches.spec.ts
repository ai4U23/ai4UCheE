// R4 T5 + T7 — workbench render smoke across subjects, plus the EN/VI result-card
// contract and the "Đime" typo regression from the 22fc2f8 VI fixes.
// Subject tabs sit behind the Labs dropdown — openLabsDrawer() before every click.
import { expect, test } from '@playwright/test';
import { launchProblem2, openLabsDrawer, toggleLocale } from './helpers';

test('T5 — WB2 result card is byte-exact in EN and prefixed correctly in VI', async ({ page }) => {
  await launchProblem2(page);
  await page.getByTestId('mission-autofix-btn').click();
  const result = page.getByTestId('dippr-vp-result');
  await expect(result).toContainText('Result at T = 373.15 K: 101,261 Pa (14.69 psia)', {
    timeout: 15_000,
  });

  const locale = await toggleLocale(page);
  expect(locale).toBe('vi');
  await expect(result).toContainText('Kết quả tại T = 373.15 K: 101,261 Pa');

  const body = await page.evaluate(() => document.body.innerText);
  expect(body.includes('Đime')).toBe(false); // 22fc2f8 typo regression
});

test('T7 — WB3 hydraulics renders P-101 pump sketch and Fanning/Darcy banner', async ({ page }) => {
  await page.goto('/app', { waitUntil: 'domcontentloaded' });
  await openLabsDrawer(page);
  await page.getByTestId('tab-wb3-hydraulics').click();
  await expect(page.getByTestId('wb3-hydraulics')).toBeVisible();
  await expect(page.getByTestId('piping-pump-svg-sketch')).toBeVisible();
  await expect(page.getByTestId('darcy-fanning-banner')).toBeVisible();
});

test('T7 — WB4 distillation renders the McCabe-Thiele canvas', async ({ page }) => {
  await page.goto('/app', { waitUntil: 'domcontentloaded' });
  await openLabsDrawer(page);
  await page.getByTestId('tab-wb4-distillation').click();
  await expect(page.getByTestId('wb4-distillation')).toBeVisible();
  await expect(page.getByTestId('mccabe-thiele-canvas')).toBeVisible();
});

test('T7 — WB6 kinetics renders the Levenspiel reactor', async ({ page }) => {
  await page.goto('/app', { waitUntil: 'domcontentloaded' });
  await openLabsDrawer(page);
  await page.getByTestId('tab-wb6-kinetics-reactors').click();
  await expect(page.getByTestId('wb6-kinetics-reactors')).toBeVisible();
  await expect(page.getByTestId('levenspiel-reactor-svg')).toBeVisible();
});

test('T7 — WB5 handbook atlas mounts with its status banner', async ({ page }) => {
  await page.goto('/app', { waitUntil: 'domcontentloaded' });
  await openLabsDrawer(page);
  await page.getByTestId('tab-wb5-handbook-atlas').click();
  await expect(page.getByTestId('wb5-handbook-atlas')).toBeVisible();
  await expect(page.getByTestId('atlas-status-banner')).toBeVisible();
});
