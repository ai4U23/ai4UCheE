// R4 T1 + T2 + OBS-1 — showcase homepage: hero smoke, EN↔VI locale toggle with
// persistence, and the scroll-behavior:auto pin from the ea7e58 fix.
import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.getByTestId('ai4u-logo')).toBeVisible();
});

test('T1 — showcase hero, story bridge and video-guide section render', async ({ page }) => {
  await expect(page.getByTestId('five-step-story-bridge')).toBeVisible();
  const video = page.locator('#video-guide');
  await expect(video).toBeAttached();
  await expect(page.locator('a[href="#video-guide"]').first()).toBeVisible();
});

test('T2 — EN↔VI toggle re-renders and persists across reload', async ({ page }) => {
  await page.evaluate(() => localStorage.setItem('ai4uchee_locale', 'en'));
  await page.reload({ waitUntil: 'domcontentloaded' });
  const titleEn = await page.title();

  await page.getByTestId('locale-vi').click();
  await page.waitForTimeout(400); // showcase VI sweep is a full DOM re-render
  expect(await page.evaluate(() => localStorage.getItem('ai4uchee_locale'))).toBe('vi');
  expect(await page.title()).not.toBe(titleEn);

  await page.reload({ waitUntil: 'domcontentloaded' });
  expect(await page.evaluate(() => localStorage.getItem('ai4uchee_locale'))).toBe('vi');
  expect(await page.title()).not.toBe(titleEn);

  await page.getByTestId('locale-en').click();
  await page.waitForTimeout(400);
  expect(await page.evaluate(() => localStorage.getItem('ai4uchee_locale'))).toBe('en');
  expect(await page.title()).toBe(titleEn);
});

test('OBS-1 — anchor nav is instant (scroll-behavior auto) and lands on target', async ({ page }) => {
  const behavior = await page.evaluate(
    () => getComputedStyle(document.documentElement).scrollBehavior,
  );
  expect(behavior).toBe('auto'); // repo lesson: smooth stalls in occluded panes

  await page.locator('a[href="#video-guide"]').first().click();
  await page.waitForTimeout(500);
  const scrollY = await page.evaluate(() => Math.round(window.scrollY));
  expect(scrollY).toBeGreaterThan(300); // left the hero toward the sticky target
});
