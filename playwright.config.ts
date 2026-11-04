// Local pre-deploy E2E suite — codifies the R1–R4 manual browser-QA rounds.
// Runs against a throwaway vite dev server by default, or any deployed target:
//   E2E_BASE_URL=https://chemeng.ai4u.now npx playwright test
// Pinned to @playwright/test 1.64.1 == cached ms-playwright chromium-1248 (no browser download).
import { defineConfig, devices } from '@playwright/test';

const PORT = 5179; // never 5173/5174 — don't clobber interactive dev sessions
const baseURL = process.env.E2E_BASE_URL ?? `http://localhost:${PORT}`;

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false, // single worker-flow: mission state is app-global
  workers: 1,
  retries: process.env.E2E_BASE_URL ? 1 : 0, // local failures should stay loud
  reporter: [['list']],
  timeout: 30_000,
  expect: { timeout: 10_000 },
  use: {
    ...devices['Desktop Chrome'],
    baseURL,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  outputDir: 'test-results/',
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: `npm run dev -- --port ${PORT} --strictPort`,
        url: `http://localhost:${PORT}/app`,
        reuseExistingServer: true,
        timeout: 60_000,
        stdout: 'ignore',
        stderr: 'pipe',
      },
});
