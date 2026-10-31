// Shared Sovereign Design System tokens for the ai4UCheE Remotion Guide Video.
// Zero CSS transitions or Tailwind animation classes (strictly driven by useCurrentFrame).

export const VIDEO_TOKENS = {
  navyDeep: '#071a33',
  navy: '#0f1b3d',
  navyMid: '#1e2f5c',
  maize: '#e8c547',
  maizeSoft: '#f7dca6',
  ivory: '#fbf6ec',
  paper: '#f5f0e0',
  white: '#ffffff',
  borderGrid: '#dfd6c0',
  inkMuted: '#3b455d',
  pass: '#15803d',
  warn: '#b45309',
  danger: '#b91c1c',
  fontDisplay: "'Cormorant Garamond', Georgia, serif",
  fontSans: "'Karla', -apple-system, BlinkMacSystemFont, sans-serif",
  fontMono: "'JetBrains Mono', Menlo, monospace",
} as const;

export type GuideCompositionProps = {
  title: string;
  subtitle: string;
  siteUrl: string;
  bilingualSubtitles: boolean;
};

export const SCENE_META: ReadonlyArray<{
  step: string;
  titleEn: string;
  titleVi: string;
  captionEn: string;
  captionVi: string;
}> = [
  {
    step: 'STEP 01 / 05 · 3-ZONE STUDIO',
    titleEn: '1 Bar · 1 Canvas · 1 AI Co-Pilot',
    titleVi: '1 Thanh Điều Hướng · 1 Khung Mô Phỏng · 1 Trợ Lý AI',
    captionEn: '6 canonical ChE textbooks blended into an instant, zero-hallucination engineering studio.',
    captionVi: 'Hợp nhất 6 giáo trình Kỹ thuật Hóa học kinh điển trong một bàn làm việc tương tác thời gian thực.',
  },
  {
    step: 'STEP 02 / 05 · DUAL LENS & 5 SUBJECT LABS',
    titleEn: 'Switch 🎓 Learn Mode ↔ 🏭 Plant Mode Across 5 Subject Labs',
    titleVi: 'Chuyển Đổi 🎓 Chế Độ Học ↔ 🏭 Chế Độ Nhà Máy Trên 5 Chuyên Ngành',
    captionEn: 'Toggle Socratic intuition or 3-case EPC runs across Thermo, Hydraulics, Separations, Kinetics & the 25-Sec Atlas.',
    captionVi: 'Chuyển nhanh giữa gợi ý Socratic và bảng tính 3 chế độ tải EPC trên 5 phân ngành cốt lõi.',
  },
  {
    step: 'STEP 03 / 05 · 24 PLANT PROBLEMS & FOGLER 6-STAGE FLOW',
    titleEn: 'Launch Real-Life Plant Upsets (🌱 L1 → 🚨 L4)',
    titleVi: 'Giải Quyết 24 Bài Toán Sự Cố Nhà Máy Thực Tế (🌱 L1 → 🚨 L4)',
    captionEn: 'Diagnose telemetry, apply Kepner-Tregoe IS/IS NOT, and Prove ✅ / Disprove ❌ hypotheses (Fogler Rule #12).',
    captionVi: 'Phân tích số liệu vận hành, định nghĩa K-T IS/IS NOT và Kiểm chứng ✅ / Bác bỏ ❌ giả thuyết (Quy tắc #12).',
  },
  {
    step: 'STEP 04 / 05 · INTERACTIVE SVG & 3-STAGE WHITE-BOX PROOFS',
    titleEn: 'Scrub 55+ Live SVG Charts & Verify Every Unit',
    titleVi: 'Kéo-Thả 55+ Đồ Thị SVG & Kiểm Chứng Công Thức 3 Bước',
    captionEn: 'Drag operating points with automatic guardrails for Fanning vs. Darcy (f_D = 4·f_F) and psig ↔ psia.',
    captionVi: 'Kéo điểm làm việc trực tiếp kèm chốt chặn an toàn tự động cho f_D = 4·f_F và áp suất dư psig ↔ psia.',
  },
  {
    step: 'STEP 05 / 05 · AI CO-PILOT & SENIOR EPC QA/QC CALC SHEET',
    titleEn: 'Point-and-Ask (+ Ask), What-If Mutations & Rev 0 Export',
    titleVi: 'Gắn Thẻ (+ Ask), Giả Định What-If & Xuất Bản Tính QA/QC EPC',
    captionEn: 'Click any equipment chip to ask the Co-Pilot, mutate sliders in plain English, and compile a QA/QC sheet.',
    captionVi: 'Chọn thiết bị để hỏi AI, điều chỉnh thông số bằng ngôn ngữ tự nhiên và xuất hồ sơ tính toán chuẩn EPC.',
  },
];
