---
phase: 5
title: "Cutover & Decommission"
status: done
priority: P1
effort: "60m"
dependencies: [4]
---

# Phase 5: Cutover & Decommission

## Context Links

- [Phase 4](./phase-04-migrate-data-and-services.md) — new box serving green over tailnet; runtime probes passed; `RECORDED sqlite files` from Task 4.0; tunnel unit installed but stopped
- [Phase 2](./phase-02-provision-lightsail.md) — `RECORDED hostname` of the new box (Task 5.6 compares it)
- [plan.md](./plan.md) decision D4 (single-connector: old stops FIRST, gated on success)
- Tunnel `6aeedb2a-9324-4c9a-b75e-650ca6731f7d` → `https://chemeng.ai4u.now` + legacy `https://chemie.ai4u.now`
- Watchdog automation id: `automation-f7a1acdc-717f-42c8-9a9d-9cad0231284d`
- Runtime writes land in `perry_workbench.sqlite` (WAL) on whichever box serves — Task 5.3 therefore does a quiesced final DB sync inside the downtime window

## Overview

Confirm both boxes and the InstaBox CLI, capture + delete the watchdog (the user gate is combined with the pre-cutover check so the fragile window stays short), then cut over in one gated sequence: stop old connector (verified) → quiesce old app + final DB sync → start new connector → disable old connector. Verify publicly with per-endpoint assertions, write a post-swap rollback runbook, swap Tailscale hostnames, snapshot, sync docs + memory, and leave InstaBox as a 14-day cold rollback.

## Execution Evidence (2026-11-03)

- 5.1 combined gate: instabox auth ✓, old-box ssh ok ✓, public 200 ✓, new-box tailnet 200 ✓; user confirmed "Cut over now"
- 5.2: [watchdog-backup.md](./watchdog-backup.md) written; automation `automation-f7a1acdc…` deleted (API confirmed)
- 5.3 gated cutover (kongming hardenings applied): `disable --now` old connector → edge 530 (drained) → writers stopped (no sqlite3 on old box — trio copy correct) → tar-pipe `.sqlite + -wal` (no `-shm`) → **integrity gate `ok`** (2 saved_calculations + 1 screen_states via node better-sqlite3) → `enable --now` new connector → **public 200 FIRST TRY** (3 tunnel registrations). Downtime ≈ 60 s.
- 5.4: health `"status":"ok"` both hostnames (pdf_pages 2274), copilot `"ok":true`, zero `<html>` — all per-endpoint asserts pass
- 5.5: not needed (no failure); rollback-runbook.md written pre-emptively anyway
- 5.6: devices renamed (`chemeng-insta` 100.64.56.26 / `chemeng` 100.84.137.43, both `direct`); laptop ssh config rewritten (old block → `Host chemie instie`, new block → `Host chemeng chemeng-aws`); `ssh-keygen -R` ×2 (needed for 100.84.137.43 too); `ssh chemeng 'hostnamectl --static'` → **ip-172-26-15-212 exact Phase-2 match**; [rollback-runbook.md](./rollback-runbook.md) with post-swap names + `enable --now` old connector (kongming) + 2026-11-17 checklist
- 5.7: snapshot `chemeng-post-migration-261103` → **available**
- 5.8: `docs/deployment-guide.md` section 1 rewritten (Lightsail, IP 100.84.137.43, always-on, snapshot/reboot runbook; zero `instabox resume`, zero stale IP); memory `chemie-vps-deployment.md` + `chemeng-lightsail-migration-plan.md` + `MEMORY.md` hooks updated (`chemeng-insta` present)
- 5.9: port-states = single tcp/22 /32 row, no `0.0.0.0/0`, no IPv6; `instabox list` still shows `chemie`; decommission checklist in runbook

## Requirements

- Public health green on both hostnames served by Lightsail; downtime < 5 min INCLUDING the DB sync
- No window in which two connectors can both be live (all resume paths stop+disable the old connector first)
- Tailscale name `chemeng` → new box; old box renamed `chemeng-insta`; rollback runbook written with post-swap names
- Watchdog automation captured then deleted; docs + memory updated; Lightsail snapshot taken

## Tasks & Steps

### Task 5.1 — Pre-cutover gate (combined with the 5.2 user gate)
- Goal: Everything healthy AND the user is standing by to continue immediately — the old box's 30-min idle suspend must not strike between checks and cutover.
- Steps (from laptop):
  1. `instabox list` exits 0 and shows `chemie` (auth valid — if expired, the user redoes the device-code login NOW, not mid-outage)
  2. `ssh -o ConnectTimeout=8 chemeng 'echo ok'` (if timeout: `instabox resume chemie`, hard-stop fallback `instabox start chemie`, wait ~60 s, retry)
  3. `curl -sS -o /dev/null -w "%{http_code}" https://chemeng.ai4u.now/health` (old, live) → expect `200`
  4. `curl -sS -o /dev/null -w "%{http_code}" http://chemeng-aws:3000/health` (new, tailnet) → expect `200`
  5. Ask the user: "Ready to delete the watchdog and cut over now?" — on yes, run Task 5.2 and Task 5.3 back-to-back with no idle gaps.
- Success criteria: all four checks green; user confirmed.
- Verify: outputs of 1–4 are: `chemie` listed; `ok`; `200`; `200`. If the NEW side is not 200, STOP → Failure Protocol (do not cut over).

### Task 5.2 — Capture and delete the watchdog (USER GATE, inside the combined gate)
- Goal: The 15-min InstaBox watchdog (health-checks the public URL, auto-runs `instabox resume chemie`) cannot fire inside the cutover window, and its definition survives for recreation if rollback becomes permanent.
- Steps:
  1. Write `watchdog-backup.md` in THIS plan directory recording: the automation id, its every-15-min schedule, and its behavior ("check https://chemeng.ai4u.now/health; on failure instabox resume chemie; re-verify /health + /api/copilot/status" — per docs/deployment-guide.md:56).
  2. List automations, locate id `automation-f7a1acdc-717f-42c8-9a9d-9cad0231284d`, delete it.
- Success criteria: backup file exists; automation gone.
- Verify: `watchdog-backup.md` exists in the plan dir and contains the automation id; re-listing automations shows the id is absent.

### Task 5.3 — The cutover: gated sequence with final DB sync (downtime clock starts)
- Goal: Tunnel moves to Lightsail with the authoritative DB on it. Every step is gated on the previous step's verified success — if any gate fails, abort to rollback (Task 5.5) rather than continuing.
- Steps (run back-to-back after the 5.1 gate):
  1. **Stop old connector (GATE):** `ssh chemeng 'sudo systemctl stop cloudflared-chemeng'` then `ssh chemeng 'systemctl is-active cloudflared-chemeng'` — must print `inactive`. If the ssh or the check fails: `ssh chemeng 'sudo systemctl start cloudflared-chemeng'` (restore), STOP → Failure Protocol. NEVER run step 3 while the old connector's state is unverified — two live connectors load-balance production (D4).
  2. **Quiesce old writers + final DB sync** (the authoritative copy — Phase 4's copy was a stale pre-seed):
     a. `ssh chemeng 'sudo systemctl stop perry-workbench perry-workbench-http'` (Express owns the sqlite writes; `perry-engine` may keep running)
     b. Copy exactly the files recorded in Phase 4 Task 4.0 (`RECORDED sqlite files present`), e.g. all three: `ssh chemeng 'sudo tar -C /data/home/ai4UCheE -cf - perry_workbench.sqlite perry_workbench.sqlite-wal perry_workbench.sqlite-shm' | ssh chemeng-aws 'sudo tar -C /data/home/ai4UCheE -xf - && sudo chown user:user /data/home/ai4UCheE/perry_workbench.sqlite*'` (omit whichever of `-wal`/`-shm` the Phase 4 inventory did not list). Writers are stopped, so the trio is quiesced and consistent.
     c. Leave the old app units STOPPED (the box is being decommissioned; this also prevents DB divergence).
  3. **Start new connector:** `ssh chemeng-aws 'sudo systemctl enable --now cloudflared-chemeng'`
  4. **Disable old connector:** `ssh chemeng 'sudo systemctl disable cloudflared-chemeng'` (ssh to the old box already proven alive in step 1 — no suspend race)
- Success criteria: public traffic terminates on Lightsail with the final DB.
- Verify (retry-tolerant — connector-registry lag can 502 for a few seconds; do NOT fail on a transient first error):
  - `ssh chemeng-aws 'journalctl -u cloudflared-chemeng -n 5 --no-pager'` shows a line containing `Registered tunnel connection` (exit 0), AND
  - `for i in $(seq 1 12); do CODE=$(curl -sS -o /dev/null -w "%{http_code}" https://chemeng.ai4u.now/health); echo "$CODE"; [ "$CODE" = "200" ] && break; sleep 10; done` — pass: last printed line is `200` within ≤120 s.

### Task 5.4 — Public verification sweep (per-endpoint assertions)
- Goal: All user-facing surfaces confirmed on the new box — each endpoint checked against its REAL response shape.
- Steps:
  1. `curl -sS https://chemeng.ai4u.now/health`
  2. `curl -sS https://chemie.ai4u.now/health` (legacy alias)
  3. `curl -sS https://chemeng.ai4u.now/api/copilot/status`
- Success criteria: healthy payloads on all three.
- Verify: commands 1–2 exit 0 and print JSON containing `"status"` and NOT containing `<html`; command 3 exits 0 and prints JSON containing `"ok":true` and NOT containing `<html` (the copilot status body is `{ok, gatewayUrl, model, tier2}` — it has no `status` key).

### Task 5.5 — Rollback path (only if 5.3/5.4 fail)
- Goal: Production restored on the old box INCLUDING the writes the new box accepted during the incident.
- Steps (only after Failure Protocol counsel or user instruction):
  0. `instabox list` (auth) and `ssh -o ConnectTimeout=8 chemeng 'echo ok'`; if down: `instabox resume chemie` (fallback `instabox start chemie`), wait ~60 s.
  1. Stop the new box's writers: `ssh chemeng-aws 'sudo systemctl stop perry-workbench perry-workbench-http'` (if ssh to the new box is dead, SKIP steps 1–2 and declare the DB gap in the incident report — the writes of the incident window are lost)
  2. Reverse DB sync (new → old): tar the sqlite trio `chemeng-aws → chemeng` exactly as Task 5.3 step 2b, with `sudo chown user:user` on the old box after extract
  3. Kill the new connector for good: `ssh chemeng-aws 'sudo systemctl disable --now cloudflared-chemeng'` (disable, not just stop — a Lightsail reboot must not resurrect it)
  4. Restart old services + connector: `ssh chemeng 'sudo systemctl start perry-engine perry-workbench perry-workbench-http cloudflared-chemeng'`
  5. Re-run Task 5.4 Verify — must pass against the old box.
- Success criteria: public site healthy again from InstaBox with the newest DB.
- Verify: Task 5.4 pass conditions hold. Then STOP — root-cause on the new box via its tailnet endpoints before re-attempting cutover; re-attempt re-runs 5.3 (which re-syncs the DB old→new first).

### Task 5.6 — Tailscale hostname swap + SSH hygiene + rollback runbook (post-swap names)
- Goal: The name `chemeng` points at Lightsail; laptop ssh keeps working; the rollback runbook uses names that REMAIN VALID for the whole 14-day window.
- Steps (after ~30 min of stable public traffic):
  0. If `ssh -o ConnectTimeout=8 chemeng 'echo ok'` times out (old box idle-suspended): `instabox resume chemie` (fallback `instabox start chemie`), wait ~60 s. **Immediately after a resume, stop+disable the old connector BEFORE anything else** (boot auto-starts every enabled unit, and a second connector would split-brain production — the exact catastrophe D4 prevents): `ssh chemeng 'sudo systemctl stop cloudflared-chemeng && sudo systemctl disable cloudflared-chemeng'`
  1. `ssh chemeng 'sudo tailscale set --hostname chemeng-insta'` — then verify propagation: `tailscale status | grep chemeng-insta` (from laptop). **InstaBox-resume quirk (documented):** `tailscale set` can exit 0 without propagating when tailscaled's control session dropped during suspend — if the name has not appeared after 60 s: `ssh chemeng 'sudo systemctl restart tailscaled'`, wait 15 s, re-run the `set --hostname` and the check.
  2. `ssh chemeng-aws 'sudo tailscale set --hostname chemeng'`
  3. Laptop `~/.ssh/config`: REMOVE the old `Host chemeng` block if any pre-exists (first-match wins), and REWRITE the Phase 3 block so NO `HostName` line remains (a stale `HostName chemeng-aws` would outlive the retired name):
     ```
     Host chemeng chemeng-aws
         User admin
     ```
  4. Purge the stale host key: `ssh-keygen -R chemeng`
  5. Write `rollback-runbook.md` in THIS plan directory using POST-swap names (old box = `chemeng-insta`, new box = `chemeng`) and both boxes' tailnet IPs (`ssh chemeng-insta 'tailscale ip -4'`, `ssh chemeng 'tailscale ip -4'`), containing the Task 5.5 sequence + resume/auth preliminaries + "disable new connector before starting old" warning.
- Success criteria: both names resolve correctly; `ssh chemeng` reaches the new box; runbook exists with current names.
- Verify: `tailscale status` prints a line for `chemeng-insta` AND one for `chemeng`; AND `ssh chemeng 'hostnamectl --static'` prints exactly Phase 2's `RECORDED hostname`; AND `ssh chemeng 'systemctl is-active perry-workbench'` prints `active`; AND `rollback-runbook.md` exists in the plan dir and contains `chemeng-insta`. MagicDNS can lag ~1 min — on name mismatch wait 60 s and re-check (but a persistent failure after the tailscaled restart in step 1 is a real failure, not propagation lag).

### Task 5.7 — Snapshot the new instance
- Goal: One-click restore point immediately post-migration (~$0.05/GB-month ≈ $2/mo).
- Steps: `aws lightsail create-instance-snapshot --instance-snapshot-name chemeng-post-migration-261103 --instance-name chemeng --region ap-southeast-1`
- Success criteria: snapshot reaches `available`.
- Verify: `aws lightsail get-instance-snapshots --region ap-southeast-1 --query "snapshots[?name=='chemeng-post-migration-261103'].state" --output text` prints `available` (poll up to 5 min).
- Note: the snapshot embeds `.env` + tunnel creds — it is private to account 411156014852; its keep-or-delete decision is on the 2026-11-17 checklist (Task 5.9).

### Task 5.8 — Docs + memory sync (repo invariant #6)
- Goal: Documentation matches reality — INCLUDING the new tailnet IP.
- Target files: modify `docs/deployment-guide.md` (repo) and `/Users/nad/.zcode/cli/memories/projects/ai4uchee-31a2320853275881/memory/chemie-vps-deployment.md` (create the file if missing — do not treat absence as an error).
- Steps:
  1. In `deployment-guide.md`: replace InstaBox sections — provider = AWS Lightsail (2 vCPU/4 GB, `ap-southeast-1`, Debian 13, account 411156014852); replace every occurrence of the old tailnet IP `100.64.56.26` with the new box's IP (`ssh chemeng 'tailscale ip -4'`); delete the "Keep-Alive / Free-Plan Constraints / watchdog" section and every `instabox resume` reference; keep checkout path `/data/home/ai4UCheE`, the four units, tunnel, and hostnames; add snapshot + `aws lightsail reboot-instance` runbook lines.
  2. Update the memory file: new host facts (Lightsail, `chemeng` = new box, old box `chemeng-insta` retained until 2026-11-17 then deleted), watchdog retired 2026-11-03, snapshot name, InstaBox-resume tailscaled quirk preserved.
- Success criteria: docs describe Lightsail; no stale IP; zero operational `instabox` references (historical mentions OK).
- Verify: `rg -n "instabox resume" docs/deployment-guide.md` returns no matches (exit 1); AND `rg -n "Lightsail" docs/deployment-guide.md` returns ≥ 1 match; AND `rg -n "100\.64\.56\.26" docs/deployment-guide.md` returns no matches (exit 1); AND the memory file contains `chemeng-insta`.

### Task 5.9 — Post-cutover hardening + 14-day rollback window + decommission checklist
- Goal: Close temporary access paths; keep InstaBox paused (NOT deleted) until 2026-11-17; leave a written checklist for that day.
- Steps:
  1. Firewall posture check: `aws lightsail get-instance-port-states --instance-name chemeng --region ap-southeast-1`. Requirement: NO rule has cidr `0.0.0.0/0`. The key-only /32 tcp/22 rule may stay. (Fully removing the last rule is a Lightsail console action — Networking → IPv4 firewall → delete the SSH rule — do not attempt an empty rule set via CLI.)
  2. Old box: leave as-is (app units stopped, connector stopped+disabled, data intact). Do NOT run `instabox delete` in this phase.
  3. Write the 2026-11-17 decommission checklist into `rollback-runbook.md`: (a) confirm 14 days stable; (b) `instabox delete chemie` (destroys its copies of `.env` + tunnel creds); (c) rotate `GATEWAY_API_KEY` (it lived on third-party InstaBox infra); (d) snapshot `chemeng-post-migration-261103` keep-or-delete decision; (e) no watchdog recreation needed (Lightsail is always-on).
  4. Optionally schedule a one-shot reminder for 2026-11-17 (user decision that day).
- Success criteria: nothing world-open; rollback window + checklist documented.
- Verify: the port-states table contains no `0.0.0.0/0` row; AND `instabox list` still shows machine `chemie`; AND `rollback-runbook.md` contains the string `2026-11-17`.

## Security Considerations

- No laptop staging dir exists in this plan (tar pipes only) — nothing to clean locally.
- Old box retains `.env` + tunnel creds until 2026-11-17; connector stopped+disabled on every path that touches it (5.3.4, 5.5, 5.6.0), so it cannot serve; `cert.pem` was never copied (Phase 4 Task 4.1).
- Snapshot embeds `.env` — private to the AWS account; retention decided 2026-11-17.

## Risk Assessment

- Cloudflare connector registration race: bounded; worst case a few seconds of 502 absorbed by the Task 5.3 retry loop.
- Downtime budget: step 5.3.1 → 5.3.3 spans two ssh calls + one ~few-MB tar — typically 1–2 min, well under the 5-min goal.
- Watchdog deleted (5.2): old box loses its resume net — mitigation is the combined 5.1 gate (user present, back-to-back execution) and the rollback runbook's manual resume; if rollback stands >24 h, recreate the watchdog from `watchdog-backup.md`.
- Cost reality: ~$24/mo instance + ~$2/mo snapshot from day 1 (trial not assumed).

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
