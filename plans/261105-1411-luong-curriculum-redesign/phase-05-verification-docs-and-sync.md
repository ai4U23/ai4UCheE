# Phase 05 — Full Verification + Docs Sync

Goal: run the whole-plan gates end to end, verify repo invariants (LOC ceiling, bilingual surfaces, 320px reflow, AX discovery surfaces untouched), sync the docs suite, and prepare the deliverables for Lương. Nothing new is designed in this phase; it is verification and reconciliation only.

## Task 5.1 — Full automated gates

- Goal: every automated check green in one pass.
- Steps: run in order.
- Verify (each must match exactly):
  1. `npm test` → exit 0 (full Vitest suite: all pre-existing files — phase17, phase19, and the rest — plus `phase21-luong-curriculum-redesign.test.tsx`).
  2. `npm run typecheck` → exit 0.
  3. `npm run build` → exit 0.
  4. LOC ceiling: `bash -c 'for f in src/lib/problem-taxonomy.ts src/lib/hypothesis-consequence-copy.ts src/lib/problem-consequence-copy-a.ts src/lib/problem-consequence-copy-b.ts src/lib/i18n/curriculum-copy.ts src/components/shell/tier-rubric-panel.tsx src/components/shell/causal-hypothesis-tree.tsx src/components/shell/causal-mini-map.tsx src/components/shell/phase-domain-matrix.tsx src/components/shell/lab-session-view.tsx src/components/shell/problem-library-browser.tsx src/components/shell/hypothesis-troubleshooting-board.tsx; do n=$(wc -l < "$f"); [ "$n" -le 199 ] || { echo "OVER: $f $n"; exit 1; }; done; echo ALL_UNDER_200'` → prints `ALL_UNDER_200` (note: if you created `problem-library-facet-row.tsx` in phase 4, append it to the list).
  Test files are EXEMPT from the 199-LOC ceiling (repo precedent: `phase19-vietnamese-locale.test.tsx` is 237 LOC and green). If `phase21-luong-curriculum-redesign.test.tsx` grows past ~300 LOC, SPLIT it into `phase21a/phase21b` files — NEVER delete or weaken assertions to shorten a file.
  5. Untouched-files proof: `git diff --stat src/lib/fogler-problem-solving-catalog.ts src/lib/problem-library-catalog-a.ts src/lib/problem-library-catalog-b.ts src/lib/problem-library-catalog-c.ts src/lib/problem-library-types.ts src/lib/hypothesis-verification-engine.ts src/lib/i18n/vi-troubleshooting-copy.ts src/__tests__/phase17-problem-library-catalog.test.tsx src/__tests__/phase19-vietnamese-locale.test.tsx` → empty output (zero modifications). The ONLY permitted exception: if phase 3 Task 3.4 step 4 required carrying `caseId`/`id` through `localizeFoglerSpec`, that single file may show a diff — it must still be ≤ 199 LOC and its test file must remain untouched.

## Task 5.2 — E2E regression run

- Goal: the committed Playwright suite still passes against the changed shell.
- Steps:
  1. Run bare `npm run test:e2e` — `playwright.config.ts` auto-starts the dev server via its `webServer` hook when `E2E_BASE_URL` is unset (pinned @playwright/test 1.64.1, chromium-1248).
  2. Only if you additionally want to verify the production build, set `E2E_BASE_URL` per the config's own convention and re-run; record which mode you ran in the phase report.
- Verify: exit 0, all specs pass (all existing `tests/e2e` testids survive this plan's DOM changes — a red spec is a real regression).
- Failure Protocol applies to a red spec — do not edit specs to go green.

## Task 5.3 — Manual viewport gate (320×812)

- Goal: invariant 7 reflow check for the three new surfaces (rubric panel, tree + mini-map, matrix + sessions).
- Steps:
  1. `npm run dev` and open the app.
  2. With browser devtools at `375×812` then `320×812`: open the problem library → expand the rubric panel; open a workbench with the board expanded → view tree + mini-map; toggle to `Buổi thực hành`; view the matrix. Confirm: no horizontal page scrollbar; tree branches indent without clipping; matrix table cells wrap; session blocks stack vertically.
- Success criteria: all four surfaces reflow without horizontal overflow at 320px.
- Verify: manual — record pass/fail per surface in the phase report (`plans/261105-1411-luong-curriculum-redesign/phase-05-report.md`, four lines). A fail on any surface = Failure Protocol (it is a stated pass condition).

## Task 5.4 — AX discovery surfaces check

- Goal: prove no discovery surface needs a change (no new routes/pages were added).
- Steps: `git diff --stat public/ index.html` and confirm zero changes.
- Verify: empty diff → `no verification needed` beyond the empty check itself. If ANY route/page had been added (it should not be), STOP — that is outside this plan's scope and needs DESIGN.md/REVIEW.md + robots/sitemap/llms sync per invariant 7.

## Task 5.5 — Docs sync (invariant 6)

- Goal: the docs suite reflects the new surfaces.
- Target files: `docs/codebase-summary.md`, `docs/project-roadmap.md`.
- Steps:
  1. In `codebase-summary.md`: add one line per new module (10 files from Task 5.1 list) under the appropriate existing sections — match the file's current voice; no restructuring.
  2. In `project-roadmap.md`: mark the Lương curriculum redesign item as implemented (rubric / taxonomy / causal tree / matrix / sessions) with the plan path; add the roadmap cells as future work (control-domain problems from the EU cold-storage class, heat-transfer session expansion, L4 per-session capstones, title de-leak pass).
- Verify: `grep -c "problem-taxonomy" docs/codebase-summary.md` → ≥ 1; `grep -c "261105-1411" docs/project-roadmap.md` → ≥ 1.

## Task 5.6 — Deliverables checklist for the user

- Goal: everything Lương was promised is in the repo.
- Steps: confirm each file exists and is non-empty.
- Verify:
  1. `plans/261105-1411-luong-curriculum-redesign/taxonomy-audit-table.md` (phase 2) — 24 rows + roadmap gaps.
  2. `plans/261105-1411-luong-curriculum-redesign/consequence-copy-review.md` (phase 3) — 72 rows, user-approved.
  3. `plans/261105-1411-luong-curriculum-redesign/phase-05-report.md` — gates + viewport results.
  4. Write the phase-05 report with: gate results (5.1 outputs), e2e result (5.2), viewport results (5.3), AX check (5.4), docs diffs (5.5), and a one-paragraph summary in Vietnamese suitable for forwarding to Lương.

## Task 5.7 — Final handoff

- Verify: `git status` shows only files listed in this plan (new components/libs/tests/docs/plans). Nothing else. Then STOP — committing is the user's call (house rule: commit only when asked).

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
