# Phase 1 — Tenant Placement Probe (Both Libraries)

> **AMENDMENT 2026-11-13 (kongming-counseled, Tasks 1.2/1.3 transport):** the
> engine's Graph lane is DEAD on this tenant — the app registration has NO
> Microsoft Graph application roles (token decode: graph aud, `roles=None`;
> sp aud, `roles=['Sites.Selected']`), so `resolve_site`/`upload_file` 400/401
> for every URL shape. The SP REST lane is healthy. Probe uploads therefore go
> via SharePoint REST with the SAME app-only SP token (probe-only, NO engine
> changes): `POST /_api/web/folders/add('/sites/PVIAICowork/Shared%20Documents/_probes')`
→ `POST /_api/web/GetFolderByServerRelativeUrl('/sites/PVIAICowork/Shared%20Documents/_probes')/Files/Add(url='pvu-html-probe.html', overwrite=true)`
> (raw bytes, Content-Type `text/html`, no digest) → round-trip
> `GET /_api/web/GetFileByServerRelativeUrl('<path>')/$value` must equal the
> local byte length. Site Pages variant posts straight to
> `/sites/PVIAICowork/SitePages` (root exists). Receipt shape =
> `ServerRelativeUrl` + `UniqueId` + `Length` (NOT Graph driveItem id).
> Taxonomy mapping: 4xx from `Files/Add` at ONE placement = probe data
> (`UPLOAD-FAILED:<status> <placement>`); 403 at `folders/add` or across both
> placements = access/infra failure → Failure Protocol. The Graph finding is
> disclosed to the owner (gates the 261111-1048 Phase 9 Graph lanes; ask =
> Graph `Sites.Selected` app role + admin consent + site-scoped grant).

## Context
- Parent: `../plan.md` (laws 1–3 govern this phase above all).
- Evidence base: n8d.at built-in-libraries post + our 11-Nov research (GA
  mid-Nov–late-Dec 2026, enabled by default, per-library off-switch) + 13-Nov
  read-only probe (18 lists enumerated; no HTML switch visible on REST list
  entities → the definitive check is a real upload + real render).
- Engine access pattern (proven 2026-11-13, reuse verbatim): in-container Python
  on the PVU VPS over `ssh pvu`, using `sharepoint.graph_client.get_client()`
  (`resolve_site` → `resolve_drive(site_id, name)` → `upload_file(drive_id,
  remote_path, content, "text/html")`, simple upload < 4 MiB).
- Site: `https://pvuedu.sharepoint.com/sites/PVIAICowork`.

## Overview
Priority P2 · Status Pending · Effort 0.25d · Gate G1 required first.
Answer ONE question with evidence: **where do .html files render in the MS
HTML-pages viewer on the PVU tenant — Documents library, Site Pages library,
both, or neither?** Never assume; the lane choice for Phase 5 comes from the
recorded answer. A "neither" verdict parks the lane with a dated retry — it
does NOT fail the plan.

## Requirements
- Two probe uploads through the engine, APP-ONLY, identical tiny HTML payload.
- One render observation per placement (inline script runs? fetch blocked?
  storage blocked?), via in-app-browser (IAB) or real Chrome; owner fallback if
  IAB is unusable.
- A dated report file is the deliverable — the lane verdict, not a feeling.

## Architecture
```
Mac: gadget/probes/probe.html (authored, <4 KiB)
  └─ ssh pvu → docker exec publish-mcp python
       ├─ upload A: Documents drive  → /_probes/pvu-html-probe.html
       └─ upload B: Site Pages drive → /pvu-html-probe.html
Render check (IAB/Chrome): open each file URL in the tenant
  └─ reports/probe-<date>.md  ← placement answer + sandbox behavior + verdict
```

## Related Code Files
| Path | Action | Change |
|---|---|---|
| `gadget/probes/probe.html` | create | Self-announcing probe payload (below). |
| `plans/261113-0638-quick-calcs-html-pages/reports/probe-<date>.md` | create | The deliverable: placement answer + verdict. |

## Tasks

### Task 1.1 — Author the probe payload
- Goal: one tiny HTML file whose render outcome answers every probe question by
  looking at it.
- Target files: `gadget/probes/probe.html` (new; the `gadget/` tree starts here).
- Steps:
  1. Create `gadget/probes/probe.html` with: a visible heading `PVU HTML-PAGES
     PROBE <build date>`; a static body line reading
     `INLINE_SCRIPT_OK (static fallback — script did not run)` so the marker
     string appears in the source AND in the un-scripted render; one inline
     `<script>` that (a) REPLACES the fallback line with a styled
     `INLINE_SCRIPT_OK`, (b) tries `fetch('https://pvu.ai4u.now/health')`
     inside its own try/catch and appends `FETCH_OK` or `FETCH_BLOCKED:<reason>`,
     (c) tries `localStorage.setItem`/`getItem` inside try/catch and appends
     `STORAGE_OK` or `STORAGE_BLOCKED:<reason>`; inline `<style>` coloring the
     markers; no external references of any kind; total size < 4 KiB.
  2. Commit by path: `git add gadget/probes/probe.html`.
- Success criteria: file exists; markers present in source; zero external refs.
- Verify: `grep -c "INLINE_SCRIPT_OK" gadget/probes/probe.html` prints `2`
  (script text + fallback body text), and
  `grep -cE '(src|href)="https?://' gadget/probes/probe.html` prints `0`.

### Task 1.2 — Upload probe A to the Documents library
- Goal: the probe file exists at a Documents-library path, uploaded APP-ONLY.
- Target files: none in repo (tenant write: `Documents/_probes/pvu-html-probe.html`).
- Steps:
  1. `scp gadget/probes/probe.html pvu:/tmp/pvu-html-probe.html`.
  2. On `ssh pvu`: pre-flight
     `docker exec publish-mcp printenv | grep -iE "^SP_SITE_URL="` — confirm the
     variable exists before writing the heredoc (unverified name = the
     plan-review catch); if absent, read the site URL from the env file
     `/etc/ai4upvu/publish-mcp.env` instead and pass it explicitly.
  3. `docker cp /tmp/pvu-html-probe.html publish-mcp:/tmp/probe.html`.
  4. `docker exec -i publish-mcp python -` with a heredoc script that reads
     `/tmp/probe.html` as bytes, `site_id = await c.resolve_site(os.environ["SP_SITE_URL"])`,
     `drive = await c.resolve_drive(site_id, "Documents")`,
     `item = await c.upload_file(drive["id"], "_probes/pvu-html-probe.html", data, "text/html")`,
     prints the returned `id` and `webUrl`.
- Failure taxonomy (plan-review correction): a library REJECTING an app-only
  plain-file upload (4xx from Graph) is PROBE DATA, not a protocol failure —
  record `UPLOAD-FAILED:<status> <placement>` as that placement's observation
  and continue with the other library. Only infrastructure failures (ssh
  unreachable, engine container down, auth exception) trigger the Failure
  Protocol.
- Success criteria: engine prints a driveItem id + webUrl (or an
  `UPLOAD-FAILED:` observation line).
- Verify: the command output contains `"id":` and `pvu-html-probe.html`, or the
  recorded `UPLOAD-FAILED:4xx Documents` line; exit 0.
  Record the webUrl in the report (Task 1.5).

### Task 1.3 — Upload probe B to the Site Pages library
- Goal: the same probe exists in Site Pages, uploaded as a PLAIN FILE.
- Steps: identical to Task 1.2 (including the failure taxonomy) with
  `resolve_drive(site_id, "Site Pages")` and remote path `pvu-html-probe.html`.
- **Law 2 reminder**: plain drive upload only. Do NOT call
  `sharepoint/provisioner.provision_sharepoint_page` for this probe — that path
  provisions .aspx pages and carries the page-forking quirk.
- Success criteria / Verify: same shape as Task 1.2.

### Task 1.4 — Render-check both placements
- Goal: an observed render result per placement, from a real browser.
- Steps:
  1. Open each file's webUrl in IAB (or real Chrome if a profile is attached).
     A rendering success looks like: SharePoint chrome with the HTML viewer
     showing `PVU HTML-PAGES PROBE`, `INLINE_SCRIPT_OK`, and a
     `FETCH_BLOCKED:*` / `STORAGE_BLOCKED:*` marker. A failure looks like: raw
     download, "not supported", an access-denied tile, or the viewer without
     the script markers.
  2. If a placement fails while the other renders: note whether the library
     settings page shows an "Allow HTML files" off-switch (IAB can reach
     library settings; flipping a tenant setting is NOT in this phase's scope —
     record only).
  3. If IAB is unusable for both (hydration flakiness): mark the report
     `render: PENDING-OWNER`, do not guess, and continue — the owner render
     check folds into the Phase 5 combined session.
- Success criteria: per placement, one of `RENDERS` / `DOES-NOT-RENDER` /
  `PENDING-OWNER` recorded with one observed sentence each.
- Verify: `no verification needed` (the report is verified by Task 1.5's
  completeness grep).

### Task 1.5 — Write the probe report (the deliverable)
- Goal: the lane verdict, dated, machine-checkable.
- Target files: `plans/261113-0638-quick-calcs-html-pages/reports/probe-2026-11-13.md`.
- Steps:
  1. Record: probe date; webUrl + observation per placement (Tasks 1.2–1.4);
     sandbox behavior lines (fetch/storage markers); **Verdict** — exactly one
     of `LANE_GREEN placement=<Documents|Site Pages|either>` /
     `LANE_PARKED retry=2026-11-27` / `RENDER-PENDING-OWNER`.
  2. If `LANE_PARKED`: set the Phase 5 phase-file status line to
     `Blocked (lane parked, retry 2026-11-27)` and stop touching the tenant.
- Success criteria: report exists with all sections present.
- Verify: `grep -c "Verdict:" reports/probe-2026-11-13.md` prints ≥1 and the
  verdict line matches the regex
  `LANE_(GREEN|PARKED|.*PENDING-OWNER)`.

## Todo
- [ ] 1.1 Probe payload authored + committed
- [ ] 1.2 Upload A (Documents) receipt
- [ ] 1.3 Upload B (Site Pages) receipt
- [ ] 1.4 Render observations recorded
- [ ] 1.5 Verdict report written

## Success Criteria
- Placement answer recorded from observation, not assumption; sandbox behavior
  (fetch/storage blocked) empirically noted; a dated verdict; probe files left
  in place as evidence until Phase 5 cleanup.

## Risk Assessment
- Probe uploads write to the tenant — scoped to two tiny files at obviously
  provisional paths; deletion is a Phase 5 step either way.
- IAB flakiness wastes time, not safety — the PENDING-OWNER escape hatch exists.

## Security Considerations
- APP-ONLY engine credentials only; no secrets in the probe payload; the probe
  fetch target (`/health`) is the public health endpoint.

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
- `LANE_GREEN` → Phase 5 unblocked (placement recorded); Phases 2–4 run on
  their own track regardless.
- `LANE_PARKED` → on 2026-11-27 re-run Tasks 1.2–1.5 verbatim (payload already
  committed); meanwhile Phases 2–4 proceed.
- Kongming checkpoint (advice mode): after this phase completes, spawn kongming
  with the verdict + observations for a go/no-go before Phase 5 planning.
