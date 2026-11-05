// A2 consequence predictions (decision A2, plan 261105-1411): neutral "if correct →
// we'd observe" statements shown on tree branches BEFORE verdict. No verdict keywords (unit-tested).
import type { LocaleCode } from '../context/persona-theme-context';
import { PROBLEM_CONSEQUENCES_A } from './problem-consequence-copy-a';
import { PROBLEM_CONSEQUENCES_B } from './problem-consequence-copy-b';

export type ConsequenceText = Record<LocaleCode, string>;

export const FLAGSHIP_CONSEQUENCES: Readonly<Record<string, ConsequenceText>> = {
  // — case-wb1-fanning-audit (Perry Fig. 6-9 Fanning vs Moody Darcy) —
  'case-wb1-fanning-audit:wb1-h1': { en: 'An ε/D jump would build ΔP up gradually over weeks of service, and a brand-new day-1 pipe would still sit near the smooth-tube chart line (≈18 kPa here).', vi: 'Độ nhảy ε/D sẽ khiến ΔP tăng dần theo nhiều tuần vận hành, và ống mới tinh ngày đầu vẫn nằm gần đường ống nhẵn trên biểu đồ (≈18 kPa tại đây).' },
  'case-wb1-fanning-audit:wb1-h2': { en: 'An exact 4.000 multiple between the entered friction factor and Perry Fig. 6-9 f_F, holding at 4.000 at every Reynolds number tried.', vi: 'Bội số đúng 4,000 giữa hệ số ma sát đã nhập và f_F trên Perry Hình 6-9, giữ nguyên 4,000 ở mọi số Reynolds thử.' },
  'case-wb1-fanning-audit:wb1-h3': { en: 'Reynolds number below ≈2,100 with f = 16/Re ≈ 0.00032 and a very small ΔP at these flow conditions.', vi: 'Số Reynolds dưới ≈2.100 với f = 16/Re ≈ 0,00032 và ΔP rất nhỏ ở điều kiện lưu lượng này.' },
  // — case-wb2-boil-flash (DIPPR 101, psig/psia datum) —
  'case-wb2-boil-flash:wb2-h1': { en: 'A vessel held at true zero absolute pressure would boil any liquid at 25°C and show hard vacuum (<0.1 psia) on a compound gauge.', vi: 'Bình giữ ở áp suất tuyệt đối đúng bằng 0 sẽ làm mọi chất lỏng sôi ở 25°C và chỉ chân không cứng (<0,1 psia) trên đồng hồ kép.' },
  'case-wb2-boil-flash:wb2-h2': { en: 'Ethanol at 298 K on its DIPPR Eq. 101 curve giving P_sat ≈ 7.9 kPa, while water needs 373.15 K to reach 101.3 kPa.', vi: 'Ethanol ở 298 K trên đường DIPPR Eq. 101 cho P_sat ≈ 7,9 kPa, còn nước cần 373,15 K để đạt 101,3 kPa.' },
  'case-wb2-boil-flash:wb2-h3': { en: 'A Wilson T-x diagram showing the two-liquid dome with tie-lines, LLE predicted without switching models.', vi: 'Đồ thị T-x Wilson hiện vòm hai pha lỏng với đường nối, LLE dự đoán được mà không cần đổi mô hình.' },
  // — case-wb3-pump-and-heater (NPSHa + boiler feedwater HX) —
  'case-wb3-pump-and-heater:wb3-h1': { en: 'Suction noise and NPSHa tracking the downstream valve position — closing FCV further quiets the pump and restores suction head.', vi: 'Tiếng ồn hút và NPSHa theo vị trí van phía sau — đóng FCV thêm làm dịu tiếng bơm và hồi phục cột áp hút.' },
  'case-wb3-pump-and-heater:wb3-h2': { en: 'NPSHa = (P_suc,abs − P_vp)/ρg + z_s − h_f,s(Q) sliding below NPSHr as Q rises, with the deficit growing ∝ Q².', vi: 'NPSHa = (P_suc,abs − P_vp)/ρg + z_s − h_f,s(Q) trượt xuống dưới NPSHr khi Q tăng, mức thiếu hụt lớn dần ∝ Q².' },
  'case-wb3-pump-and-heater:wb3-h3': { en: 'Mineral scale adds thermal resistance over weeks to months of service, with outlet temperature drifting down slowly day by day.', vi: 'Cặn khoáng cộng điện trở nhiệt trong nhiều tuần đến nhiều tháng, nhiệt độ đầu ra tụt chậm từng ngày.' },
  // — case-wb4-column-flood (Fair entrainment flooding) —
  'case-wb4-column-flood:wb4-h1': { en: 'With α_AB → 1.0, distillate purity x_D slides slowly toward the equilibrium pinch at steady reflux, with no hydraulic ΔP spike across the trays.', vi: 'Khi α_AB → 1,0, độ tinh khiết x_D trượt chậm về điểm thắt cân bằng ở hồi lưu ổn định, không có đỉnh ΔP thủy lực trên các đĩa.' },
  'case-wb4-column-flood:wb4-h2': { en: 'u_v = 4·V_rect/(π·D_c²·ρ_V) rising with (R+1) and falling with D_c², crossing 100% of u_flood exactly when reflux was raised in the narrow shell.', vi: 'u_v = 4·V_rect/(π·D_c²·ρ_V) tăng theo (R+1) và giảm theo D_c², vượt 100% u_flood đúng lúc hồi lưu được nâng trong vỏ tháp hẹp.' },
  'case-wb4-column-flood:wb4-h3': { en: 'Tray ΔP falling and entrainment stopping as reflux climbs toward 3.0, the trays drying out with the rising vapor traffic.', vi: 'ΔP đĩa giảm và entrainment dừng khi hồi lưu leo tới 3,0, các đĩa khô dần theo lưu lượng hơi tăng.' },
  // — case-wb6-reactor-runaway (Thiele η(φ) + Semenov ψ) —
  'case-wb6-reactor-runaway:wb6-h1': { en: 'Conversion recovering with the +40 K heat input — catalyst activity waking up while η and ψ settle back into range.', vi: 'Độ chuyển hóa hồi phục với +40 K cấp nhiệt — hoạt tính xúc tác thức dậy trong khi η và ψ trở về miền an toàn.' },
  'case-wb6-reactor-runaway:wb6-h2': { en: 'η(φ) = 3(φ·cothφ − 1)/φ² falling below 0.5 when φ ≈ 5.5, and ψ climbing above 0.368 whenever cooling UA falls behind G(T).', vi: 'η(φ) = 3(φ·cothφ − 1)/φ² xuống dưới 0,5 khi φ ≈ 5,5, và ψ vượt 0,368 mỗi khi UA làm mát tụt lại sau G(T).' },
  'case-wb6-reactor-runaway:wb6-h3': { en: 'Packed-bed ΔP follows the 150/Re_p + 1.75 terms over void fraction ε — very different coefficients from the smooth-pipe Moody curve.', vi: 'ΔP giường cố định theo các số hạng 150/Re_p + 1,75 trên độ rỗng ε — hệ số rất khác đường cong Moody ống trơn.' },
  // — case-wb5-atlas-synthesis (Bowman F_T + API 520; only 2 hypotheses) —
  'case-wb5-atlas-synthesis:wb5-h1': { en: 'If doubling area restores duty, Q would recover roughly in proportion to A while F_T stays on a flat plateau above 0.75.', vi: 'Nếu gấp đôi diện tích khôi phục nhiệt lượng, Q sẽ hồi phục gần như tỷ lệ với A trong khi F_T nằm trên vùng bằng phẳng trên 0,75.' },
  'case-wb5-atlas-synthesis:wb5-h2': { en: 'F_T recovering above 0.75 on the multi-shell (2-4) curve at the same P and R, and relief P_1 landing at 164.7 psia after adding 14.696.', vi: 'F_T hồi phục trên 0,75 theo đường đa vỏ (2-4) tại cùng P và R, và P_1 van an toàn thành 164,7 psia sau khi cộng 14,696.' },
};

export function getFlagshipConsequence(caseId: string, hypId: string): ConsequenceText | undefined {
  return FLAGSHIP_CONSEQUENCES[`${caseId}:${hypId}`];
}

const PROBLEM_CONSEQUENCES: Readonly<Record<string, ConsequenceText>> = { ...PROBLEM_CONSEQUENCES_A, ...PROBLEM_CONSEQUENCES_B };

export function getHypothesisConsequence(caseId: string, hypId: string): ConsequenceText | undefined {
  return FLAGSHIP_CONSEQUENCES[`${caseId}:${hypId}`] ?? PROBLEM_CONSEQUENCES[`${caseId}:${hypId}`];
}
