# Phase 7 — Lane B: SPFx AppEmbedView Managed Embed (Post-Activation)

## Context
- Brainstorm: `plans/reports/brainstorm-20261111-pvu-sharepoint-edition.md` · Research: `plans/reports/research-20261111-interactive-html-on-sharepoint.md` (AppEmbedView REGULAR web part; domain-isolated retired Apr 2026; supportsFullBleed; engine-provisioned; activation chain: device-code → PVU-IT → env + publish-mcp recreate)
- Related phases: supersedes Phase 6's page; requires activation-chain envs (`SP_SPFX_COMPONENT_ID=77c11def-0db1-46e8-b4b1-3221c17d94e0`, `SP_API_BASE_URL`); app-side resize reporter touches ai4UCheE.

## Overview
Priority P2 · Status Pending · Effort 1d (behind external activation gate).
Lane B replaces the manual Lane A page with a managed SPFx web part: full-bleed layout, automatic height via postMessage, engine-provisioned with APP-ONLY credentials, and a supersede step written at birth (this file) that archives the unmanaged page. A short decision record must be filed before any design work (standing law).

## Requirements
Functional:
- New web part `cheEmbed` inside the existing SPFx solution (`/Users/nad/ai4u/ai4UPVU/mcps/publish/spfx/ai4u-artifact-viewer/`): REGULAR (no `domainIsolated`), `supportsFullBleed: true`, string property `appUrl` (the token URL), renders an iframe of `chemeng.pvu.ai4u.now/app#t=…` with sensible `allow` attributes based on Phase 6's recorded sandbox attrs.
- Auto-resize: web part listens for `message` events `{type:'che:height', h:number}` from the iframe and sets its height; ai4UCheE gains a reporter that posts the document height on boot and on ResizeObserver changes when `window.self !== window.top`.
- Engine-provisioned page `che-workbench.aspx` hosting the web part; deployment and provisioning use APP-ONLY credentials only.
- Supersede step (executed at the end): archive `che-workbench-embed.aspx`, update surface registry.
Non-functional: no delegated credentials anywhere; the sppkg build is a LOCAL command; Lane A page stays untouched until Lane B is verified live.

## Architecture
```
Engine (publish-mcp, APP-ONLY) ── provisions ──> Site Page che-workbench.aspx
   └─ cheEmbed web part (AppEmbedView-style, supportsFullBleed)
        └─ iframe src …/app#t=TOKEN
             └─ ai4UCheE embed-resize-reporter ── postMessage che:height ──> web part sets height
Token/revocation/rotation identical to Lane A (Phase 4 machinery, Phase 10 ritual).
```

## Related Code Files
| Path | Action | Change |
|---|---|---|
| ai4UPVU `mcps/publish/spfx/ai4u-artifact-viewer/src/webparts/cheEmbed/*` | create | Web part: manifest (`supportsFullBleed`, no domain isolation), component, property pane string `appUrl`, message listener. |
| ai4UPVU `mcps/publish/spfx/ai4u-artifact-viewer/config/package-solution.json` | modify | Include the new component id (fresh GUID) in the solution. |
| ai4UPVU `mcps/publish/sharepoint/provisioner.py` (or sibling) | modify | Provisioning path for a page embedding `cheEmbed` with `appUrl` `[VERIFY-AT-EXECUTION: confirm provisioner supports arbitrary web parts; else add a minimal branch mirroring existing page provisioning]`. |
| ai4UCheE `src/lib/embed-resize-reporter.ts` | create | `startEmbedResizeReporter()` — posts `{type:'che:height', h}` when embedded. |
| ai4UCheE `src/components/shell/app-shell.tsx` | modify | Call the reporter at mount (no-op when top-level). |
| Decision record (ai4UPVU docs tree) | create | Short record: first-party app-origin iframes ≠ untrusted-artifact HTML lane of decision 260913. |

## Tasks

### Task 7.1 — Decision record first (law)
**Goal:** The record exists and is linked before any Lane B code.
**Target files and symbols:** location beside decision 260913 `[VERIFY-AT-EXECUTION: grep -rn "260913" /Users/nad/ai4u/ai4UPVU/docs /Users/nad/ai4u/ai4UPVU/plans 2>/dev/null to find the decisions home]`.
**Steps:**
1. Locate the decisions home via the grep; create the new short record there: statement, rationale (owner-controlled first-party origin, Bearer-gated APIs, cohort token posture), date 2026-11-xx, owner name, link to this phase.
2. Link the record from this phase's summary.
**Success criteria:** Record file exists and is referenced.
**Verify:** `grep -rln "first-party app-origin" <decisions dir>` → exactly 1 file.

### Task 7.2 — Activation chain gate check
**Goal:** Confirmed the external gate is open before building against it.
**Steps:**
1. On the VPS: confirm publish-mcp env has `SP_SPFX_COMPONENT_ID=77c11def-0db1-46e8-b4b1-3221c17d94e0` and `SP_API_BASE_URL` set (`docker exec <publish-container> env | grep SP_` — ids only).
2. Confirm App Catalog availability for the PVU tenant (owner statement or engine status call). If not open: STOP — this phase parks; do not build placeholder provisioning.
**Success criteria:** Both envs present; App Catalog reachable per owner.
**Verify:** the `env | grep SP_` output shows both keys (values recorded, secrets absent).

### Task 7.3 — App-side resize reporter (ai4UCheE)
**Goal:** The app reports its height when embedded.
**Target files and symbols:** `src/lib/embed-resize-reporter.ts` (new `startEmbedResizeReporter`), `src/components/shell/app-shell.tsx` (mount call).
**Steps:**
1. Implement: if `window.self === window.top` return (no-op); else observe `document.documentElement` with ResizeObserver and `window.parent.postMessage({type:'che:height', h: Math.ceil(height)}, '*')` on change (debounced 100 ms; '*' target acceptable — payload is a number only).
2. Call once at app-shell mount.
3. Unit test with jsdom + stubbed parent.
**Success criteria:** Embedded-simulated window posts the message; top-level posts nothing.
**Verify:** `cd /Users/nad/ai4u/ai4UCheE && npx vitest run src/lib/embed-resize-reporter.test.ts` → exit 0.

### Task 7.4 — cheEmbed web part + package
**Goal:** A REGULAR, full-bleed web part that frames the app and auto-sizes.
**Target files and symbols:** `…/src/webparts/cheEmbed/` (manifest + component), `config/package-solution.json`.
**Steps:**
1. Scaffold the web part in the existing solution following the sibling artifactViewer structure (toolchain, lint, build commands unchanged).
2. Manifest: `supportsFullBleed: true`; NO `domainIsolated` property; fresh component GUID; property `appUrl` (default empty; set at provisioning).
3. Component: render iframe `src={appUrl}` with `allow="fullscreen"` and sandbox attributes matching Phase 6's recorded working set; add `window.addEventListener('message', …)` filtering `che:height` and setting state height.
4. Build + package locally (solution's standard `gulp bundle --ship && gulp package-solution --ship` or npm-script equivalent `[VERIFY-AT-EXECUTION: read solution package.json scripts]`).
**Success criteria:** sppkg builds; local workbench renders the iframe with a stub URL.
**Verify:** package command exits 0 and the dated `.sppkg` appears under `sharepoint/solution/` (`ls -l …/sharepoint/solution/*.sppkg` shows a new file).

### Task 7.5 — Engine provisioning of `che-workbench.aspx`
**Goal:** The managed page exists via APP-ONLY flow, hosting cheEmbed with the fresh token URL.
**Target files and symbols:** `mcps/publish/sharepoint/provisioner.py` (page-with-webpart branch), engine publish invocation `[VERIFY-AT-EXECUTION: engine CLI/API shape used in Phase 9 rehearsal]`.
**Steps:**
1. Add/extend the provisioning branch to create page `che-workbench.aspx` with the cheEmbed web part and `appUrl` property (mirroring existing page provisioning code paths).
2. Mint a fresh 30d token (Phase 4 script) for the property value; record jti in the registry.
3. Run the engine deployment (upload sppkg to App Catalog, add app, provision page) with APP-ONLY credentials from the owner laptop / VPS.
4. Verify the page live: full-bleed layout, iframe loads, height auto-adjusts (scroll the app, watch the frame grow).
**Success criteria:** Page live for site members; auto-resize observed; Kongming acceptance walk repeated inside Lane B (copilot interaction end-to-end).
**Verify:** planner records the page URL + a height-change observation in the phase summary; `curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer <token>" https://chemeng.pvu.ai4u.now/api/copilot -X POST -d '{…}'` → `200` (same origin still healthy).

### Task 7.6 — Supersede Lane A (written at birth, executed now)
**Goal:** One front door remains, and it is the managed one.
**Steps:**
1. Owner confirms Lane B page is the announced link (update any course links pointing at the old page).
2. Rename (archive) `che-workbench-embed.aspx` to `che-workbench-embed-superseded-<date>.aspx` (or delete after owner confirmation; prefer rename for audit).
3. Update the surface registry: Lane B page active, Lane A archived, next rotation date.
4. Confirm students loading the old URL see the renamed page (SharePoint handles rename redirects) and are pointed to the new link.
**Success criteria:** Registry shows one active surface; old page archived.
**Verify:** `grep -rn "che-workbench-embed" <registry note>` shows the archived status line.

## Todo
- [ ] 7.1 Decision record filed
- [ ] 7.2 Activation gate confirmed
- [ ] 7.3 Resize reporter in ai4UCheE
- [ ] 7.4 cheEmbed web part + sppkg
- [ ] 7.5 Engine-provisioned che-workbench.aspx live
- [ ] 7.6 Lane A superseded

## Success Criteria
- Kongming acceptance repeated inside Lane B; full-bleed + auto-resize working; no basic-auth prompt in embed; direct surface unchanged.
- APP-ONLY everywhere (no device-code/delegated steps in the deploy path — device-code belonged to the one-time activation chain, not this phase).
- Rollback: revert to Lane A in minutes — unarchive the Lane A page (rename back), repoint links; remove the Lane B page via engine; the sppkg may remain in the catalog harmless. Registry updated to reflect the revert.

## Risk Assessment
- Activation chain stalls at PVU-IT (external): phase parks at Task 7.2 with zero sunk design cost beyond the decision record (which is filed first regardless — it is a law).
- Provisioner gap for arbitrary web parts: discovery inside Task 7.5; if larger than a branch, STOP per Failure Protocol rather than rewriting the engine.
- Auto-resize feedback loop (resize → postMessage → resize): mitigated with debounce + height-only payload; likelihood low.
- SPFx toolchain drift (node version etc.): use the solution's existing lockfiles; `npm install` in the solution dir before building.

## Security Considerations
- Token posture identical to Lane A (cohort token in page property; internal tier; 30d rotation; JTI/epoch revocation).
- APP-ONLY law: engine credentials never delegated; sppkg upload via app-only context.
- No change to corpus containment or gateway-key handling.

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
- Rotation of the Lane B token joins Phase 10's ritual (page property edit instead of iframe edit).
- Phase 8's kill-gate review happens after this phase is live (owner has now seen both lanes).
