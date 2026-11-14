# Canary (partial) + GB Consent Report — 2026-11-13 evening

## Gate GA — early signal (VERDICT tomorrow 06:20 ICT)

- 18:10 ICT tiny app-only write (`Files/Add` → Site Pages): **403** — the
  SP identity-materialization lag continues (~8 h post-grant-restore).
- Posture: **park** per plan. The write-probe preflight shipped in the
  261113 cron edit (sha `be25e7bd5cac`, deployed) means tomorrow's parked
  fire — if still 403 — costs zero LLM spend and logs
  `WRITE-LANE PARKED … FAILED exit 4` (the canary signature).
- **VERDICT (read 09:00 ICT 2026-11-14):** `VERDICT: GA_PARKED`
  - Quoted raw lines (first fire of the dual-publish script):
    `=== 2026-11-14T06:20:01+07:00 republish start (script be25e7bd5cac) ===`
    `write-probe failed: 403`
    `WRITE-LANE PARKED — SP writes 403; bake+publish skipped (no LLM spend)`
    `=== republish FAILED exit 4 ===`
  - SCRIPT_SHA `be25e7bd5cac` confirmed (deployed copy ran); zero LLM spend.
  - Tiny app-only write re-verify (09:0x ICT, in-container): **403**.
  - Mask probe: **403 on the read itself** (`UnauthorizedAccessException`) —
    the app cannot even READ SP REST, so no mask evidence is obtainable
    app-only. The read-403 asymmetry persists ~24 h post-restore → the
    identity-materialization-lag hypothesis is DEAD; something structural
    (suspect: the 261113 restore entry is mis-shaped for the SP audience,
    or removed again overnight).
  - Consequence: spike deletes + gadget promote stay parked (plan gate).
  - Park count: **1 of 2**. A second consecutive park tomorrow → kongming
    escalation demanding the audit answer (who/what removed the grant).
  - NEW (owner 09:00 ICT): owner answered all asks — TTL=term, address=keep
    `CHE-Workbench.aspx`, PIM activation delegated to me via IAB ("use IAB
    to do it for me"), engine rebuild=yes. The GB grant chain below may fix
    BOTH lanes if the conditional site grant re-lands a correctly-named
    entry (one grant store, two audiences).

## Morning addendum (09:00–09:50 ICT 2026-11-14) — GB re-parked: NO admin role exists on this identity

Executed per the owner's delegation (IAB as duc.a.nguyen@pvu.edu.vn):

1. **PIM is structurally dead for this identity.** Deep link
   `portal.azure.com/#view/Microsoft_Azure_PIMCommon/ActivationMenuBlade/~/aadmigratedroles`
   (via aka.ms/myroles) → "My roles | Microsoft Entra roles": **"No results"**
   under BOTH Eligible and Active assignments, plus the banner "your
   organization needs Microsoft Entra ID P2 or Microsoft Entra ID
   Governance". Conclusion: duc holds NO Entra admin role, active or
   eligible — there is nothing to activate. (Matches the 261112 sibling
   finding: RBAC cmdlets absent.)
2. **Device-flow mint attempted 2× anyway** (to test whether the empty PIM
   list was a licensing artifact): both ceremonies completed cleanly in the
   browser (code → account tile → Approve → "You have signed in to
   tools-m365"), but the token endpoint never issued: round 1 expired
   (AADSTS70020 — window burned during the slow first ceremony), round 2
   approve landed ~60 s in yet polls returned AADSTS70008
   ("authorization code … expired due to inactivity"). Suspect a CA/MFA
   policy quirk completing the device grant for this app. No token ever
   landed; all state files deleted (law 2 held).
3. **Silent SSO authorize blocked**: `prompt=none` code request →
   AADSTS50011 (no web redirect URI registered on e71cb649 — device-only
   public client). One focused attempt only; no guessing further.
4. **Even a perfect token would 403**: appRoleAssignment POST is
   admin-role-gated (proven 261113: Authorization_RequestDenied), and the
   signed-in identity provably holds no such role (finding 1).

**GB owner ask (revised, precise):** from a true Global Admin account (one
exists — something admin-consented e71cb649 originally), EITHER (a) Entra →
Users → Nguyễn Anh Đức → Assigned roles → Add **Application Administrator**
(Permanent is fine), then reply "role added"; OR (b) name the admin account
and hand me its browser session for the ceremony. Then GB lands in ~2 min.

## GA morning probes (09:0x ICT 2026-11-14)

- Tiny app-only write re-verify: **403** (Files/Add Site Pages).
- Mask probe: **403 on the read** (`-2147024891 UnauthorizedAccessException`)
  — no mask evidence obtainable app-only; the read-403 asymmetry persists
  ~24 h post-restore, killing the materialization-lag hypothesis.
- GA stays **PARKED (1 of 2)** — spike deletes + gadget promote remain
  gated. If tomorrow's 06:20 parks again: kongming escalation + the audit
  answer becomes THE blocker (who/what removed the grant).

## Same-morning wins (non-gated)

- **P3 title fixed properly**: owner-session SP REST MERGE on Site Pages
  item 8 (`__metadata type SP.Data.SitePagesItem`) → Title "CHE Workbench",
  204 + read-back verified. Page: `SitePages/CHE-Workbench.aspx` (name kept
  per owner). Display title + address both final.
- **Engine rebuilt + healed**: host repo ff'd 6a453cb→81ae4b5 (fetch via
  origin), perry-engine image rebuilt, container healthy; in-container
  pytest **46/46** (water + psig exact pins), live psig smoke 2 psig →
  115,114 Pa (16.6959 psia) — the 827× bug is dead in production. Workbench
  container untouched, still up.

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
