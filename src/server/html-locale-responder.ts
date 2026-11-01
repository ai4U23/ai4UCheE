/**
 * Server-side HTML Locale Responder (`P3`).
 * Detects `?lang=vi` / `?locale=vi` query parameters or `Accept-Language: vi`
 * header on incoming requests to `/` and `/app`, rewriting `<html lang="en"`
 * to `<html lang="vi" data-locale="vi"` so crawlers and initial SSR/static
 * loads receive the matching document language declaration.
 */

export function resolveRequestLocale(reqUrl: string, acceptLanguageHeader?: string): 'en' | 'vi' {
  try {
    const parsed = new URL(reqUrl, 'http://localhost');
    const queryLang = (parsed.searchParams.get('lang') ?? parsed.searchParams.get('locale') ?? '').toLowerCase();
    if (queryLang === 'vi' || queryLang.startsWith('vi-')) {
      return 'vi';
    }
    if (queryLang === 'en' || queryLang.startsWith('en-')) {
      return 'en';
    }
  } catch {
    // Ignore malformed URLs and fall back to default 'en'
  }
  if (acceptLanguageHeader && /^vi\b/i.test(acceptLanguageHeader.trim())) {
    return 'vi';
  }
  return 'en';
}

export function transformHtmlForRequest(
  rawHtml: string,
  reqUrl: string,
  acceptLanguageHeader?: string
): string {
  const locale = resolveRequestLocale(reqUrl, acceptLanguageHeader);
  if (locale !== 'vi') {
    return rawHtml;
  }
  return rawHtml
    .replace(/<html\s+lang="en"([^>]*)>/i, '<html lang="vi" data-locale="vi"$1>')
    .replace(/property="og:locale"\s+content="en_US"/i, 'property="og:locale" content="vi_VN"');
}
