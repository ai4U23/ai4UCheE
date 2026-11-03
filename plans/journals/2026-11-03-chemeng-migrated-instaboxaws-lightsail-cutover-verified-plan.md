---
title: "chemeng migrated InstaBox→AWS Lightsail, cutover verified (plan 261103-1047)"
date: 2026-11-03
summary: 5/5 phases executed same-day; ~60s downtime; DB integrity ok; snapshot taken; watchdog retired; decommission due 2026-11-17
---

# chemeng migrated InstaBox→AWS Lightsail, cutover verified (plan 261103-1047)

## What happened
- Executed plans/261103-1047-chemeng-aws-lightsail-migration end-to-end (--advice --auto; parallel not applicable — hard dependency chain).
- Auth odyssey: expired root profile → IAB org sessions (Management CLI-works but 2-instance cap; Ready Set Build + Identity role-sessions fail AWS per-session authorize server-side, 3× fresh attempts) → user root sign-in revealed henryquan.a.nguyen@gmail.com IS 411156014852 (plan's original D1). Lesson: `aws login` overwrite prompt requires a real TTY — FIFO stdin hits EOF even with live holder; solved with a PTY driver (pty.openpty + select loop auto-answering y).
- Lightsail create-key-pair returned malformed base64 (1-mod-4, twice) → local ssh-keygen ed25519 + import-key-pair.
- Phase 2: instance `chemeng` (debian_13 13.7, medium_3_0 $24, ap-southeast-1a, IP 56.10.65.188); firewall restricted to /32 BEFORE first ssh (port 22 needed ~1 min sshd boot after "running").
- Phase 3: NodeSource candidate pre-verified (v22.23.4); Python 3.13.5; tailscale 1.104.5 via default-browser auth gate (IAB login form caused user trouble) → chemeng-aws 100.84.137.43.
- Phase 4: preflight found uv interpreter at /data/home/.local/share/uv/cpython-3.12.15 — INSIDE the /data/home prefix → plan extended to tar .local too: venv copied verbatim, ZERO version skew, 12/12 imports ok (CoolProp casing matters), rebuild skipped. 1.3GB du parity. Services 200s local+tailnet.
- Phase 5 cutover (user-gated): watchdog backed up+deleted → disable--now old connector → edge 530 drain → writers stopped → sqlite+wal tar (no -shm; no sqlite3 on old box) → integrity ok (2 calcs) → enable--now new → public 200 FIRST TRY (~60s downtime) → per-endpoint asserts pass → hostname swap (chemeng-insta/chemeng, both direct) → ssh config rewrite (Host chemie instie kept for old box) → rollback-runbook.md → snapshot available → docs+memory synced.
- Kongming: 4 checkpoints all GO; adopted atomic disable-first, integrity gate, enable--now rollback, revoke-not-poweroff decommission, pip-freeze concern (moot via copy-path).

## Decision
- Account: 411156014852 (original D1, restored after org-session detours). Old box = chemeng-insta cold rollback until 2026-11-17, then delete + revoke tailnet node + rotate GATEWAY_API_KEY (kongming suggests rotating TODAY, user's call).
- Cost: ~$24/mo + ~$2 snapshot, paid from day 1.

## Next steps
- Watch CF Zero Trust connector for 24-48h flaps (don't rollback on a single blip).
- 2026-11-17: run the decommission checklist in rollback-runbook.md.
- Optional today: rotate GATEWAY_API_KEY (5 min).

> Historical work record — not durable authority. Prefer docs/specs/ADRs for current decisions.
