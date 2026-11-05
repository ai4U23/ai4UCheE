# Phase 04 — Phase×Domain Matrix + Lab Sessions

Goal: two new data-driven views in the problem library browser — (1) the fault map matrix (lifecycle phase × cause domain) implementing the F′ spoiler gate (counts always, problem chips only when solved, local teacher-mode toggle), and (2) the "Buổi thực hành" session view grouping the same 24 problems under 6 course topics (decision H=6) with soft L1→L4 ordering (J). No new filter facets (G); global numbering kept (I).

## Task 4.1 — Matrix data helper

- Goal: derive matrix cell data from the registry + taxonomy (data-driven — this is the extension-trace contract).
- Target files: append to `src/lib/problem-taxonomy.ts` (expected ≈ 120 LOC now; +20 fits the 199 ceiling).
- Steps:
  1. Append:

```ts
import { ALL_24_REAL_LIFE_PROBLEMS } from './problem-library-registry';

export interface MatrixCell { phase: LifecyclePhaseId; domain: CauseDomainId; problemIds: readonly string[]; }

export function getPhaseDomainMatrix(): readonly MatrixCell[] {
  const cells: Record<string, MatrixCell> = {};
  for (const p of ALL_24_REAL_LIFE_PROBLEMS) {
    const t = PROBLEM_TAXONOMY[p.problemId];
    if (!t) continue;
    const key = `${t.lifecyclePhase}|${t.causeDomain}`;
    cells[key] ??= { phase: t.lifecyclePhase, domain: t.causeDomain, problemIds: [] };
    cells[key].problemIds.push(p.problemId);
  }
  return Object.values(cells);
}
```

  2. Circular-import check: `problem-library-registry.ts` imports from `problem-library-catalog-a/b/c` and `fogler-problem-solving-catalog.ts`; it does NOT import `problem-taxonomy.ts`, so this one-way import is safe. If the bundler still warns, move `getPhaseDomainMatrix` into the matrix component instead (same code) — prefer the lib location.
- Success criteria: every problem lands in exactly one cell; totals equal `ALL_24_REAL_LIFE_PROBLEMS.length`.
- Verify: `npm run typecheck` → exit 0; `wc -l src/lib/problem-taxonomy.ts` → ≤ 199.

## Task 4.2 — Matrix component (F′ gate)

- Goal: `phase-domain-matrix.tsx` implementing counts-always / chips-gated-on-solved + teacher toggle.
- Target files: create `src/components/shell/phase-domain-matrix.tsx` (NEW).
- Steps:
  1. Props: `{ solvedProblemIds: readonly string[]; onLaunchProblem?: (problemId: string) => void; locale: LocaleCode }`. Copy via `getCurriculumCopy(locale)`; labels via `LIFECYCLE_PHASE_META` / `CAUSE_DOMAIN_META` (VI+EN from phase 2).
  2. Layout: `data-testid="phase-domain-matrix"` `<section className="wb-panel">`; title = `matrixTitle`; a `<table className="mono">` with header row = empty corner + the 6 `CAUSE_DOMAIN_META` labels; two body rows = `LIFECYCLE_PHASE_META` labels. Each cell `data-testid={`matrix-cell-${phase}-${domain}`}`:
     - count line always: `data-testid={`matrix-cell-count-${phase}-${domain}`}` with `problemIds.length` (0 renders as `—`).
     - chips: for each problem id, a chip `data-testid={`matrix-chip-${problemId}`}` shown ONLY if `solvedProblemIds.includes(id) || teacherMode`; otherwise one locked line `matrixLockedChips(n)` with `data-testid={`matrix-cell-locked-${phase}-${domain}`}` (render the locked line only when n > 0).
     - case-study problems get a `★` marker inside their chip (from `getProblemTaxonomy(id)?.caseStudy`).
  3. Teacher mode: local `useState(false)`; toggle button `data-testid="matrix-teacher-toggle"` labeled `matrixTeacherToggle`; when on, render the warning line `matrixTeacherWarning` (`data-testid="matrix-teacher-warning"`) directly above the table. This is a LOCAL state — do NOT touch the persona system (`learn | plant` only).
  4. Roadmap footnote: below the table, `matrixRoadmapNote` (`data-testid="matrix-roadmap-note"`) rendered ONLY when the `control` column total across both phases is < 3 (today it is 1: prob-07).
  5. Chip clicks call `onLaunchProblem(problemId)` when provided.
  6. 320px safety: the table uses `width: '100%'`, `fontSize: '11px'`, and cells `wordBreak: 'break-word'`; chips are inline-flex spans that wrap.
- Success criteria: with `solvedProblemIds = []`, every cell shows its count but zero `matrix-chip-*` testids; with teacher mode on, all 24 chips render.
- Verify: `npm run typecheck` → exit 0; `wc -l src/components/shell/phase-domain-matrix.tsx` → ≤ 199.

## Task 4.3 — Lab session view

- Goal: `lab-session-view.tsx` — 6 session blocks ordered by `COURSE_TOPIC_ORDER`, soft L1→L4 inside, headers from `COURSE_TOPIC_META`.
- Target files: create `src/components/shell/lab-session-view.tsx` (NEW).
- Steps:
  1. Props: `{ solvedProblemIds: readonly string[]; onSelectProblem: (p: ProblemCaseEntry) => void; locale: LocaleCode }`.
  2. For each topic in `COURSE_TOPIC_ORDER`, a block `data-testid={`session-block-${topic}`}`:
     - Header: `COURSE_TOPIC_META[topic].yearBadge[locale]` + `label[locale]`, then one line `${sessionPrereqLabel} ${prerequisites[locale]}` and one line `${sessionOutcomeLabel} ${learningOutcome[locale]}`.
     - Problems: those `ALL_24_REAL_LIFE_PROBLEMS` whose taxonomy `courseTopic === topic`, sorted by tier (`L1→L4`) then `number`; each rendered as a row `data-testid={`session-problem-${problemId}`}`: `#number`, tier badge (via `PROGRESSION_TIER_META[tier].shortBadge`), title, `✓ ` prefix when solved, and a launch button `data-testid={`session-launch-${problemId}`}` calling `onSelectProblem(p)` (same behavior as the library's `launch-${id}` button).
     - Above the list, the soft-order line `sessionOrderHint` (visual only — no locking, no disabling, per decision J).
  3. Case-study problems show the same `★` marker after the title.
  4. Do NOT renumber; `p.number` prints as-is (#1–24 global).
- Success criteria: exactly 6 blocks; every problem appears in exactly one block; blocks render with 2, 3, 3, 3, 5, 8 problems in `COURSE_TOPIC_ORDER` order (thermo 5 is first: order check = thermo, fluids, heat-transfer, separations, reaction, design-control-safety).
- Verify: `npm run typecheck` → exit 0; `wc -l src/components/shell/lab-session-view.tsx` → ≤ 199.

## Task 4.4 — Browser integration (view toggle + matrix mount)

- Goal: browser gains "Thư viện / Buổi thực hành" toggle + the matrix below both views.
- Target files: modify `src/components/shell/problem-library-browser.tsx` (budget: +18 lines max on top of phase 1's +12 → hard ceiling 199; if exceeded, extract the secondary facet row — lines ~80–124 — into `src/components/shell/problem-library-facet-row.tsx` and pass the four filter values + setters as props).
- Steps:
  1. Add `useState<'library' | 'sessions'>('library')` view state.
  2. Toggle: two `MotionPillButton`s (same primitive as the tier pills, import already present) with their OWN `layoutId="view-toggle-pill"` — do NOT reuse `prob-tier-pill`: both pill groups are mounted simultaneously, and a shared layoutId makes the sliding highlight fly between the tier bar and the view toggle; `data-testid="view-toggle-library"` / `data-testid="view-toggle-sessions"`, labels `sessionViewToggleLibrary` / `sessionViewToggleSessions` from `getCurriculumCopy(getActiveLocale())` — the browser already computes `isVi`; pass `locale` accordingly.
  3. When `library`: render the existing facet row + grid unchanged (all existing testids stay).
  4. When `sessions`: render `<LabSessionView solvedProblemIds={solvedProblemIds} onSelectProblem={onSelectProblem} locale={...} />` INSTEAD of the facet row + grid (replaces them in the DOM; the tier filter bar and rubric stay above, count badge stays).
  5. Below BOTH views: `<PhaseDomainMatrix solvedProblemIds={solvedProblemIds} locale={...} />`. For `onLaunchProblem`, look up the entry via `getProblemById(id)` and call `onSelectProblem(entry)` when found.
- Success criteria: default view unchanged for e2e (existing `problem-library-grid` present by default); sessions view reachable via one click; matrix visible in both.
- Verify: `npx vitest run src/__tests__/phase17-problem-library-catalog.test.tsx src/__tests__/phase19-vietnamese-locale.test.tsx` → exit 0 (untouched tests still green); `wc -l src/components/shell/problem-library-browser.tsx` → ≤ 199.

## Task 4.5 — Phase-20 tests for matrix + sessions

- Target files: append to `src/__tests__/phase21-luong-curriculum-redesign.test.tsx`.
- Steps — add tests:
  1. `matrix counts visible, chips gated (F′)`: render browser (phase-17 wrapper), open library; assert `matrix-cell-count-operation-control` shows `1`; with zero solved, `matrix-chip-prob-07-isa-control-valve-choked` absent and `matrix-cell-locked-operation-control` present; total chips rendered = 0.
  2. `teacher mode reveals all`: click `matrix-teacher-toggle`; assert 24 `matrix-chip-*` testids (query by prefix) and `matrix-teacher-warning` present.
  3. `roadmap note renders` (`matrix-roadmap-note` present, text contains `roadmap` in EN or `lộ trình` in VI).
  4. `sessions view: 6 blocks, correct membership counts`: click `view-toggle-sessions`; assert 6 `session-block-*`; `session-block-heat-transfer` contains exactly 2 `session-problem-*` rows; `session-block-reaction` contains 8; every one of the 24 problem ids appears exactly once across blocks.
  5. `session order is soft L1→L4 and numbering global`: within `session-block-reaction`, the first `session-problem-*` row has tier `L1 Trap`-style badge or `#` number smaller than the last row's (read `PROGRESSION_TIER_META` order L1<L2<L3<L4; the reaction block starts at L1? NO — reaction has no L1; assert instead that tiers are non-decreasing down the rows).
  6. `VI locale for new views`: switch locale to VI (phase-19 pattern); assert matrix title `Bản đồ Sự cố` and toggle label `Buổi thực hành` appear.
- Verify: `npx vitest run src/__tests__/phase21-luong-curriculum-redesign.test.tsx` → exit 0.

## Task 4.6 — Phase gate

- Verify: `npm test` → exit 0. `npm run build` → exit 0. `wc -l` on all touched/created files → ≤ 199 each.

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
