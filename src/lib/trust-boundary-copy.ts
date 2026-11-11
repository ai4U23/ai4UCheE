/**
 * Trust, Scope & Boundary Disclosures (`P5` & `P6`).
 * Provides bilingual copy for:
 *  1. Educational & Preliminary Engineering Boundary (stamped on calculation sheets & UI)
 *  2. Local Browser Demo Profile disclosure (`localStorage` vs anonymous SQLite calculation sheets)
 *  3. 6-Book Index & Case Provenance disclosure
 */

import type { LocaleCode } from '../context/persona-theme-context';
import { isEmbedSession } from './embed-token-store';

export const TRUST_BOUNDARY_COPY: Record<
  LocaleCode,
  {
    engineeringBoundaryTitle: string;
    engineeringBoundaryBody: string;
    localDemoProfileBadge: string;
    localDemoProfileTooltip: string;
    corpusProvenanceNotice: string;
    calcSheetPersistenceNote: string;
    screeningQualifierBadge: string;
    wbAssumptions: Record<'wb2' | 'wb3' | 'wb4' | 'wb5' | 'wb6', string>;
    supportPrivacyNote: string;
    deleteSavedSheetsLabel: string;
    deletedSavedSheetsToast: string;
  }
> = {
  en: {
    engineeringBoundaryTitle: 'Educational & Preliminary Engineering Boundary',
    engineeringBoundaryBody:
      'Calculations use deterministic textbook correlations (DIPPR, Churchill, McCabe-Thiele, Fogler) for undergraduate instruction and preliminary screening. Not a substitute for licensed PE sign-off, relief-device sizing (API 520/521), or HAZOP/SIL certification.',
    localDemoProfileBadge: 'Local Browser Demo · localStorage only',
    // Embed (PVU/SharePoint) sessions must show zero ai4u.now hostnames — the student's browser
    // talks same-origin /api/copilot; the base variant stays verbatim for the AWS host (ak-fix 261111).
    get localDemoProfileTooltip() {
      return isEmbedSession()
        ? 'Practice points (+35 pts DIY / +12 pts Assisted) and student profile live only in this browser (localStorage). Exported calculation sheets persist privately per browser (pseudonymous client id) in the class workbench server database (saved_calculations). AI Co-Pilot prompts send only prompt text + <current-screen> numerical state to the class co-pilot relay server (ephemeral, zero personal identifiers, local fallback if offline).'
        : 'Practice points (+35 pts DIY / +12 pts Assisted) and student profile live only in this browser (localStorage). Exported calculation sheets persist privately per browser (pseudonymous client id) in local SQLite (saved_calculations). AI Co-Pilot prompts send only prompt text + <current-screen> numerical state to gateway.ai4u.now (ephemeral, zero personal identifiers, local fallback if offline).';
    },
    corpusProvenanceNotice:
      'Curated 6-book index & pedagogical problem bank mapped to published chapter/section coordinates; the 24 industrial failure narratives are realistic educational composites. No copyrighted textbook PDFs/EPUBs are hosted or distributed.',
    calcSheetPersistenceNote:
      'Saved calculation sheets are stored privately per browser (pseudonymous client id) in the local SQLite database (saved_calculations) with SHA-256 input-to-output provenance.',
    screeningQualifierBadge: 'Preliminary Educational Screening Only · Not PE / API / HAZOP Sign-Off',
    wbAssumptions: {
      wb2: 'Assumptions: Pure-component DIPPR Eq. 101/105 & ideal/activity-coefficient VLE; preliminary educational screening only.',
      wb3: 'Assumptions: Steady incompressible liquid, commercial steel Sch 40/80, Churchill Darcy f_D = 4·f_F; preliminary screening only (not PE sign-off).',
      wb4: 'Assumptions: Constant molar overflow (CMO), constant α McCabe-Thiele stages & Fair Souders-Brown correlation; preliminary screening only.',
      wb5: 'Assumptions: Textbook correlation & single-mode API 520/Bowman screening; not for final relief-valve or pressure-vessel certification.',
      wb6: 'Assumptions: Ideal CSTR/PFR flow, 1st-order Thiele slab & lumped Semenov heat balance; preliminary educational screening only (not HAZOP/SIL sign-off).',
    },
    get supportPrivacyNote() {
      // Embed variant drops the maintainer/support/github line (all ai4u.now) — support is the
      // SharePoint class page; the relay is the class server.
      return isEmbedSession()
        ? 'AI Co-Pilot Data Flow: Sliders run 100% locally; Co-Pilot chat sends only prompt text & numerical <current-screen> state to the class co-pilot relay server (ephemeral, zero personal identifiers, local deterministic fallback). Operated on PVU servers; support & privacy are handled via the SharePoint class page.'
        : 'AI Co-Pilot Data Flow: Sliders run 100% locally; Co-Pilot chat sends only prompt text & numerical <current-screen> state to gateway.ai4u.now (ephemeral, zero personal identifiers, local deterministic fallback). Maintained by AI4U.now Engineering Education Team · Support & privacy: support@ai4u.now · github.com/ai4U23/ai4UCheE/issues';
    },
    deleteSavedSheetsLabel: '🗑️ Delete Saved SQLite Sheets',
    deletedSavedSheetsToast: "Deleted this browser's saved calculation sheets from local SQLite (saved_calculations) — other browsers keep theirs.",
  },
  vi: {
    engineeringBoundaryTitle: 'Ranh giới Giáo dục & Kỹ thuật Sơ bộ',
    engineeringBoundaryBody:
      'Các phép tính sử dụng phương trình giáo trình tất định (DIPPR, Churchill, McCabe-Thiele, Fogler) phục vụ giảng dạy đại học và sàng lọc sơ bộ. Không thay thế phê duyệt Kỹ sư Chuyên nghiệp (PE), tính van an toàn (API 520/521) hoặc chứng nhận HAZOP/SIL.',
    localDemoProfileBadge: 'Bản Demo Trình duyệt Cục bộ · chỉ lưu localStorage',
    get localDemoProfileTooltip() {
      return isEmbedSession()
        ? 'Điểm luyện tập (+35 đ Tự giải / +12 đ Có gợi ý) và hồ sơ sinh viên chỉ lưu trên trình duyệt này (localStorage). Phiếu tính toán xuất ra được lưu riêng tư theo từng trình duyệt (mã định danh ẩn danh) trong cơ sở dữ liệu máy chủ của lớp (saved_calculations). Khi hỏi AI Co-Pilot, chỉ câu hỏi và thông số số học <current-screen> được gửi tạm thời tới trình trung chuyển Co-Pilot trên máy chủ của lớp (không kèm định danh cá nhân).'
        : 'Điểm luyện tập (+35 đ Tự giải / +12 đ Có gợi ý) và hồ sơ sinh viên chỉ lưu trên trình duyệt này (localStorage). Phiếu tính toán xuất ra được lưu riêng tư theo từng trình duyệt (mã định danh ẩn danh) trong SQLite cục bộ (saved_calculations). Khi hỏi AI Co-Pilot, chỉ câu hỏi và thông số số học <current-screen> được gửi tạm thời tới gateway.ai4u.now (không kèm định danh cá nhân).';
    },
    corpusProvenanceNotice:
      'Chỉ mục 6 giáo trình & ngân hàng bài tập sư phạm được ánh xạ tới tọa độ chương/mục xuất bản; 24 tình huống sự cố nhà máy là kịch bản tổng hợp sát thực tế phục vụ đào tạo. Không lưu trữ hay phân phối tệp PDF/EPUB có bản quyền.',
    calcSheetPersistenceNote:
      'Phiếu tính toán được lưu riêng tư theo từng trình duyệt (mã định danh ẩn danh) trong cơ sở dữ liệu SQLite cục bộ (saved_calculations) kèm mã băm xuất xứ SHA-256.',
    screeningQualifierBadge: 'Chỉ Sàng lọc Giáo dục Sơ bộ · Không thay thế phê duyệt PE / API / HAZOP',
    wbAssumptions: {
      wb2: 'Giả thiết: Phương trình DIPPR 101/105 cấu tử tinh khiết & VLE lý tưởng/hoạt độ; chỉ dùng sàng lọc giáo dục sơ bộ.',
      wb3: 'Giả thiết: Lưu chất không nén được ổn định, ống thép Sch 40/80, Churchill Darcy f_D = 4·f_F; chỉ sàng lọc sơ bộ (không thay thế PE).',
      wb4: 'Giả thiết: Lưu lượng mol không đổi (CMO), độ bay hơi α hằng số McCabe-Thiele & ngập lụt Fair; chỉ sàng lọc sơ bộ.',
      wb5: 'Giả thiết: Tương quan giáo trình & sàng lọc sơ bộ API 520/Bowman; không dùng phê duyệt van an toàn hay thiết bị chịu áp.',
      wb6: 'Giả thiết: Dòng lý tưởng CSTR/PFR, Thiele bậc 1 & cân bằng nhiệt gộp Semenov; chỉ sàng lọc giáo dục sơ bộ (không thay thế HAZOP/SIL).',
    },
    get supportPrivacyNote() {
      return isEmbedSession()
        ? 'Dữ liệu AI Co-Pilot: Thanh trượt chạy 100% cục bộ; chat Co-Pilot chỉ gửi câu hỏi & trạng thái số học <current-screen> tới trình trung chuyển Co-Pilot trên máy chủ của lớp (xử lý tạm thời, không lưu định danh cá nhân, có bộ giải dự phòng cục bộ). Vận hành trên máy chủ riêng của PVU; hỗ trợ & quyền riêng tư qua trang SharePoint của lớp.'
        : 'Dữ liệu AI Co-Pilot: Thanh trượt chạy 100% cục bộ; chat Co-Pilot chỉ gửi câu hỏi & trạng thái số học <current-screen> tới gateway.ai4u.now (xử lý tạm thời, không lưu định danh cá nhân, có bộ giải dự phòng cục bộ). Vận hành bởi Nhóm Giáo dục Kỹ thuật AI4U.now · Hỗ trợ & quyền riêng tư: support@ai4u.now · github.com/ai4U23/ai4UCheE/issues';
    },
    deleteSavedSheetsLabel: '🗑️ Xóa Phiếu tính SQLite đã lưu',
    deletedSavedSheetsToast: 'Đã xóa các phiếu tính toán của trình duyệt này trong SQLite cục bộ (saved_calculations) — trình duyệt khác không bị ảnh hưởng.',
  },
};
