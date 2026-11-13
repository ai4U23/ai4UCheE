# Your one browser session — gadget pilot + workbench (~30 min)

Everything below is ready. The gadget pilot link appears at the bottom once the
tenant's write permission finishes propagating (in progress — engineering
handling it; you approved the sign-in for it).

## Part 1 — the workbench embed (the 5 clicks)

Follow `261111-1048-pvu-sharepoint-edition/reports/phase-06-owner-handover.md`:
1. Site settings → HTML Field Security → allow `https://chemeng-pvu.ai4u.now`
2. New page "CHE Workbench" (`che-workbench-embed`)
3. Add the **Embed** web part (not "Link")
4. Paste the glue address (in the handover doc; height 1600)
5. Publish → run one calculation + one co-pilot question inside the page

⚠ The glue address expires **11 Dec 2026** — when you're done, tell me which
pass length you want: **30 days** (monthly re-paste) or **~90 days / term**
(one re-paste per term; needs ~1 h of my work on the minting tool).

## Part 2 — the Quick-Calcs gadget pilot (3 checks)

Open the pilot (now LIVE):
**https://pvuedu.sharepoint.com/sites/PVIAICowork/SitePages/che-quick-calcs-pilot.html**

1. Both tabs compute — DIPPR: water at 353.15 K shows **≈ 972.8 kg/m³** (the
   handbook value); NPSHa: 0 psig default shows **≈ 11.227 m / AN TOÀN (SAFE)**
2. The math looks like proper math (KaTeX), not plain italic text
3. Everything is in Vietnamese

*(Already verified by engineering in a real browser session — this is your
acceptance pass; all three checks green at 10:00 ICT today, screenshots in the
plan's reports folder.)*

## Decisions to make in this session

1. **Sharing**: the pilot (and later the final page) inherits site sharing —
   members-only today. Students open the site anyway (BOD page precedent) —
   OK to keep members-only?
2. **Ship or kill** the gadget (I bring the evidence; you decide — either way
   the pilot page is cleaned up or promoted).
3. **Engine redeploy** (~10 min, my work, your go-ahead): pushes today's two
   calculator-bug fixes live (psig 827× error + water density). Recommend YES.
4. **Graph consent** (Entra, ~5 min): the app has zero Microsoft Graph
   permissions — blocks the Phase 9 document/Stream lanes. One consent click.

## Status recap

- Workbench: live at chemeng-pvu.ai4u.now, browser-verified, awaiting your
  5 clicks (Part 1)
- Gadget: built, machine-proven (377 checks green), fast on weak hardware,
  pending propagation → pilot link
- BOD dashboard: fresh today; engineering recovered the site permission that
  was removed overnight (details in phase5-stop report if you want the story)
