---
title: PVU embed escape hygiene — students never see ai4u.now (ak-fix 261111)
date: 2026-11-11
summary: "Owner asked twice for a SharePoint link; audit found 6 real leaks incl. dead client-auth wiring; all fixed, deployed, browser-verified 8/8"
---

# PVU embed escape hygiene — students never see ai4u.now (ak-fix 261111)

## What happened
Owner re-raised via /ak-fix --advice: "i want PVU sharepoint link, not ai4u.now link" (second ask). Kongming counsel overturned the reassure-only premise: the embed flow DID leak ai4u.now to students via five verified UI paths, plus a sixth defect the audit surfaced.

1. `main.tsx` never called `consumeFragmentToken()` — the entire client auth chain dead-ended at token_missing 401s in real browsers; the curl-based smoke was structurally blind to it.
2. `PageAxShareMenu` "Copy URL" hardcoded `chemeng.ai4u.now` (the AWS host — wrong deployment entirely); "View as Markdown" navigated the student's tab off SharePoint; ChatGPT/Claude/Perplexity prompt links carried the AWS host.
3. `ShowcaseVideoModal` "open full showcase" href="/" target=_blank hit the caddy basic_auth frontdoor — an ai4u.now URL plus an unpassable login prompt.
4. Trust-boundary copy rendered gateway.ai4u.now / support@ai4u.now / "AI4U.now team" / GitHub in-app.
5. index.html canonical/og/JSON-LD advertised chemeng.ai4u.now.
6. Copilot limiter keyed per-IP — classroom NAT pools a whole room into one shared 60/min bucket.

## Root cause
Phase 2 built the token store but the boot wiring was never attached (curl smoke can't catch client-only gaps); the shell's share/marketing affordances predate the embed edition and were never audited against the "student sees only SharePoint" promise; phase-06 plan doc still carried the pre-settlement second-level hostname.

## Decision
- A+ (kongming): gate escapes on `isEmbedSession()` (token presence) rather than re-architecting; the vanity origin (chemeng.pvu.edu.vn via PVU IT reverse proxy) offered to the owner as an effort-costed optional decision, not done — its observable-to-student delta over A+ is zero and it puts PVU IT in the permanent blast radius.
- Copilot buckets keyed per-browser X-Client-Id (valid UUID) with ipKeyGenerator fallback; rotation abuse stays capped by the general 300/min per-IP limiter mounted ahead. express-rate-limit v8 rejects the `validations` option (log-only) — use the exported ipKeyGenerator helper instead.
- Token URLs are glue, never student links: the Phase-6 handover artifact now leads with a two-link table + the YouTube-in-PowerPoint analogy.

## Changes (6a453cb + 58994d4, deployed)
- main.tsx consumes #t= before first render; embed-token-store gains isEmbedSession() + resetEmbedTokenStoreForTests().
- app-shell hides PageAxShareMenu; showcase-video-modal hides the frontdoor link; page-ax-share-menu derives URLs from window.location.origin.
- trust-boundary-copy: localDemoProfileTooltip + supportPrivacyNote are embed-aware getters (PVU-relay wording, both locales); base AWS copy byte-identical.
- vite brandCanonicalHostPlugin rewrites index.html hosts from VITE_CANONICAL_URL (Dockerfile/compose pass chemeng-pvu.ai4u.now; default build byte-identical); verified dist 0x chemeng.ai4u.now / 16x chemeng-pvu.ai4u.now.
- embed-auth-gate copilotRateKey + keyGenerator.
- Tests 152 to 165 green; typecheck clean; all files <200 LOC.
- VPS: clone had no origin (added https remote; repo is public), checkout 6a453cb, `docker compose up -d --build perry-workbench`.

## Verification
- Curl 8/8: health pdf_exists=true; canonical=chemeng-pvu.ai4u.now; ZERO chemeng.ai4u.now in served /app; lang=vi; CSP; bare POST 401 token_missing; authed 200; distinct client-ids 200; /index.md still served as origin asset.
- Real-browser Playwright DOM audit 8/8 ALL GREEN: fragment stripped, token persisted, share menu count=0, guide modal opens with showcase link count=0, ZERO ai4u.now strings in rendered body text, PVU trust copy rendered, store-backed /api/copilot 200.
- VPS env confirmed CHE_COPILOT_RATE_LIMIT_PER_MIN=60 (now per-browser, not per-NAT).

## Next steps
- Owner: 5 SharePoint clicks per reports/phase-06-owner-handover.md (allowlist + Embed web part + paste glue URL; expires 2026-12-11 — Phase 10 rotation or Phase 7 managed web part).
- Token rotation ritual lands in Phase 10; ops runbook + healthcheck still pending from the cook.
- Residual (accepted): bundle JS + origin SEO files (llms.txt, index.md) still contain chemeng.ai4u.now strings — not reachable from the embedded UI.

> Historical work record — not durable authority. Prefer docs/specs/ADRs for current decisions.
