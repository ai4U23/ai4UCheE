// Build-time brand preset (`VITE_BRAND`): 'chemeng' (default, identical to today) | 'pvu' (PVU SharePoint edition).
// Client-side identity only — server-side branding is env-driven (html-locale-responder / copilot-route).
export type BrandId = 'chemeng' | 'pvu';

export interface BrandPreset {
  id: BrandId;
  /** Masthead <h1> product name. */
  displayName: string;
  /** Header logo asset served from public/. */
  logoSrc: string;
  logoAlt: string;
  defaultTheme: 'paper' | 'pvu';
  defaultLocale: 'en' | 'vi';
}

const CHEMENG: BrandPreset = {
  id: 'chemeng',
  displayName: 'ai4UCheE',
  logoSrc: '/ai4u-logo.png',
  logoAlt: 'AI4U.now',
  defaultTheme: 'paper',
  defaultLocale: 'en',
};

// PVU preset: displayName/logo are PLACEHOLDERS pending owner-supplied official brand assets
// (flagged in the phase-01 report; swap = file replacement + rebuild, no code change).
const PVU: BrandPreset = {
  id: 'pvu',
  displayName: 'PVU CHE Workbench',
  logoSrc: '/brand/pvu-logo.svg',
  logoAlt: 'PVU',
  defaultTheme: 'pvu',
  defaultLocale: 'vi',
};

function envBrand(): string {
  try {
    return ((import.meta as unknown as { env?: Record<string, string | undefined> }).env?.VITE_BRAND) ?? '';
  } catch {
    return '';
  }
}

/** Resolve a brand from an explicit id (tests) falling back to the build-time `VITE_BRAND`; unknown ids fall back to chemeng. */
export function resolveBrand(raw?: string | null): BrandPreset {
  const value = (raw ?? envBrand()).trim().toLowerCase();
  return value === 'pvu' ? PVU : CHEMENG;
}

/** The active build-time preset (chemeng unless VITE_BRAND=pvu). */
export function getBrand(): BrandPreset {
  return resolveBrand();
}
