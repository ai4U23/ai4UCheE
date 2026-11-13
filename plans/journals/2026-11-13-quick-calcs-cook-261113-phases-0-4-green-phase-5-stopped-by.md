---
title: "Quick-Calcs cook 261113: phases 0-4 green; phase 5 stopped by tenant grant removal"
date: 2026-11-13
summary: 6 commits; probe LANE_GREEN; pilot blocked-external (EffectiveBasePermissions zeroed); BOD cron canary expected FAILED from 11-14
---

# Quick-Calcs cook 261113: phases 0-4 green; phase 5 stopped by tenant grant removal

Cook of plans/261113-0638-quick-calcs-html-pages (--advice --auto --parallel):
- Phase 0 gauge fix e7b0565 (red pin -> one-line ureg fix -> 46/46).
- Phase 1 probe: Graph lane found DEAD (no Graph app roles, roles=None) -> SP REST transport amendment (kongming); uploads 200 both placements 06:58 ICT; IAB render GREEN (INLINE_SCRIPT_OK/STORAGE_BLOCKED/FETCH_BLOCKED); verdict LANE_GREEN placement=either; read-403 asymmetry recorded. d6e5b4e.
- Phase 2 delegate build: 426KB single file, 20 woff2 inlined, audits 0-ext/0-net, port smokes bit-identical. d6e5b4e.
- Phase 3 battery ALL GREEN 377/0 (grid: equivalence pairs, barg/kpag, vacuum). 7b733d6.
- Phase 4 perf p95 12-13ms @ 4x throttle (--retries=0, warm-up). ec29072.
- Water rhol SECOND engine data bug found (77,408 kg/m3 at NBP): printed Perry 9th Table 2-32 footnote (p. 2-99) EXEMPTS water from Eq 105 -> cubic 2-100 constants transcribed from the PDF page image; anchors exact (999.8/972.8); 2-line fix 5c0c8e3 + plausibility sweep 10/10 6ad496c; battery re-green, suite 46/46.
- Phase 5 STOPPED ~07:35 ICT: ALL write shapes 403 (matrix), EffectiveBasePermissions High=0x0 Low=0x0 -> site permission entry removed/zeroed in window 2026-11-12 23:58-00:40 UTC. Blocked-EXTERNAL; restore = owner re-grant Write (their own round-2 doc command). Stop report reports/phase5-stop-2026-11-13.md.
- BOD collateral (same appid, verified): today 06:20 bake is fresh; from 11-14 expect FAILED cron signature until restore; page stays up on stale bake.
- Owner asks batched: Write re-grant + audit question + Graph Sites.Selected consent + engine redeploy (2 fixes) + G2 held (grown list incl. Lane A clicks + TTL + sharing).

> Historical work record — not durable authority. Prefer docs/specs/ADRs for current decisions.
