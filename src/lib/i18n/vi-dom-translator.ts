// Reactive Vietnamese (`vi`) DOM & SVG Text Translator Hook (`< 200` LOC).
// Walks text nodes inside `.app-shell` and `.modal-backdrop` when `locale === 'vi'`,
// translating exact phrases + dynamic regex templates while caching original English text
// in a `WeakMap<Text, { en: string; vi: string }>` so switching back to `'en'` is 100% lossless.
import { useLayoutEffect } from 'react';
import type { LocaleCode } from './locale-types';
import { VI_PROBLEMS_AND_FOGLER_MAP } from './vi-problems-and-fogler-phrases';
import { VI_EXACT_WB_AND_SVG_MAP } from './vi-svg-and-wb-phrases';

const COMBINED_EXACT: Readonly<Record<string, string>> = {
  ...VI_EXACT_WB_AND_SVG_MAP,
  ...VI_PROBLEMS_AND_FOGLER_MAP,
};

const REGEX_REPLACEMENTS: ReadonlyArray<[RegExp, string]> = [
  // Dynamic Recommendation & Detective Stamp phrases
  [/^Recommended Mission: (.+)$/, 'Nhiệm vụ Đề xuất: $1'],
  [/^Focuses on your highest-priority concept \((\d+)% mastery\)\.$/, 'Tập trung vào học phần ưu tiên cao nhất của bạn ($1% thành thạo).'],
  [/^⭐ Next up \((\d+)% mastery\)$/, '⭐ Tiếp theo ($1% thành thạo)'],
  [/^🔄 Retry without Auto-Fix$/, '🔄 Thử lại không dùng Tự động sửa'],
  [/^✓ Mastered$/, '✓ Đã thành thạo'],
  [/^🏅 Gold Detective Stamp \((.+)\) — DIY Solved \+ (\d+\/\d+) Hypotheses$/, '🏅 Huy hiệu Điều tra Vàng ($1) — Tự giải + $2 Giả thuyết'],
  [/^🕵️ Detective Stamp: ([^ ]+) \((\d+\/\d+) Hypotheses · (DIY|In Progress)\)$/, '🕵️ Huy hiệu Điều tra: $1 ($2 Giả thuyết · Đang giải)'],

  // Dynamic WB1–WB6 SVG readouts, banners & buttons
  [/^Result at T = (.+):$/, 'Kết quả tại T = $1:'],
  [/^Boiling Point Check:$/, 'Kiểm tra Điểm sôi:'],
  [/^Normal Boiling Point = /, 'Nhiệt độ sôi thường = '],
  [/^Darcy vs\. Fanning Friction Guardrail:$/, 'Hàng rào Kiểm tra Ma sát Darcy vs. Fanning:'],
  [/^Always verify whether a chart plots /, 'Luôn kiểm tra xem giản đồ vẽ hệ số '],
  [/^Fanning$/, 'Fanning'],
  [/^or /, 'hay '],
  [/^Darcy$/, 'Darcy'],
  [/^before computing pipe head loss!/, 'trước khi tính tổn thất cột áp đường ống!'],
  [/^Operating Point \(drag to scrub Q\)$/, 'Điểm làm việc (kéo để chỉnh lưu lượng Q)'],
  [/^CAVITATION HAZARD: /, 'NGUY CƠ XÂM THỰC: '],
  [/^Suction Head Margin OK: /, 'Dự trữ cột áp hút an toàn: '],
  [/^FLOODING ALERT: /, 'CẢNH BÁO NGẬP LỤT: '],
  [/^Safe Tray Hydraulics: /, 'Thủy lực đĩa an toàn: '],
  [/^THERMAL RUNAWAY ALERT /, 'CẢNH BÁO THOÁT NHIỆT '],
  [/^PORE DIFFUSION LIMIT /, 'GIỚI HẠN KHUẾCH TÁN LỖ XỐP '],
  [/^Stable Reactor: /, 'Lò phản ứng ổn định: '],
  [/^Why learn (.+)\? /, 'Tại sao phải học $1? '],

  // Sub-phrase replacements inside dynamic SVG / Fogler / Atlas strings
  [/🌱 L1 Trap/g, '🌱 Bẫy L1'],
  [/🔧 L2 Bottleneck/g, '🔧 Nghẽn L2'],
  [/🕵️ L3 Troubleshooting/g, '🕵️ Chẩn đoán L3'],
  [/🚨 L4 Safety\/Design/g, '🚨 An toàn L4'],
  [/PROVED ✅/g, 'ĐÃ CHỨNG MINH ✅'],
  [/DISPROVED ❌/g, 'ĐÃ BÁC BỎ ❌'],
  [/⚠️ Fogler Rule #12 Check: Re-examine the data & equation! /g, '⚠️ Kiểm tra Quy tắc #12 Fogler: Hãy đối chiếu lại số liệu & phương trình! '],
  [/⏱️ Δt = 0 hr \(Instantaneous Day-1 Design Audit\)/g, '⏱️ Δt = 0 giờ (Kiểm định thiết kế ngày đầu)'],
  [/⏱️ Δt = 0 hr \(Day-1 Design Audit\)/g, '⏱️ Δt = 0 giờ (Kiểm định thiết kế ngày đầu)'],
  [/⏱️ Δt = Steady-State Subcooled Startup \(25 °C vs 100 °C\)/g, '⏱️ Δt = Khởi động quá lạnh ổn định (25 °C vs 100 °C)'],
  [/⏱️ Δt = Steady Subcooled Startup/g, '⏱️ Δt = Khởi động quá lạnh ổn định'],
  [/⏱️ Δt = Pre-Startup Safety Check/g, '⏱️ Δt = Kiểm tra an toàn trước khởi động'],
  [/⏱️ Δt = Steady Decanter Overflow/g, '⏱️ Δt = Tràn bình lắng gạn ổn định'],
  [/⏱️ Δt = High-Pressure Compression Stage/g, '⏱️ Δt = Cấp nén khí cao áp'],
  [/⏱️ Δt = 3 Hours \(Rapid Upset vs\. 6-Week Scaling\)/g, '⏱️ Δt = 3 giờ (Sự cố nhanh so với đóng cặn 6 tuần)'],
  [/⏱️ Δt = Immediate Upon Downstream Depressuring/g, '⏱️ Δt = Ngay khi xả áp phía hạ lưu'],
  [/⏱️ Δt = Steady-State Design Pinch/g, '⏱️ Δt = Điểm thắt thiết kế xác lập'],
  [/⏱️ Δt = 8 Minutes After Reflux Step-Change/g, '⏱️ Δt = 8 phút sau khi tăng hồi lưu'],
  [/⏱️ Δt = 15 Minutes After Feed Preheater Trip/g, '⏱️ Δt = 15 phút sau khi dừng bộ gia nhiệt nhập liệu'],
  [/⏱️ Δt = 20 Minutes After Solvent Flow Cut/g, '⏱️ Δt = 20 phút sau khi giảm lưu lượng dung môi'],
  [/⏱️ Δt = Monsoon \/ High-Humidity Afternoon/g, '⏱️ Δt = Buổi chiều mùa mưa độ ẩm cao'],
  [/⏱️ Δt = Exponential Thermal Spike/g, '⏱️ Δt = Tăng vọt nhiệt độ theo hàm mũ'],
  [/⏱️ Δt = 12 Minutes After Cooling Utility Loss/g, '⏱️ Δt = 12 phút sau khi mất nước làm mát'],
  [/⏱️ Δt = Steady-State High-Throughput Run/g, '⏱️ Δt = Vận hành tải cao xác lập'],
  [/⏱️ Δt = After Residence Time τ Step-Increase/g, '⏱️ Δt = Sau khi tăng thời gian lưu τ'],
  [/⏱️ Δt = 4 Hours After Feed Pump Speed-Up/g, '⏱️ Δt = 4 giờ sau khi tăng tốc bơm nhập liệu'],
  [/⏱️ Δt = Late February After East Wing Painting \/ HVAC Shift/g, '⏱️ Δt = Cuối tháng 2 sau khi sơn sửa Cánh Đông'],
  [/⏱️ Δt = Sudden Nighttime Limnic Rollover \(Aug 13, 1986\)/g, '⏱️ Δt = Lật tầng nước hồ đột ngột ban đêm (13/08/1986)'],
  [/⏱️ Δt = 2 Hours From Water Washing to PSV Lift/g, '⏱️ Δt = 2 giờ từ lúc rửa nước đến khi bung van PSV'],
  [/⏱️ Δt = Pre-Startup HAZOP Relief Audit/g, '⏱️ Δt = Kiểm định HAZOP van an toàn trước khởi động'],
  [/⏱️ Δt = 1\.5 Days Downstream River Travel Time/g, '⏱️ Δt = 1.5 ngày thời gian nước trôi xuôi dòng'],
  [/⏱️ Δt = Immediate Upon Voltage Step-Up/g, '⏱️ Δt = Ngay khi tăng bậc điện áp'],
  [/⏱️ Δt = 1-Hour Pre-Race Calibration Window/g, '⏱️ Δt = 1 giờ hiệu chuẩn trước giờ thi đấu'],
  [/⚠️ CHOKED PLATEAU/g, '⚠️ THỀM NGHẼN DÒNG'],
  [/✅ SUBCRITICAL/g, '✅ DƯỚI TỚI HẠN'],
  [/⚠️ F_T < 0\.75 CROSS TRAP/g, '⚠️ BẪY GIAO CẮT F_T < 0.75'],
  [/⚠️ Temperature Cross/g, '⚠️ Giao cắt Nhiệt độ'],
  [/No Temperature Cross/g, 'Không giao cắt nhiệt độ'],
  [/🔥 EXPLOSIVE ZONE/g, '🔥 VÙNG NGUY CƠ NỔ'],
  [/⚠️ PINCHED \(A < 1\)/g, '⚠️ THẮT CỔ CHAI (A < 1)'],
  [/✅ OPTIMAL \(A ≈ 1\.4\)/g, '✅ TỐI ƯU (A ≈ 1.4)'],
  [/🔥 THERMAL RUNAWAY \/ IGNITION/g, '🔥 THOÁT NHIỆT / BỐC CHÁY'],
  [/✅ STABLE LOWER ROOT/g, '✅ NGHIỆM DƯỚI ỔN ĐỊNH'],
  [/⚠️ WASHOUT CLIFF/g, '⚠️ VÁCH ĐÁ RỬA TRÔI'],
  [/✅ ACTIVE BIOMASS/g, '✅ SINH KHỐI HOẠT ĐỘNG'],
  [/⚠️ MASS-TRANSFER PLATEAU/g, '⚠️ THỀM TRUYỀN KHỐI'],
  [/✅ KINETIC \/ TAFEL REGIME/g, '✅ VÙNG ĐỘNG HỌC / TAFEL'],
  [/⚠️ Wet Exhaust/g, '⚠️ Hơi thoát ẩm'],
  [/✅ Safe Exhaust Quality/g, '✅ Độ khô hơi thoát an toàn'],
  [/No Azeotrope/g, 'Không có đẳng phí'],
];

const nodeCache = new WeakMap<Text, { en: string; vi: string }>();

function translateTextString(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return raw;
  const exact = COMBINED_EXACT[trimmed];
  if (exact) {
    const lead = raw.match(/^\s*/)?.[0] ?? '';
    const trail = raw.match(/\s*$/)?.[0] ?? '';
    return `${lead}${exact}${trail}`;
  }
  let out = raw;
  for (const [pattern, replacement] of REGEX_REPLACEMENTS) {
    out = out.replace(pattern, replacement);
  }
  return out;
}

function shouldSkipElement(el: Element | null): boolean {
  if (!el) return true;
  const tag = el.tagName.toLowerCase();
  if (tag === 'script' || tag === 'style' || tag === 'textarea' || tag === 'input') return true;
  if (el.closest('.katex')) return true;
  return false;
}

export function applyVietnameseDomTranslation(locale: LocaleCode): void {
  if (typeof document === 'undefined') return;
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let current = walker.nextNode() as Text | null;
  while (current) {
    if (!shouldSkipElement(current.parentElement)) {
      const val = current.nodeValue ?? '';
      const cached = nodeCache.get(current);
      if (locale === 'vi') {
        if (!cached) {
          const vi = translateTextString(val);
          if (vi !== val) {
            nodeCache.set(current, { en: val, vi });
            current.nodeValue = vi;
          }
        } else if (val !== cached.vi) {
          const nextVi = translateTextString(val);
          nodeCache.set(current, { en: val, vi: nextVi });
          if (nextVi !== val) current.nodeValue = nextVi;
        }
      } else if (cached && val === cached.vi) {
        current.nodeValue = cached.en;
      }
    }
    current = walker.nextNode() as Text | null;
  }
}

export function useVietnameseDomTranslator(locale: LocaleCode): void {
  useLayoutEffect(() => {
    applyVietnameseDomTranslation(locale);
  });
  useLayoutEffect(() => {
    if (locale !== 'vi' || typeof MutationObserver === 'undefined') return;
    const observer = new MutationObserver(() => {
      applyVietnameseDomTranslation('vi');
    });
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, [locale]);
}
