# Canary (partial) + GB Consent Report — 2026-11-13 evening

## Gate GA — early signal (VERDICT tomorrow 06:20 ICT)

- 18:10 ICT tiny app-only write (`Files/Add` → Site Pages): **403** — the
  SP identity-materialization lag continues (~8 h post-grant-restore).
- Posture: **park** per plan. The write-probe preflight shipped in the
  261113 cron edit (sha `be25e7bd5cac`, deployed) means tomorrow's parked
  fire — if still 403 — costs zero LLM spend and logs
  `WRITE-LANE PARKED … FAILED exit 4` (the canary signature).
- **VERDICT (write here after 06:25 ICT 2026-11-14):** `VERDICT: GA______`
  (GA_GREEN = cron `publish ok, mirror ok, liveness GREEN` + tiny write 200;
  GA_PARKED = WRITE-LANE PARKED or FAILED lines + tiny 403; GA_FAILED =
  anything else).

## Gate GB — Graph consent: PARKED on admin-role activation (owner action)

Evidence chain (all tonight):

1. Device-flow as `duc.a.nguyen@pvu.edu.vn` (IAB approve, node-click) with
   scopes `Application.ReadWrite.All AppRoleAssignment.ReadWrite.All
   Directory.ReadWrite.All` — token acquired (scopes CAN be issued; the app
   e71cb649 is tenant-consented for them).
2. SP of `5b4c6b66` resolved: `af944769-775c-4f51-a4a8-324f9a9bdf0a`.
3. **My own drafting error caught during execution:** the phase file's
   resource id was SharePoint's (`00000003-0000-0ff1-…`), NOT Graph's —
   the first grant attempt hit SharePoint's own Sites.Selected (the app
   already has it — "already exists", harmless no-op). Correct ids resolved:
   Graph SP `87076b44-ee24-4ef5-8a60-9fc88972ab2a`; Graph `Sites.Selected`
   role `883ea226-0bf2-4a8f-9f9d-92c9162a727d`.
4. **The real grant attempt → 403 `Authorization_RequestDenied:
   Insufficient privileges`** — the operation is ADMIN-ROLE-gated and the
   signed-in identity does not hold an active consent-capable role
   (Application Administrator / Cloud Application Administrator / Privileged
   Role Administrator class). Matches the sibling session's 261112 finding
   (RBAC cmdlets absent → PIM-activation suspect).
5. Entra portal via IAB loaded (signed in as duc) but the app blade did not
   render for the deep link; the portal path hits the SAME role wall anyway.

**Owner ask (1 minute once the role is active):** activate the
Application Administrator (or equivalent) role in Entra PIM for
`duc.a.nguyen@pvu.edu.vn` — or tell me which admin account holds it — then
reply "consent go". The complete grant is then 3 lines (proven shape):

```
POST /v1.0/servicePrincipals/af944769-775c-4f51-a4a8-324f9a9bdf0a/appRoleAssignments
{"principalId":"af944769-775c-4f51-a4a8-324f9a9bdf0a",
 "resourceId":"87076b44-ee24-4ef5-8a60-9fc88972ab2a",
 "appRoleId":"883ea226-0bf2-4a8f-9f9d-92c9162a727d"}
```
followed by the engine probe (`GRAPH_LANE_OK` arbiter) and — only if it
still fails — the conditional site grant (261113 201 shape).

## Tenant hygiene (Task 1.4)

- All device-flow token/state files deleted (local `/tmp`); zero delegated
  material persisted (law 2 held throughout).
- Probe-file listing (from the 261113 cleanup): zero `pvu-html-probe*`,
  zero `write-verify*`, zero `_probes` folder. Spike-page deletes (Task 1.2)
  remain GA-gated for tomorrow.

## Corrections to the record

- Phase 1.3 step-2's resource id in the plan file listed SharePoint's app id
  where Graph's belongs — corrected in execution (ids above); amend the
  phase file if it executes again.
- The 261113 "Graph lane dead: no Graph app roles" diagnosis STANDS (engine
  token decode: `roles: None`, aud graph) — but note the earlier
  "already exists" response was my SharePoint/Graph id mix-up, not evidence
  of a prior Graph grant.
