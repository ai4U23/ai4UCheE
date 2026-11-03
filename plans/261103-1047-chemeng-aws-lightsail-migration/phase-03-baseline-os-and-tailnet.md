---
phase: 3
title: "Baseline OS & Tailnet Join"
status: done
priority: P1
effort: "30m"
dependencies: [2]
---

# Phase 3: Baseline OS & Tailnet Join

## Context Links

- [Phase 2](./phase-02-provision-lightsail.md) — supplies `<public-ip>` and working `admin` SSH
- Tailnet: `duc.a.nguyen@` — new host joins as **`chemeng-aws`** (name swap happens in Phase 5)

## Overview

Install the runtime stack (Node 22, Python 3.13 check, Tailscale), create the `user` account and `/data/home` directory used verbatim by the migrated systemd units (decision D5), and bring the instance onto the tailnet so all later work happens over Tailscale SSH instead of public SSH.

## Requirements

- `node --version` = v22.x on the instance; `python3 --version` ≥ 3.13
- OS user `user` exists; `/data/home` exists owned by `user:user`
- `tailscale status` on the laptop lists `chemeng-aws`; `ssh chemeng-aws` resolves from the laptop

## Execution Evidence (2026-11-03)

- Node v22.23.4 (NodeSource candidate verified via `apt policy nodejs` before install — kongming hardening), Python 3.13.5
- `user` (uid 1001) + `/data/home` owned `user:user`, write test passed
- Tailscale 1.104.5; device authed via user's browser gate (default browser, link `login.tailscale.com/a/12336ce7015241`) — **tailnet IP `100.84.137.43`** (needed for the Phase 5 docs update); `set --hostname chemeng-aws` propagated instantly; `set --ssh=true` done
- Laptop `~/.ssh/config` got `Host chemeng-aws / User admin` — **written directly in the final no-HostName form** (red-team fix pre-applied); first-contact needed `StrictHostKeyChecking=accept-new`, now cached; `ssh chemeng-aws whoami` → `admin`

## Tasks & Steps

### Task 3.1 — System packages + runtime
- Goal: Node 22 and base tooling installed; system Python confirmed.
- Target files: none (apt state).
- Steps (all via `ssh -i ~/.ssh/chemeng-lightsail.pem admin@$IP`):
  1. `sudo apt-get update && sudo apt-get install -y curl ca-certificates gnupg rsync`
  2. Node 22 (NodeSource): `curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash - && sudo apt-get install -y nodejs`
- Success criteria: apt exits 0, node binary present.
- Verify: `ssh ... admin@$IP 'node --version && python3 --version'` prints lines matching `v22.` and `3.13` respectively. If Python < 3.13, STOP → Failure Protocol (the system Python 3.13 is required by Phase 4 Task 4.4's venv rebuild path).

### Task 3.2 — Create `user` and `/data/home`
- Goal: Migration paths exist so units copied in Phase 4 run verbatim (D5).
- Target files: OS account `user`; directory `/data/home` (plain dir on root disk — Lightsail root disk replaces the old `/data` volume).
- Steps:
  1. `sudo useradd -m -s /bin/bash user`
  2. `sudo mkdir -p /data/home && sudo chown user:user /data/home`
- Success criteria: `id user` resolves; directory writable by `user`.
- Verify: `ssh ... admin@$IP 'id user && sudo -u user touch /data/home/.wtest && ls -l /data/home/.wtest && sudo -u user rm /data/home/.wtest'` exits 0.

### Task 3.3 — Install Tailscale and join tailnet (USER GATE)
- Goal: Instance reachable on the tailnet as `chemeng-aws`.
- Target files: none.
- Steps:
  1. `curl -fsSL https://tailscale.com/install.sh | sh`
  2. `sudo tailscale up` — prints a `https://login.tailscale.com/a/...` auth URL. The human user opens it and approves the device (browser gate). Do NOT background this step; capture the URL output.
  3. `sudo tailscale set --hostname chemeng-aws`
  4. `sudo tailscale set --ssh=true` (enables Tailscale SSH as a second access path)
- Success criteria: device appears on tailnet with the right name.
- Verify: on the LAPTOP `tailscale status | grep chemeng-aws` prints one line (non-empty). If after approval the hostname still shows differently, re-run step 3 and re-check.

### Task 3.4 — Laptop SSH config for `chemeng-aws`
- Goal: Later phases use the short name `chemeng-aws` (and old `chemeng`) without PEM flags.
- Target files: modify `~/.ssh/config` (laptop) — append:
  ```
  Host chemeng-aws
      HostName chemeng-aws
      User admin
  ```
  (Tailscale MagicDNS resolves the name; `admin` is the Debian blueprint sudo user.)
- Steps: append block, then test.
- Success criteria: `ssh chemeng-aws whoami` works keylessly via tailnet.
- Verify: `ssh chemeng-aws whoami` prints `admin` and exits 0. From this point on, all instance commands in Phases 4–5 use `ssh chemeng-aws`.

## Security Considerations

- Tailscale SSH (`set --ssh=true`) provides identity-based access; combined with the Phase 2 /32 rule, public exposure is minimal. Keys/tokens: none created here.

## Risk Assessment

- If the tailnet requires device approval by another admin, the user gate in Task 3.3 blocks — that is expected; wait for approval, do not bypass.

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
