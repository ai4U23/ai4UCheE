# Phase 2 — BOD Native Mirror (Cron Dual-Publish)

## Context
- Parent: `../plan.md` (laws 2, 3, 4; gate GA). Repo: **ai4UPVU** (the BOD
  tooling lives there; sibling-session laws apply — commit by path, host tree
  clean).
- Script under change: `mcps/publish/scripts/pvu-bod-republish.sh` (in-tree
  source; deployed by copy to `/usr/local/bin/pvu-bod-republish.sh` with
  SHA-logged `SCRIPT_SHA` — the in-tree host tooling law). Current shape
  (verified 261113): preflight data-mcp health → bake via
  `pvu_bod_usage_spec.py` (fidelity gate) → publish page update-in-place →
  output-side liveness (`ict_date` in the artifact).
- Artifact facts: single self-contained htmlApp, ~928 KB at
  `/data/artifacts/pvu-bod-usage-dashboard-vn/index.html` (fresh bake ~977 KB
  261113) — well under the 10 MB native cap; runtime network exists ONLY for
  the chat tile (accepted dead in the mirror).
- Target native path: `SitePages/pvu-bod-usage-mirror.html` (distinct name —
  never collide with the live `.aspx` page or its slug).
- Upload transport: app-only SP REST `Files/Add` (site-scoped `_api`; the
  261113-proven shape: `GetFolderByServerRelativeUrl('...SitePages')/Files/Add`
  raw bytes, `text/html`) then `Publish` — same lane the gadget used.
- **Additive law 3**: the existing `pvu-bod-usage-dashboard-vn.aspx` page and
  its SPFx viewer are NOT touched in any step of this phase.

## Overview
Priority P1 · Status Pending · Effort 0.5d · Depends on GA green.
One bake, two publishes: after the nightly bake, the cron additionally uploads
the baked artifact as the native mirror page and publishes it. The mirror is
the outage-proof window-less copy; the existing page keeps the chatbot. A
fresh `ict_date` must appear in BOTH receipts (law 4).

## Architecture
```
06:20 ICT cron (unchanged head):
  preflight data-mcp → bake (fidelity gate) → publish page (existing, untouched)
  NEW step 3.5: upload artifact bytes → SitePages/pvu-bod-usage-mirror.html
                → Publish(major) → verify Length == baked bytes + ict_date
  (liveness assert extended to both lanes; fail-loud exit code unchanged)
```

## Related Code Files
| Path | Action | Change |
|---|---|---|
| ai4UPVU `mcps/publish/scripts/pvu-bod-republish.sh` | modify | Add dual-publish step + mirror receipts + both-lane liveness. |
| ai4UPVU host copy `/usr/local/bin/pvu-bod-republish.sh` | redeploy | Copy + verify `SCRIPT_SHA` in the next run's log line. |
| `plans/261113-1735-sharepoint-hybrid-architecture/reports/bod-mirror-2026-11-14.md` | create | First-fire receipts (Length, Publish, render check). |

## Tasks

### Task 2.1 — Extend the script (in-tree)
- Goal: one bake → two publishes, fail-loud, additive — and parked days cost
  nothing (kongming amendment: the bake currently runs BEFORE the 403 is
  discovered, burning an LLM bake per parked day).
- Target files: `mcps/publish/scripts/pvu-bod-republish.sh`.
- Steps:
  0. **Write-probe preflight (NEW, before the bake):** a two-line app-only
     `Files/Add` of a tiny probe into SitePages (delete immediately). On 403:
     log `WRITE-LANE PARKED — mirror skipped (no bake spend)` and skip the
     mirror leg entirely (the existing page lane proceeds as today — its own
     publish will fail loud per current behavior; do not change that).
  1. After the existing publish step, add a mirror step using the engine's
     app-only client (in-container `python3 -` block, same style as the bake
     step): read the baked `index.html` bytes, `Files/Add` to
     `/sites/PVIAICowork/SitePages` as `pvu-bod-usage-mirror.html`
     (`overwrite=true`), then `Publish(comment='native mirror <ict_date>')`.
  2. Receipt asserts in the script: server `Length` == local byte count; the
     freshly baked `ict_date` string present in the UPLOADED artifact body
     (the script already greps the local bake — reuse the same date token).
  3. Mirror failure must NOT fail the primary page publish: primary first,
     then mirror; mirror failure logs `MIRROR FAILED: <reason>` and exits
     non-zero at the END (fail-loud preserved; the page lane stays green).
  4. Extend the closing liveness line to
     `=== republish exit 0 (publish ok, mirror ok, liveness GREEN) ===`.
- Success criteria: `bash -n` clean; the diff touches only this script.
- Verify: `bash -n mcps/publish/scripts/pvu-bod-republish.sh` exits 0 and
  `git diff --stat` shows exactly 1 file.

### Task 2.2 — Commit by path + deploy by copy
- Goal: the host runs the new script with provenance.
- Steps:
  1. `git add mcps/publish/scripts/pvu-bod-republish.sh` + commit (ai4UPVU).
  2. Deploy: `scp` to VPS, `sudo cp` over `/usr/local/bin/pvu-bod-republish.sh`,
     record the new `SCRIPT_SHA` (`sha256sum | cut -c1-12`) in the report —
     the next cron log line must print it (the hash-logging law).
- Success criteria: host copy sha matches the committed file's sha.
- Verify: `ssh pvu 'sudo sha256sum /usr/local/bin/pvu-bod-republish.sh'`
  equals local `sha256sum` of the committed file (record both in the report).
- **Park-rule amendment (kongming):** deploy the host copy EVEN IF GA is
  parked — the write-probe preflight makes parked days nearly free, and the
  first GA-green morning auto-fires the mirror with zero further action.

### Task 2.3 — First fire + receipts
- Goal: the mirror page exists, published, fresh.
- Steps:
  1. Trigger one manual run of the host script (it is idempotent — same bake
     lane; the page update-in-place and mirror overwrite are both safe).
  2. Capture: `Files/Add` Length receipt, Publish status, and the closing
     liveness line quoting BOTH lanes.
  3. Write `reports/bod-mirror-2026-11-14.md` with all receipts + the
     `SCRIPT_SHA` provenance line.
- Success criteria: script exit 0; closing line contains `mirror ok`.
- Verify: `sudo tail -5 /var/log/pvu-bod-republish.log` shows
  `publish ok, mirror ok, liveness GREEN` and the new `SCRIPT_SHA`.

### Task 2.4 — Mirror render + outage-proof check
- Goal: proof the native page works without our origin.
- Steps:
  1. IAB (owner session): open
     `https://pvuedu.sharepoint.com/sites/PVIAICowork/SitePages/pvu-bod-usage-mirror.html`
     — verify SharePoint chrome + the dashboard renders with today's numbers
     (same ict_date as the receipts).
  2. **Origin-outage proof (kongming amendment — DevTools "Offline" is
     mechanically wrong, it blocks the SharePoint fetch too):** use DevTools
     REQUEST BLOCKING on `*ai4u.now` only, then RELOAD — the page must still
     render with today's numbers and a visible-but-inert chat tile (the tile
     is present and dead, not removed — the artifact is byte-identical;
     wording corrected from plan.md's earlier "baked as inert"). Equivalent
     clean alternative: assert ZERO non-`*.sharepoint.com` requests in a
     normal load's request log.
  3. Screenshot both states into the report dir.
- Success criteria: render 200 + blocked-origin reload still renders widgets.
- Verify: the report contains both screenshots and a dated
  `MIRROR_RENDER_PASS` line; `grep -c "MIRROR_RENDER_PASS"` prints 1.

## Todo
- [ ] 2.1 Script extended (bash -n clean, 1-file diff)
- [ ] 2.2 Committed by path + deployed by copy (sha match)
- [ ] 2.3 First fire receipts (mirror ok liveness line)
- [ ] 2.4 Render + offline-reload proof

## Success Criteria
Nightly job feeds both lanes with one bake; mirror receipts carry the fresh
ict_date; mirror page renders origin-independently; existing page provably
untouched (its publish path ran unchanged, same log section shape).

## Risk Assessment
- Mirror upload races the page publish — sequenced in-script (primary first),
  no parallelism.
- Page-version churn doubles on SitePages (~60/mo combined vs 500 cap) —
  watch item only (P6).
- If GA parks: this phase parks; the script edit may still land in-tree
  (no host deploy) so nothing is lost.

## Security Considerations
- App-only credentials in the cron (law 2); no delegated material anywhere.
- The artifact contains no secrets (bake output, public dashboards posture).

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
- P6 cross-links the mirror ↔ chatbot page. Kongming checkpoint: after Task
  2.4, pass receipts for a go/no-go before calling the mirror stable.
