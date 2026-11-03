# Rollback Runbook — chemeng.ai4u.now (post-cutover, names valid 2026-11-03 → 2026-11-17)

**Written**: 2026-11-03 after cutover + hostname swap. Names below are the POST-swap ones.

| Box | Tailnet name | Tailnet IP | Role |
|---|---|---|---|
| AWS Lightsail (`chemeng`, ap-southeast-1a, public 56.10.65.188) | `chemeng` | `100.84.137.43` | **production** |
| InstaBox `chemie` (suspended when idle) | `chemeng-insta` | `100.64.56.26` | cold rollback (until 2026-11-17) |

## When to roll back
Lightsail serves broken responses (5xx / wrong payload) for >10 min and root-causing on the new box fails.

## Rollback sequence (execute top to bottom; ~5 min)
1. **Auth + liveness**: `instabox list` (redo device-code login if expired); `ssh -o ConnectTimeout=8 chemeng-insta 'echo ok'` — if timeout: `instabox resume chemie` (fallback `instabox start chemie`), wait ~60 s.
2. **Stop new writers**: `ssh chemeng 'sudo systemctl stop perry-workbench perry-workbench-http'` (if ssh to new box is dead, SKIP to 4 and declare the DB gap in the incident report — writes of the incident window are lost).
3. **Reverse DB sync (new → old)**:
   `ssh chemeng 'sudo tar -C /data/home/ai4UCheE -cf - perry_workbench.sqlite perry_workbench.sqlite-wal' | ssh chemeng-insta 'sudo tar -C /data/home/ai4UCheE -xf - && sudo chown user:user /data/home/ai4UCheE/perry_workbench.sqlite*'`
4. **Kill the new connector for good**: `ssh chemeng 'sudo systemctl disable --now cloudflared-chemeng'` (a Lightsail reboot must not resurrect it into split-brain).
5. **Restart old stack**: `ssh chemeng-insta 'sudo systemctl enable --now perry-engine perry-workbench perry-workbench-http cloudflared-chemeng'` (enable --now, not just start — kongming).
6. **Verify**: `curl -sS https://chemeng.ai4u.now/health` → `{"status":"ok",...}` and `curl -sS https://chemeng.ai4u.now/api/copilot/status` → `{"ok":true,...}`.
7. **Standby posture**: if the rollback stands >24 h, recreate the watchdog automation from [watchdog-backup.md](./watchdog-backup.md). Root-cause the new box via `ssh chemeng …` tailnet endpoints before re-attempting cutover; a retry re-runs Phase 5 Task 5.3 (which re-syncs the DB old→new first).

## 2026-11-17 decommission checklist (user-gated, run only after 14 stable days)
- [ ] Confirm 14 days stable on Lightsail (no unexplained 5xx, snapshot in place).
- [ ] `instabox delete chemie` — destroys the old box (its `.env` copy + tunnel creds die with it).
- [ ] **Revoke, not just delete**: remove `chemeng-insta` from the tailnet (`tailscale logout` was NOT run on it — remove via admin console or `ssh chemie 'sudo tailscale logout'` before deleting); the old box's `/etc/cloudflared/cert.pem` (account-level origin credential, never copied to Lightsail) dies with the box — verify after delete that `cert.pem` copies exist nowhere else.
- [ ] Rotate `GATEWAY_API_KEY` (it lived on third-party InstaBox infra; new box reads it from `/data/home/ai4UCheE/.env` — update there + restart `perry-workbench`).
- [ ] Snapshot `chemeng-post-migration-261103` keep-or-delete decision (~$0.05/GB-month; embeds `.env` — private to account 411156014852).
- [ ] Confirm no watchdog recreation needed (Lightsail always-on).
