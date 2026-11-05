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

import { ALL_24_REAL_LIFE_PROBLEMS } from './problem-library-registry';

export interface MatrixCell { phase: LifecyclePhaseId; domain: CauseDomainId; problemIds: readonly string[]; }

export function getPhaseDomainMatrix(): readonly MatrixCell[] {
  const acc: Record<string, { phase: LifecyclePhaseId; domain: CauseDomainId; problemIds: string[] }> = {};
  for (const p of ALL_24_REAL_LIFE_PROBLEMS) {
    const t = PROBLEM_TAXONOMY[p.problemId];
    if (!t) continue;
    const key = `${t.lifecyclePhase}|${t.causeDomain}`;
    acc[key] ??= { phase: t.lifecyclePhase, domain: t.causeDomain, problemIds: [] };
    acc[key].problemIds.push(p.problemId);
  }
  return Object.values(acc);
}
