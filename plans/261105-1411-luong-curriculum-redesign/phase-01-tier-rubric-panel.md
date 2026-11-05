# Phase 01 — Tier Rubric Panel

Goal: an explicit "Nguyên tắc phân mức / Level Division Principle" panel in the problem library browser, EN+VI, content verbatim from `PROGRESSION_TIER_META` plus a 4-axis comparison table. This answers Lương's ask 3a and is the cheapest phase — ship it first.

## Task 1.1 — Read design gates (mandatory, no code)

- Goal: honor repo invariant 7 before any UI edit.
- Target files: read-only — `DESIGN.md`, `REVIEW.md`.
- Steps:
  1. Read both files at repo root.
  2. Note (mentally or in the phase file margin) any token/motion rule that affects a collapsible panel; the panel below uses only existing tokens and no animation.
- Success criteria: you can state the two files' constraints that apply to a plain collapsible `<section>`.
- Verify: `no verification needed` (pure read; covered by later UI checks).

## Task 1.2 — Create the bilingual copy module

- Goal: one new file holding ALL sentence-level copy for the whole plan (rubric now; tree/matrix/sessions keys consumed by phases 3–4), so no other copy file needs edits later.
- Target files: create `src/lib/i18n/curriculum-copy.ts` (NEW). Do NOT edit `src/lib/i18n/vi-troubleshooting-copy.ts` (162/199 LOC — no headroom).
- Steps:
  1. Create the file with this exact structure and content (transcribe verbatim; do not rephrase):

```ts
// Bilingual copy for the Lương curriculum redesign (tier rubric, causal tree,
// phase×domain matrix, lab sessions). Authored 2026-11-05 — single source, no other copy file touched.
import type { LocaleCode } from '../../context/persona-theme-context';

export interface CurriculumCopy {
  // Tier rubric panel
  rubricTitle: string; rubricSubtitle: string;
  rubricAxisPhenomena: string; rubricAxisFalsify: string; rubricAxisDt: string; rubricAxisConsequence: string;
  rubricExpandBtn: string;
  // Causal tree
  treeRootSymptomLabel: string; treeConsequenceLabel: string; treeMiniMapPending: string;
  treeMiniMapRoot: string; treeMiniMapSolved: string; treePrunedLabel: string;
  // Phase×Domain matrix
  matrixTitle: string; matrixTeacherToggle: string; matrixTeacherWarning: string;
  matrixLockedChips: (n: number) => string; matrixRoadmapNote: string;
  // Lab sessions
  sessionViewToggleLibrary: string; sessionViewToggleSessions: string;
  sessionPrereqLabel: string; sessionOutcomeLabel: string; sessionOrderHint: string;
}

const EN: CurriculumCopy = {
  rubricTitle: 'Level Division Principle (4 Tiers)',
  rubricSubtitle: 'Tiers measure DIAGNOSTIC COMPLEXITY, not content difficulty.',
  rubricAxisPhenomena: 'Competing phenomena', rubricAxisFalsify: 'Hypotheses to falsify (Rule #12)',
  rubricAxisDt: 'Δt time clue', rubricAxisConsequence: 'Consequence / constraints',
  rubricExpandBtn: 'Why these levels?',
  treeRootSymptomLabel: 'SYMPTOM', treeConsequenceLabel: 'If correct, we would observe:',
  treeMiniMapPending: '?', treeMiniMapRoot: '🎯 root', treeMiniMapSolved: '✅ solved',
  treePrunedLabel: 'pruned',
  matrixTitle: 'Fault Map — Lifecycle Phase × Cause Domain',
  matrixTeacherToggle: 'Teacher mode (reveal classification)',
  matrixTeacherWarning: '⚠ Answer-key view: cause-domain classification of unsolved problems is now visible.',
  matrixLockedChips: (n) => `${n} problem${n === 1 ? '' : 's'} (solve to reveal)`,
  matrixRoadmapNote: 'Control-domain coverage is intentionally a roadmap cell (EU cold-storage incident class) — more problems planned.',
  sessionViewToggleLibrary: 'Library', sessionViewToggleSessions: 'Lab Sessions',
  sessionPrereqLabel: 'Prerequisites:', sessionOutcomeLabel: 'Outcome:',
  sessionOrderHint: 'Recommended order (not locked):',
};

const VI: CurriculumCopy = {
  rubricTitle: 'Nguyên tắc phân chia 4 mức',
  rubricSubtitle: 'Mức đo ĐỘ PHỨC TẠP CHẨN ĐOÁN, không đo độ khó nội dung.',
  rubricAxisPhenomena: 'Hiện tượng cạnh tranh', rubricAxisFalsify: 'Giả thuyết phải bác bỏ (Quy tắc #12)',
  rubricAxisDt: 'Manh mối thời gian Δt', rubricAxisConsequence: 'Hậu quả / ràng buộc',
  rubricExpandBtn: 'Vì sao chia mức này?',
  treeRootSymptomLabel: 'TRIỆU CHỨNG', treeConsequenceLabel: 'Nếu đúng, ta sẽ quan sát thấy:',
  treeMiniMapPending: '?', treeMiniMapRoot: '🎯 gốc', treeMiniMapSolved: '✅ đã giải',
  treePrunedLabel: 'đã tỉa',
  matrixTitle: 'Bản đồ Sự cố — Giai đoạn × Lĩnh vực nguyên nhân',
  matrixTeacherToggle: 'Chế độ giảng viên (mở phân loại)',
  matrixTeacherWarning: '⚠ Đang xem đề đáp án: phân loại lĩnh vực nguyên nhân của các bài chưa giải đã hiển thị.',
  matrixLockedChips: (n) => `${n} bài (giải để mở)`,
  matrixRoadmapNote: 'Ô "Điều khiển" cố ý để trống dạng lộ trình (lớp sự cố kho lạnh EU) — sẽ bổ sung bài mới.',
  sessionViewToggleLibrary: 'Thư viện', sessionViewToggleSessions: 'Buổi thực hành',
  sessionPrereqLabel: 'Tiên quyết:', sessionOutcomeLabel: 'Mục tiêu:',
  sessionOrderHint: 'Thứ tự đề xuất (không khóa):',
};

const COPY: Record<LocaleCode, CurriculumCopy> = { en: EN, vi: VI };

export function getCurriculumCopy(locale: LocaleCode): CurriculumCopy {
  return COPY[locale];
}
```

  2. Check the `LocaleCode` import path: open `src/lib/curriculum-progression-map.ts` line 2 and copy its exact `LocaleCode` import if the one above does not typecheck.
- Success criteria: file exists; `npm run typecheck` exits 0.
- Verify: `npm run typecheck` → exit code 0.

## Task 1.3 — Create the rubric panel component

- Goal: collapsible rubric panel rendering the 4-axis table + verbatim tier descriptions.
- Target files: create `src/components/shell/tier-rubric-panel.tsx` (NEW).
- Steps:
  1. Component signature: `TierRubricPanel: React.FC` — no props; read locale via `usePersonaTheme()` (same import as `hypothesis-troubleshooting-board.tsx` line 10).
  2. Copy via `getCurriculumCopy(locale)` from Task 1.2; tier data from `PROGRESSION_TIER_META` (import from `src/lib/problem-library-types.ts`).
  3. Render (plain CSS, existing tokens, no animation):
     - A toggle button `data-testid="tier-rubric-toggle"` labeled `rubricExpandBtn`, default collapsed.
     - When open, a `<section data-testid="tier-rubric-panel" className="wb-panel">` containing:
       a. `rubricTitle` + `rubricSubtitle`.
       b. A 4-column table (`<table className="mono">`): header row = `rubricAxisPhenomena | rubricAxisFalsify | rubricAxisDt | rubricAxisConsequence`; 4 rows, one per tier `L1..L4`, first cell of each row prefixed with `PROGRESSION_TIER_META[t].shortBadge`, cells filled from this fixed matrix (transcribe verbatim):
          - L1: `1 (single equation)` · `—` · `—` · `convention trap (psig/psia, f_D = 4·f_F)`
          - L2: `2 (trade-off)` · `~1` · `limited` · `single unit`
          - L3: `2–3 + decoys` · `≥ 2` · `✔ defining clue` · `whole unit`
          - L4: `many, coupled` · `many` · `✔` · `runaway / CSB / multi-constraint open design`
       c. Below the table, one line per tier with `PROGRESSION_TIER_META[t].label — description` (verbatim from the meta object; `data-testid="tier-rubric-desc-L1"` … `-L4`).
  4. Use `useState<boolean>(false)` for open state; toggle flips it. No props drilling, no store.
- Success criteria: panel renders collapsed by default; all four `tier-rubric-desc-*` testids exist after expanding.
- Verify: `npx vitest run src/__tests__/phase21-luong-curriculum-redesign.test.tsx -t "rubric"` — but the test does not exist until Task 1.4, so order matters: write the component first, then the test, then run. Final Verify for this task: `npm run typecheck` → exit 0.

## Task 1.4 — Mount in browser + first slice of the phase-21 test

- Goal: rubric visible in the library browser; first mechanical assertions.
- Target files: modify `src/components/shell/problem-library-browser.tsx` (162 LOC; budget: max +12 lines); create `src/__tests__/phase21-luong-curriculum-redesign.test.tsx` (NEW).
- Steps:
  1. In `problem-library-browser.tsx`: add import of `TierRubricPanel`; render `<TierRubricPanel />` immediately AFTER the primary tier filter bar (the `div[data-testid="problem-tier-filter-bar"]` closing tag, ~line 72).
  2. Create the test file following the render patterns of `src/__tests__/phase17-problem-library-catalog.test.tsx` (read lines 63–81 for how it renders the browser — reuse the same provider wrappers and the `toggle-problem-library-btn` flow).
  3. Add these tests (jsdom):
     - `rubric panel collapses by default and expands`: query `tier-rubric-toggle` absent-panel → click → `tier-rubric-panel` truthy; all four `tier-rubric-desc-*` present.
     - `rubric shows 4-axis table`: expanded panel text contains copy strings from `getCurriculumCopy('en')` (`rubricAxisFalsify`).
     - `rubric VI locale renders`: set locale to `vi` the same way `phase19-vietnamese-locale.test.tsx` does (read its lines 30–41 for the locale-switch pattern), then assert expanded panel contains `rubricTitle` VI string `Nguyên tắc phân chia 4 mức`.
- Success criteria: new tests pass; phase17 + phase19 still pass untouched.
- Verify: `npx vitest run src/__tests__/phase21-luong-curriculum-redesign.test.tsx src/__tests__/phase17-problem-library-catalog.test.tsx src/__tests__/phase19-vietnamese-locale.test.tsx` → exit 0, all files report passed suites. Also `wc -l src/components/shell/problem-library-browser.tsx` → ≤ 199.

## Task 1.5 — Phase gate

- Goal: confirm no regression beyond the three test files.
- Steps: run the full unit suite.
- Verify: `npm test` → exit 0. `npm run build` → exit 0.

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
