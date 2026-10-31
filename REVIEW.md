# REVIEW.md — UX & AX Review Checklist (`ai4UCheE`)

Use this checklist before shipping any UI, route, or content change on `ai4UCheE` (`https://chemeng.ai4u.now`).

## 1. Required Viewport & Visual Gate
Every UI change must be rendered and inspected at all four viewports using `render-check.mjs`:
```bash
node ~/.zcode/skills/ak-frontend-design/scripts/render-check.mjs http://127.0.0.1:5173/ \
  --out plans/reports/render-check-latest \
  --viewports 320x812,375x812,768x1024,1440x900
```
- **Desktop (`1440×900`):** 3-Zone Studio (`AppShell` header + active workbench split + sticky `370px` `AgentChatDrawer`) fits cleanly with zero horizontal overflow.
- **Tablet (`768×1024`):** `.shell-header` wraps `.mission-bar` onto row 2 (`@media (max-width: 1120px)`); `0px` horizontal overflow.
- **Mobile (`375×812`) & Reflow (`320×812`):** `0px` horizontal overflow, `.shell-header` height `≤ 165px`, touch targets passes `render-check.mjs` with `0 errors`.
- **Screenshots:** Attach or reference fresh viewport screenshots whenever modifying layout, CSS tokens, or workbench components.

## 2. AX / SEO / GEO Discovery Surfaces Gate
Run the discovery surface scanner against the running server mapped to production origin:
```bash
node ~/.zcode/skills/ak-enhance-ux-ax/scripts/check-discovery-surfaces.mjs http://127.0.0.1:5173 \
  --site-origin https://chemeng.ai4u.now
```
Must exit `0` with **0 errors and 0 warnings**:
- `public/robots.txt` served as `text/plain` with `Sitemap: https://chemeng.ai4u.now/sitemap.xml` and explicit AI crawler policy.
- `public/sitemap.xml` served as valid XML with canonical URLs and truthful `<lastmod>`.
- `public/llms.txt` and `public/llms-full.txt` served with `X-Robots-Tag: noindex`.
- `public/index.md` and `public/index.html.md` served as `text/markdown; charset=utf-8` with `X-Robots-Tag: noindex`, plus content negotiation (`Accept: text/markdown` + `Vary: Accept`) on `/`.
- `index.html` includes `<meta name="description">`, `<link rel="canonical">`, `<link rel="alternate" type="text/markdown">`, complete Open Graph (`1200×630` `og-card.png`) + `twitter:card="summary_large_image"`, JSON-LD (`Organization`, `WebSite`, `SoftwareApplication`), and a `> 200` character semantic fallback inside `<div id="root">` for non-JS crawlers.
- `<PageAxShareMenu />` (`🔗 Share / AI`) provides keyboard-accessible `Copy Page (Markdown)`, `View as Markdown`, `Copy Canonical URL`, and `Open in ChatGPT / Claude / Perplexity`.

## 3. 10-Area UX/AX Rubric Floor (All Areas ≥ 2 / 3)
1. **First impression:** Above the fold states what `ai4UCheE` is (`6-Book ChE Solver · 55+ Charts · 24 Plant Problems`), for whom (`🎓 Learn` / `🏭 Plant`), and how to start.
2. **Brand recall:** Institutional Ivory (`#fbf6ec`), Sovereign Deep Navy (`#071a33`), Maize Gold (`#e8c547`), `Cormorant Garamond` + `Karla` + `JetBrains Mono`.
3. **Content punch:** Action-led buttons and plain-English problem statements.
4. **Clarity and hierarchy:** 3-Zone Studio with progressive-disclosure drawers and `5 Labs` switcher cue.
5. **Storytelling:** `Observe Trap → Scrub Control → Verify Proof` and 3-Stage White-Box KaTeX derivations.
6. **Knowledge and trust:** Exact textbook citations (`[Perry's 9th Ed., ...]`, `Fogler`, `BSL`, `SVNA`, `Seader`, `Crowl & Louvar`), `psig` vs. `psia`, and `f_D = 4·f_F` guardrails.
7. **Motion:** Framer spring layout pills, `opacity: 1` WAAPI safety, SVG Scrub Guard, and `@media (prefers-reduced-motion: reduce)`.
8. **Responsive:** Zero overflow across `1440×900`, `768×1024`, `375×812`, and `320×812`.
9. **Accessibility:** WCAG 2.2 AA contrast (`≥ 4.5:1`), explicit `:focus-visible` `2px solid var(--maize)` outlines, and `aria-live="polite"` feedback on clipboard/share actions.
10. **Performance feel:** Code-split Vite chunks, instant client-side math, and `< 200` LOC per source file.
