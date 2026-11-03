---
phase: 2
title: "Provision Lightsail Instance"
status: done
priority: P1
effort: "15m"
dependencies: [1]
---

# Phase 2: Provision Lightsail Instance

## Context Links

- [Phase 1](./phase-01-start.md) — supplies `blueprint-id`, `bundle-id`, and PEM path `~/.ssh/chemeng-lightsail.pem`
- [plan.md](./plan.md) decisions D1–D3 (account 411156014852, 2 vCPU/4 GB, ap-southeast-1)

## Overview

Create the `chemeng` Lightsail instance in `ap-southeast-1a`, wait for `running`, **restrict the firewall before first login** (the Debian blueprint ships tcp/22 AND tcp/80 open to the world), then SSH in as `admin` and record the platform facts later phases compare against.

## Requirements

- Instance `chemeng` in state `running`, Debian 13 amd64, 2 vCPU/4 GB dual-stack
- `ssh admin@<public-ip>` works with the Phase 1 PEM
- Public port list contains ONLY tcp/22 restricted to the laptop's /32
- New box's literal hostname recorded below (Phase 5 compares against it)

## Tasks & Steps

### Task 2.1 — Create the instance
- Goal: A running Lightsail instance named `chemeng`.
- Target files: none (AWS-side resource).
- Steps:
  1. Substitute the IDs recorded in Phase 1 into: `aws lightsail create-instances --instance-names chemeng --availability-zone ap-southeast-1a --blueprint-id <RECORDED-blueprint-id> --bundle-id <RECORDED-bundle-id> --key-pair-name chemeng-lightsail --region ap-southeast-1`
- Success criteria: command exits 0 and prints an operations list containing `"status": "NotStarted"` or `"Succeeded"`.
- Verify: `aws lightsail get-instance-state --instance-name chemeng --region ap-southeast-1` eventually prints `running` (poll up to 10 × 30 s: `for i in $(seq 1 10); do aws lightsail get-instance-state ... --query state.name --output text; sleep 30; done`).

### Task 2.2 — Restrict the public firewall BEFORE first login
- Goal: Only tcp/22 from the laptop's current IP is publicly reachable. The blueprint's default rule set (tcp/22 + tcp/80 open to all) is replaced in one call.
- Target files: none (Lightsail firewall).
- Steps:
  1. `MYIP=$(curl -sS https://checkip.amazonaws.com)` (expect a dotted quad)
  2. `IP=$(aws lightsail get-instance --instance-name chemeng --region ap-southeast-1 --query instance.publicIpAddress --output text)` — record below.
  3. `aws lightsail put-instance-public-ports --instance-name chemeng --region ap-southeast-1 --port-infos fromPort=22,toPort=22,protocol=tcp,cidrs=$MYIP/32`
- Success criteria: port 22 open only to the /32; tcp/80 and everything else closed (workload is served via outbound Cloudflare Tunnel — decision D6).
- Verify: `aws lightsail get-instance-port-states --instance-name chemeng --region ap-southeast-1 --query "portStates[].{port:fromPort,proto:protocol,cidr:cidrs[0]||cidrListAliases[0]}" --output table` shows exactly one row: `22 | tcp | <MYIP>/32`.

```
RECORDED public-ip: 56.10.65.188
```

### Task 2.3 — First SSH and platform check
- Goal: Confirm OS matches the old box (Debian 13, x86_64) so Phase 4's copy of `.venv`/`node_modules` is binary-compatible, and record the literal hostname for Phase 5.
- Target files: this file — fill the `RECORDED hostname:` line.
- Steps:
  1. `ssh -i ~/.ssh/chemeng-lightsail.pem -o StrictHostKeyChecking=accept-new admin@$IP 'uname -m && cat /etc/debian_version && hostnamectl --static'`
- Success criteria: SSH succeeds without password; outputs recorded.
- Verify: output line 1 is exactly `x86_64` AND line 2 starts with `13.` (Debian 13 = trixie) AND line 3 is a short hostname (record it). If Debian version differs, STOP → Failure Protocol (decision D5 breaks).

```
RECORDED hostname: ip-172-26-15-212
```

<!-- Executed 2026-11-03 on account 411156014852 (henryquan root, see plan.md D1 revision
     history): instance running in ~30s; port 22 initially refused for ~1 min while sshd
     booted, then up. Firewall verified: exactly one rule tcp/22 from 171.245.228.7/32,
     no IPv6 rules, no 0.0.0.0/0. -->

## Security Considerations

- Window between instance creation and Task 2.2 is minutes at most; Debian blueprint is key-only auth, so exposure is low but nonzero — run 2.2 immediately after the `running` poll, before anything else.
- If the laptop IP changes later (CGNAT/fiber renewal) and SSH breaks mid-phase: re-run Task 2.2 steps with the new `MYIP` to refresh the /32. After Phase 3 everything moves to Tailscale and the public rule can be deleted entirely (Phase 5 follow-up).
- No static IP attached (decision D6): the dynamic IPv4 may change across stop/start — durable access is Tailscale + outbound tunnel only.

## Risk Assessment

- Availability zone: if `ap-southeast-1a` lacks capacity for the bundle, retry once with `ap-southeast-1b` — any AZ in-region is fine.

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
