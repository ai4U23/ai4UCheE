"""Vector-figure detection and caption matching on a Perry's page."""
from __future__ import annotations

import pymupdf as fitz

from pdf.section_map import _document, resolve_sec_page

FIG_LABELS = ("FIG.", "TABLE")


def to_display(page: "fitz.Page", r: "fitz.Rect") -> "fitz.Rect":
    """Map a rect from unrotated PDF space to display space.

    PyMuPDF's ``search_for``/``get_drawings`` return UNROTATED coordinates while
    ``page.rect``/``get_pixmap(clip=)`` work in DISPLAY space; on this handbook
    ~200 pages carry rotation=90 (Sec 2 landscape tables). Branch on
    ``page.rotation`` — never on geometry — per kongming Phase-2 counsel.
    """
    return r * page.rotation_matrix if page.rotation else r


def page_for(sec_page: str) -> tuple["fitz.Page", dict]:
    r = resolve_sec_page(sec_page)
    return _document()[r["pdf_page_1based"] - 1], r


def detect_vector_figures(sec_page: str) -> dict:
    """Detect vector charts on the page and match FIG./TABLE caption labels.

    Drawing boxes are mapped to display space and every merged cluster is
    clamped to ``page.rect`` so border rules + 18pt padding cannot protrude
    outside the page.
    """
    page, meta = page_for(sec_page)
    page_rect = fitz.Rect(page.rect)
    drawings = page.get_drawings()
    boxes = []
    for d in drawings:
        rect = d.get("rect")
        if rect is not None and rect.width > 8 and rect.height > 8:
            boxes.append(to_display(page, rect))
    clusters: list[fitz.Rect] = []
    for rect in sorted(boxes, key=lambda r: (r.y0, r.x0)):
        grown = fitz.Rect(rect.x0 - 18, rect.y0 - 18, rect.x1 + 18, rect.y1 + 18) & page_rect
        merged = False
        for i, cl in enumerate(clusters):
            if cl.intersects(rect):
                clusters[i] = (cl | rect) & page_rect
                merged = True
                break
        if not merged:
            clusters.append(fitz.Rect(grown))
    labels = []
    for block in page.get_text("blocks"):
        text = str(block[4]).strip()
        for label in FIG_LABELS:
            if text.startswith(label):
                labels.append({
                    "label": text.split("\n")[0][:80],
                    "bbox": [block[0], block[1], block[2], block[3]],
                })
                break
    return {
        "sec_page": sec_page,
        "pdf_page_1based": meta["pdf_page_1based"],
        "page_rotation": page.rotation,
        "drawing_count": len(drawings),
        "is_vector_figure": len(drawings) >= 8,
        "figure_region_count": len(clusters),
        "figure_regions": [[c.x0, c.y0, c.x1, c.y1] for c in clusters[:12]],
        "caption_labels": labels[:12],
    }
