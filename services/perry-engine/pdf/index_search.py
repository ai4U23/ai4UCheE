"""Back-of-book Index search (pp. 2244..2274): query -> S-P references."""
from __future__ import annotations

import re

from pdf.section_map import INDEX_PDF_RANGE, _page_text

_SEC_PAGE_TOKEN = re.compile(r"(?<![\d.])([1-9]|1\d|2[0-5])-(\d{1,3})(?![\d.])")


def search_index_entries(query: str, max_results: int = 15) -> list[dict]:
    """Scan the alphabetical Index for ``query`` and extract referenced S-P codes.

    Returns up to ``max_results`` rows of
    ``{"index_pdf_page", "line", "sec_page_refs"}`` in page order.
    """
    q = query.lower()
    results: list[dict] = []
    for pdf_page in range(INDEX_PDF_RANGE[0], INDEX_PDF_RANGE[1] + 1):
        text = _page_text(pdf_page)
        if q not in text.lower():
            continue
        for line in text.splitlines():
            if q in line.lower():
                refs = [f"{s}-{p}" for s, p in _SEC_PAGE_TOKEN.findall(line)]
                if refs:
                    results.append({
                        "index_pdf_page": pdf_page,
                        "line": line.strip()[:160],
                        "sec_page_refs": refs,
                    })
                if len(results) >= max_results:
                    return results
    return results
