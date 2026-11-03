---
phase: 4
title: "Migrate Data & Services"
status: done
priority: P1
effort: "45m"
dependencies: [3]
---

# Phase 4: Migrate Data & Services

## Context Links

- [Phase 3](./phase-03-baseline-os-and-tailnet.md) — `chemeng-aws` on tailnet, `user` + `/data/home` ready, Node 22 installed
- Source of truth: old host `chemeng` (InstaBox machine `chemie`) — resume with `instabox resume chemie` (hard-stop fallback: `instabox start chemie`)
- [plan.md](./plan.md) decisions D5 (path parity), D6 (tunnel untouched in this phase)
- Repo reality: the Express server writes `perry_workbench.sqlite` (WAL mode) at the repo root (`src/db/client.ts`, `src/server/api-server.ts`) — see Task 4.2 note and Phase 5's final DB sync

## Overview

Preflight the old box (auth, liveness, and the venv interpreter question), copy the system layer (units, tunnel config **without `cert.pem`**, cloudflared binary) and the entire workload via **tar-over-ssh pipes through the laptop**, run runtime sanity probes **before** starting any service, rebuild the venv only if the preflight shows a non-system interpreter, then start the three app services and verify over the tailnet. **The tunnel stays OFF on Lightsail in this phase** — public cutover (with the authoritative final DB sync) is Phase 5.

## Execution Evidence (2026-11-03)

- 4.0 preflight: instabox auth OK; `chemie` resumed; interpreter = uv 3.12.15 under `/data/home/.local/share/uv/` (see RECORDED block); sqlite trio inventoried; old-box `pip` absent (uv venv) — rebuild-with-pins route moot
- 4.1: 4 units listed; `/etc/cloudflared/` = exactly `config.yml`(644) + creds json(600), **no `cert.pem`**; cloudflared 2026.10.5 runs
- 4.2 (**plan-extended**: also tar'd `/data/home/.local` so the uv interpreter travels): TREE-OK, LOCAL-OK, CHOWN-OK; du parity 1.3G == 1.3G; ssh keepalives armed (kongming watch-item)
- 4.3 probes: INTERP-EXISTS (symlink resolves into copied `.local`); **12/12 imports → `venv-ok`** (incl. `CoolProp` casing + ChEDL four + uvicorn/httpx; fitz FutureWarning harmless); tsx v4.23.15 / node v22.23.4
- 4.4: **SKIPPED — not needed** (copy-path succeeded; zero version skew)
- 4.5: 3× `active`; 200 on 127.0.0.1:8001, 127.0.0.1:3000, and `chemeng-aws:3000` from laptop. Tunnel still OFF on the new box (Phase 5 owns cutover)

## Requirements

- Old-box preflight recorded (venv interpreter path; sqlite file list)
- `/data/home/ai4UCheE` on `chemeng-aws` matches the old box (tar preserves hardlinks, symlinks, xattrs)
- Units `perry-engine`, `perry-workbench`, `perry-workbench-http` are `enabled` and `active`; `cloudflared-chemeng` installed but NOT started
- Runtime sanity probes pass BEFORE any service is started
- Tailnet health endpoints green on the new box while production still serves from the old box

## Tasks & Steps

### Task 4.0 — Old-box preflight (auth, liveness, interpreter, DB inventory)
- Goal: Everything the later tasks depend on is known-good and recorded BEFORE any transfer.
- Steps (all from laptop):
  1. InstaBox CLI auth: `instabox list` — must exit 0 and list machine `chemie`. If it errors with an auth/expiry message, STOP → the human user redoes the device-code login (USER GATE), then re-run. Do not proceed with expired instabox auth: Phase 5's rollback depends on it.
  2. Liveness: `ssh -o ConnectTimeout=8 chemeng 'echo ok'` — if timeout: `instabox resume chemie`; if `resume` errors on a hard-stopped machine (8-h cap), use `instabox start chemie`; wait ~60 s; retry once.
  3. **Venv interpreter probe** (decides Task 4.4): `ssh chemeng 'readlink -f /data/home/ai4UCheE/services/perry-engine/.venv/bin/python'` — record the output below.
  4. **SQLite inventory** (feeds Phase 5's final sync): `ssh chemeng 'sudo ls -la /data/home/ai4UCheE/perry_workbench.sqlite*'` — record which of `perry_workbench.sqlite`, `-wal`, `-shm` exist.
- Success criteria: all four probes return clean output; two lines recorded below.
- Verify: `instabox list` output contains `chemie`; ssh probe prints `ok`; readlink prints an absolute path; the ls prints at least `perry_workbench.sqlite`. If liveness still fails after resume+start, STOP → Failure Protocol.

```
RECORDED old-venv-python: /data/home/.local/share/uv/python/cpython-3.12.15-linux-x86_64-gnu/bin/python3.12
RECORDED sqlite files present: perry_workbench.sqlite (4096B) + -shm (32768B) + -wal (78312B)
RECORDED du: 1.3G
```

<!-- Executed 2026-11-03: interpreter is uv-managed 3.12.15 BUT lives under /data/home/.local
     — the SAME /data/home prefix being copied. Task 4.2 therefore extended to tar
     /data/home/.local as well: the copied venv resolves verbatim, zero version skew,
     and Task 4.4 rebuild becomes pure fallback (kongming's pip-freeze pins concern
     moot — old-box venv has no pip; rebuild would have needed external pins). -->


### Task 4.1 — Copy the system layer (tar pipes, no laptop staging)
- Goal: systemd units, the two tunnel files the connector actually needs, and the cloudflared binary land on the new box. **`cert.pem` is deliberately NOT copied** — it is the account-level Cloudflare origin credential (tunnel/DNS management); a connector only needs `config.yml` + the tunnel creds json. Not copying it removes a secret replica (red-team finding).
- Target files: on `chemeng-aws`: `/etc/systemd/system/{perry-engine,perry-workbench,perry-workbench-http,cloudflared-chemeng}.service`, `/etc/cloudflared/config.yml`, `/etc/cloudflared/6aeedb2a-9324-4c9a-b75e-650ca6731f7d.json`, `/usr/local/bin/cloudflared`.
- Steps (each pipe runs from the laptop; sudo both ends):
  1. Units: `ssh chemeng 'sudo tar -C /etc/systemd/system -cf - perry-engine.service perry-workbench.service perry-workbench-http.service cloudflared-chemeng.service' | ssh chemeng-aws 'sudo tar -C /etc/systemd/system -xf -'`
  2. Tunnel config (exactly two files, NOT the whole dir): `ssh chemeng 'sudo tar -C /etc/cloudflared -cf - config.yml 6aeedb2a-9324-4c9a-b75e-650ca6731f7d.json' | ssh chemeng-aws 'sudo mkdir -p /etc/cloudflared && sudo tar -C /etc/cloudflared -xf -'`
  3. Binary: `ssh chemeng 'sudo tar -C /usr/local/bin -cf - cloudflared' | ssh chemeng-aws 'sudo tar -C /usr/local/bin -xf -'`
  4. `ssh chemeng-aws 'sudo chmod 600 /etc/cloudflared/*.json && sudo chmod 644 /etc/cloudflared/config.yml && sudo systemctl daemon-reload'`
- Success criteria: files present with correct modes; systemd sees all four units; binary runs.
- Verify: `ssh chemeng-aws 'systemctl list-unit-files | grep -E "perry-engine|perry-workbench.service|perry-workbench-http|cloudflared-chemeng"'` prints 4 lines; AND `ssh chemeng-aws 'stat -c "%a %n" /etc/cloudflared/6aeedb2a-9324-4c9a-b75e-650ca6731f7d.json /etc/cloudflared/config.yml'` prints `600` for the json and `644` for the yml; AND `ssh chemeng-aws 'ls /etc/cloudflared/'` lists exactly `config.yml` and the json (no `cert.pem`); AND `ssh chemeng-aws '/usr/local/bin/cloudflared --version'` exits 0. NEVER `cat` anything under `/etc/cloudflared/` or the repo `.env` (secrets discipline).

### Task 4.2 — Copy the workload (tar pipe)
- Goal: App tree copied with ownership/symlinks/hardlinks preserved. Nothing lands on the laptop disk.
- Steps:
  1. `ssh chemeng 'sudo tar -C /data/home -cf - ai4UCheE' | ssh chemeng-aws 'sudo tar -C /data/home -xf -'` (≈1.3 GB — minutes over tailnet; includes `.git`, textbooks, `.env`, `.venv`, `node_modules`)
  2. Normalize ownership: `ssh chemeng-aws 'sudo chown -R user:user /data/home/ai4UCheE'`
- Success criteria: transfer pipes exit 0; size parity.
- Verify: `ssh chemeng-aws 'sudo du -sh /data/home/ai4UCheE'` prints ≈ `1.3G` (within ±15% of `ssh chemeng 'sudo du -sh /data/home/ai4UCheE'`).
- **Note (red-team finding):** `perry_workbench.sqlite` copied here is a PRE-SEED only — the old box keeps serving and writing until Phase 5, so this copy is already stale (and the WAL trio is non-atomic in a live tar). The authoritative, quiesced final DB sync happens inside Phase 5 Task 5.3's downtime window. Do not treat this copy as final.

### Task 4.3 — Copied-runtime sanity probes (BEFORE any service starts)
- Goal: Prove the copied `.venv` and `node_modules` are viable BEFORE `systemctl enable --now`, so a failure here is diagnosed in minutes instead of through crash-looping units.
- Steps:
  1. Interpreter pre-check: `ssh chemeng-aws 'sudo -u user readlink -f /data/home/ai4UCheE/services/perry-engine/.venv/bin/python && sudo -u user test -e $(sudo -u user readlink -f /data/home/ai4UCheE/services/perry-engine/.venv/bin/python)'`
  2. Native-module import probe — note `CoolProp` casing (Linux is case-sensitive; lowercase `coolprop` does NOT exist as a module): `ssh chemeng-aws "sudo -u user /data/home/ai4UCheE/services/perry-engine/.venv/bin/python -c 'import fitz, pydantic, fastapi, CoolProp, chemicals, fluids, ht, thermo, scipy, pint, uvicorn, httpx; print(\"venv-ok\")'"`
  3. Node toolchain probe: `ssh chemeng-aws "sudo -u user /data/home/ai4UCheE/node_modules/.bin/tsx --version"`
- Success criteria: interpreter resolves to an existing file; all 12 runtime imports pass; tsx runs.
- Verify: step 1 prints a real path and its `test` exits 0; step 2 prints `venv-ok` (exit 0); step 3 prints a `tsx v…` version (exit 0). If Task 4.0 recorded a non-`/usr/bin/python3` interpreter, step 1 failing here is EXPECTED — proceed directly to Task 4.4 (that is the sanctioned path, not an error).

### Task 4.4 — Conditional runtime rebuild (mandatory OR fallback)
- Goal: A working venv/node_modules on the new box.
- When MANDATORY: Task 4.0's `RECORDED old-venv-python` does NOT start with `/usr/bin/python3` (uv/pyenv-managed interpreter — the documented deployment builds the venv with `uv venv --python 3.12`, whose interpreter lives outside `/data/home` and did not travel with the tar). When FALLBACK: any Task 4.3 probe failed despite a system interpreter.
- Steps:
  1. venv rebuild: `ssh chemeng-aws 'sudo apt-get install -y python3-venv python3-pip && cd /data/home/ai4UCheE/services/perry-engine && sudo -u user python3 -m venv .venv --clear && sudo -u user .venv/bin/pip install -e .'` (uses the Debian 13 system Python 3.13; `requires-python >=3.10,<3.14` accepts it)
  2. npm rebuild (only if the tsx probe or later service start shows native-module errors, e.g. `better-sqlite3`): `ssh chemeng-aws 'cd /data/home/ai4UCheE && sudo -u user npm rebuild'` (escalate to `sudo -u user npm install --no-audit --no-fund` only if `npm rebuild` is insufficient)
- Success criteria: re-run of Task 4.3 Verify passes in full (all probes green on the rebuilt venv).
- Verify: identical commands and pass conditions as Task 4.3.

### Task 4.5 — Start the three app services (NOT the tunnel)
- Goal: Workload healthy on Lightsail via tailnet while production still runs on the old box.
- Steps:
  1. `ssh chemeng-aws 'sudo systemctl enable --now perry-engine'`
  2. `ssh chemeng-aws 'sudo systemctl enable --now perry-workbench perry-workbench-http'`
- Success criteria: all three `active (running)` and healthy.
- Verify (all must hold):
  - `ssh chemeng-aws 'systemctl is-active perry-engine perry-workbench perry-workbench-http'` prints three lines, each exactly `active`
  - `ssh chemeng-aws 'curl -sS -o /dev/null -w "%{http_code}" http://127.0.0.1:8001/health'` prints `200`
  - `ssh chemeng-aws 'curl -sS -o /dev/null -w "%{http_code}" http://127.0.0.1:3000/health'` prints `200`
  - From laptop: `curl -sS -o /dev/null -w "%{http_code}" http://chemeng-aws:3000/health` prints `200`

## Security Considerations

- `.env` (contains `GATEWAY_API_KEY`) and the tunnel creds json stream through the laptop's SSH pipe but are never written to laptop disk; tailnet-encrypted in transit; never print, never commit.
- `cert.pem` stays single-copy on the old box (excluded in Task 4.1) — one fewer replica to rotate.
- Rotate `GATEWAY_API_KEY` at the 2026-11-17 decommission (Phase 5 Task 5.9 checklist).

## Risk Assessment

- Old box pausing mid-tar (30-min idle timer): re-run Task 4.0 step 2 then Task 4.2 from scratch — tar has no delta resume; 1.3 GB is cheap, correctness beats cleverness.
- Old box hard-stop mid-tar (8-h runtime cap): `instabox start chemie` is the documented remedy (Task 4.0 step 2).
- `perry-workbench-http` binds :80 → needs `CAP_NET_BIND_SERVICE`; already in the unit file (AmbientCapabilities) — no change needed.
- SQLite pre-seed staleness/torn WAL: accepted BY DESIGN — Phase 5 Task 5.3 replaces the trio from a quiesced old box inside the cutover window.

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
