# Phase 5 — Container Pair, PVU VPS Deploy, Caddy Vhost, DNS, Corpus Sync, Live Smoke

## Context
- Brainstorm: `plans/reports/brainstorm-20261111-pvu-sharepoint-edition.md` · Research: `plans/reports/research-20261111-interactive-html-on-sharepoint.md`
- Related phases: requires 1–3 code-gated green and Phase 4 mint + revocation URL; precedes 6–7 (they need the live origin).

## Overview
Priority P1 · Status Pending · Effort 0.75d.
The repo has no Dockerfile today. This phase builds the locked container pair (Express workbench + perry-engine sidecar), deploys them as a new compose project on the PVU VPS behind host caddy at `chemeng.pvu.ai4u.now`, syncs the copyrighted corpus to the VPS (never to SharePoint), and runs the live smoke that proves the token gate, the vi default, and corpus containment on the real origin.

## Requirements
Functional:
- `Dockerfile` (workbench): node base, `npm ci`, build with `VITE_BRAND=pvu`, run the Express server; corpus, node_modules cache, tests, plans, video-guide excluded via `.dockerignore`.
- `Dockerfile.sidecar` (perry-engine): python base + deps; corpus mounted at container `/app/<exact filenames>` so `PDF_PATH` resolution in `services/perry-engine/main.py` (three-dirname walk to `/app`) works with zero code change.
- Compose project on VPS under `/opt/ai4uchee/` `[VERIFY-AT-EXECUTION]`: sidecar unpublished (internal `:8001`), workbench published `127.0.0.1:3000` (host caddy only), env file `/etc/ai4uchee/.env` `[VERIFY-AT-EXECUTION: naming vs /etc/ai4upvu/.env precedent]`, SQLite on a named volume via `DB_PATH`.
- Caddy vhost: `chemeng.pvu.ai4u.now` → `reverse_proxy 127.0.0.1:3000`; basic_auth (BOD precedent) on all paths EXCEPT `/app`, `/assets/*`, `/health` (SPA shell is non-secret; all data routes are Bearer-gated — see plan.md Risk Notes).
- DNS: `chemeng` record in the `ai4u.now` Cloudflare zone → VPS `[VERIFY-AT-EXECUTION: check for existing *.pvu wildcard first]`.
- Corpus: rsync the 6 files (~371MB) from the local repo root to `/opt/ai4uchee/corpus/`; sha256 verified both sides.
- `DB_PATH` env support: `src/server/api-server.ts:196` passes `process.env.DB_PATH` into `createApiServer`.
Non-functional: cold container start < 30 s; image contains zero PDF/epub bytes (checked); deploy is repeatable by re-running the same steps.

## Architecture
```
Cloudflare DNS chemeng.pvu.ai4u.now ──> PVU VPS
host caddy (vhost: basic_auth except /app,/assets/*,/health)
 └─ 127.0.0.1:3000 → perry-workbench container (Express, CHE_EMBED_AUTH=1)
      ├─ serves dist/ (PVU brand build)
      ├─ Bearer gate + rate limits on /api/* (Phase 2)
      └─ PERRY_SIDECAR_URL=http://perry-engine:8001 ──> perry-engine container
             └─ /app/*.pdf (corpus volume, read-only, never published)
volumes: sqlite-data (/data/perry_workbench.sqlite), corpus (ro)
```

## Related Code Files
| Path | Action | Change |
|---|---|---|
| `Dockerfile` | create | Multi-stage-ish single image: copy repo, `npm ci`, `ARG VITE_BRAND=pvu npm run build`, CMD runs the server via tsx. |
| `Dockerfile.sidecar` | create | python slim + `services/perry-engine` deps `[VERIFY-AT-EXECUTION: requirements file location — check services/perry-engine/ for requirements*.txt; if none, pip install the imports of main.py]`. |
| `.dockerignore` | create | Exclude `node_modules`, `*.pdf`, `*.epub`, `dist`, `tests`, `test-results`, `gui-test-screenshots`, `plans`, `video-guide`, `perry_workbench.sqlite*`, `.git`. |
| `deploy/docker-compose.yml` | create | Services `perry-engine` + `perry-workbench` per Requirements; copied to VPS `/opt/ai4uchee/`. |
| `src/server/api-server.ts` | modify | Line 196: `createApiServer(process.env.DB_PATH)` (default unchanged). |
| VPS `/etc/ai4uchee/.env` | create (host) | All runtime envs (below); never committed. |
| VPS caddy config | modify (host) | New vhost block `[VERIFY-AT-EXECUTION: path — discovery in Task 5.2]`. |

Env file contents (values from Phases 1/2/4): `VITE_BRAND` baked at build (not env file); `CHE_EMBED_AUTH=1`; `CHE_EMBED_TOKEN_SECRET=<same value as engine's PUBLISH_MCP_TOKEN_SECRET>`; `CHE_EMBED_REVOCATION_URL=http://<publish-service>:3020/internal/revoked-jtis/che-workbench` + its service token; `BRAND_DEFAULT_LOCALE=vi`; `COPILOT_BRAND_NAME`/`COPILOT_BRAND_SITE`; `GATEWAY_URL`/`GATEWAY_MODEL` (PVU values from Phase 1 Task 1.3); `GATEWAY_API_KEY` (server-only); `PERRY_SIDECAR_URL=http://perry-engine:8001`; `DB_PATH=/data/perry_workbench.sqlite`.

## Tasks

### Task 5.1 — Images build locally
**Goal:** Both images build on the laptop with the corpus provably absent.
**Target files and symbols:** `Dockerfile`, `Dockerfile.sidecar`, `.dockerignore`.
**Steps:**
1. Write `.dockerignore` first (list above) — the corpus exclusion is a standing law.
2. Write `Dockerfile`: `FROM node:22-slim`; copy package files, `npm ci`; copy repo; `ARG VITE_BRAND`; `RUN VITE_BRAND=$VITE_BRAND npm run build`; `CMD ["npx","tsx","src/server/api-server.ts"]`; `EXPOSE 3000`.
3. Write `Dockerfile.sidecar`: `FROM python:3.12-slim`; install deps; copy `services/perry-engine/`; `CMD ["python3","main.py"]` (binds 127.0.0.1:8001 — change to `0.0.0.0` via the app's host env/flag if it binds loopback only `[VERIFY-AT-EXECUTION: check uvicorn/host binding at the bottom of main.py]`).
4. Build both; scan images for corpus filenames.
**Success criteria:** Both builds exit 0; no `*.pdf` larger than trivial docs inside either image.
**Verify:** `docker build -t che-workbench:pvu --build-arg VITE_BRAND=pvu . && docker build -f Dockerfile.sidecar -t che-perry-engine:pvu .` → exit 0; `docker run --rm che-workbench:pvu find / -name "*.pdf" -size +1M | wc -l` → prints `0`.

### Task 5.2 — VPS discovery + placement
**Goal:** Retire the host-path pins.
**Steps:**
1. SSH `pvu.ai4u.now`: locate compose root convention (`ls /opt/`), caddy config path (`docker ps | grep caddy` then inspect mounts, or host `caddy` service), confirm `/etc/ai4upvu/.env` precedent.
2. Decide and record: project dir `/opt/ai4uchee/` (or closest convention), env file `/etc/ai4uchee/.env`, caddy include site.
**Success criteria:** Three concrete host paths recorded in the phase summary.
**Verify:** the recorded `ls`/`docker inspect` outputs; no further pass condition.

### Task 5.3 — Corpus sync
**Goal:** All 6 copyrighted files on the VPS, byte-identical, never anywhere near SharePoint.
**Steps:**
1. `rsync -av --progress` the six corpus files from `/Users/nad/ai4u/ai4UCheE/` (exact filenames incl. "Perry's Chemical Engineers' Handbook, 9th Edition.pdf") to `pvu.ai4u.now:/opt/ai4uchee/corpus/`.
2. sha256 both sides for each file; compare.
3. `chmod -R a-w` the corpus dir (read-only by accident prevention; compose mounts `:ro` anyway).
**Success criteria:** Six hash pairs match.
**Verify:** `shasum -a 256 *.pdf *.epub | sort` locally vs `ssh pvu.ai4u.now 'cd /opt/ai4uchee/corpus && sha256sum * | sort'` → identical file/hash lists (modulo algorithm-name spelling).

### Task 5.4 — Compose up + caddy + DNS
**Goal:** The origin serves the PVU app behind caddy.
**Target files and symbols:** `deploy/docker-compose.yml`, host caddy vhost, Cloudflare DNS record.
**Steps:**
1. Write `deploy/docker-compose.yml`: `perry-engine` (build sidecar; volume `./corpus:/app:ro` — wait: `/app` is the code dir; mount individual files or mount corpus dir at `/app` while code lives elsewhere — resolve by copying code to `/srv` in the sidecar image and setting workdir so the three-dirname walk still lands on the corpus dir `[VERIFY-AT-EXECUTION: final layout decided in Task 5.1 step 3 testing]`; no published ports; healthcheck `python3 -c "import urllib.request;urllib.request.urlopen('http://127.0.0.1:8001/health')"`), `perry-workbench` (build `Dockerfile` arg `VITE_BRAND=pvu`; `ports: "127.0.0.1:3000:3000"`; `depends_on: perry-engine: condition: service_healthy`; `env_file: /etc/ai4uchee/.env`; named volume `sqlite-data:/data`).
2. rsync repo (minus node_modules/corpus) to `/opt/ai4uchee/app/`; `docker compose up -d --build`.
3. Create `/etc/ai4uchee/.env` from the Phase 4/1 values (secret pasted once, never echoed).
4. Add caddy vhost with path exceptions: `basic_auth` on `/*` except `/app`, `/assets/*`, `/health` (use caddy `except` named matcher or path-scoped blocks per the discovered caddy version); `reloadctl reload` or equivalent.
5. DNS: in Cloudflare `ai4u.now` zone add `chemeng.pvu` CNAME/A → VPS (proxied status to match sibling hosts `[VERIFY-AT-EXECUTION]`).
**Success criteria:** `https://chemeng.pvu.ai4u.now/health` returns 200 without credentials; `/` returns 401 basic-auth prompt.
**Verify:** `curl -s -o /dev/null -w "%{http_code}" https://chemeng.pvu.ai4u.now/health` → `200`; `curl -s -o /dev/null -w "%{http_code}" https://chemeng.pvu.ai4u.now/` → `401`.

### Task 5.5 — Live smoke (gate for Lane A)
**Goal:** Every locked posture proven on the real origin.
**Steps:** run, in order, recording each output:
1. `curl -s -o /dev/null -w "%{http_code}" https://chemeng.pvu.ai4u.now/health` → expect `200`.
2. Bare copilot: `curl -s -o /dev/null -w "%{http_code}" -X POST https://chemeng.pvu.ai4u.now/api/copilot -H 'Content-Type: application/json' -d '{}'` → expect `401`.
3. Mint production token on VPS (Phase 4 script); `curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $T" https://chemeng.pvu.ai4u.now/api/screen-state` → expect `200`.
4. Revocation propagation: revoke that token's JTI, wait ≤ 60 s, re-run step 3 → expect `401`; mint a fresh token for continued use.
5. Sidecar data path through the gate: `curl -s -H "Authorization: Bearer $T" -X POST https://chemeng.pvu.ai4u.now/api/v1/units/convert -H 'Content-Type: application/json' -d '{…}'` → expect `200` JSON (exact body per sidecar schema — copy a working payload from `tests/e2e` usage).
6. Corpus containment: `curl -s -o /dev/null -w "%{http_code}" "https://chemeng.pvu.ai4u.now/Perry%27s%20Chemical%20Engineers%27%20Handbook%2C%209th%20Edition.pdf"` → `404`; also `/corpus/Perry…pdf` → `404`.
7. vi default: `curl -s https://chemeng.pvu.ai4u.now/app | grep -c '<html lang="vi"'` → `1`.
8. Copilot with Bearer: POST `/api/copilot` with a Vietnamese student question → `200` (Tier 1 fallback acceptable if the gateway env is not yet live; record which tier answered).
**Success criteria:** All eight expectations met in one run.
**Verify:** the commands themselves; keep the transcript in `plans/261111-1048-pvu-sharepoint-edition/reports/deploy-smoke-<date>.md` (execution evidence, not a report file for its own sake).

## Todo
- [ ] 5.1 Images build locally; corpus absent proven
- [ ] 5.2 VPS discovery (paths recorded)
- [ ] 5.3 Corpus rsync + hash match
- [ ] 5.4 Compose + caddy + DNS live
- [ ] 5.5 Eight-step live smoke

## Success Criteria
- Negative controls live: bare `/api/copilot` 401; revoked token 401; corpus paths 404.
- Positive: Bearer 200 on state + units + copilot; vi default HTML; basic-auth prompt on `/` only.
- Rollback: `docker compose down` (keep volumes), remove caddy vhost + reload, optionally drop DNS record — origin fully gone, VPS otherwise untouched; repo changes revert with `git revert` (Dockerfiles are additive).

## Risk Assessment
- Corpus inside image (law breach): prevented by `.dockerignore` + Task 5.1's find-scan verify (a hard gate, not a convention).
- Sidecar loopback binding vs container networking: Task 5.1 step 3 verify path decides layout before any VPS work; likelihood medium, caught early.
- Caddy path-exception subtlety (basic_auth vs embed paths): if the exception matcher is wrong the iframe dies at Phase 6 — Phase 6's smoke catches it; mitigation: test `/app` fetch with `curl -s -o /dev/null -w "%{http_code}" https://chemeng.pvu.ai4u.now/app` → `200` (add to Task 5.4 expectations if not already).
- Single VPS hosts other stacks: compose project isolation + `127.0.0.1` port binding guarantee no interference with the ai4UPVU stack.

## Security Considerations
- Corpus: VPS-only, read-only mount, never in images, never in SharePoint (law); reachable only through Bearer-gated `/api/v1/*`/`/api/perry/*` proxies.
- Secrets: all in `/etc/ai4uchee/.env` (root-owned, 600); `GATEWAY_API_KEY` server-side only; token secret equals the engine's, never committed.
- Basic-auth credentials for the direct surface stored in the owner's password manager (BOD ritual); token URLs never used at top level.

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

## Next Steps
- Unblocks Phase 6 (Lane A embed uses the live origin + fresh token).
- Follow-ups: Phase 10 monitoring hooks onto `/health`; Phase 7 reuses the same origin inside SPFx.
