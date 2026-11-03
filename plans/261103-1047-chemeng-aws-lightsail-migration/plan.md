---
title: "Migrate chemeng VPS from InstaBox to AWS Lightsail"
description: "Always-on Lightsail replacement for the unreliable InstaBox Free sandbox hosting chemeng.ai4u.now"
status: completed
priority: P1
effort: 3h
tags: [infra, migration, lightsail, deployment]
blockedBy: []
blocks: []
created: 2026-11-03
---

# Migrate chemeng VPS from InstaBox to AWS Lightsail

## Overview

Replace the InstaBox Free sandbox (`chemie`, Tailscale host `chemeng`, 30-min idle suspend / 8-h max runtime, 15-min watchdog) with an always-on **AWS Lightsail** instance serving the identical workload: `perry-engine` FastAPI (:8001), `perry-workbench` Express (:3000), `perry-workbench-http` (:80), and `cloudflared-chemeng` tunnel for `https://chemeng.ai4u.now`.

**This plan is authored under the `--advice` handover contract**: every phase decomposes into tasks with mechanical pass conditions and a literal Failure Protocol, ready for a downstream executor model.

## Locked Decisions (user-confirmed 2026-11-03)

| # | Decision | Value | Rationale |
|---|----------|-------|-----------|
| D1 | AWS account | **411156014852** (root, `henryquan.a.nguyen@gmail.com`) | **Confirmed 2026-11-03 after an auth odyssey** (kept the ORIGINAL plan value): the expired default-profile root session was refreshed via the in-app browser — user signed in with the henryquan root credentials, revealing henryquan.a.nguyen@gmail.com **is** account 411156014852. Interim detours (all reverted): the AI4U org sessions (Management `152174417542` — CLI-works but capped at 2 instances; Identity `038635649185` and Ready Set Build `953483531752` — both fail AWS's per-session authorize step server-side with an opaque error). This account holds `procaffe-vps` (1/2 slots — one free for chemeng). Free-trial/credits: UNVERIFIED — plan assumes paid from day 1 (~$24/mo). |
| D2 | Bundle | **2 vCPU / 4 GB dual-stack, $24/mo** | Live workload measured 2026-11-03: 733 MiB RAM used, 1.4 GB `/data` used. Research 2026-11-03: $20 is the IPv6-only variant — rejected (no managed NAT64; IPv4-only apt/GitHub endpoints break). 80 GB SSD, 4 TB transfer incl. |
| D3 | Region | **ap-southeast-1 (Singapore)** | Existing account default; nearest low-latency region to Vietnam. |
| D4 | Cutover | **Stop old connector first, then start new** | Tunnel `6aeedb2a` must have exactly one active connector; running both load-balances traffic across two boxes. |
| D5 | Path parity | Keep `/data/home/ai4UCheE` + verbatim systemd units | Units copy verbatim. `.venv` transfers only if its interpreter is system Python (Phase 4 preflight-gated; the documented venv is uv-managed 3.12 whose interpreter lives outside the copied tree) — else rebuilt on system Python 3.13. `node_modules` transfers (same OS/arch) with `npm rebuild` fallback. |
| D6 | DNS/tunnel | No changes | Cloudflare Tunnel stays outbound-only; no Lightsail static IP, no inbound ports beyond temporary SSH. |

## Goals

| # | Goal | Priority |
|---|------|----------|
| 1 | `https://chemeng.ai4u.now/health` serves from Lightsail with zero InstaBox dependency | P1 |
| 2 | Downtime during cutover under 5 minutes | P1 |
| 3 | InstaBox kept as cold rollback for 14 days, then retired | P2 |
| 4 | Watchdog automation + docs + memory updated to reflect the new host | P2 |

## Phases

| # | Phase | Status |
|---|-------|--------|
| 1 | [Account Gate & Provisioning Prep](./phase-01-start.md) | Pending |
| 2 | [Provision Lightsail Instance](./phase-02-provision-lightsail.md) | Pending |
| 3 | [Baseline OS & Tailnet Join](./phase-03-baseline-os-and-tailnet.md) | Pending |
| 4 | [Migrate Data & Services](./phase-04-migrate-data-and-services.md) | Pending |
| 5 | [Cutover & Decommission](./phase-05-cutover-and-decommission.md) | Pending |

Phases are strictly sequential (each depends on the previous).

## Success Criteria

- [ ] `curl -sS https://chemeng.ai4u.now/health` returns healthy served by Lightsail (verify via the Lightsail box's `journalctl -u cloudflared-chemeng`)
- [ ] `curl -sS https://chemie.ai4u.now/health` (legacy alias) healthy
- [ ] Tailnet reachability: `curl http://chemeng:8001/health` healthy from laptop (post-swap name; before the Phase 5 swap the same box answers at `chemeng-aws:8001`)
- [ ] InstaBox `chemie` box paused (not deleted) with rollback runbook available for 14 days
- [ ] Watchdog cron automation `automation-f7a1acdc-…` deleted
- [ ] `docs/deployment-guide.md` reflects Lightsail (no instabox resume / keep-alive section)

## Key Facts (scouted live 2026-11-03)

- Old host: Tailscale `chemeng` (100.64.56.26), InstaBox machine name `chemie`, resume: `instabox resume chemie`
- Checkout `/data/home/ai4UCheE` = 1.3 GB (incl. 6 gitignored textbooks, `.venv`, `node_modules`, `.env` with `GATEWAY_API_KEY` — never print)
- Units run as `User=user`; cloudflared creds `/etc/cloudflared/6aeedb2a-9324-4c9a-b75e-650ca6731f7d.json` (0600 root); binary `/usr/local/bin/cloudflared`
- Old box: Node v22.23.3, system Python 3.13.5, Debian 13 amd64 → Lightsail **Debian 13 OS-only blueprint confirmed available** (research 2026-11-03). Sidecar venv is documented uv-managed Python 3.12 (`docs/deployment-guide.md:28,73`) — Phase 4 Task 4.0 preflights the real interpreter; Task 4.4 rebuilds on system Python when it is not system-managed
- Lightsail firewall is inbound-only; all outbound allowed → Tailscale UDP + cloudflared outbound tunnel need zero inbound rules
- Default blueprint firewall opens tcp/22 **and tcp/80 to all** — Phase 2 replaces the whole rule set with a /32 SSH rule
- Cost: ~$24/mo instance + ~$2/mo snapshot ($0.05/GB-month). Stopped instances still bill storage.

## NOT in Scope

- No application code changes, no domain/DNS changes, no infra-as-code (Terraform/CDK), no InstaBox Pro, no multi-region.

## Extension Trace

Provider variant (InstaBox → Lightsail) traced through a stable contract: **systemd unit set + `/data/home/ai4UCheE` path + tunnel ID + tailnet hostname**. The plan proves the contract by migrating with verbatim units and identical paths; a future provider move (e.g., a second Lightsail region or another VPS) reuses this same runbook shape with only hostnames/IPs changing — no new abstraction layer is introduced.

## Dependencies

- AWS CLI v3 `aws login` re-auth (session expired 2026-11-03; `aws login` is the local CLI's own re-auth command) — user interactive gate, Phase 1
- InstaBox reachable during Phase 4 (`instabox resume chemie` if paused)
- Tailscale tailnet `duc.a.nguyen@` device authorization — user interactive gate, Phase 3

## Red Team Review

### Session — 2026-11-03
**Reviewers:** Security Adversary (Fact Checker), Failure Mode Analyst (Flow Tracer), Assumption Destroyer (Scope Auditor) — Full tier
**Findings:** 15 deduplicated from 26 raw (14 accepted, 1 rejected) — user approved application 2026-11-03
**Severity breakdown:** 4 Critical, 5 High, 6 Medium (deduplicated view)

| # | Finding | Severity | Disposition | Applied To |
|---|---------|----------|-------------|------------|
| 1 | Live SQLite (WAL) tar'd mid-write; no final sync before cutover | Critical | Accept | Phase 4 (4.2 note), Phase 5 (5.3.2, 5.5.2) |
| 2 | venv is uv-managed 3.12; interpreter outside copy scope; wrong Phase-3 gate; probes after service start | Critical | Accept | Phase 4 (4.0 preflight, 4.3-before-4.5, 4.4), Phase 3, plan.md D5/Key Facts |
| 3 | `import coolprop` case bug; probe covered 6/13 deps | Critical | Accept | Phase 4 (4.3: `CoolProp` + chemicals/fluids/ht/thermo/uvicorn/httpx) |
| 4 | 5.4 verify asserted `"status"` absent from copilot status body | High | Accept | Phase 5 (5.4 per-endpoint assertions) |
| 5 | Stale `HostName chemeng-aws` post-swap; success criterion used dead name | High | Accept | Phase 5 (5.6.3), plan.md Success Criteria |
| 6 | Split-brain: suspend mid-cutover → dual connectors; unbounded user-gate gap | Critical | Accept | Phase 5 (5.1 combined gate, 5.3.1 gated stop, 5.6.0 stop+disable after resume) |
| 7 | Rollback runbook invalidated by swap; `stop` without `disable`; stale DB on rollback | High | Accept | Phase 5 (5.5 rewrite, 5.6.5 rollback-runbook.md) |
| 8 | `instabox start chemie` hard-stop fallback missing | Medium | Accept | Phase 4 (4.0.2), Phase 5 (5.1.2, 5.5.0, 5.6.0) |
| 9 | Tailscale rename silently fails after InstaBox resume (needs tailscaled restart) | High | Accept | Phase 5 (5.6.1) |
| 10 | Debian-12 fallback dead-ended at Phase 2 STOP; dangling "Task 4.6" refs | Medium | Accept | Phase 1 (1.2.2 hardened), Phase 3 (3.1 verify) |
| 11 | "`aws login` doesn't exist in CLI v2" | Medium | Reject | Live CLI error on this machine literally demands `aws login` (CLI v3 layout, `~/.aws/login/`); only the plan's "CLI v2" wording was wrong — fixed |
| 12 | `cert.pem` copied needlessly; no rotation/retention owners for tunnel creds, GATEWAY_API_KEY, snapshot | Medium | Accept | Phase 4 (4.1 excludes cert.pem), Phase 5 (5.9 checklist) |
| 13 | Watchdog deleted with no recreation path on permanent rollback | Medium | Accept | Phase 5 (5.2.1 watchdog-backup.md) |
| 14 | Docs would keep stale tailnet IP `100.64.56.26` | Medium | Accept | Phase 5 (5.8.1 + verify) |
| 15 | `instabox` CLI auth expiry never preflighted; rollback depends on it | Medium | Accept | Phase 4 (4.0.1), Phase 5 (5.1.1) |

### Whole-Plan Consistency Sweep
- Files reread: plan.md, phase-01…phase-05
- Decision deltas checked: 12 (rsync→tar, task renumbering ×2, staging removal, $24/IPv6 split, Debian-12 fallback removal, ssh-config HostName removal, cert.pem exclusion, python 3.12/3.13 reconciliation, watchdog→5.2, success-criteria rename, CLI v3 wording)
- Reconciled stale references: 6
- Unresolved contradictions: 0

## Validation Log

### Verification Results
- **Tier:** Full (5 phases)
- **Claims checked:** 24 (Fact Checker, red-team session) — 17 VERIFIED, 3 FAILED (all 3 became accepted findings 3/4/5-class and were fixed), 4 UNVERIFIED-external (Lightsail catalog facts self-discovered in Task 1.2; live-VPS facts scouted 2026-11-03)
- Post-fix re-verification: corrected assertions re-checked against `src/server/copilot-route.ts:112-114`, `services/perry-engine/pyproject.toml:6-20`, site-packages `CoolProp` casing — all now match plan text

### Validation Session 1 — 2026-11-03
- Interview questions: 0 (decision points — account, bundle, trial status — were settled pre-draft via user interview; red-team Step-7 approval covered the remainder)
- Kongming advisory checkpoint: GO-WITH-CHANGES — all 5 counsel changes (C1 tar-pipe, C2 retry-loop, C3 ssh hygiene, C4 watchdog pre-cutover, C5 probe hardening) applied before red team
- Recommendation: **proceed to implementation** (`/ak-cook`)

### Validation Session 2 — 2026-11-03 (execution, Phase 1)
- User-approved change: **D1 account → 411156014852** (AI4UNow Management Account via IAB no-credential session). 411156014852 root-login path needed unavailable credentials; 953483531752 (Ready Set Build) failed AWS's per-session authorize step server-side twice with fresh requests (opaque error) — user chose Management as fallback.
- IAB interaction quirks encountered (consistent with project memory): Playwright role-clicks time out; dom_cua/evaluate synthetic-event dispatch on `data-testid` nodes is the reliable path; session cards below the fold must be scrolled into view; `create-key-pair` returned malformed base64 — replaced by local `ssh-keygen` + `import-key-pair`.
- Phase 1 evidence: sts identity = 411156014852/AccountFullAccessRole; blueprint `debian_13` + bundle `medium_3_0` discovered; key pair `chemeng-lightsail` imported and PEM verifies (`ssh-keygen -y` OK).
