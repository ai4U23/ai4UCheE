"""Phase 2 tests: Sec-Page resolver, crop engine, PDF router, chart-reading."""
from __future__ import annotations

from fastapi.testclient import TestClient

from core.handcalcs_katex import render_three_stage_equation  # noqa: F401 (import surface)
from main import app
from pdf.crop_engine import compute_axis_crosshair, detect_vector_figures
from pdf.section_map import build_or_load_section_offsets, resolve_sec_page, verify_page_contains

client = TestClient(app)


def test_section_offsets_all_25_sections() -> None:
    offsets = build_or_load_section_offsets()
    assert len(offsets) == 25
    assert offsets[2] == 36 and offsets[6] == 584 and offsets[14] == 1234


def test_resolve_sec_page_ground_truth() -> None:
    r6 = resolve_sec_page("6-10")
    r14 = resolve_sec_page("14-37")
    assert r6["pdf_page_1based"] == 593 and r6["verified_header"] is True
    assert r14["pdf_page_1based"] == 1270 and r14["verified_header"] is True
    assert r6["section_title"] == "Fluid and Particle Dynamics"


def test_resolve_invalid_inputs() -> None:
    import pytest

    for bad in ("garbage", "30-5", "6"):
        with pytest.raises(ValueError):
            resolve_sec_page(bad)


def test_verify_page_contains_citation_anchors() -> None:
    assert verify_page_contains("6-10", "FIG. 6-9")
    assert verify_page_contains("14-37", "FIG. 14-32")
    assert verify_page_contains("2-53", "TABLE 2-8")


def test_detect_vector_figures_fanning_chart() -> None:
    det = detect_vector_figures("6-10")
    assert det["is_vector_figure"] is True
    assert det["drawing_count"] >= 8
    assert any("FIG. 6-9" in lb["label"] for lb in det["caption_labels"])


def test_crosshair_midpoint_and_inversion() -> None:
    cal = {"x_min": 1e3, "x_max": 1e7, "x_scale": "log10",
           "y_min": 0.001, "y_max": 0.02, "y_scale": "log10"}
    mid = compute_axis_crosshair(1e5, 0.0045, cal)
    assert 45 < mid["x_pct"] < 55
    off = compute_axis_crosshair(1e5, 0.01, cal)
    assert 20 < off["y_pct"] < 26, f"y-inversion broken: {off}"


def test_router_resolve_and_search() -> None:
    res = client.get("/api/v1/pdf/resolve", params={"sec_page": "6-10"})
    assert res.status_code == 200 and res.json()["pdf_page_1based"] == 593
    assert client.get("/api/v1/pdf/resolve", params={"sec_page": "bad"}).status_code == 400
    idx = client.get("/api/v1/pdf/search-index", params={"q": "distillation", "max_results": 3})
    assert idx.status_code == 200 and len(idx.json()["results"]) >= 1


def test_router_crop_returns_png() -> None:
    res = client.post("/api/v1/pdf/crop", json={"sec_page": "6-10", "dpi": 120})
    assert res.status_code == 200
    assert res.json()["image_base64"].startswith("data:image/png;base64,")


def test_router_crop_row_composite() -> None:
    res = client.post(
        "/api/v1/pdf/crop",
        json={"sec_page": "2-53", "search_term": "Benzene", "dpi": 120},
    )
    assert res.status_code == 200
    body = res.json()
    assert body["match_count"] >= 1 and body["row_image_base64"].startswith("data:image/png;base64,")


def test_rotated_page_row_crop_and_figures() -> None:
    """Regression: Sec 2 landscape pages carry rotation=90; search/get_drawings
    return unrotated rects — bands must land in display space (kongming counsel)."""
    import base64 as b64

    body = client.post(
        "/api/v1/pdf/crop", json={"sec_page": "2-53", "search_term": "Benzene", "dpi": 100}
    ).json()
    assert body["page_rotation"] == 90
    row_png = b64.b64decode(body["row_image_base64"].split(",", 1)[1])
    assert len(row_png) > 1000

    det = detect_vector_figures("2-53")
    assert det["page_rotation"] == 90 and det["drawing_count"] >= 8
    import pymupdf as fitz

    page_rect = fitz.Rect(0, 0, 783, 612)  # display rect of pdf p.88
    for region in det["figure_regions"]:
        r = fitz.Rect(region[0], region[1], region[2], region[3])
        assert r.y1 <= page_rect.y1 + 1 and r.x1 <= page_rect.x1 + 1, region


def test_chart_reading_pass_and_4x_diagnostic() -> None:
    ok = client.post("/api/v1/pdf/verify-chart-reading", json={
        "sec_page": "6-10", "chart_label": "FIG. 6-9",
        "user_value": 0.0048, "exact_value": 0.0050, "diagnostic": "fanning_darcy"})
    assert ok.status_code == 200 and ok.json()["verdict"] == "PASS"

    misread = client.post("/api/v1/pdf/verify-chart-reading", json={
        "sec_page": "6-10", "chart_label": "FIG. 6-9",
        "user_value": 0.020, "exact_value": 0.0050, "diagnostic": "fanning_darcy"})
    body = misread.json()
    assert body["verdict"] == "FAIL"
    assert body["fanning_darcy_4x_detected"] is True
    coaching = body["coaching"].lower()
    assert "fanning" in coaching and "4" in coaching


def test_chart_reading_plain_fail_without_diagnostic() -> None:
    res = client.post("/api/v1/pdf/verify-chart-reading", json={
        "sec_page": "6-10", "chart_label": "FIG. 6-9",
        "user_value": 0.02, "exact_value": 0.005})
    body = res.json()
    assert body["verdict"] == "FAIL" and "fanning_darcy_4x_detected" not in body
