# Phase 9 — SharePoint Content Publishes (4 Items, Engine-Managed, Post-Activation)

## Context
- Brainstorm: `plans/reports/brainstorm-20261111-pvu-sharepoint-edition.md` · Research: `plans/reports/research-20261111-interactive-html-on-sharepoint.md` (four-lane router: pages / documents / media→Stream / infographic→SiteAssets; visibility tiers; `PUBLISH_SHAREPOINT_DEFAULT=1`)
- Related phases: external gate = the same activation chain as Phase 7; item 1 benefits from Phase 6 (live embed exports real sheets).

## Overview
Priority P2 · Status Pending · Effort 2.5d (behind activation gate).
Four content items land in SharePoint through the publish engine, all with APP-ONLY credentials: exported calc-sheet PDFs and teacher guides into a Document Library, the repo's video guide onto Stream, and calibrated SVG infographics into SiteAssets. Every item is generated work product or re-derived art — never copyrighted corpus material.

## Requirements
Functional:
1. Calc-sheet PDFs → Document Library folder `Calc Sheets/` — a starter set exported from the live app (or local server) covering each workbench type; engine documents lane.
2. Video guide → Stream — render the Remotion project at `video-guide/` locally, publish via engine media lane.
3. Infographic/atlas crops → SiteAssets — calibrated SVG reproductions exported/regenerated from the app's own chart components; explicitly NOT PDF crops (law).
4. Teacher guides → Document Library folder `Teacher Guides/` — authored markdown rendered to PDF (or kept .md per owner preference).
- All publishes: engine-first (`PUBLISH_SHAREPOINT_DEFAULT=1`), visibility tier `internal`, APP-ONLY.
Non-functional: every publish has a tenant-verification step; republish (overwrite) path proven once per item.

## Architecture
```
Local artifacts (generated/owned)          Engine (publish-mcp, APP-ONLY)      SharePoint
 calc-sheet PDFs        ── documents lane ──> Document Library /Calc Sheets/
 video-guide render mp4 ── media lane ─────> Stream
 calibrated SVGs        ── infographic lane > SiteAssets
 teacher guides (pdf/md)── documents lane ─> Document Library /Teacher Guides/
```
Engine invocation surface `[VERIFY-AT-EXECUTION: rehearse once — the publish skill CLI in mcps/publish/skill/ or the :3020 API; pick one, record the exact command template]`.

## Related Code Files
| Path | Action | Change |
|---|---|---|
| `exports/calc-sheets/*.pdf` | create (generated) | Starter calc-sheet set (not committed if large; kept local + VPS backup dir). |
| `video-guide/` render output (e.g. `out/*.mp4`) | create (generated) | `[VERIFY-AT-EXECUTION: render script name — check video-guide/package.json scripts]`. |
| `exports/infographics/*.svg` | create (generated) | Calibrated SVG reproductions from app chart components. |
| `content/teacher-guides/*.md` (+ rendered pdf) | create | Authored guides (vi). |
| `plans/261111-1048-pvu-sharepoint-edition/reports/publish-log-<date>.md` | create | Publish receipts (urls + timestamps). |
| No application code changes. | — | — |

## Tasks

### Task 9.1 — Engine rehearsal (once, gates the rest)
**Goal:** One proven command template for each lane.
**Steps:**
1. Confirm activation envs live (same check as Phase 7 Task 7.2).
2. Dry-run a trivial document publish (one test PDF) through the chosen invocation; record the exact command + output URL; delete the test item via engine.
3. Record the command templates for documents/media/infographic lanes in the phase summary.
**Success criteria:** One test artifact published, verified in tenant, deleted — all via engine.
**Verify:** the recorded receipt (URL + delete confirmation) in the summary.

### Task 9.2 — Item 1: Calc-sheet PDFs → Document Library
**Goal:** A starter library of real calc sheets exists.
**Steps:**
1. Generate 6–10 sheets (one per workbench type) from the local server (`npm run server` + `npm run sidecar`, export flow as in e2e tests) — or from the live embed if Phase 6 is done.
2. Copyright spot-check per sheet: text equations/citations only, no embedded PDF page images (inspect one PDF's embedded images list; generation path is textual so expect none).
3. Publish to `Calc Sheets/` (internal tier); verify each URL opens for a member account.
**Success criteria:** Folder listing shows the set; one member open-test passes.
**Verify:** engine receipts in the publish log; spot-check `pdftotext exports/calc-sheets/<one>.pdf - | grep -c "Perry"` → citations present as text is fine; embedded-image audit command recorded (e.g. `python3 -c "…pikepdf…"` or `pdfimages -list` → 0 images).

### Task 9.3 — Item 2: Video guide → Stream
**Goal:** The guide is watchable in the tenant.
**Steps:**
1. Render locally: `cd video-guide && npm ci && npm run <render-script>` `[VERIFY-AT-EXECUTION]` → mp4.
2. Publish via media lane (internal tier); note the Stream URL.
3. Add the Stream link to the course page next to the embed (owner edit, ~5 min).
**Success criteria:** Stream URL plays for a member.
**Verify:** URL + member playback confirmation in the publish log.

### Task 9.4 — Item 3: Calibrated SVG infographics → SiteAssets
**Goal:** Re-derived diagrams available as page assets.
**Steps:**
1. Export/regenerate SVGs from the app's own chart components (source code of record — original work): run the app locally, export the atlas/chart SVGs via their existing export affordances, or serialize from the React components in a small node script `[VERIFY-AT-EXECUTION: check for an existing chart-export utility in src/]`.
2. Review each: no embedded raster from the corpus; text re-typeset (not photographed).
3. Publish via infographic lane; collect SiteAssets URLs.
**Success criteria:** SVG set live; visual review passes (owner eyeball).
**Verify:** publish log lists URLs; `grep -c "<image" exports/infographics/*.svg` → 0 per file (no embedded rasters).

### Task 9.5 — Item 4: Teacher guides → Document Library
**Goal:** Vietnamese teacher guides in the library.
**Steps:**
1. Author 2–3 guides (per-workbench teaching notes, vi) as markdown; render to PDF if owner prefers.
2. Publish to `Teacher Guides/` (internal tier); verify member access.
**Success criteria:** Folder populated; owner approves content.
**Verify:** receipts + owner sign-off recorded.

## Todo
- [ ] 9.1 Engine rehearsal + command templates
- [ ] 9.2 Calc-sheet PDFs published (copyright spot-check clean)
- [ ] 9.3 Video guide on Stream
- [ ] 9.4 SVG infographics in SiteAssets
- [ ] 9.5 Teacher guides published

## Success Criteria
- All four items live with receipts; member-account open/play tests pass for each.
- Copyright containment proven: no raw PDF crops or raw text extracts shipped client-side/into SharePoint (Task 9.2 image audit = 0; Task 9.4 raster grep = 0) — only generated sheets and re-derived SVGs.
- Rollback: each item engine-deletable individually (rehearsed in 9.1); nothing touches the app runtime.

## Risk Assessment
- Activation chain delay pushes the whole phase: items are ready locally regardless (buildable without the tenant); publish is the last step.
- Remotion render heavy on laptop: run overnight if needed; no CI (law) so it is a local long command.
- Engine lane quirks (folder creation, naming): rehearsal surfaces them on a throwaway artifact first.

## Security Considerations
- APP-ONLY credentials for every publish (law 261110); no delegated flows.
- Visibility tier `internal` for all four items (students/teachers of the site; not link-public).
- No corpus bytes in any item (Spot-checks above); citations as text are facts, not reproductions.

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
- Phase 10 adds content review cadence (quarterly law re-check includes SiteAssets drift scan).
- If Phase 8 shipped, its registry entry joins the same quarterly sweep.
