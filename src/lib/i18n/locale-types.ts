// Core Vietnamese (`vi`) / English (`en`) locale store, URL & localStorage resolver,
// and DOM `<html lang="..." data-locale="...">` synchronizer (< 200 LOC).
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
  return 'en';
}

export function getActiveLocale(): LocaleCode {
  return activeLocale;
}

export function syncDomLocaleAttributes(locale: LocaleCode): void {
  if (typeof document !== 'undefined' && document.documentElement) {
    document.documentElement.setAttribute('lang', locale);
    document.documentElement.setAttribute('data-locale', locale);
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
export function resetLocaleForTests(): void {
  activeLocale = 'en';
  syncDomLocaleAttributes('en');
  if (typeof window !== 'undefined') {
    try {
      window.localStorage?.removeItem(LOCALE_STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }
  listeners.forEach((fn) => fn('en'));
}
