/**
 * Server-side HTML Locale Responder (`P3` & `Bilingual SEO`).
 * Detects `?lang=vi` / `?locale=vi` query parameters or `Accept-Language: vi`
 * header on incoming requests to `/` and `/app`, rewriting `<html lang="en"`,
 * `<title>`, `<meta name="description">`, and OpenGraph/Twitter tags so
 * crawlers and initial SSR/static loads receive matching Vietnamese metadata.
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

const VI_HOMEPAGE_TITLE =
  'ai4UCheE — Hiểu Rõ Các Học Phần Cốt Lõi Đằng Sau Sự Cố Nhà Máy Thực Tế | Bàn Làm Việc Kỹ Thuật Hóa Học';
const VI_HOMEPAGE_DESC =
  'Thực hành Kỹ thuật Hóa học đại học (Nhiệt động học Năm 2, Cơ học Lưu chất, Quá trình Tách, Kỹ thuật Phản ứng và Thiết kế Quá trình) bằng cách kết nối sự cố nhà máy tổng hợp sát thực tế với phương trình giáo trình và giản đồ tương tác.';
const VI_APP_TITLE =
  'Bàn làm việc Kỹ thuật Hóa học Tương tác (/app) — ai4UCheE (Chương trình Năm 2–4 & 28 Bộ giải SVG)';
const VI_APP_DESC =
  'Phòng thí nghiệm Kỹ thuật Hóa học tương tác trực tiếp (/app) khởi đầu tại Nhiệt động học Năm 2 (DIPPR 101/105) ở Chế độ Học tập, với 6 giáo trình chuẩn, 28 giản đồ SVG hai chiều, 24 tình huống sự cố tổng hợp và xuất phiếu tính sơ bộ 14 trường.';

export function transformHtmlForRequest(
  rawHtml: string,
  reqUrl: string,
  acceptLanguageHeader?: string
): string {
  const locale = resolveRequestLocale(reqUrl, acceptLanguageHeader);
  if (locale !== 'vi') {
    return rawHtml;
  }
  const isAppRoute = /^\/(app|workbench|index\.html)(\b|\/|\?|$)/i.test(reqUrl) || rawHtml.includes('Interactive ChE Workbench (/app)');
  const viTitle = isAppRoute ? VI_APP_TITLE : VI_HOMEPAGE_TITLE;
  const viDesc = isAppRoute ? VI_APP_DESC : VI_HOMEPAGE_DESC;

  return rawHtml
    .replace(/<html\s+lang="en"([^>]*)>/i, '<html lang="vi" data-locale="vi"$1>')
    .replace(/property="og:locale"\s+content="en_US"/i, 'property="og:locale" content="vi_VN"')
    .replace(/<title>[\s\S]*?<\/title>/i, `<title>${viTitle}</title>`)
    .replace(
      /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i,
      `<meta name="description" content="${viDesc}" />`
    )
    .replace(
      /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i,
      `<meta property="og:title" content="${viTitle}" />`
    )
    .replace(
      /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i,
      `<meta property="og:description" content="${viDesc}" />`
    )
    .replace(
      /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/i,
      `<meta name="twitter:title" content="${viTitle}" />`
    )
    .replace(
      /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/i,
      `<meta name="twitter:description" content="${viDesc}" />`
    );
}
