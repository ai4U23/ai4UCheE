# Journal — 2026-10-30 (`ak:fix --advice all`: 375px Mobile Grid Overflow & Express Header Hardening)

## Context
During the `ak:web-testing whole site` verification pass on `https://chemie.ai4u.now`, all 21 HTTP endpoints, 22 Vitest tests, and 43 Pytest tests passed, and two P3 observations were surfaced:
1. **375px Mobile Horizontal Overflow:** At `375x812` mobile viewport, `document.documentElement.scrollWidth` exceeded `clientWidth` (`416px > 360px` on WB2/WB4 and `695px > 360px` on WB3).
2. **Express Header Exposure:** `GET /` returned `x-powered-by: Express`.

## Root Cause & Kongming Counsel
- **CSS Grid `1fr` Intrinsic Width Expansion:** `src/styles/theme-tokens.css:103,118` used `1fr` instead of `minmax(0, 1fr)`, allowing unbreakable descendants (`table.mono th, td { white-space: nowrap }` in WB3 and `.white-box-citation-badge { white-space: nowrap }` in WB2/WB4) to stretch the grid tracks past 375px.
- **`@kongming` Edge-Case Catch:** Because `.shell-header` uses `margin: 0 -1.25rem` to bleed across `.app-shell`'s `1.25rem` horizontal padding, applying `max-width: 100%` to `.app-shell > *` would clip the right edge of the header by `20px`. Scoping `max-width: 100%` to `.app-shell > :not(.shell-header), .shell-workspace > *, .wb-split > *` fixed the mobile overflow while preserving the full-bleed header on both mobile and desktop.
- **Express Header:** Added `app.disable('x-powered-by')` in `src/server/api-server.ts:61`.

## Verification (`9a51ba3`)
- `tsc --noEmit` (0 errors), Vitest (`23/23` passing), Pytest (`43/43` passing).
- Deployed `9a51ba3` to `chemie` (`https://chemie.ai4u.now`) and verified in In-App Browser: `scrollWidth === clientWidth === 360` (`overflow: false`, `headerFullBleed: true`) across WB1, WB2, WB3, and WB4 at `375x812`, and `x-powered-by` header absent (`False`).
