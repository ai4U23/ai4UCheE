"""FastAPI PDF router: Sec-Page resolution, index search, calibrated crops,
and DeepTutor chart-reading verification (incl. the Fanning/Darcy 4x diagnostic).
"""
from __future__ import annotations

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from pdf.crop_engine import (
    compute_axis_crosshair,
    detect_vector_figures,
    render_calibrated_crop,
    render_table_row_composite_crop,
)
from pdf.section_map import resolve_pdf_page_to_sec_page, resolve_sec_page, search_index_entries

router = APIRouter(prefix="/api/v1/pdf", tags=["pdf"])


@router.get("/resolve")
def pdf_resolve(sec_page: str = Query(examples=["6-10"])) -> dict:
    try:
        return resolve_sec_page(sec_page)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.get("/reverse-resolve")
def pdf_reverse(pdf_page: int) -> dict:
    return resolve_pdf_page_to_sec_page(pdf_page)


@router.get("/search-index")
def pdf_search_index(q: str, max_results: int = 15) -> dict:
    return {"query": q, "results": search_index_entries(q, max_results)}


class CropRequest(BaseModel):
    sec_page: str
    clip_rect_norm: tuple[float, float, float, float] | None = None
    dpi: int = Field(default=220, ge=36, le=300)
    axis_calibration: dict | None = None
    point_x: float | None = None
    point_y: float | None = None
    search_term: str | None = None


@router.post("/crop")
def pdf_crop(req: CropRequest) -> dict:
    """Calibrated crop; with axis_calibration+point -> data-space crosshair baked in."""
    try:
        if req.search_term:
            return render_table_row_composite_crop(req.sec_page, req.search_term, dpi=req.dpi)
        crosshair = None
        if req.axis_calibration and req.point_x is not None and req.point_y is not None:
            crosshair = compute_axis_crosshair(req.point_x, req.point_y, req.axis_calibration)
        return render_calibrated_crop(
            req.sec_page, req.clip_rect_norm, req.dpi, crosshair=crosshair
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.get("/figures")
def pdf_figures(sec_page: str) -> dict:
    try:
        return detect_vector_figures(sec_page)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


class ChartReadingRequest(BaseModel):
    sec_page: str
    chart_label: str = Field(examples=["FIG. 6-9"])
    user_value: float
    exact_value: float
    tolerance_pct: float = 5.0
    axis_calibration: dict | None = None
    diagnostic: str | None = Field(
        default=None, examples=["fanning_darcy"], description="'fanning_darcy' enables the 4x check"
    )


@router.post("/verify-chart-reading")
def verify_chart_reading(req: ChartReadingRequest) -> dict:
    """DeepTutor-style check of a visually read chart value against the exact value.

    With ``diagnostic='fanning_darcy'``, detects the classic student error of
    reading Darcy ``f_D`` where Perry's Fig. 6-9 plots Fanning ``f_F`` (or vice
    versa): if the reading matches 4x (or 1/4x) the exact value within 15%, it
    returns a targeted coaching message instead of a plain FAIL.
    """
    if req.exact_value == 0:
        raise HTTPException(status_code=400, detail="exact_value must be non-zero")
    err_pct = abs(req.user_value - req.exact_value) / abs(req.exact_value) * 100.0
    result = {
        "sec_page": req.sec_page,
        "chart_label": req.chart_label,
        "user_value": req.user_value,
        "exact_value": req.exact_value,
        "error_pct": round(err_pct, 3),
        "tolerance_pct": req.tolerance_pct,
        "verdict": "PASS" if err_pct <= req.tolerance_pct else "FAIL",
    }
    crosshair = None
    if req.axis_calibration:
        try:
            crosshair = compute_axis_crosshair(req.user_value, 0, req.axis_calibration)
        except ValueError:
            crosshair = None
    result["crosshair"] = crosshair
    if req.diagnostic == "fanning_darcy":
        four_x = 4.0 * req.exact_value
        err_4x = abs(req.user_value - four_x) / abs(four_x) * 100.0
        result["fanning_darcy_4x_detected"] = err_4x <= 15.0 and err_pct > req.tolerance_pct
        if result["fanning_darcy_4x_detected"]:
            result["coaching"] = (
                "You likely read the Darcy friction factor f_D = 4*f_F, but Perry's "
                "Fig. 6-9 (p. 6-10) plots the FANNING friction factor f_F. Either "
                "divide your reading by 4, or use f_D = 4*f_F in the Darcy-Weisbach "
                "head-loss equation h_f = f*(L/D)*v^2/(2g) — never mix conventions."
            )
    return result
