// Bilingual (`en` / `vi`) dictionary for Shared UI Components, Diagram Mode Bars,
// Workbench Tutor Subcards (VisualVerifierTutorCard, CarlsonAdvisorCard, PerryAtlasPdfExplorer),
// and the ShowcaseVideoModal (< 200 LOC).
import type { WorkbenchId } from '../../actions/view-screen';
import { getActiveLocale, type LocaleCode } from './locale-types';

export interface GuideChapterCopy {
  step: string; timeSec: number; title: string; desc: string; targetWb?: WorkbenchId;
}

export interface UiSubcomponentCopy {
  scrubAsk: string; scrubSelected: string;
  eqStage1: string; eqStage2: string; eqStage3: string; eqCiteBtn: (cited: boolean) => string; eqCiteTitle: string;
  calloutFieldNotesBtn: (expanded: boolean) => string; calloutOpenStudioBtn: (open: boolean) => string; calloutWatchOutPrefix: string;
  diagramModePrefix: string;
  wb2Modes: [string, string, string]; wb3Modes: [string, string, string, string]; wb4Modes: [string, string, string, string]; wb6Modes: [string, string, string, string];
  tutorHeaderLearn: string; tutorHeaderPlant: string; tutorTargetAnchor: string; tutorExactValueLabel: string; tutorHiddenLabel: string;
  tutorInvalidPagePrefix: string; tutorInvalidPageSuffix: string; tutorReadValueLabel: string;
  tutorVerifyBtn: string; tutorLoadCropBtn: string; tutorResetCropBtn: string;
  tutorEmptyReviewMsg: (exact: number) => string; tutorVerdictMsg: (pass: boolean, err: string, exact: number) => string; tutorFanningCoaching: (numReading: number) => string;
  carlsonTitle: string; carlsonPolarityLabel: string; carlsonNonpolarOpt: string; carlsonPolarOpt: string;
  carlsonLleLabel: string; carlsonAssocLabel: string; carlsonRecPrefix: string; carlsonLleWarn: string;
  carlsonNodeNonpolar: string; carlsonNodePolar: string; carlsonNode2Liquid: string; carlsonNode1Liquid: string; carlsonNodeSelected: string;
  atlasTitle: string; atlasActiveRef: (secPage: string, pdfPage: number) => string; atlasCropBtn: (secPage: string) => string;
  atlasHideCropBtn: string; atlasAllBooksOpt: string; atlasSearchPlaceholder: string; atlasSearchBtn: string; atlasJumpBtn: (ref: string, secNum: number) => string;
  guideModalTitle: string; guideModalSub: string; guideOpenShowcaseBtn: string; guideCloseBtn: string; guideOpenLabBtn: string;
  guideChapters: ReadonlyArray<GuideChapterCopy>;
}

const UI_SUB_EN: UiSubcomponentCopy = {
  scrubAsk: '+ Ask', scrubSelected: '✓ Selected',
  eqStage1: '1 · SYMBOLIC', eqStage2: '2 · LIVE SUBSTITUTION', eqStage3: '3 · EVALUATED RESULT',
  eqCiteBtn: (cited) => (cited ? '✓ Stage 3 Theory & Stage 4 Handbook Cited' : '📐 Cite as Stage 3 Theory & Handbook'),
  eqCiteTitle: 'Confirm Stage 3 Fundamental Theory & Stage 4 Applicable Handbook in the Fogler & LeBlanc 6-Stage Flow',
  calloutFieldNotesBtn: (exp) => (exp ? '▾ Less Notes' : '▸ Field Notes'),
  calloutOpenStudioBtn: (open) => (open ? '▾ Hide 6-Stage Studio' : '🔬 Open 6-Stage Problem & Hypothesis Studio'),
  calloutWatchOutPrefix: '⚠️ Watch out:',
  diagramModePrefix: '🎛️ Diagram Mode:',
  wb2Modes: ['All Diagrams (4)', 'Binary VLE & Peng-Robinson EOS', 'Rankine T-S Dome & Reaction X_eq(T)'],
  wb3Modes: ['All Diagrams (6)', 'BSL Velocity/BL & ISA Choked Valve', 'HX T-Q Cross (F_T) & Nukiyama Boiling', 'Flammability LOC & Plume Dispersion'],
  wb4Modes: ['All Diagrams (6)', 'McCabe-Thiele & Fair Column Flooding', 'Kremser Absorption & Ternary LLE / Adsorption', 'Psychrometric Chart & Membrane Permeation'],
  wb6Modes: ['All Companion Diagrams (6)', 'Semenov G(T)/R(T) & Series Selectivity / RTD', 'LHHW Catalytic Roof / Decay & Monod Chemostat', 'Butler-Volmer / Koutecký-Levich i(η)'],
  tutorHeaderLearn: '🎓 DeepTutor Chart-Reading Challenge',
  tutorHeaderPlant: '🏭 Plant Mode — Calibrated Operating Point',
  tutorTargetAnchor: 'Target anchor:', tutorExactValueLabel: 'Exact value =', tutorHiddenLabel: '🔒 hidden until verified',
  tutorInvalidPagePrefix: '⚠️ Unrecognized section-page code', tutorInvalidPageSuffix: '— anchored to calibrated Perry page',
  tutorReadValueLabel: 'Your visually read value:',
  tutorVerifyBtn: 'Verify & Reveal Crosshair', tutorLoadCropBtn: 'Load High-DPI Crop', tutorResetCropBtn: 'Reset Crop',
  tutorEmptyReviewMsg: (exact) => `Enter a numeric chart reading above to verify against exact = ${exact}`,
  tutorVerdictMsg: (_pass, err, exact) => `Error: ${err}% (exact = ${exact})`,
  tutorFanningCoaching: (r) => `Perry's Fig. 6-9 (p. 6-10) plots Fanning friction factor f_F. Your reading (${r}) is ~4× f_F — i.e. the Moody Darcy factor f_D = 4·f_F. Divide by 4 when reading Fig. 6-9, or use f_D = 4·f_F in Darcy-Weisbach.`,
  carlsonTitle: "🧭 Carlson's (1996) / Perry Sec 4 Property Package Advisor",
  carlsonPolarityLabel: 'Polarity:', carlsonNonpolarOpt: 'Nonpolar / Hydrocarbon', carlsonPolarOpt: 'Polar Non-Electrolyte',
  carlsonLleLabel: 'Two Liquid Phases (LLE)', carlsonAssocLabel: 'Carboxylic Acid Vapor Dimerization',
  carlsonRecPrefix: 'Recommended Package:',
  carlsonLleWarn: 'NEVER use Wilson for Liquid-Liquid Equilibrium — Wilson cannot predict two liquid phases.',
  carlsonNodeNonpolar: 'Nonpolar Fluid', carlsonNodePolar: 'Polar Mixture', carlsonNode2Liquid: '2 Liquid Phases', carlsonNode1Liquid: 'Single Liquid', carlsonNodeSelected: 'Selected Model',
  atlasTitle: '📖 6-Book Corpus & Perry Back-of-Book Index (pp. 2244–2274)',
  atlasActiveRef: (sp, pp) => `Active Reference: p. ${sp} (PDF Page ${pp} of 2,274)`,
  atlasCropBtn: (sp) => `Crop PDF Page ${sp}`, atlasHideCropBtn: 'Hide PDF Crop', atlasAllBooksOpt: 'All 6 Textbooks',
  atlasSearchPlaceholder: 'Search 6-Book Corpus & Index: e.g. Levenspiel, Thiele, LMTD, relief...',
  atlasSearchBtn: 'Search Index', atlasJumpBtn: (ref, s) => `Jump → p. ${ref} (Sec ${s})`,
  guideModalTitle: '🎬 ai4UCheE — Feature Showcase & Interactive Video Guide',
  guideModalSub: '6 Canonical Textbooks · 55+ Interactive SVG Charts · 24 Real-Life Plant Problems · Remotion Walkthrough',
  guideOpenShowcaseBtn: '🏠 Open Showcase Homepage ↗', guideCloseBtn: '✕ Close', guideOpenLabBtn: 'Open Lab →',
  guideChapters: [
    { step: '01 · 3-Zone Studio', timeSec: 0, title: '1 Bar · 1 Canvas · 1 AI Co-Pilot', desc: 'Blend 6 canonical ChE textbooks (Perry 9e, Fogler 7e, BSL, SVNA, Seader, Crowl) with 55+ live SVG nomographs.' },
    { step: '02 · 5 Subject Labs', timeSec: 3, title: 'Switch 🎓 Learn ↔ 🏭 Plant Across 5 Labs', desc: 'Explore Thermodynamics (WB2), Hydraulics (WB3), Separations (WB4), Kinetics (WB6), and the 25-Sec Atlas (WB5).', targetWb: 'wb2-thermo-dippr' },
    { step: '03 · 24 Plant Problems', timeSec: 6, title: '6-Stage Fogler & LeBlanc Troubleshooting (L1–L4)', desc: 'Diagnose plant telemetry, apply K-T IS/IS NOT, and Prove ✅ / Disprove ❌ hypotheses (Rule #12).', targetWb: 'wb3-hydraulics' },
    { step: '04 · White-Box Proofs', timeSec: 9, title: 'Scrub SVG Curves & 3-Stage KaTeX Proofs', desc: 'Drag operating points with automatic guardrails for Fanning vs. Darcy (f_D = 4·f_F) and psig ↔ psia.', targetWb: 'wb4-distillation' },
    { step: '05 · Co-Pilot & QA/QC', timeSec: 12, title: '+ Ask Chips, What-If Mutations & EPC Calc Sheet', desc: 'Attach equipment chips, mutate sliders in plain English, and compile a print-ready Rev 0 QA/QC sheet.', targetWb: 'wb6-kinetics-reactors' },
  ],
};

const UI_SUB_VI: UiSubcomponentCopy = {
  scrubAsk: '+ Hỏi', scrubSelected: '✓ Đã chọn',
  eqStage1: '1 · PHƯƠNG TRÌNH KÝ HIỆU', eqStage2: '2 · THAY SỐ TRỰC TIẾP', eqStage3: '3 · KẾT QUẢ TÍNH TOÁN',
  eqCiteBtn: (cited) => (cited ? '✓ Đã trích dẫn Lý thuyết Bước 3 & Sổ tay Bước 4' : '📐 Trích dẫn Lý thuyết Bước 3 & Sổ tay'),
  eqCiteTitle: 'Xác nhận Bước 3 Lý thuyết Cơ sở & Bước 4 Sổ tay Tra cứu trong Quy trình 6 Bước Fogler & LeBlanc',
  calloutFieldNotesBtn: (exp) => (exp ? '▾ Thu gọn ghi chú' : '▸ Ghi chú thực địa'),
  calloutOpenStudioBtn: (open) => (open ? '▾ Ẩn Phòng Điều tra 6 Bước' : '🔬 Mở Phòng Điều tra Giả thuyết 6 Bước'),
  calloutWatchOutPrefix: '⚠️ Lưu ý bẫy:',
  diagramModePrefix: '🎛️ Chế độ Đồ thị:',
  wb2Modes: ['Tất cả Đồ thị (4)', 'VLE 2 cấu tử & Phương trình Peng-Robinson', 'Chu trình Rankine T-S & Cân bằng Phản ứng X_eq(T)'],
  wb3Modes: ['Tất cả Đồ thị (6)', 'Vận tốc BSL & Van Nghẽn dòng ISA', 'Giao cắt Nhiệt HX (F_T) & Sôi Nukiyama', 'Tam giác Cháy nổ LOC & Phát tán Khói'],
  wb4Modes: ['Tất cả Đồ thị (6)', 'McCabe-Thiele & Ngập lụt Tháp Fair', 'Hấp thụ Kremser & Trích ly LLE / Hấp phụ', 'Giản đồ Không khí ẩm & Thấm lọc Màng'],
  wb6Modes: ['Tất cả Đồ thị Phụ trợ (6)', 'Thoát nhiệt Semenov G(T)/R(T) & Độ chọn lọc / RTD', 'Động học Xúc tác LHHW & Bioreactor Monod', 'Đường Phân cực Điện hóa Butler-Volmer i(η)'],
  tutorHeaderLearn: '🎓 Thử thách Đọc Giản đồ DeepTutor',
  tutorHeaderPlant: '🏭 Chế độ Nhà máy — Điểm Vận hành Hiệu chuẩn',
  tutorTargetAnchor: 'Mốc chuẩn:', tutorExactValueLabel: 'Giá trị chính xác =', tutorHiddenLabel: '🔒 ẩn cho đến khi kiểm tra',
  tutorInvalidPagePrefix: '⚠️ Mã chương-trang không hợp lệ', tutorInvalidPageSuffix: '— đã neo về trang chuẩn Perry',
  tutorReadValueLabel: 'Giá trị bạn đọc trên đồ thị:',
  tutorVerifyBtn: 'Kiểm tra & Hiện Tâm chữ thập', tutorLoadCropBtn: 'Tải Ảnh cắt PDF Độ phân giải cao', tutorResetCropBtn: 'Đặt lại Ảnh cắt',
  tutorEmptyReviewMsg: (exact) => `Nhập giá trị số đọc từ đồ thị ở trên để đối chiếu với giá trị chuẩn = ${exact}`,
  tutorVerdictMsg: (_pass, err, exact) => `Sai số: ${err}% (chuẩn = ${exact})`,
  tutorFanningCoaching: (r) => `Hình 6-9 của Perry (tr. 6-10) vẽ hệ số ma sát Fanning f_F. Giá trị bạn nhập (${r}) gấp ~4 lần f_F — tức là hệ số Moody Darcy f_D = 4·f_F. Hãy chia cho 4 khi đọc Hình 6-9, hoặc dùng f_D = 4·f_F trong phương trình Darcy-Weisbach.`,
  carlsonTitle: '🧭 Cố vấn Chọn Mô hình Nhiệt động Carlson (1996) / Perry Chương 4',
  carlsonPolarityLabel: 'Độ phân cực:', carlsonNonpolarOpt: 'Không phân cực / Hydrocarbon', carlsonPolarOpt: 'Phân cực (Không điện ly)',
  carlsonLleLabel: 'Hai pha lỏng (Tách pha LLE)', carlsonAssocLabel: 'Đime hóa pha hơi Axit Carboxylic',
  carlsonRecPrefix: 'Gói Mô hình Khuyên dùng:',
  carlsonLleWarn: 'TUYỆT ĐỐI KHÔNG dùng phương trình Wilson cho cân bằng lỏng-lỏng (LLE) — Wilson không thể dự đoán tách hai pha lỏng.',
  carlsonNodeNonpolar: 'Lưu chất Không phân cực', carlsonNodePolar: 'Hỗn hợp Phân cực', carlsonNode2Liquid: '2 Pha Lỏng (LLE)', carlsonNode1Liquid: '1 Pha Lỏng', carlsonNodeSelected: 'Mô hình Đã chọn',
  atlasTitle: '📖 Kho 6 Giáo trình & Chỉ mục Cuối sách Perry (tr. 2244–2274)',
  atlasActiveRef: (sp, pp) => `Tham chiếu đang mở: tr. ${sp} (Trang PDF ${pp} / 2.274)`,
  atlasCropBtn: (sp) => `Cắt trang PDF ${sp}`, atlasHideCropBtn: 'Ẩn ảnh cắt PDF', atlasAllBooksOpt: 'Tất cả 6 Giáo trình',
  atlasSearchPlaceholder: 'Tra cứu 6 Giáo trình & Chỉ mục: VD Levenspiel, Thiele, LMTD, relief...',
  atlasSearchBtn: 'Tra Chỉ mục', atlasJumpBtn: (ref, s) => `Mở → tr. ${ref} (Chg ${s})`,
  guideModalTitle: '🎬 ai4UCheE — Giới thiệu Tính năng & Video Hướng dẫn Tương tác',
  guideModalSub: '6 Giáo trình Kinh điển · 55+ Đồ thị SVG Tương tác · 24 Sự cố Nhà máy Thực tế · Video Remotion',
  guideOpenShowcaseBtn: '🏠 Mở Trang chủ Giới thiệu ↗', guideCloseBtn: '✕ Đóng', guideOpenLabBtn: 'Mở Phòng Lab →',
  guideChapters: [
    { step: '01 · Studio 3 Vùng', timeSec: 0, title: '1 Thanh điều khiển · 1 Đồ thị · 1 Trợ lý AI', desc: 'Kết hợp 6 giáo trình ChE kinh điển (Perry 9e, Fogler 7e, BSL, SVNA, Seader, Crowl) với hơn 55 giản đồ SVG tương tác.' },
    { step: '02 · 5 Phòng Lab', timeSec: 3, title: 'Chuyển đổi 🎓 Học tập ↔ 🏭 Nhà máy qua 5 Phòng Lab', desc: 'Khám phá Nhiệt động (WB2), Thủy lực (WB3), Quá trình Tách (WB4), Động học (WB6) và Atlas 25 Chương (WB5).', targetWb: 'wb2-thermo-dippr' },
    { step: '03 · 24 Sự cố Nhà máy', timeSec: 6, title: 'Điều tra Sự cố 6 Bước Fogler & LeBlanc (L1–L4)', desc: 'Chẩn đoán số liệu nhà máy, lập bảng K-T IS/IS NOT và Chứng minh ✅ / Bác bỏ ❌ giả thuyết (Quy tắc #12).', targetWb: 'wb3-hydraulics' },
    { step: '04 · Chứng minh White-Box', timeSec: 9, title: 'Kéo Đường cong SVG & Chứng minh KaTeX 3 Bước', desc: 'Kéo điểm vận hành với cảnh báo tự động cho Fanning vs. Darcy (f_D = 4·f_F) và đổi đơn vị psig ↔ psia.', targetWb: 'wb4-distillation' },
    { step: '05 · Co-Pilot & QA/QC', timeSec: 12, title: 'Thẻ + Hỏi, Giả lập What-If & Bản tính EPC QA/QC', desc: 'Gắn thẻ thiết bị, ra lệnh chỉnh thanh trượt bằng tiếng Việt/Anh và xuất Bản tính Kiểm định QA/QC Rev 0.', targetWb: 'wb6-kinetics-reactors' },
  ],
};

export function getUiSubcomponentCopy(locale: LocaleCode = getActiveLocale()): UiSubcomponentCopy {
  return locale === 'vi' ? UI_SUB_VI : UI_SUB_EN;
}
