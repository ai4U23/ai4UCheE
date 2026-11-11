# Phase 1 — PVU Brand Preset, vi-Default, Copilot Re-Point

## Context
- Brainstorm contract: `plans/reports/brainstorm-20261111-pvu-sharepoint-edition.md`
- SharePoint lanes research: `plans/reports/research-20261111-interactive-html-on-sharepoint.md`
- Related phases: feeds Phase 5 (containers bake the PVU build); no other phase may modify the same files until this lands.

## Overview
Priority P1 · Status Pending · Effort 0.5d.
The workbench currently ships one identity: the "Institutional Ivory" paper theme, English default, and a copilot that introduces itself as "ChemEng's Intelligent Workbench Co-Pilot on ChemEng.ai4U.now" (hardcoded at `src/server/copilot-route.ts:19`). This phase adds a PVU brand preset (theme tokens, logo, Vietnamese-by-default locale) selected at build time, and makes the copilot's branding sentence and gateway target configurable by environment variables. The existing chemeng (AWS) deployment must remain byte-for-byte compatible when no brand env is set.

## Requirements
Functional:
- A `VITE_BRAND=pvu` build renders PVU theme tokens, PVU logo, and defaults the locale to Vietnamese; `VITE_BRAND` unset (or `chemeng`) renders exactly today's look with English default.
- Locale still switchable at runtime via the existing pill (`src/components/shell/locale-switcher-pill.tsx`); explicit `?lang=en` still wins over the vi default.
- Server-rendered HTML (`/`, `/app`) defaults to `<html lang="vi">` when `BRAND_DEFAULT_LOCALE=vi` is set, and still honors `?lang=` / `Accept-Language` overrides.
- The copilot system prompt brand sentence is built from `COPILOT_BRAND_NAME` + `COPILOT_BRAND_SITE` env (defaults preserve the current string). Gateway URL/model stay env-only (`GATEWAY_URL`, `GATEWAY_MODEL` already read at `src/server/copilot-route.ts:14-16`); this phase only documents the PVU values, which Phase 5 sets in compose.
Non-functional: no new runtime dependency; all 72 Vitest + 20 Playwright tests stay green locally.

## Architecture
Client preset is compile-time: `src/lib/brand.ts` reads `import.meta.env.VITE_BRAND` and exports the preset (theme mode default, default locale, display name, logo path). Server identity is runtime: `html-locale-responder.ts` and `copilot-route.ts` read `process.env`. Two mechanisms on purpose — the browser bundle cannot read server env, and the server must not require a rebuild to change branding.

## Related Code Files
| Path | Action | Change |
|---|---|---|
| `src/lib/brand.ts` | create | Brand preset module: `getBrand()` returning `{id, displayName, logoSrc, defaultTheme, defaultLocale}`; ids `chemeng` (defaults identical to today) and `pvu`. |
| `src/context/persona-theme-context.tsx` | modify | Line 11: `ThemeMode = 'paper' | 'pvu'`. Line 55: `initialTheme` default resolves from brand preset (still `'paper'` when brand is `chemeng`). |
| `src/styles/theme-tokens.css` | modify | Append `[data-theme="pvu"] { … }` token block (PVU palette + logo-driven accents; owner supplies hex values). |
| `public/brand/pvu-logo.svg` | create | PVU logo asset (owner-supplied; temporary wordmark placeholder acceptable, flagged for owner replacement). |
| `src/components/shell/app-shell.tsx` | modify | Header logo + product name read from brand preset instead of hardcoded strings. |
| `src/lib/i18n/locale-types.ts` | modify | `resolveInitialLocale` (line 24): final fallback (after explicit/query/localStorage/navigator) returns brand default locale instead of hardcoded `'en'`. |
| `src/server/html-locale-responder.ts` | modify | Line 25 fallback `'en'` becomes `process.env.BRAND_DEFAULT_LOCALE === 'vi' ? 'vi' : 'en'`; title strings gain brand name. |
| `src/server/copilot-route.ts` | modify | Lines 18–24: `SYSTEM_PROMPT` opening sentence built from `COPILOT_BRAND_NAME`/`COPILOT_BRAND_SITE` with today's string as default. |
| `src/__tests__/brand-preset.test.ts` | create | Vitest: preset defaults, chemeng identity unchanged. (Moved into src/__tests__/ — the repo's vitest include collects only src/__tests/**; amendment per kongming counsel 261111.) |
| `src/__tests__/copilot-brand-prompt.test.ts` | create | Vitest: prompt contains brand env when set; exact current sentence when unset. (Same include-pattern amendment; the old src/server placement probe was never collected.) |

## Tasks

### Task 1.1 — Brand preset module and PVU theme tokens
**Goal:** `getBrand()` exists and a `pvu` build applies PVU theme + logo with zero effect on the default build.
**Target files and symbols:** `src/lib/brand.ts` (new `getBrand`), `src/context/persona-theme-context.tsx:11,55` (`ThemeMode`, `initialTheme`), `src/styles/theme-tokens.css` (`[data-theme="pvu"]`), `public/brand/pvu-logo.svg`, `src/components/shell/app-shell.tsx` (header brand slot).
**Steps:**
1. Create `src/lib/brand.ts` exporting `type BrandId = 'chemeng' | 'pvu'` and `getBrand(): Brand` reading `import.meta.env.VITE_BRAND`; `chemeng` preset must return values identical to current hardcoded behavior.
2. Widen `ThemeMode` at `persona-theme-context.tsx:11` to `'paper' | 'pvu'`; default `initialTheme` from the preset (paper for chemeng, pvu for pvu).
3. Add the `[data-theme="pvu"]` block to `src/styles/theme-tokens.css` mirroring the paper token names (use owner-supplied PVU palette; placeholder palette allowed, flagged).
4. Add `public/brand/pvu-logo.svg` and wire logo + display name in `app-shell.tsx` from the preset.
**Success criteria:** With `VITE_BRAND=pvu`, document root has `data-theme="pvu"` and shows the PVU logo; default build unchanged.
**Verify:** `cd /Users/nad/ai4u/ai4UCheE && npm test` → exit 0; then `VITE_BRAND=pvu npm run build` → exit 0 and `grep -c 'data-theme=pvu' dist/assets/*.css` prints ≥ 1 (token block in built CSS; the CSS minifier strips attribute-selector quotes, so probe greps quoteless — 3rd probe amendment 261111) and `grep -rl 'PVU CHE Workbench' dist/assets/*.js` lists ≥ 1 file (preset baked into the bundle). (Amended: data-theme is runtime-set, never present in static dist/index.html — kongming counsel 261111.)

### Task 1.2 — Vietnamese-by-default locale resolution
**Goal:** A fresh browser (no stored locale) on the PVU build starts in Vietnamese; every existing override still works.
**Target files and symbols:** `src/lib/i18n/locale-types.ts:24` (`resolveInitialLocale` final fallback), `src/server/html-locale-responder.ts:9,25` (`resolveRequestLocale` fallback).
**Steps:**
1. In `resolveInitialLocale`, replace the final `return 'en'` with the brand preset's `defaultLocale`.
2. In `resolveRequestLocale`, replace the line-25 `return 'en'` with the `BRAND_DEFAULT_LOCALE` env check (`'vi'` only when the env says so).
3. Confirm `setActiveLocale` / `LOCALE_STORAGE_KEY` (`locale-types.ts:6`) behavior untouched — a student who switched to English keeps English.
**Success criteria:** PVU server env (`BRAND_DEFAULT_LOCALE=vi`) serves `<html lang="vi">` with no query/header; `?lang=en` still returns `lang="en"`; default env still returns `lang="en"`.
**Verify:** `npx vitest run src/__tests__/phase19-vietnamese-locale.test.tsx` → exit 0; plus `BRAND_DEFAULT_LOCALE=vi npm run server & sleep 2 && curl -s localhost:3000/app | grep -c '<html lang="vi"'` → prints `1` (env on the SERVER process, not curl; kill the server after). (Amended — original targeted a non-collected path and misplaced the env — kongming counsel 261111.)

### Task 1.3 — Copilot branding configurable, PVU gateway values documented
**Goal:** The copilot's identity sentence switches by env; PVU gateway/model values are recorded for Phase 5 compose.
**Target files and symbols:** `src/server/copilot-route.ts:18-24` (`SYSTEM_PROMPT`), env keys `COPILOT_BRAND_NAME`, `COPILOT_BRAND_SITE`, `GATEWAY_URL`, `GATEWAY_MODEL` (lines 14–16 already read the latter two).
**Steps:**
1. Build the `SYSTEM_PROMPT` opening from the two brand env vars with the current sentence as the exact default (rest of the prompt — psig/psia rules, Perry citations, scaffolding, actionMutations — unchanged).
2. Record in this phase's summary the PVU values Phase 5 will set: `GATEWAY_URL` = PVU gateway origin `[VERIFY-AT-EXECUTION: exact PVU gateway URL from owner/BOD precedent]`, `GATEWAY_MODEL` = owner-chosen flash model `[VERIFY-AT-EXECUTION]`, `COPILOT_BRAND_NAME` = "Trợ lý Thông minh ChemEng – PVU" (owner to confirm wording), `COPILOT_BRAND_SITE` = "chemeng.pvu.ai4u.now".
3. Add a Vitest asserting both branches (env set / unset).
**Success criteria:** With envs unset, `SYSTEM_PROMPT` is byte-identical to today's; with envs set, the first sentence names PVU.
**Verify:** `npx vitest run src/__tests__/copilot-brand-prompt.test.ts` → exit 0. (Path amended per vitest include pattern — kongming counsel 261111.)

### Task 1.4 — Full local gate
**Goal:** The repo's whole pre-deploy gate passes with brand code in.
**Target files and symbols:** none new; gate = `npm test`, `npm run test:e2e`, `npm run typecheck`.
**Steps:**
1. Run `npm test` (72 Vitest) — all pass.
2. Run `npm run test:e2e` (20 Playwright, local servers) — all pass.
3. Run `npm run typecheck` — exit 0.
**Success criteria:** All three green in one session.
**Verify:** `npm test && npm run test:e2e && npm run typecheck` → exit 0 (final line contains no "failed").

## Todo
- [x] 1.1 Brand preset module + PVU theme tokens + logo
- [x] 1.2 vi-default locale resolution (client + server)
- [x] 1.3 Copilot prompt brand env + PVU gateway values documented
- [x] 1.4 Full local gate green

## Success Criteria
- PVU build shows PVU theme, logo, and Vietnamese default; default build indistinguishable from today (AWS surface unaffected).
- `npm test && npm run test:e2e && npm run typecheck` exit 0.
- Negative control: with no brand envs, `curl -s localhost:3000/app | grep -c '<html lang="en"'` prints `1`.
- Rollback evidence: `git revert` of this phase's commits leaves both builds green (re-run Task 1.4).

## Risk Assessment
- PVU palette/logo not yet supplied (likely) — placeholder tokens shipped and flagged; mitigation: logo is one file swap, palette is one CSS block; no structural risk.
- Widening `ThemeMode` could break exhaustive switches — `npm run typecheck` catches every site; likelihood low, impact low.
- Vi dictionaries assumed complete (verified by existing i18n tests); if a missing key surfaces, add to `src/lib/i18n/vi-shell-dictionary.ts` rather than inline strings.

## Security Considerations
- No secrets in this phase. `GATEWAY_API_KEY` stays server-side only (`copilot-route.ts:15` guard comment preserved). No copyrighted content touched.

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
- Unblocks Phase 2 (same repo, disjoint files) and Phase 5 (compose bakes `VITE_BRAND=pvu`).
- Follow-up: owner supplies final PVU palette hex + logo SVG to replace placeholders before Phase 6 smoke.
