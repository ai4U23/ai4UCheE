# E2E Suite — codified R1–R4 browser QA

Local pre-deploy gate. No CI — runs on the laptop before every file-sync deploy
(see `docs/deployment-guide.md` § Pre-Deploy Gate).

```bash
npm run test:e2e                                      # vite auto-starts on :5179
E2E_BASE_URL=https://chemeng.ai4u.now npm run test:e2e  # against prod, post-deploy
```

## Coverage (from the R4 matrix, `plans/reports/browser-qa-r4/R4-report.md`)

| Spec | R4 point | What it pins |
|---|---|---|
| showcase-locale | T1, T2, OBS-1 | hero render, EN↔VI persistence, `scroll-behavior: auto` |
| app-shell-persona | T3, T10 | Learn default (WB2/Year 2), Plant hides curriculum, overflow @4 viewports (default state) |
| problem-library | T4a | 24 problems, tiers 3/10/8/3, L2 filter → `Showing 10 / 24` |
| mission-solve | T4b, T6, T8, DEF-2 | problem #2 launch, trap note, co-pilot chip, Auto-Fix → `101,261 Pa`, mission-active geometry @4 viewports |
| workbenches | T5, T7 | WB2 EN/VI result card + `Đime` typo pin, WB3/4/5/6 mounts |
| calc-sheet-share | T9 | modal open→compile→close, AX share menu |

## Rules baked into `helpers.ts` (learned the hard way, R1–R4)

1. Geometry truth = `evaluate` + `getBoundingClientRect`, batched per viewport sweep.
2. Never assert smooth-scroll behavior; showcase is pinned to `auto` (repo lesson 2026-10-31).
3. Overflow is checked in BOTH default and mission-active states — the default-only
   check is what let DEF-2 ship (R4).
4. Click launch buttons by exact `data-testid` (`launch-prob-02-…`) — accessible-name
   "Solve Problem #2" substring-matches #20–#24.
5. Subject tabs live behind the Labs dropdown → `openLabsDrawer(page)` first.

## Conventions

- `@playwright/test` is pinned **exact 1.64.1** == the cached `ms-playwright/chromium-1248`
  build — no browser download needed. Bump both together or not at all.
- `workers: 1` — mission state is app-global; keep suites serial.
- API-dependent paths (copilot NL what-if, SQLite export, PDF crop) stay OUT of this
  suite; they need the API server + sidecar and remain manual-round territory.
