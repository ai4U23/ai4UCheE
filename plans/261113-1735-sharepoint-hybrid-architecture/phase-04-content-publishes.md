# Phase 4 — Content Publishes (4 Items)

## Context
- Parent: `../plan.md` (laws 1, 5; gate GB). Supersedes-for-execution:
  `261111-1048/phase-09-sharepoint-content-publishes.md` (its lane map and
  rehearsal discipline carry over verbatim).
- Engine surfaces (ai4UPVU, vendored): `sharepoint/document_publisher.py`
  (`publish_document`: drive resolution + folder map + visibility tier +
  sharing link), `sharepoint/media_publisher.py` (Stream lane — least-proven
  path), `sharepoint/graph_client.py` (Graph lanes — dead until GB).
- Gate GB adds Graph `Sites.Selected` + site grant for app `5b4c6b66`; the
  Phase 1 Task 1.3 probe (`GRAPH_LANE_OK`) is the entry ticket.
- Content laws: generated work product and re-derived art ONLY — no corpus
  text/crops; calc-sheet PDFs export from the live app (text equations, no
  embedded page images); infographics = calibrated SVG reproductions from the
  app's own chart components; teacher guides authored in Vietnamese.
- Visibility tier: `internal` for all four (member-readable).

## Overview
Priority P2 · Status Pending · Effort 2.5d · Depends on GB green.
Land the four content items into SharePoint natively: calc-sheet PDFs →
`Documents/Calc Sheets/`, teacher guides → `Documents/Teacher Guides/`,
infographic SVGs → SiteAssets, video guide → Stream. One rehearsal receipt
per lane BEFORE any bulk publish; republish (overwrite) path proven once.

## Tasks

### Task 4.1 — Lane rehearsal (one item per lane)
- Goal: one proven command template + receipt per lane.
- Steps:
  1. Documents lane: publish ONE test PDF via `publish_document`
     (kind=documents, scratch name `_lane-rehearsal.pdf`), record driveId +
     webUrl; then engine-delete it; record the delete status.
  2. Infographic lane: same with one small SVG (kind=infographic → SiteAssets
     drive), publish + delete receipts.
  3. Media/Stream lane: pilot the real video LAST but rehearse metadata-only
     first — upload a 5-second placeholder clip to a scratch Stream location,
     confirm playback URL, delete if the API allows (else record retention).
- Success criteria: three rehearsal receipts (URL + delete outcome).
- Verify: the rehearsal report contains 3 `LANE_OK` lines
  (`grep -c "LANE_OK"` prints 3).

### Task 4.2 — Item 1: Calc-sheet PDFs
- Goal: starter library of real calc sheets (one per workbench type).
- Steps:
  1. Generate 6–10 sheets from the local server export flow (the e2e-spec
     export path), Vietnamese.
  2. Copyright spot-check: `pdfimages -list` on one sheet → 0 embedded images
     (generation is textual by construction; the grep is the receipt).
  3. Publish to `Calc Sheets/` (internal); member-open check on one URL.
- Success criteria: folder listing shows the set; one member-open 200.
- Verify: engine receipts recorded; `pdfimages -list <one>.pdf | grep -c
  "image"` prints 0.

### Task 4.3 — Item 2: Video guide → Stream
- Goal: the guide watchable in the tenant.
- Steps:
  1. Render locally (`video-guide/` project; render script recorded at
     execution from its package.json).
  2. Publish via the media lane (internal); record the Stream URL.
  3. Member playback check; add the Stream link beside the workbench embed
  page (P6 cross-link slot).
- Success criteria/Verify: URL + playback confirmation in the publish log.

### Task 4.4 — Item 3: Infographic SVGs → SiteAssets
- Goal: re-derived diagrams as page assets.
- Steps: export/regenerate calibrated SVGs from the app chart components
  (re-derivation law — never PDF crops); publish kind=infographic; verify one
  URL renders in a browser tab.
- Success criteria/Verify: URLs + one render screenshot in the report.

### Task 4.5 — Item 4: Teacher guides
- Goal: authored Vietnamese guides in `Teacher Guides/`.
- Steps: author `content/teacher-guides/*.md` (vi), render to PDF (repo-local
  tool), publish kind=documents; one member-open check.
- Success criteria/Verify: folder listing + member-open 200 receipt.

### Task 4.6 — Publish log + republish proof
- Goal: the durable receipt set + overwrite proven.
- Steps: write `reports/publish-log-<date>.md` (every URL + timestamp);
  re-publish ONE calc sheet (overwrite) and confirm the version increments —
  the republish path is now proven for steady-state corrections.
- Success criteria/Verify: log exists; overwrite receipt shows a version bump
  line.

## Todo
- [ ] 4.1 Rehearsal ×3 lanes
- [ ] 4.2 Calc sheets
- [ ] 4.3 Stream video
- [ ] 4.4 Infographics
- [ ] 4.5 Teacher guides
- [ ] 4.6 Log + republish proof

## Success Criteria
All four items live natively with receipts; every lane has a proven command
template; republish path proven; zero corpus material anywhere (spot-check
receipts on record).

## Risk Assessment
- Stream lane is the least-proven engine path — rehearsed first with a
  placeholder; if the lane is structurally broken, the video item parks with
  a dated retry and the other three proceed (Stream is not a blocker for
  them).
- Generated artifacts size: calc sheets and guides are small; the rendered
  video may be large — the engine's chunked upload path exists; rehearse it
  with the placeholder if the mp4 exceeds the simple-upload bound.

## Security Considerations
- APP-ONLY credentials (law 5); visibility `internal` everywhere; no student
  PII in any artifact (workbench saves are private per browser and never
  leave the VPS).

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
- P6 folds the content URLs into the cross-link/UX pass. Stream link lands
  beside the workbench page (P6, after Phase 3 publishes it).
