// Curriculum Progression & Boundary Governance Metadata (`P1`, `P2`, `P5`, `P6`, < 200 LOC).
import type { WorkbenchId, LocaleCode } from '../context/persona-theme-context';

export interface JargonGloss {
  term: string;
  plainEnglish: string;
  plainVietnamese: string;
}

export interface CurriculumStageMeta {
  workbenchId: WorkbenchId;
  yearBadge: Record<LocaleCode, string>;
  subjectOrderLabel: Record<LocaleCode, string>;
  prerequisites: Record<LocaleCode, string>;
  learningOutcome: Record<LocaleCode, string>;
  causalChain: Record<LocaleCode, { symptom: string; subject: string; equation: string; lab: string; result: string }>;
  flagshipMissionId: string;
  flagshipProblemNumber: string;
  jargonGlosses: JargonGloss[];
}

export const CURRICULUM_PROGRESSION_MAP: Record<WorkbenchId, CurriculumStageMeta> = {
  'wb2-thermo-dippr': {
    workbenchId: 'wb2-thermo-dippr',
    yearBadge: { en: 'Year 2 · Core Foundation 1', vi: 'Năm 2 · Nền tảng Cốt lõi 1' },
    subjectOrderLabel: { en: 'Subject 1 · Thermodynamics & Physical Properties', vi: 'Học phần 1 · Nhiệt động lực học & Tính chất Vật lý' },
    prerequisites: { en: 'Prerequisites: Material & Energy Balances, Calculus II', vi: 'Tiên quyết: Cân bằng Vật chất & Năng lượng, Giải tích II' },
    learningOutcome: {
      en: 'Predict vapor pressure, liquid density, and boiling point across valid temperature bounds before sizing any unit operation.',
      vi: 'Dự đoán áp suất hơi, khối lượng riêng lỏng và điểm sôi trong miền nhiệt độ hợp lệ trước khi tính toán thiết bị.',
    },
    causalChain: {
      en: { symptom: 'Condenser subcooling error or pump flashing at high T', subject: 'Year 2 Thermodynamics (Smith, Van Ness & Abbott + Perry Sec. 2)', equation: 'DIPPR Eq. 101 (Vapor Pressure) & Eq. 105 (Rackett Liquid Density)', lab: 'Scrub T (K) & P_op (kPa) with live T_min/T_max guardrail clamping', result: 'Verified P_vp (kPa), ρ_L (kmol/m³), and boiling-state diagnosis' },
      vi: { symptom: 'Lỗi độ quá lạnh thiết bị ngưng tụ hoặc xâm thực bơm ở nhiệt độ cao', subject: 'Nhiệt động lực học Năm 2 (Smith, Van Ness & Abbott + Perry Mục 2)', equation: 'Phương trình DIPPR 101 (Áp suất hơi) & 105 (Khối lượng riêng Rackett)', lab: 'Kéo thanh trượt T (K) & P_op (kPa) với rào chắn T_min/T_max trực tiếp', result: 'Xác minh P_vp (kPa), ρ_L (kmol/m³) và chẩn đoán trạng thái sôi' },
    },
    flagshipMissionId: 'mission-boil-water',
    flagshipProblemNumber: '2.1',
    jargonGlosses: [{ term: 'DIPPR 101 / 105', plainEnglish: 'Standard 5-parameter correlations for pure-component vapor pressure (Eq. 101) and liquid molar density (Eq. 105).', plainVietnamese: 'Hàm tương quan 5 tham số chuẩn cho áp suất hơi (Eq. 101) và khối lượng riêng mol pha lỏng (Eq. 105).' }],
  },
  'wb3-hydraulics': {
    workbenchId: 'wb3-hydraulics',
    yearBadge: { en: 'Year 2/3 · Core Foundation 2', vi: 'Năm 2/3 · Nền tảng Cốt lõi 2' },
    subjectOrderLabel: { en: 'Subject 2 · Fluid Mechanics & Transport Phenomena', vi: 'Học phần 2 · Cơ học Lưu chất & Hiện tượng Vận chuyển' },
    prerequisites: { en: 'Prerequisites: Thermodynamics I, Differential Equations', vi: 'Tiên quyết: Nhiệt động lực học I, Phương trình Vi phân' },
    learningOutcome: {
      en: 'Size process piping, convert Darcy vs. Fanning friction factors (f_D = 4·f_F), and prove NPSHa > NPSHr to prevent cavitation.',
      vi: 'Tính kích thước đường ống, phân biệt hệ số ma sát Darcy và Fanning (f_D = 4·f_F) và chứng minh NPSHa > NPSHr chống xâm thực.',
    },
    causalChain: {
      en: { symptom: 'Transfer pump gravel noise & 4× pressure-drop miscalculation', subject: 'Year 2/3 Fluid Mechanics (Bird, Stewart & Lightfoot + Perry Sec. 6)', equation: 'Churchill Full-Regime Friction Factor & Net Positive Suction Head (NPSHa)', lab: 'Scrub suction pressure (psig), vapor pressure, and pipe ID', result: 'Verified ΔP (psi), f_D = 4·f_F audit, and cavitation safety margin' },
      vi: { symptom: 'Bơm kêu lạo xạo như sỏi & tính sai độ sụt áp gấp 4 lần', subject: 'Cơ học Lưu chất Năm 2/3 (Bird, Stewart & Lightfoot + Perry Mục 6)', equation: 'Hệ số ma sát Churchill toàn miền & Cột áp hút dương thuần (NPSHa)', lab: 'Kéo thanh trượt áp suất hút (psig), áp suất hơi và đường kính ống', result: 'Xác minh ΔP (psi), kiểm toán f_D = 4·f_F và biên an toàn chống xâm thực' },
    },
    flagshipMissionId: 'mission-pump-npsha',
    flagshipProblemNumber: '3.1',
    jargonGlosses: [
      { term: 'NPSHa vs. NPSHr', plainEnglish: 'Net Positive Suction Head Available vs. Required — liquid pressure margin above boiling at the pump inlet.', plainVietnamese: 'Cột áp hút dương thuần Hiện có so với Yêu cầu — biên áp suất chất lỏng cao hơn áp suất sôi tại cửa hút bơm.' },
      { term: 'f_D = 4·f_F', plainEnglish: 'Darcy friction factor (piping tables) is 4× the Fanning friction factor (momentum transport textbooks).', plainVietnamese: 'Hệ số ma sát Darcy (bảng đường ống) gấp 4 lần hệ số ma sát Fanning (giáo trình vận chuyển động lượng).' },
    ],
  },
  'wb4-distillation': {
    workbenchId: 'wb4-distillation',
    yearBadge: { en: 'Year 3 · Core Separations', vi: 'Năm 3 · Quá trình Phân tách' },
    subjectOrderLabel: { en: 'Subject 3 · Separation Processes & Mass Transfer', vi: 'Học phần 3 · Quá trình Phân tách & Truyền khối' },
    prerequisites: { en: 'Prerequisites: Phase Equilibria (Thermodynamics II), Material Balances', vi: 'Tiên quyết: Cân bằng Pha (Nhiệt động II), Cân bằng Vật chất' },
    learningOutcome: {
      en: 'Step off McCabe-Thiele equilibrium stages, identify minimum reflux pinch (R_min), and diagnose column flooding.',
      vi: 'Dựng bậc cân bằng McCabe-Thiele, xác định điểm thắt hồi lưu tối thiểu (R_min) và chẩn đoán ngập lụt tháp.',
    },
    causalChain: {
      en: { symptom: 'Overhead distillate purity drops & infinite-stage pinch', subject: 'Year 3 Separations (Seader 4th Ed. + Perry Sec. 13)', equation: 'Constant-α VLE Curve, Fenske N_min, and Underwood R_min', lab: 'Scrub reflux ratio multiplier (R/R_min), α, and thermal quality q', result: 'Verified theoretical stage staircase (N_theoretical) and operating lines' },
      vi: { symptom: 'Độ tinh khiết đỉnh tháp giảm & kẹt ở điểm thắt vô hạn bậc', subject: 'Quá trình Phân tách Năm 3 (Seader Ấn bản 4 + Perry Mục 13)', equation: 'Đường cân bằng lỏng-hơi α hằng số, Fenske N_min và Underwood R_min', lab: 'Kéo hệ số bội hồi lưu (R/R_min), độ bay hơi tương đối α và trạng thái nhiệt q', result: 'Xác minh cầu thang số bậc lý thuyết (N_theoretical) và đường làm việc' },
    },
    flagshipMissionId: 'mission-distillation',
    flagshipProblemNumber: '4.1',
    jargonGlosses: [{ term: 'McCabe-Thiele & R/R_min', plainEnglish: 'Graphical method counting ideal vapor-liquid contact trays; R/R_min measures how far reflux sits above the pinch limit.', plainVietnamese: 'Phương pháp đồ thị đếm số đĩa tiếp xúc lỏng-hơi lý tưởng; R/R_min đo khoảng cách từ tỷ số hồi lưu đến giới hạn thắt.' }],
  },
  'wb6-kinetics-reactors': {
    workbenchId: 'wb6-kinetics-reactors',
    yearBadge: { en: 'Year 3/4 · Reaction Engineering', vi: 'Năm 3/4 · Kỹ thuật Phản ứng' },
    subjectOrderLabel: { en: 'Subject 4 · Chemical Reaction Engineering & Kinetics', vi: 'Học phần 4 · Kỹ thuật Phản ứng Hóa học & Động học' },
    prerequisites: { en: 'Prerequisites: Thermodynamics, Transport Phenomena, ODEs', vi: 'Tiên quyết: Nhiệt động lực học, Hiện tượng Vận chuyển, Phương trình Vi phân' },
    learningOutcome: {
      en: 'Compare CSTR vs. PFR volumes on a Levenspiel plot (-r_A⁻¹ vs. X) and balance heat generation G(T) against removal R(T).',
      vi: 'So sánh thể tích CSTR và PFR trên đồ thị Levenspiel (-r_A⁻¹ theo X) và cân bằng nhiệt sinh ra G(T) với nhiệt lấy đi R(T).',
    },
    causalChain: {
      en: { symptom: '2nd-order CSTR requires 3× PFR volume or exothermic runaway risk', subject: 'Year 3/4 Reaction Engineering (Fogler 7th Ed. + Perry Sec. 7/19)', equation: 'Fogler 5-Step Algorithm: Mole Balance -> Rate Law -> Stoichiometry -> Combine', lab: 'Scrub target conversion X, Thiele φ, and Semenov ψ', result: 'Verified V_CSTR vs. V_PFR (L) and Levenspiel rectangle/integral areas' },
      vi: { symptom: 'CSTR bậc 2 tốn gấp 3 lần thể tích PFR hoặc nguy cơ mất kiểm soát nhiệt', subject: 'Kỹ thuật Phản ứng Năm 3/4 (Fogler Ấn bản 7 + Perry Mục 7/19)', equation: 'Thuật toán 5 bước Fogler: Cân bằng Mol -> Luật Tốc độ -> Hợp thức -> Kết hợp', lab: 'Kéo độ chuyển hóa X, mô-đun Thiele φ và số Semenov ψ', result: 'Xác minh V_CSTR so với V_PFR (L) và diện tích hình chữ nhật/tích phân Levenspiel' },
    },
    flagshipMissionId: 'mission-kinetics-runaway',
    flagshipProblemNumber: '5.1',
    jargonGlosses: [{ term: 'Levenspiel Plot (-r_A⁻¹ vs. X)', plainEnglish: 'Plot of reciprocal reaction rate vs. conversion where CSTR volume is a rectangle and PFR volume is the area under the curve.', plainVietnamese: 'Đồ thị nghịch đảo tốc độ phản ứng theo độ chuyển hóa, trong đó thể tích CSTR là hình chữ nhật và PFR là diện tích dưới đường cong.' }],
  },
  'wb5-handbook-atlas': {
    workbenchId: 'wb5-handbook-atlas',
    yearBadge: { en: 'Year 4 · Capstone Design & Safety', vi: 'Năm 4 · Đồ án Thiết kế & An toàn' },
    subjectOrderLabel: { en: 'Subject 5 · Plant Design, Control & Reference Atlas', vi: 'Học phần 5 · Thiết kế Nhà máy, Điều khiển & Atlas Tra cứu' },
    prerequisites: { en: 'Prerequisites: Separations, Reaction Engineering, Process Economics', vi: 'Tiên quyết: Quá trình Phân tách, Kỹ thuật Phản ứng, Kinh tế Quá trình' },
    learningOutcome: {
      en: 'Execute plant-wide heat recovery, economic sizing, LOPA safety audits, and equation-linked lookups across all 6 core textbooks.',
      vi: 'Thực hiện thu hồi nhiệt toàn nhà máy, tính kinh tế thiết bị, kiểm toán an toàn LOPA và tra cứu liên kết phương trình trên 6 giáo trình.',
    },
    causalChain: {
      en: { symptom: 'Unverified textbook correlation or missing plant safety barrier check', subject: 'Year 4 Capstone Design & Safety (6-Book Corpus + Perry Sec. 1–25)', equation: 'Bowman F_T, Lang Capital Factor, API 520 Relief & LOPA Risk Matrices', lab: 'Search 6-book index, filter by section, and launch interactive chart verifiers', result: 'Verified textbook page/section provenance and linked interactive solver' },
      vi: { symptom: 'Phương trình tra cứu chưa kiểm chứng hoặc thiếu rào chắn an toàn nhà máy', subject: 'Đồ án Thiết kế & An toàn Năm 4 (Kho 6 Giáo trình + Perry Mục 1–25)', equation: 'Bowman F_T, Hệ số vốn Lang, Van an toàn API 520 & Ma trận LOPA', lab: 'Tìm kiếm chỉ mục 6 sách, lọc theo chương và mở biểu đồ kiểm chứng trực tiếp', result: 'Xác minh xuất xứ trang/mục giáo trình và bộ giải tương tác liên kết' },
    },
    flagshipMissionId: 'mission-fanning-trap',
    flagshipProblemNumber: '1.3',
    jargonGlosses: [{ term: 'LOPA & Lang Factor', plainEnglish: 'Layer of Protection Analysis (process safety risk audit) and Lang Factor (installed plant cost multiplier from equipment cost).', plainVietnamese: 'Phân tích Lớp Bảo vệ (kiểm toán rủi ro an toàn) và Hệ số Lang (hệ số nhân tổng vốn đầu tư nhà máy từ giá thiết bị).' }],
  },
  'wb1-visual-verifier': {
    workbenchId: 'wb1-visual-verifier',
    yearBadge: { en: 'All Years · Visual Chart Verifier', vi: 'Mọi Năm học · Kiểm chứng Đồ thị Trực quan' },
    subjectOrderLabel: { en: 'Cross-Cutting Lab · Calibrated Nomographs & 10-Chart Verifier', vi: 'Phòng Lab Liên môn · Toán đồ Hiệu chuẩn & Kiểm chứng 10 Đồ thị' },
    prerequisites: { en: 'Prerequisites: Dimensional Analysis, Logarithmic & Nomograph Reading', vi: 'Tiên quyết: Phân tích Thứ nguyên, Đọc Đồ thị Logarit & Toán đồ' },
    learningOutcome: {
      en: 'Cross-check textbook figure readings against deterministic white-box equations with sub-pixel crosshair telemetry.',
      vi: 'Đối chiếu kết quả đọc hình vẽ giáo trình với phương trình hộp trắng tất định bằng tâm ngắm chính xác từng điểm ảnh.',
    },
    causalChain: {
      en: { symptom: 'Chart misread on Moody friction, flooding velocity, or drag coefficient', subject: 'Cross-Cutting Nomograph Verification (All 6 Core ChE Textbooks)', equation: 'Churchill (Eq. 6-38), Souders-Brown Flooding, and Sphere Drag', lab: 'Drag 2D crosshair across calibrated axes or toggle deterministic SVG curve', result: 'Side-by-side figure reading vs. exact analytical formula output' },
      vi: { symptom: 'Đọc sai đồ thị ma sát Moody, vận tốc ngập lụt hoặc hệ số cản hạt', subject: 'Kiểm chứng Toán đồ Liên môn (Trọn bộ 6 Giáo trình Kỹ thuật Hóa học)', equation: 'Churchill (Eq. 6-38), Ngập lụt Souders-Brown và Hệ số cản cầu', lab: 'Kéo tâm ngắm 2D trên trục hiệu chuẩn hoặc bật đường cong SVG tất định', result: 'Đối chiếu trực tiếp giá trị đọc đồ thị với kết quả công thức giải tích' },
    },
    flagshipMissionId: 'mission-fanning-trap',
    flagshipProblemNumber: '1.1',
    jargonGlosses: [{ term: 'White-Box Nomograph Telemetry', plainEnglish: 'Every chart point is computed live from its published analytical equation — never a black-box image guess.', plainVietnamese: 'Mọi điểm trên đồ thị đều được tính trực tiếp từ phương trình giải tích đã công bố — không phải đoán mò từ ảnh.' }],
  },
};
