// Bilingual (`en` / `vi`) dictionary for Studio Shell, Guided Mission Bar, Problem Library,
// Agent Chat Drawer, AX Share Menu, Showcase Modal, and QA/QC Calc Sheet Exporter (< 200 LOC).
import type { WorkbenchId } from '../../actions/view-screen';
import type { LocaleCode } from './locale-types';

export interface WorkbenchTabMeta {
  id: WorkbenchId;
  label: string;
  short: string;
}

export const SUBJECT_DEFAULT_FIGURE: Partial<Record<WorkbenchId, { secPage: string; exactValue: number }>> = {
  'wb2-thermo-dippr': { secPage: '2-53', exactValue: 101325 },
  'wb3-hydraulics': { secPage: '6-10', exactValue: 0.0045 },
  'wb4-distillation': { secPage: '14-37', exactValue: 0.082 },
  'wb6-kinetics-reactors': { secPage: '19-6', exactValue: 2.45 },
  'wb5-handbook-atlas': { secPage: '6-10', exactValue: 0.0045 },
};

const WORKBENCH_TABS_EN: ReadonlyArray<WorkbenchTabMeta> = [
  { id: 'wb2-thermo-dippr', label: 'Thermodynamics & Phase', short: "Perry's DIPPR · Smith-Van Ness-Abbott" },
  { id: 'wb3-hydraulics', label: 'Fluid & Transport Hydraulics', short: "BSL Transport · Perry's Sec 6/8/10" },
  { id: 'wb4-distillation', label: 'Separations & Distillation', short: "Seader 4th Ed. · Perry's Sec 13–16" },
  { id: 'wb6-kinetics-reactors', label: 'Kinetics & Reactor Design', short: "Fogler 7th Ed. · Perry's Sec 7/19 · Crowl" },
  { id: 'wb5-handbook-atlas', label: '6-Book & 25-Sec ChE Atlas', short: 'All 6 Textbooks & Perry Sec 1–25 Index' },
];

const WORKBENCH_TABS_VI: ReadonlyArray<WorkbenchTabMeta> = [
  { id: 'wb2-thermo-dippr', label: 'Nhiệt động & Cân bằng pha', short: "Perry's DIPPR · Smith-Van Ness-Abbott" },
  { id: 'wb3-hydraulics', label: 'Thủy lực & Truyền vận (BSL)', short: "BSL Transport · Perry's Sec 6/8/10" },
  { id: 'wb4-distillation', label: 'Quá trình Tách & Chưng cất', short: "Seader 4th Ed. · Perry's Sec 13–16" },
  { id: 'wb6-kinetics-reactors', label: 'Động học & Thiết kế Lò phản ứng', short: "Fogler 7th Ed. · Perry's Sec 7/19 · Crowl" },
  { id: 'wb5-handbook-atlas', label: 'Atlas 6 Sách & 25 Chương Perry', short: 'Toàn bộ 6 Giáo trình & Chỉ mục Perry 1–25' },
];

export function getWorkbenchTabs(locale: LocaleCode = 'en'): ReadonlyArray<WorkbenchTabMeta> {
  return locale === 'vi' ? WORKBENCH_TABS_VI : WORKBENCH_TABS_EN;
}

export const WORKBENCH_FRIENDLY_NAMES: Record<LocaleCode, Record<string, string>> = {
  en: {
    'wb1-visual-verifier': 'Calibrated Nomographs & Charts (WB1)',
    'wb2-thermo-dippr': 'Thermodynamics & DIPPR (WB2)',
    'wb3-hydraulics': 'Fluid & Piping Hydraulics (WB3)',
    'wb4-distillation': 'Separations & Distillation (WB4)',
    'wb6-kinetics-reactors': 'Kinetics & Reactor Design (WB6)',
    'wb5-handbook-atlas': '6-Book & 25-Sec ChE Atlas (WB5)',
  },
  vi: {
    'wb1-visual-verifier': 'Giản đồ & Tra cứu hiệu chuẩn (WB1)',
    'wb2-thermo-dippr': 'Nhiệt động học & DIPPR (WB2)',
    'wb3-hydraulics': 'Thủy lực Đường ống & Bơm (WB3)',
    'wb4-distillation': 'Quá trình Tách & Chưng cất (WB4)',
    'wb6-kinetics-reactors': 'Động học & Thiết kế Lò phản ứng (WB6)',
    'wb5-handbook-atlas': 'Atlas 6 Sách & 25 Chương Perry (WB5)',
  },
};

export const MISSION_BUTTON_LABELS_VI: Record<string, string> = {
  'mission-fanning-trap': 'Bắt bẫy ma sát 4× (Fanning vs Darcy)',
  'mission-boil-water': 'Đun sôi nước ở 100°C (psig vs psia)',
  'mission-pump-npsha': 'Kiểm tra Xâm thực Bơm (NPSHa)',
  'mission-distillation': 'Thiết kế Tháp Chưng cất 2 cấu tử',
  'mission-kinetics-runaway': 'Cứu Lò phản ứng thoát nhiệt & Khuếch tán lỗ xốp (Fogler)',
};

export interface ShellCopy {
  brandEyebrow: string;
  defaultVerifierLabel: string;
  labsSuffix: string;
  learnLabel: string;
  plantLabel: string;
  chartsBtn: string;
  calcSheetBtn: string;
  guideBtn: string;
  shareBtn: string;
  copyMarkdownLabel: string;
  viewMarkdownLabel: string;
  copyUrlLabel: string;
  copiedMarkdownToast: string;
  copiedUrlToast: string;
  missionLeadText: string;
  browseProblemsBtn: (count: number) => string;
  coachBtn: (open: boolean) => string;
  copilotHeader: string;
  socraticBadge: string;
  plantBadge: string;
  agentReadyLead: string;
  agentReadyTail: string;
  userRoleLabel: string;
  agentRoleLabel: string;
  appliedMutationPrefix: string;
  emptyChipTrayHint: string;
  clearAllChipsBtn: string;
  starterToggleBtn: (open: boolean) => string;
  askInputPlaceholder: string;
  sendBtn: string;
  calcModalTitle: string;
  closeBtn: string;
  compileCalcBtn: string;
  printPdfBtn: string;
  safetyPassPrefix: string;
  safetyFailPrefix: string;
}

const SHELL_EN: ShellCopy = {
  brandEyebrow: '6-Book ChE Solver · 55+ Charts · 24 Plant Problems',
  defaultVerifierLabel: 'Charts & Nomographs',
  labsSuffix: '5 Labs',
  learnLabel: 'Learn',
  plantLabel: 'Plant',
  chartsBtn: 'Charts',
  calcSheetBtn: 'Calc Sheet',
  guideBtn: 'Guide',
  shareBtn: 'Share / AI',
  copyMarkdownLabel: 'Copy Page (Markdown)',
  viewMarkdownLabel: 'View as Markdown',
  copyUrlLabel: 'Copy Canonical URL',
  copiedMarkdownToast: 'Copied Markdown',
  copiedUrlToast: 'Copied URL',
  missionLeadText: 'Start from a Real-Life Plant Problem (Fogler & LeBlanc 6-Stage Flow) · Realistic Composite Cases',
  browseProblemsBtn: (n) => `L1 · L2 · L3 · L4 · Browse All ${n} Problems ▾`,
  coachBtn: (open) => (open ? '▾ Less' : 'Coach ▾'),
  copilotHeader: 'AI Co-Pilot',
  socraticBadge: 'Socratic',
  plantBadge: 'Plant',
  agentReadyLead: 'Ready on',
  agentReadyTail: 'Drag any diagram handle, click + Ask on any control, or type a prompt to adjust the dials',
  userRoleLabel: 'You',
  agentRoleLabel: "ChemEng's Agent",
  appliedMutationPrefix: 'Applied to Workbench:',
  emptyChipTrayHint: 'Click any equation, chart, pipe, or stage (`+ Ask`) to attach context chips',
  clearAllChipsBtn: 'Clear all',
  starterToggleBtn: (open) => (open ? '▾ Hide Starters' : 'Starter Questions ▾'),
  askInputPlaceholder: 'Ask or tell Agent to change dials',
  sendBtn: 'Send',
  calcModalTitle: 'Senior-Engineer QA/QC Calculation Sheet Exporter · Preliminary Educational Screening',
  closeBtn: 'Close',
  compileCalcBtn: 'Compile & Save QA/QC Calc Sheet',
  printPdfBtn: 'Print-to-PDF (@media print)',
  safetyPassPrefix: 'SAFETY AUDIT: PASS',
  safetyFailPrefix: 'SAFETY AUDIT: ACTION REQUIRED',
};

const SHELL_VI: ShellCopy = {
  brandEyebrow: 'Bộ giải 6 Giáo trình ChE · 55+ Đồ thị · 24 Sự cố Nhà máy',
  defaultVerifierLabel: 'Giản đồ & Tra cứu',
  labsSuffix: '5 Phòng Lab',
  learnLabel: 'Học tập',
  plantLabel: 'Nhà máy',
  chartsBtn: 'Đồ thị',
  calcSheetBtn: 'Bản tính',
  guideBtn: 'Hướng dẫn',
  shareBtn: 'Chia sẻ',
  copyMarkdownLabel: 'Sao chép trang (Markdown)',
  viewMarkdownLabel: 'Xem dạng Markdown',
  copyUrlLabel: 'Sao chép URL chuẩn',
  copiedMarkdownToast: 'Đã chép Markdown',
  copiedUrlToast: 'Đã chép URL',
  missionLeadText: 'Bắt đầu từ Sự cố Nhà máy Thực tế (Quy trình 6 bước Fogler & LeBlanc) · Kịch bản Tổng hợp Đào tạo',
  browseProblemsBtn: (n) => `L1 · L2 · L3 · L4 · Duyệt ${n} Sự cố Nhà máy ▾`,
  coachBtn: (open) => (open ? '▾ Thu gọn' : 'Gia sư ▾'),
  copilotHeader: 'Trợ lý AI Co-Pilot',
  socraticBadge: 'Socratic',
  plantBadge: 'Nhà máy',
  agentReadyLead: 'Sẵn sàng tại',
  agentReadyTail: 'Kéo điểm nút trên đồ thị, bấm + Ask ở thanh trượt, hoặc nhập lệnh tiếng Việt để chỉnh thông số',
  userRoleLabel: 'Bạn',
  agentRoleLabel: 'Trợ lý ChE',
  appliedMutationPrefix: 'Đã áp dụng lên Bàn làm việc:',
  emptyChipTrayHint: 'Bấm vào phương trình, đồ thị, đường ống hoặc đĩa tháp (`+ Ask`) để gắn thẻ ngữ cảnh',
  clearAllChipsBtn: 'Xóa hết',
  starterToggleBtn: (open) => (open ? '▾ Ẩn gợi ý' : 'Câu hỏi gợi ý ▾'),
  askInputPlaceholder: 'Hỏi hoặc ra lệnh bằng tiếng Việt/Anh để chỉnh thông số',
  sendBtn: 'Gửi',
  calcModalTitle: 'Xuất Bản tính Kiểm định QA/QC Kỹ sư Trưởng (EPC) · Sàng lọc Sơ bộ',
  closeBtn: 'Đóng',
  compileCalcBtn: 'Biên dịch & Lưu Bản tính QA/QC',
  printPdfBtn: 'In ra PDF (@media print)',
  safetyPassPrefix: 'KIỂM ĐỊNH AN TOÀN: ĐẠT (PASS)',
  safetyFailPrefix: 'KIỂM ĐỊNH AN TOÀN: CẦN XỬ LÝ (ACTION REQUIRED)',
};

export function getShellCopy(locale: LocaleCode = 'en'): ShellCopy {
  return locale === 'vi' ? SHELL_VI : SHELL_EN;
}
