"""Phase 4 tests: DIPPR correlations (Eq 101, 106 w/ C5, 105), out-of-range warnings,
Carlson property package decision tree (LLE Wilson trap + NRTL-HOC), and PDF citations.
"""
from __future__ import annotations

from fastapi.testclient import TestClient

from main import app
from pdf.section_map import verify_page_contains
from solvers.carlson_tree import advise_carlson_method
from solvers.thermo_dippr import evaluate_all_dippr_properties

client = TestClient(app)


def test_perry_sec2_citation_anchors_in_live_pdf() -> None:
    """Verify the Table 2-8, Table 2-69, and Table 2-32 anchors exist on their cited pages."""
    assert verify_page_contains("2-53", "TABLE 2-8")
    assert verify_page_contains("2-120", "TABLE 2-69")
    assert verify_page_contains("2-93", "TABLE 2-32")


def test_water_nbp_dippr_properties() -> None:
    res = evaluate_all_dippr_properties("water", 373.15, "K")
    assert abs(res["vapor_pressure_pa"] - 101325.0) < 600.0
    assert abs(res["hvap_j_kmol"] - 4.065e7) < 5e5
    assert res["range_warning"] is False
    assert len(res["equations"]) == 3
    assert "Table 2-8" in res["equations"][0]["citation"]
    assert "Table 2-69" in res["equations"][1]["citation"]


def test_out_of_range_temperature_warning_and_supercritical_guard() -> None:
    res = evaluate_all_dippr_properties("water", 700.0, "K")
    assert res["range_warning"] is True
    assert res["vapor_pressure_pa"] > 0


def test_carlson_lle_warns_against_wilson() -> None:
    rec = advise_carlson_method(
        polarity="polar_non_electrolyte",
        pressure_bar=1.0,
        has_liquid_liquid_split=True,
    )
    assert "NRTL" in rec["recommended_package"] or "UNIQUAC" in rec["recommended_package"]
    assert any("Wilson" in w for w in rec["warnings"])
    assert "p. 4-18" in rec["citation"]


def test_carlson_carboxylic_acid_recommends_nrtl_hoc() -> None:
    rec = advise_carlson_method(
        polarity="polar_non_electrolyte",
        pressure_bar=1.0,
        has_vapor_association=True,
    )
    assert "NRTL-HOC" in rec["recommended_package"]
    assert any("dimerize" in w.lower() for w in rec["warnings"])


def test_thermo_router_endpoints() -> None:
    r1 = client.post(
        "/api/v1/thermo/dippr",
        json={"compound": "benzene", "temperature": 80.1, "temperature_unit": "degC"},
    )
    assert r1.status_code == 200
    body = r1.json()
    assert 95000 < body["vapor_pressure_pa"] < 108000

    r2 = client.post(
        "/api/v1/thermo/carlson-advisor",
        json={"polarity": "polar_non_electrolyte", "has_liquid_liquid_split": True},
    )
    assert r2.status_code == 200
    assert any("Wilson" in w for w in r2.json()["warnings"])
