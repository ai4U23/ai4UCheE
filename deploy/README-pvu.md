# PVU Edition Deploy Runbook (plan 261111 phase 05)

VPS: `ssh pvu` (pvu.ai4u.now). Placement: `/opt/chemeng-pvu/` (app + corpus); env file
`/etc/ai4upvu/chemeng.env` (root:root 600 — matches the `/etc/ai4upvu/*.env` family).
Hidden origin: **chemeng-pvu.ai4u.now** (first-level → Universal SSL; planner-settled fork —
`chemeng.pvu.ai4u.now` has no record + no USSL coverage; `chemeng.ai4u.now` is the LIVE AWS host).

## Sequence (kongming-corrected 261111)

1. **Mac prep (done in-repo):** Dockerfile + Dockerfile.sidecar + .dockerignore (PDFs first)
   + deploy/docker-compose.yml + deploy/caddy/chemeng-pvu.Caddyfile + `PERRY_ENGINE_HOST`
   override (sidecar compose sets 0.0.0.0; AWS default unchanged). Commit + push both repos.
2. **DNS:** proxied A record `chemeng-pvu` → same target as `pvu.ai4u.now` (Cloudflare
   dashboard, or the caddy CF token if it carries Zone:DNS:Edit). Then edge-TLS probe:
   `curl -sI https://chemeng-pvu.ai4u.now` must complete TLS (USSL covers first-level).
3. **Engine sync (git, never rsync):** root-side on the VPS — `cd /opt/ai4UPVU && git fetch
   origin && git checkout <deploy-sha>` (push from the Mac first; root for the root-owned
   tree / safe.directory). Record pre-checkout `git status` + `git stash list`.
4. **publish-mcp rebuild + recreate (live surgery — isolate it):** capture
   `docker inspect publish-mcp` JSON first; build `ai4upvu-<sha>`; recreate with
   `deploy/publish-mcp-recreate.sh ai4upvu-<sha>` — NEVER a hand-typed `docker run`. The
   script re-asserts ALL FIVE axes (env file /etc/ai4upvu/publish-mcp.env + the THREE bind
   mounts + the three networks + the 127.0.0.1:3020 port + restart policy) and refuses to
   start if the live container is already bind-broken. 261111 incident-3: a hand-typed
   recreate kept the env but dropped the 3 binds → every SharePoint artifact page 404'd
   (the BOD usage dashboard went down in front of the owner) and the quarantine trap fired —
   an env-only diff is structurally blind to the bind axis. Post-gates (the script runs
   them): /health 200, BOD artifact fetch 200 (slug `pvu-bod-usage-dashboard-vn`) with
   EXACTLY ONE Access-Control-Allow-Origin header (duplicate ACAO = browsers fail while
   curl stays green), fresh ict_date in the artifact, and
   `GET /internal/revoked-jtis/che-workbench` (service token) →
   `{"slug":"che-workbench","jtis":[],"epoch":null}`. If the artifact row is quarantined in
   the metadata DB, un-quarantine it BEFORE the recreate — booting a mounted container
   completes a quarantine. Rollback anchor: keep the previous image un-pruned.
5. **App + corpus:** `git clone`/checkout ai4UCheE at the deploy SHA into
   `/opt/chemeng-pvu/app`; `rsync` the six corpus files (repo root, ~371MB) to
   `/opt/chemeng-pvu/corpus/`; `sha256sum` both sides; `chmod -R a-w` the corpus dir; root-cron
   sweep check (nothing backs /opt/* off-box without the corpus law being respected).
6. **Env file** `/etc/ai4upvu/chemeng.env` (root 600; secrets copied ON THE VPS, never via
   the Mac): `CHE_EMBED_AUTH=1`; `CHE_EMBED_TOKEN_SECRET` ≡ live `PUBLISH_MCP_TOKEN_SECRET`
   (byte-for-byte); `CHE_EMBED_REVOCATION_URL=http://publish-mcp:3020/internal/revoked-jtis/che-workbench`;
   `CHE_EMBED_REVOCATION_TOKEN` ≡ live `STUDIO_MCP_BEARER_TOKEN` (routes.py:574 reads it —
   copy, never fresh-mint); `BRAND_DEFAULT_LOCALE=vi`; `BRAND_APP_NAME=PVU CHE Workbench`;
   `COPILOT_BRAND_NAME=Trợ lý Thông minh ChemEng – PVU`; `COPILOT_BRAND_SITE=chemeng-pvu.ai4u.now`;
   `CHE_COPILOT_RATE_LIMIT_PER_MIN=60` (classroom-NAT counsel). Gateway vars intentionally
   unset until the owner's 5-min pin (copilot degrades to Tier-1 meanwhile — smoke still 200).
7. **Compose up (loopback tier first):** `cd /opt/chemeng-pvu/app/deploy && docker compose
   config` (render — the apostrophe/comma filename mounts) then `docker compose up -d --build`.
   Run the 8-step smoke against `127.0.0.1:3000` BEFORE caddy: health 200 (assert
   `pdf_exists:true`), bare POST /api/copilot → 401 (from the Express Bearer gate), minted
   token → 200, revoked-JTI propagation → 401, sidecar units/convert → 200 with token,
   corpus path → 404, /app → lang="vi", copilot → 200 (Tier-1 acceptable).
8. **Caddy LAST (validate → reload, NEVER restart):** dated backup → append
   deploy/caddy/chemeng-pvu.Caddyfile (paste the bod basic_auth account root-side) →
   `caddy validate --config /etc/caddy/Caddyfile` → `systemctl reload caddy` → re-run the
   smoke externally at https://chemeng-pvu.ai4u.now. Next morning: confirm the 06:20 BOD cron
   ran green (output-side liveness = the recreate-damage detector).

## Rollback

`docker compose down` + remove the caddy stanza + `systemctl reload caddy` + (optionally)
drop the DNS record. VPS otherwise untouched. publish-mcp rollback = re-tag the previous image.
