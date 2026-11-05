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
