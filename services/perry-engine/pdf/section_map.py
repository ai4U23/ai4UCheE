"""Perry's 9th Ed. Sec-Page resolver: printed "S-P" coordinates <-> 1-based PDF pages.

Ground truth (verified against the live 2,274-page binary, Validation Session 1):
TOC is flat (30 level-1 entries = 4 front matter + 25 sections + Index), so
section offsets align by ORDER with a fuzzy title sanity check that warns only.
The printed token ``S-P`` is text-extractable on ~280/2274 pages, so
``verified_header`` searches the WHOLE page text with a ±2-page fallback window.
"""
from __future__ import annotations

import json
import logging
import os
import re
from functools import lru_cache

import pymupdf as fitz

logger = logging.getLogger("perry.section_map")

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
PDF_PATH = os.environ.get(
    "PERRY_PDF_PATH",
    os.path.join(REPO_ROOT, "Perry's Chemical Engineers' Handbook, 9th Edition.pdf"),
)
CACHE_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "section_offsets_cache.json")

SECTION_TITLES: dict[int | str, str] = {
    1: "Unit Conversion Factors and Symbols",
    2: "Physical and Chemical Data",
    3: "Mathematics",
    4: "Thermodynamics",
    5: "Heat and Mass Transfer",
    6: "Fluid and Particle Dynamics",
    7: "Reaction Kinetics",
    8: "Process Control",
    9: "Process Economics",
    10: "Transport and Storage of Fluids",
    11: "Heat-Transfer Equipment",
    12: "Psychrometry, Evaporative Cooling, and Solids Drying",
    13: "Distillation",
    14: "Equipment for Distillation, Gas Absorption, Phase Dispersion, and Phase Separation",
    15: "Liquid-Liquid Extraction and Other Liquid-Liquid Operations",
    16: "Adsorption and Ion Exchange",
    17: "Gas-Solid Operations and Equipment",
    18: "Liquid-Solid Operations and Equipment",
    19: "Reactors",
    20: "Bioreactions and Bioprocessing",
    21: "Solids Processing and Particle Technology",
    22: "Waste Management",
    23: "Process Safety",
    24: "Energy Resources, Conversion, and Utilization",
    25: "Materials of Construction",
    "Index": "Index",
}
INDEX_PDF_RANGE = (2244, 2274)
_FRONT_MATTER = {"cover", "title page", "copyright page", "contents"}


def open_perry_pdf() -> "fitz.Document":
    """Open the handbook, failing fast with a clear message when missing."""
    if not os.path.exists(PDF_PATH):
        raise FileNotFoundError(
            f"Perry's 9th Ed. PDF not found at {PDF_PATH!r}; "
            "set PERRY_PDF_PATH or place the file at the repo root."
        )
    return fitz.open(PDF_PATH)


@lru_cache(maxsize=1)
def _document() -> "fitz.Document":
    return open_perry_pdf()


def _normalized(title: str) -> str:
    return re.sub(r"[^a-z0-9]+", " ", title.lower()).strip()


@lru_cache(maxsize=1)
def build_or_load_section_offsets(pdf_path: str = PDF_PATH) -> dict[int, int]:
    """Map section number -> 1-based starting PDF page (TOC-ordered, cached)."""
    stamp = str(os.path.getsize(pdf_path))
    if os.path.exists(CACHE_PATH):
        try:
            with open(CACHE_PATH) as fh:
                data = json.load(fh)
            if data.get("pdf_size_stamp") == stamp and len(data.get("sections", {})) == 25:
                return {int(k): int(v) for k, v in data["sections"].items()}
        except (json.JSONDecodeError, OSError):
            logger.warning("section offsets cache unreadable; rebuilding")
    doc = _document()
    toc = doc.get_toc()
    body = [
        (lvl, title.strip(), page)
        for lvl, title, page in toc
        if _normalized(title) not in _FRONT_MATTER
    ]
    if len(body) < 26:
        raise ValueError(f"TOC has {len(body)} body entries; expected 25 sections + Index")
    offsets: dict[int, int] = {}
    for sec, (_, title, page) in enumerate(body[:25], start=1):
        offsets[sec] = page
        want = _normalized(SECTION_TITLES[sec])
        got = _normalized(title)
        if want[:12] not in got and got[:12] not in want:
            logger.warning(
                "TOC title drift at Sec %d: %r vs expected %r (order-based alignment kept)",
                sec, title, SECTION_TITLES[sec],
            )
    index_page = body[25][2]
    if not (INDEX_PDF_RANGE[0] - 2 <= index_page <= INDEX_PDF_RANGE[1]):
        logger.warning("TOC Index at p.%d outside expected %s", index_page, INDEX_PDF_RANGE)
    with open(CACHE_PATH, "w") as fh:
        json.dump({"pdf_size_stamp": stamp, "sections": {str(k): v for k, v in offsets.items()},
                   "index_start_pdf_page": index_page}, fh, indent=1)
    return offsets


def _page_text(pdf_page_1based: int) -> str:
    return _document()[pdf_page_1based - 1].get_text("text")


def _token_on_page(pdf_page_1based: int, token: str) -> bool:
    if not (1 <= pdf_page_1based <= _document().page_count):
        return False
    return token in _page_text(pdf_page_1based)


def resolve_sec_page(sec_page: str) -> dict:
    """Resolve "S-P" (e.g. "6-10") to its 1-based PDF page with token verification."""
    m = re.fullmatch(r"\s*(\d{1,2})\s*-\s*(\d{1,3})\s*", sec_page or "")
    if not m:
        raise ValueError(f"Invalid Sec-Page code {sec_page!r}; expected 'S-P' like '6-10'")
    sec, page = int(m.group(1)), int(m.group(2))
    if not (1 <= sec <= 25):
        raise ValueError(f"Section {sec} outside 1..25")
    offsets = build_or_load_section_offsets()
    if sec not in offsets:
        raise ValueError(f"Section {sec} missing from offset map")
    pdf_page = offsets[sec] + (page - 1)
    token = f"{sec}-{page}"
    verified = _token_on_page(pdf_page, token)
    window = None
    if not verified:
        for delta in (-2, -1, 1, 2):
            if _token_on_page(pdf_page + delta, token):
                verified, window = True, delta
                break
    return {
        "sec_page": f"{sec}-{page}",
        "section": sec,
        "section_title": SECTION_TITLES[sec],
        "page_in_section": page,
        "pdf_page_1based": pdf_page,
        "verified_header": verified,
        "verified_window": window,
    }


def resolve_pdf_page_to_sec_page(pdf_page: int) -> dict:
    """Inverse mapping: 1-based PDF page -> printed Sec-Page code."""
    offsets = build_or_load_section_offsets()
    best, best_sec = 0, None
    for sec, start in offsets.items():
        if start <= pdf_page and start > best:
            best, best_sec = start, sec
    if best_sec is None or (best_sec == 25 and pdf_page >= INDEX_PDF_RANGE[0]):
        return {"pdf_page_1based": pdf_page, "sec_page": f"Index-{pdf_page - INDEX_PDF_RANGE[0] + 1}",
                "section": "Index"}
    page_in_section = pdf_page - best + 1
    return {
        "pdf_page_1based": pdf_page,
        "sec_page": f"{best_sec}-{page_in_section}",
        "section": best_sec,
        "section_title": SECTION_TITLES[best_sec],
    }


def verify_page_contains(sec_page: str, token: str) -> bool:
    """True when ``token`` (e.g. "TABLE 2-8", "FIG. 14-32") appears on that page.

    Shared citation-verification primitive for the Phase 4/5/6 test suites;
    checks the resolved page then its ±2 window so slight print drift still passes.
    """
    r = resolve_sec_page(sec_page)
    for delta in (0, -2, -1, 1, 2):
        if _token_on_page(r["pdf_page_1based"] + delta, token):
            return True
    return False


# Back-of-book Index search lives in pdf/index_search.py; re-exported here so
# callers (routers, tests) keep a single import surface.
from pdf.index_search import search_index_entries  # noqa: E402
