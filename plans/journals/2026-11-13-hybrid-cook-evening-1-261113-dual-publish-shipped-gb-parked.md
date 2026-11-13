---
title: "Hybrid cook evening-1 261113: dual-publish shipped, GB parked on PIM, doctor live"
date: 2026-11-13
summary: "P2 script deployed (probe-first, zero-spend parked days); GB consent blocked by inactive admin role (403 with scopes issued) — owner ask: PIM activate + consent go; doctor OK=2 PARKED=2; five clicks in progress (editor tab open)"
---

# Hybrid cook evening-1 261113: dual-publish shipped, GB parked on PIM, doctor live

Evening-1 of the 261113-1735 hybrid cook (18:10-23:40 ICT):
- GA parked (app-only 403 persists ~8h post-restore). P2 shipped anyway per deploy-even-if-parked: pvu-bod-republish.sh gains write-probe preflight BEFORE the bake (parked days = zero LLM spend, exit 4 signature) + native mirror upload/publish step (additive, granular closing line). Committed by path (mixed-commit incident split into 2), deployed by copy, sha be25e7bd5cac verified. First fire = tomorrow 06:20 cron = the canary itself.
- GB ceremony executed: my phase-file drafting error caught live (SharePoint resource appId used where Graph's belongs; first grant = harmless SP no-op "already exists"); correct Graph SP 87076b44 + role 883ea226 resolved; the real grant -> 403 Authorization_RequestDenied (scopes issuable, OPERATION role-gated; duc holds no ACTIVE Application-Administrator-class role — matches the sibling 261112 PIM suspicion). PARKED with precise ask: PIM activate -> fresh mint (AppRoleAssignment.ReadWrite.All + Application.ReadWrite.All, Directory dropped per least-privilege) -> 3-line POST -> engine probe arbiter -> conditional site grant (owner identity required — e71cb649 structurally cannot run Create-permission, Sites.FullControl.All missing). All delegated tokens deleted (law 2).
- P5: DECISION SHIP recorded in both plan files; promote leg GA-gated.
- P6 partial: deploy/hybrid-doctor.sh live (cron line classifier + SP write-lane + Graph lane + embed-pass expiry; legacy-format case fixed live; run = OK=2 PARKED=2 FAIL=0). Doctor probe-2 writes+deletes a probe file (not purely read-only — labeled).
- P3: five clicks via IAB in progress — CreateModernPage.aspx 404 (deprecated), library New-dropdown dead via 2 paths, CreateSitePage.aspx deep link WORKS: modern page editor open in persistent IAB tab (title contenteditable + Save-as-draft located). Kongming resume traps recorded: contenteditable title (keyboard-type only), rename web address BEFORE web part, toolbox search keystrokes, onBlur property commit, the #t= fragment trap (iframe src must retain full fragment else basic-auth frontdoor looks like embed failure), iframe-snippet fallback for height, Publish double-confirm, battery-BEFORE-publish.
- Kongming evening checkpoint: GO on all parking; morning ritual additions (site-permission entry listing — restore body exists in NO repo, only tenant holds it; parse-corrected mask probe — write bits + 403 = policy layer = audit answer becomes THE blocker); canary classification from quoted raw lines (traceback = GA_FAILED not park); SCRIPT_SHA confirm.

> Historical work record — not durable authority. Prefer docs/specs/ADRs for current decisions.
