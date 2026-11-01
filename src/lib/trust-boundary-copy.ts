/**
 * Trust, Scope & Boundary Disclosures (`P5` & `P6`).
 * Provides bilingual copy for:
 *  1. Educational & Preliminary Engineering Boundary (stamped on calculation sheets & UI)
 *  2. Local Browser Demo Profile disclosure (`localStorage` vs anonymous SQLite calculation sheets)
 *  3. 6-Book Index & Case Provenance disclosure
 */

import type { LocaleCode } from '../context/persona-theme-context';

export const TRUST_BOUNDARY_COPY: Record<
  LocaleCode,
  {
    engineeringBoundaryTitle: string;
    engineeringBoundaryBody: string;
    localDemoProfileBadge: string;
    localDemoProfileTooltip: string;
    corpusProvenanceNotice: string;
    calcSheetPersistenceNote: string;
  }
> = {
  en: {
    engineeringBoundaryTitle: 'Educational & Preliminary Engineering Boundary',
    engineeringBoundaryBody:
      'Calculations use deterministic textbook correlations (DIPPR, Churchill, McCabe-Thiele, Fogler) for undergraduate instruction and preliminary screening. Not a substitute for licensed PE sign-off, relief-device sizing (API 520/521), or HAZOP/SIL certification.',
    localDemoProfileBadge: 'Local Browser Demo · localStorage only',
    localDemoProfileTooltip:
      'Practice points (+35 pts DIY / +12 pts Assisted) and student profile live only in this browser (localStorage). Exported calculation sheets persist anonymously in local SQLite (saved_calculations).',
    corpusProvenanceNotice:
      'Curated 6-book index & pedagogical problem bank mapped to published chapter/section coordinates; industrial failure narratives are educational composites.',
    calcSheetPersistenceNote:
      'Saved calculation sheets are stored anonymously in the local SQLite database (saved_calculations) with SHA-256 input-to-output provenance.',
  },
  vi: {
    engineeringBoundaryTitle: 'Ranh giới Giáo dục & Kỹ thuật Sơ bộ',
    engineeringBoundaryBody:
      'Các phép tính sử dụng phương trình giáo trình tất định (DIPPR, Churchill, McCabe-Thiele, Fogler) phục vụ giảng dạy đại học và sàng lọc sơ bộ. Không thay thế phê duyệt Kỹ sư Chuyên nghiệp (PE), tính van an toàn (API 520/521) hoặc chứng nhận HAZOP/SIL.',
    localDemoProfileBadge: 'Bản Demo Trình duyệt Cục bộ · chỉ lưu localStorage',
    localDemoProfileTooltip:
      'Điểm luyện tập (+35 đ Tự giải / +12 đ Có gợi ý) và hồ sơ sinh viên chỉ lưu trên trình duyệt này (localStorage). Phiếu tính toán xuất ra được lưu ẩn danh trong SQLite cục bộ (saved_calculations).',
    corpusProvenanceNotice:
      'Chỉ mục 6 giáo trình & ngân hàng bài tập sư phạm được ánh xạ tới tọa độ chương/mục xuất bản; các tình huống sự cố nhà máy là kịch bản tổng hợp phục vụ đào tạo.',
    calcSheetPersistenceNote:
      'Phiếu tính toán lưu trữ ẩn danh trong cơ sở dữ liệu SQLite cục bộ (saved_calculations) kèm mã băm xuất xứ SHA-256.',
  },
};
