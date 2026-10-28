"""Phase 6 tests: McCabe-Thiele stage stepping (q=1.0 and q!=1.0), Fair's Souders-Brown
tray flooding (Fig. 14-32, p. 14-37), Eckert GPDC (Fig. 14-55, p. 14-57 & Table 14-13,
p. 14-58), reflux-surge JET_FLOOD_DANGER trigger, and live-PDF citation anchors.
"""
from __future__ import annotations

from fastapi.testclient import TestClient

from main import app
from pdf.section_map import verify_page_contains
from solvers.distillation_hydraulics import solve_eckert_gpdc, solve_souders_brown_flooding
from solvers.distillation_mccabe import solve_mccabe_thiele

client = TestClient(app)


def test_perry_distillation_citation_anchors_in_live_pdf() -> None:
    assert verify_page_contains("14-37", "FIG. 14-32")
    assert verify_page_contains("14-57", "FIG. 14-55")
    assert verify_page_contains("14-58", "TABLE 14-13")


def test_mccabe_thiele_benzene_toluene_benchmark_and_non_unit_q() -> None:
    res = solve_mccabe_thiele(0.5, 0.95, 0.05, 1.0, 1.3, 2.45, 100.0)
    assert 1.1 < res["r_min"] < 1.3
    assert 10 <= res["total_stages"] <= 15
    assert abs(res["distillate_kmol_hr"] - 50.0) < 0.01

    # Partially vaporized feed q = 0.5
    res_q = solve_mccabe_thiele(0.5, 0.95, 0.05, 0.5, 1.35, 2.45, 100.0)
    assert res_q["total_stages"] >= 8
    assert len(res_q["staircase_points"]) > 10


def test_surging_reflux_ratio_triggers_jet_flood_danger() -> None:
    normal = client.post(
        "/api/v1/distillation/evaluate",
        json={"r_mult": 1.25, "column_diameter_m": 1.10, "feed_kmol_hr": 100.0},
    ).json()
    surged = client.post(
        "/api/v1/distillation/evaluate",
        json={"r_mult": 4.2, "column_diameter_m": 0.65, "feed_kmol_hr": 140.0},
    ).json()
    assert surged["mccabe_thiele"]["internal_flows_kmol_hr"]["V_rect"] > normal["mccabe_thiele"]["internal_flows_kmol_hr"]["V_rect"]
    assert surged["tray_flooding"]["percent_flood"] > 85.0
    assert surged["tray_flooding"]["hydraulic_status"] == "JET_FLOOD_DANGER"


def test_souders_brown_and_eckert_gpdc_equations() -> None:
    tray = solve_souders_brown_flooding()
    assert 0.02 < tray["c_sb_m_s"] < 0.16
    assert "Fig. 14-32" in tray["citation"]

    gpdc = solve_eckert_gpdc()
    assert gpdc["dp_mmh2o_per_m"] > 0
    assert "Fig. 14-55" in gpdc["citation"]
    assert "Table 14-13" in gpdc["table_citation"]
