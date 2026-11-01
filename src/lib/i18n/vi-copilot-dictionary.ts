// Vietnamese (`vi`) Co-Pilot tutoring knowledge, starter prompts, quick actions, Socratic/Challenge
// hints, and natural-language What-If scenario extractors (< 200 LOC).
import type { WorkbenchId } from '../../actions/view-screen';
import type { LocaleCode } from './locale-types';

export type CopilotIntent = 'wb2-thermo' | 'wb3-hydraulics' | 'wb4-distillation' | 'wb6-kinetics' | 'wb1-charts';

export const STARTER_PROMPTS_VI: Record<WorkbenchId, readonly string[]> = {
  'wb1-visual-verifier': [
    'Tại sao hệ số Moody f_D = 4 × Fanning f_F?',
    'Làm sao đọc Hình 6-9 tại Re = 10⁵?',
    'Hiển thị chứng minh phương trình Perry hộp trắng',
  ],
  'wb2-thermo-dippr': [
    'Tại sao phải đổi psig sang psia trước tiên?',
    'Tại sao phương trình Wilson thất bại với cân bằng lỏng-lỏng (LLE)?',
    'Chứng minh phương trình DIPPR Eq. 101 tại 100 °C',
  ],
  'wb3-hydraulics': [
    'Bơm P-101 có an toàn khỏi xâm thực (NPSHa) không?',
    'Kiểm tra van điều khiển có bị nghẽn dòng (ISA-75.01) không?',
    'So sánh 3 chế độ lưu lượng 70% / 100% / 120%',
  ],
  'wb4-distillation': [
    'Tỷ số hồi lưu R/R_min ảnh hưởng tới ngập lụt tháp thế nào?',
    'Giải thích độ dốc đường q-line cho lỏng sôi bão hòa',
    'Trình bày công thức Fenske N_min & Underwood R_min',
  ],
  'wb6-kinetics-reactors': [
    'Tại sao thể tích CSTR lớn hơn PFR trên đồ thị Levenspiel (Fogler Ch. 2)?',
    'Mô-đun Thiele φ giới hạn hệ số hữu hiệu xúc tác η thế nào (Fogler Ch. 15 / BSL Ch. 18)?',
    'Giải thích giới hạn thoát nhiệt Semenov ψ_crit = 1/e (Crowl & Louvar Ch. 8)',
  ],
  'wb5-handbook-atlas': [
    'Kiểm tra Mục 11 giao cắt nhiệt độ LMTD tại P=0.72, R=1.6',
    'Kiểm tra Mục 19 CSTR so với PFR & tiêu chuẩn thoát nhiệt Semenov',
    'Kiểm tra Mục 23 tính van an toàn API 520 tại 150 psig',
  ],
};

export const QUICK_ACTIONS_VI: Record<WorkbenchId, readonly string[]> = {
  'wb1-visual-verifier': ['Sửa giá trị đọc đồ thị về chuẩn Perry (0.0045)'],
  'wb2-thermo-dippr': ['Đổi sang Ethanol @ 351.5 K'],
  'wb3-hydraulics': ['Sửa xâm thực bơm (ống 6 in, 15 psig)'],
  'wb4-distillation': ['Chống ngập tháp chưng cất (R = 1.3 × Rmin, D = 0.85 m)'],
  'wb6-kinetics-reactors': ['Cứu lò phản ứng thoát nhiệt (X = 0.80, φ = 1.1, ψ = 0.24)'],
  'wb5-handbook-atlas': ['Kiểm tra Mục 23 van an toàn tại 150 psig'],
};

export const SOCRATIC_HINTS_VI: Record<WorkbenchId, string> = {
  'wb1-visual-verifier':
    '🕵️ Gợi ý Socratic (Perry Fig. 6-9, p. 6-10): Đối chiếu giá trị đọc của bạn với nhãn trục tung — Perry vẽ hệ số Fanning f_F hay Moody Darcy f_D = 4·f_F? Hệ số nào tách biệt 0.0180 và 0.0045?',
  'wb2-thermo-dippr':
    '🕵️ Gợi ý Socratic (Perry Table 2-8, p. 2-53 & SVNA Ch. 12): Trước khi kiểm tra điểm sôi, hãy đổi áp suất dư qua psia = psig + 14.696. Tại 373.15 K (100 °C), P_vp(nước) bằng bao nhiêu psia so với psig?',
  'wb3-hydraulics':
    '🕵️ Gợi ý Socratic (Perry Sec. 10, p. 10-28): Hãy nhìn tử số NPSHa (P_suc,abs - P_vp)/(ρg). Khi pSuctionPsig < 0, điều gì xảy ra với P_suc,abs = psig + 14.696 psia và biên dự trữ xâm thực 1.0 m?',
  'wb4-distillation':
    '🕵️ Gợi ý Socratic (Perry Sec. 13, p. 13-36 & Fig. 14-32): Nếu vận tốc hơi vượt 85% giới hạn ngập Fair, hai thông số nào giúp giảm vận tốc hơi bề mặt u_v mà không làm giảm độ tinh khiết đỉnh x_D?',
  'wb6-kinetics-reactors':
    '🕵️ Gợi ý Socratic (Fogler 7th Ed., Ch. 12 & 15; Crowl Ch. 8): Kiểm tra 2 chuẩn số vô thứ nguyên — mô-đun Thiele φ ≤ 2 (để η ≥ 0.75) và số Semenov ψ ≤ 1/e ≈ 0.368 đã đạt chưa?',
  'wb5-handbook-atlas':
    '🕵️ Gợi ý Socratic (Perry Sec. 1–25): Kiểm tra trích dẫn chương hiện hành xem quy đổi áp suất tuyệt đối (+14.696 psia) hay giao cắt nhiệt độ (F_T ≥ 0.75) đang giới hạn điểm vận hành.',
};

export const CHALLENGE_PROBES_VI: Record<WorkbenchId, string> = {
  'wb1-visual-verifier':
    '🏆 Thử thách Chuyên sâu (BSL Ch. 6 & Perry p. 6-10): Trong vùng chảy rối hoàn toàn nhám (Re > 10⁶), tại sao f_F không phụ thuộc Re nhưng ΔP vẫn tỷ lệ với v²?',
  'wb2-thermo-dippr':
    '🏆 Thử thách Chuyên sâu (SVNA Ch. 12 & Perry Sec. 4): Tại sao mô hình Wilson G^E không thể dự đoán tách pha lỏng-lỏng (LLE), buộc phải dùng NRTL (α_12) hoặc UNIQUAC?',
  'wb3-hydraulics':
    '🏆 Thử thách Chuyên sâu (Perry Sec. 8 & 10): Tăng đường kính ống hút từ 4" lên 6" giúp tăng NPSHa, nhưng việc giảm ΔP đường ống làm dịch chuyển tỷ số sụt áp qua van điều khiển và biên nghẽn dòng ISA-75.01 thế nào?',
  'wb4-distillation':
    '🏆 Thử thách Chuyên sâu (Seader Ch. 7 & 9): Giảm R/R_min từ 1.9 xuống 1.3 giúp hết ngập đĩa, nhưng làm thay đổi số bậc lý thuyết N (Gilliland) và tải nhiệt nồi đun/ngưng tụ ra sao?',
  'wb6-kinetics-reactors':
    '🏆 Thử thách Chuyên sâu (Fogler Ch. 5 & 15): Nghiền nhỏ hạt xúc tác giúp giảm mô-đun Thiele φ (tăng η → 1), nhưng phương trình Ergun sẽ phạt độ sụt áp lớp xúc tác y = P/P_0 nặng thế nào?',
  'wb5-handbook-atlas':
    '🏆 Thử thách Chuyên sâu (Perry Sec. 11 & 23): Kết hợp phân tích giao cắt nhiệt độ thiết bị trao đổi nhiệt (Bowman F_T < 0.75) với tính toán van an toàn API 520 khi đóng kẹt đầu ra.',
};

export const TIER1_VI_KNOWLEDGE: Record<CopilotIntent, { learn: string; plant: string }> = {
  'wb2-thermo': {
    learn:
      'Nước sôi ở 100 °C = 373.15 K. Phương trình DIPPR Eq. 101 (hằng số Perry Table 2-8) cho P_vp = 101,325 Pa — áp suất hơi cân bằng đúng 1 atm (điểm sôi thường).\n1) Áp suất dư (psig) đo so với khí quyển; áp suất tuyệt đối (psia) đo từ chân không tuyệt đối.\n2) Quy đổi: psia = psig + 14.696, nên 101,325 Pa = 14.70 psia = 0.00 psig tại điểm sôi.\n3) Tuyệt đối không dùng phương trình Wilson cho cân bằng lỏng-lỏng LLE (Smith, Van Ness & Abbott Ch. 12): hàm G^E của Wilson luôn chỉ cho 1 pha lỏng duy nhất — hãy dùng NRTL hoặc UNIQUAC.',
    plant:
      'Kiểm định EPC: T = 373.15 K → P_vp(water) = 101,325 Pa = 14.70 psia = 0.00 psig (psia = psig + 14.696).\nBiên thiết kế: áp suất thiết kế phải lớn hơn P_vp tại nhiệt độ vận hành cực đại.\nLLE: Wilson G^E không thể dự đoán tách 2 pha lỏng — phải chạy lại bằng NRTL/UNIQUAC.',
  },
  'wb3-hydraulics': {
    learn:
      '1) Perry & Bird-Stewart-Lightfoot công bố HAI hệ số ma sát: Fanning f_F và Darcy f_D — lệch nhau đúng 4 lần (f_D = 4·f_F).\n2) Tổn thất cột áp dùng hệ số Darcy: h_f = f_D (L/D) v²/(2g). Nhầm lẫn quy ước sẽ làm sai lệch ΔP gấp 4×.\n3) Chống xâm thực (Cavitation): NPSHa phải lớn hơn NPSHr tối thiểu 1.0 m, nếu không chất lỏng sẽ hóa hơi và phá hủy cánh bơm.\n4) Hệ số van Cv: quy đổi đơn vị chuẩn trước khi tính — chọn sai Cv sẽ làm ngập hoặc đói lưu lượng vòng điều khiển.',
    plant:
      'Kiểm định EPC: f_D = 4·f_F (không trộn lẫn quy ước); h_f = f_D (L/D) v²/(2g) theo Eqs. 6-37..6-39.\nBiên an toàn: yêu cầu NPSHa ≥ NPSHr + 1.0 m tại lưu lượng và nhiệt độ cực đại.\nKiểm tra Cv van điều khiển tại độ mở thiết kế trước khi phát hành datasheet.',
  },
  'wb4-distillation': {
    learn:
      '1) N_min tính theo công thức Fenske ở hồi lưu hoàn toàn (Seader Ch. 9): tỷ số logarit độ phân tách chia cho log(α_AB).\n2) R_min tính từ phương trình Underwood, phụ thuộc trực tiếp vào trạng thái nhiệt nhập liệu q.\n3) q = 1 là lỏng sôi bão hòa, q = 0 là hơi bão hòa; q quyết định độ dốc đường q-line trên đồ thị McCabe-Thiele (Seader Ch. 7).\n4) Giới hạn công suất: tương quan ngập lụt cuốn theo của Fair (Perry Fig. 14-32) giới hạn vận tốc hơi cực đại.',
    plant:
      'Kiểm định EPC: chặn biên thiết kế bằng N_min (Fenske) và R_min (Underwood với trạng thái nhiệt q).\nBiên vận hành: chọn R ≈ 1.2–1.5 × R_min và giữ tải hơi ≤ 80 % giới hạn ngập Fair (Fig. 14-32).',
  },
  'wb6-kinetics': {
    learn:
      '1) Trên đồ thị Levenspiel F_A0/(-r_A) theo X của Fogler, thiết bị CSTR vận hành tại nồng độ đầu ra (diện tích hình chữ nhật), trong khi PFR tích phân dọc theo đường cong (diện tích dưới đường cong).\n2) Lò phản ứng lớp xúc tác cố định pha khí (PBR) chịu cả giãn nở thể tích ε_A và độ sụt áp Ergun y = P/P_0 (luôn đổi psig → psia + 14.696 trước).\n3) Trong hạt xúc tác xốp (Fogler Ch. 15 & BSL Ch. 18), mô-đun Thiele lớn φ > 2 làm lõi hạt thiếu chất phản ứng và kéo tụt hệ số hữu hiệu η.\n4) Lò phản ứng không đẳng nhiệt (Fogler Ch. 12 & Crowl Ch. 8) phải giữ số Semenov ψ ≤ ψ_crit = 1/e ≈ 0.368 để tránh thoát nhiệt (thermal runaway).',
    plant:
      'Kiểm định EPC: đổi P_in(psig) + 14.696 → psia trước khi tính nồng độ khí C_A0 và tỷ số áp suất Ergun y = P/P_0.\nXác minh hệ số hữu hiệu xúc tác η = (3/φ²)(φ coth φ - 1) và giữ số Semenov ψ ≤ 0.368 (Crowl & Louvar Ch. 8).',
  },
  'wb1-charts': {
    learn:
      '1) Giản đồ ma sát log-log của Perry: mỗi bậc thập phân là một lũy thừa của 10 — hãy đếm vạch lưới trước khi nội suy.\n2) Tra theo số Reynolds trên trục hoành và độ nhám tương đối ε/D để chọn họ đường cong.\n3) Bẫy kinh điển: Perry Fig. 6-9 và BSL Ch. 6 định nghĩa hệ số Fanning f_F, còn giản đồ Moody vẽ hệ số Darcy f_D — chênh nhau đúng 4× (f_D = 4·f_F).\n4) Nếu ΔP của bạn lệch đúng 4 lần, chắc chắn bạn đã trộn lẫn hai quy ước Fanning và Darcy.',
    plant:
      'Kiểm định EPC: đọc f_F từ Fig. 6-9 tại đúng Re và ε/D (quy ước Fanning), sau đó nhân f_D = 4·f_F cho công thức h_f = f_D (L/D) v²/(2g).\nBiên kiểm soát: sai lệch ΔP gấp 4× là dấu hiệu nhầm lẫn Fanning/Darcy (f_D = 4·f_F) — cần tính lại trước khi ký duyệt.',
  },
};

export function formatCopilotReplyBody(args: {
  locale: LocaleCode;
  personaMode: 'learn' | 'plant';
  scaffoldingLevel: string;
  coachingBlock: string;
  learnText: string;
  plantText: string;
  activeWorkbench: string;
  liveReply: string;
  citations: string[];
}): string {
  const { locale, personaMode, scaffoldingLevel, coachingBlock, learnText, plantText, activeWorkbench, liveReply, citations } = args;
  const tail = `Citations: ${citations.join(' | ')}`;
  const base =
    personaMode === 'learn'
      ? locale === 'vi'
        ? `Trực giác Sinh viên (${scaffoldingLevel.toUpperCase()}):\n${coachingBlock}\n\n${learnText}`
        : `Student Intuition (${scaffoldingLevel.toUpperCase()}):\n${coachingBlock}\n\n${learnText}`
      : locale === 'vi'
        ? `Kiểm định Kỹ sư EPC:\n${plantText}\n${coachingBlock}\nSynced with <current-screen workbench="${activeWorkbench}" personaMode="${personaMode}" locale="vi">`
        : `EPC Verification:\n${plantText}\n${coachingBlock}\nSynced with <current-screen workbench="${activeWorkbench}" personaMode="${personaMode}">`;
  return liveReply ? `${liveReply}\n\n${base}\n\n${tail}` : `${base}\n\n${tail}`;
}
