---
title: "PVU Edition — ChemEng Intelligent Workbench on PVU SharePoint"
description: "Re-skin and token-gate the ChemEng workbench, run it on the PVU VPS, embed it in PVU's SharePoint (Lane A now, Lane B managed, gadget conditional), and publish course content."
status: pending
priority: P1
effort: 8d
branch: main
tags: [pvu, sharepoint, auth, deployment, spfx, gadget, i18n]
created: 2026-11-11
---

# PVU Edition — ChemEng Intelligent Workbench on PVU SharePoint

## Overview
A PVU student opens the course page on `pvuedu.sharepoint.com`. The page embeds the full ChemEng Intelligent Workbench (interactive charts, handbook atlas, copilot) running on PVU's own VPS at the hidden origin `chemeng.pvu.ai4u.now`. The app appears in PVU branding and Vietnamese by default; students calculate, chat with the copilot, and save calc sheets privately per browser. No login is required — a 30-day cohort token in the embed URL authorizes API access, rotated monthly by the owner. Teachers get exported calc sheets, a video guide, infographics, and teacher guides published into SharePoint libraries by the publish engine. A conditional lightweight "Quick-Calcs" gadget (2 calculators) may later run natively on a SharePoint page.

## Contract Summary (locked 2026-11-11)
- Scope: brand + locale only (PVU theme/logo, vi-default). No curriculum change. Owner decision 1.
- Runtime on PVU VPS as a container pair (Express + perry-engine sidecar) behind host caddy; SharePoint is the front door. Decisions 2, 5.
- Auth: engine-minted 30d cohort token in URL fragment (`#t=`), partitioned localStorage + in-memory fallback, `Authorization: Bearer` on `/api/*`, new Express middleware + per-IP rate limit. JTI revocation backstop. Token secret real and checked day one.
- Direct top-level `chemeng.pvu.ai4u.now` keeps caddy basic_auth (BOD precedent); token URLs only ever appear as the embed iframe src.
- Copilot re-points to the PVU gateway flash model via env only. Owner pinned NO daily spend cap on the alias — abuse bounds are the Express per-IP rate limit and JTI/epoch token revocation.
- Saves: ON, private per browser via pseudonymous client-generated ID; SQLite stays on the PVU host behind the token gate; gadget cannot save.
- Lane A (OOB Embed web part) now; Lane B (SPFx AppEmbedView, regular, supportsFullBleed) committed, supersedes Lane A at birth; Lane C gadget conditional post-GA with a three-way kill gate.
- Content backlog: all four items planned now, engine-managed post-activation.

Standing laws (violating any rejects the plan): copyrighted PDFs never in SharePoint; raw PDF crops/text extracts never client-side (calibrated SVG reproductions only if re-derived); engine + provisioning use APP-ONLY credentials only; no GitHub Actions (all tests/batteries are LOCAL commands); gateway API key server-side only; token in fragment, never query param; no user accounts/SSO in v1; Kongming Lane-A acceptance = student completes a copilot interaction inside the embed while the direct surface stays unchanged; short decision record filed before Lane B design work; unmanaged-page containment (distinct page name `che-workbench-embed.aspx`, surface-registry entry, rotation cadence).

## Risk Notes (recorded honestly)
- No spend cap on the copilot alias (owner decision 3, 2026-11-11; kongming's cap recommendation declined). Mitigation bounds: per-IP copilot rate limit (20/min/IP) + general API limit (300/min/IP) + epoch/JTI revocation. Residual risk: a leaked valid token permits gateway spend up to its 30d life; rotation + revocation is the backstop, and the token is cohort-shared by construction (iframe src is readable by site members — internal-tier posture).
- Stock caddy cannot validate tokens; whole-vhost basic_auth would block cross-origin iframes. Resolution: basic_auth on the vhost except the SPA shell paths (`/app`, static assets, `/health`); all data routes are Bearer-gated in Express. The SPA shell is non-secret.

## Phase Table
| # | Phase | Status | Effort |
|---|-------|--------|--------|
| 1 | [PVU brand preset, vi-default, copilot re-point](phase-01-pvu-brand-and-copilot.md) | Pending | 0.5d |
| 2 | [Token auth gate (middleware + SPA token store + vi banner)](phase-02-token-auth-gate.md) | Pending | 0.5d |
| 3 | [Private per-browser saves](phase-03-private-per-browser-saves.md) | Pending | 0.25d |
| 4 | [Embed-token mint extension in ai4UPVU](phase-04-embed-token-mint-extension.md) | Pending | 0.5d |
| 5 | [Container pair + PVU VPS deploy](phase-05-containers-and-pvu-deploy.md) | Pending | 0.75d |
| 6 | [Lane A SharePoint embed (owner runbook)](phase-06-lane-a-sharepoint-embed.md) | Pending | 0.25d + 1h owner |
| 7 | [Lane B SPFx managed embed](phase-07-lane-b-spfx-managed-embed.md) | Pending | 1d |
| 8 | [Quick-Calcs gadget (conditional)](phase-08-quick-calcs-gadget.md) | Pending | 1.5d |
| 9 | [SharePoint content publishes (4 items)](phase-09-sharepoint-content-publishes.md) | Pending | 2.5d |
| 10 | [Ops runbook (rotation, monitoring, kill switches)](phase-10-ops-rotation-runbook.md) | Pending | 0.25d + recurring |

## Dependency / Gate Map
- Phases 1 → 2 → 3 → 3.5 are sequential code phases in ai4UCheE (shared files: `src/server/api-server.ts`).
- Phase 4 (ai4UPVU repo) depends on Phase 2's verifier contract (slug `che-workbench`, aud `artifact_viewer`, purpose `embed`).
- Phase 5 depends on 1+2+3 (code gate `npm test && npm run test:e2e` green) and 4 (a real minted token for the live smoke).
- Phase 6 (Lane A) depends on 5 (live origin) + 4 (token URL). External: none.
- Phase 7 (Lane B) depends on 6 + GATE: App Catalog activation chain (device-code → PVU-IT → env `SP_SPFX_COMPONENT_ID`/`SP_API_BASE_URL` + publish-mcp recreate) + decision record filed first.
- Phase 8 (gadget) depends on GATE: SharePoint HTML pages GA worldwide (mid-Nov–Dec 2026) + kill gate (battery green + perf acceptable + owner still wants it after seeing Lane A).
- Phase 9 depends on GATE: activation chain env live; item 1 (calc-sheet PDFs) also benefits from Phase 6 (real exports).
- Phase 10 depends on 5+6; recurs every 30 days.

## Rollout + Rollback Summary
Rollout: build and gate locally (P1–P3) → mint path ready (P4) → containers live on PVU VPS (P5) → SharePoint front door via Lane A (P6) → managed Lane B and content after the activation chain clears (P7, P9) → gadget only if Microsoft GA + kill gate pass (P8) → monthly rotation ops (P10).
Rollback: every phase has an isolated revert (listed per file). Global kill switches, in order of severity: revoke all tokens for slug `che-workbench` (embed surface dark, direct surface stays up), caddy vhost removal, `docker compose down` (runtime dark), owner deletes the SharePoint page (front door gone, zero footprint). Rollback of P1–P3 keeps the existing AWS chemeng deployment working: brand/locale defaults and the auth flag preserve current behavior when unset.

## Test Matrix (summary; per-task Verify commands live in phase files)
- Unit (Vitest, local): brand preset, vi-default resolution, copilot prompt env-switch, middleware (401 negative controls, expired, revoked, rate-limit 429), token store (fragment read, strip, memory fallback), saves isolation, schema migration on an existing DB file.
- Integration (local, real processes): Express + sidecar pair via compose; Bearer-gated end-to-end copilot fallback.
- End-to-end (Playwright, local `npm run test:e2e`): existing 20 specs stay green with auth flag off; new embed-boot spec with flag on.
- Live smoke (PVU VPS): health 200, bare POST `/api/copilot` 401, Bearer 200, corpus paths 404, vi-default HTML.
- Gadget golden battery (local script): Python oracle vs JS on committed grid, psig/psia mandatory.

## Open Pins (external ETAs only)
- App Catalog activation chain (PVU-IT action) — gates Phase 7 and Phase 9.
- SharePoint HTML pages GA worldwide (Microsoft, mid-Nov–Dec 2026) — gates Phase 8.

## Ultra

ultra: picked=C/5 margin=low unanimous=no rejected_all=no

Best-of-5 verifier pass (kongming, 2026-11-11). Winner 88/100: the only candidate that handled the hardcoded `PDF_PATH` three-dirname walk by design (mount layout, zero code change), classroom-NAT-aware split rate limits (300/min general + 20/min copilot, env-tunable), a docker image-content law gate (`find *.pdf -size +1M` → 0), and the most honest no-cap residual-risk record. Runner-up E 87/100 (best weakest-executor scaffolding + tightest cross-repo token contract). Candidate A scored 85 but was ineligible on the verbatim Failure-Protocol hard constraint (one-word typo in one phase file). Not unanimous (E took the executability criterion); margin low (1 point) — recorded so a later cohort can judge whether the fan-out earned its cost.
