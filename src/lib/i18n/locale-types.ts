// Core Vietnamese (`vi`) / English (`en`) locale store, URL & localStorage resolver,
// and DOM `<html lang="..." data-locale="...">` synchronizer (< 200 LOC).
import { getBrand } from '../brand';

export type LocaleCode = 'en' | 'vi';

export const LOCALE_STORAGE_KEY = 'ai4uchee_locale';

type LocaleListener = (locale: LocaleCode) => void;

let activeLocale: LocaleCode = 'en';
const listeners = new Set<LocaleListener>();

export function isValidLocale(val: unknown): val is LocaleCode {
  return val === 'en' || val === 'vi';
}

function parseLocaleToken(raw?: string | null): LocaleCode | undefined {
  if (!raw) return undefined;
  const low = raw.trim().toLowerCase();
  if (low === 'vi' || low.startsWith('vi-') || low.startsWith('vi_')) return 'vi';
  if (low === 'en' || low.startsWith('en-') || low.startsWith('en_')) return 'en';
  return undefined;
}

export function resolveInitialLocale(explicit?: string): LocaleCode {
  if (explicit) {
    if (explicit.startsWith('?')) {
      const p = new URLSearchParams(explicit);
      const fromQuery = parseLocaleToken(p.get('lang') ?? p.get('locale'));
      if (fromQuery) return fromQuery;
    }
    const parsedExplicit = parseLocaleToken(explicit);
    if (parsedExplicit) return parsedExplicit;
  }
  if (typeof window !== 'undefined') {
    try {
      const params = new URLSearchParams(window.location.search);
      const q = parseLocaleToken(params.get('lang') ?? params.get('locale'));
      if (q) return q;
    } catch {
      /* ignore URL parse errors */
    }
    try {
      const saved = parseLocaleToken(window.localStorage?.getItem(LOCALE_STORAGE_KEY));
      if (saved) return saved;
    } catch {
      /* ignore storage errors */
    }
  }
  return getBrand().defaultLocale;
}

export function getActiveLocale(): LocaleCode {
  return activeLocale;
}

export function syncDomLocaleAttributes(locale: LocaleCode): void {
  if (typeof document !== 'undefined' && document.documentElement) {
    document.documentElement.setAttribute('lang', locale);
    document.documentElement.setAttribute('data-locale', locale);
    const title = locale === 'vi'
      ? 'Bàn làm việc Kỹ thuật Hóa học Tương tác (/app) — ai4UCheE (Chương trình Năm 2–4 & 28 Bộ giải SVG)'
      : 'Interactive ChE Workbench (/app) — ai4UCheE (Year 2–4 Curriculum & 28 SVG Solvers)';
    const desc = locale === 'vi'
      ? 'Phòng thí nghiệm Kỹ thuật Hóa học tương tác trực tiếp (/app) khởi đầu tại Nhiệt động học Năm 2 (DIPPR 101/105) ở Chế độ Học tập, với 6 giáo trình chuẩn, 28 giản đồ SVG hai chiều, 24 tình huống sự cố tổng hợp và xuất phiếu tính sơ bộ 14 trường.'
      : 'Live interactive chemical engineering studio (/app) starting at Year 2 Thermodynamics (DIPPR 101/105) in Learn Mode, with 6 core textbooks, 28 bi-directional SVG nomographs, 24 realistic composite plant problems, and 14-field preliminary calculation sheet export.';
    document.title = title;
    const ogLocale = document.querySelector('meta[property="og:locale"]');
    if (ogLocale) ogLocale.setAttribute('content', locale === 'vi' ? 'vi_VN' : 'en_US');
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', desc);
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', title);
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', desc);
  }
}

export function setActiveLocale(
  next: LocaleCode,
  options?: { persist?: boolean },
): LocaleCode {
  const valid: LocaleCode = isValidLocale(next) ? next : 'en';
  activeLocale = valid;
  syncDomLocaleAttributes(valid);
  if (options?.persist && typeof window !== 'undefined') {
    try {
      window.localStorage?.setItem(LOCALE_STORAGE_KEY, valid);
    } catch {
      /* ignore storage errors */
    }
  }
  listeners.forEach((fn) => fn(valid));
  return valid;
}

export function subscribeLocale(fn: LocaleListener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** Deterministic reset for Vitest suites so no test leaks `vi` state to subsequent tests. */
export function resetLocaleForTests(next: LocaleCode = 'en'): void {
  const valid: LocaleCode = isValidLocale(next) ? next : 'en';
  activeLocale = valid;
  syncDomLocaleAttributes(valid);
  if (typeof window !== 'undefined') {
    try {
      window.localStorage?.removeItem(LOCALE_STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }
  listeners.forEach((fn) => fn(valid));
}
