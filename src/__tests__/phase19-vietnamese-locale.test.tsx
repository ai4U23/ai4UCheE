// Phase 19 — Bilingual Vietnamese (`vi`) / English (`en`) Locale Suite:
// Verifies header LocaleSwitcherPill, URL `?lang=vi` & localStorage persistence, `<html lang="vi">`,
// `<current-screen locale="vi">`, WB1–WB6 Vietnamese labels/callouts, Vietnamese AI Co-Pilot
// tutoring + natural-language What-If slider mutations, QA/QC Calc Sheet headers, and `< 200` LOC invariant.
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import fs from 'node:fs';
import path from 'node:path';
import React from 'react';
import { beforeEach, describe, expect, it } from 'vitest';
import { App } from '../App';
import { runCopilotResponder } from '../actions/copilot-responder';
import { getClientAppState, serializeCurrentScreenTag } from '../actions/view-screen';
import { getActiveLocale, resetLocaleForTests, resolveInitialLocale } from '../lib/i18n/locale-types';

describe('Phase 19 — Bilingual Vietnamese (vi) & English (en) Locale Suite', () => {
  beforeEach(() => {
    resetLocaleForTests('en');
  });

  it('Test 1 (Locale Resolution, Switcher Pill, DOM Attributes & <current-screen> Sync): toggles EN <-> VI and syncs HTML + XML', async () => {
    expect(resolveInitialLocale('?lang=vi')).toBe('vi');
    expect(resolveInitialLocale('?locale=vi-VN')).toBe('vi');
    expect(resolveInitialLocale('?lang=en')).toBe('en');

    render(<App />);
    expect(getActiveLocale()).toBe('en');
    expect(document.documentElement.getAttribute('lang')).toBe('en');
    expect(screen.getByTestId('locale-en').getAttribute('aria-pressed')).toBe('true');

    // Switch to Vietnamese via header pill
    fireEvent.click(screen.getByTestId('locale-vi'));
    expect(getActiveLocale()).toBe('vi');
    expect(document.documentElement.getAttribute('lang')).toBe('vi');
    expect(document.documentElement.getAttribute('data-locale')).toBe('vi');
    expect(screen.getByTestId('locale-vi').getAttribute('aria-pressed')).toBe('true');

    // Header & Mission Bar reflect Vietnamese copy
    expect(screen.getByTestId('persona-learn').textContent).toContain('Học tập');
    expect(screen.getByTestId('persona-plant').textContent).toContain('Nhà máy');
    expect(screen.getByTestId('toggle-problem-library-btn').textContent).toContain('Duyệt 24 Sự cố Nhà máy');

    // <current-screen> XML carries locale="vi"
    await waitFor(() => {
      const state = getClientAppState();
      expect(state.locale).toBe('vi');
      const xml = serializeCurrentScreenTag(state);
      expect(xml).toContain('locale="vi"');
    });

    // Switch back to English
    fireEvent.click(screen.getByTestId('locale-en'));
    expect(getActiveLocale()).toBe('en');
    expect(document.documentElement.getAttribute('lang')).toBe('en');
    expect(screen.getByTestId('persona-learn').textContent).toContain('Learn');
  });

  it('Test 2 (All 6 Subject Workbenches WB1–WB6 & QA/QC Calc Sheet in Vietnamese): renders Vietnamese headings, inputs, callouts, and Calc Sheet modal', () => {
    render(<App initialLocale="vi" initialPersona="learn" initialWorkbench="wb1-visual-verifier" />);

    // WB1
    expect(screen.getByTestId('wb1-visual-verifier').textContent).toContain('Giản đồ Hiệu chuẩn & Kiểm tra Đọc Đồ thị');
    expect(screen.getByTestId('wb1-visual-verifier').textContent).toContain('Hình 6-9 của Perry vẽ hệ số ma sát Fanning f_F');
    expect(screen.getByTestId('wb1-visual-verifier').textContent).toContain('Thử thách Đọc Giản đồ DeepTutor');
    expect(screen.getByTestId('wb1-visual-verifier').textContent).toContain('Kiểm tra & Hiện Tâm chữ thập');

    // WB2
    fireEvent.click(screen.getByTestId('tab-wb2-thermo-dippr'));
    expect(screen.getByTestId('wb2-thermo-dippr').textContent).toContain('Nhiệt động học, Cân bằng Pha & Động cơ DIPPR');
    expect(screen.getByTestId('wb2-thermo-dippr').textContent).toContain('Nhiệt độ (Temperature)');
    expect(screen.getByTestId('wb2-thermo-dippr').textContent).toContain('Cố vấn Chọn Mô hình Nhiệt động Carlson');
    expect(screen.getByTestId('wb2-thermo-dippr').textContent).toContain('PHƯƠNG TRÌNH KÝ HIỆU');
    expect(screen.getByTestId('wb2-thermo-dippr').textContent).toContain('Chế độ Đồ thị:');

    // WB3
    fireEvent.click(screen.getByTestId('tab-wb3-hydraulics'));
    expect(screen.getByTestId('wb3-hydraulics').textContent).toContain('Thủy lực Đường ống Hút Bơm P-101 & Van Điều khiển');
    expect(screen.getByTestId('wb3-hydraulics').textContent).toContain('Lưu lượng định mức Q');
    expect(screen.getByTestId('wb3-hydraulics').textContent).toContain('An toàn: NPSHa');

    // WB4
    fireEvent.click(screen.getByTestId('tab-wb4-distillation'));
    expect(screen.getByTestId('wb4-distillation').textContent).toContain('Tháp Chưng cất T-201 McCabe-Thiele & Ngập lụt Fair');
    expect(screen.getByTestId('wb4-distillation').textContent).toContain('Độ bay hơi tương đối α');
    expect(screen.getByTestId('wb4-distillation').textContent).toContain('Khoảng cách đĩa h_t:');

    // WB6
    fireEvent.click(screen.getByTestId('tab-wb6-kinetics-reactors'));
    expect(screen.getByTestId('wb6-kinetics-reactors').textContent).toContain('Thiết kế Lò phản ứng R-401 Levenspiel & An toàn Thoát nhiệt');
    expect(screen.getByTestId('wb6-kinetics-reactors').textContent).toContain('Độ chuyển hóa mục tiêu X');
    expect(screen.getByTestId('wb6-kinetics-reactors').textContent).toContain('Bẫy Thoát nhiệt');

    // WB5
    fireEvent.click(screen.getByTestId('tab-wb5-handbook-atlas'));
    expect(screen.getByTestId('wb5-handbook-atlas').textContent).toContain('Duyệt Toàn bộ 25 Chương Perry');
    expect(screen.getByTestId('wb5-handbook-atlas').textContent).toContain('Kho 6 Giáo trình & Chỉ mục Cuối sách Perry');

    // Open Problem Library Browser in Vietnamese
    fireEvent.click(screen.getByTestId('toggle-problem-library-btn'));
    expect(screen.getByTestId('problem-library-browser').textContent).toContain('Thư viện 24 Sự cố Nhà máy Thực tế');
    expect(screen.getByTestId('problem-library-browser').textContent).toContain('Giải Sự cố #1');

    // Open QA/QC Calc Sheet Modal in Vietnamese
    fireEvent.click(screen.getByTestId('export-calc-sheet-btn'));
    expect(screen.getByTestId('calc-sheet-sticky-header').textContent).toContain('Xuất Bản tính Kiểm định QA/QC Kỹ sư Trưởng (EPC)');
    expect(screen.getByTestId('calc-sheet-safety-badge').textContent).toContain('KIỂM ĐỊNH AN TOÀN');
    expect(screen.getByTestId('compile-calc-sheet-btn').textContent).toContain('Biên dịch & Lưu Bản tính QA/QC');
  });

  it('Test 3 (Vietnamese AI Co-Pilot Tutoring, ChE Rigor Guardrails & Natural-Language What-If Slider Mutation): responds in Vietnamese and mutates WB3 dials', async () => {
    // Direct Tier-1 responder checks in Vietnamese across Learn & Plant modes
    const thermoVi = runCopilotResponder({
      prompt: 'Tại sao nước sôi ở 100°C và psig khác psia thế nào?',
      activeWorkbench: 'wb2-thermo-dippr',
      personaMode: 'learn',
      locale: 'vi',
      scaffoldingOverride: 'socratic',
    });
    expect(thermoVi.reply).toContain('Trực giác Sinh viên');
    expect(thermoVi.reply).toContain('Gợi ý Socratic');
    expect(thermoVi.reply).toContain('psia = psig + 14.696');
    expect(thermoVi.reply).toContain("[Perry's 9th Ed., Table 2-8 (DIPPR Eq. 101), p. 2-53");

    const plantHydVi = runCopilotResponder({
      prompt: 'Kiểm tra hệ số ma sát Fanning và Darcy',
      activeWorkbench: 'wb3-hydraulics',
      personaMode: 'plant',
      locale: 'vi',
    });
    expect(plantHydVi.reply).toContain('Kiểm định Kỹ sư EPC');
    expect(plantHydVi.reply).toContain('f_D = 4·f_F');
    expect(plantHydVi.reply).toContain('locale="vi"');

    // End-to-End UI What-If mutation in Vietnamese on WB3 Hydraulics
    render(<App initialLocale="vi" initialWorkbench="wb3-hydraulics" />);
    const input = screen.getByLabelText("Ask ChemEng's Agent");
    fireEvent.change(input, {
      target: { value: 'Sửa xâm thực bơm (ống 6 in, 15 psig)' },
    });
    fireEvent.click(screen.getByText('Gửi'));

    await waitFor(() => {
      const pill = screen.getByTestId('copilot-mutation-pill');
      expect(pill.textContent).toContain('Đã áp dụng lên Bàn làm việc:');
      expect(pill.textContent).toContain('npsInch=6');
      expect(pill.textContent).toContain('pSuctionPsig=15');
    });
  });

  it('Test 4 (Repo Invariant #2 — Mechanical < 200 LOC Ceiling): every code file in src/ is strictly under 200 lines', () => {
    const srcRoot = path.resolve(__dirname, '..');
    const walk = (dir: string): string[] =>
      fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) return entry.name === '__tests__' ? [] : walk(full);
        return /\.(ts|tsx|css)$/.test(entry.name) ? [full] : [];
      });

    const offenders: Array<{ file: string; lines: number }> = [];
    for (const file of walk(srcRoot)) {
      const lines = fs.readFileSync(file, 'utf8').split('\n').length;
      if (lines >= 200) {
        offenders.push({ file: path.relative(srcRoot, file), lines });
      }
    }
    expect(offenders).toEqual([]);
  });
});
