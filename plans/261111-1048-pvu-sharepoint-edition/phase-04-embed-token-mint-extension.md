# Phase 4 — Embed-Token Mint Extension in ai4UPVU Publish Engine

## Context
- Brainstorm: `plans/reports/brainstorm-20261111-pvu-sharepoint-edition.md` · Research: `plans/reports/research-20261111-interactive-html-on-sharepoint.md`
- Cross-repo: ALL work in `/Users/nad/ai4u/ai4UPVU` under `mcps/publish/`. Machinery verified: `mcps/publish/token_manager.py` (`create_signed_token` line 116, `_DEFAULT_AUDIENCE='artifact_viewer'` line 38, min secret 32 line 37), precedent `mcps/publish/sharepoint/token_utils.py:20` (`generate_embed_token`, TTL 30, purpose embed), revocation `revoke_token`/`revoke_all_tokens` (lines 303/381), revoke script `mcps/publish/scripts/revoke_restricted_embed_tokens.py`.
- Related phases: consumes Phase 2's verifier contract; feeds Phases 5, 6, 10.

## Overview
Priority P1 · Status Pending · Effort 0.5d.
The engine can mint HMAC tokens, but nothing today mints one for a non-artifact consumer like the CHE app, and the Express middleware needs a way to learn revoked JTIs. This phase adds a minimal CHE mint path (script-first, no new public HTTP surface), registers the standing slug `che-workbench` so epoch revocation works, and exposes an internal revoked-JTI listing the middleware can poll. It also performs the day-one real-secret check on the VPS.

## Requirements
Functional:
- `mint_che_embed_token.py` mints `slug='che-workbench'`, `sub='pvu-cohort'`, `ttl_days=30`, `purpose='embed'` via existing `token_manager.create_signed_token` and prints: token, jti, ISO expiry, and the ready iframe URL `https://chemeng.pvu.ai4u.now/app#t=<token>`.
- A standing artifact row for slug `che-workbench` exists so `revoke_all_tokens('che-workbench', …)` (epoch) works.
- Internal endpoint `GET /internal/revoked-jtis/<slug>` on publish-mcp returns `{"slug":…,"jtis":[…]}` from the authoritative store; protected from non-internal callers.
- Day-one check proves `PUBLISH_MCP_TOKEN_SECRET` on the VPS is real (≥ 32 chars, not the dev constant) without printing it.
Non-functional: no new public unauthenticated surface; mint path refuses to run when the secret policy trips (fail-closed); all tests local.

## Architecture
```
Owner laptop (SSH) ── docker exec publish-mcp ── mint script
   └─ token_manager.create_signed_token('che-workbench','pvu-cohort',30,'embed')
        └─ prints URL  → pasted into SharePoint page (Phase 6/10)
Express container ── GET http://publish-mcp:3020/internal/revoked-jtis/che-workbench
   (60 s cache, Phase 2)        └─ authoritative revoked set (Postgres/Redis)
Emergency: revoke_token(jti) or revoke_all_tokens(slug) → embed dark ≤ 60 s
```

## Related Code Files (repo /Users/nad/ai4u/ai4UPVU)
| Path | Action | Change |
|---|---|---|
| `mcps/publish/sharepoint/che_embed.py` | create | `CHE_SLUG='che-workbench'`, `CHE_PRINCIPAL='pvu-cohort'`; `generate_che_embed_token()` wrapping `create_signed_token` (mirror of `sharepoint/token_utils.py:20`). |
| `mcps/publish/scripts/mint_che_embed_token.py` | create | CLI: prints token/jti/expiry/iframe URL; refuses when `require_token_secret` raises. |
| `mcps/publish/api/routes.py` | modify | Add internal revoked-JTI listing route (see Task 4.3 for exact placement and auth). |
| `mcps/publish/api/auth.py` | modify (if needed) | Internal service-token check for the new route, reusing existing internal auth helpers `[VERIFY-AT-EXECUTION: read auth.py before choosing the helper]`. |
| `mcps/publish/tests/test_che_embed_token.py` | create | Mint + claims + refusal + revocation listing tests. |
| Artifact registration | modify | Standing `published_artifacts` row for slug `che-workbench` (mechanism per Task 4.2 discovery). |

## Tasks

### Task 4.1 — Discovery: runtime + reachability
**Goal:** Exact, verified facts about how scripts run on the VPS and what the internal API surface offers — replacing the two `[VERIFY-AT-EXECUTION]` pins.
**Target files and symbols:** VPS compose layout `/opt/…` `[VERIFY-AT-EXECUTION]`, publish-mcp service name/port (`:3020`), `mcps/publish/api/auth.py`, `mcps/publish/server.py` (route registration).
**Steps:**
1. SSH to `pvu.ai4u.now`; run `docker ps --format '{{.Names}} {{.Ports}}' | grep -i publish` and `ls /opt/` — record the compose project path and service name.
2. Read `mcps/publish/api/auth.py` and the route-registration site in `server.py`/`api/routes.py` to pick the internal-auth helper and mounting pattern.
3. Confirm script execution shape: `docker exec -it <publish-container> python -m …` works from the VPS shell (record exact container name).
4. Record findings in the phase summary; update every later task that cited a pin.
**Success criteria:** Container name, compose path, internal-auth helper, and script-execution command are written down and used by Tasks 4.2–4.4.
**Verify:** the discovery commands' outputs are captured in the phase summary (no pass/fail beyond presence); `no verification needed` beyond that.

### Task 4.2 — Mint module + script + slug registration
**Goal:** One command on the VPS yields a fresh 30-day token URL; epoch revocation is possible from day one.
**Target files and symbols:** `mcps/publish/sharepoint/che_embed.py`, `mcps/publish/scripts/mint_che_embed_token.py`, slug registration mechanism.
**Steps:**
1. Implement `che_embed.py` exactly mirroring `token_utils.py` structure (reuse, do not duplicate, `token_manager`).
2. Implement the CLI script: argparse `--ttl-days` (default 30, clamp 1–30), prints the four lines (token, jti, expiry ISO, URL).
3. Register the standing slug: discover how `published_artifacts` rows are created (grep `INSERT INTO published_artifacts` in `mcps/publish/`); prefer an existing API/admin path; if none, add a tiny guarded insert in the script's `--register-slug` mode. The row exists once, then forever.
4. Local test: mint twice, assert distinct `jti`, both verify through `decode_and_verify_signature`, claims match the Phase 2 contract (`aud='artifact_viewer'`, `slug='che-workbench'`, `purpose='embed'`).
**Success criteria:** Script output pasted into `curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer <token>" http://localhost:3000/api/screen-state` (local Phase 2 server with the same secret) returns `200`.
**Verify:** `cd /Users/nad/ai4u/ai4UPVU/mcps/publish && python3 -m pytest tests/test_che_embed_token.py -q` → exit 0.

### Task 4.3 — Internal revoked-JTI listing
**Goal:** The Express middleware can poll revoked JTIs for `che-workbench` without credentials reaching students.
**Target files and symbols:** `mcps/publish/api/routes.py` (new route `GET /internal/revoked-jtis/<slug>`), `mcps/publish/api/auth.py` (internal check).
**Steps:**
1. Implement the route: query the authoritative `revoked_tokens` rows for the slug (plus current epoch value in the payload for diagnostics); return JSON as specified in Phase 2.
2. Protect it: accept only callers presenting the internal service token header (value from env, e.g. `PUBLISH_INTERNAL_API_TOKEN`) or bind/match only the docker-internal listener — per Task 4.1 findings. Never public.
3. Test: revoke a minted JTI (via `token_manager.revoke_token` in the test), then assert the endpoint lists it.
**Success criteria:** From the VPS, `curl -s http://<publish-host>:3020/internal/revoked-jtis/che-workbench -H "<internal auth>"` returns `200` with a JSON body containing `jtis`; unauthenticated curl from off-box returns 401/403.
**Verify:** `python3 -m pytest tests/test_che_embed_token.py -q` → exit 0 (route + auth covered).

### Task 4.4 — Day-one real-secret check on the VPS
**Goal:** Proof the production secret is real before any token is trusted.
**Target files and symbols:** env `PUBLISH_MCP_TOKEN_SECRET` in the publish-mcp container; `mcps/publish/secret_policy.py` (`require_token_secret`).
**Steps:**
1. On the VPS run: `docker exec <publish-container> python3 -c "import os;s=os.environ.get('PUBLISH_MCP_TOKEN_SECRET','');print('len',len(s));print('is_dev_constant', s=='<dev constant value from secret_policy.py>')"` — print length and a boolean only, never the value.
2. If len < 32 or is_dev_constant is True → STOP and generate a fresh secret with the engine's rotation procedure (fallback secret dance per `token_manager.py:96-100`), then re-check.
3. Mint the first production token; store jti + expiry in the surface-registry note (Phase 10 owns the ledger).
**Success criteria:** Check prints `len >= 32` and `is_dev_constant False`; first token minted.
**Verify:** the docker exec output itself (substring `len 3`/`len 4`… ≥ 32 and `False`); record output in phase summary.

## Todo
- [ ] 4.1 Discovery: VPS runtime + internal auth surface
- [ ] 4.2 Mint module + CLI + slug registration
- [ ] 4.3 Internal revoked-JTI endpoint
- [ ] 4.4 Day-one real-secret check + first mint

## Success Criteria
- One command mints a 30d token that passes the Phase 2 verifier end-to-end (cross-repo proof in Task 4.2's Verify).
- Revocation path proven: revoke JTI → listing shows it → middleware denies within 60 s (final live proof in Phase 5).
- Fail-closed: minting and the engine refuse with a dev/empty secret (test asserts the raise).
- Rollback: remove the two new modules + one route; zero impact on existing engine behavior (pytest suite for publish engine still green: `python3 -m pytest tests/ -q` locally, exit 0).

## Risk Assessment
- Mint reachability was unverified at planning time (fact) — Task 4.1 exists precisely to retire that pin before any code lands; likelihood of surprise medium, impact contained to this phase.
- New internal endpoint could leak revocation metadata — mitigated: internal-only binding + service token, payload contains no secrets (JTI ids only).
- Cross-repo coordination (secret shared with ai4UCheE compose): mismatched secrets = every request 401 — Phase 5 smoke step 2/3 catches it immediately; document the exact copy procedure in Phase 10.

## Security Considerations
- APP-ONLY posture preserved: the engine never handles delegated credentials for minting (law 261110).
- Secret never printed, never committed; only its length/boolean checked.
- Tokens are cohort-shared by construction (iframe src readable by site members) — internal-tier posture, revocation is the backstop; epoch revocation (`revoke_all_tokens`) is the instant embed kill switch used in Phase 10.

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
- Hands Phase 5 the mint command + internal URL + service token.
- Phase 6 consumes the first production token URL; Phase 10 owns the 30-day ritual built on Task 4.2's script.
