"""Phase 1 core tests: health, unit guardrails, 3-stage handcalcs rendering."""
from __future__ import annotations

import math

from fastapi.testclient import TestClient

import pytest

from core.handcalcs_katex import render_three_stage_equation
from core.unit_registry import convert_field_unit, normalize_pressure_to_pa
from main import PDF_PATH, app

client = TestClient(app)


def test_health_ok() -> None:
    res = client.get("/health")
    assert res.status_code == 200
    body = res.json()
    assert body["status"] == "ok"
    assert body["pdf_pages"] == 2274
    assert body["pdf_exists"] is True


def test_pdf_path_is_the_real_handbook() -> None:
    import os

    assert os.path.exists(PDF_PATH)
    assert os.path.basename(PDF_PATH).endswith("9th Edition.pdf")


def test_psig_to_psia_datum_conversion() -> None:
    r = normalize_pressure_to_pa(0.0, "psig")
    assert r["is_gauge_converted"] is True
    assert abs(r["value_pa"] - 101325.0) < 15.0
    assert abs(r["value_psia"] - 14.6959) < 1e-6


def test_bare_psi_rejected() -> None:
    with pytest.raises(ValueError, match="Ambiguous pressure unit"):
        normalize_pressure_to_pa(30.0, "psi")
    res = client.post("/api/v1/units/normalize-pressure", params={"value": 30.0, "unit": "psi"})
    assert res.status_code == 400


def test_absolute_pressure_units() -> None:
    r = normalize_pressure_to_pa(2.0, "bar")
    assert abs(r["value_pa"] - 200_000.0) < 1.0
    assert r["is_gauge_converted"] is False


def test_convert_field_unit_gpm() -> None:
    r = convert_field_unit(100.0, "gpm", "m^3/s")
    assert abs(r["output_value"] - 0.00630902) < 1e-7


def test_convert_field_unit_psig_to_kpa() -> None:
    r = convert_field_unit(0.0, "psig", "kPa")
    assert r["is_gauge_converted"] is True
    assert abs(r["output_value"] - 101.325) < 0.1


def test_render_three_stage_reynolds() -> None:
    env = {
        "rho": (998.2, r"\mathrm{kg/m^3}", r"\rho"),
        "v": (2.0, r"\mathrm{m/s}", "v"),
        "D": (0.1, r"\mathrm{m}", "D"),
        "mu": (0.001, r"\mathrm{Pa \cdot s}", r"\mu"),
    }
    step = render_three_stage_equation(
        "Re", "(rho * v * D) / mu", env, 199640.0, "dimensionless",
        "[Perry's 9th Ed., Fig. 6-9 caption, p. 6-10]",
    )
    assert r"\frac" in step.symbolic_latex
    assert "998.2" in step.substituted_latex
    assert "998.2\\;\\mathrm{kg/m^3}" in step.substituted_latex
    assert "1.996 \\times 10^{5}" in step.result_latex
    assert step.citation.startswith("[Perry's 9th Ed.,")
    assert r"\begin{aligned}" in step.full_aligned_katex
    assert "p. 6-10]" in step.full_aligned_katex


def test_render_rejects_missing_citation() -> None:
    with pytest.raises(ValueError, match="cite Perry's 9th Ed"):
        render_three_stage_equation(
            "Re", "(rho * v * D) / mu",
            {"rho": (1.0, "", r"\rho"), "v": (1.0, "", "v"), "D": (1.0, "", "D"),
             "mu": (1.0, "", r"\mu")},
            1.0, "dimensionless", "some blog",
        )


def test_render_rejects_unknown_variable() -> None:
    with pytest.raises(ValueError, match="missing from environment"):
        render_three_stage_equation(
            "x", "a + b", {"a": (1.0, "", "a")}, 2.0, "dimensionless",
            "[Perry's 9th Ed., Eq. 1-1, p. 1-1]",
        )


def test_scientific_notation_formatting() -> None:
    from core.handcalcs_katex import fmt_num

    assert fmt_num(0.001) == r"1.000 \times 10^{-3}"
    assert fmt_num(998.2) == "998.2"
    assert math.isfinite(1.0)
