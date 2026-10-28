"""PyMuPDF visual crop engine: calibrated crops, composite row crops, crosshair.

Coordinate discipline (kongming Phase-2 checkpoint):
- ``x_pct``/``y_pct`` from :func:`compute_axis_crosshair` are percentages within
  the CALIBRATED PLOT BOX (the ``clip_rect_norm`` passed to the renderer), not
  the page. ``y_pct`` is inverted for SVG's top-left origin.
- Table-row highlights are baked with ``page.draw_rect`` BEFORE ``get_pixmap``
  so overlays live in PDF-point space — never compose pixel-space overlays.
"""
from __future__ import annotations

import base64
import math
from typing import Any

import pymupdf as fitz

# Vector-figure detection lives in pdf/figure_detector.py; re-exported here so
# callers keep a single import surface.
from pdf.figure_detector import detect_vector_figures, page_for, to_display

__all__ = [
    "compute_axis_crosshair",
    "detect_vector_figures",
    "render_calibrated_crop",
    "render_table_row_composite_crop",
]


def compute_axis_crosshair(x_val: float, y_val: float, axis_cal: dict) -> dict:
    """Map data-space (x, y) to plot-box percentages with SVG y inversion.

    ``axis_cal`` requires x_min/x_max/y_min/y_max and optional x_scale/y_scale
    of ``"linear"`` (default) or ``"log10"``.
    """
    def frac(val: float, lo: float, hi: float, scale: str) -> float:
        if scale == "log10":
            if val <= 0 or lo <= 0 or hi <= 0:
                raise ValueError("log10 axes require positive values and bounds")
            fv, flo, fhi = math.log10(val), math.log10(lo), math.log10(hi)
        else:
            fv, flo, fhi = val, lo, hi
        if fhi == flo:
            raise ValueError("Axis bounds are degenerate (min == max)")
        return (fv - flo) / (fhi - flo)

    ux = frac(x_val, float(axis_cal["x_min"]), float(axis_cal["x_max"]), axis_cal.get("x_scale", "linear"))
    uy = frac(y_val, float(axis_cal["y_min"]), float(axis_cal["y_max"]), axis_cal.get("y_scale", "linear"))
    for name, u in (("x", ux), ("y", uy)):
        if not -0.05 <= u <= 1.05:
            raise ValueError(f"{name}-value outside calibrated axis bounds")
    ux = min(1.0, max(0.0, ux))
    uy = min(1.0, max(0.0, uy))
    return {
        "x_pct": round(ux * 100.0, 3),
        "y_pct": round((1.0 - uy) * 100.0, 3),  # SVG origin is top-left
        "x_fraction": round(ux, 6),
        "y_fraction_inverted": round(1.0 - uy, 6),
    }


def render_calibrated_crop(
    sec_page: str,
    clip_rect_norm: tuple[float, float, float, float] | None = None,
    dpi: int = 220,
    crosshair: dict | None = None,
    highlight_rects_norm: list[tuple[float, float, float, float]] | None = None,
) -> dict:
    """Render a high-DPI PNG crop (optionally clipped) as a base64 data URI.

    ``clip_rect_norm``/``highlight_rects_norm`` are (x0, y0, x1, y1) fractions of
    ``page.rect`` in display space; any unrotated-space geometry must pass
    through :func:`to_display` before normalizing.
    """
    page, meta = page_for(sec_page)
    rect = page.rect
    if clip_rect_norm is not None:
        x0, y0, x1, y1 = clip_rect_norm
        clip = fitz.Rect(x0 * rect.width, y0 * rect.height, x1 * rect.width, y1 * rect.height)
    else:
        clip = fitz.Rect(rect)
    if highlight_rects_norm:
        shape = page.new_shape()
        for hx0, hy0, hx1, hy1 in highlight_rects_norm:
            shape.draw_rect(fitz.Rect(hx0 * rect.width, hy0 * rect.height,
                                      hx1 * rect.width, hy1 * rect.height))
        shape.finish(color=(0.85, 0.15, 0.15), fill=(1.0, 0.75, 0.0), fill_opacity=0.35, width=0.8)
        shape.commit()
    effective_dpi = min(int(dpi), 300)
    pix = page.get_pixmap(dpi=effective_dpi, clip=clip)
    png_b64 = base64.b64encode(pix.tobytes("png")).decode("ascii")
    out: dict[str, Any] = {
        "sec_page": sec_page,
        "pdf_page_1based": meta["pdf_page_1based"],
        "page_rotation": page.rotation,
        "image_base64": f"data:image/png;base64,{png_b64}",
        "width_px": pix.width,
        "height_px": pix.height,
        "dpi": effective_dpi,
        "drawing_count": len(page.get_drawings()),
        "clip_rect_pdf_points": [clip.x0, clip.y0, clip.x1, clip.y1],
    }
    if crosshair is not None:
        out["crosshair"] = crosshair
    return out


def render_table_row_composite_crop(sec_page: str, search_term: str, dpi: int = 200) -> dict:
    """Crop a dense table page: header band + highlighted target row strip."""
    page, meta = page_for(sec_page)
    hits = page.search_for(search_term)
    if not hits:
        raise ValueError(f"search term {search_term!r} not found on {sec_page} (pdf p.{meta['pdf_page_1based']})")
    hit = to_display(page, hits[0])
    page_rect = fitz.Rect(page.rect)
    header = fitz.Rect(page_rect.x0, page_rect.y0 + 24, page_rect.x1, page_rect.y0 + 92) & page_rect
    row = (fitz.Rect(page_rect.x0, hit.y0 - 3, page_rect.x1, hit.y1 + 3) & page_rect).normalize()
    if row.height <= 2 or row.width <= 2:
        raise ValueError(
            f"degenerate row band on {sec_page} (rotation={page.rotation}, "
            f"raw hit={hits[0]}, display rect={row})"
        )
    shape = page.new_shape()
    shape.draw_rect(row)
    shape.finish(color=(0.85, 0.15, 0.15), fill=(1.0, 0.75, 0.0), fill_opacity=0.35, width=0.8)
    shape.commit()
    eff = min(int(dpi), 300)

    def _b64(r: fitz.Rect) -> str:
        pix = page.get_pixmap(dpi=eff, clip=r)
        return "data:image/png;base64," + base64.b64encode(pix.tobytes("png")).decode("ascii")

    return {
        "sec_page": sec_page,
        "pdf_page_1based": meta["pdf_page_1based"],
        "page_rotation": page.rotation,
        "search_term": search_term,
        "match_count": len(hits),
        "row_bbox_pdf_points": [row.x0, row.y0, row.x1, row.y1],
        "header_image_base64": _b64(header),
        "row_image_base64": _b64(row),
        "composite_image_base64": _b64(page_rect),
        "dpi": eff,
    }
