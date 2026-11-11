# Brainstorm — PVU Edition of ChemEng Workbench on PVU SharePoint (--advice)

Date: 2026-11-11 · Mode: ak-brainstorm --advice under kongming (agent_777fd26b, conditional GO)
Sources: ai4UCheE repo + plans; ai4UPVU activation docs (activation-sharepoint-publish.md, activation-spfx-tenant.md);
code reads: publish sharepoint/__init__.py, publish SPFx viewer src, studio SPFx src, CHE src/server/copilot-route.ts, api-server.ts;
live probes: PVU VPS 32GB/26.5GB avail/326GB disk; chemeng Lightsail 4GB/3.2GB avail, 3 systemd units green.

## User decisions (interview 2026-11-11)

1. Scope: **brand + locale only** (PVU theme/logo, vi-default). No curriculum alignment, no subject trimming.
2. Host: "PVU SharePoint preferable" → interpreted (and kongming-agreed) as: **PVU VPS hosts the runtime** (SharePoint cannot run Python/Node); SharePoint is the front door.
3. Surface: **two-surface engine-default** (BOD pattern).
4. Copilot: **wire to PVU gateway in v1**.

## Kongming correction (SUPERSEDED 2026-11-11 by follow-up research — see research-20261111-interactive-html-on-sharepoint.md)

~~The publish-line SPFx viewer cannot host the app (no iframe path, security decision 260913) → v1 SP leg = dashboard card + link-out.~~ The owner challenged this; ak-research --advice found the missed lane: the **native Embed web part** (OOB iframe, works on NoScript sites, needs only a site-collection-admin domain-allowlist entry — no App Catalog) can host the full app NOW. Kongming GO'd the revised lanes and withdrew the earlier ruling:
- **Lane A (v1, pre-activation)**: native Embed web part embeds the app origin; engine-minted 30d cohort token in URL fragment → Bearer on `/api/*` (new Express middleware + rate limit + gateway spend cap); fixed tall height; 15-min live tenant smoke test gates commitment (iframe `sandbox` attrs = the one tenant-observable fact). Browsers block basic-auth prompts in cross-origin iframes — token gate is mandatory for the embedded lane.
- **Lane B (managed upgrade, post-App Catalog)**: AppEmbedView regular SPFx web part (isolated web parts RETIRED Apr 2026), full-bleed + postMessage auto-resize, engine-provisioned, supersedes the Lane-A manual page.
- **Lane C (parked R&D)**: SharePoint HTML pages (GA worldwide Nov–Dec 2026) — inline JS + MS-managed libs only, no fetch/localStorage; future course-pack-style self-contained artifacts, not for the networked engine.
- 260913 stands untouched (governs untrusted artifact HTML in the ai4u viewer; Lane A involves no viewer) — a new short decision record for first-party app-origin iframes is filed before Lane B design.
- Copilot: single JSON POST, env-only re-point (`GATEWAY_URL`/`GATEWAY_API_KEY`/`GATEWAY_MODEL`, copilot-route.ts:14-16); fix hardcoded branding (line 19) in the brand PR.

## Contract

- **Outcome**: PVU-branded, vi-default ChemEng Intelligent Workbench; primary surface on pvu plane; front-door artifact + button on PVU SharePoint (engine-provisioned, machine-managed); copilot served by the PVU LLM plane.
- **Trade-offs**: PVU VPS container pair (recommended) assumes PVU host ownership of the CHE edition — fails first if pvu.ai4u.now host ops (memory/updates) degrade; chemeng-box flavor was cheaper but keeps PVU edition off the PVU plane and under chemeng stewardship. Two-surface beats waiting on activation: pvu surface unblocks users now; SP leg lands when chain clears.
- **Better approaches**: none beyond the corrected shape — iframe-in-v1 was rejected on code evidence (viewer forbids iframes by design).
- **Constraints**:
  - Activation chain gates the SP leg: device-code → PVU-IT (app reg + consent + **App Catalog**) → env + publish-mcp recreate → provision → verify. Conditional leg, not a v1 failure.
  - Engine consumes **app-only credentials** (standing law 261110); no delegated provisioning under deadline pressure.
  - REQUIRED env overrides at activation: `SP_SPFX_COMPONENT_ID=77c11def-0db1-46e8-b4b1-3221c17d94e0`, `SP_API_BASE_URL` (PVU, not Group publish host).
  - **All CHE routes gate behind caddy** (SPA + `/api/*` + sidecar + every PDF-corpus route), basic_auth per bod precedent, `/health` exempt. Unauthenticated `/api/copilot` would relay GW spend; add caddy rate limit or quota tier on the GW alias.
  - Copyrighted corpus (Perry's + 5 books) stays on the PVU VPS box, out of any document library / SharePoint storage.
  - PVU brand preset + vi default (`_THEME_PRESETS` precedent from BOD; CHE i18n already has EN+VI).
- **Non-goals**: SharePoint does NOT host the app runtime; no iframe embed in v1; no user accounts/SSO in v1; no PVU curriculum mapping; no subject trimming; new repo NOT needed (same ai4UCheE repo, PVU flavor: brand preset + compose + env).
- **Acceptance criteria**:
  1. `https://wb.…` (pvu) serves PVU-branded vi-default workbench; health green.
  2. Copilot answers route through PVU gateway (alias visible in otel/telemetry); deterministic fallback intact when GW down (4.5s).
  3. Every non-`/health` route returns 401/407 to a direct unauthenticated request.
  4. Post-activation: `{slug}.aspx` page renders the CHE dashboard artifact with a working vi-labeled link-out; negative controls (no/bad token) behave as BOD.
  5. Corpus: zero PDF bytes served from or stored in SharePoint.

## Open decisions to pin (owner)

1. **Saved-calcs policy on PVU v1** — shared SQLite has no user identity; cross-user visibility in a school context. Recommend OFF in v1 (env/code flag), pseudonymous local-id or accounts later.
2. **Copilot GW alias** — recommend default flash family (fits 4.5s timeout); student-tier key issuance when audience widens.
3. **Phase-2 appetite** — commit AppEmbedView (iframe) to the roadmap now with PVU-IT round scheduled, or park until v1 proves usage.
4. **30d embed token renewal owner** — ops runbook, same cadence as BOD.

## Wave plan (shape only — goes to /ak-plan)

- Wave 0: brand+locale PR (theme preset, vi default, remove hardcoded ChemEng branding in copilot prompt) + caddy gate + saved-calcs policy flag. (~1 day agent effort.)
- Wave 1: PVU VPS container pair + caddy vhost + health/copilot re-point live-verified. (~half day.)
- Wave 2: CHE dashboard artifact publish (engine-default targets) once activation clears; SP front door + link-out; token renewal runbook. (~2h gate work + owner IT dependency.)
- Phase 2 (optional): AppEmbedView webpart → app-in-SharePoint. New component id, security decision, App Catalog round.

## Rollback

Env-override revert + artifact unpublish (mechanically same as BOD); caddy vhost removal; container teardown. No data-plane coupling.

## Follow-up capacity check — "can we push MORE to PVU's SharePoint?" (2026-11-11, code-verified)

The publish engine's SharePoint writer is a four-lane router (mcps/publish/sharepoint/__init__.py docstring; document_publisher.py, media_publisher.py, provisioner.py):

| Lane | Artifact kinds | Lands where |
|---|---|---|
| Pages | dashboard, html | `{slug}.aspx` modern page + SPFx viewer (provisioner) |
| Documents | presentation, excel, any file artifact | Document Library, folder-per-kind, large-file upload supported, visibility tier applied |
| Media | media | Stream (doc-library upload; Stream playback automatic) |
| Images | infographic, diagram | Site Assets drive |

Visibility tiers map to M365 sharing: internal = site perms, restricted = direct invites, link = org sharing link, public = anon link w/ org fallback → per-artifact audience control without any new code.

**Expanded CHE→SharePoint backlog candidates** (engine-managed post-activation; manual portal possible today, small best-effort):
1. CHE front-door dashboard card (already planned, lane: pages).
2. Exported **calculation sheets as PDF** → Document Library (senior QA/QC sheets; export exists in workbench; avoids script-stripping entirely).
3. **Video guide** (repo has video-guide/ + Remotion plan 261031) → Stream lane.
4. **Infographic/atlas crops** (25-section atlas, chart PNGs) → Site Assets lane (diagram kind).
5. **Teacher guides** (vi/en docx if CHE produces them) → Document Library.
Anti-items: workbench SPA + Python engine (no runtime on SP); copyrighted textbook PDFs (corpus stays on PVU VPS by rule, never school-hosted storage); interactive HTML artifacts degrade in the html lane (sanitizer strips scripts → no KaTeX/interactivity — use PDF lane instead).

## Checkpoint 3 — "what actually needs computing / maximize SharePoint" (2026-11-11)

Owner pushed to move compute into SharePoint. Compute inventory (code-verified): math routers (thermo/hydraulics/distillation/kinetics — closed-form, portable to JS/WASM; CoolProp WASM confirmed official + npm + proven in-browser); handcalcs 3-stage renderer (portable but = re-implementing the pedagogical core); pdf_router + 225MB copyrighted corpus (NOT portable live; raw crops in school SharePoint = copyright anti-item, calibrated-SVG reproductions = own-work OK); copilot relay (needs a server — PVU gateway already there); Express+SQLite (collapsible with saves-off).

Kongming verdicts: **T1 GO** (the real edition; Lane A already maximizes the SharePoint SURFACE). **T2b NO-GO** (static SPA in doc library + relay: full port cost, same VPS dependency, maximizes nothing — "T3 wearing T2's clothes"). **T3 NO-GO**. **T2a conditional GO, demoted from "edition" to gadget** — "PVU CHE Quick-Calcs": 2 calculators (DIPPR + NPSHa), NO handcalcs chain (plain KaTeX templates), single-file HTML via HTML-pages lane, gated on that lane's GA + re-verification, golden-value LOCAL battery (Python oracle vs JS on committed input grid; psig/psia cases mandatory; oracle-commit declared; review at rotation not continuously — no GitHub Actions per owner directive 260910), no localStorage → per-session state named in acceptance, school-hardware load test, programmatic upload path verified before lifecycle promises, no fetch → usage-blind + no copilot + no `/api/actions` lane — students must not discover the cuts. Kill gate: battery green + perf acceptable + owner still wants it after seeing T1 embedded — all three or it dies.

**Premise challenge to owner (the checkpoint's deliverable):** "SharePoint is always-on — but so is the PVU box (26.5GB free, pair costs ~1GB, gateway already lives there). What specifically does compute-in-SharePoint buy?" If the real driver is IT-policy (no external domain in student browsers) — name it; it changes which lane wins. Standing additions: raw text extracts client-side = same copyright anti-class as raw crops (forbidden in contract); T1 power-mode link = the gadget's built-in fallback.

## Locked decisions (owner interview, one-by-one, 2026-11-11)

1. **Motive for compute-in-SharePoint** (multi-select): uptime + maximum SharePoint-native feel + less to maintain. **NOT** an IT-policy block on external domains. → Quick-Calcs gadget has a genuine driver (kongming's conditional GO applies: post-GA gate, 2 calculators, no handcalcs chain, golden-value local battery, kill gate incl. "owner still wants it after seeing T1 embedded").
2. **Saved calcs**: **ON, private per-browser** — pseudonymous client-generated ID in partitioned storage; SQLite stays on the PVU host behind the token gate; per-surface saves named in acceptance (saves made inside the SharePoint frame appear there); the gadget cannot save (no storage in MS sandbox) — consistent with its quick-check role.
3. **Copilot model**: **the PVU gateway default** (flash family — fits the 4.5s deterministic-fallback timer, vision-capable, best-monitored lane). Daily spend cap value pinned at plan time.
4. **Managed upgrade (Lane B)**: **committed now** — plan includes the AppEmbedView wave + the manual page's scheduled retirement (born with a supersede step).
5. **Address**: owner answered "the SharePoint address (pvuedu.sharepoint.com)" — the students' everyday entry = the SharePoint page URL (address bar shows pvuedu.sharepoint.com); the app origin behind the frame stays technically required and invisible: `chemeng.pvu.ai4u.now` (planner's pick, per Q5 recommendation, unclaimed by owner). Consequence named honestly: a NO-external-origin app at the SharePoint address is possible only for the client-side gadget (no copilot/saves/textbook workbenches) — which the gadget now delivers as the fully-native everyday surface alongside the embedded power mode.

## Unresolved (post-interview, all plan-time pins)

- Daily spend-cap value on the default model alias; embed-token TTL confirmation (30d per BOD pattern).
- Engine embed-token mint endpoint reachability for a non-artifact consumer (small extension likely).
- Expanded-backlog cut (which of the 4 doc/media/image items make Wave 2) — owner picks at plan time.
- Activation ETA (owner IAB password step + App Catalog) — tracks [[ai4upvu-sharepoint-first-261110]].
- Gadget: HTML-pages GA + re-verification in the PVU tenant before build starts.
