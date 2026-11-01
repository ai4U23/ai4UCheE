// Bilingual (`en` / `vi`) dictionary for ProblemLibraryBrowser, AdaptiveRecommendationRail,
// MissionChecklistBanner, and HypothesisTroubleshootingBoard (< 200 LOC).
import type { WorkbenchId } from '../../actions/view-screen';
import type { FoglerProblemSolvingCase } from '../fogler-problem-solving-catalog';
import {
  EQUIPMENT_CATEGORY_META, PROGRESSION_TIER_META, SYMPTOM_CATEGORY_META,
  type EngineeringProgressionTier, type EquipmentCategoryId, type SymptomCategoryId,
} from '../problem-library-types';
import { getActiveLocale, type LocaleCode } from './locale-types';

export interface TroubleshootingCopy {
  libHeader: string; libSubtitle: string; libCloseBtn: string;
  libAllTiers: (n: number) => string; libTierLabel: (t: EngineeringProgressionTier) => string;
  libEquipLabel: string; libAllEquipOpt: string; libEquipOpt: (k: EquipmentCategoryId) => string;
  libSymptomLabel: string; libAllSymptomOpt: string; libSymptomOpt: (k: SymptomCategoryId) => string;
  libSubjectLabel: string; libAllSubjectsOpt: string; libSearchPlaceholder: string;
  libCountBadge: (shown: number, total: number) => string; libSolveBtn: (num: number) => string;
  railStudentLabel: string; railNewStudentOpt: string; railSaveBtn: string;
  railMasteryBadge: (pct: number, solved: number) => string; railHypothesesBadge: (ok: number, total: number) => string;
  railCoachLabel: string; railAutoOpt: (lvl: string) => string; railGuidedOpt: string; railSocraticOpt: string; railChallengeOpt: string;
  railTrapPrefix: string; railNextStepPrefix: string; railResetBtn: string;
  missionSolvedTitle: string; missionActiveTitle: string; missionFlowSuffix: string;
  missionSteps: [string, string, string, string, string, string];
  missionSocraticBtn: string; missionAutofixPrefix: string; missionDetectiveNudge: string;
  boardRealPlantPrefix: string; boardToggleBtn: (expanded: boolean) => string;
  boardStage1Title: string; boardColTelemetry: string; boardColNormal: string; boardColFaulty: string; boardColDelta: string;
  boardStage2Title: string; boardPerceivedLabel: string; boardRealDefLabel: string;
  boardStage34Title: string; boardGoverningLabel: string; boardHandbookLabel: string; boardConfirmTheoryBtn: (done: boolean) => string;
  boardStage5Title: string; boardProveBtn: string; boardDisproveBtn: string; boardAskAgentBtn: string;
  boardStage6Title: string; boardAiCollaboratorTitle: string;
}

const TIER_VI: Record<EngineeringProgressionTier, string> = {
  L1: 'L1 · Bẫy Đơn vị & Khái niệm', L2: 'L2 · Điểm nghẽn Thiết bị',
  L3: 'L3 · Chẩn đoán Đa giả thuyết', L4: 'L4 · An toàn & Thiết kế Tích hợp',
};

const EQUIP_VI: Record<EquipmentCategoryId, string> = {
  'pumps-piping': 'Bơm & Đường ống (P-101 / L-101)', 'valves-reliefs': 'Van điều khiển & Van an toàn (FCV / PSV)',
  'exchangers-boilers': 'Thiết bị Trao đổi nhiệt & Nồi hơi (E-101)', 'vessels-tanks': 'Bình tách Flash & Bồn chứa (V-101 / TK)',
  'columns-towers': 'Tháp Chưng cất & Hấp thụ (T-201)', 'reactors-catalysts': 'Lò phản ứng & Xúc tác (R-301 / PBR)',
  'dryers-membranes': 'Tháp Giải nhiệt & Màng lọc (CT / M)', 'special-systems': 'Bình Điện phân, Vi mạch & Chem-E-Car',
};

const SYMPTOM_VI: Record<SymptomCategoryId, string> = {
  'design-unit-trap': 'Sai lệch Thiết kế / Đơn vị', 'cavitation-choking-flooding': 'Xâm thực / Nghẽn dòng / Ngập lụt',
  'thermal-runaway-cold': 'Bất thường Nhiệt / Thoát nhiệt', 'offspec-yield-purity': 'Lệch chuẩn Độ tinh khiết / Hiệu suất',
  'safety-containment-breach': 'Nguy cơ An toàn / Xả áp',
};

const TS_EN: TroubleshootingCopy = {
  libHeader: '24 Real-Life Plant Problem Library (7 Reference Books · Engineering Progression Tiers L1–L4)',
  libSubtitle: 'Select any real plant problem by Difficulty Tier (L1–L4), Equipment, or Symptom to launch its 6-Stage Fogler & LeBlanc Investigation',
  libCloseBtn: 'Close Library', libAllTiers: (n) => `All Tiers (${n})`, libTierLabel: (t) => PROGRESSION_TIER_META[t].label,
  libEquipLabel: 'Equipment:', libAllEquipOpt: 'All 8 Equipment Families', libEquipOpt: (k) => EQUIPMENT_CATEGORY_META[k].label,
  libSymptomLabel: 'Symptom:', libAllSymptomOpt: 'All 5 Failure Symptoms', libSymptomOpt: (k) => SYMPTOM_CATEGORY_META[k].label,
  libSubjectLabel: 'Subject:', libAllSubjectsOpt: 'All 5 ChE Subjects + Charts', libSearchPlaceholder: 'Search equipment, book, or fault',
  libCountBadge: (s, tot) => `Showing ${s} / ${tot} Problems`, libSolveBtn: (n) => `Solve Problem #${n}`,
  railStudentLabel: 'Student:', railNewStudentOpt: '+ New Student', railSaveBtn: 'Save',
  railMasteryBadge: (p, s) => `Mastery: ${p}% (${s}/5 Missions)`, railHypothesesBadge: (ok, tot) => `Hypotheses: ${ok}/${tot}`,
  railCoachLabel: 'AI Coach:', railAutoOpt: (lvl) => `Auto (${lvl})`,
  railGuidedOpt: 'Guided (Step-by-Step)', railSocraticOpt: 'Socratic (Clues)', railChallengeOpt: 'Challenge (Boss)',
  railTrapPrefix: 'Trap:', railNextStepPrefix: 'Next Best Step:', railResetBtn: '↺ Reset Scorecard',
  missionSolvedTitle: 'Mission Solved', missionActiveTitle: 'Mission Active', missionFlowSuffix: '(Fogler & LeBlanc 6-Stage Flow)',
  missionSteps: [
    'Stage 1 · Problem Observation (Normal vs. Faulty Plant Data)', 'Stage 2 · Problem Definition (K-T IS / IS NOT & Real Problem)',
    'Stage 3 · Fundamental Theory (Why You Learn This Subject)', 'Stage 4 · Applicable Handbook (Perry & 6-Book Anchor)',
    'Stage 5 · Hypotheses: Prove ✅ / Disprove ❌ (Rule #12)', 'Stage 6 · Actual Solution & Safe Operating Margin Verified',
  ],
  missionSocraticBtn: 'Socratic Hint (Keep Full +35% Mastery)', missionAutofixPrefix: 'Auto-Fix & Ask Copilot',
  missionDetectiveNudge: 'Detective Nudge: Test a hypothesis below & scrub sliders yourself for full +35% mastery & Gold Stamp (Auto-Fix gives +12%)',
  boardRealPlantPrefix: 'Real Plant Problem:', boardToggleBtn: (exp) => (exp ? '▾ Compact 6-Stage Board' : '▸ Expand 6-Stage Board'),
  boardStage1Title: '1. Problem Observation (Normal vs. Faulty Plant Telemetry):',
  boardColTelemetry: 'Telemetry', boardColNormal: 'Normal Baseline', boardColFaulty: 'Faulty Plant Reading', boardColDelta: 'Physical Delta',
  boardStage2Title: '2. Problem Definition (K-T IS / IS NOT & Restatement):', boardPerceivedLabel: 'Perceived Trap:', boardRealDefLabel: 'Real Problem Defined:',
  boardStage34Title: '3. Fundamental Theory & 4. Applicable Handbook:', boardGoverningLabel: 'Governing Terms:', boardHandbookLabel: 'Applicable Handbook:',
  boardConfirmTheoryBtn: (done) => `Confirm Theory & Handbook Anchor (${done ? '✓ Reviewed' : 'Mark Reviewed'})`,
  boardStage5Title: '5. Draft & Prove/Disprove Hypotheses ("Does It Fit the Observation?" — Rule #12):',
  boardProveBtn: 'Prove ✅', boardDisproveBtn: 'Disprove ❌', boardAskAgentBtn: 'Ask AI Agent to Test',
  boardStage6Title: '6. Actual Solution Prescription:', boardAiCollaboratorTitle: 'AI Problem-Solving Collaborator:',
};

const TS_VI: TroubleshootingCopy = {
  libHeader: 'Thư viện 24 Sự cố Nhà máy Thực tế (7 Giáo trình · 4 Cấp độ L1–L4)',
  libSubtitle: 'Chọn sự cố theo Cấp độ (L1–L4), Thiết bị hoặc Triệu chứng để mở Điều tra 6 Bước Fogler & LeBlanc',
  libCloseBtn: 'Đóng Thư viện', libAllTiers: (n) => `Tất cả Cấp độ (${n})`, libTierLabel: (t) => TIER_VI[t],
  libEquipLabel: 'Thiết bị:', libAllEquipOpt: 'Tất cả 8 Nhóm Thiết bị', libEquipOpt: (k) => EQUIP_VI[k],
  libSymptomLabel: 'Triệu chứng:', libAllSymptomOpt: 'Tất cả 5 Nhóm Triệu chứng', libSymptomOpt: (k) => SYMPTOM_VI[k],
  libSubjectLabel: 'Học phần:', libAllSubjectsOpt: 'Tất cả 5 Học phần ChE + Giản đồ', libSearchPlaceholder: 'Tìm thiết bị, giáo trình hoặc sự cố',
  libCountBadge: (s, tot) => `Hiển thị ${s} / ${tot} Sự cố`, libSolveBtn: (n) => `Giải Sự cố #${n}`,
  railStudentLabel: 'Sinh viên:', railNewStudentOpt: '+ Thêm sinh viên', railSaveBtn: 'Lưu',
  railMasteryBadge: (p, s) => `Thành thạo: ${p}% (${s}/5 Nhiệm vụ)`, railHypothesesBadge: (ok, tot) => `Giả thuyết: ${ok}/${tot}`,
  railCoachLabel: 'Gia sư AI:', railAutoOpt: (lvl) => `Tự động (${lvl})`,
  railGuidedOpt: 'Hướng dẫn từng bước (Guided)', railSocraticOpt: 'Gợi mở Socratic (Clues)', railChallengeOpt: 'Thử thách Kỹ sư (Boss)',
  railTrapPrefix: 'Bẫy:', railNextStepPrefix: 'Bước tiếp theo:', railResetBtn: '↺ Đặt lại Điểm',
  missionSolvedTitle: 'Đã Giải Quyết Nhiệm Vụ', missionActiveTitle: 'Nhiệm Vụ Đang Mở', missionFlowSuffix: '(Quy trình 6 Bước Fogler & LeBlanc)',
  missionSteps: [
    'Bước 1 · Quan sát Sự cố (Số liệu Bình thường vs. Sự cố)', 'Bước 2 · Định nghĩa Vấn đề (Bảng K-T IS / IS NOT & Bản chất)',
    'Bước 3 · Lý thuyết Cơ sở (Tại sao phải học Học phần này)', 'Bước 4 · Sổ tay Tra cứu (Perry & Mốc chuẩn 6 Giáo trình)',
    'Bước 5 · Kiểm định Giả thuyết: Chứng minh ✅ / Bác bỏ ❌ (Quy tắc #12)', 'Bước 6 · Nghiệm Thực tế & Xác nhận Biên độ Vận hành An toàn',
  ],
  missionSocraticBtn: 'Gợi ý Socratic (Giữ trọn +35% điểm Thành thạo)', missionAutofixPrefix: 'Tự động Sửa & Hỏi Copilot',
  missionDetectiveNudge: 'Gợi ý Điều tra: Tự kiểm tra giả thuyết bên dưới & kéo thanh trượt để nhận trọn +35% điểm & Huy hiệu Vàng (Tự động sửa chỉ nhận +12%)',
  boardRealPlantPrefix: 'Sự cố Nhà máy Thực tế:', boardToggleBtn: (exp) => (exp ? '▾ Thu gọn Bảng 6 Bước' : '▸ Mở rộng Bảng 6 Bước'),
  boardStage1Title: '1. Quan sát Sự cố (Số liệu Bình thường vs. Khi gặp Sự cố):',
  boardColTelemetry: 'Thông số đo', boardColNormal: 'Mức Bình thường', boardColFaulty: 'Số liệu Khi Sự cố', boardColDelta: 'Chênh lệch Vật lý',
  boardStage2Title: '2. Định nghĩa Vấn đề (Phân tích K-T IS / IS NOT):', boardPerceivedLabel: 'Ngộ nhận ban đầu:', boardRealDefLabel: 'Vấn đề thực sự:',
  boardStage34Title: '3. Lý thuyết Cơ sở & 4. Sổ tay Tra cứu:', boardGoverningLabel: 'Đại lượng chi phối:', boardHandbookLabel: 'Sổ tay chuẩn:',
  boardConfirmTheoryBtn: (done) => `Xác nhận Lý thuyết & Sổ tay (${done ? '✓ Đã duyệt' : 'Đánh dấu Đã duyệt'})`,
  boardStage5Title: '5. Lập & Chứng minh/Bác bỏ Giả thuyết ("Có khớp Quan sát không?" — Quy tắc #12):',
  boardProveBtn: 'Chứng minh ✅', boardDisproveBtn: 'Bác bỏ ❌', boardAskAgentBtn: 'Nhờ AI kiểm tra',
  boardStage6Title: '6. Phác đồ Giải pháp Thực tế:', boardAiCollaboratorTitle: 'Trợ lý AI Đồng hành Giải quyết Vấn đề:',
};

export function getTroubleshootingCopy(locale: LocaleCode = getActiveLocale()): TroubleshootingCopy {
  return locale === 'vi' ? TS_VI : TS_EN;
}

const FOGLER_VI_OVERRIDES: Record<WorkbenchId, Partial<FoglerProblemSolvingCase>> = {
  'wb1-visual-verifier': {
    plantIncidentTitle: 'Kiểm định ΔP Đường ống Cao gấp 400% so với Cảm biến Thực địa',
    whyLearnSubject: 'Tại sao phải học Giản đồ & Quy ước Ma sát? Nhầm lẫn giữa Moody Darcy f_D và Perry Fanning f_F = f_D/4 làm chọn dư công suất bơm tới 400%.',
    observationSummary: 'Vòng ống thử nghiệm ở Re = 5×10⁴ đo được ΔP = 18 kPa, nhưng bản tính sơ bộ dự báo 72 kPa (sai lệch đúng 4 lần).',
    actualSolutionSummary: 'Chỉnh giá trị đọc đồ thị từ 0.0180 về đúng hệ số Fanning f_F = 0.0045 (sai số ≤5%) và áp dụng f_D = 4·f_F.',
  },
  'wb2-thermo-dippr': {
    plantIncidentTitle: 'Nồi đun / Thiết bị Ngưng tụ Áp suất Thường Không Sôi & Tách Pha Lỏng-Lỏng',
    whyLearnSubject: 'Tại sao phải học Nhiệt động học (Học phần 1)? Không nắm định luật áp suất hơi (DIPPR Eq. 101), quy đổi psig→psia và mô hình hoạt độ (NRTL vs. Wilson), bạn không thể dự đoán điểm sôi hay tách pha!',
    observationSummary: 'Bình đang chứa ethanol quá lạnh ở 298 K (P_sat = 7.9 kPa) thay vì nước sôi ở 100 °C (101.325 kPa = 14.696 psia = 0.00 psig).',
    actualSolutionSummary: 'Chọn Nước (Water) và kéo nhiệt độ T lên 373.15 K (100 °C) để P_sat = 101.3 kPa (14.70 psia = 0.00 psig), dùng NRTL/UNIQUAC cho LLE.',
  },
  'wb3-hydraulics': {
    plantIncidentTitle: 'Bơm P-101 Kêu Lục Cục Như Sỏi Đá (Kèm Gia nhiệt Nước cấp Nồi hơi Tụt 70°C → 42°C)',
    whyLearnSubject: 'Tại sao phải học Cơ học Lưu chất & Truyền vận (Học phần 2)? Không nắm cân bằng cột áp Bernoulli/NPSHa và truyền nhiệt Q = UAΔT_lm, cánh bơm sẽ vỡ do xâm thực!',
    observationSummary: 'Bơm P-101 rung dữ dội ở 450 gpm với áp suất hút -10 psig (NPSHa = 4.18 m < NPSHr = 8.0 m), kèm sự cố thiết bị gia nhiệt nước cấp tụt nhiệt độ (70°C → 42°C).',
    actualSolutionSummary: 'Tăng áp suất hút P_suc lên +15 psig, giảm lưu lượng Q về 260 gpm và NPSHr về 3 m để NPSHa = 21.8 m ≥ 5.0 m (Hết xâm thực!).',
  },
  'wb4-distillation': {
    plantIncidentTitle: 'Độ sụt áp ΔP Tháp Chưng cất T-201 Tăng Vọt & Độ tinh khiết Đỉnh Sụt giảm',
    whyLearnSubject: 'Tại sao phải học Quá trình Tách (Học phần 3)? Số bậc cân bằng (McCabe-Thiele) cho biết số đĩa cần thiết, nhưng Thủy lực Tháp (Ngập lụt Fair) quyết định khi nào hơi thổi ngược chất lỏng gây sặc tháp!',
    observationSummary: 'Vận hành viên tăng tỷ số hồi lưu R/R_min lên 1.9 trong thân tháp hẹp 0.55 m; mức ngập lụt chạm ~200% giới hạn Fair.',
    actualSolutionSummary: 'Giảm R/R_min về 1.3 và mở rộng đường kính tháp D_c lên 0.85 m để độ ngập lụt Fair giảm từ ~200% xuống 64% (<85% an toàn).',
  },
  'wb6-kinetics-reactors': {
    plantIncidentTitle: 'Nhiệt độ Áo nước Lò phản ứng Tỏa nhiệt R-301 Tăng Vọt Trong Khi Tâm Xúc tác Bị Đói Phản ứng',
    whyLearnSubject: 'Tại sao phải học Động học & Thiết kế Lò phản ứng (Học phần 4)? Không nắm thiết kế Levenspiel, khuếch tán lỗ xốp Thiele (φ) và ổn định nhiệt Semenov (ψ ≤ 1/e), lò phản ứng sẽ bị đói xúc tác hoặc nổ nhiệt!',
    observationSummary: 'Lò phản ứng chạy ở số Semenov ψ = 0.52 > 0.368 (thoát nhiệt!) trong khi hạt xúc tác quá lớn (Thiele φ = 5.5) làm hệ số hữu hiệu giảm còn η = 45%.',
    actualSolutionSummary: 'Giảm mô-đun Thiele φ về 1.1 (η = 92.7%), giảm số Semenov ψ về 0.24 (≤0.368) và đặt độ chuyển hóa mục tiêu X = 0.80.',
  },
  'wb5-handbook-atlas': {
    plantIncidentTitle: 'Bảo dưỡng Liên hoàn Nhà máy: Giao cắt Nhiệt độ HX (Chg 11) & Tính Van An toàn PSV (Chg 23)',
    whyLearnSubject: 'Tại sao phải học Atlas 6 Giáo trình & 25 Chương Perry (Học phần 5)? Xử lý sự cố nhà máy thực tế đòi hỏi kết hợp truyền nhiệt, an toàn xả áp, kinh tế và vật liệu trên toàn bộ 25 chương Perry.',
    observationSummary: 'Thiết bị trao đổi nhiệt ống chùm bị giao cắt nhiệt độ (Bowman F_T < 0.75) trong khi van an toàn API 520 phía sau cần đổi đúng psig + 14.696 sang psia.',
    actualSolutionSummary: 'Giữ hệ số Bowman F_T ≥ 0.75 ở Chương 11 và luôn cộng 14.696 psi khi đổi psig sang psia trong công thức API 520 ở Chương 23.',
  },
};

export function localizeFoglerSpec(spec: FoglerProblemSolvingCase, locale: LocaleCode = getActiveLocale()): FoglerProblemSolvingCase {
  if (locale !== 'vi') return spec;
  const ov = FOGLER_VI_OVERRIDES[spec.workbenchId];
  return ov ? { ...spec, ...ov } : spec;
}
