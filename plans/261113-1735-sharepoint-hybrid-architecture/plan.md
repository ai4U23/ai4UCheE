---
title: "PVU SharePoint Hybrid Architecture — native zero-internet lane + AI window lane"
description: "Per-surface dual-lane: native pages (gadget shipped as Lite core, BOD native mirror via cron dual-publish, content libraries) + AI pages (BOD chatbot page untouched, workbench Lane A embed) — cross-linked, native first."
status: pending
priority: P1
effort: 3.85d core + 2-3d optional Lite growth
branch: main
tags: [feature, sharepoint, hybrid, pvu, deployment, content]
blockedBy: []
blocks: []
created: 2026-11-13
---

# PVU SharePoint Hybrid Architecture

**Owner-locked 2026-11-13** ("go hybrid") after the lane-capability explanation:
Microsoft's native HTML-pages sandbox forbids ALL network/storage (probe-proven
261113), so AI/engine features can only live behind the window lane (iframe
onto PVU VPS origins). The hybrid puts every surface on the lane that fits it,
adds an outage-proof native mirror beside each AI page, and cross-links them
with the native address first. **Supersedes-for-execution**: 261111-1048 P6
(embed, executed here as Phase 3) and P9 (content, Phase 4); 261113-0638 P5
ship/kill resolves as **SHIP** (Phase 5, owner's "go hybrid").

## Contract Summary

- **Outcome**: every PVU surface reachable at a SharePoint address; native
  pages work with the origin down; AI features (BOD chatbot, workbench
  copilot/search/saves) intact on the window lane; nightly job feeds both
  lanes; students never see ai4u.now in any address bar.
- **Constraints**: sandbox laws (native lane: no fetch/storage/external
  scripts, ≤10 MB, fonts data-URI); app-only credentials for ALL tenant
  automation (delegated tokens are ephemeral ceremony only — never stored for
  cron use without a new owner decision); the existing BOD SPFx-viewer page is
  ADDITIVE-ONLY (untouched); sibling-session laws for the BOD tooling
  (spec.slug identity, in-tree host tooling deployed by copy + hash-log,
  fidelity gate = steady-state, partial-view guard, quarantine-before-boot);
  publish-mcp recreate ONLY via `deploy/publish-mcp-recreate.sh`; batteries all
  LOCAL (no CI); commit by path across repos.
- **Non-goals**: no rewrite of the workbench as native (structurally
  impossible — sandbox); no removal of the existing BOD page or its chatbot; no
  delegated-token automation fallback (park instead); no new AI features; no
  SPFx changes (Lane B/Phase 7 of 261111-1048 remains its own future plan).
- **Acceptance**: canary receipt (app-lane re-arm or parked verdict); BOD
  native page renders with fresh ict_date and survives an origin-outage
  simulation read; workbench embed passes the 8/8 hygiene + interaction
  battery; four content receipts (library folder, Stream URL, SiteAssets,
  guides) + member-open checks; gadget SHIP recorded + final page live;
  cross-links present with native first; rollback anchors documented.

## Gates

- **GA — write-lane canary** (2026-11-14 06:20 ICT cron log): app-only SP
  writes re-armed after the 261113 grant restore → unlocks Phase 1 deletes,
  Phase 2 dual-publish, Phase 5 promote. If the canary fails: those legs PARK
  with a dated retry (06:20 next morning; escalation after 2 consecutive
  failures = kongming checkpoint on delegated-fallback proposal — which is an
  owner decision, not a default).
- **GB — Graph consent**: add Microsoft Graph `Sites.Selected` app role to app
  `5b4c6b66` + admin consent + site-scoped grant (Phase 1, IAB/API route per
  the owner's standing "we are IT admin — use IAB" directive; portal fallback)
  → unlocks Phase 4 Graph lanes (documents/media; Stream = hard dependency).
- **GC — owner in-session choices** (fold into the one browser session or by
  reply): embed clicks executor (me-via-IAB per standing directive, or owner);
  embed pass TTL (30 days vs term — re-mint + handover update if term); final
  visual acceptance of the embed page.

## Standing Laws (violating any rejects the plan)

1. Sandbox laws for every native-lane artifact (261113-0638 law 1, incl.
   KaTeX-font data-URI inlining).
2. App-only tenant automation; ephemeral delegated tokens only; never store a
   delegated refresh token for cron use without an explicit new owner decision.
3. BOD surfaces are ADDITIVE: the live `pvu-bod-usage-dashboard-vn.aspx` page
   and its SPFx viewer are never modified by this plan; the native mirror is a
   NEW page beside it.
4. BOD tooling laws (sibling session): spec script + host copy hash-logged;
   dual-publish joins the SAME script (one bake → two publishes); never
   publish over dead data (data-mcp preflight stays); output-side liveness =
   fresh `ict_date` in BOTH lane receipts.
5. Engine + provisioning APP-ONLY credentials; content = generated work
   product and re-derived art ONLY (no corpus text/crops — 261111-1048 law).
6. Workbench student embed keeps the 261111 embed-escape hygiene law (zero
   ai4u.now strings in the rendered DOM; no tab-off elements; Playwright
   battery 8/8 before handover).
7. Token in fragment, never query param; secrets never leave the VPS.
8. `deploy/publish-mcp-recreate.sh` is the only publish-mcp recreate path.
9. Every battery/verify is a LOCAL command with a mechanical pass condition;
   failures follow the phase's Failure Protocol (stop → kongming → re-verify).

## Risk Notes (honest)

- The app-only write lane may NOT re-arm tomorrow (SP identity materialization
  after grant re-create is lagging — 403 as of 261113 ~10:00 ICT). Every
  gated phase has a dated park rule; nothing forces a risky workaround.
- BOD native mirror shows a **visible-but-dead chat tile** (the artifact is
  byte-identical; the sandbox blocks its live AI) — accepted by the owner
  261113; the baked cross-link points to the chatbot page for conversation.
- Graph-consent-via-API assumes the device-flow identity holds a
  consent-capable admin role (duc.a.nguyen signed all 261110-13 ceremonies);
  verify at execution, portal fallback otherwise.
- Stream lane is the least-proven engine path (`media_publisher.py`) — it gets
  the Phase 4 rehearsal FIRST with a one-item pilot before the real video.
- Page-version churn: native BOD mirror adds ~30 publishes/month to SitePages
  (same class as the existing page; ~60/mo combined vs 500 cap — watch in P6).

## Phase Table

| # | Phase | Status | Effort | Depends |
|---|-------|--------|--------|---------|
| 1 | [Canary + tenant grooming + Graph consent](phase-01-canary-and-tenant-grooming.md) | Pending | 0.25d | — |
| 2 | [BOD native mirror (cron dual-publish)](phase-02-bod-native-mirror.md) | Pending | 0.5d | GA |
| 3 | [Workbench embed — Lane A](phase-03-workbench-embed-lane-a.md) | Pending | 0.25d + owner session | GC |
| 4 | [Content publishes (4 items)](phase-04-content-publishes.md) | Pending | 2.5d | GB |
| 5 | [Gadget SHIP + Lite growth (optional)](phase-05-gadget-ship-and-lite-growth.md) | Pending | 0.1d (+2-3d optional) | GA |
| 6 | [Cross-link UX + ops runbook fold](phase-06-crosslink-ux-and-ops.md) | Pending | 0.25d | 1-5 |

**Cook order (kongming amendment):** 1 → **5** → 2 → 3 → 4 → 6. Phase 5 is
0.1d and gated only on GA — it runs immediately after the canary (closing the
261113-0638 SHIP decision and batching both SP-REST write tasks into the same
GA-green window) instead of waiting behind the GB-gated 2.5d Phase 4.

## Handoff

Authored under `--advice` (handover contract; every task carries
Goal/Target/Steps/Success/Verify; Failure Protocol verbatim in every phase
file; stopping on a failed check is intended behavior). Next step: `/ak-cook`
on Phase 1 the morning of 2026-11-14 (canary day). No task-management surface
in this runtime — phase Todo blocks are the ledger (hydration skipped, reason
recorded).
