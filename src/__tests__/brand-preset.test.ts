// Brand preset contract: chemeng identity byte-identical to pre-phase behavior; pvu defaults theme+locale.
// (Lives in src/__tests__/ to match the repo's vitest include pattern — plans/phase-01 amendment.)
import fs from 'node:fs';
import { describe, expect, it } from 'vitest';
import { getBrand, resolveBrand } from '../lib/brand';

describe('brand preset', () => {
  it('defaults to the chemeng identity when VITE_BRAND is unset', () => {
    const brand = resolveBrand(undefined);
    expect(brand.id).toBe('chemeng');
    expect(brand.displayName).toBe('ai4UCheE');
    expect(brand.logoSrc).toBe('/ai4u-logo.png');
    expect(brand.logoAlt).toBe('AI4U.now');
    expect(brand.defaultTheme).toBe('paper');
    expect(brand.defaultLocale).toBe('en');
  });

  it('falls back to chemeng on an unknown brand id', () => {
    expect(resolveBrand('bogus').id).toBe('chemeng');
    expect(resolveBrand('').id).toBe('chemeng');
  });

  it('pvu preset defaults the theme and locale for the PVU edition', () => {
    const brand = resolveBrand('pvu');
    expect(brand.id).toBe('pvu');
    expect(brand.defaultTheme).toBe('pvu');
    expect(brand.defaultLocale).toBe('vi');
    expect(brand.logoSrc).toBe('/brand/pvu-logo.svg');
  });

  it('getBrand() mirrors resolveBrand() under the ambient env', () => {
    expect(getBrand().id).toBe(resolveBrand(undefined).id);
  });
});

describe('pvu-edition.css specificity guard', () => {
  it('keeps the order-independent :root[data-theme="pvu"] selector (import-order regression pin)', () => {
    const css = fs.readFileSync('src/styles/pvu-edition.css', 'utf8');
    expect(css).toContain(':root[data-theme="pvu"]');
  });
});
