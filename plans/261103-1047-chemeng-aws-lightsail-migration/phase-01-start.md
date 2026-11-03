---
phase: 1
title: "Account Gate & Provisioning Prep"
status: done
priority: P1
effort: "15m"
dependencies: []
---

# Phase 1: Account Gate & Provisioning Prep

## Context Links

- [plan.md](./plan.md) — locked decisions D1–D6
- `docs/deployment-guide.md` — current InstaBox deployment (source of truth being migrated)
- AWS profile: `default` → account `411156014852`, region `ap-southeast-1`

## Overview

Re-authenticate the AWS CLI on the laptop, discover the exact Lightsail blueprint/bundle IDs for Debian 13 and the 2 vCPU/4 GB bundle in `ap-southeast-1`, and create the SSH key pair used to reach the fresh instance before Tailscale is installed.

## Requirements

- `aws sts get-caller-identity` succeeds against account `411156014852`
- Exact `blueprint-id` (Debian 13) and `bundle-id` (2 vCPU/4 GB) recorded below after discovery
- Lightsail SSH key pair `chemeng-lightsail` exists with a local `600`-mode PEM

## Tasks & Steps

### Task 1.1 — Re-authenticate AWS CLI (USER GATE)
- Goal: AWS CLI session is valid for account 411156014852.
- Target files: none (local `~/.aws` session).
- Steps:
  1. Run `aws login` (AWS Builder ID / Identity Center browser flow — the human user completes the browser prompt). If the CLI reports `invalid choice`, the fallback on this setup is `aws sso login` — try it before escalating.
- Success criteria: `aws login` (or fallback) exits 0 without an expiry error.
- Verify: `aws sts get-caller-identity --output json` exits 0 AND output contains `"Account": "411156014852"`.

### Task 1.2 — Discover blueprint and bundle IDs
- Goal: Record the exact CLI IDs needed by Phase 2 (never guess these).
- Target files: this file — fill the two `RECORDED:` lines in the Requirements section.
- Steps:
  1. `aws lightsail get-blueprints --region ap-southeast-1 --query "blueprints[?contains(blueprintId, 'debian')].{id:blueprintId,name:name,version:version,isActive:isActive}" --output table`
  2. Pick the row whose `name` contains **Debian 13** (aka trixie) with `isActive=True`. If NO Debian 13 row exists, STOP → Failure Protocol: Debian 13 is a hard requirement (Phase 2's platform gate and Phase 4's copied-runtime compatibility both assume it; Debian 12's older glibc would additionally break every copied native module). Do NOT substitute another Debian version.
  3. `aws lightsail get-bundles --region ap-southeast-1 --query "bundles[?isActive==\`true\`].{id:bundleId,name:name,cpu:cpuCount,ram:ramSizeInGb,disk:diskSizeInGb,priceUsd:price}" --output table`
  4. Pick the row with `cpu=2`, `ram=4`, `disk=80`, price ≈ **24 USD** (dual-stack; name like "Medium"). **Do NOT pick the ~$20 row — that is the IPv6-only variant** (bundle id contains `ipv6`); it has no managed NAT64 and breaks IPv4-only apt/GitHub endpoints. Record the dual-stack `id`.
- Success criteria: both IDs identified from real API output.
- Verify: the two `RECORDED:` lines below are filled and each matches a row from the command outputs (compare strings).

```
RECORDED blueprint-id: debian_13 (Debian 13.7, isActive=True — verified 2026-11-03)
RECORDED bundle-id: medium_3_0 (2 vCPU / 4 GB / 80 GB, $24.00, dual-stack — NOT *_ipv6_*)
```

<!-- Executed 2026-11-03: Task 1.1 completed via the in-app browser's AI4U org session
     (Management Account, AccountFullAccessRole) after the root-login path proved
     impractical and Ready Set Build (953483531752) failed AWS's authorize step
     server-side; account decision D1 revised accordingly. Task 1.3 note: Lightsail's
     returned privateKeyBase64 was malformed on this machine — solved by generating a
     local ed25519 keypair and importing the public half via import-key-pair. -->

### Task 1.3 — Create Lightsail SSH key pair
- Goal: A local PEM lets the executor SSH to the instance as `admin` before Tailscale exists.
- Target files: create `~/.ssh/chemeng-lightsail.pem` (mode 600).
- Steps:
  1. `aws lightsail create-key-pair --key-pair-name chemeng-lightsail --region ap-southeast-1 --query privateKeyBase64 --output text | base64 --decode > ~/.ssh/chemeng-lightsail.pem`
  2. `chmod 600 ~/.ssh/chemeng-lightsail.pem`
- Success criteria: PEM file exists and holds a valid private key.
- Verify: `ssh-keygen -y -f ~/.ssh/chemeng-lightsail.pem` exits 0 and prints a line starting with `ssh-`.

## Security Considerations

- The PEM is a server-root credential: never commit it, never print its contents. Only `ssh-keygen -y` output (public part) is safe to display.
- If `chemeng-lightsail` already exists in the account, `create-key-pair` fails — then either download via console or delete the old key first; do not overwrite blindly.

## Risk Assessment

- Free-trial eligibility (decision D1): the legacy 3-month Lightsail trial does NOT cover the 4 GB bundle — assume ~$24/mo from day 1; console Billing page credits (if any) are a bonus, not a dependency.

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
