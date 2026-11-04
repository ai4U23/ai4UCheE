# GUI Test Round R4 — chemeng.ai4u.now (2026-11-04)

Scope: ak-web-testing extensive round on production `https://chemeng.ai4u.now`, IAB browser, EN→VI, desktop 1440×900 + tablet/mobile sweep.
Deploy under test: **HEAD `4b6c26f`** — verified byte-identical to prod by 7/7 Vite asset hashes (`index-DU8EZj8R.js`, `vendor-react-BjXWrvmJ.js`, `perry-atlas-solvers-DXv45ECv.js`, `vendor-motion-ui-CA1K7RDf.js`, `che-interactive-sketches-BPtpdgxN.js`, `vendor-katex-Dc8nsIP1.js`, `index-CMKwfH-p.css`) + HEAD-era markers present in served bundle, zero pre-fix markers (`Đime` = 0).
Sidecar: `chemeng:8001/health` → `{status:ok, pdf_pages:2274, engine:perry-engine-v1}`. AX surfaces 200: robots.txt, sitemap.xml, llms.txt, index.md.

## Local gates (pre-round)
- Vitest **69/69** (15 files) GREEN — includes the c43beca vi-dom-translator liveness pin
- Pytest perry-engine **46/46** GREEN (4.1 s)
- `tsc --noEmit` clean

## Results matrix

| # | Test point | Result | Evidence |
|---|---|---|---|
| T1 | Showcase EN hero/nav/sections/video | **PASS** | t1-showcase-en-hero.png, t1c-video-section.png, t1e-video-playing.png (t=2.34 s/15 s, captions render) |
| T2 | Locale read-back EN↔VI, persist across reload | **PASS** | `ai4uchee_locale` vi→en→vi; title + full DOM re-render each switch (t2-showcase-en-after-toggle.png) |
| T3 | /app default = Year 2 Thermo · Learn persona; Learn↔Plant toggle | **PASS** | t3-app-initial.png; Plant → Co-Pilot badge "Plant · WB2", curriculum card hides; Learn restores (t3b, t3c) |
| T4a | Problem Library: 24/24, tiers 3+10+8+3, filters | **PASS** | t4-problems-dropdown.png; L2 filter → "Showing 10 / 24 Problems" |
| T4b | Launch problem #2 + solve E2E | **PASS (solve)** / **DEF-2 (layout)** | t4-problem2-launched.png; Auto-Fix → water@373.15 K rescue, **Mastery 40→42 % (1/5)**, Hypotheses 3/3, stamp FOG-WB2-HYP-56C33DAI |
| T5 | WB2 result card EN byte-exact + VI prefix | **PASS** | EN `Result at T = 373.15 K: 101,261 Pa (14.69 psia)`; VI `Kết quả tại T = 373.15 K: 101,261 Pa` (22fc2f8 FIX A′ live) |
| T6 | Mission trap banner + designed trap values | **PASS (text)** | `⚠️ The loaded preset may be deliberately off-spec…` present; ethanol 298 K → 7,856 Pa (≈7.9 kPa designed) |
| T7 | WB3 hydraulics / WB4 distillation / WB6 kinetics / WB5 atlas (VI) | **PASS (DOM)** | P-101 suction + Fig 6-9 crosshair; T-201 McCabe-Thiele + FUG; R-401 Levenspiel; Atlas Sec 1 + 2,274 pages |
| T8 | Copilot chip attach | **PASS (DOM)** | mission context chip auto-attached "V-101 Jacket · …"; NL what-if typing blocked (see limitations) |
| T9 | Calc Sheet modal + Share/AI menu | **PASS (DOM)** | dialog + QA/QC export + SQLite saved_calculations strings; share menu: Nhờ AI kiểm tra ×3, Markdown copy, ChatGPT↗ |
| T10 | Overflow at 1440 / 768 / 375 / 320 | **PASS (default state)** | scrollWidth − innerWidth = −15 (no overflow) at all four; controls collapse 22→11→10 |
| — | VI typos regression | **PASS** | `Dime hóa pha hơi` present; `Đime` = 0 hits; `Truyền vận` correct |

## Defects / observations

> **FIX STATUS (2026-11-04, ak-fix round, same day):** DEF-2 **FIXED, DEPLOYED & VERIFIED IN PROD** (commits `ea7e858` + `8132c24`; file-sync deploy to chemeng, on-box build `index-BUJYMsRm.js` == local). Headless-Chromium re-run of the exact failing path **against production**: title 304×63 @1440 (was 70×315), trap pill right 730/730/342/287 @1440/768/375/320 (was 1506), overflowX 0 at all four; anchor scrollY 810 exact, `behavior: auto`. Prod evidence: `fix-def2-prod-mission-active-1440.png`, `fix-def2-prod-mission-active-375.png`; prod CSS `index-DisOKVB4.css` carries all 4 fix markers. Pins: `src/__tests__/phase20-mission-banner-layout-css.test.tsx` (72/72 Vitest, tsc clean). OBS-2 documented, no repro.

### DEF-2 (P1, new) — Mission panel layout breaks when a mission is active @1440
- **Mission title column squeezed to 70 px × 315 px** → renders one word per line (`Mission Active` STRONG, rect-measured twice, reproducible on relaunch).
- **Trap-note banner overflows viewport**: SPAN at x=809 w=697 → right edge 1506 > 1440 → horizontal scrollbar inside mission strip (visible in t4-problem2-launched.png bottom).
- Root-cause hypothesis: 22fc2f8 (2026-11-03) added the long trap banner into the mission header flex row; title block has no flex-basis/min-width floor. The ak-fix journal's `/app overflow 0px @1440/768/375/320` verification measured the **default** app state, not mission-active.
- Repro: /app → L1–L4 ▾ → Solve Problem #2 → mission panel renders squeezed + h-scrollbar.
- Functional solve is unaffected (scorecard/hypotheses update correctly).

### OBS-1 — `html { scroll-behavior: smooth }` on showcase (computed `htmlScrollBehavior: "smooth"`)
Anchor nav is flaky in IAB: nav "02 · Video Guide" click stalled at scrollY 700 (rAF stall — the exact pattern the 2026-10-31 lesson banned in app code); the hero "Watch 5-Step Video Guide" click reached the correct sticky-offset target (809 = 986 − 177) on a later attempt. Real browsers unaffected. Suggest `scroll-behavior: auto` for IAB parity per the repo's own prior lesson.

### OBS-2 — One-off self-reload wiped mission state
After first problem-#2 launch, page reloaded itself within ~1 min (performance.now()=35 s on next probe; navigation type "navigate"), resetting fluid to water/373.15 K and dropping mission panel + trap note + co-pilot context chip. **Not reproducible** on relaunch (mission state persisted 75 s+ and through solve). One-off; monitor.

## Tooling limitations (honest disclosure — IAB session degradation)
Wheel scroll (cua.scroll) dead session-wide from the start; PageDown worked once then stalled; Ctrl+A dead; **text input (cua.type) dead** for number inputs → T-dial set via slider drags instead; **screenshot capture timed out (30 s) from t4b onward** — all post-T4 evidence is DOM-verified only (rect/text probes), no screenshots. Copilot NL what-if mutation (needs typed prompt) not exercised this round; chip attach + deterministic Auto-Fix path verified. Skipped: WB1 SVG chart scrub, WB5 PDF crop view, VI trap-banner visual.

## Screenshots (12, in this folder)
t1 hero / fullpage / video-section / video-cta / video-playing, t2 EN toggle, t3 app-initial / plant / mission-collapsed, t4 problems-dropdown / problem2-launched (DEF-2 evidence).

## Suggested next actions
1. Fix DEF-2: give mission title a min-width/flex floor and wrap or clamp the trap banner (check 375/320 too).
2. Consider `scroll-behavior: auto` on showcase for embedded-pane robustness (OBS-1).
3. Re-run a focused visual pass on mission-active states at 4 viewports after the DEF-2 fix (the default-state overflow check missed it).
