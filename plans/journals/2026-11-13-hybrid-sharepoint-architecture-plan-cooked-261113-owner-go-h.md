---
title: "Hybrid SharePoint architecture plan cooked 261113 (owner: go hybrid)"
date: 2026-11-13
summary: "261113-1735 plan: dual-lane per surface (native zero-internet + AI window), 6 phases, gates GA canary / GB Graph consent / GC owner choices; kongming conditional-GO amendments applied"
---

# Hybrid SharePoint architecture plan cooked 261113 (owner: go hybrid)

Owner locked the hybrid model 261113 after the lane-capability explanation (sandbox probe-proven: fetch/storage dead -> AI = window lane only). ak-plan --advice drafted plans/261113-1735-sharepoint-hybrid-architecture/: P1 canary+grooming+Graph consent (API route: app-role grant first, engine probe, conditional site grant w/ today's 201 shape; portal fallback on any 403), P2 BOD native mirror (cron dual-publish, in-tree script laws, write-probe preflight so parked days cost no bake, deploy-even-if-parked, request-blocking outage proof), P3 workbench Lane A embed (IAB-executed per owner directive; TTL = explicit GC decision, never silent-default), P4 content ×4 (GB-gated, lane rehearsals first, Stream = least-proven), P5 gadget SHIP + Lite growth (cook order moved 1->5->2 to close the 0638 decision in the first GA-green window), P6 cross-links + ops fold (chatbot page NAV-ONLY — law 3 absolute; native cross-links baked INTO artifacts w/ sandbox link-nav probe; hybrid-doctor stub).
Kongming review: CONDITIONAL GO — caught (1) Create-permission API scope mismatch (Sites.FullControl.All needed; store is audience-agnostic — site grant conditional not default), (2) DevTools-Offline outage sim mechanically impossible -> request-blocking, (3) 6.1 as drafted violated the plan's own additive law 3 (chatbot page edit) -> nav-only, (4) 8/8 battery was session evidence not a committed artifact -> step-0 author it, (5) parked-day bake spend -> preflight. All amendments applied in-file. Gates: GA = 11-14 06:20 canary; GB = Graph consent; GC = owner TTL+executor. Park-not-delegated posture ratified (ephemeral-token law; audit answer demanded before any fallback proposal).

> Historical work record — not durable authority. Prefer docs/specs/ADRs for current decisions.
