---
title: "chemeng InstaBox→Lightsail migration plan (261103-1047, --advice)"
date: 2026-11-03
summary: "5-phase always-on Lightsail migration plan; account 411156014852 selected; kongming + 3-persona red team (15 findings, 14 applied)"
---

# chemeng InstaBox→Lightsail migration plan (261103-1047, --advice)

## What happened
- InstaBox Free unreliability (30-min idle suspend, 8-h cap, watchdog necessity) triggered migration planning for chemeng.ai4u.now.
- Live-scouted the old box 2026-11-03: 4 systemd units verbatim, /etc/cloudflared config (tunnel 6aeedb2a), 733 MiB RAM / 1.3 GB data used, Node v22, system Python 3.13.
- Researcher corrected stale pricing: 2vCPU/4GB dual-stack = $24/mo ($20 is IPv6-only, rejected — no NAT64); Debian 13 blueprint confirmed; legacy 3-mo trial does NOT cover the 4GB bundle.
- Account selected: 411156014852 (locally configured, ap-southeast-1 default, executor-ready); second account adds friction, no advantage.
- Kongming (GO-WITH-CHANGES): remote→remote rsync impossible → tar-over-ssh pipes via laptop; retry-tolerant cutover verify; ssh-config/known-hosts hygiene; watchdog retire BEFORE cutover; probe hardening. All applied.
- 3-persona red team (Security/FailureMode/Assumption, Full tier): 26 raw → 15 deduped findings, 14 accepted+applied, 1 rejected ("aws login doesn't exist" — contradicted by live CLI v3 error text).
- Critical catches: (1) live WAL SQLite tar'd mid-write → quiesced final DB sync added inside cutover window + reverse sync in rollback; (2) venv documented uv-managed 3.12, interpreter outside copy scope → preflight readlink probe + rebuild as conditional mainline; (3) `import coolprop` case bug on Linux (must be CoolProp) + 6/13 dep coverage; plus split-brain dual-connector paths, stale HostName/IP/cert.pem lifecycle, instabox start fallback, tailscaled-restart rename quirk.

## Decision
- Plan dir: plans/261103-1047-chemeng-aws-lightsail-migration (plan.md + 5 phases, --advice handover contract: per-task Goal/Steps/Success/Verify + literal Failure Protocol in every phase).
- D1 account 411156014852; D2 $24 dual-stack medium; D3 ap-southeast-1; D4 single-connector stop-old-first (gated); D5 path parity w/ conditional venv rebuild; D6 no DNS/tunnel changes.
- Whole-plan consistency sweep: 0 unresolved contradictions; ak plan parse clean (5 phases pending).

## Next steps
- Execute: /ak-cook plans/261103-1047-chemeng-aws-lightsail-migration/plan.md --advice
- User gates: aws login (P1), tailscale device auth (P3), combined cutover confirm (P5).
- 2026-11-17 decommission checklist lands in rollback-runbook.md during P5.

> Historical work record — not durable authority. Prefer docs/specs/ADRs for current decisions.
