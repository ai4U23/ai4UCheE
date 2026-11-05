# Phase 03 — Causal Hypothesis Tree (A2 + B)

Goal: replace the flat Stage-5 hypothesis card list with a vertical causal tree (root symptom → hypothesis branches → pruned/root-cause outcome), where each branch shows a **pre-authored** "if correct → we'd observe X" prediction (decision A2), verdict buttons keep the existing testids and verdict-gated reveals, plus a one-line mini-map visible from Stage 1 (decision B). Stages 1–4 and Stage 6 stay untouched.

**A2 authoring rule (load-bearing, test-enforced):** every consequence string is a *neutral physical prediction* — what one would measure/observe if the hypothesis were correct. It must NOT contain verdict keywords or compare itself to the observed data: the student performs that comparison. Forbidden tokens (unit-tested): `PROVED`, `DISPROVED`, `✅`, `❌`, `Rule #12`, `root cause` (any case), `nguyên nhân gốc`, `đúng rồi`, `sai rồi`.

Keying: consequences are looked up by `` `${caseId}:${hypId}` ``. Flagship cases use their real `caseId` (e.g. `case-wb1-fanning-audit`); the 24 library problems use `problemId` as caseId (see `problemEntryToFoglerCase` in `src/lib/problem-library-registry.ts` line 121: `caseId: entry.problemId`), with hypothesis ids `${wbPrefix}-h1/h2/h3` (registry lines 162–178). This keying avoids the hypId collision between flagship and converted cases (both use `wb1-h1` style ids).

## Task 3.1 — Flagship consequence copy file (planner-authored; transcribe verbatim)

- Goal: consequences for the 6 hand-authored `FOGLER_PROBLEM_CASES` (18 hypotheses; wb5 has only 2).
- Target files: create `src/lib/hypothesis-consequence-copy.ts` (NEW). Do NOT edit `fogler-problem-solving-catalog.ts` (192/199 LOC — no headroom).
- Steps:
  1. Create the file with the accessors and the 18 entries below. Type:

```ts
// A2 consequence predictions (decision A2, plan 261105-1411): neutral "if correct →
// we'd observe" statements shown on tree branches BEFORE verdict. No verdict keywords (unit-tested).
import type { LocaleCode } from '../context/persona-theme-context';

export type ConsequenceText = Record<LocaleCode, string>;

export const FLAGSHIP_CONSEQUENCES: Readonly<Record<string, ConsequenceText>> = {
  // — case-wb1-fanning-audit (Perry Fig. 6-9 Fanning vs Moody Darcy) —
  'case-wb1-fanning-audit:wb1-h1': { en: 'An ε/D jump would build ΔP up gradually over weeks of service, and a brand-new day-1 pipe would still sit near the smooth-tube chart line (≈18 kPa here).', vi: 'Độ nhảy ε/D sẽ khiến ΔP tăng dần theo nhiều tuần vận hành, và ống mới tinh ngày đầu vẫn nằm gần đường ống nhẵn trên biểu đồ (≈18 kPa tại đây).' },
  'case-wb1-fanning-audit:wb1-h2': { en: 'An exact 4.000 multiple between the entered friction factor and Perry Fig. 6-9 f_F, holding at 4.000 at every Reynolds number tried.', vi: 'Bội số đúng 4,000 giữa hệ số ma sát đã nhập và f_F trên Perry Hình 6-9, giữ nguyên 4,000 ở mọi số Reynolds thử.' },
  'case-wb1-fanning-audit:wb1-h3': { en: 'Reynolds number below ≈2,100 with f = 16/Re ≈ 0.00032 and a very small ΔP at these flow conditions.', vi: 'Số Reynolds dưới ≈2.100 với f = 16/Re ≈ 0,00032 và ΔP rất nhỏ ở điều kiện lưu lượng này.' },
  // — case-wb2-boil-flash (DIPPR 101, psig/psia datum) —
  'case-wb2-boil-flash:wb2-h1': { en: 'A vessel held at true zero absolute pressure would boil any liquid at 25°C and show hard vacuum (<0.1 psia) on a compound gauge.', vi: 'Bình giữ ở áp suất tuyệt đối đúng bằng 0 sẽ làm mọi chất lỏng sôi ở 25°C và chỉ chân không cứng (<0,1 psia) trên đồng hồ kép.' },
  'case-wb2-boil-flash:wb2-h2': { en: 'Ethanol at 298 K on its DIPPR Eq. 101 curve giving P_sat ≈ 7.9 kPa, while water needs 373.15 K to reach 101.3 kPa.', vi: 'Ethanol ở 298 K trên đường DIPPR Eq. 101 cho P_sat ≈ 7,9 kPa, còn nước cần 373,15 K để đạt 101,3 kPa.' },
  'case-wb2-boil-flash:wb2-h3': { en: 'A d²G^E/dx₁² that never changes sign, so the same model predicts complete miscibility for every solvent pair tested.', vi: 'd²G^E/dx₁² không bao giờ đổi dấu, nên cùng một mô hình dự đoán đồng trộn hoàn toàn cho mọi cặp dung môi thử.' },
  // — case-wb3-pump-and-heater (NPSHa + boiler feedwater HX) —
  'case-wb3-pump-and-heater:wb3-h1': { en: 'Throttling downstream reduces flow Q and suction friction h_f,s together, so NPSHa rises and the gravel noise quiets at lower flow.', vi: 'Tiết lưu phía sau làm giảm đồng thời lưu lượng Q và ma sát hút h_f,s, do đó NPSHa tăng và tiếng sỏi dịu ở lưu lượng thấp hơn.' },
  'case-wb3-pump-and-heater:wb3-h2': { en: 'NPSHa = (P_suc,abs − P_vp)/ρg + z_s − h_f,s(Q) sliding below NPSHr as Q rises, with the deficit growing ∝ Q².', vi: 'NPSHa = (P_suc,abs − P_vp)/ρg + z_s − h_f,s(Q) trượt xuống dưới NPSHr khi Q tăng, mức thiếu hụt lớn dần ∝ Q².' },
  'case-wb3-pump-and-heater:wb3-h3': { en: 'Mineral scale adds thermal resistance over weeks to months of service, with outlet temperature drifting down slowly day by day.', vi: 'Cặn khoáng cộng điện trở nhiệt trong nhiều tuần đến nhiều tháng, nhiệt độ đầu ra tụt chậm từng ngày.' },
  // — case-wb4-column-flood (Fair entrainment flooding) —
  'case-wb4-column-flood:wb4-h1': { en: 'With α_AB → 1.0, distillate purity x_D slides slowly toward the equilibrium pinch at steady reflux, with no hydraulic ΔP spike across the trays.', vi: 'Khi α_AB → 1,0, độ tinh khiết x_D trượt chậm về điểm thắt cân bằng ở hồi lưu ổn định, không có đỉnh ΔP thủy lực trên các đĩa.' },
  'case-wb4-column-flood:wb4-h2': { en: 'u_v = 4·V_rect/(π·D_c²·ρ_V) rising with (R+1) and falling with D_c², crossing 100% of u_flood exactly when reflux was raised in the narrow shell.', vi: 'u_v = 4·V_rect/(π·D_c²·ρ_V) tăng theo (R+1) và giảm theo D_c², vượt 100% u_flood đúng lúc hồi lưu được nâng trong vỏ tháp hẹp.' },
  'case-wb4-column-flood:wb4-h3': { en: 'V_rect = (R+1)·D grows linearly with R, so both liquid and vapor traffic increase and tray ΔP climbs even higher.', vi: 'V_rect = (R+1)·D tăng tuyến tính theo R, cả dòng lỏng và hơi đều tăng nên ΔP đĩa còn leo cao hơn nữa.' },
  // — case-wb6-reactor-runaway (Thiele η(φ) + Semenov ψ) —
  'case-wb6-reactor-runaway:wb6-h1': { en: 'k(T) grows exponentially (Arrhenius), lifting heat generation G(T) and Thiele φ together — η falls further while the jacket falls further behind.', vi: 'k(T) tăng theo hàm mũ (Arrhenius), kéo G(T) và φ cùng lên — η giảm sâu hơn trong khi áo lạnh càng tụt lại phía sau.' },
  'case-wb6-reactor-runaway:wb6-h2': { en: 'η(φ) = 3(φ·cothφ − 1)/φ² falling below 0.5 when φ ≈ 5.5, and ψ climbing above 0.368 whenever cooling UA falls behind G(T).', vi: 'η(φ) = 3(φ·cothφ − 1)/φ² xuống dưới 0,5 khi φ ≈ 5,5, và ψ vượt 0,368 mỗi khi UA làm mát tụt lại sau G(T).' },
  'case-wb6-reactor-runaway:wb6-h3': { en: 'Packed-bed ΔP follows the 150/Re_p + 1.75 terms over void fraction ε — very different coefficients from the smooth-pipe Moody curve.', vi: 'ΔP giường cố định theo các số hạng 150/Re_p + 1,75 trên độ rỗng ε — hệ số rất khác đường cong Moody ống trơn.' },
  // — case-wb5-atlas-synthesis (Bowman F_T + API 520; only 2 hypotheses) —
  'case-wb5-atlas-synthesis:wb5-h1': { en: 'If doubling area restores duty, Q would recover roughly in proportion to A while F_T stays on a flat plateau above 0.75.', vi: 'Nếu gấp đôi diện tích khôi phục nhiệt lượng, Q sẽ hồi phục gần như tỷ lệ với A trong khi F_T nằm trên vùng bằng phẳng trên 0,75.' },
  'case-wb5-atlas-synthesis:wb5-h2': { en: 'F_T recovering above 0.75 on the multi-shell (2-4) curve at the same P and R, and relief P_1 landing at 164.7 psia after adding 14.696.', vi: 'F_T hồi phục trên 0,75 theo đường đa vỏ (2-4) tại cùng P và R, và P_1 van an toàn thành 164,7 psia sau khi cộng 14,696.' },
};

export function getFlagshipConsequence(caseId: string, hypId: string): ConsequenceText | undefined {
  return FLAGSHIP_CONSEQUENCES[`${caseId}:${hypId}`];
}
```

  2. If the `LocaleCode` import errors, copy the exact import from `src/lib/curriculum-progression-map.ts` line 2.
- Success criteria: 17 entries (5 cases × 3 + wb5 × 2); `npm run typecheck` exits 0.
- Verify: `npm run typecheck` → exit 0; `grep -c "^  'case-wb" src/lib/hypothesis-consequence-copy.ts` → prints `17`.

## Task 3.2 — Author the 24-problem consequence worksheet (CONTENT GATE — pause for user)

- Goal: author the remaining 24×3 predictions in a review file FIRST, get user sign-off, then transcribe. (Quality gate: content authoring by the executor must be human-reviewed before it ships.)
- Target files: create `plans/261105-1411-luong-curriculum-redesign/consequence-copy-review.md` (NEW worksheet — NOT shipped code yet).
- Steps:
  1. For each of the 24 problems in `src/lib/problem-library-catalog-a/b/c.ts`, read the entry's `decoyClaim1`, `rootCauseClaim`, `decoyClaim2`, `observationSummary`, `ktIs`, `ktIsNot`, `timeHorizonBadge`, `rateOfChangeClue`.
  2. Write into the worksheet one row per hypothesis (key `` `${problemId}:${wbPrefix}-h1|h2|h3` ``; h1 = decoy1, h2 = root, h3 = decoy2 — this matches the converter's order in `problem-library-registry.ts` lines 160–185). Each row: EN prediction + VI translation, each ONE sentence, each referencing a measurable quantity already present in that entry's own fields (numbers, signs, timescales).
  3. Style rules (enforced): neutral prediction only (see the A2 authoring rule at the phase top); for a decoy, predict what WOULD be observed if that decoy were true (timescale, sign, magnitude) — never state that it contradicts the data; for the root hypothesis, predict the relationship that the rescue scrub will satisfy (which knob moves which way). Time-clue problems (L3): the decoy predictions must make the Δt timescale testable (e.g. "gradual over weeks" vs "step change at startup").
  4. Worked example (prob-01, transcribe into the worksheet as the first three rows):
     - `prob-01-fanning-darcy-audit:wb1-h1` — reuse the flagship `case-wb1-fanning-audit:wb1-h1` text (prob-01 IS this case).
     - `prob-01-fanning-darcy-audit:wb1-h2` — reuse flagship `wb1-h2`.
     - `prob-01-fanning-darcy-audit:wb1-h3` — reuse flagship `wb1-h3`.
  5. **STOP after writing the worksheet. Report to the user that `consequence-copy-review.md` is ready for review, and WAIT for approval before Task 3.3.** (This is a plan-specified content gate, not a stall.)
- Success criteria: worksheet exists with 72 rows (24×3), each row has non-empty EN and VI one-sentence predictions containing at least one numeric/timescale token from the source entry.
- Verify: `grep -c ":wb" plans/261105-1411-luong-curriculum-redesign/consequence-copy-review.md` → prints `72`.

## Task 3.3 — Transcribe worksheet into code (after user approval)

- Goal: the 72 predictions as typed data.
- Target files: create `src/lib/problem-consequence-copy-a.ts` (prob-01..prob-12) and `src/lib/problem-consequence-copy-b.ts` (prob-13..prob-24) (NEW). Both import `ConsequenceText` from `./hypothesis-consequence-copy`.
- Steps:
  1. Each file exports `PROBLEM_CONSEQUENCES_A` / `PROBLEM_CONSEQUENCES_B: Readonly<Record<string, ConsequenceText>>` with the worksheet rows verbatim (keys `` `${problemId}:${hypId}` ``).
  2. In `hypothesis-consequence-copy.ts`, append the unified accessor (keep the file ≤ 199 LOC by placing only this function after the existing export; if it would exceed, move `FLAGSHIP_CONSEQUENCES` split — prefer NOT splitting: check `wc -l` first; expected ≈ 60 LOC so it fits):

```ts
import { PROBLEM_CONSEQUENCES_A } from './problem-consequence-copy-a';
import { PROBLEM_CONSEQUENCES_B } from './problem-consequence-copy-b';
const PROBLEM_CONSEQUENCES = { ...PROBLEM_CONSEQUENCES_A, ...PROBLEM_CONSEQUENCES_B };
export function getHypothesisConsequence(caseId: string, hypId: string): ConsequenceText | undefined {
  return FLAGSHIP_CONSEQUENCES[`${caseId}:${hypId}`] ?? PROBLEM_CONSEQUENCES[`${caseId}:${hypId}`];
}
```

  3. Note: imports at the top of the file (ES convention); the snippet shows them separately for clarity only.
- Success criteria: `getHypothesisConsequence` resolves for every flagship + every converted case/hyp pair.
- Verify: `npm run typecheck` → exit 0; `wc -l` on all three new copy files → each ≤ 199.

## Task 3.4 — Causal tree component + mini-map

- Goal: the Stage-5 tree and the Stage-1 mini-map as separate components; board becomes an orchestrator.
- Target files: create `src/components/shell/causal-hypothesis-tree.tsx`, `src/components/shell/causal-mini-map.tsx` (NEW); modify `src/components/shell/hypothesis-troubleshooting-board.tsx` (195/199 LOC — MUST go DOWN, not up).
- Steps:
  1. `causal-hypothesis-tree.tsx` — props: `{ spec: FoglerProblemSolvingCase; workbenchId: WorkbenchId; locale: LocaleCode; onVerdict: (hypId: string, verdict: 'proved' | 'disproved') => void; onAskAgent: (prompt: string) => void }`. Render (vertical indent tree, plain CSS, NO diagram lib, NO animated opacity-to-0):
     - Root node `data-testid="tree-root-symptom"`: `treeRootSymptomLabel` (from `getCurriculumCopy(locale)`) + `spec.observationSummary`.
     - One branch per `spec.hypotheses` — each branch container KEEPS the existing testid `data-testid={`hypothesis-card-${h.id}`}`; inside: the claim text; the consequence line `data-testid={`tree-consequence-${h.id}`}` = `treeConsequenceLabel` + `getHypothesisConsequence(spec.caseId, h.id)?.[locale]` (A2: visible BEFORE any verdict); the three existing buttons with EXACT existing testids `hyp-prove-${h.id}` / `hyp-disprove-${h.id}` / `hyp-ask-agent-${h.id}` wired to `onVerdict(h.id, …)` / `onAskAgent(h.agentPrompt)`; and `data-testid={`hyp-verdict-${h.id}`}` showing `evaluateHypothesisItem(workbenchId, h.id).feedbackText` (import from `src/lib/hypothesis-verification-engine` — verdict-gated reveal stays exactly as today).
     - Prune styling: when `evaluateHypothesisItem(workbenchId, h.id).userVerdict === 'disproved'`, add className `wb-verdict` + inline `style={{ opacity: 0.45, textDecoration: 'line-through' }}` (STATIC — never animate opacity to 0) and append `treePrunedLabel`.
     - Handle variable branch counts (wb5 has 2) — map over `spec.hypotheses`, never assume 3.
  2. `causal-mini-map.tsx` — props `{ spec; workbenchId; locale }`. One horizontal line, `data-testid="tree-minimap"`: `🔴 ${treeRootSymptomLabel}` → chips `[H1 ⬜|❌|✅]…` (from `evaluateHypothesisItem(...).userVerdict`, ⬜ = none) → `treeMiniMapRoot` when the root hypothesis has a correct recorded verdict → `treeMiniMapSolved` when EVERY hypothesis has a recorded `userVerdict` and the root verdict is correct (derive both by mapping `evaluateHypothesisItem(workbenchId, h.id)` over `spec.hypotheses`; do NOT use `evaluateSixStageProgress(...).stage6SolutionDone` — it is permanently false today because the board never passes `solved`). Small `<span>` chips, `fontSize: '11px'`, wrap allowed (320px-safe).
  3. Board edits (`hypothesis-troubleshooting-board.tsx`): delete the flat hypotheses block (current lines 160–181, the `spec.hypotheses.map(...)` JSX) and render `<CausalHypothesisTree spec={spec} workbenchId={workbenchId} locale={locale} onVerdict={handleVerdictClick} onAskAgent={(p) => void handleCollaborateWithAgent(p)} />` in its place; render `<CausalMiniMap …same props minus handlers/>` immediately after the panel header (between the header `div` and the `{expanded && …}` block). Keep `stage6-solution-prescription` exactly where it is. `locale` comes from `usePersonaTheme()` already destructured at line 15.
  4. Verify `spec.caseId` survives `localizeFoglerSpec` (check `src/lib/i18n/vi-troubleshooting-copy.ts` — it must pass `caseId` and hypothesis `id` through unchanged; if it rebuilds objects without them, extend it to carry them, keeping that file ≤ 199 LOC).
- Success criteria: board LOC ≤ 195 (must not grow); every pre-existing board testid still present in the rendered DOM.
- Verify: `npm run typecheck` → 0; `wc -l src/components/shell/hypothesis-troubleshooting-board.tsx` → ≤ 195; `npx vitest run src/__tests__/phase17-problem-library-catalog.test.tsx` → exit 0.

## Task 3.5 — Phase-20 tests for the tree + A2 rule

- Target files: append to `src/__tests__/phase21-luong-curriculum-redesign.test.tsx`.
- Steps — add tests:
  1. `consequence coverage is complete`: for each workbench in `FOGLER_PROBLEM_CASES` and for `problemEntryToFoglerCase(p)` over all 24: for each hypothesis, `getHypothesisConsequence(case.caseId, h.id)` is defined with non-empty `en` and `vi`.
  2. `A2 wordlist rule`: for every consequence string (both locales of all entries in `FLAGSHIP_CONSEQUENCES` + both PROBLEM files), assert none of the forbidden tokens appears (case-insensitive): `PROVED`, `DISPROVED`, `✅`, `❌`, `Rule #12`, `root cause`, `nguyên nhân gốc`, `đúng rồi`, `sai rồi`.
  3. `tree preserves stage-5 testids and shows A2 consequences pre-verdict`: render `CausalHypothesisTree` directly (use `FOGLER_PROBLEM_CASES['wb1-visual-verifier']` imported directly from `src/lib/fogler-problem-solving-catalog.ts` as the spec — NOT `getFoglerCaseForWorkbench`, which returns a converted problem case if any earlier test launched a problem into module state; also call `resetActiveProblems()` from `src/lib/problem-library-registry` in this test file's `beforeEach` to prevent module-state pollution) wrapped only in what the component needs (it must not require providers other than props). Assert: `tree-root-symptom`, `hypothesis-card-wb1-h1…h3`, all `hyp-prove-*`/`hyp-disprove-*`/`hyp-ask-agent-*`, all `tree-consequence-wb1-h*` non-empty BEFORE clicking (this is the A2 lock), `hyp-verdict-wb1-h1` shows the neutral pre-verdict text (`Untested`-style from the engine).
  4. `prune on disprove`: fire `click` on `hyp-disprove-wb1-h1` (stub `onVerdict`), re-render with engine state recorded via `recordHypothesisVerdict('wb1-visual-verifier', 'wb1-h1', 'disproved')` — assert `hypothesis-card-wb1-h1` has `line-through` styling / `treePrunedLabel` text appears. (Read `src/lib/hypothesis-verification-engine.ts` lines 90–110 for the real store API before writing this test; if direct store mutation from jsdom is awkward, drive it through the same engine functions the board uses.)
  5. `mini-map renders`: `CausalMiniMap` with the wb1 spec → `tree-minimap` truthy, contains `TRIỆU CHỨNG` when `locale='vi'`.
- Verify: `npx vitest run src/__tests__/phase21-luong-curriculum-redesign.test.tsx` → exit 0.

## Task 3.6 — Phase gate

- Verify: `npm test` → exit 0. `npm run build` → exit 0. `wc -l` on every file touched/created this phase → each ≤ 199.

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
