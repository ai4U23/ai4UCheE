# Phase 6 — Lane A: SharePoint Embed Web Part (Owner Runbook + Tenant Smoke)

## Context
- Brainstorm: `plans/reports/brainstorm-20261111-pvu-sharepoint-edition.md` · Research: `plans/reports/research-20261111-interactive-html-on-sharepoint.md` (Lane A mechanics: site-collection HTML Field Security allowlist + Embed web part; no App Catalog needed)
- Related phases: requires Phase 5 live origin + Phase 4 token; superseded by Phase 7 (which reads this phase's supersede step); rotation owned by Phase 10.

## Overview
Priority P1 · Status Pending · Effort 0.25d planner + ~1h owner work.
Lane A is the manual, work-today lane: the owner allowlists the app domain at site-collection level, creates one page with the out-of-box Embed web part pointing at the token URL, and records a 15-minute tenant smoke test. Kongming's acceptance gates this phase: a student completes a copilot interaction end-to-end inside the embed while the direct pvu surface stays unchanged.

## Requirements
Functional:
- HTML Field Security allowlist entry `https://chemeng.pvu.ai4u.now` at site-collection admin level.
- Page named exactly `che-workbench-embed.aspx` (unmanaged-page containment law), Embed web part, iframe src = `https://chemeng.pvu.ai4u.now/app#t=<fresh 30d token>`, fixed tall height attribute (1600px), in-frame scrolling.
- Smoke evidence recorded: iframe sandbox attributes observed in the tenant, console errors if any, copilot round-trip screenshot.
- Surface-registry entry for the page (slug `che-workbench` artifact row from Phase 4 + page URL noted) with rotation cadence 30d.
Non-functional: total owner time ≤ 1h; zero App Catalog involvement; page edit is the only tenant mutation besides the allowlist line.

## Architecture
```
pvuedu.sharepoint.com  (site collection)
 └─ HTML Field Security allowlist: https://chemeng.pvu.ai4u.now   (owner, once)
 └─ Page che-workbench-embed.aspx
     └─ Embed web part (OOB iframe, height=1600, scrolling in-frame)
         └─ src https://chemeng.pvu.ai4u.now/app#t=TOKEN
             └─ Phase 2 flow: fragment → store → strip → Bearer on /api/*
```

## Related Code Files
| Path | Action | Change |
|---|---|---|
| `/Users/nad/ai4u/ai4UCheE/plans/261111-1048-pvu-sharepoint-edition/reports/lane-a-smoke-<date>.md` | create | Smoke evidence (sandbox attrs, console, acceptance transcript). |
| ai4UPVU surface registry (Phase 4 slug row) | modify | Add page URL + rotation cadence note. |
| No application code changes in this phase. | — | — |

## Tasks

### Task 6.1 — Planner prep: token URL + runbook draft
**Goal:** The owner receives a one-page runbook with the exact token URL ready to paste.
**Target files and symbols:** Phase 4 mint script output; runbook text delivered in chat/phase summary.
**Steps:**
1. Mint a fresh 30d token on the VPS (Phase 4 Task 4.2 script); record jti + expiry in the surface registry note.
2. Assemble the runbook (Tasks 6.2–6.4 below, verbatim, with screenshots-links placeholders).
3. Sanity-check the URL loads and authenticates from the owner's browser profile before the tenant work: open `https://chemeng.pvu.ai4u.now/app#t=<token>` directly, confirm the app renders and a calculation works.
**Success criteria:** Token URL verified working top-level (basic-auth exempt path) before any SharePoint edit.
**Verify:** manual browser check + `curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer <token>" https://chemeng.pvu.ai4u.now/api/screen-state` → `200`.

### Task 6.2 — Owner: allowlist the domain (≈10 min, site-collection admin)
**Goal:** SharePoint permits iframes of the app origin.
**Steps (owner, plain English):**
1. Open the PVU site collection as admin → Settings → Site information → View all site settings → HTML Field Security.
2. Add `https://chemeng.pvu.ai4u.now` to the allowed domains list; save.
**Success criteria:** Domain present in the allowlist on re-open.
**Verify:** owner screenshot of the saved allowlist appended to the smoke evidence file; `no verification needed` beyond that.

### Task 6.3 — Owner: create the embed page (≈15 min)
**Goal:** `che-workbench-embed.aspx` live with the workbench framed.
**Steps (owner):**
1. Site Pages → New → Page; title "CHE Workbench"; after creation, confirm/rename the URL name to `che-workbench-embed.aspx` (distinct-name law).
2. Add the out-of-box **Embed** web part; paste `https://chemeng.pvu.ai4u.now/app#t=<token from Task 6.1>`; set the iframe height to about 1600 pixels in the web part's property pane (page scrolls inside the frame).
3. Publish the page; copy its URL.
**Success criteria:** Page loads for a site member showing the PVU-branded workbench in Vietnamese.
**Verify:** planner opens the page URL in a clean browser session (no prior localStorage) and sees the app render; `curl -s -o /dev/null -w "%{http_code}" "<page URL>`" is not the check — the check is visual plus Task 6.4.

### Task 6.4 — 15-minute tenant smoke + Kongming acceptance (≈15 min owner + planner)
**Goal:** Recorded proof Lane A meets the acceptance law.
**Steps:**
1. On the published page, open browser devtools: record the rendered iframe element's attributes (exact `sandbox="…"` string), any console errors, and the network log showing `/api/copilot` with a Bearer header and status 200 (Tier 1 fallback acceptable; record which tier).
2. Kongming acceptance walk: as a student (member account or member-mode session), inside the embed: change one workbench input, ask the copilot one Vietnamese question, receive an answer, save one calc sheet, reload the page, confirm the saved sheet reappears (per-browser saves inside the embed partition).
3. Confirm the direct surface is unchanged: open `https://chemeng.pvu.ai4u.now/` → basic-auth prompt appears (or `/app` shows shell + banner without token use at top level).
4. Write the evidence file (sandbox attrs, tier used, screenshots, page URL, token jti/expiry).
**Success criteria:** All four steps recorded; no console-fatal errors; acceptance walk fully green.
**Verify:** evidence file exists at `plans/261111-1048-pvu-sharepoint-edition/reports/lane-a-smoke-261111.md` containing the sandbox attribute string, the string `200` for the copilot call, and the acceptance checklist ticked — `grep -c "sandbox" <file>` → ≥ 1.

## Todo
- [ ] 6.1 Token URL + runbook + top-level sanity check
- [ ] 6.2 Owner: HTML Field Security allowlist
- [ ] 6.3 Owner: che-workbench-embed.aspx page
- [ ] 6.4 Tenant smoke + Kongming acceptance + evidence file

## Success Criteria
- Kongming acceptance law satisfied and evidenced (student copilot interaction end-to-end inside the embed; direct surface unchanged).
- Iframe sandbox attributes recorded (input to Phase 7's design constraints).
- Rollback: owner deletes the page (one action, zero footprint) + optionally removes the allowlist line; the VPS origin is untouched; students lose the front door only.

## Risk Assessment
- Tenant embed blocked (allowlist propagation delay or OOB part quirks): likelihood low (research-verified lane), mitigation — the smoke test is the gate; failure routes to the Failure Protocol, not to improvisation.
- Token leaked via page source to site members: by-design cohort posture (recorded in plan.md Risk Notes); revocation + 30d rotation bound it.
- Page name drift (someone renames or copies the page): containment law — registry + Phase 10 quarterly re-check; supersede in Phase 7 removes the unmanaged page entirely.

## Security Considerations
- No secrets beyond the cohort token, which is designed to be page-visible (internal tier).
- Fragment transport keeps the token out of SharePoint telemetry/Referer.
- Corpus containment unaffected (all data via Bearer-gated API, proven in Phase 5).

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
- Hands Phase 7 the recorded sandbox attributes and the supersede target (this page).
- Phase 8's kill gate explicitly references "after seeing Lane A embedded" — this phase is that sighting.
- Phase 10 schedules the first 30-day rotation of this page's token.
