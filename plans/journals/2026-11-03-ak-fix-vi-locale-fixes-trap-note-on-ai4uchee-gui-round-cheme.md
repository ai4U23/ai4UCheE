---
title: "ak-fix: VI locale fixes + trap-note on ai4UCheE (GUI round chemeng.ai4u.now)"
date: 2026-11-03
summary: "Fixed 4 real findings from the GUI test round (VI result-card prefix, mission-bar toggle i18n, Đime typo, showcase locale read-back) and retracted the designed-trap misread with kongming --advice supervision"
---

# ak-fix: VI locale fixes + trap-note on ai4UCheE (GUI round chemeng.ai4u.now)

## What happened
ak-fix --advice round on the chemeng.ai4u.now GUI-test findings (deploy HEAD 5640e23):
- RETRACTED: "mission loads Ethanol" — DESIGNED trap (`src/components/shell/mission-scenarios.ts:61` `initialMutations {compound:'ethanol',tempK:298}`, rescue water@373.15→101.3 kPa). Also retracted: "1469 psia" (was 14.69 psia) and "Truyền văn" (zero src hits; only "Truyền vận"). Pin: deploy 5640e23.
- FIXED A′: WB2 result-card prefix hardcoded EN. Root cause: JSX 3-node split ("Result at T = ","373.15"," K: ") defeats the translator's full-sentence rule `^Result at T = (.+):$` (translator IS live — wired via useVietnameseDomTranslator at app-shell.tsx:8/:32; initial "dead code" grep was a hook-call-site miss, corrected by kongming). Fix: `wb2VpResultPrefix` in vi-workbenches-dictionary.ts (EN 'Result at T = ' byte-identical / VI 'Kết quả tại T = ') + 1-line swap in thermo-dippr-workbench.tsx:131. My interim translator regex rule was REVERTED (never stack both fixes).
- FIXED B: guided-mission-bar toggle routed through ShellCopy `missionsToggleBtn`/`missionsToggleAria` (EN byte-identical, VI '▾ Ẩn'/'▸ Hiện Nhiệm vụ').
- FIXED C: 'Đime hóa pha hơi' → 'Dime hóa pha hơi' (vi-ui-subcomponents.ts:99; EN 'Carboxylic Acid Vapor Dimerization').
- FIXED D: showcase.html initShowcaseLocale never read back `ai4uchee_locale` it writes (:2203) → landing reset to EN. Added validated read-back (persist=false), URL ?lang still wins. Live-verified both directions.
- ADDED (kongming option b): trap-generic bilingual banner note `mission-trap-note` ("preset may be deliberately off-spec — Fogler Rule #12"); '+35 pts' assertion preserved.
- CLOSED: OBS header "c" chip — elementFromPoint strip enumeration shows no element between Learn/Plant persona buttons (third screenshot misread of the round).

## Decision
- A′ over rule-only fix (kongming): dictionary path is consistent + test-pinned; never stack both fixes.
- Do NOT touch solver-verified trap values; trap note is banner-generic (all 5 missions load traps).
- vi-dom-translator.ts recorded as LIVE second i18n mechanism (zero test coverage) — follow-up: coverage audit, then formalize/migrate; do not delete (would regress SVG-workbench VI).
- Pre-session WIP excluded from this round's changes: docs/deployment-guide.md (Lightsail), problem-library-browser.tsx (stale `p.targetWorkbench`→`p.workbenchId`, real latent fix but unattributed — needs owner). No other stale `.targetWorkbench` refs (adaptive items own the field legitimately).

## Verification
- Full Vitest 15 files / 68 tests GREEN (incl. phase19 mechanical <200 LOC test; new regressions: VI 'Kết quả tại T = 373.15 K' + 'Dime hóa…'); `tsc --noEmit` clean; LOC max 192/198.
- Live dev-server checks: VI trap state renders 'Kết quả tại T = 298.00 K: 7,856 Pa' (matches designed ≈7.9 kPa), EN byte-identical 'Result at T = 373.15 K: 101,261 Pa (14.69 psia)'; landing read-back VI↔EN; /app overflow 0px at 1440/768/375/320.

## Next steps
- Commit needs split: this round (8 files) vs pre-session WIP (deployment-guide, problem-library-browser) vs untracked plans/ artifacts — awaiting user authorization.
- Production chemeng.ai4u.now still runs pre-fix code until deploy (user decision; ak-deploy).
- Follow-up: vi-dom-translator coverage audit + liveness insurance assertion; optional VI number-format consistency (result card shows '373.15'/dot decimals in VI mode).

> Historical work record — not durable authority. Prefer docs/specs/ADRs for current decisions.
