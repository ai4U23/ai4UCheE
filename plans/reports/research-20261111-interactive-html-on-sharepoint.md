# Research — Interactive HTML on PVU's SharePoint: native features vs SPFx

Conducted: 2026-11-11 · Mode: ak-research --advice (kongming supervision) · Researcher context: PVU CHE workbench edition brainstorm (see ../brainstorm-20261111-pvu-sharepoint-edition.md)
Recency: SharePoint Online state as of November 2026; browser behavior as of 2025–2026 releases.

## Outcome (lead)

**The owner is right — and it goes further than expected.** The interactive workbench CAN live on PVU's SharePoint in v1, without waiting for the App Catalog activation chain, via the native **Embed web part** (OOB iframe lane; needs only site-collection-admin powers the owner trio already has). What changes materially from the earlier brainstorm verdict: (a) the gate must move from HTTP basic-auth to **token-based auth** — browsers block basic-auth prompts inside cross-origin iframes; (b) Microsoft shipped a brand-new native lane — **SharePoint HTML pages, GA worldwide this very month** — which allows script-capable HTML pages but in a sandbox that cannot make network calls (useless for our engine, interesting for future self-contained artifacts). SPFx remains the managed upgrade lane; SPFx isolated web parts are **retired (April 2026)** and irrelevant.

## Research questions

- RQ1: Can modern SPO pages host JS-enabled HTML/app content natively (no SPFx)?
- RQ2: Which SPFx lanes exist for hosting an external app (isolated? full-bleed? auto-resize)?
- RQ3: What are the iframe mechanics for our gated first-party SPA (auth prompts, cookies, tokens, height)?
- RQ4: Which lane should the PVU CHE edition use?

## Findings

### F1. Native Embed web part — the app-hosting lane that needs no developer platform

| Property | Evidence |
|---|---|
| OOB modern web part; wraps any HTTPS URL (or iframe embed code) in a cross-origin iframe | Microsoft Support "Add content to your page using the Embed web part" |
| The framed origin runs its own JS unrestricted (it is a normal browser iframe; SharePoint only restricts what the *web part itself* accepts) | Same + sympmarc.com walkthrough |
| Domain must be on the site collection's **HTML Field Security** allowlist ("Allow contributors to insert iframes only from the following domains"); site collection admin at the root site manages it; default list ships with ~35 domains (youtube, powerbi, forms…) | Microsoft Support "Allow or restrict the ability to embed content" + sympmarc + MS Q&A 2026-05 |
| Works on NoScript sites (the Embed web part is the sanctioned exception) | Microsoft Support + spguides 2025 |
| No width/height controls on the web part; size via section layout + width/height attributes inside the pasted iframe embed code → **fixed height, no auto-resize** (no parent-page JS is possible on modern pages) | LookBook 365 Embed reference |
| "Embedding does not grant access" — the embedded site still enforces its own auth | LookBook 365 |
| Embed code must be iframe-based; script tags rejected; HTTPS only | Microsoft Support |

**Verdict:** a full React SPA on `*.pvu.ai4u.now` CAN be embedded today. Cost: one allowlist entry + one page edit by the owner trio. No App Catalog, no tenant admin, no SPFx package.

### F2. SharePoint HTML pages — brand-new native script lane, GA worldwide mid-Nov–late-Dec 2026

- Roadmap item 569208 (created 2026-08-11); message center MC1479517: public preview early Oct 2026, GA worldwide mid-Nov–late-Dec 2026 (Microsoft 365 Roadmap + message center, cross-checked by pH7x Systems 2026-11-06 and Denis Molodtsov's October-2026 retest of 38 experiments).
- What it is: HTML files stored in the Site Pages library render as real pages in the site chrome; created with Copilot or uploaded; ≤10 MB per file.
- JS IS supported, but: sandboxed iframe; **only inline JS** — no CDN/open-source scripts except Microsoft-managed copies of **Chart.js, Mermaid, React, Fluent UI, Babylon** (Microsoft Support "Create, upload, edit, and publish HTML pages").
- **No outbound HTTP/fetch, no API access, no localStorage**; SharePoint pre-fetches SharePoint list data and injects it before the page's JS runs ("pseudo-live dashboards") (Microsoft Support + Molodtsov + pH7x).
- Enabled by default; per-library off-switch ("Allow HTML files"); works on NoScript sites; no tenant-level restriction.
- **Verdict for us:** cannot host the workbench (engine calls are network calls). Opens a future lane: engine-published *self-contained* interactive artifacts (imagine course packs as native SharePoint pages with list-fed data) — R&D, post-rollout.

### F3. SPFx lanes — isolated retired; regular web part + iframe is the managed pattern

- **Domain-isolated web parts fully retired April 2, 2026** (all tenants; MC792601; Microsoft Learn "Isolated web parts retirement"; dev blog 2024-05-13). No isolation lane exists anymore.
- Regular SPFx web parts run in the page origin; hosting a cross-origin iframe to our own app origin inside one is standard practice (postMessage resize pattern documented for SPO modern pages — cormang 2021, community patterns).
- `supportsFullBleed: true` in the manifest enables full-width sections (PnP samples + Microsoft Community Learning video, Mar 2026) — the right posture for an app-like web part.
- SPFx actively invested: v1.22 (Oct 2025, Heft toolchain), v1.23 (Feb 2026, new CLI), v1.24 (May 2026, navigation customizers) — dev blog Sep 2025. Not a dead end.
- **Verdict:** phase-2 `AppEmbedView` must be a *regular* web part (matches kongming's earlier shape); it buys postMessage auto-resize, full-bleed, engine-managed lifecycle, token minting — but requires the App Catalog activation chain that is still in flight.

### F4. Auth inside a SharePoint iframe — basic-auth prompts are dead; tokens are the durable pattern

- **Chrome blocks cross-origin HTTP-auth prompts by design** (chromium issue 91814; `CrossOriginAuthPrompt` policy default disabled — CIS benchmark recommends disabled; CodePen 2018/2020 writeups).
- **WebKit/Safari blocks cross-origin subresource credential prompts since 2018** (changeset 228486); a 2026-03 site-isolation PR only re-allows prompting when the *top frame* shares the credential origin — not our case.
- **Firefox blocks cross-origin images from triggering auth dialogs since FF 59** (MDN).
- Conclusion: a caddy `basic_auth` gate in front of the embedded app produces silent 401s inside SharePoint for most users. Gate design must change for the embedded lane.
- Third-party cookies (any cookie-session inside the iframe): Safari blocks all by default; Chrome restricts; Microsoft's own guidance retired silent iframe `prompt=none` (auth-code + PKCE + popups; "Silent token acquisition no longer works when third-party cookies are blocked" — Microsoft Learn).
- **Durable pattern (Microsoft Learn + MDN + Smashing 2025 + community): token delivered at embed time (postMessage or URL fragment) → app stores in partitioned localStorage → `Authorization: Bearer` on API calls.** Partitioned storage is per-top-site (fine — per-surface state), no cross-site cookie dependence.
- For OUR stack: engine mints a short-lived JWT (same mint machinery as BOD embed tokens); embed URL carries `#t=<jwt>` (fragment is not sent in Referer and not logged server-side); SPA on boot reads fragment → stores → strips it from the address bar → Bearer on `/api/*`; caddy enforces Bearer on API routes; SPA shell stays public (no secrets in it).
- MSAL silent-SSO in iframe (Entra authn) is the heavier alternative; unnecessary for v1 — the token-fragment pattern is simpler and matches existing engine machinery.

### F5. Auto-resize / height

- Native Embed lane: fixed height from iframe attributes (e.g. `height="1400"`); no parent script possible → accept fixed tall iframe (in-frame scroll).
- SPFx lane: standard postMessage from app → web part resizes; `supportsFullBleed` for full-width. This is the UX argument for Lane B over Lane A.

## Options matrix (RQ4)

| | Lane A: native Embed web part | Lane B: SPFx AppEmbedView (phase 2) | Lane C: SharePoint HTML pages |
|---|---|---|---|
| What hosts | iframe of our app origin (full app) | iframe of our app origin, engine-managed | self-contained HTML only |
| Deploy dependency | none beyond site-owner (allowlist + page edit) | App Catalog + consent chain (in flight) | feature rollout (GA mid-Nov–Dec 2026) |
| Lifecycle | manual page, no engine revoke/update | engine-provisioned `{slug}.aspx`, token mint, revocation | upload to Site Pages library |
| Height UX | fixed (iframe attr) | postMessage auto-resize + full-bleed | site chrome, page-scrolls natively |
| Engine network calls | yes (Bearer on /api/*) | yes | **no network at all** |
| Auth | token-fragment JWT | engine-minted embed token | none (sandbox; list-data only) |
| Fit for CHE v1 | **YES — app on SharePoint now** | managed upgrade post-activation | no (R&D for course-pack-style artifacts) |

## Recommendation (final, post kongming checkpoint — GO both lanes, 2 corrections, 1 gate)

**Lane A now, Lane B as the managed upgrade, Lane C parked as R&D.** Kongming GO (agent_777fd26b, 2026-11-11) explicitly withdrew the earlier "card + link-out only" ruling. Corrections folded in:
1. **Token = engine-minted cohort token, NOT a bespoke short-lived JWT.** Reuse the BOD embed-token machinery (30d rotation ritual, JTI revocation path) — a short-lived token in a manually-edited page silently dies mid-term. Student-visible failure mode = vi expiry banner ("Token hết hạn — liên hệ quản trị").
2. **Bearer enforcement is new Express middleware code** on `/api/*` (+ per-IP rate limit; stock caddy cannot validate tokens; `api-server.ts` has no auth today). This is a v1 acceptance item, not wiring.
3. **Pre-commitment gate — 15-min live tenant smoke test** (with the owner trio): render the Embed web part against the real app; record the iframe's actual `sandbox` attributes (decides partitioned localStorage vs in-memory fallback — doc-underivable, tenant-observable); confirm allowlist edit path + NoScript behavior. Ship the localStorage→in-memory fallback regardless so the test can't flip the design.
4. Token is a **cohort shared secret by construction** (iframe src readable by site members): internal-tier treatment — per-IP rate limits, daily spend cap on the PVU gateway alias, read-mostly posture; revocation via JTI is the backstop.
5. **PDF corpus reachable ONLY via Bearer-gated API routes** — never static paths under the now-public SPA shell (licensing exposure).
6. Fragment hygiene: `history.replaceState` strip on boot; token never in router state/internal links; direct pvu surface keeps basic auth and never uses token URLs.
7. **Unmanaged-page containment**: distinct page name (`che-workbench-embed.aspx`), surface-registry entry (owner + rotation cadence), Lane-B supersede step written at birth; activation chain continues in parallel (reprieve, not cancellation).
8. **Decision records**: 260913 untouched (it governs the ai4u viewer's untrusted-artifact executor; Lane A involves no ai4u viewer). File a NEW short decision record: first-party app-origin iframes (native Embed / future AppEmbedView) are a distinct lane from untrusted artifact HTML — prevents stale-rule blocking of Lane B.

## Unresolved questions

- Saved-calcs policy (off vs pseudonymous per-client id) — still owner-pinned at plan time; a cohort token makes the shared pool *more* shared, not less.
- Final wb subdomain name; gateway alias choice + daily cap value.
- Engine embed-token mint endpoint reachability for a non-artifact consumer (CHE app) — small extension likely; verify at plan time.
- HTML-pages (Lane C) rollout date for the PVU tenant — observable only after activation; affects course-pack R&D only.

## Kongming checkpoint (2026-11-11)

GO on Lane A (v1 SP surface) + Lane B (managed upgrade); "card + link-out only" ruling withdrawn. Key requirements: engine-path token minting (real secret — the BOD token secret was once found empty/dev; check day one), Express Bearer middleware + negative control (bare `/api/copilot` POST → 401), fragment strip + storage fallback + vi expiry banner, gateway alias daily spend cap, new decision record before Lane B design, acceptance = a student completes a copilot interaction end-to-end inside the embed while the direct pvu surface stays unchanged. Full verdict in session transcript; checklist adopted above.

## Sources (key)

- Microsoft Support: Embed web part; Allow/restrict embedding (HTML Field Security); Create/edit/publish HTML pages; Where are Content editor/Script editor
- Microsoft Learn: Isolated web parts retirement; reference-third-party-cookies-spas; classic page deprecation (DenyAddAndCustomizePages enforcement 2027/2028)
- Microsoft 365 dev blog: SPFx roadmap update Sep 2025; domain-isolated retirement (MC792601 via merill.net)
- WebKit changeset 228486 (2018) + WebKit PR 61353 (Mar 2026); Chromium issue 91814; MDN HTTP authentication
- Smashing Magazine 2025-05 third-party cookie detection; MDN Storage Access API; EmbedAuth/iframecheck token-pattern writeups
- Denis Molodtsov spdenis.com HTML-pages experiments (+Oct 2026 GA retest); pH7x Systems 2026-11-06 governance analysis
- cormang.com SPFx/iframe resize pattern; PnP react-script-editor sample (supportsFullBleed); Microsoft Community Learning full-bleed video (Mar 2026)
