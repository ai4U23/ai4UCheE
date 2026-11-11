# Your PVU workbench page — 5 SharePoint clicks (~25 minutes)

Read the two-link table first; then the 5 clicks; the paste-ready address is at the bottom.

## The two links — read this first

| | What it is | Who sees it |
|---|---|---|
| **1. The SharePoint page** | **THE student link.** After you create the page (clicks below), its address is what you paste into Teams, the class announcement, the syllabus — everywhere. | Students. Their browser address bar shows this SharePoint address for the entire session. |
| **2. The embed glue** (bottom of this page) | A one-time paste INTO the Embed web part. | Nobody, once pasted. It lives inside the page's embed code — the same way a YouTube video embedded in a PowerPoint still says youtube.com in the file's code, but your audience only ever sees the PowerPoint. |

**Never share the glue address with students — it is glue, not a link.**

Students will only ever see the SharePoint address in their address bar. This is exactly how the BOD usage page you already have works.

## Decision (optional, only if you want it)

1. **As-is — recommended, 0 effort.** Students see the SharePoint address; the hidden address is invisible in normal use.
2. **Cosmetic change — a PVU IT ticket, days to weeks.** The hidden embed address could be made to read `chemeng.pvu.edu.vn`. Students would see **zero difference** — it only changes what someone reading the page's code would see. Cost: every future network/certificate issue would then involve PVU IT. Our recommendation: not needed.

## Your 5 clicks

1. **Allowlist (≈10 min, needs site admin):** Open your site → gear icon → **Site information** → **View all site settings** → **HTML Field Security**. Add `https://chemeng-pvu.ai4u.now` to the allowed domains → Save.
2. **Create the page:** Site Pages → New → Page. Title it "CHE Workbench". (Rename the web address to `che-workbench-embed` if prompted.)
3. **Add the web part:** click the + on the page, choose the one simply called **Embed** (not "Link" / "Website address").
4. **Paste the glue address** from below into it; set the height to about **1600 pixels** (the page scrolls inside the frame).
5. **Publish**, then hit Preview: run one calculation and ask the co-pilot one question, both inside the page.

After publishing, **copy the page's own address from your browser bar — that is the student link** (it looks like `…/sites/pvu/SitePages/che-workbench-embed.aspx`).

## The glue address (valid until 11 Dec 2026)

```
https://chemeng-pvu.ai4u.now/app#t=eyJhdWQiOiJhcnRpZmFjdF92aWV3ZXIiLCJleHAiOjE3OTY5NzgwNDMsImlhdCI6MTc5NDM4NjA0MywianRpIjoiZDI5OTZlYTItMjk4MC00Mzk3LWFmY2ItYzg1MGYzZDJkZWY4IiwibmJmIjoxNzk0Mzg2MDQzLCJwdXJwb3NlIjoiZW1iZWQiLCJzbHVnIjoiY2hlLXdvcmtiZW5jaCIsInN1YiI6InB2dS1jb2hvcnQifQ.v4LIfz6atEYKceP58cYWgB9ZMQctnPskZtUU9CHiH5Q
```

The `#t=…` part is the 30-day access pass. Before 11 Dec we either re-paste a fresh one (2 minutes — we mint it for you), or move to the managed web part (Phase 7), which handles this for you.

## What students will see — verified today in a real browser

- Address bar: the SharePoint address, the whole session
- Zero "ai4u.now" text anywhere in the app (browser-tested today, 8/8 green)
- PVU colors, Vietnamese interface, the video guide, and saves private to each student's own browser

---

*(Tech register: origin chemeng-pvu.ai4u.now; embed hygiene commit 6a453cb — share menu + showcase link gated, trust copy PVU-relay wording, canonical/JSON-LD host fixed, per-browser copilot rate buckets; token jti d2996ea2-2980-4397-afcb-c850f3d2def8, exp 2026-12-11T08:34:03Z; evidence: deploy-smoke-261111 + browser DOM audit.)*
