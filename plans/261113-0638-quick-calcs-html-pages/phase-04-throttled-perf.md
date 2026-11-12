# Phase 4 — Throttled Perf Gate (School Hardware)

## Context
- Parent: `../plan.md`. Repo test runner: `@playwright/test` 1.64.1,
  `playwright.config.ts` with `testDir: './tests/e2e'`, `workers: 1`, webServer
  = vite ONLY when `E2E_BASE_URL` is unset (verified 2026-11-13) — so this
  phase MUST set `E2E_BASE_URL` to bring its own static server and avoid a
  pointless vite boot.
- Classroom reality: school machines, many tabs, no GPU budget — the gate is
  4× CPU throttle, the same class of hardware honesty used elsewhere in the
  repo's E2E suite.

## Overview
Priority P2 · Status Pending · Effort 0.15d · Depends on Phase 2 (dist exists).
Prove keystroke→result latency p95 < 1500 ms under 4× CPU throttling for both
calculators. One spec file, one command, mechanical verdict.

## Requirements
- Serve `gadget/dist/` over plain HTTP (NOT file:// — the sandbox-rendered
  reality is an HTTP document; file:// skips the same-origin behaviors the
  pilot will hit).
- 5 measured iterations per calculator; p95 across all 10 samples.
- Fail loudly (non-zero exit) on any missed bound — no soft warnings.

## Related Code Files
| Path | Action | Change |
|---|---|---|
| `tests/e2e/gadget-perf.spec.ts` | create | The perf spec (only new file; `gadget/dist/` is its subject). |

## Tasks

### Task 4.1 — The perf spec
- Goal: a Playwright spec that measures and asserts, not vibes.
- Target files: `tests/e2e/gadget-perf.spec.ts`.
- Steps:
  1. Extend the base test with a custom `context` fixture passing
     `cpuThrottling: 4` to `browser.newContext` (chromium-only option — the
     config's `devices['Desktop Chrome']` profile already pins chromium).
  2. For each calculator: fill the inputs, then run ONE unmeasured warm-up
     iteration (first pass pays font/KaTeX parse — it must not count as a
     sample), then measure 5 iterations of "type one character into the primary
     input → await the result element's text change" with `performance.now()`
     deltas; push all 10 samples into one array.
  3. Assert `p95(samples) < 1500` (p95 of 10 samples = the 10th-sorted
     ceil(0.95·10)=10th value — i.e. the worst sample; state this in a comment).
     On failure, log the full sample list.
  4. Selectors: give the two result containers stable `id` attributes in
     `gadget/src/ui.js` if they don't exist yet (`#dippr-result`,
     `#npsha-result`) — this is the one allowed touch on Phase 2 outputs.
- Success criteria: the command below exits 0 locally.
- Verify (put this in a scratch script file — e.g. `gadget/tools/run-perf.sh`,
  `chmod +x` — and run it; pasting `exit $rc` into an interactive shell closes
  the shell):
  ```bash
  #!/usr/bin/env bash
  set -u
  python3 -m http.server 5199 -d gadget/dist & SRV=$!
  sleep 1
  E2E_BASE_URL=http://localhost:5199 npx playwright test tests/e2e/gadget-perf.spec.ts --retries=0 ; rc=$?
  kill $SRV
  exit $rc
  ```
  `--retries=0` overrides the config's `retries: 1` (set for deployed-target
  runs at `playwright.config.ts:16`) — a perf gate must not retry. The script
  exits 0 and the reporter prints `1 passed`.

## Todo
- [ ] 4.1 Spec green at 4× throttle (all 10 samples logged in the run output)

## Success Criteria
- The Verify command block exits 0; samples visible in output; no flakiness on
  an immediate re-run (run it twice; both green).

## Risk Assessment
- Timer noise under throttle: the p95-of-worst-sample reading is conservative —
  a failure means genuinely slow, not jitter.
- Port 5199 collision: pick 5199 deliberately (5173/5174/5179 are reserved by
  the repo's own tooling; the config comment lists them).

## Security Considerations
- Local server on loopback only; no tenant access.

## Failure Protocol
If any Verify step does not meet its stated pass condition, STOP this phase.
Do not improvise a fix, retry blindly, or reason around the failure.
Spawn the `kongming` subagent for next-step counsel and pass:
- the phase and task id,
- what you attempted (the steps you ran),
- the exact command and its full output,
- the pass condition it failed to meet.
Apply kongming's guidance, then re-run the Verify step.
If `kongming` cannot be spawned in this environment, STOP and report the same
failure evidence to the user. Never continue by self-reasoning.

## Next Steps
- Phases 2–4 boundary → combined kongming checkpoint (build + battery + perf
  evidence in one prompt) before Phase 5 touches the tenant.
