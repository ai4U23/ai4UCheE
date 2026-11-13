// Phase 4 perf gate (plan 261113-0638): keystroke→result p95 < 1500 ms under
// 4× CPU throttle, both calculators, served from gadget/dist/.
// p95 of 10 samples = ceil(0.95*10) = 10th sorted value — i.e. the WORST
// sample; deliberately conservative (a failure means genuinely slow, not
// jitter). One unmeasured warm-up iteration per calculator absorbs the
// first-pass font/KaTeX parse cost.
import { expect, test } from '@playwright/test';

test.describe('gadget perf @ 4x throttle', () => {
  test('both calculators p95 < 1500ms', async ({ browser }) => {
    const context = await browser.newContext({ cpuThrottling: 4 });
    const page = await context.newPage();
    await page.goto('/index.html');

    // --- DIPPR tab ---
    const dipprTab = page.getByRole('tab', { name: /DIPPR/i });
    await expect(dipprTab).toBeVisible();
    await dipprTab.click();
    const dipprInput = page.locator('#dippr-temp');
    const dipprResult = page.locator('#res-vp');
    await expect(dipprInput).toBeVisible();
    await expect(dipprResult).not.toBe('');

    const measure = async (
      input: ReturnType<typeof page.locator>,
      result: ReturnType<typeof page.locator>,
      values: string[],
    ): Promise<number[]> => {
      const samples: number[] = [];
      let prev = (await result.textContent()) ?? '';
      // Warm-up (unmeasured): absorbs first-pass font/KaTeX parse.
      await input.fill(values[0] + '1');
      await expect.poll(async () => await result.textContent()).not.toBe(prev);
      prev = (await result.textContent()) ?? '';
      for (const v of values) {
        const t0 = Date.now();
        await input.fill(v);
        await expect
          .poll(async () => await result.textContent())
          .not.toBe(prev);
        samples.push(Date.now() - t0);
        prev = (await result.textContent()) ?? '';
      }
      return samples;
    };

    const samples: number[] = await measure(
      dipprInput, dipprResult, ['380', '390', '400', '410', '420'],
    );

    // --- NPSHa tab ---
    const npshaTab = page.getByRole('tab', { name: /NPSHa/i });
    await expect(npshaTab).toBeVisible();
    await npshaTab.click();
    const npshaInput = page.locator('#npsha-p');
    const npshaResult = page.locator('#res-npsha');
    await expect(npshaInput).toBeVisible();
    await expect(npshaResult).not.toBe('');

    samples.push(
      ...(await measure(npshaInput, npshaResult, ['5', '10', '15', '20', '25'])),
    );

    samples.sort((a, b) => a - b);
    const p95 = samples[Math.ceil(0.95 * samples.length) - 1];
    console.log(`perf samples: ${JSON.stringify(samples)} p95=${p95}ms`);
    if (p95 >= 1500) {
      throw new Error(
        `perf gate FAILED: p95=${p95}ms >= 1500ms samples=${JSON.stringify(samples)}`,
      );
    }
    await context.close();
  });
});
