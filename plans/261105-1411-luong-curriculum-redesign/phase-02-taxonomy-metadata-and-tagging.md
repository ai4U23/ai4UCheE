# Phase 02 — Taxonomy Metadata + 24-Problem Tagging

Goal: a NEW self-contained taxonomy module (`courseTopic` / `lifecyclePhase` / `causeDomain` / `caseStudy` for all 24 problems, with bilingual labels and course-topic session metadata) plus a rendered audit table deliverable for Lương. NO existing data file is edited — the tags live beside the catalogs, keyed by `problemId`, so catalogs, converter, and all existing tests stay untouched.

## Task 2.1 — Create the taxonomy module

- Goal: single file exporting types, bilingual META labels, session metadata, the 24-row tag table, and two accessors.
- Target files: create `src/lib/problem-taxonomy.ts` (NEW). Do NOT edit `problem-library-types.ts` (94 LOC, keep untouched) or any `problem-library-catalog-*.ts` (182/199 LOC — no headroom).
- Steps:
  1. Create the file with this structure (transcribe ids and enum values EXACTLY; they are locked):

```ts
// Lương curriculum redesign (2026-11-05): orthogonal taxonomy for the 24-problem library.
// courseTopic = theory-course session (6, truyền nhiệt split from fluids — decision H=6).
// lifecyclePhase + causeDomain = Lương's phase × domain framework + 6th value convention-procedure (D1).
// One DOMINANT tag per problem (E); rationale lives in plans/261105-1411-luong-curriculum-redesign/plan.md.
import type { LocaleCode } from '../context/persona-theme-context';

export type CourseTopicId = 'thermo' | 'fluids' | 'heat-transfer' | 'separations' | 'reaction' | 'design-control-safety';
export type LifecyclePhaseId = 'design-audit' | 'operation';
export type CauseDomainId = 'process-limit' | 'equipment' | 'operating-conditions' | 'catalyst' | 'control' | 'convention-procedure';

export interface ProblemTaxonomyTags {
  courseTopic: CourseTopicId;
  lifecyclePhase: LifecyclePhaseId;
  causeDomain: CauseDomainId;
  caseStudy: boolean;
}
```

  2. Add bilingual label records (pattern-copied from `CURRICULUM_PROGRESSION_MAP` in `src/lib/curriculum-progression-map.ts`):

```ts
export const COURSE_TOPIC_META: Record<CourseTopicId, { label: Record<LocaleCode, string>; yearBadge: Record<LocaleCode, string>; prerequisites: Record<LocaleCode, string>; learningOutcome: Record<LocaleCode, string> }> = {
  thermo: { label: { en: 'Thermodynamics & Phase Equilibria', vi: 'Nhiệt động lực học & Cân bằng Pha' }, yearBadge: { en: 'Year 2', vi: 'Năm 2' }, prerequisites: { en: 'Material & Energy Balances, Calculus II', vi: 'Cân bằng Vật chất & Năng lượng, Giải tích II' }, learningOutcome: { en: 'Predict vapor pressure, phase splits, and real-gas Z before sizing equipment.', vi: 'Dự đoán áp suất hơi, tách pha và Z khí thực trước khi tính thiết bị.' } },
  fluids: { label: { en: 'Fluid Mechanics & Piping Hydraulics', vi: 'Cơ học Lưu chất & Thủy lực Đường ống' }, yearBadge: { en: 'Year 2/3', vi: 'Năm 2/3' }, prerequisites: { en: 'Thermodynamics I, Differential Equations', vi: 'Nhiệt động lực học I, Phương trình Vi phân' }, learningOutcome: { en: 'Prove NPSHa > NPSHr, convert f_D = 4·f_F, and recognize valve choke ceilings.', vi: 'Chứng minh NPSHa > NPSHr, đổi f_D = 4·f_F, nhận biết trần nghẽn van.' } },
  'heat-transfer': { label: { en: 'Heat Transfer & Psychrometry', vi: 'Truyền nhiệt & Không khí Ẩm' }, yearBadge: { en: 'Year 2/3', vi: 'Năm 2/3' }, prerequisites: { en: 'Thermodynamics I, Calculus II', vi: 'Nhiệt động lực học I, Giải tích II' }, learningOutcome: { en: 'Apply F_T correction, LMTD, and wet-bulb floors to exchangers and cooling towers.', vi: 'Áp dụng hiệu chỉnh F_T, LMTD và sàn bầu ướt cho thiết bị trao đổi nhiệt và tháp làm mát.' } },
  separations: { label: { en: 'Mass Transfer & Separations', vi: 'Truyền khối & Quá trình Phân tách' }, yearBadge: { en: 'Year 3', vi: 'Năm 3' }, prerequisites: { en: 'Phase Equilibria, Material Balances', vi: 'Cân bằng Pha, Cân bằng Vật chất' }, learningOutcome: { en: 'Step McCabe-Thiele stages, keep absorption factor A > 1, avoid flooding.', vi: 'Dựng bậc McCabe-Thiele, giữ hệ số hấp thụ A > 1, tránh ngập lụt.' } },
  reaction: { label: { en: 'Reaction Engineering & Kinetics', vi: 'Kỹ thuật Phản ứng & Động học' }, yearBadge: { en: 'Year 3/4', vi: 'Năm 3/4' }, prerequisites: { en: 'Thermodynamics, Transport Phenomena, ODEs', vi: 'Nhiệt động lực học, Hiện tượng Vận chuyển, PTVP' }, learningOutcome: { en: 'Balance G(T) vs R(T), respect η(φ) and Semenov ψ limits, avoid washout.', vi: 'Cân bằng G(T) với R(T), tôn trọng giới hạn η(φ) và Semenov ψ, tránh washout.' } },
  'design-control-safety': { label: { en: 'Plant Design, Control & Safety', vi: 'Thiết kế, Điều khiển & An toàn' }, yearBadge: { en: 'Year 4', vi: 'Năm 4' }, prerequisites: { en: 'Separations, Reaction Engineering, Process Economics', vi: 'Phân tách, Kỹ thuật Phản ứng, Kinh tế Quá trình' }, learningOutcome: { en: 'Size API 520 relief with absolute datum and apply inherently safer design.', vi: 'Tính van an toàn API 520 với chuẩn tuyệt đối và áp dụng thiết kế an toàn vốn có.' } },
};

export const COURSE_TOPIC_ORDER: readonly CourseTopicId[] = ['thermo', 'fluids', 'heat-transfer', 'separations', 'reaction', 'design-control-safety'];

export const LIFECYCLE_PHASE_META: Record<LifecyclePhaseId, { label: Record<LocaleCode, string> }> = {
  'design-audit': { label: { en: 'Design / Audit', vi: 'Thiết kế / Kiểm toán' } },
  operation: { label: { en: 'Operation', vi: 'Vận hành' } },
};

export const CAUSE_DOMAIN_META: Record<CauseDomainId, { label: Record<LocaleCode, string> }> = {
  'process-limit': { label: { en: 'Technology / Process Limit', vi: 'Giới hạn Công nghệ' } },
  equipment: { label: { en: 'Equipment Limit', vi: 'Giới hạn Thiết bị' } },
  'operating-conditions': { label: { en: 'Operating Conditions', vi: 'Điều kiện Vận hành' } },
  catalyst: { label: { en: 'Catalyst', vi: 'Xúc tác' } },
  control: { label: { en: 'Control', vi: 'Điều khiển' } },
  'convention-procedure': { label: { en: 'Convention / Procedure Error', vi: 'Lỗi Quy ước / Thao tác' } },
};
```

  3. Append the tag table + accessors — copy the 24 rows from the **Phase-2 Audit Table in `plan.md`** (columns courseTopic / lifecyclePhase / causeDomain / caseStudy; rationale column stays in plan.md, NOT in code):

```ts
export const PROBLEM_TAXONOMY: Readonly<Record<string, ProblemTaxonomyTags>> = {
  'prob-01-fanning-darcy-audit':        { courseTopic: 'fluids',      lifecyclePhase: 'design-audit', causeDomain: 'convention-procedure', caseStudy: false },
  'prob-02-subcooled-jacket-boil':      { courseTopic: 'thermo',      lifecyclePhase: 'design-audit', causeDomain: 'convention-procedure', caseStudy: false },
  'prob-03-butane-isomerization-oops':  { courseTopic: 'thermo',      lifecyclePhase: 'design-audit', causeDomain: 'process-limit',         caseStudy: false },
  'prob-04-wilson-lle-decanter-trap':  { courseTopic: 'thermo',      lifecyclePhase: 'design-audit', causeDomain: 'convention-procedure', caseStudy: false },
  'prob-05-high-pressure-eos-z-trap':   { courseTopic: 'thermo',      lifecyclePhase: 'design-audit', causeDomain: 'process-limit',         caseStudy: false },
  'prob-06-pump-cavitation-boiler-hx':  { courseTopic: 'fluids',      lifecyclePhase: 'operation',    causeDomain: 'operating-conditions', caseStudy: false },
  'prob-07-isa-control-valve-choked':   { courseTopic: 'fluids',      lifecyclePhase: 'operation',    causeDomain: 'control',              caseStudy: false },
  'prob-08-hx-temperature-cross-ft':    { courseTopic: 'heat-transfer', lifecyclePhase: 'operation',  causeDomain: 'equipment',            caseStudy: false },
  'prob-09-distillation-fair-flooding': { courseTopic: 'separations', lifecyclePhase: 'operation',    causeDomain: 'equipment',            caseStudy: false },
  'prob-10-mccabe-feed-q-upset':        { courseTopic: 'separations', lifecyclePhase: 'operation',    causeDomain: 'operating-conditions', caseStudy: false },
  'prob-11-kremser-absorber-pinch':     { courseTopic: 'separations', lifecyclePhase: 'operation',    causeDomain: 'operating-conditions', caseStudy: false },
  'prob-12-cooling-tower-wetbulb-pinch': { courseTopic: 'heat-transfer', lifecyclePhase: 'operation', causeDomain: 'process-limit',        caseStudy: false },
  'prob-13-catalytic-pore-and-runaway': { courseTopic: 'reaction',    lifecyclePhase: 'operation',    causeDomain: 'catalyst',             caseStudy: false },
  'prob-14-monsanto-t2-batch-runaway':  { courseTopic: 'reaction',    lifecyclePhase: 'operation',    causeDomain: 'operating-conditions', caseStudy: false },
  'prob-15-ethylene-pbr-ergun-dp':      { courseTopic: 'reaction',    lifecyclePhase: 'operation',    causeDomain: 'equipment',            caseStudy: false },
  'prob-16-trambouze-series-selectivity': { courseTopic: 'reaction',  lifecyclePhase: 'operation',    causeDomain: 'operating-conditions', caseStudy: false },
  'prob-17-chemostat-monod-washout':    { courseTopic: 'reaction',    lifecyclePhase: 'operation',    causeDomain: 'operating-conditions', caseStudy: false },
  'prob-18-photolithography-pag-poisoning': { courseTopic: 'reaction', lifecyclePhase: 'operation',  causeDomain: 'catalyst',             caseStudy: false },
  'prob-19-lake-nyos-co2-eruption':     { courseTopic: 'thermo',      lifecyclePhase: 'operation',    causeDomain: 'process-limit',        caseStudy: true },
  'prob-20-bhopal-mic-relief-runaway':  { courseTopic: 'design-control-safety', lifecyclePhase: 'operation', causeDomain: 'convention-procedure', caseStudy: false },
  'prob-21-api520-psv-datum-trap':      { courseTopic: 'design-control-safety', lifecyclePhase: 'design-audit', causeDomain: 'convention-procedure', caseStudy: false },
  'prob-22-dispersion-pasquill-plume':  { courseTopic: 'design-control-safety', lifecyclePhase: 'operation', causeDomain: 'process-limit',      caseStudy: true },
  'prob-23-electrolyzer-butler-volmer': { courseTopic: 'reaction',    lifecyclePhase: 'operation',    causeDomain: 'convention-procedure', caseStudy: false },
  'prob-24-aiche-chem-e-car-clock':     { courseTopic: 'reaction',    lifecyclePhase: 'operation',    causeDomain: 'operating-conditions', caseStudy: true },
};

export function getProblemTaxonomy(problemId: string): ProblemTaxonomyTags | undefined {
  return PROBLEM_TAXONOMY[problemId];
}
```

  4. If the `LocaleCode` import errors, copy the exact import from `src/lib/curriculum-progression-map.ts` line 2.
- Success criteria: file typechecks; `PROBLEM_TAXONOMY` has exactly the 24 keys above (verify against `ALL_24_REAL_LIFE_PROBLEMS` ids).
- Verify: `npm run typecheck` → exit 0; `wc -l src/lib/problem-taxonomy.ts` → ≤ 199 (expected ≈ 120).

## Task 2.2 — Phase-20 taxonomy assertions

- Goal: lock the audit table into a mechanical test so any later tag drift fails CI.
- Target files: modify `src/__tests__/phase21-luong-curriculum-redesign.test.tsx` (append).
- Steps:
  1. Import `ALL_24_REAL_LIFE_PROBLEMS` from `src/lib/problem-library-registry`, `PROBLEM_TAXONOMY`, `COURSE_TOPIC_ORDER`, `COURSE_TOPIC_META`, `CAUSE_DOMAIN_META`, `LIFECYCLE_PHASE_META` from `src/lib/problem-taxonomy`.
  2. Add tests:
     - `every problem has exactly one taxonomy row`: for each `p` in `ALL_24_REAL_LIFE_PROBLEMS`, `PROBLEM_TAXONOMY[p.problemId]` is defined; `Object.keys(PROBLEM_TAXONOMY).length === ALL_24_REAL_LIFE_PROBLEMS.length`.
     - `session totals match the locked audit table`: group by `courseTopic` → expect `{thermo: 5, fluids: 3, 'heat-transfer': 2, separations: 3, reaction: 8, 'design-control-safety': 3}` (compare against `ALL_24_REAL_LIFE_PROBLEMS.length`-derived total 24, not a hardcoded extra constant).
     - `phase and domain totals match`: phases `{ 'design-audit': 6, operation: 18 }`; domains `{ 'process-limit': 5, equipment: 3, 'operating-conditions': 7, catalyst: 2, control: 1, 'convention-procedure': 6 }`.
     - `case-study badges are exactly three`: ids `prob-19-…`, `prob-22-…`, `prob-24-…`.
     - `control domain roadmap cell`: `PROBLEM_TAXONOMY['prob-07-isa-control-valve-choked'].causeDomain === 'control'`.
     - `meta labels are bilingual`: every `COURSE_TOPIC_META`/`CAUSE_DOMAIN_META`/`LIFECYCLE_PHASE_META` entry has non-empty `en` and `vi` strings.
- Success criteria: all new assertions pass.
- Verify: `npx vitest run src/__tests__/phase21-luong-curriculum-redesign.test.tsx` → exit 0.

## Task 2.3 — Lương audit deliverable (rendered table for review)

- Goal: a standalone markdown table file the user can send Lương BEFORE phase 4 builds UI on top of the tags (decision E's audit gate).
- Target files: create `plans/261105-1411-luong-curriculum-redesign/taxonomy-audit-table.md` (NEW).
- Steps:
  1. Generate the VI-facing table by rendering `PROBLEM_TAXONOMY` joined with problem titles: run `node -e` (or write a tiny script under `/tmp`) that imports the data is NOT possible for TS — instead hand-copy the audit table from `plan.md` (Phase-2 Audit Table section) into the new file, adding a VI header row: `| # | Bài | Buổi (courseTopic) | Giai đoạn | Lĩnh vực nguyên nhân | Case study | Ghi chú |` and translate ONLY the six domain names and two phase names using `CAUSE_DOMAIN_META`/`LIFECYCLE_PHASE_META` VI labels (values are in Task 2.1 above).
  2. Append the three honest-gap notes from `plan.md` (heat-transfer 2 problems; control 1 problem; L4 only in reaction ×2 + design-control-safety ×1) under a `## Khoảng trống lộ trình (roadmap)` heading, plus the note that `prob-24` can be flipped to `control` at Lương's discretion.
- Success criteria: file exists with 24 rows + gap notes; totals row present and matching Task 2.2 numbers.
- Note: NO user gate is required before phase 4 — the tags were pre-approved in the 2026-11-05 walkthrough (Locked Decisions D1/E/H=6); this table is an asynchronous review deliverable for Lương. If he flips any tag (e.g. prob-24 → `control`), it is a one-line change in `PROBLEM_TAXONOMY` plus the Task 2.2 totals.
- Verify: `grep -cE '^\| [0-9]+ +\| prob-' plans/261105-1411-luong-curriculum-redesign/taxonomy-audit-table.md` → prints `24` (table rows only; prose notes that mention problem ids must not match this pattern — write such notes without a leading `| <number> |` row shape).

## Task 2.4 — Phase gate

- Verify: `npm test` → exit 0. `wc -l src/lib/problem-taxonomy.ts` → ≤ 199. `npm run build` → exit 0.

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
