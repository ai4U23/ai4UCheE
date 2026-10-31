// Bilingual (`en` / `vi`) dictionary for Subject Workbenches WB1..WB6 headers, disclosure buttons,
// scrubbable input labels, and Learn Mode callouts (< 200 LOC).
import type { LocaleCode } from './locale-types';

export interface WorkbenchCommonCopy {
  investigationBtn: (open: boolean) => string;
  wb1Title: string;
  wb1AllChartsBtn: (open: boolean, n: number) => string;
  wb1CalloutTitle: string;
  wb1CalloutPlain: string;
  wb1CalloutTrap: string;
  wb2Title: string;
  wb2TempLabel: string;
  wb2ProofsBtn: (open: boolean) => string;
  wb2MoreDiagramsBtn: (open: boolean) => string;
  wb2CalloutTitle: string;
  wb2CalloutPlain: string;
  wb2CalloutTrap: string;
  wb3Title: string;
  wb3FlowLabel: string;
  wb3LengthLabel: string;
  wb3PsucLabel: string;
  wb3HeadLabel: string;
  wb3NpshrLabel: string;
  wb3ValveDpLabel: string;
  wb3ProofsBtn: (open: boolean, n: number) => string;
  wb3MoreDiagramsBtn: (open: boolean) => string;
  wb3CalloutTitle: string;
  wb3CalloutPlain: string;
  wb3CalloutTrap: string;
  wb4Title: string;
  wb4AlphaLabel: string;
  wb4XfLabel: string;
  wb4XdLabel: string;
  wb4XbLabel: string;
  wb4QLabel: string;
  wb4RmultLabel: string;
  wb4DiamLabel: string;
  wb4ProofsBtn: (open: boolean, n: number) => string;
  wb4MoreDiagramsBtn: (open: boolean) => string;
  wb4CalloutTitle: string;
  wb4CalloutPlain: string;
  wb4CalloutTrap: string;
  wb6Title: string;
  wb6ConvLabel: string;
  wb6TempLabel: string;
  wb6PinLabel: string;
  wb6EpsLabel: string;
  wb6AlphaLabel: string;
  wb6ThieleLabel: string;
  wb6SemenovLabel: string;
  wb6ProofsBtn: (open: boolean, n: number) => string;
  wb6MoreDiagramsBtn: (open: boolean) => string;
  wb6CalloutTitle: string;
  wb6CalloutPlain: string;
  wb6CalloutTrap: string;
  wb5BrowseBtn: (open: boolean) => string;
  wb5ProofsIndexBtn: (open: boolean) => string;
}

const WB_COPY_EN: WorkbenchCommonCopy = {
  investigationBtn: (o) => `${o ? '▾' : '▸'} 🕵️ 6-Stage Investigation`,
  wb1Title: '📐 Calibrated Nomographs & Chart Verifier',
  wb1AllChartsBtn: (o, n) => `${o ? '▾' : '▸'} 📊 All 10 Calibrated Charts (${n})`,
  wb1CalloutTitle: 'How to Read Log-Log & Multi-Book ChE Nomographs',
  wb1CalloutPlain: 'Pick any of the 10 calibrated multi-book nomographs above, drag the crosshair across the curve to scrub live readings, or type your visual estimate to verify against textbook benchmarks.',
  wb1CalloutTrap: "Perry's Fig. 6-9 plots Fanning f_F, which is 4× smaller than the Moody Darcy friction factor f_D = 4·f_F.",
  wb2Title: '🔥 Thermodynamics, Phase Equilibria & DIPPR Engine',
  wb2TempLabel: 'Temperature',
  wb2ProofsBtn: (o) => `${o ? '▾' : '▸'} 📐 Show Math Proofs & Model Advisor (2)`,
  wb2MoreDiagramsBtn: (o) => `${o ? '▾' : '▸'} 📊 More Diagrams (Binary VLE, Peng-Robinson, Rankine)`,
  wb2CalloutTitle: 'Vapor Pressure, Binary VLE Azeotropes, Cubic EOS, Rankine Cycles & Reaction Equilibrium',
  wb2CalloutPlain: "A liquid boils when its vapor pressure P_vp equals the surrounding absolute pressure. Scrub the DIPPR curve, Binary VLE lens, Peng-Robinson dome, Rankine T-S cycle, or Van 't Hoff X_eq(T).",
  wb2CalloutTrap: 'Plant gauges read psig (gauge). Always add 14.696 psi to convert psig → psia before plugging into thermodynamic equations, and never use Wilson for two liquid phases (LLE).',
  wb3Title: '🔧 Pump P-101 Suction Hydraulics & Piping',
  wb3FlowLabel: 'Normal Flow Q',
  wb3LengthLabel: 'Pipe Length L',
  wb3PsucLabel: 'Suction Pressure',
  wb3HeadLabel: 'Suction Static Head z',
  wb3NpshrLabel: 'Pump NPSHr',
  wb3ValveDpLabel: 'Valve ΔP',
  wb3ProofsBtn: (o, n) => `${o ? '▾' : '▸'} 📐 Show Math Proofs & 3-Case Table (${n})`,
  wb3MoreDiagramsBtn: (o) => `${o ? '▾' : '▸'} 📊 More Diagrams (Valves, Boiling, Safety)`,
  wb3CalloutTitle: 'Pipe Friction, Pump Cavitation, BSL Rheology, Choked Valves, HX Cross & Process Safety',
  wb3CalloutPlain: 'Drag Flow Q, Suction Pressure, BSL Power-Law n, Control Valve ΔP, HX T-Q Cross (Bowman F_T), Nukiyama boiling, or Flammability LOC / Plume dispersion.',
  wb3CalloutTrap: 'If NPSHa drops below Pump NPSHr, liquid flashes into vapor bubbles that implode on the impeller (cavitation).',
  wb4Title: '🗼 Column T-201 McCabe-Thiele & Fair Flooding',
  wb4AlphaLabel: 'Relative Volatility α',
  wb4XfLabel: 'Feed Mole Fraction z_F',
  wb4XdLabel: 'Distillate Purity x_D',
  wb4XbLabel: 'Bottoms Impurity x_B',
  wb4QLabel: 'Feed Thermal Quality q',
  wb4RmultLabel: 'Reflux Ratio R / R_min',
  wb4DiamLabel: 'Column Diameter D_c',
  wb4ProofsBtn: (o, n) => `${o ? '▾' : '▸'} 📐 Show Math Proofs (${n})`,
  wb4MoreDiagramsBtn: (o) => `${o ? '▾' : '▸'} 📊 More Diagrams (Kremser, Ternary LLE, Psychrometry, Membrane)`,
  wb4CalloutTitle: 'McCabe-Thiele Stage Stepping, Column Flooding, Kremser, LLE/Adsorption, Psychrometry & Membranes',
  wb4CalloutPlain: 'Drag McCabe-Thiele handles, column diameter D_c, Kremser A = L/(mV), Ternary LLE/adsorption, or Psychrometric T_db/RH and Membrane stage cut θ.',
  wb4CalloutTrap: "Operating above ~80–85% of Fair's entrainment flood velocity blows liquid up into the tray above, and operating an absorber at A < 1 pinches solute recovery.",
  wb6Title: '⚗️ Reactor R-401 Levenspiel Sizing & Runaway Safety',
  wb6ConvLabel: 'Target Conversion X',
  wb6TempLabel: 'Reactor Temperature T',
  wb6PinLabel: 'Inlet Gauge Pressure P_in',
  wb6EpsLabel: 'Gas Expansion Factor ε_A',
  wb6AlphaLabel: 'Ergun PBR Pressure Parameter α',
  wb6ThieleLabel: 'Thiele Modulus φ (Spherical Pellet)',
  wb6SemenovLabel: 'Semenov Heat-Release Number ψ',
  wb6ProofsBtn: (o, n) => `${o ? '▾' : '▸'} 📐 Show Math Proofs (${n})`,
  wb6MoreDiagramsBtn: (o) => `${o ? '▾' : '▸'} 📊 More Diagrams (Semenov, Selectivity/RTD, LHHW, Electro)`,
  wb6CalloutTitle: 'Levenspiel CSTR/PFR, Thiele η, Semenov Runaway, Selectivity/RTD, LHHW/Bioreactor & Electro-Catalysis',
  wb6CalloutPlain: 'Drag the Levenspiel plot, Semenov G(T)/R(T) S-curve, Series selectivity / RTD, LHHW rate roof / Monod chemostat, or Butler-Volmer polarization curve.',
  wb6CalloutTrap: 'Three classic traps: (1) forgetting psig → psia (+14.696) before computing gas concentration C_A0 = P_abs/(RT), (2) mixing open-pipe Fanning f_F / Darcy f_D = 4·f_F with packed-bed Ergun friction, and (3) operating above Semenov ψ_crit = 1/e ≈ 0.368.',
  wb5BrowseBtn: (o) => `${o ? '▾' : '▸'} 📚 Browse All 25 Perry Sections`,
  wb5ProofsIndexBtn: (o) => `${o ? '▾' : '▸'} 📐 Show Math Proofs & 6-Book Index`,
};

const WB_COPY_VI: WorkbenchCommonCopy = {
  investigationBtn: (o) => `${o ? '▾' : '▸'} 🕵️ Điều tra Sự cố 6 Bước`,
  wb1Title: '📐 Giản đồ Hiệu chuẩn & Kiểm tra Đọc Đồ thị',
  wb1AllChartsBtn: (o, n) => `${o ? '▾' : '▸'} 📊 Toàn bộ 10 Giản đồ Hiệu chuẩn (${n})`,
  wb1CalloutTitle: 'Cách đọc Giản đồ Log-Log & Đa giáo trình Kỹ thuật Hóa học',
  wb1CalloutPlain: 'Chọn bất kỳ giản đồ nào trong 10 giản đồ hiệu chuẩn ở trên, kéo tâm chữ thập dọc theo đường cong để đọc giá trị trực tiếp, hoặc nhập số đọc được để đối chiếu chuẩn Perry.',
  wb1CalloutTrap: "Hình 6-9 của Perry vẽ hệ số ma sát Fanning f_F, nhỏ hơn đúng 4 lần so với hệ số ma sát Moody Darcy f_D = 4·f_F.",
  wb2Title: '🔥 Nhiệt động học, Cân bằng Pha & Động cơ DIPPR',
  wb2TempLabel: 'Nhiệt độ (Temperature)',
  wb2ProofsBtn: (o) => `${o ? '▾' : '▸'} 📐 Xem Chứng minh Toán & Cố vấn Mô hình (2)`,
  wb2MoreDiagramsBtn: (o) => `${o ? '▾' : '▸'} 📊 Thêm Đồ thị (VLE 2 cấu tử, Peng-Robinson, Chu trình Rankine)`,
  wb2CalloutTitle: 'Áp suất hơi bão hòa, Đẳng phí VLE, Phương trình trạng thái bậc 3, Chu trình Rankine & Cân bằng Phản ứng',
  wb2CalloutPlain: 'Chất lỏng sôi khi áp suất hơi bão hòa P_vp bằng áp suất tuyệt đối xung quanh. Kéo đường cong DIPPR, thấu kính VLE, vòm Peng-Robinson, chu trình Rankine T-S hoặc đường cân bằng Van \'t Hoff X_eq(T).',
  wb2CalloutTrap: 'Đồng hồ nhà máy đo psig (áp suất dư). Luôn cộng 14.696 psi để đổi psig → psia trước khi thay vào phương trình nhiệt động, và tuyệt đối không dùng phương trình Wilson cho cân bằng lỏng-lỏng (LLE).',
  wb3Title: '🔧 Thủy lực Đường ống Hút Bơm P-101 & Van Điều khiển',
  wb3FlowLabel: 'Lưu lượng định mức Q',
  wb3LengthLabel: 'Chiều dài ống L',
  wb3PsucLabel: 'Áp suất hút (Suction P)',
  wb3HeadLabel: 'Cột áp tĩnh hút z',
  wb3NpshrLabel: 'NPSHr của Bơm',
  wb3ValveDpLabel: 'Độ sụt áp van ΔP',
  wb3ProofsBtn: (o, n) => `${o ? '▾' : '▸'} 📐 Xem Chứng minh Toán & Bảng 3 Chế độ (${n})`,
  wb3MoreDiagramsBtn: (o) => `${o ? '▾' : '▸'} 📊 Thêm Đồ thị (Van nghẽn dòng, Sôi Nukiyama, An toàn cháy nổ)`,
  wb3CalloutTitle: 'Ma sát Đường ống, Xâm thực Bơm, Lưu biến BSL, Van Nghẽn dòng, Giao cắt Nhiệt HX & An toàn Quá trình',
  wb3CalloutPlain: 'Kéo chỉnh Lưu lượng Q, Áp suất hút, chỉ số luật lũy thừa BSL n, ΔP van điều khiển, giao cắt nhiệt độ thiết bị trao đổi nhiệt (Bowman F_T), đường cong sôi Nukiyama hoặc tam giác cháy nổ LOC.',
  wb3CalloutTrap: 'Nếu NPSHa tụt xuống dưới NPSHr của bơm, chất lỏng hóa hơi cục bộ tạo bọt khí nổ sập trên cánh bơm (hiện tượng xâm thực / cavitation).',
  wb4Title: '🗼 Tháp Chưng cất T-201 McCabe-Thiele & Ngập lụt Fair',
  wb4AlphaLabel: 'Độ bay hơi tương đối α',
  wb4XfLabel: 'Phần mol nhập liệu z_F',
  wb4XdLabel: 'Độ tinh khiết đỉnh x_D',
  wb4XbLabel: 'Tạp chất đáy x_B',
  wb4QLabel: 'Trạng thái nhiệt nhập liệu q',
  wb4RmultLabel: 'Tỷ số hồi lưu R / R_min',
  wb4DiamLabel: 'Đường kính tháp D_c',
  wb4ProofsBtn: (o, n) => `${o ? '▾' : '▸'} 📐 Xem Chứng minh Toán (${n})`,
  wb4MoreDiagramsBtn: (o) => `${o ? '▾' : '▸'} 📊 Thêm Đồ thị (Hấp thụ Kremser, Trích ly LLE, Không khí ẩm, Màng lọc)`,
  wb4CalloutTitle: 'Bậc thang McCabe-Thiele, Ngập lụt Tháp, Hấp thụ Kremser, Trích ly LLE/Hấp phụ, Không khí ẩm & Màng',
  wb4CalloutPlain: 'Kéo các điểm nút McCabe-Thiele, đường kính tháp D_c, hệ số hấp thụ Kremser A = L/(mV), giản đồ tam giác LLE/hấp phụ, hoặc giản đồ không khí ẩm T_db/RH và độ cắt tầng màng θ.',
  wb4CalloutTrap: 'Vận hành vượt ~80–85% vận tốc ngập lụt cuốn theo của Fair sẽ thổi ngược chất lỏng lên đĩa trên, và vận hành tháp hấp thụ ở A < 1 sẽ gây thắt cổ chai độ thu hồi.',
  wb6Title: '⚗️ Thiết kế Lò phản ứng R-401 Levenspiel & An toàn Thoát nhiệt',
  wb6ConvLabel: 'Độ chuyển hóa mục tiêu X',
  wb6TempLabel: 'Nhiệt độ phản ứng T',
  wb6PinLabel: 'Áp suất dư đầu vào P_in',
  wb6EpsLabel: 'Hệ số giãn nở thể tích khí ε_A',
  wb6AlphaLabel: 'Thông số sụt áp Ergun PBR α',
  wb6ThieleLabel: 'Mô-đun Thiele φ (Hạt xúc tác cầu)',
  wb6SemenovLabel: 'Số tỏa nhiệt Semenov ψ',
  wb6ProofsBtn: (o, n) => `${o ? '▾' : '▸'} 📐 Xem Chứng minh Toán (${n})`,
  wb6MoreDiagramsBtn: (o) => `${o ? '▾' : '▸'} 📊 Thêm Đồ thị (Semenov, Độ chọn lọc/RTD, LHHW, Điện hóa)`,
  wb6CalloutTitle: 'Đồ thị Levenspiel CSTR/PFR, Hệ số hữu hiệu Thiele η, Thoát nhiệt Semenov, RTD, LHHW/Bioreactor & Điện xúc tác',
  wb6CalloutPlain: 'Kéo đồ thị Levenspiel, đường cong chữ S Semenov G(T)/R(T), độ chọn lọc nối tiếp / RTD, mái vòm động học LHHW / bioreactor Monod, hoặc đường phân cực Butler-Volmer.',
  wb6CalloutTrap: 'Ba bẫy kinh điển: (1) quên đổi psig → psia (+14.696) trước khi tính nồng độ pha khí C_A0 = P_abs/(RT), (2) nhầm lẫn ma sát ống trống Fanning f_F / Darcy f_D = 4·f_F với phương trình Ergun lớp xúc tác, và (3) vận hành vượt ngưỡng Semenov ψ_crit = 1/e ≈ 0.368.',
  wb5BrowseBtn: (o) => `${o ? '▾' : '▸'} 📚 Duyệt Toàn bộ 25 Chương Perry`,
  wb5ProofsIndexBtn: (o) => `${o ? '▾' : '▸'} 📐 Xem Chứng minh Toán & Chỉ mục 6 Giáo trình`,
};

export function getWorkbenchCopy(locale: LocaleCode = 'en'): WorkbenchCommonCopy {
  return locale === 'vi' ? WB_COPY_VI : WB_COPY_EN;
}
